import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

async function getEnvironment() {
  const workersModule = await import("cloudflare:workers");
  return workersModule.env;
}

export async function getDb() {
  const env = await getEnvironment();
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}

export async function ensureDatabase() {
  const env = await getEnvironment();
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS assessment_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      student_code TEXT NOT NULL,
      name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      term TEXT NOT NULL,
      class_score INTEGER DEFAULT 0 NOT NULL,
      exam_score INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS record_student_assessment_idx ON assessment_records (student_code, class_name, subject, term)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS student_roster (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      student_code TEXT NOT NULL,
      name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS roster_student_class_idx ON student_roster (student_code, class_name)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS student_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      student_code TEXT NOT NULL,
      class_name TEXT NOT NULL,
      attendance_date TEXT NOT NULL,
      status TEXT DEFAULT 'Present' NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS attendance_student_date_idx ON student_attendance (student_code, class_name, attendance_date)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS subject_passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      class_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS subject_password_class_idx ON subject_passwords (class_name, subject)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS subject_teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      class_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      teacher_name TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS subject_teacher_class_idx ON subject_teachers (class_name, subject)"),
    env.DB.prepare(`DELETE FROM student_attendance
      WHERE NOT EXISTS (SELECT 1 FROM app_meta WHERE key = 'full_assessment_cleanup_v1')`),
    env.DB.prepare(`DELETE FROM assessment_records
      WHERE NOT EXISTS (SELECT 1 FROM app_meta WHERE key = 'full_assessment_cleanup_v1')`),
    env.DB.prepare(`DELETE FROM student_roster
      WHERE NOT EXISTS (SELECT 1 FROM app_meta WHERE key = 'full_assessment_cleanup_v1')`),
    env.DB.prepare("INSERT OR IGNORE INTO app_meta (key, value) VALUES ('full_assessment_cleanup_v1', CURRENT_TIMESTAMP)"),
  ]);
}
