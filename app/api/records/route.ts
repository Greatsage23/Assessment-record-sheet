import { and, asc, eq, like } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { appMeta, records, subjectPasswords } from "../../../db/schema";

type RecordInput = {
  id?: number;
  studentCode?: string;
  name?: string;
  className?: string;
  subject?: string;
  term?: string;
  classScore?: number;
  examScore?: number;
  subjectPassword?: string;
};

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validScore(value: unknown, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max;
}

function validate(input: RecordInput) {
  if (!input.studentCode?.trim() || !input.name?.trim() || !input.className?.trim() || !input.subject?.trim() || !input.term?.trim()) return "All student and assessment fields are required.";
  if (!validScore(input.classScore, 30)) return "Class score must be between 0 and 30.";
  if (!validScore(input.examScore, 70)) return "Exam score must be between 0 and 70.";
  return null;
}

function values(input: RecordInput) {
  return {
    studentCode: input.studentCode!.trim(),
    name: input.name!.trim(),
    className: input.className!.trim(),
    subject: input.subject!.trim(),
    term: input.term!.trim(),
    classScore: input.classScore!,
    examScore: input.examScore!,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const url = new URL(request.url);
    const className = url.searchParams.get("className") ?? "Basic 8 Red";
    const gradeLevel = url.searchParams.get("gradeLevel");
    const subject = url.searchParams.get("subject") ?? "Mathematics";
    const term = url.searchParams.get("term") ?? "Term 1";
    const allSubjects = url.searchParams.get("allSubjects") === "true";
    const db = await getDb();
    const students = await db.select().from(records).where(
      gradeLevel
        ? allSubjects
          ? and(like(records.className, `${gradeLevel} %`), eq(records.term, term))
          : and(like(records.className, `${gradeLevel} %`), eq(records.subject, subject), eq(records.term, term))
        : allSubjects
          ? and(eq(records.className, className), eq(records.term, term))
          : and(eq(records.className, className), eq(records.subject, subject), eq(records.term, term))
    ).orderBy(asc(records.name));
    return Response.json({ students });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load records." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const payload = await request.json() as RecordInput & { seed?: RecordInput[]; password?: string };
    const db = await getDb();
    if (payload.seed) {
      const [seedState] = await db.select().from(appMeta).where(eq(appMeta.key, "sample_data_seeded")).limit(1);
      if (seedState) return Response.json({ ok: true, seeded: false });
      for (const item of payload.seed) {
        const error = validate(item);
        if (!error) await db.insert(records).values(values(item)).onConflictDoNothing();
      }
      await db.insert(appMeta).values({ key: "sample_data_seeded", value: new Date().toISOString() }).onConflictDoNothing();
      return Response.json({ ok: true, seeded: true }, { status: 201 });
    }
    if (payload.password !== "administrator") return Response.json({ error: "Student names can only be added through Student List by the administrator." }, { status: 403 });
    const error = validate(payload);
    if (error) return Response.json({ error }, { status: 400 });
    const [student] = await db.insert(records).values(values(payload)).returning();
    return Response.json({ student }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("UNIQUE") ? "That student ID already exists for this assessment." : error instanceof Error ? error.message : "Unable to save record.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDatabase();
    const payload = await request.json() as RecordInput;
    if (!payload.id) return Response.json({ error: "Record ID is required." }, { status: 400 });
    if (!validScore(payload.classScore, 30) || !validScore(payload.examScore, 70)) return Response.json({ error: "Scores are outside the allowed range." }, { status: 400 });
    const db = await getDb();
    const [existing] = await db.select().from(records).where(eq(records.id, payload.id)).limit(1);
    if (!existing) return Response.json({ error: "Student record was not found." }, { status: 404 });
    const [setting] = await db.select().from(appMeta).where(eq(appMeta.key, "subject_authentication")).limit(1);
    if (setting?.value === "on") {
      const [access] = await db.select().from(subjectPasswords).where(and(
        eq(subjectPasswords.className, existing.className),
        eq(subjectPasswords.subject, existing.subject),
      )).limit(1);
      if (!access || !payload.subjectPassword || access.passwordHash !== await hashPassword(payload.subjectPassword)) {
        return Response.json({ error: "The subject password is incorrect or has not been configured." }, { status: 401 });
      }
    }
    const [student] = await db.update(records).set({
      classScore: payload.classScore!, examScore: payload.examScore!, updatedAt: new Date().toISOString(),
    }).where(eq(records.id, payload.id)).returning();
    return Response.json({ student });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update record." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDatabase();
    const url = new URL(request.url);
    if (url.searchParams.get("password") !== "administrator") return Response.json({ error: "Only the administrator can remove students." }, { status: 401 });
    const id = Number(url.searchParams.get("id"));
    if (!Number.isInteger(id)) return Response.json({ error: "Valid record ID is required." }, { status: 400 });
    const db = await getDb();
    await db.delete(records).where(eq(records.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete record." }, { status: 500 });
  }
}
