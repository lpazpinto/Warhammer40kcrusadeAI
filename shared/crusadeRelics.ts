/**
 * Crusade Relics for Warhammer 40k Crusade
 * Relics are powerful artifacts that can be equipped to CHARACTER units
 */

export type RelicCategory = 'weapon' | 'armor' | 'artifact' | 'psychic' | 'wargear';
export type RelicRarity = 'common' | 'rare' | 'legendary';

export interface CrusadeRelic {
  id: string;
  name: string;
  category: RelicCategory;
  rarity: RelicRarity;
  rpCost: number; // Requisition Points cost to acquire
  description: string;
  effect: string;
  restrictions?: string; // e.g., "INFANTRY only", "PSYKER only"
  prerequisite?: string; // e.g., "Unit must have 3+ battles"
  factionSpecific?: string; // If set, only available to this faction
}

/**
 * Default Crusade Relics (available to all factions)
 */
export const DEFAULT_CRUSADE_RELICS: CrusadeRelic[] = [
  // Common Weapon Relics
  {
    id: 'master_crafted_weapon',
    name: 'Arma Artesanal',
    category: 'weapon',
    rarity: 'common',
    rpCost: 1,
    description: 'Uma arma perfeitamente balanceada e afiada por mestres artesãos.',
    effect: 'Uma arma à escolha ganha +1 Damage',
    restrictions: 'Apenas CHARACTER'
  },
  {
    id: 'relic_blade',
    name: 'Lâmina Relíquia',
    category: 'weapon',
    rarity: 'common',
    rpCost: 1,
    description: 'Uma antiga lâmina de poder com séculos de história.',
    effect: 'Substitui arma corpo a corpo: S+2, AP-3, D2',
    restrictions: 'Apenas CHARACTER com arma corpo a corpo'
  },
  {
    id: 'ancient_bolter',
    name: 'Bolter Ancestral',
    category: 'weapon',
    rarity: 'common',
    rpCost: 1,
    description: 'Um bolter de design antigo, mas extremamente confiável.',
    effect: 'Bolter ganha +6" alcance e +1 AP',
    restrictions: 'Apenas CHARACTER com bolter'
  },

  // Common Armor Relics
  {
    id: 'blessed_armor',
    name: 'Armadura Abençoada',
    category: 'armor',
    rarity: 'common',
    rpCost: 1,
    description: 'Armadura ungida com óleos sagrados e protegida por runas de proteção.',
    effect: '+1 Save (máximo 2+)',
    restrictions: 'Apenas CHARACTER'
  },
  {
    id: 'iron_halo',
    name: 'Halo de Ferro',
    category: 'armor',
    rarity: 'common',
    rpCost: 1,
    description: 'Um campo de força pessoal que protege contra ataques mortais.',
    effect: '4+ Invulnerable Save',
    restrictions: 'Apenas CHARACTER sem Invulnerable Save'
  },

  // Common Artifact Relics
  {
    id: 'adamantine_mantle',
    name: 'Manto Adamantino',
    category: 'artifact',
    rarity: 'common',
    rpCost: 1,
    description: 'Um manto tecido com fios de adamantium que absorve impactos.',
    effect: '5+ Feel No Pain',
    restrictions: 'Apenas CHARACTER'
  },
  {
    id: 'auspex',
    name: 'Auspex Avançado',
    category: 'artifact',
    rarity: 'common',
    rpCost: 1,
    description: 'Dispositivo de escaneamento que revela inimigos ocultos.',
    effect: 'Unidades inimigas a 12" não ganham benefício de cover contra ataques desta unidade',
    restrictions: 'Apenas CHARACTER'
  },

  // Rare Weapon Relics
  {
    id: 'thunder_hammer',
    name: 'Martelo Trovejante Relíquia',
    category: 'weapon',
    rarity: 'rare',
    rpCost: 2,
    description: 'Um martelo de poder ancestral que esmaga inimigos com força devastadora.',
    effect: 'Substitui arma corpo a corpo: Sx2, AP-3, D3, -1 para acertar',
    restrictions: 'Apenas CHARACTER',
    prerequisite: 'Unidade deve ter participado de 3+ batalhas'
  },
  {
    id: 'plasma_pistol_relic',
    name: 'Pistola de Plasma Relíquia',
    category: 'weapon',
    rarity: 'rare',
    rpCost: 2,
    description: 'Uma pistola de plasma de design antigo que nunca superaquece.',
    effect: 'Pistola de plasma não causa dano ao usuário em 1s naturais',
    restrictions: 'Apenas CHARACTER com pistola de plasma',
    prerequisite: 'Unidade deve ter participado de 3+ batalhas'
  },

  // Rare Armor Relics
  {
    id: 'rosarius',
    name: 'Rosarius',
    category: 'armor',
    rarity: 'rare',
    rpCost: 2,
    description: 'Um campo de conversão sagrado que protege o portador.',
    effect: '3+ Invulnerable Save',
    restrictions: 'Apenas CHARACTER',
    prerequisite: 'Unidade deve ter participado de 5+ batalhas'
  },
  {
    id: 'refractor_field',
    name: 'Campo Refrator',
    category: 'armor',
    rarity: 'rare',
    rpCost: 2,
    description: 'Um campo de energia que desvia projéteis e lâminas.',
    effect: '4+ Invulnerable Save e re-rolar saves de 1',
    restrictions: 'Apenas CHARACTER',
    prerequisite: 'Unidade deve ter participado de 5+ batalhas'
  },

  // Rare Artifact Relics
  {
    id: 'banner_of_glory',
    name: 'Estandarte da Glória',
    category: 'artifact',
    rarity: 'rare',
    rpCost: 2,
    description: 'Um estandarte de batalha que inspira tropas aliadas.',
    effect: 'Unidades aliadas a 6" ganham +1 Leadership',
    restrictions: 'Apenas CHARACTER',
    prerequisite: 'Unidade deve ter participado de 3+ batalhas'
  },
  {
    id: 'tactical_cogitator',
    name: 'Cogitador Tático',
    category: 'artifact',
    rarity: 'rare',
    rpCost: 2,
    description: 'Um dispositivo que analisa o campo de batalha e fornece dados táticos.',
    effect: 'Uma vez por batalha, pode re-rolar um único dado de ataque, ferimento ou save',
    restrictions: 'Apenas CHARACTER',
    prerequisite: 'Unidade deve ter participado de 3+ batalhas'
  },

  // Legendary Weapon Relics
  {
    id: 'sword_of_heroes',
    name: 'Espada dos Heróis',
    category: 'weapon',
    rarity: 'legendary',
    rpCost: 3,
    description: 'Uma lâmina lendária empunhada por heróis de eras passadas.',
    effect: 'Substitui arma corpo a corpo: S+3, AP-4, D3, re-rolar ferimentos',
    restrictions: 'Apenas CHARACTER',
    prerequisite: 'Unidade deve ter atingido rank Heroic (31+ XP)'
  },
  {
    id: 'volkite_charger_relic',
    name: 'Carregador Volkite Relíquia',
    category: 'weapon',
    rarity: 'legendary',
    rpCost: 3,
    description: 'Uma arma de raios volkite da Era das Trevas da Tecnologia.',
    effect: 'Range 18", Assault 3, S5, AP-2, D2, ferimentos de 6+ causam mortal wound adicional',
    restrictions: 'Apenas CHARACTER',
    prerequisite: 'Unidade deve ter atingido rank Heroic (31+ XP)'
  },

  // Legendary Armor Relics
  {
    id: 'artificer_armor',
    name: 'Armadura de Artífice',
    category: 'armor',
    rarity: 'legendary',
    rpCost: 3,
    description: 'Uma obra-prima de armadura criada por mestres artesãos.',
    effect: '2+ Save e 5+ Invulnerable Save',
    restrictions: 'Apenas CHARACTER',
    prerequisite: 'Unidade deve ter atingido rank Heroic (31+ XP)'
  },

  // Legendary Artifact Relics
  {
    id: 'emperors_blessing',
    name: 'Bênção do Imperador',
    category: 'artifact',
    rarity: 'legendary',
    rpCost: 3,
    description: 'Um artefato sagrado que carrega a bênção do Imperador.',
    effect: '6+ Feel No Pain e imunidade a Battle-shock para unidades aliadas a 6"',
    restrictions: 'Apenas CHARACTER',
    prerequisite: 'Unidade deve ter atingido rank Legendary (51+ XP)'
  }
];

