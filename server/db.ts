import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
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
  InsertBattleParticipant,
  campaignPhaseTemplates,
  CampaignPhaseTemplate,
  campaignInvitations,
  CampaignInvitation,
  InsertCampaignInvitation
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
  
  // Log the full result object to debug
  console.log('[createCampaign] Full insert result:', JSON.stringify(result, null, 2));
  console.log('[createCampaign] result.insertId:', result.insertId, 'type:', typeof result.insertId);
  console.log('[createCampaign] result[0]:', result[0]);
  
  // Try multiple ways to extract the ID from the result
  let insertId: number | undefined;
  
  // Method 1: Direct insertId property
  if (result.insertId !== undefined && result.insertId !== null) {
    insertId = Number(result.insertId);
  }
  // Method 2: Check if result is an array with insertId
  else if (Array.isArray(result) && result[0]?.insertId !== undefined) {
    insertId = Number(result[0].insertId);
  }
  // Method 3: Check for id property directly
  else if (result.id !== undefined) {
    insertId = Number(result.id);
  }
  
  console.log('[createCampaign] Extracted insertId:', insertId);
  
  if (insertId === undefined || isNaN(insertId) || insertId <= 0) {
    console.error('[createCampaign] Failed to extract valid insertId from result');
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
  
  // Log the full result object to debug
  console.log('[createPlayer] Full insert result:', JSON.stringify(result, null, 2));
  console.log('[createPlayer] result.insertId:', result.insertId, 'type:', typeof result.insertId);
  
  // Try multiple ways to extract the ID from the result
  let insertId: number | undefined;
  
  if (result.insertId !== undefined && result.insertId !== null) {
    insertId = Number(result.insertId);
  } else if (Array.isArray(result) && result[0]?.insertId !== undefined) {
    insertId = Number(result[0].insertId);
  } else if (result.id !== undefined) {
    insertId = Number(result.id);
  }
  
  console.log('[createPlayer] Extracted insertId:', insertId);
  
  if (insertId === undefined || isNaN(insertId) || insertId <= 0) {
    console.error('[createPlayer] Failed to extract valid insertId from result');
    throw new Error('Failed to create player: invalid ID returned from database');
  }
  
  const [newPlayer] = await db.select().from(players).where(eq(players.id, insertId));
  
  if (!newPlayer) {
    console.error('[createPlayer] Player not found after insert, ID:', insertId);
    throw new Error('Failed to retrieve created player');
  }
  
  console.log('[createPlayer] Successfully created player:', newPlayer.id);
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
  
  // Log the full result object to debug
  console.log('[createCrusadeUnit] Full insert result:', JSON.stringify(result, null, 2));
  console.log('[createCrusadeUnit] result.insertId:', result.insertId, 'type:', typeof result.insertId);
  
  // Try multiple ways to extract the ID from the result
  let insertId: number | undefined;
  
  if (result.insertId !== undefined && result.insertId !== null) {
    insertId = Number(result.insertId);
  } else if (Array.isArray(result) && result[0]?.insertId !== undefined) {
    insertId = Number(result[0].insertId);
  } else if (result.id !== undefined) {
    insertId = Number(result.id);
  }
  
  console.log('[createCrusadeUnit] Extracted insertId:', insertId);
  
  if (insertId === undefined || isNaN(insertId) || insertId <= 0) {
    console.error('[createCrusadeUnit] Failed to extract valid insertId from result');
    throw new Error('Failed to create crusade unit: invalid ID returned from database');
  }
  
  const [newUnit] = await db.select().from(crusadeUnits).where(eq(crusadeUnits.id, insertId));
  
  if (!newUnit) {
    console.error('[createCrusadeUnit] Unit not found after insert, ID:', insertId);
    throw new Error('Failed to retrieve created crusade unit');
  }
  
  console.log('[createCrusadeUnit] Successfully created unit:', newUnit.id, newUnit.unitName);
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
  // Validate ID FIRST before any other logic
  if (typeof id !== 'number' || isNaN(id) || !isFinite(id) || id <= 0) {
    console.error(`[Database] Invalid crusade unit ID rejected: ${id} (type: ${typeof id})`);
    console.error(`[Database] Stack trace:`, new Error().stack);
    return undefined;
  }

  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(crusadeUnits).where(eq(crusadeUnits.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error: any) {
    console.error(`[Database] Query failed for crusade unit ID ${id}:`, error.message);
    return undefined;
  }
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


// Crusade Battle helpers (simplified battle recording for PvP)
export async function createCrusadeBattle(data: { campaignId: number; mission: string; deployment?: string }): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Create a simple battle record
  const result: any = await db.insert(battles).values({
    campaignId: data.campaignId,
    battleNumber: 0, // Will be updated by campaign logic
    deployment: data.deployment || '',
    missionPack: data.mission,
  });

  console.log('[createCrusadeBattle] Database result:', result);

  // Try multiple methods to extract the ID
  let battleId: number | undefined;

  // Method 1: Direct insertId
  if (result.insertId && !isNaN(Number(result.insertId))) {
    battleId = Number(result.insertId);
  }
  // Method 2: Check if result is an array with insertId
  else if (Array.isArray(result) && result[0]?.insertId) {
    battleId = Number(result[0].insertId);
  }
  // Method 3: Check nested structure
  else if (result[0]?.insertId) {
    battleId = Number(result[0].insertId);
  }

  if (!battleId || isNaN(battleId) || !isFinite(battleId)) {
    console.error('[createCrusadeBattle] Failed to extract valid battle ID from result:', result);
    throw new Error('Failed to create battle: invalid ID returned from database');
  }

  console.log(`[createCrusadeBattle] Successfully created battle with ID: ${battleId}`);
  return battleId;
}

export async function getCrusadeBattlesByCampaignId(campaignId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  // Get all battles for this campaign with participants
  const battlesList = await db.select().from(battles)
    .where(eq(battles.campaignId, campaignId))
    .orderBy(desc(battles.createdAt));

  const battlesWithParticipants = await Promise.all(
    battlesList.map(async (battle) => {
      const participants = await getBattleParticipantsByBattleId(battle.id);
      return {
        ...battle,
        participants,
      };
    })
  );

  return battlesWithParticipants;
}

export async function getCrusadeBattlesByPlayerId(playerId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  // Get all battle participants for this player
  const participantRecords = await db.select()
    .from(battleParticipants)
    .where(eq(battleParticipants.playerId, playerId));

  // Get full battle details for each
  const battlesWithDetails = await Promise.all(
    participantRecords.map(async (participant) => {
      const battle = await getBattleById(participant.battleId);
      return {
        ...battle,
        playerParticipation: participant,
      };
    })
  );

  return battlesWithDetails.filter(b => b !== null);
}





export async function getNextBattleNumber(campaignId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({ maxNumber: sql<number>`MAX(${battles.battleNumber})` })
    .from(battles)
    .where(eq(battles.campaignId, campaignId));
  
  return (result[0]?.maxNumber || 0) + 1;
}



// Campaign Phase Templates
export async function getCampaignPhaseTemplates(campaignType: string = 'armageddon'): Promise<CampaignPhaseTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(campaignPhaseTemplates)
    .where(eq(campaignPhaseTemplates.campaignType, campaignType))
    .orderBy(campaignPhaseTemplates.phaseNumber);
}

