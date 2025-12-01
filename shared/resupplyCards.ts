/**
 * Resupply Cards data - translated from Armageddon Campaign rules
 * These cards can be purchased during the Resupply step of the Command Phase
 */

export interface ResupplyCardData {
  nameEn: string;
  namePt: string;
  cost: number;
  descriptionEn: string;
  descriptionPt: string;
  tags: string[];
  maxPerPlayer?: number; // undefined = unlimited
  maxPerTurn?: number; // undefined = unlimited
}

export const RESUPPLY_CARDS: ResupplyCardData[] = [
  // 8 SP Cards
  {
    nameEn: "A Change of Plans",
    namePt: "Mudança de Planos",
    cost: 8,
    descriptionEn: "Draw up to two additional Secret Objectives from the Secret Objective Deck.\n\nChoose one of your secret objectives.\n\nPlace all but the chosen Secret Objective card back into the Secret Objective deck face down, then shuffle the deck.",
    descriptionPt: "Compre até dois Objetivos Secretos adicionais do Baralho de Objetivos Secretos.\n\nEscolha um dos seus objetivos secretos.\n\nColoque todos os Objetivos Secretos, exceto o escolhido, de volta no baralho virado para baixo e embaralhe o baralho.",
    tags: [],
  },
  {
    nameEn: "Artillery Strike",
    namePt: "Ataque de Artilharia",
    cost: 8,
    descriptionEn: "Place a 40mm marker anywhere on the battlefield more than 6\" away from all friendly and enemy models. For each unit within 6\" of the marker, roll one D6 for every model in each unit within 6\" of the marker. For every 6+ that unit suffers 1 mortal wound. Vehicle units suffer 3 mortal wounds for each 6+ instead. Remove the marker from the battlefield.",
    descriptionPt: "Coloque um marcador de 40mm em qualquer lugar do campo de batalha a mais de 6\" de todos os modelos aliados e inimigos. Para cada unidade dentro de 6\" do marcador, role um D6 para cada modelo na unidade. Para cada 6+, a unidade sofre 1 ferida mortal. Unidades de Veículo sofrem 3 feridas mortais para cada 6+. Remova o marcador do campo de batalha.",
    tags: ["Strike"],
  },
  {
    nameEn: "Deploy Fortification",
    namePt: "Implantar Fortificação",
    cost: 8,
    descriptionEn: "Pick a Fortification unit from your faction's Spawning Table that you own but is outside of the minimum Spawning Bracket roll for that Fortification. Set that Fortification up on the battlefield.\n\n(Maximum one use per turn per player.)",
    descriptionPt: "Escolha uma unidade de Fortificação da Tabela de Geração da sua facção que você possui, mas que está fora do intervalo mínimo de rolagem de Geração para essa Fortificação. Configure essa Fortificação no campo de batalha.\n\n(Máximo um uso por turno por jogador.)",
    tags: ["Supply", "Fortify"],
    maxPerTurn: 1,
  },

  // X SP Cards (Variable cost)
  {
    nameEn: "Field Promotion",
    namePt: "Promoção de Campo",
    cost: 0, // Variable: X SP
    descriptionEn: "Destroy a unit you own that is not locked in combat.\n\nLook up the Spawning Table bracket of the destroyed unit. If multiple sizes of the unit exist, select the size you want. If that unit has 3 models remaining it would count as Hellblaster squad with 3 models remaining for example.\n\nRoll one D6, adding a value equal to that bracket's minimum value.\n\nYou may pay X, an amount of SP equal to the modified roll. If you do, select a unit of your choice from the Spawning Table bracket for your army corresponding to the modified roll. You may pick a new unit or you may pick a unit that already exists in your army. You may not place more models in the new unit than were in the destroyed unit. (If you did not pay X, Field Promotion has no effect and the unit is destroyed.)\n\nSet up that unit on the battlefield as close as possible to the original unit's position. The unit may not be set up within engagement range of any enemy models and may not be set up within 6\" of any enemy models or objective markers.\n\n(Maximum one use per turn per player.)",
    descriptionPt: "Destrua uma unidade sua que não esteja travada em combate.\n\nConsulte o intervalo da Tabela de Geração da unidade destruída. Se existirem vários tamanhos da unidade, selecione o tamanho desejado. Se essa unidade tiver 3 modelos restantes, contaria como esquadrão Hellblaster com 3 modelos restantes, por exemplo.\n\nRole um D6, adicionando um valor igual ao valor mínimo desse intervalo.\n\nVocê pode pagar X, uma quantidade de SP igual à rolagem modificada. Se o fizer, selecione uma unidade de sua escolha do intervalo da Tabela de Geração para seu exército correspondente à rolagem modificada. Você pode escolher uma nova unidade ou pode escolher uma unidade que já existe em seu exército. Você não pode colocar mais modelos na nova unidade do que havia na unidade destruída. (Se você não pagou X, Promoção de Campo não tem efeito e a unidade é destruída.)\n\nConfigure essa unidade no campo de batalha o mais próximo possível da posição da unidade original. A unidade não pode ser configurada dentro do alcance de engajamento de modelos inimigos e não pode ser configurada dentro de 6\" de modelos inimigos ou marcadores de objetivo.\n\n(Máximo um uso por turno por jogador.)",
    tags: ["Spawn"],
    maxPerTurn: 1,
  },
  {
    nameEn: "Patched Up",
    namePt: "Remendado",
    cost: 0, // Variable: X SP
    descriptionEn: "Choose a unit you own that is not locked in combat. Pay X, an amount of SP equal to the unit's starting strength, including any lost attached Characters.\n\nReturn the chosen unit to its starting strength.\n\n(Maximum one use per turn per player.)",
    descriptionPt: "Escolha uma unidade sua que não esteja travada em combate. Pague X, uma quantidade de SP igual à força inicial da unidade, incluindo quaisquer Personagens anexados perdidos.\n\nRetorne a unidade escolhida à sua força inicial.\n\n(Máximo um uso por turno por jogador.)",
    tags: ["Tactics"],
    maxPerTurn: 1,
  },

  // 12 SP Cards
  {
    nameEn: "Reinforcements Arrive",
    namePt: "Reforços Chegam",
    cost: 12,
    descriptionEn: "Roll 2D6 and select a unit of your choice from the corresponding bracket of your faction's Spawning Table. If no unit in that spawning bracket is available you may instead select a unit of a lower bracket instead. (Roll of 2 fails.)\n\n(Maximum one use per turn per player.)",
    descriptionPt: "Role 2D6 e selecione uma unidade de sua escolha do intervalo correspondente da Tabela de Geração da sua facção. Se nenhuma unidade nesse intervalo de geração estiver disponível, você pode selecionar uma unidade de um intervalo inferior. (Rolagem de 2 falha.)\n\n(Máximo um uso por turno por jogador.)",
    tags: ["Spawn"],
    maxPerTurn: 1,
  },

  // 6 SP Cards
  {
    nameEn: "Activate Shield Generator",
    namePt: "Ativar Gerador de Escudo",
    cost: 6,
    descriptionEn: "Place a Shield Generator Marker on a non-Fortified objective marker. It is now Fortified and counts as a Shield Generator. No more than 1 Shield Generator can exist at once.\n\nWhen making Spawn Rolls for the Horde, subtract 1 from the roll as long as the Shield Generator is on the battlefield.\n\nFriendly units wholly within range of a Shield Generator gain the 6+ Feel No Pain ability. Friendly units wholly within range of a Shield Generator that are models not within range of the Shield Generator.\n\nFortified Markers on objective markers are destroyed if a Horde unit gains control of that objective marker.",
    descriptionPt: "Coloque um Marcador de Gerador de Escudo em um marcador de objetivo não fortificado. Agora está Fortificado e conta como um Gerador de Escudo. Não pode existir mais de 1 Gerador de Escudo ao mesmo tempo.\n\nAo fazer Rolagens de Geração para a Horda, subtraia 1 da rolagem enquanto o Gerador de Escudo estiver no campo de batalha.\n\nUnidades aliadas totalmente dentro do alcance de um Gerador de Escudo ganham a habilidade Sentir Sem Dor 6+. Unidades aliadas totalmente dentro do alcance de um Gerador de Escudo que são modelos não dentro do alcance do Gerador de Escudo.\n\nMarcadores Fortificados em marcadores de objetivo são destruídos se uma unidade Horda ganhar controle desse marcador de objetivo.",
    tags: ["Fortify"],
  },
  {
    nameEn: "Advanced Tactics",
    namePt: "Táticas Avançadas",
    cost: 6,
    descriptionEn: "Remove one active Secondary Mission and reveal a new one.\n\n(Maximum one use per turn for the whole team.)",
    descriptionPt: "Remova uma Missão Secundária ativa e revele uma nova.\n\n(Máximo um uso por turno para toda a equipe.)",
    tags: ["Secondary", "Tactics"],
    maxPerTurn: 1,
  },
  {
    nameEn: "Deploy Minefield",
    namePt: "Implantar Campo Minado",
    cost: 6,
    descriptionEn: "Place a 40mm marker wholly within No Man's Land and more than 6\" away from all friendly and enemy models and objective markers. This marker is a Minefield. No more than 1 Minefield may exist at once. You cannot place a Minefield if a Minefield already exists on the battlefield.\n\nKeep track of damage dealt by this Minefield over the game. If a unit starts or ends a Move, Retreat, Advance, or Charge within 4\" of a Minefield, roll 1D6. On a 4+, that unit suffers D3 mortal wounds. Units within 1\" of a Minefield reduce their Advance and Charge rolls by 1 and suffer a -1 to hit penalty from their Advance and Charge rolls.\n\nAt the end of each battle round, if the total damage dealt by this Minefield is 10 or more, remove the Minefield from the battlefield.",
    descriptionPt: "Coloque um marcador de 40mm totalmente dentro da Terra de Ninguém e a mais de 6\" de todos os modelos aliados e inimigos e marcadores de objetivo. Este marcador é um Campo Minado. Não pode existir mais de 1 Campo Minado ao mesmo tempo. Você não pode colocar um Campo Minado se já existir um Campo Minado no campo de batalha.\n\nAcompanhe o dano causado por este Campo Minado durante o jogo. Se uma unidade começar ou terminar um Movimento, Recuo, Avanço ou Carga dentro de 4\" de um Campo Minado, role 1D6. Em um 4+, essa unidade sofre D3 feridas mortais. Unidades dentro de 1\" de um Campo Minado reduzem suas rolagens de Avanço e Carga em 1 e sofrem uma penalidade de -1 para acertar de suas rolagens de Avanço e Carga.\n\nNo final de cada rodada de batalha, se o dano total causado por este Campo Minado for 10 ou mais, remova o Campo Minado do campo de batalha.",
    tags: ["Supply", "Strike"],
  },

  // 5 SP Cards
  {
    nameEn: "Activate Jamming Station",
    namePt: "Ativar Estação de Interferência",
    cost: 5,
    descriptionEn: "Place an Jammer Marker on a non-Fortified objective marker. It is now Fortified and counts as a Jamming Station. No more than 1 Jamming Station can exist at once.\n\nWhen making Spawn Rolls for the Horde, subtract 1 from the roll as long as the Jamming Station is on the battlefield.\n\nFortified Markers on objective markers are destroyed if a Horde unit gains control of that objective marker.",
    descriptionPt: "Coloque um Marcador de Interferência em um marcador de objetivo não fortificado. Agora está Fortificado e conta como uma Estação de Interferência. Não pode existir mais de 1 Estação de Interferência ao mesmo tempo.\n\nAo fazer Rolagens de Geração para a Horda, subtraia 1 da rolagem enquanto a Estação de Interferência estiver no campo de batalha.\n\nMarcadores Fortificados em marcadores de objetivo são destruídos se uma unidade Horda ganhar controle desse marcador de objetivo.",
    tags: ["Fortify"],
  },
  {
    nameEn: "Ammo Supplies",
    namePt: "Suprimentos de Munição",
    cost: 5,
    descriptionEn: "Place an Ammo Marker on a non-Fortified objective marker. It is now Fortified and counts as an Ammo Dump. No more than 1 Ammo Dump can exist at once.\n\nUnits wholly within 3\" of an Ammo Dump, ranged weapons equipped by friendly units have the Sustained Hits 1 ability.\n\nFortified Markers on objective markers are destroyed if a Horde unit gains control of that objective marker.",
    descriptionPt: "Coloque um Marcador de Munição em um marcador de objetivo não fortificado. Agora está Fortificado e conta como um Depósito de Munição. Não pode existir mais de 1 Depósito de Munição ao mesmo tempo.\n\nUnidades totalmente dentro de 3\" de um Depósito de Munição, armas de longo alcance equipadas por unidades aliadas têm a habilidade Acertos Sustentados 1.\n\nMarcadores Fortificados em marcadores de objetivo são destruídos se uma unidade Horda ganhar controle desse marcador de objetivo.",
    tags: ["Fortify"],
  },
  {
    nameEn: "Emergency Evac",
    namePt: "Evacuação de Emergência",
    cost: 5,
    descriptionEn: "Choose a unit you own that is not locked in combat and remove it from the battlefield. At the end of your next Movement phase, set that unit up following the rules for Strategic Reserves. (They may enter this turn.)\n\nIf you do not within the time such a unit uses for Strategic Reserves, then immediately disembark the unit from a different Teleporter following normal disembarkation rules. You cannot disembark from the other Teleporter it is destroyed.\n\nTeleport: Remove this unit from the battlefield and place it into Reserves, then immediately disembark the unit from a different Teleporter following normal disembarkation rules. You cannot disembark from the other Teleporter it is destroyed.",
    descriptionPt: "Escolha uma unidade sua que não esteja travada em combate e remova-a do campo de batalha. No final da sua próxima fase de Movimento, configure essa unidade seguindo as regras de Reservas Estratégicas. (Eles podem entrar neste turno.)\n\nSe você não fizer isso dentro do tempo que tal unidade usa para Reservas Estratégicas, desembarque imediatamente a unidade de um Teleportador diferente seguindo as regras normais de desembarque. Você não pode desembarcar do outro Teleportador se ele for destruído.\n\nTeleporte: Remova esta unidade do campo de batalha e coloque-a em Reservas, em seguida, desembarque imediatamente a unidade de um Teleportador diferente seguindo as regras normais de desembarque. Você não pode desembarcar do outro Teleportador se ele for destruído.",
    tags: ["Tactics"],
  },

  // 4 SP Cards
  {
    nameEn: "Arm Experimental Defenses",
    namePt: "Armar Defesas Experimentais",
    cost: 4,
    descriptionEn: "Place a Lightning Marker on a non-Fortified objective marker. It is now Fortified and counts as a Warp-Relic Outpost. No more than 1 Warp-Relic Outpost can exist at once.\n\nAt the beginning of the Player Fight phase, each Horde unit within 9\" of a Warp-Relic Outpost suffers 3 mortal wounds. Player Horde units suffer 1 mortal wound.\n\nFortified Markers on objective markers are destroyed if a Horde unit gains control of that objective marker.",
    descriptionPt: "Coloque um Marcador de Relâmpago em um marcador de objetivo não fortificado. Agora está Fortificado e conta como um Posto Avançado de Relíquia Warp. Não pode existir mais de 1 Posto Avançado de Relíquia Warp ao mesmo tempo.\n\nNo início da fase de Luta do Jogador, cada unidade Horda dentro de 9\" de um Posto Avançado de Relíquia Warp sofre 3 feridas mortais. Unidades Horda do Jogador sofrem 1 ferida mortal.\n\nMarcadores Fortificados em marcadores de objetivo são destruídos se uma unidade Horda ganhar controle desse marcador de objetivo.",
    tags: ["Fortify"],
  },
  {
    nameEn: "Defensive Positions",
    namePt: "Posições Defensivas",
    cost: 4,
    descriptionEn: "Set up a ruin with maximum dimensions 9\"x9\" anywhere on the battlefield. It must be 9\" away from all enemy models and other terrain, and must not have walls that cover the base of any model on the battlefield.\n\n(Maximum one use per turn for the entire team.)",
    descriptionPt: "Configure uma ruína com dimensões máximas de 9\"x9\" em qualquer lugar do campo de batalha. Deve estar a 9\" de todos os modelos inimigos e outros terrenos, e não deve ter paredes que cubram a base de qualquer modelo no campo de batalha.\n\n(Máximo um uso por turno para toda a equipe.)",
    tags: ["Supply", "Fortify"],
    maxPerTurn: 1,
  },
  {
    nameEn: "Deploy Razor Wire",
    namePt: "Implantar Arame Farpado",
    cost: 4,
    descriptionEn: "Place a 40mm marker wholly within 3\" of a target unit you own that is not locked in combat and more than 3\" away from all enemy models and objective markers. This marker is a Razor Wire. No more than 2 Razor Wires may exist at once. If you use this ability with 2 Razor Wire already deployed, place a 3rd and then choose one to remove from the battlefield.\n\nIf a unit begins or ends a move within 1\" of Razor Wire during any movement or charge phase that unit suffers D3 mortal wounds. Units within 1\" of Razor Wire reduce their Advance and Charge rolls by 1 and suffer a -1 to hit penalty from their Advance and Charge rolls.",
    descriptionPt: "Coloque um marcador de 40mm totalmente dentro de 3\" de uma unidade alvo sua que não esteja travada em combate e a mais de 3\" de todos os modelos inimigos e marcadores de objetivo. Este marcador é um Arame Farpado. Não podem existir mais de 2 Arames Farpados ao mesmo tempo. Se você usar esta habilidade com 2 Arames Farpados já implantados, coloque um 3º e escolha um para remover do campo de batalha.\n\nSe uma unidade começar ou terminar um movimento dentro de 1\" de Arame Farpado durante qualquer fase de movimento ou carga, essa unidade sofre D3 feridas mortais. Unidades dentro de 1\" de Arame Farpado reduzem suas rolagens de Avanço e Carga em 1 e sofrem uma penalidade de -1 para acertar de suas rolagens de Avanço e Carga.",
    tags: ["Supply", "Strike"],
  },
  {
    nameEn: "Emergency Shovel Stash",
    namePt: "Estoque de Pás de Emergência",
    cost: 4,
    descriptionEn: "Place a Shovel Marker on a non-Fortified objective marker. It is now Fortified and counts as a Memelord Fort. No more than 1 Memelord Fort can exist at once.\n\nEach time a friendly model in a unit wholly within 3\" of a Memelord Fort makes a melee attack, add 1 to the Strength characteristic of that attack and add 1 to the Damage characteristic of that attack by 1.\n\nFortified Markers on objective markers are destroyed if a Horde unit gains control of that objective marker.",
    descriptionPt: "Coloque um Marcador de Pá em um marcador de objetivo não fortificado. Agora está Fortificado e conta como um Forte Memelord. Não pode existir mais de 1 Forte Memelord ao mesmo tempo.\n\nCada vez que um modelo aliado em uma unidade totalmente dentro de 3\" de um Forte Memelord faz um ataque corpo a corpo, adicione 1 à característica de Força desse ataque e adicione 1 à característica de Dano desse ataque em 1.\n\nMarcadores Fortificados em marcadores de objetivo são destruídos se uma unidade Horda ganhar controle desse marcador de objetivo.",
    tags: ["Fortify"],
  },
  {
    nameEn: "Field Hospital",
    namePt: "Hospital de Campo",
    cost: 4,
    descriptionEn: "Place a MASH Marker on a non-Fortified objective marker. It is now Fortified and counts as a Field Hospital. No more than 1 Field Hospital can exist at once. Humming sounds emanate while placing this marker is a Field Hospital.\n\nIn the Reinforcements step of your Movement phase, Players can heal up to 3 wounds for each unit they own wholly within range of a Field Hospital. Each time such a unit:\n  - If that unit contains one or more models with fewer than their starting number of wounds, that model regains one lost wound.\n  - If all models in that unit have their starting number of wounds, but that unit is not at its Starting Strength, one destroyed model from that unit (excluding any attached Characters) is returned to that unit with one wound remaining.\n\nThis ability cannot be used to return destroyed units or any attached units.\n\nFortified Markers on objective markers are destroyed if a Horde unit gains control of that objective marker.",
    descriptionPt: "Coloque um Marcador MASH em um marcador de objetivo não fortificado. Agora está Fortificado e conta como um Hospital de Campo. Não pode existir mais de 1 Hospital de Campo ao mesmo tempo. Sons de zumbido emanam enquanto este marcador é colocado como um Hospital de Campo.\n\nNa etapa de Reforços da sua fase de Movimento, os Jogadores podem curar até 3 feridas para cada unidade que possuem totalmente dentro do alcance de um Hospital de Campo. Cada vez que tal unidade:\n  - Se essa unidade contiver um ou mais modelos com menos do que seu número inicial de feridas, esse modelo recupera uma ferida perdida.\n  - Se todos os modelos dessa unidade tiverem seu número inicial de feridas, mas essa unidade não estiver em sua Força Inicial, um modelo destruído dessa unidade (excluindo quaisquer Personagens anexados) é devolvido a essa unidade com uma ferida restante.\n\nEsta habilidade não pode ser usada para devolver unidades destruídas ou quaisquer unidades anexadas.\n\nMarcadores Fortificados em marcadores de objetivo são destruídos se uma unidade Horda ganhar controle desse marcador de objetivo.",
    tags: ["Fortify"],
  },
  {
    nameEn: "Tempt Fate",
    namePt: "Tentar o Destino",
    cost: 4,
    descriptionEn: "Reveal a second Secondary Mission. Record each Secondary Mission separately. Players can complete both Missions, but no more than two can be active in any round. (Maximum one use per turn for the whole team.)",
    descriptionPt: "Revele uma segunda Missão Secundária. Registre cada Missão Secundária separadamente. Os jogadores podem completar ambas as Missões, mas não mais de duas podem estar ativas em qualquer rodada. (Máximo um uso por turno para toda a equipe.)",
    tags: ["Secondary"],
    maxPerTurn: 1,
  },

  // 3 SP Cards
  {
    nameEn: "Air Strike",
    namePt: "Ataque Aéreo",
    cost: 3,
    descriptionEn: "Select an area terrain. Each unit within it suffers 2D3 mortal wounds, then remove that area terrain from the battlefield.",
    descriptionPt: "Selecione um terreno de área. Cada unidade dentro dele sofre 2D3 feridas mortais, em seguida, remova esse terreno de área do campo de batalha.",
    tags: ["Strike"],
  },
  {
    nameEn: "Deploy Short Range Teleporter",
    namePt: "Implantar Teleportador de Curto Alcance",
    cost: 3,
    descriptionEn: "Place a 40mm marker wholly within 3\" of a target unit you own that is not locked in combat and more than 3\" away from all enemy models and objective markers. This marker is a Teleporter. No more than 3 Teleporters may exist at once. If you use this ability with 3 Teleporters already deployed, place a 4th and then choose one to remove from the battlefield.\n\nFriendly units who end a turn within 1\" of a Teleporter while there are at least 2 Teleporters on the battlefield may teleport.\n\nIf a Horde unit ends a turn within 1\" of a Teleporter, remove the Teleporter from the Battlefield.\n\nTeleport: Remove this unit from the battlefield and place it into Reserves, then immediately disembark the unit from a different Teleporter following normal disembarkation rules. You cannot disembark from the other Teleporter it is destroyed.",
    descriptionPt: "Coloque um marcador de 40mm totalmente dentro de 3\" de uma unidade alvo sua que não esteja travada em combate e a mais de 3\" de todos os modelos inimigos e marcadores de objetivo. Este marcador é um Teleportador. Não podem existir mais de 3 Teleportadores ao mesmo tempo. Se você usar esta habilidade com 3 Teleportadores já implantados, coloque um 4º e escolha um para remover do campo de batalha.\n\nUnidades aliadas que terminam um turno dentro de 1\" de um Teleportador enquanto houver pelo menos 2 Teleportadores no campo de batalha podem se teletransportar.\n\nSe uma unidade Horda terminar um turno dentro de 1\" de um Teleportador, remova o Teleportador do Campo de Batalha.\n\nTeleporte: Remova esta unidade do campo de batalha e coloque-a em Reservas, em seguida, desembarque imediatamente a unidade de um Teleportador diferente seguindo as regras normais de desembarque. Você não pode desembarcar do outro Teleportador se ele for destruído.",
    tags: ["Supply"],
  },
  {
    nameEn: "Forward Operating Base",
    namePt: "Base de Operações Avançada",
    cost: 3,
    descriptionEn: "Place a FOB Marker on a non-Fortified objective marker. It is now Fortified and counts as a Forward Operating Base. No more than 1 Forward Operating Base can exist at once.\n\nPlayers gain an additional SP for controlling a Forward Operating Base when gaining SP in the Resupply step.\n\nFortified Markers on objective markers are destroyed if a Horde unit gains control of that objective marker.",
    descriptionPt: "Coloque um Marcador FOB em um marcador de objetivo não fortificado. Agora está Fortificado e conta como uma Base de Operações Avançada. Não pode existir mais de 1 Base de Operações Avançada ao mesmo tempo.\n\nJogadores ganham um SP adicional por controlar uma Base de Operações Avançada ao ganhar SP na etapa de Reabastecimento.\n\nMarcadores Fortificados em marcadores de objetivo são destruídos se uma unidade Horda ganhar controle desse marcador de objetivo.",
    tags: ["Fortify"],
  },
  {
    nameEn: "Pizza Party",
    namePt: "Festa de Pizza",
    cost: 3,
    descriptionEn: "Choose a Battle-shocked unit owned by any player. That unit is no longer Battle-shocked.",
    descriptionPt: "Escolha uma unidade em Choque de Batalha pertencente a qualquer jogador. Essa unidade não está mais em Choque de Batalha.",
    tags: ["Tactics", "Supply"],
  },
  {
    nameEn: "Share Supplies",
    namePt: "Compartilhar Suprimentos",
    cost: 3,
    descriptionEn: "Grant 2SP to another player.",
    descriptionPt: "Conceda 2SP a outro jogador.",
    tags: ["Tactics"],
  },
  {
    nameEn: "Supply Drop",
    namePt: "Lançamento de Suprimentos",
    cost: 3,
    descriptionEn: "Add a new objective marker to No Man's Land, at least 6\" from all board edges and at least 6\" from all other objective markers.\n\n(A maximum of 6 objective markers may be in play at once.)",
    descriptionPt: "Adicione um novo marcador de objetivo à Terra de Ninguém, a pelo menos 6\" de todas as bordas do tabuleiro e a pelo menos 6\" de todos os outros marcadores de objetivo.\n\n(Um máximo de 6 marcadores de objetivo podem estar em jogo ao mesmo tempo.)",
    tags: ["Supply"],
  },

  // 2 SP Cards
  {
    nameEn: "Basic Tactics",
    namePt: "Táticas Básicas",
    cost: 2,
    descriptionEn: "Gain 1CP.",
    descriptionPt: "Ganhe 1CP.",
    tags: ["Tactics"],
  },

  // 1 SP Cards
  {
    nameEn: "A Name Earned",
    namePt: "Um Nome Conquistado",
    cost: 1,
    descriptionEn: "Add an enhancement to a character without one. Follow all Index/Codex rules. For each Index/Codex, only one copy of any enhancement may exist at once.",
    descriptionPt: "Adicione um aprimoramento a um personagem sem um. Siga todas as regras do Índice/Codex. Para cada Índice/Codex, apenas uma cópia de qualquer aprimoramento pode existir ao mesmo tempo.",
    tags: ["Tactics"],
  },
];
