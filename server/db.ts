import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  campaigns, 
  Campaign, 
  InsertCampaign,
  players,
  Player,
  InsertPlayer,
  crusadeUnits,
  CrusadeUnit,
  InsertCrusadeUnit,
  battles,
  Battle,
  InsertBattle,
  battleParticipants,
  BattleParticipant,
  InsertBattleParticipant
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Campaign helpers
export async function createCampaign(campaign: InsertCampaign): Promise<Campaign> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(campaigns).values(campaign);
  
  // Try different ways to get the insert ID (Drizzle ORM compatibility)
  let insertId: number;
  if (result.insertId !== undefined) {
    insertId = Number(result.insertId);
  } else if (Array.isArray(result) && result[0]?.insertId !== undefined) {
    insertId = Number(result[0].insertId);
  } else if (result.id !== undefined) {
    insertId = Number(result.id);
  } else {
    console.error('[createCampaign] Cannot find insertId in result:', result);
    throw new Error('Failed to create campaign: invalid ID returned from database');
  }
  
  if (isNaN(insertId) || insertId <= 0) {
    console.error('[createCampaign] Invalid insertId:', result.insertId);
    throw new Error('Failed to create campaign: invalid ID returned from database');
  }
  
  const [newCampaign] = await db.select().from(campaigns).where(eq(campaigns.id, insertId));
  
  if (!newCampaign) {
    console.error('[createCampaign] Campaign not found after insert, ID:', insertId);
    throw new Error('Failed to retrieve created campaign');
  }
  
  console.log('[createCampaign] Successfully created campaign:', newCampaign.id);
  return newCampaign;
}

export async function getCampaignsByUserId(userId: number): Promise<Campaign[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(id: number): Promise<Campaign | undefined> {
  // Log every call to this function
  console.log(`[getCampaignById] Called with id:`, id, `type:`, typeof id, `isNaN:`, isNaN(id));
  
  // Validate ID FIRST before any other logic
  if (typeof id !== 'number' || isNaN(id) || !isFinite(id) || id <= 0) {
    console.error(`[Database] Invalid campaign ID rejected: ${id} (type: ${typeof id})`);
    console.error(`[Database] Stack trace:`, new Error().stack);
    return undefined;
  }

  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error: any) {
    console.error(`[Database] Query failed for campaign ID ${id}:`, error.message);
    return undefined;
  }
}

export async function updateCampaign(id: number, updates: Partial<Campaign>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(campaigns).set(updates).where(eq(campaigns.id, id));
}

// Player helpers
export async function createPlayer(player: InsertPlayer): Promise<Player> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(players).values(player);
  const [newPlayer] = await db.select().from(players).where(eq(players.id, Number(result.insertId)));
  return newPlayer;
}

export async function getPlayersByCampaignId(campaignId: number): Promise<Player[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(players).where(eq(players.campaignId, campaignId));
}

export async function getPlayerById(id: number): Promise<Player | undefined> {
  // Validate ID FIRST before any other logic
  if (typeof id !== 'number' || isNaN(id) || !isFinite(id) || id <= 0) {
    console.error(`[Database] Invalid player ID rejected: ${id} (type: ${typeof id})`);
    return undefined;
  }

  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(players).where(eq(players.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error: any) {
    console.error(`[Database] Query failed for player ID ${id}:`, error.message);
    return undefined;
  }
}

export async function updatePlayer(id: number, updates: Partial<Player>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(players).set(updates).where(eq(players.id, id));
}

// Crusade Unit helpers
export async function createCrusadeUnit(unit: InsertCrusadeUnit): Promise<CrusadeUnit> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(crusadeUnits).values(unit);
  const [newUnit] = await db.select().from(crusadeUnits).where(eq(crusadeUnits.id, Number(result.insertId)));
  return newUnit;
}

export async function getCrusadeUnitsByPlayerId(playerId: number): Promise<CrusadeUnit[]> {
  // Validate ID FIRST before any other logic
  if (typeof playerId !== 'number' || isNaN(playerId) || !isFinite(playerId) || playerId <= 0) {
    console.error(`[Database] Invalid player ID for crusade units rejected: ${playerId} (type: ${typeof playerId})`);
    return [];
  }

  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(crusadeUnits).where(eq(crusadeUnits.playerId, playerId));
  } catch (error: any) {
    console.error(`[Database] Query failed for crusade units with player ID ${playerId}:`, error.message);
    return [];
  }
}

export async function getCrusadeUnitById(id: number): Promise<CrusadeUnit | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(crusadeUnits).where(eq(crusadeUnits.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCrusadeUnit(id: number, updates: Partial<CrusadeUnit>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(crusadeUnits).set(updates).where(eq(crusadeUnits.id, id));
}

export async function deleteCrusadeUnit(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(crusadeUnits).where(eq(crusadeUnits.id, id));
}

// Battle helpers
export async function createBattle(battle: InsertBattle): Promise<Battle> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(battles).values(battle);
  const [newBattle] = await db.select().from(battles).where(eq(battles.id, Number(result.insertId)));
  return newBattle;
}

export async function getBattlesByCampaignId(campaignId: number): Promise<Battle[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(battles).where(eq(battles.campaignId, campaignId)).orderBy(desc(battles.battleNumber));
}

export async function getBattleById(id: number): Promise<Battle | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(battles).where(eq(battles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBattle(id: number, updates: Partial<Battle>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(battles).set(updates).where(eq(battles.id, id));
}

// Battle Participant helpers
export async function createBattleParticipant(participant: InsertBattleParticipant): Promise<BattleParticipant> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(battleParticipants).values(participant);
  const [newParticipant] = await db.select().from(battleParticipants).where(eq(battleParticipants.id, Number(result.insertId)));
  return newParticipant;
}

export async function getBattleParticipantsByBattleId(battleId: number): Promise<BattleParticipant[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(battleParticipants).where(eq(battleParticipants.battleId, battleId));
}

export async function updateBattleParticipant(id: number, updates: Partial<BattleParticipant>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(battleParticipants).set(updates).where(eq(battleParticipants.id, id));
}

