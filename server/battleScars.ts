/**
 * Battle Scars Database
 * Based on official Warhammer 40k Crusade rules
 * Scars are gained when units go Out of Action or are destroyed
 */

export interface BattleScar {
  id: string;
  name: string;
  description: string;
  effect: string;
  faction?: string; // undefined = generic (available to all)
  unitType?: string[]; // Specific unit types
}

/**
 * Generic Battle Scars (available to all factions)
 */
export const GENERIC_BATTLE_SCARS: BattleScar[] = [
  {
    id: 'shell_shocked',
    name: 'Shell-Shocked',
    description: 'The horrors of war have taken their toll.',
    effect: '-1 to Leadership characteristic',
  },
  {
    id: 'maimed',
    name: 'Maimed',
    description: 'Serious injuries slow movement.',
    effect: '-2" to Move characteristic',
    unitType: ['INFANTRY', 'CHARACTER'],
  },
  {
    id: 'damaged_vision',
    name: 'Damaged Vision',
    description: 'Impaired sight affects accuracy.',
    effect: '-1 to hit rolls when shooting',
  },
  {
    id: 'weakened',
    name: 'Weakened',
    description: 'Reduced physical strength.',
    effect: '-1 to Strength characteristic',
    unitType: ['INFANTRY', 'CHARACTER'],
  },
  {
    id: 'battle_fatigue',
    name: 'Battle Fatigue',
    description: 'Exhaustion from prolonged combat.',
    effect: '-1 to Attacks characteristic',
  },
  {
    id: 'traumatized',
    name: 'Traumatized',
    description: 'Psychological damage from combat.',
    effect: 'Must re-roll successful Battle-shock tests',
  },
  {
    id: 'impaired_reflexes',
    name: 'Impaired Reflexes',
    description: 'Slower reactions in combat.',
    effect: '-1 to Weapon Skill characteristic',
    unitType: ['INFANTRY', 'CHARACTER'],
  },
  {
    id: 'damaged_armor',
    name: 'Damaged Armour',
    description: 'Protective gear compromised.',
    effect: '-1 to Save characteristic',
  },
  {
    id: 'chronic_pain',
    name: 'Chronic Pain',
    description: 'Persistent injuries cause suffering.',
    effect: 'Cannot Advance',
    unitType: ['INFANTRY', 'CHARACTER'],
  },
  {
    id: 'haunted',
    name: 'Haunted',
    description: 'Plagued by memories of fallen comrades.',
    effect: '-1 to wound rolls in melee',
    unitType: ['INFANTRY', 'CHARACTER'],
  },
];

/**
 * Vehicle-specific Battle Scars
 */
export const VEHICLE_BATTLE_SCARS: BattleScar[] = [
  {
    id: 'damaged_engine',
    name: 'Damaged Engine',
    description: 'Engine performance compromised.',
    effect: '-2" to Move characteristic',
    unitType: ['VEHICLE'],
  },
  {
    id: 'damaged_weapon_system',
    name: 'Damaged Weapon System',
    description: 'Targeting systems malfunction.',
    effect: '-1 to Ballistic Skill characteristic',
    unitType: ['VEHICLE'],
  },
  {
    id: 'hull_breach',
    name: 'Hull Breach',
    description: 'Armour integrity compromised.',
    effect: '-1 to Toughness characteristic',
    unitType: ['VEHICLE'],
  },
  {
    id: 'crew_shaken',
    name: 'Crew Shaken',
    description: 'Crew morale affected.',
    effect: '-1 to Leadership characteristic',
    unitType: ['VEHICLE'],
  },
];

/**
 * Space Marines Battle Scars
 */
export const SPACE_MARINES_SCARS: BattleScar[] = [
  {
    id: 'sm_progenoid_damage',
    name: 'Progenoid Damage',
    description: 'Gene-seed organs damaged.',
    effect: '-1 to Toughness characteristic',
    faction: 'Space Marines',
    unitType: ['CHARACTER', 'INFANTRY'],
  },
  {
    id: 'sm_armour_malfunction',
    name: 'Power Armour Malfunction',
    description: 'Sacred armour systems failing.',
    effect: 'Cannot use Armour of Contempt ability',
    faction: 'Space Marines',
  },
];

