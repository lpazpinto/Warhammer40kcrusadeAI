import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

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
 * Campaigns table - represents a Warhammer 40k Crusade campaign
 */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Owner of the campaign
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["ongoing", "completed", "paused"]).default("ongoing").notNull(),
  hordeFaction: varchar("hordeFaction", { length: 100 }).notNull(), // e.g., "Tyranids", "Orks"
  hordePrimaryFactionRule: text("hordePrimaryFactionRule"), // JSON string for faction-specific rules
  gameMode: mysqlEnum("gameMode", ["5_rounds", "infinite"]).default("5_rounds").notNull(),
  pointsLimit: int("pointsLimit").default(1000).notNull(), // 1000 or 2000
  currentBattleRound: int("currentBattleRound").default(0).notNull(),
  
  // Campaign Phase Management
  gameMasterId: int("gameMasterId"), // Player ID of the game master
  battlesPerPhase: int("battlesPerPhase").default(3).notNull(), // 1-4 battles per phase (campaign speed)
  strategicPointsToWin: int("strategicPointsToWin").default(10).notNull(), // Points needed to win a phase
  currentPhase: int("currentPhase").default(1).notNull(), // 1-4
  phase1StrategicPoints: int("phase1StrategicPoints").default(0).notNull(),
  phase2StrategicPoints: int("phase2StrategicPoints").default(0).notNull(),
  phase3StrategicPoints: int("phase3StrategicPoints").default(0).notNull(),
  phase4StrategicPoints: int("phase4StrategicPoints").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/**
 * Players table - Lord Commanders in a campaign
 */
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // Lord Commander name
  faction: varchar("faction", { length: 100 }).notNull(), // e.g., "Astra Militarum"
  detachment: varchar("detachment", { length: 100 }), // e.g., "Combined Arms"
  crusadeForceName: varchar("crusadeForceName", { length: 255 }), // Name of the crusade force
  requisitionPoints: int("requisitionPoints").default(0).notNull(),
  supplyLimit: int('supplyLimit').default(1000), // Crusade Supply Limit (starts at 1000 pts)
  battleTally: int("battleTally").default(0).notNull(),
  victories: int("victories").default(0).notNull(),
  supplyPoints: int("supplyPoints").default(0).notNull(), // Horde Mode SP
  commandPoints: int("commandPoints").default(2).notNull(), // Horde Mode CP
  secretObjective: text("secretObjective"), // JSON string for current secret objective
  secretObjectiveRevealed: boolean("secretObjectiveRevealed").default(false).notNull(),
  isAlive: boolean("isAlive").default(true).notNull(), // For Horde Mode survival tracking
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Crusade Units table - represents individual units in a player's Order of Battle
 * This is the "Crusade Card" for each unit
 */
export const crusadeUnits = mysqlTable("crusadeUnits", {
  id: int("id").autoincrement().primaryKey(),
  playerId: int("playerId").notNull(),
  unitName: varchar("unitName", { length: 255 }).notNull(), // e.g., "Death Korps of Krieg"
  crusadeName: varchar("crusadeName", { length: 255 }), // Player-given name
  unitType: varchar("unitType", { length: 100 }), // For Battle Trait rolls (e.g., "Infantry", "Vehicle")
  powerRating: int("powerRating").default(0).notNull(),
  pointsCost: int("pointsCost").default(0).notNull(),
  category: varchar("category", { length: 50 }), // "CHARACTERS", "BATTLELINE", "OTHER DATASHEETS"
  models: text("models").notNull(), // JSON string of model data
  battlesPlayed: int("battlesPlayed").default(0).notNull(),
  battlesSurvived: int("battlesSurvived").default(0).notNull(),
  enemyUnitsDestroyed: int("enemyUnitsDestroyed").default(0).notNull(),
  experiencePoints: int("experiencePoints").default(0).notNull(),
  rank: mysqlEnum("rank", [
    "battle_ready",
    "blooded",
    "battle_hardened",
    "heroic",
    "legendary"
  ]).default("battle_ready").notNull(),
  battleHonours: text("battleHonours"), // JSON string of honour names
  battleTraits: text("battleTraits"), // JSON string of trait names
  battleScars: text("battleScars"), // JSON string of scar names
  crusadeRelics: text("crusadeRelics"), // JSON string of relic IDs (CHARACTER units only, max 3 per army)
  outOfActionStatus: varchar("outOfActionStatus", { length: 100 }), // Last O.o.A. result
  isDestroyed: boolean("isDestroyed").default(false).notNull(), // Permanently destroyed
  notes: text("notes"), // Additional notes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrusadeUnit = typeof crusadeUnits.$inferSelect;
export type InsertCrusadeUnit = typeof crusadeUnits.$inferInsert;

/**
 * Battles table - represents individual battles in a campaign
 */
export const battles = mysqlTable("battles", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  battleNumber: int("battleNumber").notNull(), // Sequential battle number in campaign
  phaseNumber: int("phaseNumber").default(1).notNull(), // Which phase (1-4) this battle belongs to
  strategicPointsEarned: int("strategicPointsEarned").default(0).notNull(), // Strategic points earned by alliance
  deployment: varchar("deployment", { length: 100 }), // e.g., "Dawn of War"
  missionPack: varchar("missionPack", { length: 100 }), // e.g., "Leviathan"
  battleRound: int("battleRound").default(1).notNull(), // Current round (1-5 or more)
  status: mysqlEnum("status", ["setup", "in_progress", "completed"]).default("setup").notNull(),
  victors: text("victors"), // JSON string of player IDs who won
  miseryCards: text("miseryCards"), // JSON string of active misery cards
  secondaryMissions: text("secondaryMissions"), // JSON string of secondary missions
  hordeUnits: text("hordeUnits"), // JSON string of current horde units on the battlefield
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Battle = typeof battles.$inferSelect;
export type InsertBattle = typeof battles.$inferInsert;

/**
 * Battle Participants table - links players to battles with their performance
 */
export const battleParticipants = mysqlTable("battleParticipants", {
  id: int("id").autoincrement().primaryKey(),
  battleId: int("battleId").notNull(),
  playerId: int("playerId").notNull(),
  unitsDeployed: text("unitsDeployed").notNull(), // JSON string of crusadeUnit IDs
  unitsDestroyed: text("unitsDestroyed"), // JSON string of units lost in battle
  enemyUnitsKilled: int("enemyUnitsKilled").default(0).notNull(),
  objectivesControlled: int("objectivesControlled").default(0).notNull(),
  supplyPointsGained: int("supplyPointsGained").default(0).notNull(),
  survived: boolean("survived").default(true).notNull(),
  completedObjective: boolean("completedObjective").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BattleParticipant = typeof battleParticipants.$inferSelect;
export type InsertBattleParticipant = typeof battleParticipants.$inferInsert;