export async function getCampaignPhaseTemplate(campaignType: string, phaseNumber: number): Promise<CampaignPhaseTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(campaignPhaseTemplates)
    .where(and(
      eq(campaignPhaseTemplates.campaignType, campaignType),
      eq(campaignPhaseTemplates.phaseNumber, phaseNumber)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}



// ==================== Campaign Invitations ====================

export async function createInvitation(invitation: InsertCampaignInvitation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(campaignInvitations).values(invitation);
  return result;
}

export async function getInvitationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(campaignInvitations)
    .where(eq(campaignInvitations.invitedUserId, userId))
    .orderBy(desc(campaignInvitations.createdAt));
}

export async function updateInvitationStatus(
  invitationId: number,
  status: "accepted" | "declined"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(campaignInvitations)
    .set({ status, respondedAt: new Date() })
    .where(eq(campaignInvitations.id, invitationId));
}

// ==================== Player Ready Status ====================

export async function togglePlayerReady(playerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get current ready status
  const player = await db
    .select()
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);
  
  if (player.length === 0) throw new Error("Player not found");
  
  const newStatus = !player[0].isReady;
  
  await db
    .update(players)
    .set({ isReady: newStatus })
    .where(eq(players.id, playerId));
  
  return newStatus;
}

export async function resetAllPlayersReady(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(players)
    .set({ isReady: false })
    .where(eq(players.campaignId, campaignId));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

