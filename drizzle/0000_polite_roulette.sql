CREATE TABLE `assessment_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_code` text NOT NULL,
	`name` text NOT NULL,
	`class_name` text NOT NULL,
	`subject` text NOT NULL,
	`term` text NOT NULL,
	`class_score` integer DEFAULT 0 NOT NULL,
	`exam_score` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `record_student_assessment_idx` ON `assessment_records` (`student_code`,`class_name`,`subject`,`term`);