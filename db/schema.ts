import { integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const records = pgTable("assessment_records", {
  id: serial("id").primaryKey(),
  studentCode: text("student_code").notNull(),
  name: text("name").notNull(),
  className: text("class_name").notNull(),
  subject: text("subject").notNull(),
  term: text("term").notNull(),
  classScore: integer("class_score").notNull().default(0),
  examScore: integer("exam_score").notNull().default(0),
  ...timestamps(),
}, (table) => [
  uniqueIndex("record_student_assessment_idx").on(table.studentCode, table.className, table.subject, table.term),
]);

export const appMeta = pgTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const studentRoster = pgTable("student_roster", {
  id: serial("id").primaryKey(),
  studentCode: text("student_code").notNull(),
  name: text("name").notNull(),
  className: text("class_name").notNull(),
  ...timestamps(),
}, (table) => [
  uniqueIndex("roster_student_class_idx").on(table.studentCode, table.className),
]);

export const attendance = pgTable("student_attendance", {
  id: serial("id").primaryKey(),
  studentCode: text("student_code").notNull(),
  className: text("class_name").notNull(),
  attendanceDate: text("attendance_date").notNull(),
  status: text("status").notNull().default("Present"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("attendance_student_date_idx").on(table.studentCode, table.className, table.attendanceDate),
]);

export const subjectPasswords = pgTable("subject_passwords", {
  id: serial("id").primaryKey(),
  className: text("class_name").notNull(),
  subject: text("subject").notNull(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("subject_password_class_idx").on(table.className, table.subject),
]);

export const subjectTeachers = pgTable("subject_teachers", {
  id: serial("id").primaryKey(),
  className: text("class_name").notNull(),
  subject: text("subject").notNull(),
  teacherName: text("teacher_name").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("subject_teacher_class_idx").on(table.className, table.subject),
]);

export const questionBank = pgTable("question_bank", {
  id: serial("id").primaryKey(),
  className: text("class_name").notNull(),
  subject: text("subject").notNull(),
  term: text("term").notNull(),
  topic: text("topic").notNull(),
  questionType: text("question_type").notNull(),
  difficulty: text("difficulty").notNull(),
  questionText: text("question_text").notNull(),
  options: text("options").notNull().default("[]"),
  answer: text("answer").notNull(),
  marks: integer("marks").notNull().default(1),
  createdBy: text("created_by").notNull().default("Subject teacher"),
  ...timestamps(),
});
