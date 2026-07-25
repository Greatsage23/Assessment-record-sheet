import { and, asc, eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { subjectTeachers } from "../../../db/schema";

const ADMIN_PASSWORD = "administrator";

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
      action?: "list" | "set";
      adminPassword?: string;
      className?: string;
      subject?: string;
      teacherName?: string;
    };
    if (payload.adminPassword !== ADMIN_PASSWORD) return Response.json({ error: "Incorrect administrator password." }, { status: 401 });
    const db = await getDb();

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