/**
 * Faction-Specific Crusade Relics Framework
 * Each faction can have unique relics that reflect their culture and technology
 */
export const FACTION_CRUSADE_RELICS: Record<string, CrusadeRelic[]> = {
  // Astra Militarum specific relics
  'Astra Militarum': [
    {
      id: 'cadian_honor_blade',
      name: 'Lâmina de Honra Cadiana',
      category: 'weapon',
      rarity: 'rare',
      rpCost: 2,
      description: 'Uma espada cerimonial de Cadia, agora um símbolo de resistência.',
      effect: 'Arma corpo a corpo: S+1, AP-2, D2. Re-rolar acertos contra CHAOS',
      restrictions: 'Apenas CHARACTER Astra Militarum',
      factionSpecific: 'Astra Militarum'
    },
    {
      id: 'kurovs_aquila',
      name: 'Aquila de Kurov',
      category: 'artifact',
      rarity: 'legendary',
      rpCost: 3,
      description: 'Um estandarte sagrado que inspira coragem inabalável.',
      effect: 'Unidades Astra Militarum a 12" automaticamente passam em testes de Battle-shock',
      restrictions: 'Apenas CHARACTER Astra Militarum',
      prerequisite: 'Rank Heroic (31+ XP)',
      factionSpecific: 'Astra Militarum'
    }
  ],

  // Space Marines specific relics
  'Space Marines': [
    {
      id: 'armor_of_contempt',
      name: 'Armadura do Desprezo',
      category: 'armor',
      rarity: 'rare',
      rpCost: 2,
      description: 'Armadura forjada com ódio puro contra os inimigos da humanidade.',
      effect: '+1 Save e ignora AP-1',
      restrictions: 'Apenas CHARACTER Space Marines',
      factionSpecific: 'Space Marines'
    },
    {
      id: 'primarchs_wrath',
      name: 'Ira do Primarca',
      category: 'weapon',
      rarity: 'legendary',
      rpCost: 3,
      description: 'Um bolter lendário que pertenceu a um dos Primarcas.',
      effect: 'Range 24", Assault 4, S5, AP-2, D2, re-rolar todos os acertos',
      restrictions: 'Apenas CHARACTER Space Marines',
      prerequisite: 'Rank Legendary (51+ XP)',
      factionSpecific: 'Space Marines'
    }
  ],

  // Chaos Space Marines specific relics
  'Chaos Space Marines': [
    {
      id: 'black_mace',
      name: 'Maça Negra',
      category: 'weapon',
      rarity: 'rare',
      rpCost: 2,
      description: 'Uma arma corrompida que drena a força vital dos inimigos.',
      effect: 'Arma corpo a corpo: Sx2, AP-3, D3. Cada ferimento não salvo cura 1 wound',
      restrictions: 'Apenas CHARACTER Chaos Space Marines',
      factionSpecific: 'Chaos Space Marines'
    },
    {
      id: 'eye_of_night',
      name: 'Olho da Noite',
      category: 'artifact',
      rarity: 'legendary',
      rpCost: 3,
      description: 'Um artefato sombrio que concede visões do futuro.',
      effect: 'Uma vez por turno, pode forçar inimigo a re-rolar um teste bem-sucedido',
      restrictions: 'Apenas CHARACTER Chaos Space Marines',
      prerequisite: 'Rank Heroic (31+ XP)',
      factionSpecific: 'Chaos Space Marines'
    }
  ],

  // Necrons specific relics
  'Necrons': [
    {
      id: 'voidreaper',
      name: 'Ceifador do Vazio',
      category: 'weapon',
      rarity: 'legendary',
      rpCost: 3,
      description: 'Uma foice de fase que rasga a realidade.',
      effect: 'Arma corpo a corpo: S+2, AP-4, D3, ignora Invulnerable Saves',
      restrictions: 'Apenas CHARACTER Necrons',
      prerequisite: 'Rank Legendary (51+ XP)',
      factionSpecific: 'Necrons'
    }
  ],

  // Orks specific relics
  'Orks': [
    {
      id: 'da_killa_klaw',
      name: 'Garra Matadora',
      category: 'weapon',
      rarity: 'rare',
      rpCost: 2,
      description: 'Uma garra de poder orka massiva e brutal.',
      effect: 'Arma corpo a corpo: Sx2, AP-3, D3, +1 ataque',
      restrictions: 'Apenas CHARACTER Orks',
      factionSpecific: 'Orks'
    }
  ],

  // Placeholder for other factions (to be expanded)
  'Tyranids': [],
  'Eldar': [],
  'Tau Empire': [],
  'Dark Eldar': [],
  'Adeptus Mechanicus': [],
  'Death Guard': [],
  'Thousand Sons': [],
  'World Eaters': [],
  'Genestealer Cults': [],
  'Imperial Knights': [],
  'Chaos Knights': [],
  'Custodes': [],
  'Grey Knights': [],
  'Adepta Sororitas': [],
  'Leagues of Votann': []
};

