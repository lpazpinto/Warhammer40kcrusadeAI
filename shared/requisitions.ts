/**
 * Requisitions System
 * Players can spend Requisition Points (RP) to purchase upgrades
 * Maximum 10 RP per Crusade force
 * Each battle grants +1 RP (win, lose, or draw)
 */

export interface Requisition {
  id: string;
  name: string;
  cost: number | string; // Can be "1-3RP" for variable cost
  description: string;
  timing: 'anytime' | 'before_battle' | 'after_battle';
  restrictions?: string;
}

export const REQUISITIONS: Requisition[] = [
  {
    id: 'increase_supply_limit',
    name: 'Aumentar Limite de Suprimento',
    cost: 1,
    description: 'Compre a qualquer momento. Aumente o Limite de Suprimento da sua força de Cruzada em 200 pontos.',
    timing: 'anytime',
  },
  {
    id: 'rearm_and_resupply',
    name: 'Rearmar e Reabastecer',
    cost: 1,
    description: 'Compre antes de uma batalha. Selecione uma unidade da sua força de Cruzada. Você pode trocar quaisquer opções de armas que os modelos dessa unidade estejam equipados conforme descrito na ficha de dados da unidade. Se você der uma arma que é uma Relíquia ou foi aprimorada por Modificações de Arma, essa Relíquia de Cruzada ou Modificações de Arma serão perdidas. Recalcule o valor de pontos da unidade como resultado dessas mudanças e atualize seu cartão de Cruzada. Você não pode fazer mudanças que façam você exceder seu Limite de Suprimento.',
    timing: 'before_battle',
  },
  {
    id: 'repair_and_recuperate',
    name: 'Reparar e Recuperar',
    cost: '1-5RP',
    description: 'Compre após uma batalha. Selecione uma unidade da sua força de Cruzada que tenha uma ou mais Cicatrizes de Batalha. Selecione uma das Cicatrizes de Batalha dessa unidade e remova-a do cartão de Cruzada (para cada Cicatriz de Batalha removida, o total de pontos de Cruzada da unidade aumentará em 1). Esta Requisição custa 1RP mais 1 RP adicional para cada Honra de Batalha que a unidade possui (até um máximo de 5RP).',
    timing: 'after_battle',
    restrictions: 'A unidade deve ter pelo menos uma Cicatriz de Batalha',
  },
  {
    id: 'fresh_recruits',
    name: 'Recrutas Frescos',
    cost: '1-4RP',
    description: 'Compre a qualquer momento. Selecione uma unidade da sua força de Cruzada. Você pode adicionar modelos adicionais a essa unidade, até o máximo listado na ficha de dados da unidade. Recalcule o valor de pontos da unidade como resultado dessas mudanças e atualize seu cartão de Cruzada. Você não pode fazer mudanças que façam você exceder seu Limite de Suprimento. Esta Requisição custa 1RP mais 1 RP adicional para cada 2 Honras de Batalha que a unidade possui, arredondando para cima (até um máximo de 4RP).',
    timing: 'anytime',
    restrictions: 'Não pode exceder o tamanho máximo da unidade ou Limite de Suprimento',
  },
  {
    id: 'renowned_heroes',
    name: 'Heróis Renomados',
    cost: '1-3RP',
    description: 'Quando você inicia uma força de Cruzada, pode comprar esta Requisição para adicionar uma unidade PERSONAGEM à sua força de Cruzada. Depois disso, você pode comprar esta Requisição quando uma unidade da sua força de Cruzada ganhar uma patente. Em ambos os casos, você não pode selecionar uma unidade HERÓI ÉPICO ou uma unidade que já tenha as Cicatrizes de Batalha Desonrado ou Marca da Vergonha. Você pode selecionar um Aprimoramento ao qual essa unidade tenha acesso (se usar esta Requisição quando a unidade ganhar uma patente, isso é uma Honra de Batalha). Ao reunir seu exército para uma batalha, essa unidade pode ter este Aprimoramento mesmo que você ainda não tenha selecionado regras de Destacamento. Se o Aprimoramento selecionado substituir uma arma que é uma Relíquia de Cruzada ou foi aprimorada por Modificações de Arma, essa Relíquia ou Modificações serão perdidas. Recalcule o valor de pontos da unidade como resultado de ganhar este Aprimoramento e atualize seu cartão de Cruzada. Esta Requisição custa 1RP mais 1 RP adicional para cada outro Aprimoramento que sua força de Cruzada contenha (até um máximo de 3RP).',
    timing: 'anytime',
    restrictions: 'Não pode selecionar HERÓI ÉPICO, Desonrado ou Marca da Vergonha',
  },
  {
    id: 'legendary_veterans',
    name: 'Veteranos Lendários',
    cost: 3,
    description: 'Compre quando uma unidade da sua força de Cruzada (excluindo unidades PERSONAGEM) atingir 30XP. O total de Pontos de Experiência dessa unidade não está mais limitado a um máximo de 30XP e agora pode ser promovida acima da patente Endurecido em Batalha. Além disso, o número máximo de Honras de Batalha que a unidade pode ter é aumentado para 6.',
    timing: 'anytime',
    restrictions: 'A unidade deve ter 30XP e não ser PERSONAGEM',
  },
];

