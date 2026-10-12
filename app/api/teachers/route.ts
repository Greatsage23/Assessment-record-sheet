import { and, asc, eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { appMeta, subjectTeachers } from "../../../db/schema";
import { DEFAULT_SCHOOL_TEACHERS } from "../../school-teachers";

const ADMIN_PASSWORD = "administrator";
const HEADTEACHER_PASSWORD = process.env.HEADTEACHER_PASSWORD || "head";
const TEACHER_DIRECTORY_KEY = "school_teacher_directory";

async function readTeacherDirectory(db: Awaited<ReturnType<typeof getDb>>) {
  const [saved] = await db.select().from(appMeta).where(eq(appMeta.key, TEACHER_DIRECTORY_KEY)).limit(1);
  if (!saved) {
    const teachers = [...DEFAULT_SCHOOL_TEACHERS];
    await db.insert(appMeta).values({ key: TEACHER_DIRECTORY_KEY, value: JSON.stringify(teachers) }).onConflictDoNothing();
    return teachers;
  }
  try {
    const teachers = JSON.parse(saved.value);
    return Array.isArray(teachers) ? teachers.filter((name): name is string => typeof name === "string" && Boolean(name.trim())) : [...DEFAULT_SCHOOL_TEACHERS];
  } catch {
    return [...DEFAULT_SCHOOL_TEACHERS];
  }
}

async function saveTeacherDirectory(db: Awaited<ReturnType<typeof getDb>>, teachers: string[]) {
  await db.insert(appMeta).values({ key: TEACHER_DIRECTORY_KEY, value: JSON.stringify(teachers) }).onConflictDoUpdate({
    target: appMeta.key,
    set: { value: JSON.stringify(teachers) },
  });
}

export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const url = new URL(request.url);
    const className = url.searchParams.get("className")?.trim();
    const subject = url.searchParams.get("subject")?.trim();
    if (!className || !subject) return Response.json({ error: "Class and subject are required." }, { status: 400 });
    const db = await getDb();
    const [assignment] = await db.select().from(subjectTeachers).where(and(
      eq(subjectTeachers.className, className),
      eq(subjectTeachers.subject, subject),
    )).limit(1);
    return Response.json({ teacherName: assignment?.teacherName ?? "" });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load the subject teacher." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const payload = await request.json() as {
      action?: "list" | "set" | "directory" | "add-teacher" | "remove-teacher";
      adminPassword?: string;
      className?: string;
      subject?: string;
      teacherName?: string;
    };
    if (payload.adminPassword !== ADMIN_PASSWORD && payload.adminPassword !== HEADTEACHER_PASSWORD) return Response.json({ error: "Incorrect management password." }, { status: 401 });
    const db = await getDb();

    if (payload.action === "directory") {
      return Response.json({ teachers: await readTeacherDirectory(db) });
    }

    if (payload.action === "add-teacher") {
      const teacherName = payload.teacherName?.trim().replace(/\s+/g, " ").toUpperCase();
      if (!teacherName) return Response.json({ error: "Enter the teacher's full name." }, { status: 400 });
      const teachers = await readTeacherDirectory(db);
      if (teachers.some((name) => name.toLocaleUpperCase() === teacherName)) {
        return Response.json({ error: "This teacher is already in the dropdown." }, { status: 409 });
      }
      const updated = [...teachers, teacherName];
      await saveTeacherDirectory(db, updated);
      return Response.json({ ok: true, teachers: updated });
    }

    if (payload.action === "remove-teacher") {
      const teacherName = payload.teacherName?.trim();
      if (!teacherName) return Response.json({ error: "Choose a teacher to remove." }, { status: 400 });
      const teachers = await readTeacherDirectory(db);
      const updated = teachers.filter((name) => name.toLocaleUpperCase() !== teacherName.toLocaleUpperCase());
      if (updated.length === teachers.length) return Response.json({ error: "Teacher not found in the dropdown." }, { status: 404 });
      await saveTeacherDirectory(db, updated);
      return Response.json({ ok: true, teachers: updated });
    }

    if (payload.action === "list") {
      const assignments = await db.select().from(subjectTeachers).orderBy(
        asc(subjectTeachers.className),
        asc(subjectTeachers.subject),
      );
      return Response.json({ assignments });
    }

    if (payload.action === "set") {
      const className = payload.className?.trim();
      const subject = payload.subject?.trim();
      const teacherName = payload.teacherName?.trim();
      if (!className || !subject || !teacherName) return Response.json({ error: "Class, subject and teacher name are required." }, { status: 400 });
      await db.insert(subjectTeachers).values({
        className, subject, teacherName, updatedAt: new Date().toISOString(),
      }).onConflictDoUpdate({
        target: [subjectTeachers.className, subjectTeachers.subject],
        set: { teacherName, updatedAt: new Date().toISOString() },
      });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unsupported teacher request." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to manage subject teachers." }, { status: 500 });
  }
}
