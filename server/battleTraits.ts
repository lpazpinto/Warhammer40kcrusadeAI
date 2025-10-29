/**
 * Battle Traits Database
 * Faction-specific special abilities and characteristics
 * Based on official Warhammer 40k Crusade rules
 */

export interface BattleTrait {
  id: string;
  name: string;
  description: string;
  effect: string;
  faction: string;
  unitType?: string[]; // Specific unit types
}

/**
 * Space Marines Battle Traits
 */
export const SPACE_MARINES_TRAITS: BattleTrait[] = [
  {
    id: 'sm_oath_of_moment',
    name: 'Oath of Moment',
    description: 'Sworn to destroy a specific enemy.',
    effect: '+1 to hit and wound rolls against chosen enemy unit',
    faction: 'Space Marines',
  },
  {
    id: 'sm_tactical_doctrine',
    name: 'Tactical Doctrine',
    description: 'Master of tactical warfare.',
    effect: 'Improve AP of ranged weapons by 1 in Tactical Doctrine',
    faction: 'Space Marines',
  },
  {
    id: 'sm_assault_doctrine',
    name: 'Assault Doctrine',
    description: 'Specialized in close combat.',
    effect: 'Improve AP of melee weapons by 1 in Assault Doctrine',
    faction: 'Space Marines',
  },
];

/**
 * Chaos Space Marines Battle Traits
 */
export const CHAOS_SPACE_MARINES_TRAITS: BattleTrait[] = [
  {
    id: 'csm_mark_of_khorne',
    name: 'Mark of Khorne',
    description: 'Blessed by the Blood God.',
    effect: '+1 Attack characteristic',
    faction: 'Chaos Space Marines',
  },
  {
    id: 'csm_mark_of_tzeentch',
    name: 'Mark of Tzeentch',
    description: 'Blessed by the Changer of Ways.',
    effect: '5+ invulnerable save',
    faction: 'Chaos Space Marines',
  },
  {
    id: 'csm_mark_of_nurgle',
    name: 'Mark of Nurgle',
    description: 'Blessed by the Plague God.',
    effect: '+1 to Toughness characteristic',
    faction: 'Chaos Space Marines',
  },
  {
    id: 'csm_mark_of_slaanesh',
    name: 'Mark of Slaanesh',
    description: 'Blessed by the Dark Prince.',
    effect: '+1 to Move and Advance characteristic',
    faction: 'Chaos Space Marines',
  },
];

/**
 * Adepta Sororitas Battle Traits
 */
export const ADEPTA_SORORITAS_TRAITS: BattleTrait[] = [
  {
    id: 'as_sacred_rites',
    name: 'Sacred Rites',
    description: 'Empowered by faith.',
    effect: 'Choose one Sacred Rite at start of battle',
    faction: 'Adepta Sororitas',
  },
  {
    id: 'as_miracle_dice',
    name: 'Miracle Dice',
    description: 'Faith rewards the faithful.',
    effect: 'Gain 1 Miracle dice per battle round',
    faction: 'Adepta Sororitas',
  },
  {
    id: 'as_zealot',
    name: 'Zealot',
    description: 'Fanatical devotion.',
    effect: 'Re-roll failed charge rolls',
    faction: 'Adepta Sororitas',
  },
];

/**
 * Astra Militarum Battle Traits
 */
export const ASTRA_MILITARUM_TRAITS: BattleTrait[] = [
  {
    id: 'am_regimental_doctrine',
    name: 'Regimental Doctrine',
    description: 'Trained in specific combat style.',
    effect: 'Choose one Regimental Doctrine',
    faction: 'Astra Militarum',
  },
  {
    id: 'am_orders',
    name: 'Voice of Command',
    description: 'Can issue orders to nearby units.',
    effect: 'Can issue one additional Order per turn',
    faction: 'Astra Militarum',
    unitType: ['CHARACTER'],
  },
  {
    id: 'am_combined_arms',
    name: 'Combined Arms',
    description: 'Coordinated warfare.',
    effect: '+1 to hit when within 6" of a friendly VEHICLE',
    faction: 'Astra Militarum',
    unitType: ['INFANTRY'],
  },
];

