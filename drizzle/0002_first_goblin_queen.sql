ALTER TABLE `battleParticipants` MODIFY COLUMN `unitsDestroyed` json;--> statement-breakpoint
ALTER TABLE `battles` MODIFY COLUMN `victors` json;--> statement-breakpoint
ALTER TABLE `battles` MODIFY COLUMN `miseryCards` json;--> statement-breakpoint
ALTER TABLE `battles` MODIFY COLUMN `secondaryMissions` json;--> statement-breakpoint
ALTER TABLE `battles` MODIFY COLUMN `hordeUnits` json;--> statement-breakpoint
ALTER TABLE `crusadeUnits` MODIFY COLUMN `battleHonours` json;--> statement-breakpoint
ALTER TABLE `crusadeUnits` MODIFY COLUMN `battleTraits` json;--> statement-breakpoint
ALTER TABLE `crusadeUnits` MODIFY COLUMN `battleScars` json;