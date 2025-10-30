CREATE TABLE `campaignPhaseTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignType` varchar(100) NOT NULL DEFAULT 'armageddon',
	`phaseNumber` int NOT NULL,
	`phaseName` varchar(255) NOT NULL,
	`narrative` text NOT NULL,
	`successBonus` text NOT NULL,
	`failureConsequence` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignPhaseTemplates_id` PRIMARY KEY(`id`)
);
