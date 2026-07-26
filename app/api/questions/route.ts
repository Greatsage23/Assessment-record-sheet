import { and, asc, eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { appMeta, questionBank, subjectPasswords, subjectTeachers } from "../../../db/schema";

const VALID_CLASSES = new Set(["Basic 7 Red", "Basic 7 Blue", "Basic 8 Red", "Basic 8 Blue", "Basic 9 Red", "Basic 9 Blue"]);
const VALID_SUBJECTS = new Set(["English Language", "Mathematics", "Science", "Social Studies", "Computing", "Religious and Moral Education", "Creative Arts and Design", "Career Technology", "Ghanaian Language", "French"]);
const VALID_TERMS = new Set(["Term 1", "Term 2", "Term 3"]);
const VALID_TYPES = new Set(["Objective", "Short Answer", "Essay"]);
const VALID_DIFFICULTIES = new Set(["Easy", "Moderate", "Challenging"]);

async function hashPassword(password: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function requireSubjectAccess(className: string, subject: string, password?: string) {
  const db = await getDb();
  const [setting] = await db.select().from(appMeta).where(eq(appMeta.key, "subject_authentication")).limit(1);
  if (setting?.value !== "on") return;
  if (!password?.trim()) throw new Error("SUBJECT_PASSWORD_REQUIRED");
  const [access] = await db.select().from(subjectPasswords).where(and(eq(subjectPasswords.className, className), eq(subjectPasswords.subject, subject))).limit(1);
  if (!access || access.passwordHash !== await hashPassword(password.trim())) throw new Error("SUBJECT_PASSWORD_INVALID");
}

export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const url = new URL(request.url);
    const className = url.searchParams.get("className")?.trim();
    const subject = url.searchParams.get("subject")?.trim();
    const term = url.searchParams.get("term")?.trim();
    const db = await getDb();
    const filters = [];
    if (className) filters.push(eq(questionBank.className, className));
    if (subject) filters.push(eq(questionBank.subject, subject));
    if (term) filters.push(eq(questionBank.term, term));
    const questions = filters.length
      ? await db.select().from(questionBank).where(and(...filters)).orderBy(asc(questionBank.topic), asc(questionBank.id))
      : await db.select().from(questionBank).orderBy(asc(questionBank.className), asc(questionBank.subject), asc(questionBank.topic));
    return Response.json({ questions: questions.map((question) => ({ ...question, options: JSON.parse(question.options || "[]") })) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load the question bank." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const payload = await request.json() as {
      action?: "create" | "delete";
      id?: number;
      className?: string;
      subject?: string;
      term?: string;
      topic?: string;
      questionType?: string;
      difficulty?: string;
      questionText?: string;
      options?: string[];
      answer?: string;
      marks?: number;
      subjectPassword?: string;
    };
    const className = payload.className?.trim() ?? "";
    const subject = payload.subject?.trim() ?? "";
    if (!VALID_CLASSES.has(className) || !VALID_SUBJECTS.has(subject)) return Response.json({ error: "Select a valid class and subject." }, { status: 400 });
    await requireSubjectAccess(className, subject, payload.subjectPassword);
    const db = await getDb();

    if (payload.action === "delete") {
      if (!Number.isInteger(payload.id)) return Response.json({ error: "Select a valid question." }, { status: 400 });
      await db.delete(questionBank).where(and(eq(questionBank.id, payload.id!), eq(questionBank.className, className), eq(questionBank.subject, subject)));
      return Response.json({ ok: true });
    }

    const term = payload.term?.trim() ?? "";
    const topic = payload.topic?.trim() ?? "";
    const questionType = payload.questionType?.trim() ?? "";
    const difficulty = payload.difficulty?.trim() ?? "";
    const questionText = payload.questionText?.trim() ?? "";
    const answer = payload.answer?.trim() ?? "";
    const marks = Math.max(1, Math.min(100, Number(payload.marks) || 1));
    const options = (payload.options ?? []).map((option) => option.trim()).filter(Boolean).slice(0, 8);
    if (!VALID_TERMS.has(term) || !VALID_TYPES.has(questionType) || !VALID_DIFFICULTIES.has(difficulty) || !topic || !questionText || !answer) return Response.json({ error: "Complete all required question fields." }, { status: 400 });
    if (questionType === "Objective" && options.length < 2) return Response.json({ error: "Objective questions require at least two answer options." }, { status: 400 });
    const [teacher] = await db.select().from(subjectTeachers).where(and(eq(subjectTeachers.className, className), eq(subjectTeachers.subject, subject))).limit(1);
    const [question] = await db.insert(questionBank).values({ className, subject, term, topic, questionType, difficulty, questionText, options: JSON.stringify(options), answer, marks, createdBy: teacher?.teacherName || "Subject teacher" }).returning();
    return Response.json({ question: { ...question, options } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to manage the question bank.";
    if (message === "SUBJECT_PASSWORD_REQUIRED") return Response.json({ error: "Enter the subject-teacher password to continue.", passwordRequired: true }, { status: 401 });
    if (message === "SUBJECT_PASSWORD_INVALID") return Response.json({ error: "Incorrect subject-teacher password.", passwordRequired: true }, { status: 401 });
    return Response.json({ error: message }, { status: 500 });
  }
}