/**
 * Calculate the actual RP cost for a requisition based on player/unit state
 */
export function calculateRequisitionCost(
  requisitionId: string,
  context?: {
    unitBattleHonours?: number;
    unitBattleScars?: number;
    crusadeEnhancements?: number;
  }
): number {
  const requisition = REQUISITIONS.find(r => r.id === requisitionId);
  if (!requisition) return 0;

  if (typeof requisition.cost === 'number') {
    return requisition.cost;
  }

  // Variable cost requisitions
  switch (requisitionId) {
    case 'repair_and_recuperate':
      return 1 + (context?.unitBattleHonours || 0);
    
    case 'fresh_recruits':
      return 1 + Math.ceil((context?.unitBattleHonours || 0) / 2);
    
    case 'renowned_heroes':
      return 1 + (context?.crusadeEnhancements || 0);
    
    default:
      return 1;
  }
}


/**
 * Faction-Specific Requisitions
 * Each faction can have unique requisitions that reflect their playstyle and lore
 */

export type FactionRequisition = Requisition & {
  faction: string; // Faction identifier
};

/**
 * Astra Militarum Faction Requisitions
 */
export const ASTRA_MILITARUM_REQUISITIONS: FactionRequisition[] = [
  {
    id: 'am_regimental_honors',
    name: 'Honras Regimentais',
    cost: 1,
    faction: 'Astra Militarum',
    description: 'Compre quando uma unidade ASTRA MILITARUM ganhar uma patente. Aquela unidade ganha a palavra-chave VETERANOS DO REGIMENTO. Unidades com esta palavra-chave podem re-rolar testes de Liderança e testes de Battle-shock.',
    timing: 'anytime',
    restrictions: 'A unidade deve ter ganho uma patente'
  },
  {
    id: 'am_artillery_barrage',
    name: 'Barragem de Artilharia',
    cost: 2,
    faction: 'Astra Militarum',
    description: 'Compre antes de uma batalha. Selecione uma unidade ASTRA MILITARUM ARTILHARIA. Durante esta batalha, aquela unidade pode disparar duas vezes na fase de Disparo (mas deve mirar no mesmo alvo).',
    timing: 'before_battle',
    restrictions: 'A unidade deve ter a palavra-chave ARTILHARIA'
  }
];

/**
 * Space Marines Faction Requisitions
 */
export const SPACE_MARINES_REQUISITIONS: FactionRequisition[] = [
  {
    id: 'sm_chapter_relic',
    name: 'Relíquia do Capítulo',
    cost: 2,
    faction: 'Space Marines',
    description: 'Compre quando uma unidade ADEPTUS ASTARTES PERSONAGEM ganhar 20XP. Aquela unidade ganha uma Relíquia de Cruzada adicional do seu Capítulo (além do limite normal de 1 Relíquia por unidade).',
    timing: 'anytime',
    restrictions: 'A unidade deve ser PERSONAGEM com 20+ XP'
  },
  {
    id: 'sm_veteran_intercessors',
    name: 'Intercessores Veteranos',
    cost: 1,
    faction: 'Space Marines',
    description: 'Compre quando uma unidade INTERCESSOR ganhar uma patente. Aquela unidade ganha +1 Ataque e pode re-rolar 1s para acertar em combate corpo a corpo.',
    timing: 'anytime',
    restrictions: 'A unidade deve ser INTERCESSOR e ter ganho uma patente'
  }
];

/**
 * Chaos Space Marines Faction Requisitions
 */
