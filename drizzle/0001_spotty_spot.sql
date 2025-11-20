ALTER TABLE `campaigns` MODIFY COLUMN `gameMode` enum('5_phases','infinite') NOT NULL DEFAULT '5_phases';--> statement-breakpoint
ALTER TABLE `campaigns` ADD `currentPhase` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` DROP COLUMN `currentBattleRound`;