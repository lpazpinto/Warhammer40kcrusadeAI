/**
 * Requisitions Database
 * Based on official Warhammer 40k Crusade rules
 * Requisitions cost RP (Requisition Points) and provide various benefits
 */

export interface Requisition {
  id: string;
  name: string;
  description: string;
  cost: number; // RP cost
  category: 'supply' | 'unit' | 'battle' | 'special';
  effect: string;
  restrictions?: string;
}

/**
 * Supply Requisitions - Manage army composition
 */
export const SUPPLY_REQUISITIONS: Requisition[] = [
  {
    id: 'increase_supply_limit',
    name: 'Increase Supply Limit',
    description: 'Expand your Order of Battle capacity.',
    cost: 1,
    category: 'supply',
    effect: 'Increase your Supply Limit by 5 PL permanently',
  },
  {
    id: 'fresh_recruits',
    name: 'Fresh Recruits',
    description: 'Add new units to your crusade force.',
    cost: 1,
    category: 'supply',
    effect: 'Add a new unit to your Order of Battle at Battle Ready rank',
  },
];

/**
 * Unit Improvement Requisitions
 */
export const UNIT_REQUISITIONS: Requisition[] = [
  {
    id: 'rearm_and_resupply',
    name: 'Rearm and Resupply',
    description: 'Replace lost equipment and weapons.',
    cost: 1,
    category: 'unit',
    effect: 'Change the wargear of one unit',
    restrictions: 'Cannot be used on units that participated in the last battle',
  },
  {
    id: 'repair_and_recuperate',
    name: 'Repair and Recuperate',
    description: 'Heal wounds and repair damage.',
    cost: 1,
    category: 'unit',
    effect: 'Remove one Battle Scar from a unit',
  },
  {
    id: 'field_promotion',
    name: 'Field Promotion',
    description: 'Promote a unit for exceptional service.',
    cost: 1,
    category: 'unit',
    effect: 'Increase a unit\'s rank by one level',
    restrictions: 'Cannot promote to Legendary rank',
  },
  {
    id: 'specialist_reinforcements',
    name: 'Specialist Reinforcements',
    description: 'Add elite warriors to existing units.',
    cost: 2,
    category: 'unit',
    effect: 'Add models to a unit (up to starting strength)',
  },
];

/**
 * Battle Requisitions - Used before or after battles
 */
export const BATTLE_REQUISITIONS: Requisition[] = [
  {
    id: 'strategic_reserves',
    name: 'Strategic Reserves',
    description: 'Deploy additional forces.',
    cost: 1,
    category: 'battle',
    effect: 'Gain +1 CP at the start of the battle',
  },
  {
    id: 'battle_honours',
    name: 'Award Battle Honours',
    description: 'Recognize heroic deeds.',
    cost: 1,
    category: 'battle',
    effect: 'Grant one Battle Honour to a unit',
    restrictions: 'Unit must have participated in at least one battle',
  },
  {
    id: 'relic_hunt',
    name: 'Relic Hunt',
    description: 'Search for ancient artifacts.',
    cost: 2,
    category: 'battle',
    effect: 'One CHARACTER unit can be given a Crusade Relic',
    restrictions: 'CHARACTER units only, max 3 relics per army',
  },
];

/**
 * Special Requisitions - Unique effects
 */
export const SPECIAL_REQUISITIONS: Requisition[] = [
  {
    id: 'heroic_intervention',
    name: 'Heroic Intervention',
    description: 'Bring back a fallen hero.',
    cost: 3,
    category: 'special',
    effect: 'Return a destroyed CHARACTER unit to your Order of Battle',
    restrictions: 'Unit gains one Battle Scar and loses all Battle Honours',
  },
  {
    id: 'name_your_weapon',
    name: 'Name Your Weapon',
    description: 'Consecrate a legendary weapon.',
    cost: 1,
    category: 'special',
    effect: 'One weapon gains +1 Damage',
    restrictions: 'CHARACTER units only',
  },
  {
    id: 'master_of_war',
    name: 'Master of War',
    description: 'Tactical genius.',
    cost: 2,
    category: 'special',
    effect: 'CHARACTER gains ability to issue one additional order per turn',
    restrictions: 'CHARACTER units only',
  },
];

/**
 * Get all requisitions
 */
export function getAllRequisitions(): Requisition[] {
  return [
    ...SUPPLY_REQUISITIONS,
    ...UNIT_REQUISITIONS,
    ...BATTLE_REQUISITIONS,
    ...SPECIAL_REQUISITIONS,
  ];
}

/**
 * Get requisitions by category
 */
export function getRequisitionsByCategory(category: Requisition['category']): Requisition[] {
  return getAllRequisitions().filter(r => r.category === category);
}

/**
 * Get a specific requisition by ID
 */
export function getRequisitionById(id: string): Requisition | undefined {
  return getAllRequisitions().find(r => r.id === id);
}

/**
 * Calculate RP earned from a battle
 * Standard: 1 RP per battle
 * Bonus: +1 RP if won
 */
export function calculateRPEarned(won: boolean): number {
  return won ? 2 : 1;
}

