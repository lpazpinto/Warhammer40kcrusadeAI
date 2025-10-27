/**
 * Horde Mode Spawn System
 * Implements the spawning logic for AI-controlled Horde units
 */

import spawnTablesData from './data/spawn_tables.json';

export interface SpawnTable {
  faction: string;
  brackets: {
    '2': string[];
    '3-4': string[];
    '5-6': string[];
    '7-9': string[];
    '10+': string[];
  };
}

export interface SpawnResult {
  roll: number;
  modifiedRoll: number;
  bracket: string;
  availableUnits: string[];
  selectedUnit: string | null;
}

/**
 * Roll 2D6 for spawning
 */
export function rollSpawn(): number {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return d1 + d2;
}

/**
 * Get spawn bracket based on roll result
 */
export function getSpawnBracket(roll: number): string {
  if (roll === 2) return '2';
  if (roll <= 4) return '3-4';
  if (roll <= 6) return '5-6';
  if (roll <= 9) return '7-9';
  return '10+';
}

/**
 * Get spawn modifiers based on battle round
 */
export function getSpawnModifiers(battleRound: number): number {
  if (battleRound === 1 || battleRound === 2) return 0;
  if (battleRound === 3 || battleRound === 4) return 1;
  return 2; // Round 5+
}

/**
 * Get spawn table for a faction
 */
export function getSpawnTable(faction: string): SpawnTable | null {
  const tables = spawnTablesData as Record<string, SpawnTable>;
  return tables[faction] || null;
}

/**
 * Get all available factions
 */
export function getAvailableFactions(): string[] {
  return Object.keys(spawnTablesData);
}

/**
 * Perform a spawn roll and get available units
 */
export function performSpawnRoll(
  faction: string,
  battleRound: number,
  additionalModifiers: number = 0
): SpawnResult {
  const spawnTable = getSpawnTable(faction);
  
  if (!spawnTable) {
    throw new Error(`Spawn table not found for faction: ${faction}`);
  }

  const baseRoll = rollSpawn();
  const roundModifier = getSpawnModifiers(battleRound);
  const totalModifiers = roundModifier + additionalModifiers;
  const modifiedRoll = baseRoll + totalModifiers;
  
  // Get bracket (unmodified 2 is always "No Spawn")
  const bracket = baseRoll === 2 ? '2' : getSpawnBracket(modifiedRoll);
  
  const availableUnits = spawnTable.brackets[bracket as keyof typeof spawnTable.brackets] || [];
  
  // Randomly select a unit from the bracket
  let selectedUnit: string | null = null;
  if (availableUnits.length > 0 && bracket !== '2') {
    const randomIndex = Math.floor(Math.random() * availableUnits.length);
    selectedUnit = availableUnits[randomIndex];
  }

  return {
    roll: baseRoll,
    modifiedRoll,
    bracket,
    availableUnits,
    selectedUnit
  };
}

/**
 * Spawn units for all spawning zones
 */
export function spawnForAllZones(
  faction: string,
  battleRound: number,
  numberOfZones: number,
  additionalModifiers: number = 0
): SpawnResult[] {
  const results: SpawnResult[] = [];
  
  for (let i = 0; i < numberOfZones; i++) {
    const result = performSpawnRoll(faction, battleRound, additionalModifiers);
    results.push(result);
  }
  
  return results;
}

/**
 * Calculate number of spawning zones based on game size
 */
export function getNumberOfSpawningZones(pointsLimit: number): number {
  return pointsLimit === 1000 ? 2 : 4; // 1000 points = 2 zones, 2000 points = 4 zones
}

