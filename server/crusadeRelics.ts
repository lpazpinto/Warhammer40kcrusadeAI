/**
 * Crusade Relics Database
 * Based on official Warhammer 40k Crusade rules
 * Relics can only be given to CHARACTER units
 * Maximum 3 relics per army
 */

export interface CrusadeRelic {
  id: string;
  name: string;
  description: string;
  effect: string;
  faction?: string; // undefined = generic (available to all)
  type: 'weapon' | 'armor' | 'artifact' | 'wargear';
}

/**
 * Generic Crusade Relics (available to all factions)
 */
export const GENERIC_RELICS: CrusadeRelic[] = [
  {
    id: 'blade_of_heroes',
    name: 'Blade of Heroes',
    description: 'An ancient weapon of legendary power.',
    effect: 'Melee weapon gains +1 Strength and +1 Damage',
    type: 'weapon',
  },
  {
    id: 'armor_of_ages',
    name: 'Armour of Ages',
    description: 'Impenetrable protection forged in ancient times.',
    effect: '+1 to armour saves and 5+ invulnerable save',
    type: 'armor',
  },
  {
    id: 'talisman_of_warding',
    name: 'Talisman of Warding',
    description: 'Protective charm against psychic powers.',
    effect: 'Deny the Witch on 4+ and +1 to Deny tests',
    type: 'artifact',
  },
  {
    id: 'banner_of_glory',
    name: 'Banner of Glory',
    description: 'Inspiring standard that rallies nearby troops.',
    effect: 'Friendly units within 6" gain +1 to Leadership',
    type: 'wargear',
  },
];

/**
 * Space Marines Relics
 */
export const SPACE_MARINES_RELICS: CrusadeRelic[] = [
  {
    id: 'sm_relic_blade',
    name: 'Relic Blade of the Chapter',
    description: 'Master-crafted blade passed down through generations.',
    effect: 'Power sword becomes S+2, AP-3, D3',
    faction: 'Space Marines',
    type: 'weapon',
  },
  {
    id: 'sm_artificer_armor',
    name: 'Artificer Armour',
    description: 'Perfectly crafted power armour.',
    effect: '2+ armour save',
    faction: 'Space Marines',
    type: 'armor',
  },
  {
    id: 'sm_iron_halo',
    name: 'Iron Halo',
    description: 'Sacred icon providing divine protection.',
    effect: '4+ invulnerable save',
    faction: 'Space Marines',
    type: 'wargear',
  },
];

/**
 * Chaos Space Marines Relics
 */
export const CHAOS_SPACE_MARINES_RELICS: CrusadeRelic[] = [
  {
    id: 'csm_daemon_weapon',
    name: 'Daemon Weapon',
    description: 'Blade possessed by a warp entity.',
    effect: '+2 Attacks, +1 Strength, but roll D6 each turn - on 1, suffer D3 mortal wounds',
    faction: 'Chaos Space Marines',
    type: 'weapon',
  },
  {
    id: 'csm_chaos_familiar',
    name: 'Chaos Familiar',
    description: 'Warp-spawned creature that aids its master.',
    effect: 'Re-roll one failed psychic test per turn',
    faction: 'Chaos Space Marines',
    type: 'artifact',
  },
  {
    id: 'csm_black_mace',
    name: 'Black Mace',
    description: 'Weapon that drains the life force of enemies.',
    effect: 'Melee weapon becomes S+3, AP-2, D3, and heals D3 wounds on kill',
    faction: 'Chaos Space Marines',
    type: 'weapon',
  },
];

/**
 * Adepta Sororitas Relics
 */
export const ADEPTA_SORORITAS_RELICS: CrusadeRelic[] = [
  {
    id: 'as_blessed_blade',
    name: 'Blessed Blade',
    description: 'Sanctified weapon blessed by the Ecclesiarchy.',
    effect: 'Power sword gains +1 Damage and re-roll wounds vs CHAOS',
    faction: 'Adepta Sororitas',
    type: 'weapon',
  },
  {
    id: 'as_mantle_of_ophelia',
    name: 'Mantle of Ophelia',
    description: 'Sacred cloak of a martyred saint.',
    effect: '4+ invulnerable save and ignore mortal wounds on 5+',
    faction: 'Adepta Sororitas',
    type: 'armor',
  },
  {
    id: 'as_book_of_martyrs',
    name: 'Book of Martyrs',
    description: 'Holy tome containing the deeds of saints.',
    effect: 'Once per battle, use one Miracle dice without spending it',
    faction: 'Adepta Sororitas',
    type: 'artifact',
  },
];

/**
 * Astra Militarum Relics
 */
export const ASTRA_MILITARUM_RELICS: CrusadeRelic[] = [
  {
    id: 'am_power_sword_of_the_high_marshal',
    name: 'Power Sword of the High Marshal',
    description: 'Ceremonial blade of a legendary commander.',
    effect: 'Power sword becomes S+2, AP-3, D2',
    faction: 'Astra Militarum',
    type: 'weapon',
  },
  {
    id: 'am_kurovs_aquila',
    name: "Kurov's Aquila",
    description: 'Ancient medallion of tactical genius.',
    effect: 'Regain 1 CP on a 5+ when opponent uses a Stratagem',
    faction: 'Astra Militarum',
    type: 'artifact',
  },
  {
    id: 'am_laurels_of_command',
    name: 'Laurels of Command',
    description: 'Symbol of supreme authority.',
    effect: 'Can issue one additional Order per turn',
    faction: 'Astra Militarum',
    type: 'wargear',
  },
];

/**
 * Death Guard Relics
 */
export const DEATH_GUARD_RELICS: CrusadeRelic[] = [
  {
    id: 'dg_plaguereaper',
    name: 'Plaguereaper',
    description: 'Scythe dripping with virulent toxins.',
    effect: 'Plague weapon gains +1 Damage and causes additional mortal wound on 6 to wound',
    faction: 'Death Guard',
    type: 'weapon',
  },
  {
    id: 'dg_suppurating_plate',
    name: 'Suppurating Plate',
    description: 'Rotting armour that regenerates.',
    effect: '4+ invulnerable save and regain 1 wound at start of each turn',
    faction: 'Death Guard',
    type: 'armor',
  },
];

/**
 * Get all Crusade Relics for a specific faction
 */
export function getCrusadeRelicsForFaction(faction: string): CrusadeRelic[] {
  const factionRelics: Record<string, CrusadeRelic[]> = {
    'Space Marines': SPACE_MARINES_RELICS,
    'Chaos Space Marines': CHAOS_SPACE_MARINES_RELICS,
    'Adepta Sororitas': ADEPTA_SORORITAS_RELICS,
    'Astra Militarum': ASTRA_MILITARUM_RELICS,
    'Imperial Guard': ASTRA_MILITARUM_RELICS,
    'Death Guard': DEATH_GUARD_RELICS,
  };

  const specific = factionRelics[faction] || [];
  return [...GENERIC_RELICS, ...specific];
}

/**
 * Get a specific Crusade Relic by ID
 */
export function getCrusadeRelicById(id: string): CrusadeRelic | undefined {
  const allRelics = [
    ...GENERIC_RELICS,
    ...SPACE_MARINES_RELICS,
    ...CHAOS_SPACE_MARINES_RELICS,
    ...ADEPTA_SORORITAS_RELICS,
    ...ASTRA_MILITARUM_RELICS,
    ...DEATH_GUARD_RELICS,
  ];
  
  return allRelics.find(r => r.id === id);
}

/**
 * Check if a player can add more relics (max 3 per army)
 */
export function canAddRelic(currentRelicsCount: number): boolean {
  return currentRelicsCount < 3;
}

