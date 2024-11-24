CREATE TABLE `saved_characters` (
	`characterSlug` text PRIMARY KEY NOT NULL,
	`characterName` text NOT NULL,
	`savedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `search_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`query` text NOT NULL,
	`usedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `search_history_query_unique` ON `search_history` (`query`);--> statement-breakpoint
CREATE INDEX `query_idx` ON `search_history` (`query`);--> statement-breakpoint
CREATE TABLE `view_history` (
	`characterSlug` text PRIMARY KEY NOT NULL,
	`characterName` text NOT NULL,
	`viewedAt` integer DEFAULT (unixepoch('now', 'start of day')) NOT NULL
);
