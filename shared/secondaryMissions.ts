/**
 * Secondary Missions data - extracted from Horde Mode Rules v1.0
 * These missions provide additional objectives with rewards and punishments
 * Missions are revealed during the Command Phase
 */

export interface SecondaryMission {
  id: number;
  nameEn: string;
  namePt: string;
  conditionEn: string;
  conditionPt: string;
  rewardEn: string;
  rewardPt: string;
  punishmentEn: string;
  punishmentPt: string;
  /** Tags for categorizing missions */
  tags: ('sp_reward' | 'spawn_modifier' | 'misery_punishment' | 'action' | 'combat' | 'objective' | 'purchase')[];
}

export const SECONDARY_MISSIONS: SecondaryMission[] = [
  {
    id: 1,
    nameEn: "Secure Drop Zones",
    namePt: "Proteger Zonas de Queda",
    conditionEn: "Randomly select two objectives in No Man's Land (if fewer exist, select that number instead). If you control those selected objective markers at the end of the battle round this mission is successful.",
    conditionPt: "Selecione aleatoriamente dois objetivos na Terra de Ninguém (se existirem menos, selecione esse número). Se você controlar esses marcadores de objetivo selecionados no final da rodada de batalha, esta missão é bem-sucedida.",
    rewardEn: "3 SP, One random player saves this card. You may discard this card during the Resupply Step to make a Tactics purchase without paying SP.",
    rewardPt: "3 SP, Um jogador aleatório guarda esta carta. Você pode descartar esta carta durante a Etapa de Reabastecimento para fazer uma compra de Táticas sem pagar SP.",
    punishmentEn: "+1 Misery cards",
    punishmentPt: "+1 Cartas de Miséria",
    tags: ['sp_reward', 'objective', 'misery_punishment'],
  },
  {
    id: 2,
    nameEn: "Back To Basics",
    namePt: "De Volta ao Básico",
    conditionEn: "Keep a tally, X, of how many Horde units are destroyed this battle round after the horde is spawned and you have revealed this mission. If X is zero, this mission fails.",
    conditionPt: "Mantenha uma contagem, X, de quantas unidades da Horda são destruídas nesta rodada de batalha após a horda ser gerada e você ter revelado esta missão. Se X for zero, esta missão falha.",
    rewardEn: "(X+1) SP",
    rewardPt: "(X+1) SP",
    punishmentEn: "+2 Misery cards",
    punishmentPt: "+2 Cartas de Miséria",
    tags: ['sp_reward', 'combat', 'misery_punishment'],
  },
  {
    id: 3,
    nameEn: "Show No Fear",
    namePt: "Não Mostre Medo",
    conditionEn: "If any player units are Battle-shocked at the end of the battle round, this mission fails.",
    conditionPt: "Se alguma unidade dos jogadores estiver em Choque de Batalha no final da rodada de batalha, esta missão falha.",
    rewardEn: "3 SP, -1 to Spawn Rolls",
    rewardPt: "3 SP, -1 nas Rolagens de Geração",
    punishmentEn: "+2 Misery cards, +1 to Spawn Rolls",
    punishmentPt: "+2 Cartas de Miséria, +1 nas Rolagens de Geração",
    tags: ['sp_reward', 'spawn_modifier', 'misery_punishment'],
  },
  {
    id: 4,
    nameEn: "Establish Orbital Comms",
    namePt: "Estabelecer Comunicações Orbitais",
    conditionEn: "In your shooting phase, select a Player unit within 6\" of the center of the battlefield to do an action, Establish Orbital Comms. This action completes at the end of your turn. If the action is completed, this mission is successful.",
    conditionPt: "Na sua fase de tiro, selecione uma unidade de Jogador dentro de 6\" do centro do campo de batalha para fazer uma ação, Estabelecer Comunicações Orbitais. Esta ação é completada no final do seu turno. Se a ação for completada, esta missão é bem-sucedida.",
    rewardEn: "One at a time, each player without a revealed Secret Objective immediately uses A Change of Plans, but they do not choose a card; instead they select one at random.",
    rewardPt: "Um de cada vez, cada jogador sem um Objetivo Secreto revelado usa imediatamente Mudança de Planos, mas não escolhe uma carta; em vez disso, selecionam uma aleatoriamente.",
    punishmentEn: "One at a time, each player without a revealed Secret Objective immediately uses A Change of Plans, but they do not choose a card; instead they select one at random.",
    punishmentPt: "Um de cada vez, cada jogador sem um Objetivo Secreto revelado usa imediatamente Mudança de Planos, mas não escolhe uma carta; em vez disso, selecionam uma aleatoriamente.",
    tags: ['action'],
  },
  {
    id: 5,
    nameEn: "Search for Supplies",
    namePt: "Buscar Suprimentos",
    conditionEn: "In your shooting phase, select any number of Player units on different objective markers in No Man's Land or the enemy deployment zone to do an action, Search for Supplies. The action completes at the end of your turn. Keep a tally, X, of how many units complete this action. If X = 0 at the end of the battle round, this mission fails.",
    conditionPt: "Na sua fase de tiro, selecione qualquer número de unidades de Jogador em diferentes marcadores de objetivo na Terra de Ninguém ou na zona de implantação inimiga para fazer uma ação, Buscar Suprimentos. A ação é completada no final do seu turno. Mantenha uma contagem, X, de quantas unidades completam esta ação. Se X = 0 no final da rodada de batalha, esta missão falha.",
    rewardEn: "(X+1) SP, One random player saves this card. You may discard this card during the Resupply step to make a Supply purchase without paying SP.",
    rewardPt: "(X+1) SP, Um jogador aleatório guarda esta carta. Você pode descartar esta carta durante a etapa de Reabastecimento para fazer uma compra de Suprimento sem pagar SP.",
    punishmentEn: "+2 Misery cards",
    punishmentPt: "+2 Cartas de Miséria",
    tags: ['sp_reward', 'action', 'misery_punishment'],
  },
  {
    id: 6,
    nameEn: "Clear the Evac Zone",
    namePt: "Limpar a Zona de Evacuação",
    conditionEn: "If no Horde units are within the Defender's deployment zone at the end of the battle round this mission is successful.",
    conditionPt: "Se nenhuma unidade da Horda estiver dentro da zona de implantação do Defensor no final da rodada de batalha, esta missão é bem-sucedida.",
    rewardEn: "3 SP",
    rewardPt: "3 SP",
    punishmentEn: "Reinforcements Arrive is removed from the SP Purchase Table",
    punishmentPt: "Reforços Chegam é removido da Tabela de Compras de SP",
    tags: ['sp_reward', 'objective'],
  },
  {
    id: 7,
    nameEn: "Decapitation Strike",
    namePt: "Ataque de Decapitação",
    conditionEn: "If a player destroys a Horde Character model or no Horde Character models exist at the end of the battle round this mission is successful.",
    conditionPt: "Se um jogador destruir um modelo de Personagem da Horda ou se nenhum modelo de Personagem da Horda existir no final da rodada de batalha, esta missão é bem-sucedida.",
    rewardEn: "2 SP, 2 CP",
    rewardPt: "2 SP, 2 CP",
    punishmentEn: "+2 Misery cards",
    punishmentPt: "+2 Cartas de Miséria",
    tags: ['sp_reward', 'combat', 'misery_punishment'],
  },
  {
    id: 8,
    nameEn: "Dragon Slayer",
    namePt: "Matador de Dragões",
    conditionEn: "Keep track of the first time a player destroys a Horde Monster or Vehicle model this battle round. If a Monster or Vehicle was destroyed or if none exist at the end of the battle round this mission is successful. If no player triggers it, 2SP.",
    conditionPt: "Acompanhe a primeira vez que um jogador destrói um modelo de Monstro ou Veículo da Horda nesta rodada de batalha. Se um Monstro ou Veículo foi destruído ou se nenhum existir no final da rodada de batalha, esta missão é bem-sucedida. Se nenhum jogador ativar, 2SP.",
    rewardEn: "1 free Field Promotion use (including additional costs) to the player who triggers it. If no player triggers, 2SP.",
    rewardPt: "1 uso gratuito de Promoção de Campo (incluindo custos adicionais) para o jogador que ativar. Se nenhum jogador ativar, 2SP.",
    punishmentEn: "+6 to the first Spawn Roll.",
    punishmentPt: "+6 na primeira Rolagem de Geração.",
    tags: ['combat', 'spawn_modifier'],
  },
  {
    id: 9,
    nameEn: "Paint Targets",
    namePt: "Marcar Alvos",
    conditionEn: "To succeed in this mission; until the end of the battle round: No player unit may fall back. No player unit may normal move, advance, or charge out of range of any objective they began the turn in range of.",
    conditionPt: "Para ter sucesso nesta missão; até o final da rodada de batalha: Nenhuma unidade de jogador pode recuar. Nenhuma unidade de jogador pode se mover normalmente, avançar ou carregar para fora do alcance de qualquer objetivo em que começou o turno.",
    rewardEn: "1 Free use of Air Strike to a random player, 1 Free use of Defensive Positions to a random player.",
    rewardPt: "1 Uso gratuito de Ataque Aéreo para um jogador aleatório, 1 Uso gratuito de Posições Defensivas para um jogador aleatório.",
    punishmentEn: "Search for Stray Orbital Bombardment in the Misery Deck and discard pile and immediately resolve it.",
    punishmentPt: "Procure por Bombardeio Orbital Perdido no Baralho de Miséria e pilha de descarte e resolva-o imediatamente.",
    tags: ['action'],
  },
  {
    id: 10,
    nameEn: "Study Behaviors",
    namePt: "Estudar Comportamentos",
    conditionEn: "At the start of the player movement phase, choose a Horde unit on the battlefield at random; that unit must have no wounds lost from that point until the end of the battle round or this mission fails.",
    conditionPt: "No início da fase de movimento do jogador, escolha uma unidade da Horda no campo de batalha aleatoriamente; essa unidade não deve ter ferimentos perdidos daquele ponto até o final da rodada de batalha ou esta missão falha.",
    rewardEn: "2 SP, One random player saves this card. You may discard this card to discard and nullify the effect of a revealed Misery card.",
    rewardPt: "2 SP, Um jogador aleatório guarda esta carta. Você pode descartar esta carta para descartar e anular o efeito de uma Carta de Miséria revelada.",
    punishmentEn: "+3 to Spawn Roll",
    punishmentPt: "+3 na Rolagem de Geração",
    tags: ['sp_reward', 'spawn_modifier'],
  },
  {
    id: 11,
    nameEn: "Use It Or Lose It",
    namePt: "Use ou Perca",
    conditionEn: "Keep a tally of how much SP is spent during the battle round after revealing this card. If the tally is greater than 6 this mission is successful. If this Secondary Mission is drawn during the first battle round, reveal another Secondary Mission card, then shuffle this back into the Secondary Mission deck.",
    conditionPt: "Mantenha uma contagem de quanto SP é gasto durante a rodada de batalha após revelar esta carta. Se a contagem for maior que 6, esta missão é bem-sucedida. Se esta Missão Secundária for comprada durante a primeira rodada de batalha, revele outra carta de Missão Secundária, então embaralhe esta de volta no baralho de Missão Secundária.",
    rewardEn: "10 SP to a random player.",
    rewardPt: "10 SP para um jogador aleatório.",
    punishmentEn: "-3SP, +1 Misery card",
    punishmentPt: "-3SP, +1 Carta de Miséria",
    tags: ['sp_reward', 'purchase', 'misery_punishment'],
  },
  {
    id: 12,
    nameEn: "Control the Battlefield",
    namePt: "Controlar o Campo de Batalha",
    conditionEn: "At the end of the battle round if you have at least one player unit wholly within each table quarter, outside of 6\" of the center of the battlefield this mission is successful.",
    conditionPt: "No final da rodada de batalha, se você tiver pelo menos uma unidade de jogador totalmente dentro de cada quarto da mesa, fora de 6\" do centro do campo de batalha, esta missão é bem-sucedida.",
    rewardEn: "-1 to Spawn Rolls, One random player saves this card. You may discard this card during the Resupply step to make a Secondary purchase without paying SP.",
    rewardPt: "-1 nas Rolagens de Geração, Um jogador aleatório guarda esta carta. Você pode descartar esta carta durante a etapa de Reabastecimento para fazer uma compra Secundária sem pagar SP.",
    punishmentEn: "+1 Misery card, +1 to Spawn Rolls",
    punishmentPt: "+1 Carta de Miséria, +1 nas Rolagens de Geração",
    tags: ['spawn_modifier', 'objective', 'misery_punishment'],
  },
  {
    id: 13,
    nameEn: "The Smell of Napalm",
    namePt: "O Cheiro de Napalm",
    conditionEn: "If 2 Strike purchases were made this battle round this mission is successful. If this Secondary Mission is drawn during the first battle round, reveal another Secondary Mission card, then shuffle this back into the Secondary Mission deck.",
    conditionPt: "Se 2 compras de Ataque foram feitas nesta rodada de batalha, esta missão é bem-sucedida. Se esta Missão Secundária for comprada durante a primeira rodada de batalha, revele outra carta de Missão Secundária, então embaralhe esta de volta no baralho de Missão Secundária.",
    rewardEn: "2SP, -1 to Spawn Rolls",
    rewardPt: "2SP, -1 nas Rolagens de Geração",
    punishmentEn: "+1 Misery card, +1 to Spawn Rolls",
    punishmentPt: "+1 Carta de Miséria, +1 nas Rolagens de Geração",
    tags: ['sp_reward', 'purchase', 'spawn_modifier', 'misery_punishment'],
  },
  {
    id: 14,
    nameEn: "Marching on Stomachs",
    namePt: "Marchando de Estômago Cheio",
    conditionEn: "If 2 Supply purchases were made this battle round this mission is successful. If this Secondary Mission is drawn during the first battle round, reveal another Secondary Mission card, then shuffle this back into the Secondary Mission deck.",
    conditionPt: "Se 2 compras de Suprimento foram feitas nesta rodada de batalha, esta missão é bem-sucedida. Se esta Missão Secundária for comprada durante a primeira rodada de batalha, revele outra carta de Missão Secundária, então embaralhe esta de volta no baralho de Missão Secundária.",
    rewardEn: "1SP, One random player saves this card. You may discard this card during the Resupply step to reduce the cost of Reinforcements Arrive by 5.",
    rewardPt: "1SP, Um jogador aleatório guarda esta carta. Você pode descartar esta carta durante a etapa de Reabastecimento para reduzir o custo de Reforços Chegam em 5.",
    punishmentEn: "+1 Misery card, each Horde unit on the battlefield heals 3 wounds in the method described by a Field Hospital.",
    punishmentPt: "+1 Carta de Miséria, cada unidade da Horda no campo de batalha cura 3 ferimentos no método descrito por um Hospital de Campo.",
    tags: ['sp_reward', 'purchase', 'misery_punishment'],
  },
  {
    id: 15,
    nameEn: "Baiting the Trap",
    namePt: "Preparando a Armadilha",
    conditionEn: "In your shooting phase pick a Player unit within 6\" of the center of the battlefield to perform an action, Baiting the Trap. This action is completed at the end of your turn. If this action is successful this mission is successful.",
    conditionPt: "Na sua fase de tiro, escolha uma unidade de Jogador dentro de 6\" do centro do campo de batalha para realizar uma ação, Preparando a Armadilha. Esta ação é completada no final do seu turno. Se esta ação for bem-sucedida, esta missão é bem-sucedida.",
    rewardEn: "4SP, +12 to the first Spawn Roll.",
    rewardPt: "4SP, +12 na primeira Rolagem de Geração.",
    punishmentEn: "+2 Misery cards, +2 to Spawn Rolls",
    punishmentPt: "+2 Cartas de Miséria, +2 nas Rolagens de Geração",
    tags: ['sp_reward', 'action', 'spawn_modifier', 'misery_punishment'],
  },
  {
    id: 16,
    nameEn: "Lead From the Front",
    namePt: "Liderar da Linha de Frente",
    conditionEn: "Keep a tally of damage dealt to Horde models by Player Character models this battle round, X, up to a maximum of 4. At the end of the battle round this mission is successful if X is greater than 0 and there are at least as many Player Characters on the battlefield as there were at the start of the Battle Round.",
    conditionPt: "Mantenha uma contagem de dano causado a modelos da Horda por modelos de Personagem de Jogador nesta rodada de batalha, X, até um máximo de 4. No final da rodada de batalha, esta missão é bem-sucedida se X for maior que 0 e houver pelo menos tantos Personagens de Jogador no campo de batalha quanto havia no início da Rodada de Batalha.",
    rewardEn: "X SP",
    rewardPt: "X SP",
    punishmentEn: "+1 Misery card, -1 to Battle-shock tests made by Player units.",
    punishmentPt: "+1 Carta de Miséria, -1 nos testes de Choque de Batalha feitos por unidades de Jogador.",
    tags: ['sp_reward', 'combat', 'misery_punishment'],
  },
  {
    id: 17,
    nameEn: "Spruce This Place Up",
    namePt: "Arrumar Este Lugar",
    conditionEn: "If at least 2 objective markers are Fortified at the end of the battle round this mission is successful. If this Secondary Mission is drawn during the first battle round, reveal another Secondary Mission card, then shuffle this back into the Secondary Mission deck.",
    conditionPt: "Se pelo menos 2 marcadores de objetivo estiverem Fortificados no final da rodada de batalha, esta missão é bem-sucedida. Se esta Missão Secundária for comprada durante a primeira rodada de batalha, revele outra carta de Missão Secundária, então embaralhe esta de volta no baralho de Missão Secundária.",
    rewardEn: "1SP, One random player saves this card. You may discard this card to discard and nullify the effect of a revealed Misery card.",
    rewardPt: "1SP, Um jogador aleatório guarda esta carta. Você pode descartar esta carta para descartar e anular o efeito de uma Carta de Miséria revelada.",
    punishmentEn: "+1 Misery card, Remove all Fortified Markers from Objectives.",
    punishmentPt: "+1 Carta de Miséria, Remova todos os Marcadores Fortificados dos Objetivos.",
    tags: ['sp_reward', 'objective', 'misery_punishment'],
  },
  {
    id: 18,
    nameEn: "Calling Shots",
    namePt: "Chamando os Tiros",
    conditionEn: "At the end of the Horde's Movement phase, pick one or more Horde units. Mark them with a reminder token and keep track of the chosen number of units, X. Keep a tally of the amount of marked units destroyed during the battle round. If the tally at the end of the battle round equals X, this mission is successful. If Calling Shots is revealed after the Horde's Movement Phase, reveal another Secondary Objective and shuffle Calling Shots back into the Secondary Objective Deck.",
    conditionPt: "No final da Fase de Movimento da Horda, escolha uma ou mais unidades da Horda. Marque-as com um token de lembrete e acompanhe o número escolhido de unidades, X. Mantenha uma contagem da quantidade de unidades marcadas destruídas durante a rodada de batalha. Se a contagem no final da rodada de batalha for igual a X, esta missão é bem-sucedida. Se Chamando os Tiros for revelado após a Fase de Movimento da Horda, revele outro Objetivo Secundário e embaralhe Chamando os Tiros de volta no Baralho de Objetivo Secundário.",
    rewardEn: "(X * 2) SP",
    rewardPt: "(X * 2) SP",
    punishmentEn: "+X Misery cards, +X to Spawn Rolls",
    punishmentPt: "+X Cartas de Miséria, +X nas Rolagens de Geração",
    tags: ['sp_reward', 'combat', 'spawn_modifier', 'misery_punishment'],
  },
  {
    id: 19,
    nameEn: "Dive Into Hell",
    namePt: "Mergulhar no Inferno",
    conditionEn: "If a Player unit entered the battlefield from Reserves for any reason this battle round and is still on the battlefield at the end of the battle round this mission is successful. If this Secondary Mission is drawn during the first battle round, reveal another Secondary Mission card, then shuffle this back into the Secondary Mission deck.",
    conditionPt: "Se uma unidade de Jogador entrou no campo de batalha das Reservas por qualquer motivo nesta rodada de batalha e ainda está no campo de batalha no final da rodada de batalha, esta missão é bem-sucedida. Se esta Missão Secundária for comprada durante a primeira rodada de batalha, revele outra carta de Missão Secundária, então embaralhe esta de volta no baralho de Missão Secundária.",
    rewardEn: "1SP, One random player saves this card. You may discard this card during the Resupply step to make a Strike purchase without paying SP.",
    rewardPt: "1SP, Um jogador aleatório guarda esta carta. Você pode descartar esta carta durante a etapa de Reabastecimento para fazer uma compra de Ataque sem pagar SP.",
    punishmentEn: "+1 Misery card",
    punishmentPt: "+1 Carta de Miséria",
    tags: ['sp_reward', 'misery_punishment'],
  },
  {
    id: 20,
    nameEn: "Insane Gambit",
    namePt: "Aposta Insana",
    conditionEn: "In your shooting phase pick a friendly unit within range of an objective marker to perform an action, Scuttle the Objective. This action is completed at the end of your turn. If this action is successful, destroy the objective marker and this mission is successful.",
    conditionPt: "Na sua fase de tiro, escolha uma unidade aliada dentro do alcance de um marcador de objetivo para realizar uma ação, Sabotar o Objetivo. Esta ação é completada no final do seu turno. Se esta ação for bem-sucedida, destrua o marcador de objetivo e esta missão é bem-sucedida.",
    rewardEn: "4SP, One random player saves this card. You may discard this card during the Resupply step to make a Fortify purchase without paying SP.",
    rewardPt: "4SP, Um jogador aleatório guarda esta carta. Você pode descartar esta carta durante a etapa de Reabastecimento para fazer uma compra de Fortificação sem pagar SP.",
    punishmentEn: "+2 Misery cards",
    punishmentPt: "+2 Cartas de Miséria",
    tags: ['sp_reward', 'action', 'objective', 'misery_punishment'],
  },
];

