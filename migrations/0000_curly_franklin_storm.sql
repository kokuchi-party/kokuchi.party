CREATE TABLE `files` (
	`id` integer PRIMARY KEY NOT NULL,
	`folder` text,
	`hash` text NOT NULL,
	`ext` text,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer
);
