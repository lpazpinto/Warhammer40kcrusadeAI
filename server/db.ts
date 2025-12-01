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
  InsertBattleParticipant,
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
  
  // Handle different insertId formats from Drizzle ORM
  let insertId: number;
  if (result.insertId !== undefined) {
    insertId = Number(result.insertId);
  } else if (Array.isArray(result) && result[0]?.insertId !== undefined) {
    insertId = Number(result[0].insertId);
  } else if (result.id !== undefined) {
    insertId = Number(result.id);
  } else {
    console.error('[createPlayer] Cannot find insertId in result:', result);
    throw new Error('Failed to create player: invalid ID returned from database');
  }
  
  if (isNaN(insertId) || insertId <= 0) {
    console.error('[createPlayer] Invalid insertId:', insertId, 'from result:', result);
    throw new Error('Failed to create player: invalid ID returned from database');
  }
  
  const [newPlayer] = await db.select().from(players).where(eq(players.id, insertId));
  
  if (!newPlayer) {
    console.error('[createPlayer] Player not found after insert, ID:', insertId);
    throw new Error('Failed to retrieve created player');
  }
  
  return newPlayer;
}

export async function getPlayersByCampaignId(campaignId: number): Promise<Player[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(players).where(eq(players.campaignId, campaignId));
}

export async function getPlayerById(id: number): Promise<Player | undefined> {
  console.log('[getPlayerById] Called with:', id, 'Type:', typeof id, 'isNaN:', isNaN(id));
  
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
  if (typeof id !== 'number' || isNaN(id) || !isFinite(id) || id <= 0) {
    console.error(`[updatePlayer] Invalid player ID: ${id}`);
    throw new Error(`Invalid player ID: ${id}`);
  }
  
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(players).set(updates).where(eq(players.id, id));
}

// Crusade Unit helpers
export async function createCrusadeUnit(unit: InsertCrusadeUnit): Promise<CrusadeUnit> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(crusadeUnits).values(unit);
  
  // Handle different insertId formats from Drizzle ORM
  let insertId: number;
  if (result.insertId !== undefined) {
    insertId = Number(result.insertId);
  } else if (Array.isArray(result) && result[0]?.insertId !== undefined) {
    insertId = Number(result[0].insertId);
  } else if (result.id !== undefined) {
    insertId = Number(result.id);
  } else {
    console.error('[createCrusadeUnit] Cannot find insertId in result:', result);
    throw new Error('Failed to create crusade unit: invalid ID returned from database');
  }
  
  if (isNaN(insertId) || insertId <= 0) {
    console.error('[createCrusadeUnit] Invalid insertId:', insertId, 'from result:', result);
    throw new Error('Failed to create crusade unit: invalid ID returned from database');
  }
  
  const [newUnit] = await db.select().from(crusadeUnits).where(eq(crusadeUnits.id, insertId));
  
  if (!newUnit) {
    console.error('[createCrusadeUnit] Unit not found after insert, ID:', insertId);
    throw new Error('Failed to retrieve created crusade unit');
  }
  
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
  console.log('[getCrusadeUnitById] Called with:', id, 'Type:', typeof id, 'isNaN:', isNaN(id));
  
  if (typeof id !== 'number' || isNaN(id) || !isFinite(id) || id <= 0) {
    console.error(`[getCrusadeUnitById] Invalid unit ID: ${id}`);
    return undefined;
  }
  
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(crusadeUnits).where(eq(crusadeUnits.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCrusadeUnit(id: number, updates: Partial<CrusadeUnit>): Promise<void> {
  if (typeof id !== 'number' || isNaN(id) || !isFinite(id) || id <= 0) {
    console.error(`[updateCrusadeUnit] Invalid unit ID: ${id}`);
    throw new Error(`Invalid crusade unit ID: ${id}`);
  }
  
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(crusadeUnits).set(updates).where(eq(crusadeUnits.id, id));
}

export async function deleteCrusadeUnit(id: number): Promise<void> {
  if (typeof id !== 'number' || isNaN(id) || !isFinite(id) || id <= 0) {
    console.error(`[deleteCrusadeUnit] Invalid unit ID: ${id}`);
    throw new Error(`Invalid crusade unit ID: ${id}`);
  }
  
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(crusadeUnits).where(eq(crusadeUnits.id, id));
}

// Battle helpers
export async function createBattle(battle: InsertBattle): Promise<Battle> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(battles).values(battle);
  console.log('[createBattle] Insert result:', result);
  
  // Handle different insertId formats from different database drivers
  const insertId = result.insertId || result[0]?.insertId || result.insertedId;
  console.log('[createBattle] Extracted insertId:', insertId, 'type:', typeof insertId);
  
  if (!insertId) {
    console.error('[createBattle] No insertId found in result:', result);
    throw new Error('Failed to get battle ID after insert');
  }
  
  const battleId = Number(insertId);
  if (isNaN(battleId) || battleId <= 0) {
    console.error('[createBattle] Invalid battleId:', battleId, 'from insertId:', insertId);
    throw new Error(`Invalid battle ID generated: ${battleId}`);
  }
  
  console.log('[createBattle] Fetching battle with ID:', battleId);
  const [newBattle] = await db.select().from(battles).where(eq(battles.id, battleId));
  
  if (!newBattle) {
    console.error('[createBattle] Battle not found after insert with ID:', battleId);
    throw new Error(`Battle not found after creation with ID: ${battleId}`);
  }
  
  console.log('[createBattle] Success! Battle created with ID:', newBattle.id);
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
  console.log('[createBattleParticipant] Insert result:', result);
  
  const insertId = result.insertId || result[0]?.insertId || result.insertedId;
  console.log('[createBattleParticipant] Extracted insertId:', insertId);
  
  if (!insertId) {
    throw new Error('Failed to get participant ID after insert');
  }
  
  const participantId = Number(insertId);
  if (isNaN(participantId) || participantId <= 0) {
    throw new Error(`Invalid participant ID generated: ${participantId}`);
  }
  
  const [newParticipant] = await db.select().from(battleParticipants).where(eq(battleParticipants.id, participantId));
  
  if (!newParticipant) {
    throw new Error(`Participant not found after creation with ID: ${participantId}`);
  }
  
  console.log('[createBattleParticipant] Success! Participant created with ID:', newParticipant.id);
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

// Campaign Invitation helpers
export async function createCampaignInvitation(invitation: InsertCampaignInvitation): Promise<CampaignInvitation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(campaignInvitations).values(invitation);
  const insertId = result.insertId || result[0]?.insertId || result.insertedId;
  
  if (!insertId || isNaN(Number(insertId))) {
    throw new Error(`Failed to create invitation: invalid insertId (${insertId})`);
  }

  const [newInvitation] = await db.select().from(campaignInvitations).where(eq(campaignInvitations.id, Number(insertId)));
  return newInvitation;
}

export async function getInvitationsByInviteeId(inviteeId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  // Join with campaigns and users to get full details
  const invites = await db
    .select({
      id: campaignInvitations.id,
      campaignId: campaignInvitations.campaignId,
      inviterId: campaignInvitations.inviterId,
      inviteeId: campaignInvitations.inviteeId,
      status: campaignInvitations.status,
      createdAt: campaignInvitations.createdAt,
      respondedAt: campaignInvitations.respondedAt,
      campaignName: campaigns.name,
      hordeFaction: campaigns.hordeFaction,
      inviterName: users.name,
    })
    .from(campaignInvitations)
    .leftJoin(campaigns, eq(campaignInvitations.campaignId, campaigns.id))
    .leftJoin(users, eq(campaignInvitations.inviterId, users.id))
    .where(eq(campaignInvitations.inviteeId, inviteeId));

  // Get player count for each campaign
  const invitesWithPlayerCount = await Promise.all(
    invites.map(async (invite) => {
      const playerCount = await db
        .select()
        .from(players)
        .where(eq(players.campaignId, invite.campaignId));
      
      return {
        ...invite,
        playerCount: playerCount.length,
      };
    })
  );

  return invitesWithPlayerCount;
}

export async function getInvitationById(id: number): Promise<CampaignInvitation | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [invitation] = await db.select().from(campaignInvitations).where(eq(campaignInvitations.id, id));
  return invitation;
}