export const CHAOS_SPACE_MARINES_REQUISITIONS: FactionRequisition[] = [
  {
    id: 'csm_dark_blessing',
    name: 'Bênção Sombria',
    cost: 2,
    faction: 'Chaos Space Marines',
    description: 'Compre após uma batalha. Selecione uma unidade HERETIC ASTARTES que destruiu 3+ unidades inimigas. Aquela unidade ganha uma Honra de Batalha adicional (além do limite normal). Role na tabela de Honras de Batalha do Caos.',
    timing: 'after_battle',
    restrictions: 'A unidade deve ter destruído 3+ unidades inimigas'
  },
  {
    id: 'csm_daemon_engine_repair',
    name: 'Reparos de Motor Daemônico',
    cost: 1,
    faction: 'Chaos Space Marines',
    description: 'Compre após uma batalha. Selecione uma unidade DAEMON ENGINE que sobreviveu à batalha. Restaure todos os ferimentos perdidos e remova uma Cicatriz de Batalha (se houver).',
    timing: 'after_battle',
    restrictions: 'A unidade deve ser DAEMON ENGINE'
  }
];

/**
 * Necrons Faction Requisitions
 */
export const NECRONS_REQUISITIONS: FactionRequisition[] = [
  {
    id: 'nec_reanimation_upgrade',
    name: 'Aprimoramento de Reanimação',
    cost: 2,
    faction: 'Necrons',
    description: 'Compre a qualquer momento. Selecione uma unidade NECRONS. Aquela unidade adiciona +1 aos testes de Protocolos de Reanimação para o resto da Cruzada.',
    timing: 'anytime',
    restrictions: 'A unidade deve ter Protocolos de Reanimação'
  },
  {
    id: 'nec_phase_out',
    name: 'Saída de Fase',
    cost: 1,
    faction: 'Necrons',
    description: 'Compre antes de uma batalha. Selecione até 3 unidades NECRONS. Durante esta batalha, se essas unidades forem destruídas, role 1D6. Em 4+, a unidade não é removida do Order of Battle (mas ainda conta como destruída para fins de VP).',
    timing: 'before_battle'
  }
];

/**
 * Orks Faction Requisitions
 */
export const ORKS_REQUISITIONS: FactionRequisition[] = [
  {
    id: 'ork_more_dakka',
    name: 'Mais Dakka',
    cost: 1,
    faction: 'Orks',
    description: 'Compre a qualquer momento. Selecione uma unidade ORKS. Todas as armas de disparo dessa unidade ganham a habilidade [RAPID FIRE 1] (ou melhoram em +1 se já tiverem RAPID FIRE).',
    timing: 'anytime'
  },
  {
    id: 'ork_kustom_job',
    name: 'Trabalho Kustom',
    cost: 2,
    faction: 'Orks',
    description: 'Compre quando uma unidade ORKS VEÍCULO ganhar uma patente. Aquele veículo ganha +1 Tenacidade e pode re-rolar 1 dado de dano por ataque.',
    timing: 'anytime',
    restrictions: 'A unidade deve ser VEÍCULO e ter ganho uma patente'
  }
];

/**
 * Tyranids Faction Requisitions
 */
export const TYRANIDS_REQUISITIONS: FactionRequisition[] = [
  {
    id: 'tyr_adaptive_evolution',
    name: 'Evolução Adaptativa',
    cost: 2,
    faction: 'Tyranids',
    description: 'Compre após uma batalha. Selecione uma unidade TYRANIDS que sobreviveu. Aquela unidade ganha uma Adaptação Bio-morfa permanente (escolha: +1 Força, +1 Tenacidade, +1 Movimento, ou +1 Ataque).',
    timing: 'after_battle',
    restrictions: 'A unidade deve ter sobrevivido à batalha'
  },
  {
    id: 'tyr_spawn_more',
    name: 'Gerar Mais',
    cost: 1,
    faction: 'Tyranids',
    description: 'Compre antes de uma batalha. Selecione uma unidade TYRANIDS. Durante esta batalha, quando essa unidade for destruída, role 1D6. Em 4+, coloque uma nova unidade idêntica em Reservas Estratégicas (chega no próximo turno).',
    timing: 'before_battle'
  }
];

/**
 * T'au Empire Faction Requisitions
 */
export const TAU_EMPIRE_REQUISITIONS: FactionRequisition[] = [
  {
    id: 'tau_prototype_systems',
    name: 'Sistemas Protótipo',
    cost: 2,
    faction: 'T\'au Empire',
    description: 'Compre quando uma unidade T\'AU EMPIRE BATTLESUIT ganhar uma patente. Aquela unidade ganha um Sistema de Suporte adicional (além do limite normal) e pode re-rolar testes de acerto de 1 ao disparar.',
    timing: 'anytime',
    restrictions: 'A unidade deve ser BATTLESUIT e ter ganho uma patente'
  },
  {
    id: 'tau_drone_reinforcements',
    name: 'Reforços de Drones',
    cost: 1,
    faction: 'T\'au Empire',
    description: 'Compre a qualquer momento. Selecione uma unidade T\'AU EMPIRE. Adicione até 2 DRONES à unidade (sem custo de pontos, mas não pode exceder Limite de Suprimento total).',
    timing: 'anytime'
  }
];

