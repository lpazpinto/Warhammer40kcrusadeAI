import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers';
import type { inferProcedureInput } from '@trpc/server';

describe('Resupply Cards System', () => {
  let testBattleId: number;
  let testParticipantId: number;
  let testCardId: number;

  // Create a mock context for testing
  const createContext = () => ({
    req: {} as any,
    res: {} as any,
    user: {
      id: 1,
      openId: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      loginMethod: 'test',
      role: 'admin' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });

  const caller = appRouter.createCaller(createContext());

  beforeAll(async () => {
    // Setup: Create a test campaign, player, and battle for testing
    const campaign = await caller.campaign.create({
      name: 'Test Campaign for Resupply',
      faction: 'Chaos Daemons',
      hordeFaction: 'Chaos Daemons',
      battlesPerPhase: 3,
      strategicPointsForVictory: 10,
    });

    const player = await caller.player.create({
      campaignId: campaign.id,
      userId: 1, // Test user ID
      name: 'Test Player',
      faction: 'Chaos Daemons',
    });

    const battle = await caller.battle.create({
      campaignId: campaign.id,
      battleNumber: 1,
      deployment: 'Test Deployment',
      missionPack: 'Test Mission',
    });

    testBattleId = battle.id;

    // Create battle participant
    const participant = await caller.battleParticipant.create({
      battleId: testBattleId,
      playerId: player.id,
      unitsDeployed: [],
    });

    testParticipantId = participant.id;
  });

  describe('getResupplyCards', () => {
    it('should return all available resupply cards', async () => {
      const cards = await caller.battle.getResupplyCards();

      expect(cards).toBeDefined();
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);

      // Check card structure
      const firstCard = cards[0];
      expect(firstCard).toHaveProperty('id');
      expect(firstCard).toHaveProperty('namePt');
      expect(firstCard).toHaveProperty('nameEn');
      expect(firstCard).toHaveProperty('cost');
      expect(firstCard).toHaveProperty('descriptionPt');
      expect(firstCard).toHaveProperty('descriptionEn');

      testCardId = firstCard.id;
    });

    it('should have cards with valid costs', async () => {
      const cards = await caller.battle.getResupplyCards();

      cards.forEach(card => {
        expect(card.cost).toBeGreaterThanOrEqual(0);
        expect(card.cost).toBeLessThanOrEqual(12);
      });
    });

    it('should have Portuguese translations for all cards', async () => {
      const cards = await caller.battle.getResupplyCards();

      cards.forEach(card => {
        expect(card.namePt).toBeTruthy();
        expect(card.namePt.length).toBeGreaterThan(0);
        expect(card.descriptionPt).toBeTruthy();
        expect(card.descriptionPt.length).toBeGreaterThan(0);
      });
    });
  });

  describe('awardSupplyPoints', () => {
    it('should award supply points to a participant', async () => {
      const result = await caller.battle.awardSupplyPoints({
        participantId: testParticipantId,
        amount: 5,
      });

      expect(result.success).toBe(true);
      expect(result.newTotal).toBe(5);
    });

    it('should accumulate supply points correctly', async () => {
      // Award more points
      const result = await caller.battle.awardSupplyPoints({
        participantId: testParticipantId,
        amount: 3,
      });

      expect(result.success).toBe(true);
      expect(result.newTotal).toBe(8); // 5 + 3
    });

    it('should reject negative amounts', async () => {
      await expect(
        caller.battle.awardSupplyPoints({
          participantId: testParticipantId,
          amount: -5,
        })
      ).rejects.toThrow();
    });
  });

  describe('purchaseCard', () => {
    it('should purchase a card and deduct SP', async () => {
      // First, ensure participant has enough SP
      await caller.battle.awardSupplyPoints({
        participantId: testParticipantId,
        amount: 10,
      });

      const result = await caller.battle.purchaseCard({
        battleId: testBattleId,
        participantId: testParticipantId,
        cardId: testCardId,
        battleRound: 1,
        cost: 2,
      });

      expect(result.success).toBe(true);
      expect(result.purchasedCard).toBeDefined();
      expect(result.purchasedCard.id).toBeGreaterThan(0);
      expect(result.remainingSP).toBeLessThan(18); // Should have deducted cost
    });

    it('should reject purchase when insufficient SP', async () => {
      await expect(
        caller.battle.purchaseCard({
          battleId: testBattleId,
          participantId: testParticipantId,
          cardId: testCardId,
          battleRound: 1,
          cost: 100, // More than available
        })
      ).rejects.toThrow(/insufficient/i);
    });
  });

  describe('getPurchasedCards', () => {
    it('should return purchased cards for a battle', async () => {
      const purchased = await caller.battle.getPurchasedCards({
        battleId: testBattleId,
      });

      expect(Array.isArray(purchased)).toBe(true);
      expect(purchased.length).toBeGreaterThan(0);

      const firstPurchase = purchased[0];
      expect(firstPurchase).toHaveProperty('id');
      expect(firstPurchase).toHaveProperty('battleId');
      expect(firstPurchase).toHaveProperty('participantId');
      expect(firstPurchase).toHaveProperty('cardId');
      expect(firstPurchase).toHaveProperty('battleRound');
    });

    it('should filter by participant when specified', async () => {
      const purchased = await caller.battle.getPurchasedCards({
        battleId: testBattleId,
        participantId: testParticipantId,
      });

      purchased.forEach(purchase => {
        expect(purchase.participantId).toBe(testParticipantId);
      });
    });
  });

  describe('updatePhaseStep', () => {
    it('should update the current phase step', async () => {
      const result = await caller.battle.updatePhaseStep({
        battleId: testBattleId,
        phaseStep: 'battleshock',
      });

      expect(result.success).toBe(true);
    });

    it('should accept valid phase step values', async () => {
      const validSteps = ['start', 'battleshock', 'resupply'];

      for (const step of validSteps) {
        const result = await caller.battle.updatePhaseStep({
          battleId: testBattleId,
          phaseStep: step,
        });

        expect(result.success).toBe(true);
      }
    });
  });

  describe('updateObjectives', () => {
    it('should update objectives controlled count', async () => {
      const result = await caller.battle.updateObjectives({
        battleId: testBattleId,
        count: 3,
      });

      expect(result.success).toBe(true);
    });

    it('should reject negative objective counts', async () => {
      await expect(
        caller.battle.updateObjectives({
          battleId: testBattleId,
          count: -1,
        })
      ).rejects.toThrow();
    });

    it('should accept zero objectives', async () => {
      const result = await caller.battle.updateObjectives({
        battleId: testBattleId,
        count: 0,
      });

      expect(result.success).toBe(true);
    });
  });
});
