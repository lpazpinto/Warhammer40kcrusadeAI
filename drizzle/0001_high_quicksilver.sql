CREATE TABLE `battleParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`battleId` int NOT NULL,
	`playerId` int NOT NULL,
	`unitsDeployed` json NOT NULL,
	`unitsDestroyed` json DEFAULT ('[]'),
	`enemyUnitsKilled` int NOT NULL DEFAULT 0,
	`objectivesControlled` int NOT NULL DEFAULT 0,
	`supplyPointsGained` int NOT NULL DEFAULT 0,
	`survived` boolean NOT NULL DEFAULT true,
	`completedObjective` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `battleParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `battles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`battleNumber` int NOT NULL,
	`deployment` varchar(100),
	`missionPack` varchar(100),
	`battleRound` int NOT NULL DEFAULT 1,
	`status` enum('setup','in_progress','completed') NOT NULL DEFAULT 'setup',
	`victors` json DEFAULT ('[]'),
	`miseryCards` json DEFAULT ('[]'),
	`secondaryMissions` json DEFAULT ('[]'),
	`hordeUnits` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `battles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` enum('ongoing','completed','paused') NOT NULL DEFAULT 'ongoing',
	`hordeFaction` varchar(100) NOT NULL,
	`hordePrimaryFactionRule` text,
	`gameMode` enum('5_rounds','infinite') NOT NULL DEFAULT '5_rounds',
	`pointsLimit` int NOT NULL DEFAULT 1000,
	`currentBattleRound` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crusadeUnits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`unitName` varchar(255) NOT NULL,
	`crusadeName` varchar(255),
	`unitType` varchar(100),
	`powerRating` int NOT NULL DEFAULT 0,
	`pointsCost` int NOT NULL DEFAULT 0,
	`category` varchar(50),
	`models` json NOT NULL,
	`battlesPlayed` int NOT NULL DEFAULT 0,
	`battlesSurvived` int NOT NULL DEFAULT 0,
	`enemyUnitsDestroyed` int NOT NULL DEFAULT 0,
	`experiencePoints` int NOT NULL DEFAULT 0,
	`rank` enum('battle_ready','blooded','battle_hardened','heroic','legendary') NOT NULL DEFAULT 'battle_ready',
	`battleHonours` json DEFAULT ('[]'),
	`battleTraits` json DEFAULT ('[]'),
	`battleScars` json DEFAULT ('[]'),
	`outOfActionStatus` varchar(100),
	`isDestroyed` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crusadeUnits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`faction` varchar(100) NOT NULL,
	`detachment` varchar(100),
	`crusadeForceName` varchar(255),
	`requisitionPoints` int NOT NULL DEFAULT 0,
	`battleTally` int NOT NULL DEFAULT 0,
	`victories` int NOT NULL DEFAULT 0,
	`supplyPoints` int NOT NULL DEFAULT 0,
	`commandPoints` int NOT NULL DEFAULT 2,
	`secretObjective` text,
	`secretObjectiveRevealed` boolean NOT NULL DEFAULT false,
	`isAlive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
