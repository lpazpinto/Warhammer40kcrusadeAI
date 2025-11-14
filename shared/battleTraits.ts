/**
 * Battle Traits for Warhammer 40k Crusade
 * Traits can be earned through battles and requisitions
 */

export type BattleTraitType = 'positive' | 'negative';
export type BattleTraitCategory = 'combat' | 'leadership' | 'mobility' | 'resilience' | 'psychic';

export interface BattleTrait {
  id: string;
  name: string;
  type: BattleTraitType;
  category: BattleTraitCategory;
  description: string;
  effect: string;
  prerequisite?: string;
  factionSpecific?: string; // If set, only available to this faction
}

/**
 * Default Battle Traits (available to all factions)
 */
export const DEFAULT_BATTLE_TRAITS: BattleTrait[] = [
  // Positive Combat Traits
  {
    id: 'battle_hardened',
    name: 'Endurecido em Batalha',
    type: 'positive',
    category: 'combat',
    description: 'Esta unidade sobreviveu a inúmeras batalhas e aprendeu a lutar com maestria.',
    effect: '+1 para acertar em combate corpo a corpo',
    prerequisite: 'Sobreviver a 3 batalhas'
  },
  {
    id: 'marksman',
    name: 'Atirador de Elite',
    type: 'positive',
    category: 'combat',
    description: 'Os guerreiros desta unidade são mestres em precisão à distância.',
    effect: '+1 para acertar com armas de tiro',
    prerequisite: 'Destruir 5 unidades inimigas com armas de tiro'
  },
  {
    id: 'veteran_warriors',
    name: 'Guerreiros Veteranos',
    type: 'positive',
    category: 'combat',
    description: 'Veteranos de incontáveis conflitos, estes guerreiros são praticamente imparáveis.',
    effect: 'Re-rolar 1s para acertar',
    prerequisite: 'Atingir Rank Heroic (31+ XP)'
  },

  // Positive Leadership Traits
  {
    id: 'inspiring_presence',
    name: 'Presença Inspiradora',
    type: 'positive',
    category: 'leadership',
    description: 'A presença desta unidade inspira coragem nos aliados próximos.',
    effect: 'Unidades aliadas a 6" podem usar a Liderança desta unidade',
    prerequisite: 'Ser um PERSONAGEM com Leadership 8+'
  },
  {
    id: 'fearless',
    name: 'Destemido',
    type: 'positive',
    category: 'leadership',
    description: 'Esta unidade não conhece o medo e nunca recua.',
    effect: 'Imune a Battle-shock',
    prerequisite: 'Passar em 5 testes de Battle-shock'
  },

  // Positive Mobility Traits
  {
    id: 'swift_advance',
    name: 'Avanço Veloz',
    type: 'positive',
    category: 'mobility',
    description: 'Esta unidade se move com velocidade excepcional pelo campo de batalha.',
    effect: '+2" de Movimento',
    prerequisite: 'Capturar 3 objetivos em batalhas diferentes'
  },
  {
    id: 'master_flankers',
    name: 'Mestres do Flanco',
    type: 'positive',
    category: 'mobility',
    description: 'Especialistas em manobras de flanqueamento e infiltração.',
    effect: 'Pode fazer Advance e ainda atirar (com -1 para acertar)',
    prerequisite: 'Destruir unidade inimiga enquanto estava na zona de implantação inimiga'
  },

  // Positive Resilience Traits
  {
    id: 'iron_will',
    name: 'Vontade de Ferro',
    type: 'positive',
    category: 'resilience',
    description: 'A determinação desta unidade é inquebrantável.',
    effect: '+1 Toughness',
    prerequisite: 'Sobreviver a batalha com 50% ou menos de modelos restantes'
  },
  {
    id: 'blessed_armor',
    name: 'Armadura Abençoada',
    type: 'positive',
    category: 'resilience',
    description: 'A armadura desta unidade foi abençoada e oferece proteção excepcional.',
    effect: '+1 Save',
    prerequisite: 'Sobreviver a 10 ataques que causariam ferimentos'
  },

  // Positive Psychic Traits
  {
    id: 'psychic_mastery',
    name: 'Maestria Psíquica',
    type: 'positive',
    category: 'psychic',
    description: 'Este psyker dominou os poderes da Warp.',
    effect: '+1 para testes de manifesto de poderes psíquicos',
    prerequisite: 'Manifestar 5 poderes psíquicos com sucesso',
    factionSpecific: undefined // Available to all factions with psykers
  },

  // Negative Traits (Battle Scars)
  {
    id: 'shell_shocked',
    name: 'Traumatizado',
    type: 'negative',
    category: 'leadership',
    description: 'Os horrores da guerra deixaram marcas profundas nesta unidade.',
    effect: '-1 Leadership',
    prerequisite: 'Falhar em 3 testes de Battle-shock'
  },
  {
    id: 'malfunctioning_equipment',
    name: 'Equipamento Defeituoso',
    type: 'negative',
    category: 'combat',
    description: 'O equipamento desta unidade está danificado e não funciona adequadamente.',
    effect: '-1 para acertar com uma arma escolhida',
    prerequisite: 'Rolar três 1s consecutivos em testes de acerto'
  },
  {
    id: 'slow_recovery',
    name: 'Recuperação Lenta',
    type: 'negative',
    category: 'resilience',
    description: 'Ferimentos antigos ainda afligem esta unidade.',
    effect: '-1 Movement',
    prerequisite: 'Perder 50% ou mais dos modelos em uma batalha'
  }
];