/**
 * Aeldari Faction Requisitions
 */
export const AELDARI_REQUISITIONS: FactionRequisition[] = [
  {
    id: 'ael_craftworld_relic',
    name: 'Relíquia do Mundo-Artesão',
    cost: 2,
    faction: 'Aeldari',
    description: 'Compre quando uma unidade AELDARI PERSONAGEM ganhar 15XP. Aquela unidade ganha uma Relíquia de Cruzada do Mundo-Artesão (além do limite normal). A Relíquia concede +1 Liderança a unidades amigas a 6".',
    timing: 'anytime',
    restrictions: 'A unidade deve ser PERSONAGEM com 15+ XP'
  },
  {
    id: 'ael_aspect_warrior_shrine',
    name: 'Santuário dos Guerreiros Aspecto',
    cost: 1,
    faction: 'Aeldari',
    description: 'Compre quando uma unidade ASPECT WARRIOR ganhar uma patente. Aquela unidade ganha a habilidade de re-rolar todos os testes de acerto falhados ao disparar ou lutar.',
    timing: 'anytime',
    restrictions: 'A unidade deve ser ASPECT WARRIOR e ter ganho uma patente'
  }
];

/**
 * Drukhari Faction Requisitions
 */
export const DRUKHARI_REQUISITIONS: FactionRequisition[] = [
  {
    id: 'dru_pain_token',
    name: 'Token de Dor',
    cost: 1,
    faction: 'Drukhari',
    description: 'Compre após uma batalha. Selecione uma unidade DRUKHARI que destruiu 2+ unidades inimigas. Aquela unidade ganha um Token de Dor permanente (+1 Força e +1 Ataque).',
    timing: 'after_battle',
    restrictions: 'A unidade deve ter destruído 2+ unidades inimigas'
  },
  {
    id: 'dru_raid_spoils',
    name: 'Espólios do Ataque',
    cost: 2,
    faction: 'Drukhari',
    description: 'Compre após uma batalha vencida. Ganhe +1 RP adicional e selecione uma unidade DRUKHARI. Aquela unidade ganha uma Honra de Batalha adicional.',
    timing: 'after_battle',
    restrictions: 'Você deve ter vencido a batalha'
  }
];

/**
 * Get all faction-specific requisitions
 */
export const FACTION_REQUISITIONS: Record<string, FactionRequisition[]> = {
  'Astra Militarum': ASTRA_MILITARUM_REQUISITIONS,
  'Space Marines': SPACE_MARINES_REQUISITIONS,
  'Chaos Space Marines': CHAOS_SPACE_MARINES_REQUISITIONS,
  'Necrons': NECRONS_REQUISITIONS,
  'Orks': ORKS_REQUISITIONS,
  'Tyranids': TYRANIDS_REQUISITIONS,
  'T\'au Empire': TAU_EMPIRE_REQUISITIONS,
  'Aeldari': AELDARI_REQUISITIONS,
  'Drukhari': DRUKHARI_REQUISITIONS,
  // Placeholders for other factions - to be expanded
  'Adeptus Custodes': [],
  'Adeptus Mechanicus': [],
  'Adepta Sororitas': [],
  'Death Guard': [],
  'Thousand Sons': [],
  'World Eaters': [],
  'Genestealer Cults': [],
  'Imperial Knights': [],
  'Chaos Knights': [],
  'Leagues of Votann': [],
  'Grey Knights': [],
  'Agents of the Imperium': []
};

/**
 * Get requisitions available for a specific faction
 */
export function getRequisitionsForFaction(faction: string): Requisition[] {
  const factionRequisitions = FACTION_REQUISITIONS[faction] || [];
  return [...REQUISITIONS, ...factionRequisitions];
}

/**
 * Get only faction-specific requisitions
 */
export function getFactionSpecificRequisitions(faction: string): FactionRequisition[] {
  return FACTION_REQUISITIONS[faction] || [];
}

/**
 * Check if a faction has custom requisitions
 */
export function hasFactionRequisitions(faction: string): boolean {
  const requisitions = FACTION_REQUISITIONS[faction];
  return requisitions !== undefined && requisitions.length > 0;
}