export async function updateCampaignInvitation(id: number, updates: Partial<CampaignInvitation>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(campaignInvitations).set(updates).where(eq(campaignInvitations.id, id));
}

export async function checkExistingInvitation(campaignId: number, inviteeId: number): Promise<CampaignInvitation | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [invitation] = await db
    .select()
    .from(campaignInvitations)
    .where(
      and(
        eq(campaignInvitations.campaignId, campaignId),
        eq(campaignInvitations.inviteeId, inviteeId),
        eq(campaignInvitations.status, "pending")
      )
    );
  
  return invitation;
}

// XP and Rank Progression helpers
export function calculateXP(params: {
  survived: boolean;
  enemyUnitsKilled: number;
  markedForGreatness?: boolean;
}): number {
  let xp = 1; // Base XP for participating
  
  if (params.survived) xp += 1;
  xp += params.enemyUnitsKilled;
  if (params.markedForGreatness) xp += 1;
  
  return xp;
}

export function getRankFromXP(xp: number): string {
  if (xp >= 51) return "legendary";
  if (xp >= 31) return "heroic";
  if (xp >= 16) return "battle_hardened";
  if (xp >= 6) return "blooded";
  return "battle_ready";
}

export function getXPThresholdForNextRank(currentRank: string): number {
  switch (currentRank) {
    case "battle_ready": return 6;
    case "blooded": return 16;
    case "battle_hardened": return 31;
    case "heroic": return 51;
    case "legendary": return Infinity;
    default: return 6;
  }
}

export async function distributeXPToUnit(params: {
  unitId: number;
  xpGained: number;
  survived: boolean;
  enemyUnitsKilled: number;
}): Promise<{ promoted: boolean; oldRank: string; newRank: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const unit = await getCrusadeUnitById(params.unitId);
  if (!unit) throw new Error(`Unit ${params.unitId} not found`);
  
  const oldRank = unit.rank;
  const newXP = unit.experiencePoints + params.xpGained;
  const newRank = getRankFromXP(newXP);
  const promoted = newRank !== oldRank;
  
  await updateCrusadeUnit(params.unitId, {
    experiencePoints: newXP,
    rank: newRank as any,
    battlesPlayed: unit.battlesPlayed + 1,
    battlesSurvived: params.survived ? unit.battlesSurvived + 1 : unit.battlesSurvived,
    enemyUnitsDestroyed: unit.enemyUnitsDestroyed + params.enemyUnitsKilled,
  });
  
  return { promoted, oldRank, newRank };
}
