/**
 * Misery Cards data - extracted from Horde Mode Rules v1.0
 * These cards represent negative effects that impact players during battle
 * Cards are revealed at the start of each Battle Round
 */

export interface MiseryCard {
  id: number;
  nameEn: string;
  namePt: string;
  effectEn: string;
  effectPt: string;
  /** Tags for categorizing effects */
  tags: ('horde_buff' | 'player_debuff' | 'spawn' | 'objective' | 'sp' | 'restriction' | 'cascade')[];
  /** Whether this card triggers additional Misery cards */
  cascadeCount?: number;
}

export const MISERY_CARDS: MiseryCard[] = [
  {
    id: 1,
    nameEn: "Unnatural Stamina",
    namePt: "Resistência Antinatural",
    effectEn: "Horde units are eligible to shoot and declare a charge in a turn in which they advanced.",
    effectPt: "Unidades da Horda podem atirar e declarar uma carga no turno em que avançaram.",
    tags: ['horde_buff'],
  },
  {
    id: 2,
    nameEn: "Grudge Match",
    namePt: "Combate Rancoroso",
    effectEn: "Each time a Horde model makes an attack, add 1 to the hit roll and add 1 to the wound roll.",
    effectPt: "Cada vez que um modelo da Horda faz um ataque, adicione 1 à rolagem de acerto e 1 à rolagem de ferimento.",
    tags: ['horde_buff'],
  },
  {
    id: 3,
    nameEn: "Rip and Tear",
    namePt: "Rasgar e Dilacerar",
    effectEn: "Each time a Horde model makes an attack, improve the Armour Penetration characteristic of that attack by 1.",
    effectPt: "Cada vez que um modelo da Horda faz um ataque, melhore a característica de Penetração de Armadura desse ataque em 1.",
    tags: ['horde_buff'],
  },
  {
    id: 4,
    nameEn: "Blistering Speed",
    namePt: "Velocidade Ardente",
    effectEn: "Do not roll advance or charge rolls for the Horde. The Horde's advance rolls are automatically 6 and charge rolls are automatically 12.",
    effectPt: "Não role avanço ou carga para a Horda. As rolagens de avanço da Horda são automaticamente 6 e as rolagens de carga são automaticamente 12.",
    tags: ['horde_buff'],
  },
  {
    id: 5,
    nameEn: "Untouchable",
    namePt: "Intocável",
    effectEn: "Horde models have a 3+ Invulnerable save.",
    effectPt: "Modelos da Horda têm uma salvaguarda Invulnerável de 3+.",
    tags: ['horde_buff'],
  },
  {
    id: 6,
    nameEn: "Stray Orbital Bombardment",
    namePt: "Bombardeio Orbital Perdido",
    effectEn: "Split the battlefield evenly into a 2x3 grid. Assign each area a different number from 1 to 6. Roll one D6. Each unit within the rolled area suffers 2D3 mortal wounds. Destroy that terrain piece.",
    effectPt: "Divida o campo de batalha uniformemente em uma grade 2x3. Atribua a cada área um número diferente de 1 a 6. Role um D6. Cada unidade dentro da área rolada sofre 2D3 feridas mortais. Destrua aquele terreno.",
    tags: ['player_debuff'],
  },
  {
    id: 7,
    nameEn: "Unlucky Night",
    namePt: "Noite Azarada",
    effectEn: "When making Spawn Rolls for the Horde, roll 3D6 and drop the lowest.",
    effectPt: "Ao fazer Rolagens de Geração para a Horda, role 3D6 e descarte o menor.",
    tags: ['spawn'],
  },
  {
    id: 8,
    nameEn: "Death Denied",
    namePt: "Morte Negada",
    effectEn: "Every Horde unit on the battlefield returns to their Starting Strength. Horde models regain all lost wounds.",
    effectPt: "Cada unidade da Horda no campo de batalha retorna à sua Força Inicial. Modelos da Horda recuperam todos os ferimentos perdidos.",
    tags: ['horde_buff'],
  },
  {
    id: 9,
    nameEn: "Terrifying Shockwave",
    namePt: "Onda de Choque Aterrorizante",
    effectEn: "Player units automatically fail Battle-shock rolls.",
    effectPt: "Unidades dos jogadores falham automaticamente nas rolagens de Choque de Batalha.",
    tags: ['player_debuff'],
  },
  {
    id: 10,
    nameEn: "Planetquake",
    namePt: "Terremoto Planetário",
    effectEn: "Select one terrain piece at random. Units within it suffer 2D3 mortal wounds. Destroy that terrain piece.",
    effectPt: "Selecione um terreno aleatoriamente. Unidades dentro dele sofrem 2D3 feridas mortais. Destrua aquele terreno.",
    tags: ['player_debuff'],
  },
  {
    id: 11,
    nameEn: "Errant Explosion",
    namePt: "Explosão Errante",
    effectEn: "Destroy one objective marker in No Man's Land at random.",
    effectPt: "Destrua um marcador de objetivo na Terra de Ninguém aleatoriamente.",
    tags: ['objective'],
  },
  {
    id: 12,
    nameEn: "Nowhere is Safe",
    namePt: "Nenhum Lugar é Seguro",
    effectEn: "Destroy all objective markers in the Defender's deployment zone.",
    effectPt: "Destrua todos os marcadores de objetivo na zona de implantação do Defensor.",
    tags: ['objective'],
  },
  {
    id: 13,
    nameEn: "Pincer Maneuver",
    namePt: "Manobra de Pinça",
    effectEn: "Roll to spawn an extra Horde unit into the Horde's Reserves, applying all Spawn Roll modifiers active this round. The unit deploys during the Horde's Reinforcement step as if using Deep Strike, except it may be set up anywhere that is more than 3\" from all player units and deploys within the players' deployment zone if able. If unable, it attempts to deploy within No Man's Land if possible, then the Horde's deployment zone if not.",
    effectPt: "Role para gerar uma unidade extra da Horda nas Reservas da Horda, aplicando todos os modificadores de Rolagem de Geração ativos nesta rodada. A unidade é implantada durante a etapa de Reforços da Horda como se usasse Ataque Profundo, exceto que pode ser configurada em qualquer lugar a mais de 3\" de todas as unidades dos jogadores e é implantada dentro da zona de implantação dos jogadores se possível. Se não for possível, tenta implantar na Terra de Ninguém, depois na zona de implantação da Horda.",
    tags: ['spawn'],
  },
  {
    id: 14,
    nameEn: "No Hard Feelings",
    namePt: "Sem Ressentimentos",
    effectEn: "One random player's SP is set to 0. If playing Single Player, instead reveal 2 more Misery Cards.",
    effectPt: "O SP de um jogador aleatório é definido como 0. Se jogando Solo, em vez disso revele mais 2 Cartas de Miséria.",
    tags: ['sp', 'cascade'],
    cascadeCount: 2,
  },
  {
    id: 15,
    nameEn: "Bad Investment",
    namePt: "Investimento Ruim",
    effectEn: "Remove 5SP from all players. (The minimum SP is 0.)",
    effectPt: "Remova 5SP de todos os jogadores. (O SP mínimo é 0.)",
    tags: ['sp'],
  },
  {
    id: 16,
    nameEn: "Fair and Balanced",
    namePt: "Justo e Equilibrado",
    effectEn: "Weapons equipped by Horde models have the [Devastating Wounds] ability.",
    effectPt: "Armas equipadas por modelos da Horda têm a habilidade [Feridas Devastadoras].",
    tags: ['horde_buff'],
  },
  {
    id: 17,
    nameEn: "Unfettered Fury",
    namePt: "Fúria Desenfreada",
    effectEn: "Weapons equipped by Horde models have the [Sustained Hits 1] and [Lethal Hits] abilities.",
    effectPt: "Armas equipadas por modelos da Horda têm as habilidades [Acertos Sustentados 1] e [Acertos Letais].",
    tags: ['horde_buff'],
  },
  {
    id: 18,
    nameEn: "A Worthless Sacrifice",
    namePt: "Um Sacrifício Inútil",
    effectEn: "Players discuss and then secretly vote for a player unit to be destroyed by the horde. If the result of the vote is not unanimous, randomly choose a unit to be destroyed from among all of the units that received at least one vote.",
    effectPt: "Os jogadores discutem e então votam secretamente para uma unidade de jogador ser destruída pela horda. Se o resultado da votação não for unânime, escolha aleatoriamente uma unidade para ser destruída entre todas as unidades que receberam pelo menos um voto.",
    tags: ['player_debuff'],
  },
  {
    id: 19,
    nameEn: "Fog of War",
    namePt: "Névoa de Guerra",
    effectEn: "Horde models gain Stealth and have the Benefit of Cover.",
    effectPt: "Modelos da Horda ganham Furtividade e têm o Benefício de Cobertura.",
    tags: ['horde_buff'],
  },
  {
    id: 20,
    nameEn: "Lamentable Luck",
    namePt: "Sorte Lamentável",
    effectEn: "Reveal 2 more Misery cards.",
    effectPt: "Revele mais 2 Cartas de Miséria.",
    tags: ['cascade'],
    cascadeCount: 2,
  },
  {
    id: 21,
    nameEn: "Bunkers Busted",
    namePt: "Bunkers Destruídos",
    effectEn: "Remove all Fortified markers from all objective markers. Players cannot make Fortify purchases.",
    effectPt: "Remova todos os marcadores Fortificados de todos os marcadores de objetivo. Jogadores não podem fazer compras de Fortificação.",
    tags: ['restriction', 'objective'],
  },
  {
    id: 22,
    nameEn: "Comms Jammed",
    namePt: "Comunicações Bloqueadas",
    effectEn: "Players cannot use Stratagems or spend Command Points. Players cannot make Supply, Spawn, or Strike purchases.",
    effectPt: "Jogadores não podem usar Estratagemas ou gastar Pontos de Comando. Jogadores não podem fazer compras de Suprimento, Geração ou Ataque.",
    tags: ['restriction'],
  },
  {
    id: 23,
    nameEn: "The Mind Killer",
    namePt: "O Assassino da Mente",
    effectEn: "Remove all Enhancements from all Characters. Player units must make a Battle-shock test every Battle-shock Step. Players cannot make Tactics purchases.",
    effectPt: "Remova todos os Aprimoramentos de todos os Personagens. Unidades dos jogadores devem fazer um teste de Choque de Batalha em cada Etapa de Choque de Batalha. Jogadores não podem fazer compras de Táticas.",
    tags: ['restriction', 'player_debuff'],
  },
  {
    id: 24,
    nameEn: "Seller's Market",
    namePt: "Mercado do Vendedor",
    effectEn: "SP costs are doubled for all purchases.",
    effectPt: "Os custos de SP são dobrados para todas as compras.",
    tags: ['sp', 'restriction'],
  },
  {
    id: 25,
    nameEn: "Hotter Shots",
    namePt: "Tiros Mais Quentes",
    effectEn: "Ranged weapons equipped by Horde models that are not Melta weapons have the [Melta 1] ability.",
    effectPt: "Armas de longo alcance equipadas por modelos da Horda que não são armas Melta têm a habilidade [Melta 1].",
    tags: ['horde_buff'],
  },
  {
    id: 26,
    nameEn: "Sinking Showboats",
    namePt: "Exibicionistas Afundando",
    effectEn: "Ranged weapons equipped by Horde models have the Precision ability.",
    effectPt: "Armas de longo alcance equipadas por modelos da Horda têm a habilidade Precisão.",
    tags: ['horde_buff'],
  },
  {
    id: 27,
    nameEn: "Chitinous Growths",
    namePt: "Crescimentos Quitinosos",
    effectEn: "Each time an attack targets a Horde unit, worsen the Armour Penetration characteristic of that attack by 1.",
    effectPt: "Cada vez que um ataque mira uma unidade da Horda, piore a característica de Penetração de Armadura desse ataque em 1.",
    tags: ['horde_buff'],
  },
  {
    id: 28,
    nameEn: "They Fly Now",
    namePt: "Agora Eles Voam",
    effectEn: "Horde units have Fly and ignore vertical distances when moving. Ignore all terrain when determining visibility for ranged attacks made by Horde models.",
    effectPt: "Unidades da Horda têm Voo e ignoram distâncias verticais ao se mover. Ignore todo terreno ao determinar visibilidade para ataques de longo alcance feitos por modelos da Horda.",
    tags: ['horde_buff'],
  },
  {
    id: 29,
    nameEn: "Fate's Fetters",
    namePt: "Grilhões do Destino",
    effectEn: "Remove 4SP from the player with the most SP. Reveal 3 extra Secondary Objectives this battle round. Ignore the limit on Secondary Objectives this battle round. Players cannot make Secondary purchases.",
    effectPt: "Remova 4SP do jogador com mais SP. Revele 3 Objetivos Secundários extras nesta rodada de batalha. Ignore o limite de Objetivos Secundários nesta rodada de batalha. Jogadores não podem fazer compras Secundárias.",
    tags: ['sp', 'restriction'],
  },
  {
    id: 30,
    nameEn: "Aim for the Heads",
    namePt: "Mire nas Cabeças",
    effectEn: "Each time a Horde model is destroyed, roll one D6: on a 4+, do not remove it from play. After the attacking model's unit has finished making its attacks, the destroyed model may fight if it is the Fight phase, or shoot if it is not. The destroyed model is then removed from play.",
    effectPt: "Cada vez que um modelo da Horda é destruído, role um D6: em um 4+, não o remova do jogo. Após a unidade do modelo atacante terminar seus ataques, o modelo destruído pode lutar se for a Fase de Combate, ou atirar se não for. O modelo destruído é então removido do jogo.",
    tags: ['horde_buff'],
  },
  {
    id: 31,
    nameEn: "Debris Storm",
    namePt: "Tempestade de Destroços",
    effectEn: "Ranged attacks against Horde units require an unmodified Hit roll of 6 to score a hit unless the attacking unit is within 12\".",
    effectPt: "Ataques de longo alcance contra unidades da Horda requerem uma rolagem de Acerto não modificada de 6 para marcar um acerto, a menos que a unidade atacante esteja dentro de 12\".",
    tags: ['horde_buff'],
  },
  {
    id: 32,
    nameEn: "Glowing Eyes",
    namePt: "Olhos Brilhantes",
    effectEn: "Each time a Horde model makes an attack, they may re-roll the hit roll.",
    effectPt: "Cada vez que um modelo da Horda faz um ataque, ele pode rolar novamente a rolagem de acerto.",
    tags: ['horde_buff'],
  },
];

