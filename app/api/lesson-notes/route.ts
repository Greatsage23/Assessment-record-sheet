import { desc, eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { lessonNoteSubmissions } from "../../../db/schema";

const HEADTEACHER_PASSWORD = process.env.HEADTEACHER_PASSWORD || "head";
const VALID_STATUSES = new Set(["Approved", "Returned"]);

function authorised(request: Request) {
  return request.headers.get("x-headteacher-password") === HEADTEACHER_PASSWORD;
}

export async function GET(request: Request) {
  try {
    if (!authorised(request)) return Response.json({ error: "Incorrect headteacher password." }, { status: 401 });
    await ensureDatabase();
    const db = await getDb();
    const notes = await db.select().from(lessonNoteSubmissions).orderBy(desc(lessonNoteSubmissions.createdAt));
    return Response.json({ notes: notes.map((note) => ({ ...note, noteData: JSON.parse(note.noteData) })) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load lesson notes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const payload = await request.json() as { teacherName?: string; subject?: string; className?: string; week?: string; strand?: string; subStrand?: string; noteData?: unknown };
    const teacherName = payload.teacherName?.trim() ?? "";
    const subject = payload.subject?.trim() ?? "";
    const className = payload.className?.trim() ?? "";
    const week = payload.week?.trim() ?? "";
    if (!teacherName || !subject || !className || !week || !payload.noteData) return Response.json({ error: "Complete the teacher, subject, class and week before submitting." }, { status: 400 });
    const db = await getDb();
    const [note] = await db.insert(lessonNoteSubmissions).values({ teacherName, subject, className, week, strand: payload.strand?.trim() ?? "", subStrand: payload.subStrand?.trim() ?? "", noteData: JSON.stringify(payload.noteData), status: "Pending" }).returning();
    return Response.json({ note }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to submit the lesson note." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!authorised(request)) return Response.json({ error: "Incorrect headteacher password." }, { status: 401 });
    await ensureDatabase();
    const payload = await request.json() as { id?: number; status?: string; comment?: string };
    if (!Number.isInteger(payload.id) || !payload.status || !VALID_STATUSES.has(payload.status)) return Response.json({ error: "Select a valid review action." }, { status: 400 });
    const db = await getDb();
    const [note] = await db.update(lessonNoteSubmissions).set({ status: payload.status, headteacherComment: payload.comment?.trim() ?? "", reviewedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(lessonNoteSubmissions.id, payload.id!)).returning();
    if (!note) return Response.json({ error: "Lesson note not found." }, { status: 404 });
    return Response.json({ note });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to review the lesson note." }, { status: 500 });
  }
}
