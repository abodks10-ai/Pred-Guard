CREATE TABLE `attack_predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`predictionType` enum('global_trend','targeted','chain_analysis') NOT NULL,
	`threatLevel` enum('low','medium','high','critical') NOT NULL,
	`predictedAttackType` varchar(100),
	`probability` int DEFAULT 0,
	`timeframe` varchar(50),
	`aiReasoning` text,
	`preventiveMeasures` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `attack_predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attacker_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`patternHash` varchar(64),
	`attackerProfile` text,
	`techniques` text,
	`targetedAreas` text,
	`firstSeen` timestamp NOT NULL DEFAULT (now()),
	`lastSeen` timestamp NOT NULL DEFAULT (now()),
	`attackCount` int DEFAULT 1,
	`threatLevel` enum('low','medium','high','critical') DEFAULT 'medium',
	CONSTRAINT `attacker_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `behavior_fingerprints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`fingerprintType` enum('traffic','file','request','user') NOT NULL,
	`baselineData` text,
	`currentPattern` text,
	`deviationScore` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `behavior_fingerprints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `code_vulnerabilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`vulnerabilityType` varchar(100) NOT NULL,
	`location` text,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`description` text,
	`codeSnippet` text,
	`recommendation` text,
	`isFixed` boolean DEFAULT false,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`fixedAt` timestamp,
	CONSTRAINT `code_vulnerabilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `defense_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`alertId` int,
	`actionType` enum('block_ip','disable_file','rate_limit','notify','quarantine','other') NOT NULL,
	`targetDetails` text,
	`status` enum('pending','executed','failed','reverted') DEFAULT 'pending',
	`isAutomatic` boolean DEFAULT false,
	`executedAt` timestamp,
	`revertedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `defense_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `external_services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`serviceUrl` text,
	`serviceType` enum('api','cdn','analytics','payment','auth','other') NOT NULL,
	`status` enum('healthy','degraded','down','unknown') DEFAULT 'unknown',
	`lastCheckAt` timestamp,
	`responseTime` int,
	`securityIssues` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `external_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `file_changes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`filePath` text,
	`changeType` enum('added','modified','deleted','suspicious') NOT NULL,
	`previousHash` varchar(64),
	`currentHash` varchar(64),
	`sizeDifference` int,
	`isSuspicious` boolean DEFAULT false,
	`suspicionReason` text,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `file_changes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `malicious_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`linkUrl` text,
	`foundIn` text,
	`linkType` enum('external','internal','script','iframe','redirect') NOT NULL,
	`threatType` enum('phishing','malware','spam','suspicious','unknown') DEFAULT 'unknown',
	`isActive` boolean DEFAULT true,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`verifiedAt` timestamp,
	CONSTRAINT `malicious_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phishing_clones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`cloneUrl` text,
	`similarityScore` int DEFAULT 0,
	`cloneType` enum('domain_typo','visual_clone','content_copy','brand_abuse') NOT NULL,
	`status` enum('active','taken_down','monitoring') DEFAULT 'active',
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`reportedAt` timestamp,
	CONSTRAINT `phishing_clones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_benchmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`overallScore` int DEFAULT 0,
	`industryAverage` int DEFAULT 0,
	`percentileRank` int DEFAULT 0,
	`strengths` text,
	`weaknesses` text,
	`recommendations` text,
	`comparedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_benchmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visitor_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`sessionId` varchar(64),
	`visitorType` enum('human','bot','crawler','attacker','unknown') DEFAULT 'unknown',
	`intentClassification` enum('legitimate','suspicious','malicious','scanning') DEFAULT 'legitimate',
	`behaviorScore` int DEFAULT 100,
	`sourceIp` varchar(45),
	`userAgent` text,
	`requestCount` int DEFAULT 1,
	`suspiciousActions` text,
	`firstSeen` timestamp NOT NULL DEFAULT (now()),
	`lastSeen` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visitor_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alerts` MODIFY COLUMN `type` enum('vulnerability','intrusion_attempt','anomaly','downtime','content_change','ssl_issue','performance','phishing','malicious_link','code_weakness','behavior_anomaly','attack_prediction','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `websites` ADD `securityScore` int DEFAULT 100;