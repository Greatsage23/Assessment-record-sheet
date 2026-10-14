import { and, asc, eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { appMeta, examAssessments, records, studentRoster, subjectPasswords } from "../../../db/schema";

type ExamRow = { studentCode: string; rawScore: number };

async function hashPassword(password: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function authorised(db: Awaited<ReturnType<typeof getDb>>, className: string, subject: string, password?: string) {
  const [setting] = await db.select().from(appMeta).where(eq(appMeta.key, "subject_authentication")).limit(1);
  if (setting?.value !== "on") return true;
  const [access] = await db.select().from(subjectPasswords).where(and(eq(subjectPasswords.className, className), eq(subjectPasswords.subject, subject))).limit(1);
  return Boolean(access && password && access.passwordHash === await hashPassword(password));
}

function validScore(value: unknown) {
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100 ? score : null;
}

export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const url = new URL(request.url);
    const className = url.searchParams.get("className")?.trim();
    const subject = url.searchParams.get("subject")?.trim();
    const term = url.searchParams.get("term")?.trim();
    const academicYear = url.searchParams.get("academicYear")?.trim();
    if (!className || !subject || !term || !academicYear) return Response.json({ error: "Class, subject, term and academic year are required." }, { status: 400 });
    const db = await getDb();
    const [roster, exams] = await Promise.all([
      db.select().from(studentRoster).where(eq(studentRoster.className, className)).orderBy(asc(studentRoster.name)),
      db.select().from(examAssessments).where(and(eq(examAssessments.className, className), eq(examAssessments.subject, subject), eq(examAssessments.term, term), eq(examAssessments.academicYear, academicYear))),
    ]);
    const byStudent = new Map(exams.map((item) => [item.studentCode, item.rawScore]));
    return Response.json({ students: roster.map((student) => ({ studentCode: student.studentCode, name: student.name, rawScore: byStudent.get(student.studentCode) ?? 0 })) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load examination scores." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { action?: "save" | "migrate"; className?: string; subject?: string; term?: string; academicYear?: string; subjectPassword?: string; rows?: ExamRow[] };
    const className = payload.className?.trim();
    const subject = payload.subject?.trim();
    const term = payload.term?.trim();
    const academicYear = payload.academicYear?.trim();
    if (!className || !subject || !term || !academicYear || !payload.rows?.length) return Response.json({ error: "Complete the examination details and student scores." }, { status: 400 });
    await ensureDatabase();
    const db = await getDb();
    if (!await authorised(db, className, subject, payload.subjectPassword)) return Response.json({ error: "Enter the correct subject password before saving or migrating scores." }, { status: 401 });
    const roster = await db.select().from(studentRoster).where(eq(studentRoster.className, className));
    const names = new Map(roster.map((student) => [student.studentCode, student.name]));
    for (const row of payload.rows) {
      const rawScore = validScore(row.rawScore);
      const name = names.get(row.studentCode);
      if (rawScore === null || !name) continue;
      await db.insert(examAssessments).values({ studentCode: row.studentCode, className, subject, term, academicYear, rawScore, updatedAt: new Date().toISOString() }).onConflictDoUpdate({
        target: [examAssessments.studentCode, examAssessments.className, examAssessments.subject, examAssessments.term, examAssessments.academicYear],
        set: { rawScore, updatedAt: new Date().toISOString() },
      });
      if (payload.action === "migrate") {
        const examScore = Math.round(rawScore / 100 * 70);
        await db.insert(records).values({ studentCode: row.studentCode, name, className, subject, term, academicYear, classScore: 0, examScore, updatedAt: new Date().toISOString() }).onConflictDoUpdate({
          target: [records.studentCode, records.className, records.subject, records.term, records.academicYear],
          set: { name, examScore, updatedAt: new Date().toISOString() },
        });
      }
    }
    return Response.json({ ok: true, migrated: payload.action === "migrate" });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save examination scores." }, { status: 500 });
  }
}
