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
