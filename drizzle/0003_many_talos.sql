CREATE TABLE `subject_passwords` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_name` text NOT NULL,
	`subject` text NOT NULL,
	`password_hash` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subject_password_class_idx` ON `subject_passwords` (`class_name`,`subject`);