/**
 * Get all available relics for a specific faction
 */
export function getRelicsForFaction(faction: string): CrusadeRelic[] {
  const factionRelics = FACTION_CRUSADE_RELICS[faction] || [];
  return [...DEFAULT_CRUSADE_RELICS, ...factionRelics];
}

/**
 * Get relic by ID
 */
export function getRelicById(id: string, faction?: string): CrusadeRelic | undefined {
  if (faction) {
    const allRelics = getRelicsForFaction(faction);
    return allRelics.find(r => r.id === id);
  }
  return DEFAULT_CRUSADE_RELICS.find(r => r.id === id);
}

/**
 * Get relics by category
 */
export function getRelicsByCategory(category: RelicCategory, faction?: string): CrusadeRelic[] {
  const relics = faction ? getRelicsForFaction(faction) : DEFAULT_CRUSADE_RELICS;
  return relics.filter(r => r.category === category);
}

/**
 * Get relics by rarity
 */
export function getRelicsByRarity(rarity: RelicRarity, faction?: string): CrusadeRelic[] {
  const relics = faction ? getRelicsForFaction(faction) : DEFAULT_CRUSADE_RELICS;
  return relics.filter(r => r.rarity === rarity);
}

/**
 * Get relics by RP cost
 */
export function getRelicsByRPCost(maxRP: number, faction?: string): CrusadeRelic[] {
  const relics = faction ? getRelicsForFaction(faction) : DEFAULT_CRUSADE_RELICS;
  return relics.filter(r => r.rpCost <= maxRP);
}

/**
 * Get relics available for a unit based on its characteristics
 */
export function getAvailableRelicsForUnit(
  faction: string,
  isCharacter: boolean,
  currentRP: number,
  unitXP: number,
  hasInvulnSave: boolean = false
): CrusadeRelic[] {
  if (!isCharacter) return [];

  const allRelics = getRelicsForFaction(faction);
  
  return allRelics.filter(relic => {
    // Check RP cost
    if (relic.rpCost > currentRP) return false;

    // Check prerequisite XP
    if (relic.prerequisite) {
      if (relic.prerequisite.includes('Heroic') && unitXP < 31) return false;
      if (relic.prerequisite.includes('Legendary') && unitXP < 51) return false;
      if (relic.prerequisite.includes('3+ batalhas') && unitXP < 3) return false;
      if (relic.prerequisite.includes('5+ batalhas') && unitXP < 5) return false;
    }

    // Check invuln save restriction
    if (relic.restrictions?.includes('sem Invulnerable Save') && hasInvulnSave) return false;

    return true;
  });
}
