import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { parseArmyList, estimatePowerRating } from "./armyParser";
import * as hordeSpawn from "./hordeSpawn";
import * as hordeAI from "./hordeAI";
import * as postBattle from "./postBattle";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Campaign management
  campaign: router({
    // List all campaigns for the current user
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCampaignsByUserId(ctx.user.id);
    }),

    // Get a specific campaign by ID
    get: protectedProcedure
      .input(z.object({ 
        id: z.number()
          .int()
          .positive()
          .refine((val) => !isNaN(val) && isFinite(val), {
            message: "ID must be a valid finite number"
          })
      }))
      .query(async ({ input }) => {
        console.log('[campaign.get] Received ID:', input.id, 'Type:', typeof input.id, 'isNaN:', isNaN(input.id));
        return await db.getCampaignById(input.id);
      }),

    // Create a new campaign
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        hordeFaction: z.string(),
        battlesPerPhase: z.number().default(3),
        strategicPointsForVictory: z.number().default(10),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          console.log('[campaign.create] Input:', input);
          console.log('[campaign.create] User ID:', ctx.user.id);
          
          const campaign = await db.createCampaign({
            userId: ctx.user.id,
            name: input.name,
            hordeFaction: input.hordeFaction,
            battlesPerPhase: input.battlesPerPhase,
            strategicPointsForVictory: input.strategicPointsForVictory,
            currentNarrativeObjective: 'establishing_the_front', // Always start with Phase I
            currentPhase: 1,
          });
          
          console.log('[campaign.create] Success:', campaign.id);
          return campaign;
        } catch (error) {
          console.error('[campaign.create] Error:', error);
          throw error;
        }
      }),

    // Update campaign
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['ongoing', 'completed', 'paused']).optional(),
        currentBattleRound: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateCampaign(id, updates);
        return { success: true };
      }),

    // Add battle photo to campaign
    addBattlePhoto: protectedProcedure
      .input(z.object({
        campaignId: z.number(),
        photoUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        const campaign = await db.getCampaignById(input.campaignId);
        if (!campaign) throw new Error('Campaign not found');
        
        // Parse existing photos or initialize empty array
        const existingPhotos = campaign.battlePhotos 
          ? JSON.parse(campaign.battlePhotos) 
          : [];
        
        // Add new photo
        existingPhotos.push(input.photoUrl);
        
        // Update campaign
        await db.updateCampaign(input.campaignId, {
          battlePhotos: JSON.stringify(existingPhotos),
        });
        
        return { success: true, totalPhotos: existingPhotos.length };
      }),

    // Send invitation to user
    sendInvite: protectedProcedure
      .input(z.object({
        campaignId: z.number(),
        inviteeId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if campaign exists and user is the owner
        const campaign = await db.getCampaignById(input.campaignId);
        if (!campaign) {
          throw new Error('Campaign not found');
        }
        if (campaign.userId !== ctx.user.id) {
          throw new Error('Only campaign owner can send invites');
        }

        // Check if user is trying to invite themselves
        if (input.inviteeId === ctx.user.id) {
          throw new Error('Cannot invite yourself');
        }

        // Check if invitation already exists
        const existing = await db.checkExistingInvitation(input.campaignId, input.inviteeId);
        if (existing) {
          throw new Error('Invitation already sent to this user');
        }

        // Check if user is already a player in the campaign
        const players = await db.getPlayersByCampaignId(input.campaignId);
        const isAlreadyPlayer = players.some(p => p.userId === input.inviteeId);
        if (isAlreadyPlayer) {
          throw new Error('User is already in this campaign');
        }

        const invitation = await db.createCampaignInvitation({
          campaignId: input.campaignId,
          inviterId: ctx.user.id,
          inviteeId: input.inviteeId,
        });

        return { success: true, invitationId: invitation.id };
      }),

    // List invitations for current user
    listInvites: protectedProcedure.query(async ({ ctx }) => {
      return await db.getInvitationsByInviteeId(ctx.user.id);
    }),

    // Respond to invitation (accept or decline)
    respondToInvite: protectedProcedure
      .input(z.object({
        inviteId: z.number(),
        accept: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const invitation = await db.getInvitationById(input.inviteId);
        if (!invitation) {
          throw new Error('Invitation not found');
        }
        if (invitation.inviteeId !== ctx.user.id) {
          throw new Error('This invitation is not for you');
        }
        if (invitation.status !== 'pending') {
          throw new Error('Invitation has already been responded to');
        }

        const status = input.accept ? 'accepted' : 'declined';
        await db.updateCampaignInvitation(input.inviteId, {
          status,
          respondedAt: new Date(),
        });

        // If accepted, create a player for the user in the campaign
        if (input.accept) {
          const campaign = await db.getCampaignById(invitation.campaignId);
          if (!campaign) {
            throw new Error('Campaign not found');
          }

          await db.createPlayer({
            campaignId: invitation.campaignId,
            userId: ctx.user.id,
            name: ctx.user.name || 'Unknown Commander',
            faction: 'To be determined',
            isReady: false,
          });
        }

        return { success: true, accepted: input.accept };
      }),
  }),

  // Player management
  player: router({
    // List all players in a campaign
    list: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlayersByCampaignId(input.campaignId);
      }),

    // Get a specific player
    get: protectedProcedure
      .input(z.object({ 
        id: z.number()
          .int()
          .positive()
          .refine((val) => !isNaN(val) && isFinite(val), {
            message: "ID must be a valid finite number"
          })
      }))
      .query(async ({ input }) => {
        console.log('[player.get] Received ID:', input.id, 'Type:', typeof input.id, 'isNaN:', isNaN(input.id));
        
        // Extra validation before database call
        if (!input.id || isNaN(input.id) || !isFinite(input.id) || input.id <= 0) {
          console.error('[player.get] Invalid ID detected:', input.id);
          throw new Error(`Invalid player ID: ${input.id}`);
        }
        
        return await db.getPlayerById(input.id);
      }),

    // Create a new player (Lord Commander)
    create: protectedProcedure
      .input(z.object({
        campaignId: z.number(),
        userId: z.number(),
        name: z.string(),
        faction: z.string(),
        detachment: z.string().optional(),
        crusadeForceName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Set initial requisition points to 5 when creating player
        return await db.createPlayer({
          ...input,
          requisitionPoints: 5,
        });
      }),

    // Update player stats
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        requisitionPoints: z.number().optional(),
        supplyLimit: z.number().optional(),
        battleTally: z.number().optional(),
        victories: z.number().optional(),
        supplyPoints: z.number().optional(),
        commandPoints: z.number().optional(),
        isAlive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updatePlayer(id, updates);
        return { success: true };
      }),

    // Update army badge URL
    updateArmyBadge: protectedProcedure
      .input(z.object({
        playerId: z.number(),
        badgeUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updatePlayer(input.playerId, {
          armyBadge: input.badgeUrl,
        });
        return { success: true };
      }),

    // Apply requisition effect: Increase Supply Limit
    applyIncreaseSupplyLimit: protectedProcedure
      .input(z.object({
        playerId: z.number(),
        rpCost: z.number(),
      }))
      .mutation(async ({ input }) => {
        const player = await db.getPlayerById(input.playerId);
        if (!player) throw new Error('Player not found');
        
        // Check RP balance
        if (player.requisitionPoints < input.rpCost) {
          throw new Error('Insufficient Requisition Points');
        }

        // Apply effect: +200 to supply limit, deduct RP
        await db.updatePlayer(input.playerId, {
          supplyLimit: (player.supplyLimit || 1000) + 200,
          requisitionPoints: player.requisitionPoints - input.rpCost,
        });

        return { success: true, newSupplyLimit: (player.supplyLimit || 1000) + 200 };
      }),

    // Import army list from .txt file
    importArmy: protectedProcedure
      .input(z.object({
        playerId: z.number()
          .int()
          .positive()
          .refine((val) => !isNaN(val) && isFinite(val), {
            message: "Player ID must be a valid finite number"
          }),
        armyListContent: z.string(),
      }))
      .mutation(async ({ input }) => {
        const parsed = parseArmyList(input.armyListContent);
        
        // Update player with army details
        await db.updatePlayer(input.playerId, {
          faction: parsed.faction || undefined,
          detachment: parsed.detachment || undefined,
        });

        // Create crusade units from parsed units
        const createdUnits = [];
        for (const unit of parsed.units) {
          const crusadeUnit = await db.createCrusadeUnit({
            playerId: input.playerId,
            unitName: unit.unitName,
            pointsCost: unit.pointsCost,
            powerRating: estimatePowerRating(unit.pointsCost),
            category: unit.category,
            models: JSON.stringify(unit.models),
          });
          createdUnits.push(crusadeUnit);
        }

        return {
          success: true,
          unitsCreated: createdUnits.length,
          armyDetails: {
            name: parsed.armyName,
            faction: parsed.faction,
            detachment: parsed.detachment,
            points: parsed.points,
          }
        };
      }),
  }),

  // Crusade Unit management
  crusadeUnit: router({
    // List all units for a player
    list: protectedProcedure
      .input(z.object({ 
        playerId: z.number()
          .int()
          .positive()
          .refine((val) => !isNaN(val) && isFinite(val), {
            message: "Player ID must be a valid finite number"
          })
      }))
      .query(async ({ input }) => {
        const units = await db.getCrusadeUnitsByPlayerId(input.playerId);
        // Parse JSON fields for frontend
        return units.map(unit => ({
          ...unit,
          models: unit.models ? JSON.parse(unit.models) : [],
          battleHonours: unit.battleHonours ? JSON.parse(unit.battleHonours) : [],
          battleTraits: unit.battleTraits ? JSON.parse(unit.battleTraits) : [],
          battleScars: unit.battleScars ? JSON.parse(unit.battleScars) : [],
        }));
      }),

    // Get a specific unit
    get: protectedProcedure
      .input(z.object({ 
        id: z.number()
          .int()
          .positive()
          .refine((val) => !isNaN(val) && isFinite(val), {
            message: "Unit ID must be a valid finite number"
          })
      }))
      .query(async ({ input }) => {
        const unit = await db.getCrusadeUnitById(input.id);
        if (!unit) return null;
        
        return {
          ...unit,
          models: unit.models ? JSON.parse(unit.models) : [],
          battleHonours: unit.battleHonours ? JSON.parse(unit.battleHonours) : [],
          battleTraits: unit.battleTraits ? JSON.parse(unit.battleTraits) : [],
          battleScars: unit.battleScars ? JSON.parse(unit.battleScars) : [],
        };
      }),

    // Get multiple units by IDs (for battle tracker)
    getByIds: protectedProcedure
      .input(z.object({
        ids: z.array(z.number()),
      }))
      .query(async ({ input }) => {
        if (input.ids.length === 0) return [];
        
        const units = await Promise.all(
          input.ids.map(id => db.getCrusadeUnitById(id))
        );
        
        return units
          .filter(unit => unit !== null)
          .map(unit => ({
            ...unit!,
            models: unit!.models ? JSON.parse(unit!.models) : [],
            battleHonours: unit!.battleHonours ? JSON.parse(unit!.battleHonours) : [],
            battleTraits: unit!.battleTraits ? JSON.parse(unit!.battleTraits) : [],
            battleScars: unit!.battleScars ? JSON.parse(unit!.battleScars) : [],
          }));
      }),

    // Update unit (for crusade name, notes, etc.)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        crusadeName: z.string().optional(),
        unitType: z.string().optional(),
        notes: z.string().optional(),
        battlesPlayed: z.number().optional(),
        battlesSurvived: z.number().optional(),
        enemyUnitsDestroyed: z.number().optional(),
        experiencePoints: z.number().optional(),
        rank: z.enum(['battle_ready', 'blooded', 'battle_hardened', 'heroic', 'legendary']).optional(),
        battleHonours: z.array(z.string()).optional(),
        battleTraits: z.array(z.string()).optional(),
        battleScars: z.array(z.string()).optional(),
        outOfActionStatus: z.string().optional(),
        isDestroyed: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, battleHonours, battleTraits, battleScars, ...updates } = input;
        
        const finalUpdates: any = { ...updates };
        if (battleHonours) finalUpdates.battleHonours = JSON.stringify(battleHonours);
        if (battleTraits) finalUpdates.battleTraits = JSON.stringify(battleTraits);
        if (battleScars) finalUpdates.battleScars = JSON.stringify(battleScars);
        
        await db.updateCrusadeUnit(id, finalUpdates);
        return { success: true };
      }),

    // Delete a unit
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCrusadeUnit(input.id);
        return { success: true };
      }),
  }),

  // Battle management
  battle: router({
    // Create a new battle
    create: protectedProcedure
      .input(z.object({
        campaignId: z.number(),
        deployment: z.string().optional(),
        missionPack: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const campaign = await db.getCampaignById(input.campaignId);
        if (!campaign) throw new Error('Campaign not found');
        
        const battles = await db.getBattlesByCampaignId(input.campaignId);
        const battleNumber = battles.length + 1;
        
        return await db.createBattle({
          campaignId: input.campaignId,
          battleNumber,
          deployment: input.deployment,
          missionPack: input.missionPack,
        });
      }),

    // Get battle by ID
      get: publicProcedure
      .input(z.preprocess(
        (val: any) => {
          console.log('[battle.get] Raw input received:', val);
          if (val && typeof val === 'object' && 'id' in val) {
            const id = val.id;
            console.log('[battle.get] ID value:', id, 'type:', typeof id, 'isNaN:', isNaN(id));
            if (typeof id === 'number' && isNaN(id)) {
              console.error('[battle.get] NaN detected! Rejecting.');
              throw new Error('Invalid battle ID: NaN is not allowed');
            }
          }
          return val;
        },
        z.object({ 
          id: z.number().refine((val) => !isNaN(val) && val > 0, {
            message: "Battle ID must be a valid positive number"
          })
        })
      ))
      .query(async ({ input }) => {
        console.log('[battle.get] Query executing with:', { id: input.id, type: typeof input.id, isNaN: isNaN(input.id) });
        const battle = await db.getBattleById(input.id);
        if (!battle) return null;
        
        return {
          ...battle,
          victors: battle.victors ? JSON.parse(battle.victors) : [],
          miseryCards: battle.miseryCards ? JSON.parse(battle.miseryCards) : [],
          secondaryMissions: battle.secondaryMissions ? JSON.parse(battle.secondaryMissions) : [],
          hordeUnits: battle.hordeUnits ? JSON.parse(battle.hordeUnits) : [],
        };
      }),

    // Update battle state
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        battleRound: z.number().optional(),
        status: z.enum(['setup', 'in_progress', 'completed']).optional(),
        hordeUnits: z.array(z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, hordeUnits, ...updates } = input;
        
        const finalUpdates: any = { ...updates };
        if (hordeUnits) finalUpdates.hordeUnits = JSON.stringify(hordeUnits);
        
        await db.updateBattle(id, finalUpdates);
        return { success: true };
      }),

    // List battles by campaign
    list: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        const battles = await db.getBattlesByCampaignId(input.campaignId);
        return battles.map(battle => ({
          ...battle,
          victors: battle.victors ? JSON.parse(battle.victors) : [],
          miseryCards: battle.miseryCards ? JSON.parse(battle.miseryCards) : [],
          secondaryMissions: battle.secondaryMissions ? JSON.parse(battle.secondaryMissions) : [],
          hordeUnits: battle.hordeUnits ? JSON.parse(battle.hordeUnits) : [],
        }));
      }),

    // Record battle event (for future battle tracking system)
    recordEvent: protectedProcedure
      .input(z.object({
        battleId: z.number(),
        battleRound: z.number(),
        phase: z.string().optional(),
        eventType: z.string(),
        playerId: z.number().optional(),
        unitId: z.number().optional(),
        description: z.string(),
        data: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        // For now, just return success
        // In the future, this will insert into battleEvents table
        console.log('[Battle Event]', input);
        return { success: true, message: 'Event recorded (logging only for now)' };
      }),

    // Update phase step
    updatePhaseStep: protectedProcedure
      .input(z.object({
        battleId: z.number(),
        phaseStep: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updatePhaseStep(input.battleId, input.phaseStep);
        return { success: true };
      }),

    // Update objectives controlled
    updateObjectives: protectedProcedure
      .input(z.object({
        battleId: z.number(),
        count: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        await db.updateObjectivesControlled(input.battleId, input.count);
        return { success: true };
      }),

    // Get all resupply cards
    getResupplyCards: publicProcedure
      .query(async () => {
        return await db.getAllResupplyCards();
      }),

    // Get purchased cards for a battle
    getPurchasedCards: protectedProcedure
      .input(z.object({
        battleId: z.number(),
        participantId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getPurchasedCards(input.battleId, input.participantId);
      }),

    // Purchase a resupply card
    purchaseCard: protectedProcedure
      .input(z.object({
        battleId: z.number(),
        participantId: z.number(),
        cardId: z.number(),
        battleRound: z.number(),
        cost: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Check if participant has enough SP
        const participants = await db.getBattleParticipantsByBattleId(input.battleId);
        const participant = participants.find(p => p.id === input.participantId);
        
        if (!participant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Participant not found',
          });
        }
        
        if (participant.supplyPoints < input.cost) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient supply points. Have: ${participant.supplyPoints}, Need: ${input.cost}`,
          });
        }
        
        // Deduct SP from participant
        const newSP = await db.updateSupplyPoints(input.participantId, -input.cost);
        
        // Record the purchase
        const purchasedCard = await db.purchaseCard({
          battleId: input.battleId,
          participantId: input.participantId,
          cardId: input.cardId,
          battleRound: input.battleRound,
        });
        
        return {
          success: true,
          purchasedCard,
          remainingSP: newSP,
        };
      }),

    // Award SP to participant
    awardSupplyPoints: protectedProcedure
      .input(z.object({
        participantId: z.number(),
        amount: z.number().min(0, "Amount must be non-negative"),
      }))
      .mutation(async ({ input }) => {
        const newSP = await db.updateSupplyPoints(input.participantId, input.amount);
        return {
          success: true,
          newTotal: newSP,
        };
      }),

    // Distribute XP after battle
    distributeXP: protectedProcedure
      .input(z.object({
        battleId: z.number(),
        unitResults: z.array(z.object({
          unitId: z.number(),
          survived: z.boolean(),
          enemyUnitsKilled: z.number(),
          markedForGreatness: z.boolean().optional(),
        })),
        rpAwarded: z.number().default(1), // Base RP for completing battle
      }))
      .mutation(async ({ input }) => {
        const battle = await db.getBattleById(input.battleId);
        if (!battle) throw new Error('Battle not found');
        
        const results = [];
        
        // Distribute XP to each unit
        for (const unitResult of input.unitResults) {
          const xpGained = db.calculateXP({
            survived: unitResult.survived,
            enemyUnitsKilled: unitResult.enemyUnitsKilled,
            markedForGreatness: unitResult.markedForGreatness,
          });
          
          const result = await db.distributeXPToUnit({
            unitId: unitResult.unitId,
            xpGained,
            survived: unitResult.survived,
            enemyUnitsKilled: unitResult.enemyUnitsKilled,
          });
          
          results.push({
            unitId: unitResult.unitId,
            xpGained,
            ...result,
          });
        }
        
        // Award RP to all players in the battle
        const participants = await db.getBattleParticipantsByBattleId(input.battleId);
        for (const participant of participants) {
          const player = await db.getPlayerById(participant.playerId);
          if (player) {
            await db.updatePlayer(player.id, {
              requisitionPoints: player.requisitionPoints + input.rpAwarded,
            });
          }
        }
        
        return {
          success: true,
          unitResults: results,
          rpAwarded: input.rpAwarded,
        };
      }),
  }),

  // Horde spawn system
  horde: router({
    // Get available factions
    factions: publicProcedure.query(() => {
      return hordeSpawn.getAvailableFactions();
    }),

    // Perform spawn roll
    spawn: publicProcedure
      .input(z.object({
        faction: z.string(),
        battleRound: z.number(),
        additionalModifiers: z.number().default(0),
      }))
      .mutation(({ input }) => {
        return hordeSpawn.performSpawnRoll(
          input.faction,
          input.battleRound,
          input.additionalModifiers
        );
      }),

    // Spawn for all zones
    spawnAll: publicProcedure
      .input(z.object({
        faction: z.string(),
        battleRound: z.number(),
        pointsLimit: z.number(),
        additionalModifiers: z.number().default(0),
      }))
      .mutation(({ input }) => {
        const zones = hordeSpawn.getNumberOfSpawningZones(input.pointsLimit);
        return hordeSpawn.spawnForAllZones(
          input.faction,
          input.battleRound,
          zones,
          input.additionalModifiers
        );
      }),

    // Generate AI decisions
    decisions: publicProcedure
      .input(z.object({
        hordeUnits: z.array(z.any()),
        playerUnits: z.array(z.any()),
        objectives: z.array(z.any()),
      }))
      .mutation(({ input }) => {
        const decisions = hordeAI.generateAllDecisions(
          input.hordeUnits,
          input.playerUnits,
          input.objectives
        );
        return Object.fromEntries(decisions);
      }),
  }),

  // Post-battle processing
  postBattle: router({
    // Process a single unit
    processUnit: protectedProcedure
      .input(z.object({
        unitId: z.number(),
        currentXP: z.number(),
        currentRank: z.string(),
        wasDestroyed: z.boolean(),
        completedObjective: z.boolean(),
        enemyUnitsKilled: z.number(),
        battlesPlayed: z.number(),
      }))
      .mutation(({ input }) => {
        return postBattle.processUnitPostBattle(
          input.unitId,
          input.currentXP,
          input.currentRank,
          input.wasDestroyed,
          input.completedObjective,
          input.enemyUnitsKilled,
          input.battlesPlayed
        );
      }),

    // Calculate RP
    calculateRP: publicProcedure
      .input(z.object({
        completedObjective: z.boolean(),
        isVictorious: z.boolean(),
      }))
      .query(({ input }) => {
        return postBattle.calculateRequisitionPoints(
          input.completedObjective,
          input.isVictorious
        );
      }),
  }),

  // Battle participants management
  battleParticipant: router({
    // List all participants in a battle
    list: protectedProcedure
      .input(z.object({ battleId: z.number() }))
      .query(async ({ input }) => {
        const participants = await db.getBattleParticipantsByBattleId(input.battleId);
        return participants.map(p => ({
          ...p,
          unitsDeployed: p.unitsDeployed ? JSON.parse(p.unitsDeployed) : [],
          unitsDestroyed: p.unitsDestroyed ? JSON.parse(p.unitsDestroyed) : [],
        }));
      }),

    // Get a specific participant by battleId and playerId
    get: protectedProcedure
      .input(z.object({ 
        battleId: z.number(),
        playerId: z.number(),
      }))
      .query(async ({ input }) => {
        const participants = await db.getBattleParticipantsByBattleId(input.battleId);
        const participant = participants.find(p => p.playerId === input.playerId);
        if (!participant) return null;
        return {
          ...participant,
          unitsDeployed: participant.unitsDeployed ? JSON.parse(participant.unitsDeployed) : [],
          unitsDestroyed: participant.unitsDestroyed ? JSON.parse(participant.unitsDestroyed) : [],
        };
      }),

    // Create a new participant
    create: protectedProcedure
      .input(z.object({
        battleId: z.number(),
        playerId: z.number(),
        unitsDeployed: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        return await db.createBattleParticipant({
          battleId: input.battleId,
          playerId: input.playerId,
          unitsDeployed: JSON.stringify(input.unitsDeployed),
        });
      }),

    // Update participant data
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        unitsDestroyed: z.array(z.number()).optional(),
        enemyUnitsKilled: z.number().optional(),
        objectivesControlled: z.number().optional(),
        supplyPointsGained: z.number().optional(),
        survived: z.boolean().optional(),
        completedObjective: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, unitsDestroyed, ...updates } = input;
        
        const finalUpdates: any = { ...updates };
        if (unitsDestroyed) {
          finalUpdates.unitsDestroyed = JSON.stringify(unitsDestroyed);
        }
        
        await db.updateBattleParticipant(id, finalUpdates);
        return { success: true };
      }),
  }),

  // Storage and image upload
  storage: router({
    // Upload image to S3 and return URL
    uploadImage: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded image data
        contentType: z.string().default('image/jpeg'),
        folder: z.string().default('images'), // e.g., 'badges', 'battle-photos'
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import('./storage');
        
        // Decode base64 to buffer
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `${input.folder}/${ctx.user.id}-${timestamp}-${randomSuffix}-${input.fileName}`;
        
        // Upload to S3
        const result = await storagePut(fileKey, buffer, input.contentType);
        
        return {
          success: true,
          url: result.url,
          key: result.key,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

