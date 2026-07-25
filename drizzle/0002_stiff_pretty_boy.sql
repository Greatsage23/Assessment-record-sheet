CREATE TABLE `student_attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_code` text NOT NULL,
	`class_name` text NOT NULL,
	`attendance_date` text NOT NULL,
	`status` text DEFAULT 'Present' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_student_date_idx` ON `student_attendance` (`student_code`,`class_name`,`attendance_date`);--> statement-breakpoint
CREATE TABLE `student_roster` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_code` text NOT NULL,
	`name` text NOT NULL,
	`class_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roster_student_class_idx` ON `student_roster` (`student_code`,`class_name`);