/**
 * Faction-Specific Battle Traits Framework
 * Each faction can have unique traits that reflect their combat doctrine
 */
export const FACTION_BATTLE_TRAITS: Record<string, BattleTrait[]> = {
  // Astra Militarum specific traits
  'Astra Militarum': [
    {
      id: 'for_the_emperor',
      name: 'Pelo Imperador!',
      type: 'positive',
      category: 'leadership',
      description: 'A fé no Imperador sustenta esta unidade mesmo nos momentos mais sombrios.',
      effect: 'Re-rolar testes de Battle-shock falhados',
      factionSpecific: 'Astra Militarum'
    },
    {
      id: 'artillery_veterans',
      name: 'Veteranos de Artilharia',
      type: 'positive',
      category: 'combat',
      description: 'Esta unidade domina o uso de armas pesadas.',
      effect: '+1 para acertar com armas HEAVY quando não se moveu',
      prerequisite: 'Destruir 3 VEÍCULOS com armas HEAVY',
      factionSpecific: 'Astra Militarum'
    }
  ],

  // Space Marines specific traits
  'Space Marines': [
    {
      id: 'and_they_shall_know_no_fear',
      name: 'E Eles Não Conhecerão o Medo',
      type: 'positive',
      category: 'leadership',
      description: 'Space Marines são geneticamente modificados para não conhecer o medo.',
      effect: 'Automaticamente passa em testes de Battle-shock',
      factionSpecific: 'Space Marines'
    },
    {
      id: 'tactical_doctrine',
      name: 'Doutrina Tática',
      type: 'positive',
      category: 'combat',
      description: 'Mestres da guerra adaptativa.',
      effect: '+1 AP em armas RAPID FIRE na metade do alcance',
      prerequisite: 'Destruir 5 unidades inimigas com armas RAPID FIRE',
      factionSpecific: 'Space Marines'
    }
  ],

  // Chaos Space Marines specific traits
  'Chaos Space Marines': [
    {
      id: 'dark_blessing',
      name: 'Bênção Sombria',
      type: 'positive',
      category: 'resilience',
      description: 'Os Deuses do Caos protegem seus servos.',
      effect: '5+ Feel No Pain',
      prerequisite: 'Destruir 3 unidades inimigas em combate corpo a corpo',
      factionSpecific: 'Chaos Space Marines'
    },
    {
      id: 'warp_touched',
      name: 'Tocado pela Warp',
      type: 'positive',
      category: 'psychic',
      description: 'A energia da Warp flui através desta unidade.',
      effect: '+1 Strength em combate corpo a corpo',
      prerequisite: 'Estar a 6" de um objetivo no final de 3 batalhas',
      factionSpecific: 'Chaos Space Marines'
    }
  ],

  // Placeholder for other factions (to be expanded)
  'Orks': [],
  'Necrons': [],
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
  'Grey Knights': []
};

/**
 * Get all available traits for a specific faction
 */
export function getTraitsForFaction(faction: string): BattleTrait[] {
  const factionTraits = FACTION_BATTLE_TRAITS[faction] || [];
  return [...DEFAULT_BATTLE_TRAITS, ...factionTraits];
}

/**
 * Get trait by ID
 */
export function getTraitById(id: string, faction?: string): BattleTrait | undefined {
  if (faction) {
    const allTraits = getTraitsForFaction(faction);
    return allTraits.find(t => t.id === id);
  }
  return DEFAULT_BATTLE_TRAITS.find(t => t.id === id);
}

/**
 * Get traits by category
 */
export function getTraitsByCategory(category: BattleTraitCategory, faction?: string): BattleTrait[] {
  const traits = faction ? getTraitsForFaction(faction) : DEFAULT_BATTLE_TRAITS;
  return traits.filter(t => t.category === category);
}

/**
 * Get positive traits only
 */
export function getPositiveTraits(faction?: string): BattleTrait[] {
  const traits = faction ? getTraitsForFaction(faction) : DEFAULT_BATTLE_TRAITS;
  return traits.filter(t => t.type === 'positive');
}

/**
 * Get negative traits (battle scars) only
 */
export function getNegativeTraits(faction?: string): BattleTrait[] {
  const traits = faction ? getTraitsForFaction(faction) : DEFAULT_BATTLE_TRAITS;
  return traits.filter(t => t.type === 'negative');
}
