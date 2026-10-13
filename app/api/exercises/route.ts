import { and, asc, eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { appMeta, continuousAssessments, records, studentRoster, subjectPasswords } from "../../../db/schema";

type AssessmentRow = { studentCode: string; scores: number[] };

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

function cleanScores(scores: unknown) {
  if (!Array.isArray(scores) || scores.length !== 12) return null;
  const values = scores.map(Number);
  return values.every((score) => Number.isFinite(score) && score >= 0 && score <= 10) ? values : null;
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
    const [roster, assessments] = await Promise.all([
      db.select().from(studentRoster).where(eq(studentRoster.className, className)).orderBy(asc(studentRoster.name)),
      db.select().from(continuousAssessments).where(and(eq(continuousAssessments.className, className), eq(continuousAssessments.subject, subject), eq(continuousAssessments.term, term), eq(continuousAssessments.academicYear, academicYear))),
    ]);
    const byStudent = new Map(assessments.map((item) => [item.studentCode, item]));
    return Response.json({ students: roster.map((student) => {
      const item = byStudent.get(student.studentCode);
      let scores = Array(12).fill(0) as number[];
      try { if (item) scores = cleanScores(JSON.parse(item.scores)) ?? scores; } catch { /* retain zero scores */ }
      return { studentCode: student.studentCode, name: student.name, scores };
    }) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load continuous assessment." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { action?: "save" | "migrate"; className?: string; subject?: string; term?: string; academicYear?: string; subjectPassword?: string; rows?: AssessmentRow[] };
    const className = payload.className?.trim();
    const subject = payload.subject?.trim();
    const term = payload.term?.trim();
    const academicYear = payload.academicYear?.trim();
    if (!className || !subject || !term || !academicYear || !payload.rows?.length) return Response.json({ error: "Complete the assessment details and student scores." }, { status: 400 });
    await ensureDatabase();
    const db = await getDb();
    if (!await authorised(db, className, subject, payload.subjectPassword)) return Response.json({ error: "Enter the correct subject password before saving or migrating scores." }, { status: 401 });
    const roster = await db.select().from(studentRoster).where(eq(studentRoster.className, className));
    const names = new Map(roster.map((student) => [student.studentCode, student.name]));
    for (const row of payload.rows) {
      const scores = cleanScores(row.scores);
      const name = names.get(row.studentCode);
      if (!scores || !name) continue;
      await db.insert(continuousAssessments).values({ studentCode: row.studentCode, className, subject, term, academicYear, scores: JSON.stringify(scores), updatedAt: new Date().toISOString() }).onConflictDoUpdate({
        target: [continuousAssessments.studentCode, continuousAssessments.className, continuousAssessments.subject, continuousAssessments.term, continuousAssessments.academicYear],
        set: { scores: JSON.stringify(scores), updatedAt: new Date().toISOString() },
      });
      if (payload.action === "migrate") {
        const classScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / 120 * 30);
        await db.insert(records).values({ studentCode: row.studentCode, name, className, subject, term, academicYear, classScore, examScore: 0, updatedAt: new Date().toISOString() }).onConflictDoUpdate({
          target: [records.studentCode, records.className, records.subject, records.term, records.academicYear],
          set: { name, classScore, updatedAt: new Date().toISOString() },
        });
      }
    }
    return Response.json({ ok: true, migrated: payload.action === "migrate" });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save continuous assessment." }, { status: 500 });
  }
}
