import { and, asc, eq } from "drizzle-orm";
import { ensureDatabase, getDb } from "../../../db";
import { appMeta, subjectPasswords } from "../../../db/schema";

const ADMIN_PASSWORD = "administrator";

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as {
      action?: "admin-login" | "list" | "set" | "toggle-authentication" | "subject-login";
      adminPassword?: string;
      className?: string;
      subject?: string;
      subjectPassword?: string;
    };

    if (payload.action === "admin-login") {
      return payload.adminPassword === ADMIN_PASSWORD
        ? Response.json({ ok: true })
        : Response.json({ error: "Incorrect administrator password." }, { status: 401 });
    }

    await ensureDatabase();
    const db = await getDb();

    if (payload.action === "subject-login") {
      const [setting] = await db.select().from(appMeta).where(eq(appMeta.key, "subject_authentication")).limit(1);
      if (setting?.value !== "on") return Response.json({ ok: true, passwordRequired: false });
      if (!payload.className || !payload.subject || !payload.subjectPassword) return Response.json({ error: "Password is required." }, { status: 400 });
      const [access] = await db.select().from(subjectPasswords).where(and(
        eq(subjectPasswords.className, payload.className),
        eq(subjectPasswords.subject, payload.subject),
      )).limit(1);
      if (!access) return Response.json({ error: "The administrator has not assigned a password for this class and subject." }, { status: 404 });
      const valid = access.passwordHash === await hashPassword(payload.subjectPassword);
      return valid ? Response.json({ ok: true, passwordRequired: true }) : Response.json({ error: "Incorrect subject password." }, { status: 401 });
    }

    if (payload.adminPassword !== ADMIN_PASSWORD) return Response.json({ error: "Incorrect administrator password." }, { status: 401 });

    if (payload.action === "list") {
      const [setting] = await db.select().from(appMeta).where(eq(appMeta.key, "subject_authentication")).limit(1);
      const configured = await db.select({
        className: subjectPasswords.className,
        subject: subjectPasswords.subject,
        updatedAt: subjectPasswords.updatedAt,
      }).from(subjectPasswords).orderBy(asc(subjectPasswords.className), asc(subjectPasswords.subject));
      return Response.json({ configured, authenticationOn: setting?.value === "on" });
    }

    if (payload.action === "toggle-authentication") {
      const [setting] = await db.select().from(appMeta).where(eq(appMeta.key, "subject_authentication")).limit(1);
      const authenticationOn = setting?.value !== "on";
      await db.insert(appMeta).values({ key: "subject_authentication", value: authenticationOn ? "on" : "off" }).onConflictDoUpdate({
        target: appMeta.key,
        set: { value: authenticationOn ? "on" : "off" },
      });
      return Response.json({ ok: true, authenticationOn });
    }

    if (payload.action === "set") {
      if (!payload.className || !payload.subject || !payload.subjectPassword?.trim()) return Response.json({ error: "Class, subject and password are required." }, { status: 400 });
      const passwordHash = await hashPassword(payload.subjectPassword.trim());
      await db.insert(subjectPasswords).values({
        className: payload.className, subject: payload.subject, passwordHash, updatedAt: new Date().toISOString(),
      }).onConflictDoUpdate({
        target: [subjectPasswords.className, subjectPasswords.subject],
        set: { passwordHash, updatedAt: new Date().toISOString() },
      });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unsupported access request." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to manage access." }, { status: 500 });
  }
}
