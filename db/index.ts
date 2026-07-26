import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let clients: ReturnType<typeof createClients> | undefined;
let initialization: Promise<void> | undefined;

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is unavailable. Add the Neon connection string to the deployment environment."
    );
  }
  return url;
}

function createClients() {
  const sql = neon(connectionString());
  return {
    sql,
    database: drizzle(sql, { schema }),
  };
}

function getClients() {
  clients ??= createClients();
  return clients;
}

export async function getDb() {
  return getClients().database;
}

export async function getSql() {
  return getClients().sql;
}

async function initializeDatabase() {
  const { sql } = getClients();

  await sql`CREATE TABLE IF NOT EXISTS assessment_records (
    id SERIAL PRIMARY KEY,
    student_code TEXT NOT NULL,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    term TEXT NOT NULL,
    class_score INTEGER DEFAULT 0 NOT NULL,
    exam_score INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS record_student_assessment_idx
    ON assessment_records (student_code, class_name, subject, term)`;
  await sql`CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS student_roster (
    id SERIAL PRIMARY KEY,
    student_code TEXT NOT NULL,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS roster_student_class_idx
    ON student_roster (student_code, class_name)`;
  await sql`CREATE TABLE IF NOT EXISTS student_attendance (
    id SERIAL PRIMARY KEY,
    student_code TEXT NOT NULL,
    class_name TEXT NOT NULL,
    attendance_date TEXT NOT NULL,
    status TEXT DEFAULT 'Present' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS attendance_student_date_idx
    ON student_attendance (student_code, class_name, attendance_date)`;
  await sql`CREATE TABLE IF NOT EXISTS subject_passwords (
    id SERIAL PRIMARY KEY,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS subject_password_class_idx
    ON subject_passwords (class_name, subject)`;
  await sql`CREATE TABLE IF NOT EXISTS subject_teachers (
    id SERIAL PRIMARY KEY,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS subject_teacher_class_idx
    ON subject_teachers (class_name, subject)`;
  await sql`CREATE TABLE IF NOT EXISTS question_bank (
    id SERIAL PRIMARY KEY,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    term TEXT NOT NULL,
    topic TEXT NOT NULL,
    question_type TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options TEXT DEFAULT '[]' NOT NULL,
    answer TEXT NOT NULL,
    marks INTEGER DEFAULT 1 NOT NULL,
    created_by TEXT DEFAULT 'Subject teacher' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`;
  await sql`CREATE INDEX IF NOT EXISTS question_bank_scope_idx
    ON question_bank (class_name, subject, term)`;
  await sql`CREATE TABLE IF NOT EXISTS schemes_of_work (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    term TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_data TEXT NOT NULL,
    uploaded_by TEXT DEFAULT 'Administrator' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS scheme_work_scope_idx
    ON schemes_of_work (academic_year, term, level, subject)`;
  await sql`DELETE FROM student_attendance
    WHERE NOT EXISTS (SELECT 1 FROM app_meta WHERE key = 'full_assessment_cleanup_v1')`;
  await sql`DELETE FROM assessment_records
    WHERE NOT EXISTS (SELECT 1 FROM app_meta WHERE key = 'full_assessment_cleanup_v1')`;
  await sql`DELETE FROM student_roster
    WHERE NOT EXISTS (SELECT 1 FROM app_meta WHERE key = 'full_assessment_cleanup_v1')`;
  await sql`INSERT INTO app_meta (key, value)
    VALUES ('full_assessment_cleanup_v1', CURRENT_TIMESTAMP::text)
    ON CONFLICT (key) DO NOTHING`;
}

export async function ensureDatabase() {
  initialization ??= initializeDatabase().catch((error) => {
    initialization = undefined;
    throw error;
  });
  await initialization;
}
