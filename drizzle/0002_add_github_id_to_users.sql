ALTER TABLE `users` ADD `githubId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_githubId_unique` UNIQUE(`githubId`);
