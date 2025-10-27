ALTER TABLE `battleParticipants` MODIFY COLUMN `unitsDeployed` text NOT NULL;--> statement-breakpoint
ALTER TABLE `battleParticipants` MODIFY COLUMN `unitsDestroyed` text;--> statement-breakpoint
ALTER TABLE `battles` MODIFY COLUMN `victors` text;--> statement-breakpoint
ALTER TABLE `battles` MODIFY COLUMN `miseryCards` text;--> statement-breakpoint
ALTER TABLE `battles` MODIFY COLUMN `secondaryMissions` text;--> statement-breakpoint
ALTER TABLE `battles` MODIFY COLUMN `hordeUnits` text;--> statement-breakpoint
ALTER TABLE `crusadeUnits` MODIFY COLUMN `models` text NOT NULL;--> statement-breakpoint
ALTER TABLE `crusadeUnits` MODIFY COLUMN `battleHonours` text;--> statement-breakpoint
ALTER TABLE `crusadeUnits` MODIFY COLUMN `battleTraits` text;--> statement-breakpoint
ALTER TABLE `crusadeUnits` MODIFY COLUMN `battleScars` text;