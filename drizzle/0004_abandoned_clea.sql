CREATE TABLE `subject_teachers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_name` text NOT NULL,
	`subject` text NOT NULL,
	`teacher_name` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subject_teacher_class_idx` ON `subject_teachers` (`class_name`,`subject`);