/**
 * Death Guard Battle Traits
 */
export const DEATH_GUARD_TRAITS: BattleTrait[] = [
  {
    id: 'dg_disgustingly_resilient',
    name: 'Disgustingly Resilient',
    description: 'Unnaturally tough.',
    effect: '5+ Feel No Pain',
    faction: 'Death Guard',
  },
  {
    id: 'dg_contagions',
    name: 'Contagions of Nurgle',
    description: 'Spreads disease.',
    effect: 'Enemy units within 6" suffer -1 Toughness',
    faction: 'Death Guard',
  },
];

/**
 * Chaos Knights Battle Traits
 */
export const CHAOS_KNIGHTS_TRAITS: BattleTrait[] = [
  {
    id: 'ck_dread_household',
    name: 'Dread Household',
    description: 'Terrifying presence.',
    effect: 'Enemy units within 12" suffer -1 to Leadership',
    faction: 'Chaos Knights',
  },
  {
    id: 'ck_infernal_quest',
    name: 'Infernal Quest',
    description: 'Seeking dark power.',
    effect: '+1 to wound rolls in melee',
    faction: 'Chaos Knights',
  },
];

/**
 * Drukhari Battle Traits
 */
export const DRUKHARI_TRAITS: BattleTrait[] = [
  {
    id: 'drukhari_power_from_pain',
    name: 'Power from Pain',
    description: 'Grows stronger from suffering.',
    effect: 'Gain cumulative bonuses each battle round',
    faction: 'Drukhari',
  },
  {
    id: 'drukhari_lightning_assault',
    name: 'Lightning Assault',
    description: 'Swift raiders.',
    effect: '+2" to Move characteristic',
    faction: 'Drukhari',
  },
];

/**
 * Get all Battle Traits for a specific faction
 */
export function getBattleTraitsForFaction(faction: string): BattleTrait[] {
  const factionTraits: Record<string, BattleTrait[]> = {
    'Space Marines': SPACE_MARINES_TRAITS,
    'Chaos Space Marines': CHAOS_SPACE_MARINES_TRAITS,
    'Adepta Sororitas': ADEPTA_SORORITAS_TRAITS,
    'Astra Militarum': ASTRA_MILITARUM_TRAITS,
    'Imperial Guard': ASTRA_MILITARUM_TRAITS,
    'Death Guard': DEATH_GUARD_TRAITS,
    'Chaos Knights': CHAOS_KNIGHTS_TRAITS,
    'Drukhari': DRUKHARI_TRAITS,
  };

  return factionTraits[faction] || [];
}

/**
 * Get Battle Traits filtered by unit type
 */
export function getBattleTraitsForUnit(faction: string, unitType?: string): BattleTrait[] {
  const allTraits = getBattleTraitsForFaction(faction);
  
  if (!unitType) {
    return allTraits;
  }

  return allTraits.filter(trait => {
    // If trait has no unitType restriction, it's available to all
    if (!trait.unitType || trait.unitType.length === 0) {
      return true;
    }
    // Check if unit type matches
    return trait.unitType.includes(unitType);
  });
}

/**
 * Get a specific Battle Trait by ID
 */
export function getBattleTraitById(id: string): BattleTrait | undefined {
  const allTraits = [
    ...SPACE_MARINES_TRAITS,
    ...CHAOS_SPACE_MARINES_TRAITS,
    ...ADEPTA_SORORITAS_TRAITS,
    ...ASTRA_MILITARUM_TRAITS,
    ...DEATH_GUARD_TRAITS,
    ...CHAOS_KNIGHTS_TRAITS,
    ...DRUKHARI_TRAITS,
  ];
  
  return allTraits.find(t => t.id === id);
}

