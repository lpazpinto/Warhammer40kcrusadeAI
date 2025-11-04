import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
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
        name: z.string(),
        faction: z.string(),
        detachment: z.string().optional(),
        crusadeForceName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createPlayer(input);
      }),

    // Update player stats
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        requisitionPoints: z.number().optional(),
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
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
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
});

export type AppRouter = typeof appRouter;

