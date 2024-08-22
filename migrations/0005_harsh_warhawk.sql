ALTER TABLE `event` ADD `content` text NOT NULL;--> statement-breakpoint
ALTER TABLE `event` ADD `primary_ticket` text NOT NULL;--> statement-breakpoint
ALTER TABLE `event` ADD `additional_tickets` text;--> statement-breakpoint
ALTER TABLE `event` ADD `links` text;