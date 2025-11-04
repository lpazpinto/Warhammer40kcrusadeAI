/**
 * Warhammer 40K Crusade Missions
 * Based on official mission tables A and B
 */

export interface Mission {
  id: string;
  table: 'A' | 'B';
  d33Roll: number;
  name: string;
  pageReference: string;
}

/**
 * Mission Table A (1-3)
 * For battles in phases 1-3 of the campaign
 */
export const MISSION_TABLE_A: Mission[] = [
  {
    id: 'total_domination',
    table: 'A',
    d33Roll: 11,
    name: 'Total Domination',
    pageReference: 'pg 114'
  },
  {
    id: 'empyric_distortion',
    table: 'A',
    d33Roll: 12,
    name: 'Empyric Distortion',
    pageReference: 'pg 116'
  },
  {
    id: 'metamorphosis',
    table: 'A',
    d33Roll: 13,
    name: 'Metamorphosis',
    pageReference: 'pg 118'
  },
  {
    id: 'lighting_the_path',
    table: 'A',
    d33Roll: 21,
    name: 'Lighting the Path',
    pageReference: 'pg 120'
  },
  {
    id: 'temporal_flux',
    table: 'A',
    d33Roll: 22,
    name: 'Temporal Flux',
    pageReference: 'pg 122'
  },
  {
    id: 'offering_of_blood',
    table: 'A',
    d33Roll: 23,
    name: 'Offering of Blood',
    pageReference: 'pg 124'
  },
  {
    id: 'fighting_gravity',
    table: 'A',
    d33Roll: 31,
    name: 'Fighting Gravity',
    pageReference: 'pg 126'
  },
  {
    id: 'seal_the_rifts',
    table: 'A',
    d33Roll: 32,
    name: 'Seal the Rifts',
    pageReference: 'pg 128'
  }
];

/**
 * Mission Table B (4-6)
 * For battles in phases 4-6 of the campaign
 */
export const MISSION_TABLE_B: Mission[] = [
  {
    id: 'brazen_bridge',
    table: 'B',
    d33Roll: 11,
    name: 'Brazen Bridge',
    pageReference: 'pg 115'
  },
  {
    id: 'blood_and_shadow',
    table: 'B',
    d33Roll: 12,
    name: 'Blood and Shadow',
    pageReference: 'pg 117'
  },
  {
    id: 'breakout',
    table: 'B',
    d33Roll: 13,
    name: 'Breakout',
    pageReference: 'pg 119'
  },
  {
    id: 'trail_of_blood',
    table: 'B',
    d33Roll: 21,
    name: 'Trail of Blood',
    pageReference: 'pg 121'
  },
  {
    id: 'temporal_raid',
    table: 'B',
    d33Roll: 22,
    name: 'Temporal Raid',
    pageReference: 'pg 123'
  },
  {
    id: 'veil_between_worlds',
    table: 'B',
    d33Roll: 23,
    name: 'Veil Between Worlds',
    pageReference: 'pg 125'
  },
  {
    id: 'into_the_mouth_of_hell',
    table: 'B',
    d33Roll: 31,
    name: 'Into the Mouth of Hell',
    pageReference: 'pg 127'
  },
  {
    id: 'assault_the_warp_gate',
    table: 'B',
    d33Roll: 32,
    name: 'Assault the Warp Gate',
    pageReference: 'pg 129'
  }
];

/**
 * Get all missions from a specific table
 */
export function getMissionsByTable(table: 'A' | 'B'): Mission[] {
  return table === 'A' ? MISSION_TABLE_A : MISSION_TABLE_B;
}

/**
 * Get a random mission from a specific table
 * Simulates rolling 2D3 (result: 11, 12, 13, 21, 22, 23, 31, 32)
 */
export function getRandomMission(table: 'A' | 'B'): Mission {
  const missions = getMissionsByTable(table);
  const randomIndex = Math.floor(Math.random() * missions.length);
  return missions[randomIndex];
}

/**
 * Get mission by ID
 */
export function getMissionById(id: string): Mission | undefined {
  return [...MISSION_TABLE_A, ...MISSION_TABLE_B].find(m => m.id === id);
}

/**
 * Simulate 2D3 roll (returns value like 11, 12, 13, 21, 22, 23, 31, 32, 33)
 */
export function roll2D3(): number {
  const die1 = Math.floor(Math.random() * 3) + 1; // 1-3
  const die2 = Math.floor(Math.random() * 3) + 1; // 1-3
  return die1 * 10 + die2;
}
