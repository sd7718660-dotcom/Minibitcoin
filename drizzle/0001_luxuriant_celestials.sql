CREATE TABLE `investmentPlans` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`minAmount` decimal(10,2) NOT NULL,
	`maxAmount` decimal(10,2) NOT NULL,
	`roi` decimal(5,2) NOT NULL,
	`lockInDays` int NOT NULL,
	`riskLevel` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`description` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investmentPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`type` enum('payment','tournament','investment','withdrawal','result') NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`tournamentId` varchar(36),
	`type` enum('tournament_join','add_fund','withdrawal') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`utr` varchar(100),
	`screenshotUrl` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`rejectedReason` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` varchar(36) NOT NULL,
	`tournamentId` varchar(36) NOT NULL,
	`winnerId` int NOT NULL,
	`winnerName` varchar(100) NOT NULL,
	`winnerUid` varchar(100),
	`prizeAmount` decimal(10,2) NOT NULL,
	`runnerUp` varchar(100),
	`message` text,
	`imageUrl` text,
	`likes` int NOT NULL DEFAULT 0,
	`comments` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` varchar(36) NOT NULL,
	`map` varchar(100) NOT NULL,
	`type` varchar(50) NOT NULL,
	`entryFee` decimal(10,2) NOT NULL,
	`prizePool` decimal(10,2) NOT NULL,
	`totalSlots` int NOT NULL DEFAULT 48,
	`joinedCount` int NOT NULL DEFAULT 0,
	`startTime` timestamp NOT NULL,
	`status` enum('upcoming','live','completed','cancelled') NOT NULL DEFAULT 'upcoming',
	`roomId` varchar(100),
	`password` varchar(100),
	`details` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tournaments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userInvestments` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`planId` varchar(36) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`roi` decimal(5,2) NOT NULL,
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`profitAmount` decimal(10,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userInvestments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `withdrawals` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`upiId` varchar(100) NOT NULL,
	`status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`processedBy` int,
	`rejectedReason` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `withdrawals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `gamingName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `dpUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `upiId` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `qrUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `balance` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalInvested` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalProfit` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalLoss` decimal(12,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_phone_unique` UNIQUE(`phone`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);