/**
 * Get a random Secondary Mission
 */
export function getRandomSecondaryMission(): SecondaryMission {
  const randomIndex = Math.floor(Math.random() * SECONDARY_MISSIONS.length);
  return SECONDARY_MISSIONS[randomIndex];
}

/**
 * Get multiple random Secondary Missions (without duplicates)
 */
export function getRandomSecondaryMissions(count: number): SecondaryMission[] {
  const shuffled = [...SECONDARY_MISSIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, SECONDARY_MISSIONS.length));
}

/**
 * Resolution timing for secondary missions
 */
export type ResolutionTiming = 'end_of_turn' | 'end_of_round';

/**
 * Get when a mission should be resolved based on its condition
 * Most missions resolve at end of battle round, but action-based missions resolve at end of turn
 */
export function getMissionResolutionTiming(missionId: number): ResolutionTiming {
  // Action-based missions that complete at end of turn
  const endOfTurnMissions = [4, 5, 15]; // Establish Orbital Comms, Search for Supplies, Baiting the Trap
  return endOfTurnMissions.includes(missionId) ? 'end_of_turn' : 'end_of_round';
}

/**
 * Parse the number of Misery Cards from punishment text
 * Returns 0 if no Misery Cards are mentioned
 */
export function parseMiseryCardPunishment(punishmentPt: string): number {
  // Match patterns like "+1 Carta de Miséria", "+2 Cartas de Miséria", "+X Cartas de Miséria"
  const match = punishmentPt.match(/\+(\d+)\s*Cartas?\s*de\s*Miséria/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

/**
 * Get a Secondary Mission by ID
 */
export function getSecondaryMissionById(id: number): SecondaryMission | undefined {
  return SECONDARY_MISSIONS.find(mission => mission.id === id);
}

/**
 * Get all Secondary Missions with a specific tag
 */
export function getSecondaryMissionsByTag(tag: SecondaryMission['tags'][number]): SecondaryMission[] {
  return SECONDARY_MISSIONS.filter(mission => mission.tags.includes(tag));
}

/**
 * Check if a mission should be reshuffled on first battle round
 * Some missions are not valid during the first battle round
 */
export function shouldReshuffleOnFirstRound(missionId: number): boolean {
  // Missions that reference previous purchases or require setup time
  const reshuffleMissions = [11, 13, 14, 17, 18, 19];
  return reshuffleMissions.includes(missionId);
}

/**
 * Draw Secondary Missions for a battle round
 * Handles reshuffling of invalid missions on first round
 */
export function drawSecondaryMissions(
  count: number,
  battleRound: number,
  excludeIds: number[] = []
): SecondaryMission[] {
  const availableMissions = SECONDARY_MISSIONS.filter(
    mission => !excludeIds.includes(mission.id)
  );
  
  const drawnMissions: SecondaryMission[] = [];
  let attempts = 0;
  const maxAttempts = count * 3; // Prevent infinite loops
  
  while (drawnMissions.length < count && attempts < maxAttempts) {
    const remainingMissions = availableMissions.filter(
      mission => !drawnMissions.includes(mission)
    );
    
    if (remainingMissions.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * remainingMissions.length);
    const drawnMission = remainingMissions[randomIndex];
    
    // Check if mission should be reshuffled on first round
    if (battleRound === 1 && shouldReshuffleOnFirstRound(drawnMission.id)) {
      attempts++;
      continue;
    }
    
    drawnMissions.push(drawnMission);
    attempts++;
  }
  
  return drawnMissions;
}