/**
 * Chaos Space Marines Battle Scars
 */
export const CHAOS_SPACE_MARINES_SCARS: BattleScar[] = [
  {
    id: 'csm_warp_corruption',
    name: 'Warp Corruption',
    description: 'Excessive warp exposure causes mutation.',
    effect: 'Random: Roll D6 at start of battle - on 1, suffer D3 mortal wounds',
    faction: 'Chaos Space Marines',
  },
  {
    id: 'csm_dark_obsession',
    name: 'Dark Obsession',
    description: 'Consumed by dark desires.',
    effect: 'Must charge enemy units if within 12"',
    faction: 'Chaos Space Marines',
  },
];

/**
 * Adepta Sororitas Battle Scars
 */
export const ADEPTA_SORORITAS_SCARS: BattleScar[] = [
  {
    id: 'as_crisis_of_faith',
    name: 'Crisis of Faith',
    description: 'Faith wavering after trauma.',
    effect: 'Cannot use Acts of Faith abilities',
    faction: 'Adepta Sororitas',
  },
  {
    id: 'as_martyrs_burden',
    name: "Martyr's Burden",
    description: 'Haunted by fallen sisters.',
    effect: '-1 to Leadership characteristic',
    faction: 'Adepta Sororitas',
  },
];

/**
 * Astra Militarum Battle Scars
 */
export const ASTRA_MILITARUM_SCARS: BattleScar[] = [
  {
    id: 'am_shell_shock',
    name: 'Severe Shell-Shock',
    description: 'Broken by artillery bombardment.',
    effect: '-2 to Leadership characteristic',
    faction: 'Astra Militarum',
    unitType: ['INFANTRY'],
  },
  {
    id: 'am_equipment_loss',
    name: 'Equipment Loss',
    description: 'Lost critical gear in retreat.',
    effect: 'One random weapon loses 6" range',
    faction: 'Astra Militarum',
  },
];

/**
 * Get all Battle Scars for a specific faction
 */
export function getBattleScarsForFaction(faction: string): BattleScar[] {
  const factionScars: Record<string, BattleScar[]> = {
    'Space Marines': SPACE_MARINES_SCARS,
    'Chaos Space Marines': CHAOS_SPACE_MARINES_SCARS,
    'Chaos Knights': CHAOS_SPACE_MARINES_SCARS,
    'Adepta Sororitas': ADEPTA_SORORITAS_SCARS,
    'Astra Militarum': ASTRA_MILITARUM_SCARS,
    'Imperial Guard': ASTRA_MILITARUM_SCARS,
    'Death Guard': CHAOS_SPACE_MARINES_SCARS,
  };

  const specific = factionScars[faction] || [];
  return [...GENERIC_BATTLE_SCARS, ...VEHICLE_BATTLE_SCARS, ...specific];
}

/**
 * Get Battle Scars filtered by unit type
 */
export function getBattleScarsForUnit(faction: string, unitType?: string): BattleScar[] {
  const allScars = getBattleScarsForFaction(faction);
  
  if (!unitType) {
    return allScars;
  }

  return allScars.filter(scar => {
    // If scar has no unitType restriction, it's available to all
    if (!scar.unitType || scar.unitType.length === 0) {
      return true;
    }
    // Check if unit type matches
    return scar.unitType.includes(unitType);
  });
}

/**
 * Get a specific Battle Scar by ID
 */
export function getBattleScarById(id: string): BattleScar | undefined {
  const allScars = [
    ...GENERIC_BATTLE_SCARS,
    ...VEHICLE_BATTLE_SCARS,
    ...SPACE_MARINES_SCARS,
    ...CHAOS_SPACE_MARINES_SCARS,
    ...ADEPTA_SORORITAS_SCARS,
    ...ASTRA_MILITARUM_SCARS,
  ];
  
  return allScars.find(s => s.id === id);
}

/**
 * Roll for a random Battle Scar
 */
export function rollRandomBattleScar(faction: string, unitType?: string): BattleScar {
  const availableScars = getBattleScarsForUnit(faction, unitType);
  const randomIndex = Math.floor(Math.random() * availableScars.length);
  return availableScars[randomIndex];
}

