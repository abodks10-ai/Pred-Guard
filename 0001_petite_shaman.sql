CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`checkId` int,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`type` enum('vulnerability','intrusion_attempt','anomaly','downtime','content_change','ssl_issue','performance','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`details` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`emailSent` boolean NOT NULL DEFAULT false,
	`emailSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoring_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`checkType` enum('scheduled','manual') NOT NULL DEFAULT 'scheduled',
	`status` enum('success','warning','error') NOT NULL,
	`responseTime` int,
	`httpStatus` int,
	`contentHash` varchar(64),
	`aiAnalysis` text,
	`rawResponse` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monitoring_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`alertId` int,
	`eventType` varchar(100) NOT NULL,
	`sourceIp` varchar(45),
	`userAgent` text,
	`requestPath` text,
	`payload` text,
	`riskScore` int NOT NULL DEFAULT 0,
	`aiConfidence` int NOT NULL DEFAULT 0,
	`mitigationSuggestion` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `websites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` varchar(2048) NOT NULL,
	`name` varchar(255),
	`notificationEmail` varchar(320) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`checkInterval` int NOT NULL DEFAULT 10,
	`lastCheckAt` timestamp,
	`status` enum('healthy','warning','critical','unknown') NOT NULL DEFAULT 'unknown',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `websites_id` PRIMARY KEY(`id`)
);
