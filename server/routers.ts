import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { parseArmyList, estimatePowerRating } from "./armyParser";

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
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCampaignById(input.id);
      }),

    // Create a new campaign
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        hordeFaction: z.string(),
        gameMode: z.enum(['5_rounds', 'infinite']).default('5_rounds'),
        pointsLimit: z.number().default(1000),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createCampaign({
          userId: ctx.user.id,
          name: input.name,
          hordeFaction: input.hordeFaction,
          gameMode: input.gameMode,
          pointsLimit: input.pointsLimit,
        });
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
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
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
        playerId: z.number(),
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
      .input(z.object({ playerId: z.number() }))
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
      .input(z.object({ id: z.number() }))
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
});

export type AppRouter = typeof appRouter;

