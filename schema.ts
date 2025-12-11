import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Websites table - المواقع المراقبة
 */
export const websites = mysqlTable("websites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  name: varchar("name", { length: 255 }),
  notificationEmail: varchar("notificationEmail", { length: 320 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  checkInterval: int("checkInterval").default(10).notNull(),
  lastCheckAt: timestamp("lastCheckAt"),
  status: mysqlEnum("status", ["healthy", "warning", "critical", "unknown"]).default("unknown").notNull(),
  securityScore: int("securityScore").default(100),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Website = typeof websites.$inferSelect;
export type InsertWebsite = typeof websites.$inferInsert;

/**
 * Monitoring checks table - سجل الفحوصات
 */
export const monitoringChecks = mysqlTable("monitoring_checks", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  checkType: mysqlEnum("checkType", ["scheduled", "manual"]).default("scheduled").notNull(),
  status: mysqlEnum("status", ["success", "warning", "error"]).notNull(),
  responseTime: int("responseTime"),
  httpStatus: int("httpStatus"),
  contentHash: varchar("contentHash", { length: 64 }),
  aiAnalysis: text("aiAnalysis"),
  rawResponse: text("rawResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MonitoringCheck = typeof monitoringChecks.$inferSelect;
export type InsertMonitoringCheck = typeof monitoringChecks.$inferInsert;

/**
 * Alerts table - التنبيهات
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  checkId: int("checkId"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  type: mysqlEnum("type", [
    "vulnerability",
    "intrusion_attempt",
    "anomaly",
    "downtime",
    "content_change",
    "ssl_issue",
    "performance",
    "phishing",
    "malicious_link",
    "code_weakness",
    "behavior_anomaly",
    "attack_prediction",
    "other"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  details: text("details"),
  isRead: boolean("isRead").default(false).notNull(),
  emailSent: boolean("emailSent").default(false).notNull(),
  emailSentAt: timestamp("emailSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Security events table - أحداث الأمان المكتشفة
 */
export const securityEvents = mysqlTable("security_events", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  alertId: int("alertId"),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  sourceIp: varchar("sourceIp", { length: 45 }),
  userAgent: text("userAgent"),
  requestPath: text("requestPath"),
  payload: text("payload"),
  riskScore: int("riskScore").default(0).notNull(),
  aiConfidence: int("aiConfidence").default(0).notNull(),
  mitigationSuggestion: text("mitigationSuggestion"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = typeof securityEvents.$inferInsert;

/**
 * Behavior fingerprints table - بصمات السلوك الأمني
 */
export const behaviorFingerprints = mysqlTable("behavior_fingerprints", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  fingerprintType: mysqlEnum("fingerprintType", ["traffic", "file", "request", "user"]).notNull(),
  baselineData: text("baselineData"),
  currentPattern: text("currentPattern"),
  deviationScore: int("deviationScore").default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BehaviorFingerprint = typeof behaviorFingerprints.$inferSelect;
export type InsertBehaviorFingerprint = typeof behaviorFingerprints.$inferInsert;

/**
 * Attack predictions table - توقعات الهجمات
 */
export const attackPredictions = mysqlTable("attack_predictions", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  predictionType: mysqlEnum("predictionType", ["global_trend", "targeted", "chain_analysis"]).notNull(),
  threatLevel: mysqlEnum("threatLevel", ["low", "medium", "high", "critical"]).notNull(),
  predictedAttackType: varchar("predictedAttackType", { length: 100 }),
  probability: int("probability").default(0),
  timeframe: varchar("timeframe", { length: 50 }),
  aiReasoning: text("aiReasoning"),
  preventiveMeasures: text("preventiveMeasures"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type AttackPrediction = typeof attackPredictions.$inferSelect;
export type InsertAttackPrediction = typeof attackPredictions.$inferInsert;

/**
 * Attacker patterns table - أنماط المهاجمين
 */
export const attackerPatterns = mysqlTable("attacker_patterns", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  patternHash: varchar("patternHash", { length: 64 }),
  attackerProfile: text("attackerProfile"),
  techniques: text("techniques"),
  targetedAreas: text("targetedAreas"),
  firstSeen: timestamp("firstSeen").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  attackCount: int("attackCount").default(1),
  threatLevel: mysqlEnum("threatLevel", ["low", "medium", "high", "critical"]).default("medium"),
});

export type AttackerPattern = typeof attackerPatterns.$inferSelect;
export type InsertAttackerPattern = typeof attackerPatterns.$inferInsert;

/**
 * Code vulnerabilities table - نقاط الضعف في الكود
 */
export const codeVulnerabilities = mysqlTable("code_vulnerabilities", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  vulnerabilityType: varchar("vulnerabilityType", { length: 100 }).notNull(),
  location: text("location"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  description: text("description"),
  codeSnippet: text("codeSnippet"),
  recommendation: text("recommendation"),
  isFixed: boolean("isFixed").default(false),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  fixedAt: timestamp("fixedAt"),
});

export type CodeVulnerability = typeof codeVulnerabilities.$inferSelect;
export type InsertCodeVulnerability = typeof codeVulnerabilities.$inferInsert;

/**
 * File changes table - تغييرات الملفات
 */
export const fileChanges = mysqlTable("file_changes", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  filePath: text("filePath"),
  changeType: mysqlEnum("changeType", ["added", "modified", "deleted", "suspicious"]).notNull(),
  previousHash: varchar("previousHash", { length: 64 }),
  currentHash: varchar("currentHash", { length: 64 }),
  sizeDifference: int("sizeDifference"),
  isSuspicious: boolean("isSuspicious").default(false),
  suspicionReason: text("suspicionReason"),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
});

export type FileChange = typeof fileChanges.$inferSelect;
export type InsertFileChange = typeof fileChanges.$inferInsert;

/**
 * Visitor analysis table - تحليل الزوار
 */
export const visitorAnalysis = mysqlTable("visitor_analysis", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }),
  visitorType: mysqlEnum("visitorType", ["human", "bot", "crawler", "attacker", "unknown"]).default("unknown"),
  intentClassification: mysqlEnum("intentClassification", ["legitimate", "suspicious", "malicious", "scanning"]).default("legitimate"),
  behaviorScore: int("behaviorScore").default(100),
  sourceIp: varchar("sourceIp", { length: 45 }),
  userAgent: text("userAgent"),
  requestCount: int("requestCount").default(1),
  suspiciousActions: text("suspiciousActions"),
  firstSeen: timestamp("firstSeen").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
});

export type VisitorAnalysis = typeof visitorAnalysis.$inferSelect;
export type InsertVisitorAnalysis = typeof visitorAnalysis.$inferInsert;

/**
 * Malicious links table - الروابط الخبيثة
 */
export const maliciousLinks = mysqlTable("malicious_links", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  linkUrl: text("linkUrl"),
  foundIn: text("foundIn"),
  linkType: mysqlEnum("linkType", ["external", "internal", "script", "iframe", "redirect"]).notNull(),
  threatType: mysqlEnum("threatType", ["phishing", "malware", "spam", "suspicious", "unknown"]).default("unknown"),
  isActive: boolean("isActive").default(true),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  verifiedAt: timestamp("verifiedAt"),
});

export type MaliciousLink = typeof maliciousLinks.$inferSelect;
export type InsertMaliciousLink = typeof maliciousLinks.$inferInsert;

/**
 * Phishing clones table - مواقع الانتحال
 */
export const phishingClones = mysqlTable("phishing_clones", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  cloneUrl: text("cloneUrl"),
  similarityScore: int("similarityScore").default(0),
  cloneType: mysqlEnum("cloneType", ["domain_typo", "visual_clone", "content_copy", "brand_abuse"]).notNull(),
  status: mysqlEnum("status", ["active", "taken_down", "monitoring"]).default("active"),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  reportedAt: timestamp("reportedAt"),
});

export type PhishingClone = typeof phishingClones.$inferSelect;
export type InsertPhishingClone = typeof phishingClones.$inferInsert;

/**
 * External services table - الخدمات الخارجية
 */
export const externalServices = mysqlTable("external_services", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  serviceUrl: text("serviceUrl"),
  serviceType: mysqlEnum("serviceType", ["api", "cdn", "analytics", "payment", "auth", "other"]).notNull(),
  status: mysqlEnum("status", ["healthy", "degraded", "down", "unknown"]).default("unknown"),
  lastCheckAt: timestamp("lastCheckAt"),
  responseTime: int("responseTime"),
  securityIssues: text("securityIssues"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExternalService = typeof externalServices.$inferSelect;
export type InsertExternalService = typeof externalServices.$inferInsert;

/**
 * Security benchmarks table - مقارنة مستوى الحماية
 */
export const securityBenchmarks = mysqlTable("security_benchmarks", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  overallScore: int("overallScore").default(0),
  industryAverage: int("industryAverage").default(0),
  percentileRank: int("percentileRank").default(0),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  recommendations: text("recommendations"),
  comparedAt: timestamp("comparedAt").defaultNow().notNull(),
});

export type SecurityBenchmark = typeof securityBenchmarks.$inferSelect;
export type InsertSecurityBenchmark = typeof securityBenchmarks.$inferInsert;

/**
 * Defense actions table - إجراءات الدفاع التلقائي
 */
export const defenseActions = mysqlTable("defense_actions", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  alertId: int("alertId"),
  actionType: mysqlEnum("actionType", ["block_ip", "disable_file", "rate_limit", "notify", "quarantine", "other"]).notNull(),
  targetDetails: text("targetDetails"),
  status: mysqlEnum("status", ["pending", "executed", "failed", "reverted"]).default("pending"),
  isAutomatic: boolean("isAutomatic").default(false),
  executedAt: timestamp("executedAt"),
  revertedAt: timestamp("revertedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DefenseAction = typeof defenseActions.$inferSelect;
export type InsertDefenseAction = typeof defenseActions.$inferInsert;
