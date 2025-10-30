CREATE TABLE `campaignInvitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`invitedUserId` int NOT NULL,
	`invitedByUserId` int NOT NULL,
	`status` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`respondedAt` timestamp,
	CONSTRAINT `campaignInvitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `players` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `players` ADD `isReady` boolean DEFAULT false NOT NULL;