/**
 * Get a random Misery Card
 */
export function getRandomMiseryCard(): MiseryCard {
  const randomIndex = Math.floor(Math.random() * MISERY_CARDS.length);
  return MISERY_CARDS[randomIndex];
}

/**
 * Get multiple random Misery Cards (without duplicates)
 */
export function getRandomMiseryCards(count: number): MiseryCard[] {
  const shuffled = [...MISERY_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, MISERY_CARDS.length));
}

/**
 * Get a Misery Card by ID
 */
export function getMiseryCardById(id: number): MiseryCard | undefined {
  return MISERY_CARDS.find(card => card.id === id);
}

/**
 * Get all Misery Cards with a specific tag
 */
export function getMiseryCardsByTag(tag: MiseryCard['tags'][number]): MiseryCard[] {
  return MISERY_CARDS.filter(card => card.tags.includes(tag));
}

/**
 * Simulate drawing Misery Cards at the start of a Battle Round
 * Handles cascade effects (cards that reveal additional cards)
 */
export function drawMiseryCards(baseCount: number = 1, excludeIds: number[] = []): MiseryCard[] {
  const availableCards = MISERY_CARDS.filter(card => !excludeIds.includes(card.id));
  const drawnCards: MiseryCard[] = [];
  let cardsToDrawCount = baseCount;
  
  while (cardsToDrawCount > 0 && availableCards.length > drawnCards.length) {
    const remainingCards = availableCards.filter(card => !drawnCards.includes(card));
    if (remainingCards.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * remainingCards.length);
    const drawnCard = remainingCards[randomIndex];
    drawnCards.push(drawnCard);
    cardsToDrawCount--;
    
    // Handle cascade effects
    if (drawnCard.cascadeCount) {
      cardsToDrawCount += drawnCard.cascadeCount;
    }
  }
  
  return drawnCards;
}
