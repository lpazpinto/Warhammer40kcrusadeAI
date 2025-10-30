ALTER TABLE `battles` ADD `phaseNumber` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `battles` ADD `strategicPointsEarned` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `gameMasterId` int;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `battlesPerPhase` int DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `strategicPointsToWin` int DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `currentPhase` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `phase1StrategicPoints` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `phase2StrategicPoints` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `phase3StrategicPoints` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `phase4StrategicPoints` int DEFAULT 0 NOT NULL;