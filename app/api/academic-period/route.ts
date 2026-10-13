import { eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { appMeta } from "../../../db/schema";

const ADMIN_PASSWORD = "administrator";
const HEADTEACHER_PASSWORD = process.env.HEADTEACHER_PASSWORD || "head";
const DEFAULT_PERIOD = { academicYear: "2026/2027", term: "Term 1" };

export async function GET() {
  try {
    await ensureDatabase();
    const db = await getDb();
    const rows = await db.select().from(appMeta).where(eq(appMeta.key, "active_academic_period")).limit(1);
    if (!rows[0]) return Response.json(DEFAULT_PERIOD);
    try { return Response.json({ ...DEFAULT_PERIOD, ...JSON.parse(rows[0].value) }); }
    catch { return Response.json(DEFAULT_PERIOD); }
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load the academic period." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { password?: string; academicYear?: string; term?: string };
    if (payload.password !== ADMIN_PASSWORD && payload.password !== HEADTEACHER_PASSWORD) return Response.json({ error: "Only the administrator or headteacher can change the academic period." }, { status: 401 });
    const academicYear = payload.academicYear?.trim();
    const term = payload.term?.trim();
    if (!/^\d{4}\/\d{4}$/.test(academicYear ?? "") || !["Term 1", "Term 2", "Term 3"].includes(term ?? "")) return Response.json({ error: "Select a valid academic year and term." }, { status: 400 });
    await ensureDatabase();
    const db = await getDb();
    const period = { academicYear: academicYear!, term: term! };
    await db.insert(appMeta).values({ key: "active_academic_period", value: JSON.stringify(period) }).onConflictDoUpdate({ target: appMeta.key, set: { value: JSON.stringify(period) } });
    return Response.json(period);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update the academic period." }, { status: 500 });
  }
}
