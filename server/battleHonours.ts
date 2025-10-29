/**
 * Battle Honours Database
 * Based on official Warhammer 40k Crusade rules
 * Honours are earned when units gain ranks
 */

export interface BattleHonour {
  id: string;
  name: string;
  description: string;
  effect: string;
  faction?: string; // undefined = generic (available to all)
  unitType?: string[]; // Specific unit types (e.g., ["INFANTRY", "CHARACTER"])
}

/**
 * Generic Battle Honours (available to all factions)
 */
export const GENERIC_BATTLE_HONOURS: BattleHonour[] = [
  {
    id: 'blooded',
    name: 'Blooded',
    description: 'This unit has tasted battle and emerged victorious.',
    effect: '+1 to Leadership characteristic',
    unitType: ['INFANTRY', 'CHARACTER'],
  },
  {
    id: 'grizzled',
    name: 'Grizzled',
    description: 'Veterans of countless battles, hardened by war.',
    effect: 'Re-roll one failed hit roll per battle',
  },
  {
    id: 'tank_ace',
    name: 'Tank Ace',
    description: 'Master of armoured warfare.',
    effect: '+1 to hit rolls when shooting',
    unitType: ['VEHICLE'],
  },
  {
    id: 'marksman',
    name: 'Marksman',
    description: 'Deadly accurate with ranged weapons.',
    effect: 'Improve AP of ranged weapons by 1',
    unitType: ['INFANTRY', 'CHARACTER'],
  },
  {
    id: 'close_quarters_killer',
    name: 'Close Quarters Killer',
    description: 'Brutal in melee combat.',
    effect: '+1 to wound rolls in melee',
    unitType: ['INFANTRY', 'CHARACTER'],
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Unshakeable resolve in the face of danger.',
    effect: 'Automatically pass Battle-shock tests',
  },
  {
    id: 'glory_hound',
    name: 'Glory Hound',
    description: 'Seeks glory above all else.',
    effect: '+1 Attack characteristic',
    unitType: ['CHARACTER'],
  },
  {
    id: 'tactical_genius',
    name: 'Tactical Genius',
    description: 'Master of battlefield strategy.',
    effect: 'Once per battle, can use a Stratagem for 1 less CP',
    unitType: ['CHARACTER'],
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Has cheated death many times.',
    effect: '+1 to Toughness characteristic',
  },
  {
    id: 'weapon_master',
    name: 'Weapon Master',
    description: 'Expert with all weapons.',
    effect: 'Re-roll one failed wound roll per battle',
  },
];

/**
 * Space Marines Battle Honours
 */
export const SPACE_MARINES_HONOURS: BattleHonour[] = [
  {
    id: 'sm_angel_of_death',
    name: 'Angel of Death',
    description: 'Strikes fear into the hearts of enemies.',
    effect: 'Enemy units within 6" suffer -1 to Leadership',
    faction: 'Space Marines',
    unitType: ['CHARACTER'],
  },
  {
    id: 'sm_rapid_redeployment',
    name: 'Rapid Redeployment',
    description: 'Swift and decisive movement.',
    effect: '+2" to Move characteristic',
    faction: 'Space Marines',
  },
  {
    id: 'sm_bolter_drill',
    name: 'Bolter Drill',
    description: 'Mastery of the sacred bolter.',
    effect: 'Bolter weapons gain Sustained Hits 1',
    faction: 'Space Marines',
    unitType: ['INFANTRY'],
  },
];

/**
 * Chaos Space Marines Battle Honours
 */
export const CHAOS_SPACE_MARINES_HONOURS: BattleHonour[] = [
  {
    id: 'csm_dark_blessing',
    name: 'Dark Blessing',
    description: 'Blessed by the Dark Gods.',
    effect: '5+ invulnerable save',
    faction: 'Chaos Space Marines',
  },
  {
    id: 'csm_blood_frenzy',
    name: 'Blood Frenzy',
    description: 'Consumed by rage and bloodlust.',
    effect: '+1 Attack when charging',
    faction: 'Chaos Space Marines',
    unitType: ['INFANTRY'],
  },
  {
    id: 'csm_warp_touched',
    name: 'Warp-Touched',
    description: 'Infused with warp energy.',
    effect: 'Psychic weapons gain +1 Strength',
    faction: 'Chaos Space Marines',
  },
];

/**
 * Adepta Sororitas Battle Honours
 */
