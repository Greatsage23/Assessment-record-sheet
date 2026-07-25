import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const records = sqliteTable("assessment_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentCode: text("student_code").notNull(),
  name: text("name").notNull(),
  className: text("class_name").notNull(),
  subject: text("subject").notNull(),
  term: text("term").notNull(),
  classScore: integer("class_score").notNull().default(0),
  examScore: integer("exam_score").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("record_student_assessment_idx").on(table.studentCode, table.className, table.subject, table.term),
]);

export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const studentRoster = sqliteTable("student_roster", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentCode: text("student_code").notNull(),
  name: text("name").notNull(),
  className: text("class_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("roster_student_class_idx").on(table.studentCode, table.className),
]);

export const attendance = sqliteTable("student_attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentCode: text("student_code").notNull(),
  className: text("class_name").notNull(),
  attendanceDate: text("attendance_date").notNull(),
  status: text("status").notNull().default("Present"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("attendance_student_date_idx").on(table.studentCode, table.className, table.attendanceDate),
]);

export const subjectPasswords = sqliteTable("subject_passwords", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  className: text("class_name").notNull(),
  subject: text("subject").notNull(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("subject_password_class_idx").on(table.className, table.subject),
]);

export const subjectTeachers = sqliteTable("subject_teachers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  className: text("class_name").notNull(),
  subject: text("subject").notNull(),
  teacherName: text("teacher_name").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("subject_teacher_class_idx").on(table.className, table.subject),
]);
