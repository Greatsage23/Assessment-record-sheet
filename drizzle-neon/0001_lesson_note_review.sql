CREATE TABLE IF NOT EXISTS "lesson_note_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_name" text NOT NULL,
	"subject" text NOT NULL,
	"class_name" text NOT NULL,
	"week" text NOT NULL,
	"strand" text DEFAULT '' NOT NULL,
	"sub_strand" text DEFAULT '' NOT NULL,
	"note_data" text NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"headteacher_comment" text DEFAULT '' NOT NULL,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "lesson_notes_review_idx" ON "lesson_note_submissions" USING btree ("status","created_at");
