import { and, asc, eq } from "drizzle-orm";
import { ensureDatabase, getDb, getSql } from "../../../db";
import { appMeta, records, studentRoster } from "../../../db/schema";

const DEFAULT_STUDENT_PASSWORD = "0000";
const COOKIE_NAME = "student_portal_session";
const SESSION_SECONDS = 8 * 60 * 60;
const VALID_CLASSES = new Set(["Basic 7 Red", "Basic 7 Blue", "Basic 8 Red", "Basic 8 Blue", "Basic 9 Red", "Basic 9 Blue"]);

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
async function digest(value: string) { return bytesToBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))); }
async function sessionSignature(payload: string) {
  const secret = process.env.STUDENT_PORTAL_SECRET || process.env.DATABASE_URL;
  if (!secret) throw new Error("Student Portal security is not configured.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
}
async function createSession(className: string, studentCode: string) {
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ className, studentCode, exp: Date.now() + SESSION_SECONDS * 1000 })));
  return `${payload}.${await sessionSignature(payload)}`;
}
async function readSession(request: Request) {
  const token = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || signature !== await sessionSignature(payload)) return null;
  try {
    const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
    const data = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="))) as { className: string; studentCode: string; exp: number };
    return data.exp > Date.now() && VALID_CLASSES.has(data.className) && data.studentCode ? data : null;
  } catch { return null; }
}
function sessionCookie(token: string) { return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${SESSION_SECONDS}`; }

async function dashboard(className: string, studentCode: string) {
  const db = await getDb();
  const [student] = await db.select().from(studentRoster).where(and(eq(studentRoster.className, className), eq(studentRoster.studentCode, studentCode))).limit(1);
  if (!student) return null;
  const assessmentRows = await db.select().from(records).where(and(eq(records.className, className), eq(records.studentCode, studentCode))).orderBy(asc(records.academicYear), asc(records.term), asc(records.subject));
  const results = assessmentRows.filter((record) => record.classScore > 0 || record.examScore > 0).map((record) => ({ id: record.id, subject: record.subject, term: record.term, academicYear: record.academicYear, classScore: record.classScore, examScore: record.examScore, total: record.classScore + record.examScore }));
  const [periodRow] = await db.select().from(appMeta).where(eq(appMeta.key, "active_academic_period")).limit(1);
  let activePeriod = { academicYear: "2026/2027", term: "Term 1" };
  try { if (periodRow) activePeriod = { ...activePeriod, ...JSON.parse(periodRow.value) }; } catch { /* use defaults */ }
  const sql = await getSql();
  const level = className.slice(0, 7);
  const materialRows = await sql`SELECT id, title, subject, level, term, academic_year, file_name, file_type, updated_at FROM schemes_of_work WHERE level = ${level} ORDER BY updated_at DESC`;
  return { student: { studentCode: student.studentCode, name: student.name, className: student.className }, activePeriod, results, materials: materialRows.map((row) => ({ id: Number(row.id), title: String(row.title), subject: String(row.subject), level: String(row.level), term: String(row.term), academicYear: String(row.academic_year), fileName: String(row.file_name), fileType: String(row.file_type), updatedAt: String(row.updated_at) })), assignments: [], announcements: [], calendar: [] };
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { className?: string; studentCode?: string; password?: string };
    const className = payload.className?.trim() ?? "";
    const studentCode = payload.studentCode?.trim() ?? "";
    if (!VALID_CLASSES.has(className) || !studentCode) return Response.json({ error: "Select your class and enter your index number." }, { status: 400 });
    await ensureDatabase();
    const db = await getDb();
    const [student] = await db.select().from(studentRoster).where(and(eq(studentRoster.className, className), eq(studentRoster.studentCode, studentCode))).limit(1);
    if (!student) return Response.json({ error: "No student was found with that class and index number." }, { status: 404 });
    const sql = await getSql();
    let accounts = await sql`SELECT * FROM student_portal_accounts WHERE student_code = ${studentCode} AND class_name = ${className} LIMIT 1`;
    if (!accounts.length) {
      const salt = crypto.randomUUID();
      const passwordHash = await digest(`${salt}:${DEFAULT_STUDENT_PASSWORD}`);
      accounts = await sql`INSERT INTO student_portal_accounts (student_code, class_name, password_hash, password_salt) VALUES (${studentCode}, ${className}, ${passwordHash}, ${salt}) RETURNING *`;
    }
    const account = accounts[0];
    if (account.locked_until && new Date(String(account.locked_until)).getTime() > Date.now()) return Response.json({ error: "This account is temporarily locked after repeated incorrect attempts. Try again in 15 minutes." }, { status: 429 });
    const valid = await digest(`${account.password_salt}:${payload.password ?? ""}`) === account.password_hash;
    if (!valid) {
      const attempts = Number(account.failed_attempts) + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      await sql`UPDATE student_portal_accounts SET failed_attempts = ${attempts >= 5 ? 0 : attempts}, locked_until = ${lockedUntil}, updated_at = CURRENT_TIMESTAMP WHERE id = ${account.id}`;
      return Response.json({ error: attempts >= 5 ? "Too many incorrect attempts. This account is locked for 15 minutes." : "Incorrect student password." }, { status: 401 });
    }
    await sql`UPDATE student_portal_accounts SET failed_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ${account.id}`;
    const token = await createSession(className, studentCode);
    if (account.must_change_password) return Response.json({ requiresPasswordChange: true, student: { name: student.name, className, studentCode } }, { headers: { "Set-Cookie": sessionCookie(token) } });
    return Response.json(await dashboard(className, studentCode), { headers: { "Set-Cookie": sessionCookie(token) } });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to open the Student Portal." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    await ensureDatabase();
    const session = await readSession(request);
    if (!session) return Response.json({ error: "Your student session has expired. Please sign in again." }, { status: 401 });
    const payload = await request.json() as { newPassword?: string; confirmPassword?: string };
    if (!payload.newPassword || payload.newPassword.length < 6) return Response.json({ error: "Create a private password containing at least 6 characters." }, { status: 400 });
    if (payload.newPassword === DEFAULT_STUDENT_PASSWORD) return Response.json({ error: "Choose a password different from the default password." }, { status: 400 });
    if (payload.newPassword !== payload.confirmPassword) return Response.json({ error: "The new passwords do not match." }, { status: 400 });
    const salt = crypto.randomUUID();
    const passwordHash = await digest(`${salt}:${payload.newPassword}`);
    const sql = await getSql();
    await sql`UPDATE student_portal_accounts SET password_hash = ${passwordHash}, password_salt = ${salt}, must_change_password = FALSE, failed_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE student_code = ${session.studentCode} AND class_name = ${session.className}`;
    return Response.json(await dashboard(session.className, session.studentCode));
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to update the student password." }, { status: 500 }); }
}

export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const session = await readSession(request);
    if (!session) return Response.json({ error: "Please sign in to open the Student Portal." }, { status: 401 });
    const sql = await getSql();
    const accounts = await sql`SELECT must_change_password FROM student_portal_accounts WHERE student_code = ${session.studentCode} AND class_name = ${session.className} LIMIT 1`;
    if (!accounts.length || accounts[0].must_change_password) return Response.json({ error: "Create your private password to continue.", requiresPasswordChange: true }, { status: 403 });
    return Response.json(await dashboard(session.className, session.studentCode));
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to load the Student Portal." }, { status: 500 }); }
}

export async function DELETE() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0` } });
}
