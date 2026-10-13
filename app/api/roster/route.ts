import { and, asc, eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { attendance, continuousAssessments, records, studentRoster } from "../../../db/schema";
import { OFFICIAL_ROSTER } from "../../official-roster";

const ADMIN_PASSWORD = "administrator";
const HEADTEACHER_PASSWORD = process.env.HEADTEACHER_PASSWORD || "head";
const SUBJECTS = [
  "English Language", "Mathematics", "Science", "Social Studies", "Computing",
  "Religious and Moral Education", "Creative Arts and Design", "Career Technology",
  "Ghanaian Language", "French",
] as const;
const TERMS = ["Term 1", "Term 2", "Term 3"] as const;

type RosterInput = { id?: number; studentCode?: string; name?: string; className?: string };

function isAdministrator(payload: { password?: string }) {
  return payload.password === ADMIN_PASSWORD || payload.password === HEADTEACHER_PASSWORD;
}

function cleanStudent(input: RosterInput) {
  return {
    name: input.name?.trim() ?? "",
    className: input.className?.trim() ?? "",
  };
}

async function createSubjectRecords(students: { studentCode: string; name: string; className: string }[]) {
  if (!students.length) return;
  const db = await getDb();
  const updatedAt = new Date().toISOString();
  const subjectRecords = students.flatMap((student) =>
    TERMS.flatMap((term) => SUBJECTS.map((subject) => ({
      ...student,
      subject,
      term,
      classScore: 0,
      examScore: 0,
      updatedAt,
    }))),
  );
  for (let index = 0; index < subjectRecords.length; index += 500) {
    await db.insert(records).values(subjectRecords.slice(index, index + 500)).onConflictDoNothing();
  }
}

export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const url = new URL(request.url);
    const className = url.searchParams.get("className") ?? "Basic 8 Red";
    const db = await getDb();
    const roster = await db.select().from(studentRoster).where(eq(studentRoster.className, className)).orderBy(asc(studentRoster.studentCode));
    await createSubjectRecords(roster.map(({ studentCode, name, className: studentClass }) => ({
      studentCode,
      name,
      className: studentClass,
    })));
    return Response.json({ roster });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load the student roster." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const payload = await request.json() as { password?: string; action?: string; students?: RosterInput[] };
    if (!isAdministrator(payload)) return Response.json({ error: "Incorrect management password." }, { status: 401 });
    const db = await getDb();

    if (payload.action === "installOfficialRoster") {
      const officialStudents = Object.entries(OFFICIAL_ROSTER).flatMap(([className, names]) => names.map((name, index) => ({
        studentCode: String(index + 1).padStart(3, "0"), name, className,
      })));
      const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleUpperCase();
      const existingRoster = await db.select().from(studentRoster);
      const existingRecords = await db.select().from(records);
      const existingAttendance = await db.select().from(attendance);
      const oldStudentNames = new Map(existingRoster.map((student) => [`${student.className}::${student.studentCode}`, student.name]));
      const newStudentsByName = new Map(officialStudents.map((student) => [normalizeName(student.name), student]));
      const migratedRecords = existingRecords.flatMap((record) => {
        const student = newStudentsByName.get(normalizeName(record.name));
        return student ? [{ ...student, subject: record.subject, term: record.term, classScore: record.classScore, examScore: record.examScore, updatedAt: new Date().toISOString() }] : [];
      });
      const migratedAttendance = existingAttendance.flatMap((entry) => {
        const oldName = oldStudentNames.get(`${entry.className}::${entry.studentCode}`);
        const student = oldName ? newStudentsByName.get(normalizeName(oldName)) : undefined;
        return student ? [{ studentCode: student.studentCode, className: student.className, attendanceDate: entry.attendanceDate, status: entry.status, updatedAt: new Date().toISOString() }] : [];
      });
      await db.delete(attendance);
      await db.delete(records);
      await db.delete(studentRoster);
      await db.insert(studentRoster).values(officialStudents.map((student) => ({ ...student, updatedAt: new Date().toISOString() })));
      for (let index = 0; index < migratedRecords.length; index += 500) {
        await db.insert(records).values(migratedRecords.slice(index, index + 500)).onConflictDoNothing();
      }
      for (let index = 0; index < migratedAttendance.length; index += 500) {
        await db.insert(attendance).values(migratedAttendance.slice(index, index + 500)).onConflictDoNothing();
      }
      await createSubjectRecords(officialStudents);
      return Response.json({
        ok: true,
        installed: officialStudents.length,
        preservedAssessmentRecords: migratedRecords.length,
        preservedAttendanceRecords: migratedAttendance.length,
        classes: Object.fromEntries(Object.entries(OFFICIAL_ROSTER).map(([className, names]) => [className, names.length])),
      });
    }

    const students = payload.students ?? [];
    if (!students.length) return Response.json({ error: "Add at least one student." }, { status: 400 });
    let added = 0;
    const addedStudents: { studentCode: string; name: string; className: string }[] = [];
    const nextNumbers = new Map<string, number>();
    for (const input of students) {
      const cleaned = cleanStudent(input);
      if (!cleaned.name || !cleaned.className) continue;
      if (!nextNumbers.has(cleaned.className)) {
        const existing = await db.select({ studentCode: studentRoster.studentCode }).from(studentRoster).where(eq(studentRoster.className, cleaned.className));
        const highest = existing.reduce((maximum, item) => {
          const number = Number.parseInt(item.studentCode, 10);
          return Number.isFinite(number) ? Math.max(maximum, number) : maximum;
        }, 0);
        nextNumbers.set(cleaned.className, highest + 1);
      }
      const nextNumber = nextNumbers.get(cleaned.className)!;
      const student = { ...cleaned, studentCode: String(nextNumber).padStart(3, "0") };
      nextNumbers.set(cleaned.className, nextNumber + 1);
      const inserted = await db.insert(studentRoster).values({
        ...student, updatedAt: new Date().toISOString(),
      }).onConflictDoNothing().returning();
      if (inserted.length) {
        added += 1;
        addedStudents.push(student);
      }
    }
    await createSubjectRecords(addedStudents);
    return Response.json({ ok: true, added }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update the roster." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDatabase();
    const payload = await request.json() as { password?: string; id?: number };
    if (!isAdministrator(payload)) return Response.json({ error: "Incorrect management password." }, { status: 401 });
    if (!payload.id) return Response.json({ error: "Student record is required." }, { status: 400 });
    const db = await getDb();
    const [student] = await db.select().from(studentRoster).where(eq(studentRoster.id, payload.id)).limit(1);
    if (!student) return Response.json({ error: "Student was not found." }, { status: 404 });
    await db.delete(studentRoster).where(eq(studentRoster.id, student.id));
    await db.delete(records).where(and(eq(records.studentCode, student.studentCode), eq(records.className, student.className)));
    await db.delete(continuousAssessments).where(and(eq(continuousAssessments.studentCode, student.studentCode), eq(continuousAssessments.className, student.className)));
    await db.delete(attendance).where(and(eq(attendance.studentCode, student.studentCode), eq(attendance.className, student.className)));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to remove the student." }, { status: 500 });
  }
}
