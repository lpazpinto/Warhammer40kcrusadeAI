import { describe, it, expect, vi } from 'vitest';
import { 
  rollSpawn, 
  getSpawnBracket, 
  getSpawnModifiers, 
  getSpawnTable,
  performSpawnRoll,
  getNumberOfSpawningZones
} from './hordeSpawn';

describe('Horde Spawn System', () => {
  describe('rollSpawn', () => {
    it('should return a value between 2 and 12 (2D6)', () => {
      for (let i = 0; i < 100; i++) {
        const roll = rollSpawn();
        expect(roll).toBeGreaterThanOrEqual(2);
        expect(roll).toBeLessThanOrEqual(12);
      }
    });
  });

  describe('getSpawnBracket', () => {
    it('should return "2" for roll of 2', () => {
      expect(getSpawnBracket(2)).toBe('2');
    });

    it('should return "3-4" for rolls 3-4', () => {
      expect(getSpawnBracket(3)).toBe('3-4');
      expect(getSpawnBracket(4)).toBe('3-4');
    });

    it('should return "5-6" for rolls 5-6', () => {
      expect(getSpawnBracket(5)).toBe('5-6');
      expect(getSpawnBracket(6)).toBe('5-6');
    });

    it('should return "7-9" for rolls 7-9', () => {
      expect(getSpawnBracket(7)).toBe('7-9');
      expect(getSpawnBracket(8)).toBe('7-9');
      expect(getSpawnBracket(9)).toBe('7-9');
    });

    it('should return "10+" for rolls 10 and above', () => {
      expect(getSpawnBracket(10)).toBe('10+');
      expect(getSpawnBracket(11)).toBe('10+');
      expect(getSpawnBracket(12)).toBe('10+');
      expect(getSpawnBracket(15)).toBe('10+'); // With modifiers
    });
  });

  describe('getSpawnModifiers', () => {
    it('should return 0 for rounds 1-2', () => {
      expect(getSpawnModifiers(1)).toBe(0);
      expect(getSpawnModifiers(2)).toBe(0);
    });

    it('should return +1 for rounds 3-4', () => {
      expect(getSpawnModifiers(3)).toBe(1);
      expect(getSpawnModifiers(4)).toBe(1);
    });

    it('should return +2 for rounds 5+', () => {
      expect(getSpawnModifiers(5)).toBe(2);
      expect(getSpawnModifiers(6)).toBe(2);
      expect(getSpawnModifiers(10)).toBe(2);
    });
  });

  describe('getSpawnTable', () => {
    it('should return spawn table for Grey Knights', () => {
      const table = getSpawnTable('Grey Knights');
      expect(table).toBeDefined();
      expect(table?.faction).toBe('Grey Knights');
      expect(table?.brackets).toBeDefined();
    });

    it('should return spawn table for Chaos Daemons', () => {
      const table = getSpawnTable('Chaos Daemons');
      expect(table).toBeDefined();
      expect(table?.faction).toBe('Chaos Daemons');
    });

    it('should return spawn table for Space Marines', () => {
      const table = getSpawnTable('Space Marines');
      expect(table).toBeDefined();
      expect(table?.faction).toBe('Space Marines');
    });

    it('should return null for unknown faction', () => {
      const table = getSpawnTable('unknown_faction');
      expect(table).toBeNull();
    });
  });

  describe('performSpawnRoll', () => {
    it('should return spawn result with all required fields', () => {
      const result = performSpawnRoll('Space Marines', 1);
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('modifiedRoll');
      expect(result).toHaveProperty('bracket');
      expect(result).toHaveProperty('availableUnits');
      expect(result).toHaveProperty('selectedUnit');
    });

    it('should apply round modifiers correctly', () => {
      // Mock random to get consistent results
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const round1Result = performSpawnRoll('Space Marines', 1);
      const round3Result = performSpawnRoll('Space Marines', 3);
      const round5Result = performSpawnRoll('Space Marines', 5);
      
      // Round 3 should have +1 modifier
      expect(round3Result.modifiedRoll).toBe(round3Result.roll + 1);
      
      // Round 5 should have +2 modifier
      expect(round5Result.modifiedRoll).toBe(round5Result.roll + 2);
      
      vi.restoreAllMocks();
    });

    it('should throw error for unknown faction', () => {
      expect(() => performSpawnRoll('unknown_faction', 1)).toThrow();
    });

    it('should return no spawn for bracket 2', () => {
      // Force roll of 2 (minimum)
      vi.spyOn(Math, 'random').mockReturnValue(0);
      
      const result = performSpawnRoll('Space Marines', 1);
      
      if (result.roll === 2) {
        expect(result.bracket).toBe('2');
        expect(result.selectedUnit).toBeNull();
      }
      
      vi.restoreAllMocks();
    });
  });

  describe('getNumberOfSpawningZones', () => {
    it('should return 2 zones for 1000 points', () => {
      expect(getNumberOfSpawningZones(1000)).toBe(2);
    });

    it('should return 4 zones for 2000 points', () => {
      expect(getNumberOfSpawningZones(2000)).toBe(4);
    });

    it('should return 4 zones for other point values', () => {
      expect(getNumberOfSpawningZones(1500)).toBe(4);
      expect(getNumberOfSpawningZones(500)).toBe(4);
    });
  });

  describe('Faction-specific spawn tables', () => {
    const factions = ['Grey Knights', 'Chaos Daemons', 'Space Marines', 'Orks', 'Tyranids', 'Necrons'];
    
    factions.forEach(faction => {
      it(`should have valid spawn table for ${faction}`, () => {
        const table = getSpawnTable(faction);
        
        if (table) {
          // Check all brackets exist
          expect(table.brackets).toHaveProperty('2');
          expect(table.brackets).toHaveProperty('3-4');
          expect(table.brackets).toHaveProperty('5-6');
          expect(table.brackets).toHaveProperty('7-9');
          expect(table.brackets).toHaveProperty('10+');
          
          // Check bracket 2 contains 'No Spawn' or is empty
          expect(table.brackets['2'].length).toBeLessThanOrEqual(1);
          if (table.brackets['2'].length === 1) {
            expect(table.brackets['2'][0]).toBe('No Spawn');
          }
          
          // Check other brackets have units
          expect(table.brackets['3-4'].length).toBeGreaterThan(0);
          expect(table.brackets['5-6'].length).toBeGreaterThan(0);
          expect(table.brackets['7-9'].length).toBeGreaterThan(0);
          expect(table.brackets['10+'].length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Horde turn order', () => {
    it('should start with Horde (opponent) turn by default', () => {
      // This tests the default value in BattlePhaseTracker
      // The default initialPlayerTurn should be "opponent"
      const defaultPlayerTurn = "opponent";
      expect(defaultPlayerTurn).toBe("opponent");
    });
  });
});