export const ADEPTA_SORORITAS_HONOURS: BattleHonour[] = [
  {
    id: 'as_shield_of_faith',
    name: 'Shield of Faith',
    description: 'Protected by unwavering faith.',
    effect: 'Improve invulnerable save by 1 (to a maximum of 4+)',
    faction: 'Adepta Sororitas',
  },
  {
    id: 'as_righteous_fury',
    name: 'Righteous Fury',
    description: 'Fury of the faithful.',
    effect: '+1 to wound rolls against CHAOS units',
    faction: 'Adepta Sororitas',
  },
  {
    id: 'as_martyrdom',
    name: 'Martyrdom',
    description: 'Willing to die for the Emperor.',
    effect: 'When destroyed, can make one final attack',
    faction: 'Adepta Sororitas',
  },
];

/**
 * Astra Militarum (Imperial Guard) Battle Honours
 */
export const ASTRA_MILITARUM_HONOURS: BattleHonour[] = [
  {
    id: 'am_veteran_sergeant',
    name: 'Veteran Sergeant',
    description: 'Experienced leader of men.',
    effect: 'Re-roll one failed Order test per turn',
    faction: 'Astra Militarum',
    unitType: ['CHARACTER'],
  },
  {
    id: 'am_tank_commander',
    name: 'Tank Commander',
    description: 'Master of armoured warfare.',
    effect: '+1 BS characteristic',
    faction: 'Astra Militarum',
    unitType: ['VEHICLE'],
  },
  {
    id: 'am_hold_the_line',
    name: 'Hold the Line',
    description: 'Steadfast defenders.',
    effect: '+1 to hit rolls when remaining stationary',
    faction: 'Astra Militarum',
    unitType: ['INFANTRY'],
  },
];

/**
 * Get all Battle Honours for a specific faction
 */
export function getBattleHonoursForFaction(faction: string): BattleHonour[] {
  const factionHonours: Record<string, BattleHonour[]> = {
    'Space Marines': SPACE_MARINES_HONOURS,
    'Chaos Space Marines': CHAOS_SPACE_MARINES_HONOURS,
    'Chaos Knights': CHAOS_SPACE_MARINES_HONOURS, // Reuse for now
    'Adepta Sororitas': ADEPTA_SORORITAS_HONOURS,
    'Astra Militarum': ASTRA_MILITARUM_HONOURS,
    'Imperial Guard': ASTRA_MILITARUM_HONOURS,
    'Death Guard': CHAOS_SPACE_MARINES_HONOURS,
    'Drukhari': GENERIC_BATTLE_HONOURS, // Use generic for now
  };

  const specific = factionHonours[faction] || [];
  return [...GENERIC_BATTLE_HONOURS, ...specific];
}

/**
 * Get Battle Honours filtered by unit type
 */
export function getBattleHonoursForUnit(faction: string, unitType?: string): BattleHonour[] {
  const allHonours = getBattleHonoursForFaction(faction);
  
  if (!unitType) {
    return allHonours;
  }

  return allHonours.filter(honour => {
    // If honour has no unitType restriction, it's available to all
    if (!honour.unitType || honour.unitType.length === 0) {
      return true;
    }
    // Check if unit type matches
    return honour.unitType.includes(unitType);
  });
}

/**
 * Get a specific Battle Honour by ID
 */
export function getBattleHonourById(id: string): BattleHonour | undefined {
  const allHonours = [
    ...GENERIC_BATTLE_HONOURS,
    ...SPACE_MARINES_HONOURS,
    ...CHAOS_SPACE_MARINES_HONOURS,
    ...ADEPTA_SORORITAS_HONOURS,
    ...ASTRA_MILITARUM_HONOURS,
  ];
  
  return allHonours.find(h => h.id === id);
}


/**
 * Roll a random Battle Honour for a unit
 */
export function rollRandomBattleHonour(faction: string, unitType?: string): BattleHonour {
  const availableHonours = getBattleHonoursForUnit(faction, unitType);
  
  if (availableHonours.length === 0) {
    // Fallback to generic if no honours available
    const randomIndex = Math.floor(Math.random() * GENERIC_BATTLE_HONOURS.length);
    return GENERIC_BATTLE_HONOURS[randomIndex];
  }
  
  const randomIndex = Math.floor(Math.random() * availableHonours.length);
  return availableHonours[randomIndex];
}

