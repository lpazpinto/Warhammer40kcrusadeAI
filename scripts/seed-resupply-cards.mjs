#!/usr/bin/env node
/**
 * Seed script to populate resupply cards in the database
 * Run with: node scripts/seed-resupply-cards.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const RESUPPLY_CARDS = [
  // 8 SP Cards
  {
    nameEn: "A Change of Plans",
    namePt: "Mudança de Planos",
    cost: 8,
    descriptionEn: "Draw up to two additional Secret Objectives from the Secret Objective Deck.\n\nChoose one of your secret objectives.\n\nPlace all but the chosen Secret Objective card back into the Secret Objective deck face down, then shuffle the deck.",
    descriptionPt: "Compre até dois Objetivos Secretos adicionais do Baralho de Objetivos Secretos.\n\nEscolha um dos seus objetivos secretos.\n\nColoque todos os Objetivos Secretos, exceto o escolhido, de volta no baralho virado para baixo e embaralhe o baralho.",
    tags: "",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Artillery Strike",
    namePt: "Ataque de Artilharia",
    cost: 8,
    descriptionEn: "Place a 40mm marker anywhere on the battlefield more than 6\" away from all friendly and enemy models. For each unit within 6\" of the marker, roll one D6 for every model in each unit within 6\" of the marker. For every 6+ that unit suffers 1 mortal wound. Vehicle units suffer 3 mortal wounds for each 6+ instead. Remove the marker from the battlefield.",
    descriptionPt: "Coloque um marcador de 40mm em qualquer lugar do campo de batalha a mais de 6\" de todos os modelos aliados e inimigos. Para cada unidade dentro de 6\" do marcador, role um D6 para cada modelo na unidade. Para cada 6+, a unidade sofre 1 ferida mortal. Unidades de Veículo sofrem 3 feridas mortais para cada 6+. Remova o marcador do campo de batalha.",
    tags: "Strike",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Deploy Fortification",
    namePt: "Implantar Fortificação",
    cost: 8,
    descriptionEn: "Pick a Fortification unit from your faction's Spawning Table that you own but is outside of the minimum Spawning Bracket roll for that Fortification. Set that Fortification up on the battlefield.\n\n(Maximum one use per turn per player.)",
    descriptionPt: "Escolha uma unidade de Fortificação da Tabela de Geração da sua facção que você possui, mas que está fora do intervalo mínimo de rolagem de Geração para essa Fortificação. Configure essa Fortificação no campo de batalha.\n\n(Máximo um uso por turno por jogador.)",
    tags: "Supply,Fortify",
    maxPerPlayer: null,
    maxPerTurn: 1,
  },

  // X SP Cards (Variable cost - set to 0)
  {
    nameEn: "Field Promotion",
    namePt: "Promoção de Campo",
    cost: 0,
    descriptionEn: "Destroy a unit you own that is not locked in combat. Look up the Spawning Table bracket of the destroyed unit. Roll one D6, adding a value equal to that bracket's minimum value. You may pay X SP equal to the modified roll. If you do, select a unit from the Spawning Table bracket corresponding to the modified roll. Set up that unit on the battlefield as close as possible to the original unit's position. (Maximum one use per turn per player.)",
    descriptionPt: "Destrua uma unidade sua que não esteja travada em combate. Consulte o intervalo da Tabela de Geração da unidade destruída. Role um D6, adicionando um valor igual ao valor mínimo desse intervalo. Você pode pagar X SP igual à rolagem modificada. Se o fizer, selecione uma unidade do intervalo da Tabela de Geração correspondente à rolagem modificada. Configure essa unidade no campo de batalha o mais próximo possível da posição da unidade original. (Máximo um uso por turno por jogador.)",
    tags: "Spawn",
    maxPerPlayer: null,
    maxPerTurn: 1,
  },
  {
    nameEn: "Patched Up",
    namePt: "Remendado",
    cost: 0,
    descriptionEn: "Choose a unit you own that is not locked in combat. Pay X SP equal to the unit's starting strength, including any lost attached Characters. Return the chosen unit to its starting strength. (Maximum one use per turn per player.)",
    descriptionPt: "Escolha uma unidade sua que não esteja travada em combate. Pague X SP igual à força inicial da unidade, incluindo quaisquer Personagens anexados perdidos. Retorne a unidade escolhida à sua força inicial. (Máximo um uso por turno por jogador.)",
    tags: "Tactics",
    maxPerPlayer: null,
    maxPerTurn: 1,
  },

  // 12 SP Cards
  {
    nameEn: "Reinforcements Arrive",
    namePt: "Reforços Chegam",
    cost: 12,
    descriptionEn: "Roll 2D6 and select a unit of your choice from the corresponding bracket of your faction's Spawning Table. If no unit in that spawning bracket is available you may instead select a unit of a lower bracket instead. (Roll of 2 fails.) (Maximum one use per turn per player.)",
    descriptionPt: "Role 2D6 e selecione uma unidade de sua escolha do intervalo correspondente da Tabela de Geração da sua facção. Se nenhuma unidade nesse intervalo de geração estiver disponível, você pode selecionar uma unidade de um intervalo inferior. (Rolagem de 2 falha.) (Máximo um uso por turno por jogador.)",
    tags: "Spawn",
    maxPerPlayer: null,
    maxPerTurn: 1,
  },

  // 6 SP Cards
  {
    nameEn: "Activate Shield Generator",
    namePt: "Ativar Gerador de Escudo",
    cost: 6,
    descriptionEn: "Place a Shield Generator Marker on a non-Fortified objective marker. It is now Fortified and counts as a Shield Generator. No more than 1 Shield Generator can exist at once. When making Spawn Rolls for the Horde, subtract 1 from the roll as long as the Shield Generator is on the battlefield. Friendly units wholly within range of a Shield Generator gain the 6+ Feel No Pain ability.",
    descriptionPt: "Coloque um Marcador de Gerador de Escudo em um marcador de objetivo não fortificado. Agora está Fortificado e conta como um Gerador de Escudo. Não pode existir mais de 1 Gerador de Escudo ao mesmo tempo. Ao fazer Rolagens de Geração para a Horda, subtraia 1 da rolagem enquanto o Gerador de Escudo estiver no campo de batalha. Unidades aliadas totalmente dentro do alcance de um Gerador de Escudo ganham a habilidade Sentir Sem Dor 6+.",
    tags: "Fortify",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Advanced Tactics",
    namePt: "Táticas Avançadas",
    cost: 6,
    descriptionEn: "Remove one active Secondary Mission and reveal a new one. (Maximum one use per turn for the whole team.)",
    descriptionPt: "Remova uma Missão Secundária ativa e revele uma nova. (Máximo um uso por turno para toda a equipe.)",
    tags: "Secondary,Tactics",
    maxPerPlayer: null,
    maxPerTurn: 1,
  },
  {
    nameEn: "Deploy Minefield",
    namePt: "Implantar Campo Minado",
    cost: 6,
    descriptionEn: "Place a 40mm marker wholly within No Man's Land and more than 6\" away from all friendly and enemy models and objective markers. This marker is a Minefield. If a unit starts or ends a Move, Retreat, Advance, or Charge within 4\" of a Minefield, roll 1D6. On a 4+, that unit suffers D3 mortal wounds. At the end of each battle round, if the total damage dealt by this Minefield is 10 or more, remove it from the battlefield.",
    descriptionPt: "Coloque um marcador de 40mm totalmente dentro da Terra de Ninguém e a mais de 6\" de todos os modelos aliados e inimigos e marcadores de objetivo. Este marcador é um Campo Minado. Se uma unidade começar ou terminar um Movimento, Recuo, Avanço ou Carga dentro de 4\" de um Campo Minado, role 1D6. Em um 4+, essa unidade sofre D3 feridas mortais. No final de cada rodada de batalha, se o dano total causado por este Campo Minado for 10 ou mais, remova-o do campo de batalha.",
    tags: "Supply,Strike",
    maxPerPlayer: null,
    maxPerTurn: null,
  },

  // 5 SP Cards
  {
    nameEn: "Activate Jamming Station",
    namePt: "Ativar Estação de Interferência",
    cost: 5,
    descriptionEn: "Place an Jammer Marker on a non-Fortified objective marker. It is now Fortified and counts as a Jamming Station. When making Spawn Rolls for the Horde, subtract 1 from the roll as long as the Jamming Station is on the battlefield.",
    descriptionPt: "Coloque um Marcador de Interferência em um marcador de objetivo não fortificado. Agora está Fortificado e conta como uma Estação de Interferência. Ao fazer Rolagens de Geração para a Horda, subtraia 1 da rolagem enquanto a Estação de Interferência estiver no campo de batalha.",
    tags: "Fortify",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Ammo Supplies",
    namePt: "Suprimentos de Munição",
    cost: 5,
    descriptionEn: "Place an Ammo Marker on a non-Fortified objective marker. It is now Fortified and counts as an Ammo Dump. Units wholly within 3\" of an Ammo Dump, ranged weapons equipped by friendly units have the Sustained Hits 1 ability.",
    descriptionPt: "Coloque um Marcador de Munição em um marcador de objetivo não fortificado. Agora está Fortificado e conta como um Depósito de Munição. Unidades totalmente dentro de 3\" de um Depósito de Munição, armas de longo alcance equipadas por unidades aliadas têm a habilidade Acertos Sustentados 1.",
    tags: "Fortify",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Emergency Evac",
    namePt: "Evacuação de Emergência",
    cost: 5,
    descriptionEn: "Choose a unit you own that is not locked in combat and remove it from the battlefield. At the end of your next Movement phase, set that unit up following the rules for Strategic Reserves.",
    descriptionPt: "Escolha uma unidade sua que não esteja travada em combate e remova-a do campo de batalha. No final da sua próxima fase de Movimento, configure essa unidade seguindo as regras de Reservas Estratégicas.",
    tags: "Tactics",
    maxPerPlayer: null,
    maxPerTurn: null,
  },

  // 4 SP Cards
  {
    nameEn: "Arm Experimental Defenses",
    namePt: "Armar Defesas Experimentais",
    cost: 4,
    descriptionEn: "Place a Lightning Marker on a non-Fortified objective marker. It is now Fortified and counts as a Warp-Relic Outpost. At the beginning of the Player Fight phase, each Horde unit within 9\" of a Warp-Relic Outpost suffers 3 mortal wounds.",
    descriptionPt: "Coloque um Marcador de Relâmpago em um marcador de objetivo não fortificado. Agora está Fortificado e conta como um Posto Avançado de Relíquia Warp. No início da fase de Luta do Jogador, cada unidade Horda dentro de 9\" de um Posto Avançado de Relíquia Warp sofre 3 feridas mortais.",
    tags: "Fortify",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Defensive Positions",
    namePt: "Posições Defensivas",
    cost: 4,
    descriptionEn: "Set up a ruin with maximum dimensions 9\"x9\" anywhere on the battlefield. It must be 9\" away from all enemy models and other terrain. (Maximum one use per turn for the entire team.)",
    descriptionPt: "Configure uma ruína com dimensões máximas de 9\"x9\" em qualquer lugar do campo de batalha. Deve estar a 9\" de todos os modelos inimigos e outros terrenos. (Máximo um uso por turno para toda a equipe.)",
    tags: "Supply,Fortify",
    maxPerPlayer: null,
    maxPerTurn: 1,
  },
  {
    nameEn: "Deploy Razor Wire",
    namePt: "Implantar Arame Farpado",
    cost: 4,
    descriptionEn: "Place a 40mm marker wholly within 3\" of a target unit you own that is not locked in combat and more than 3\" away from all enemy models. This marker is a Razor Wire. If a unit begins or ends a move within 1\" of Razor Wire during any movement or charge phase that unit suffers D3 mortal wounds.",
    descriptionPt: "Coloque um marcador de 40mm totalmente dentro de 3\" de uma unidade alvo sua que não esteja travada em combate e a mais de 3\" de todos os modelos inimigos. Este marcador é um Arame Farpado. Se uma unidade começar ou terminar um movimento dentro de 1\" de Arame Farpado durante qualquer fase de movimento ou carga, essa unidade sofre D3 feridas mortais.",
    tags: "Supply,Strike",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Emergency Shovel Stash",
    namePt: "Estoque de Pás de Emergência",
    cost: 4,
    descriptionEn: "Place a Shovel Marker on a non-Fortified objective marker. It is now Fortified and counts as a Memelord Fort. Each time a friendly model in a unit wholly within 3\" of a Memelord Fort makes a melee attack, add 1 to the Strength and Damage characteristics of that attack.",
    descriptionPt: "Coloque um Marcador de Pá em um marcador de objetivo não fortificado. Agora está Fortificado e conta como um Forte Memelord. Cada vez que um modelo aliado em uma unidade totalmente dentro de 3\" de um Forte Memelord faz um ataque corpo a corpo, adicione 1 às características de Força e Dano desse ataque.",
    tags: "Fortify",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Field Hospital",
    namePt: "Hospital de Campo",
    cost: 4,
    descriptionEn: "Place a MASH Marker on a non-Fortified objective marker. It is now Fortified and counts as a Field Hospital. In the Reinforcements step of your Movement phase, Players can heal up to 3 wounds for each unit they own wholly within range of a Field Hospital.",
    descriptionPt: "Coloque um Marcador MASH em um marcador de objetivo não fortificado. Agora está Fortificado e conta como um Hospital de Campo. Na etapa de Reforços da sua fase de Movimento, os Jogadores podem curar até 3 feridas para cada unidade que possuem totalmente dentro do alcance de um Hospital de Campo.",
    tags: "Fortify",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Tempt Fate",
    namePt: "Tentar o Destino",
    cost: 4,
    descriptionEn: "Reveal a second Secondary Mission. Record each Secondary Mission separately. Players can complete both Missions, but no more than two can be active in any round. (Maximum one use per turn for the whole team.)",
    descriptionPt: "Revele uma segunda Missão Secundária. Registre cada Missão Secundária separadamente. Os jogadores podem completar ambas as Missões, mas não mais de duas podem estar ativas em qualquer rodada. (Máximo um uso por turno para toda a equipe.)",
    tags: "Secondary",
    maxPerPlayer: null,
    maxPerTurn: 1,
  },

  // 3 SP Cards
  {
    nameEn: "Air Strike",
    namePt: "Ataque Aéreo",
    cost: 3,
    descriptionEn: "Select an area terrain. Each unit within it suffers 2D3 mortal wounds, then remove that area terrain from the battlefield.",
    descriptionPt: "Selecione um terreno de área. Cada unidade dentro dele sofre 2D3 feridas mortais, em seguida, remova esse terreno de área do campo de batalha.",
    tags: "Strike",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Deploy Short Range Teleporter",
    namePt: "Implantar Teleportador de Curto Alcance",
    cost: 3,
    descriptionEn: "Place a 40mm marker wholly within 3\" of a target unit you own that is not locked in combat. This marker is a Teleporter. Friendly units who end a turn within 1\" of a Teleporter while there are at least 2 Teleporters on the battlefield may teleport.",
    descriptionPt: "Coloque um marcador de 40mm totalmente dentro de 3\" de uma unidade alvo sua que não esteja travada em combate. Este marcador é um Teleportador. Unidades aliadas que terminam um turno dentro de 1\" de um Teleportador enquanto houver pelo menos 2 Teleportadores no campo de batalha podem se teletransportar.",
    tags: "Supply",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Forward Operating Base",
    namePt: "Base de Operações Avançada",
    cost: 3,
    descriptionEn: "Place a FOB Marker on a non-Fortified objective marker. It is now Fortified and counts as a Forward Operating Base. Players gain an additional SP for controlling a Forward Operating Base when gaining SP in the Resupply step.",
    descriptionPt: "Coloque um Marcador FOB em um marcador de objetivo não fortificado. Agora está Fortificado e conta como uma Base de Operações Avançada. Jogadores ganham um SP adicional por controlar uma Base de Operações Avançada ao ganhar SP na etapa de Reabastecimento.",
    tags: "Fortify",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Pizza Party",
    namePt: "Festa de Pizza",
    cost: 3,
    descriptionEn: "Choose a Battle-shocked unit owned by any player. That unit is no longer Battle-shocked.",
    descriptionPt: "Escolha uma unidade em Choque de Batalha pertencente a qualquer jogador. Essa unidade não está mais em Choque de Batalha.",
    tags: "Tactics,Supply",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Share Supplies",
    namePt: "Compartilhar Suprimentos",
    cost: 3,
    descriptionEn: "Grant 2SP to another player.",
    descriptionPt: "Conceda 2SP a outro jogador.",
    tags: "Tactics",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
  {
    nameEn: "Supply Drop",
    namePt: "Lançamento de Suprimentos",
    cost: 3,
    descriptionEn: "Add a new objective marker to No Man's Land, at least 6\" from all board edges and at least 6\" from all other objective markers. (A maximum of 6 objective markers may be in play at once.)",
    descriptionPt: "Adicione um novo marcador de objetivo à Terra de Ninguém, a pelo menos 6\" de todas as bordas do tabuleiro e a pelo menos 6\" de todos os outros marcadores de objetivo. (Um máximo de 6 marcadores de objetivo podem estar em jogo ao mesmo tempo.)",
    tags: "Supply",
    maxPerPlayer: null,
    maxPerTurn: null,
  },

  // 2 SP Cards
  {
    nameEn: "Basic Tactics",
    namePt: "Táticas Básicas",
    cost: 2,
    descriptionEn: "Gain 1CP.",
    descriptionPt: "Ganhe 1CP.",
    tags: "Tactics",
    maxPerPlayer: null,
    maxPerTurn: null,
  },

  // 1 SP Cards
  {
    nameEn: "A Name Earned",
    namePt: "Um Nome Conquistado",
    cost: 1,
    descriptionEn: "Add an enhancement to a character without one. Follow all Index/Codex rules. For each Index/Codex, only one copy of any enhancement may exist at once.",
    descriptionPt: "Adicione um aprimoramento a um personagem sem um. Siga todas as regras do Índice/Codex. Para cada Índice/Codex, apenas uma cópia de qualquer aprimoramento pode existir ao mesmo tempo.",
    tags: "Tactics",
    maxPerPlayer: null,
    maxPerTurn: null,
  },
];

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  console.log('🌱 Seeding resupply cards...');

  try {
    // Check if cards already exist
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM resupplyCards');
    if (existing[0].count > 0) {
      console.log(`⚠️  Found ${existing[0].count} existing cards. Skipping seed.`);
      console.log('   To re-seed, run: DELETE FROM resupplyCards;');
      await connection.end();
      return;
    }

    // Insert all cards
    for (const card of RESUPPLY_CARDS) {
      await connection.query(
        `INSERT INTO resupplyCards (nameEn, namePt, cost, descriptionEn, descriptionPt, tags, maxPerPlayer, maxPerTurn)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [card.nameEn, card.namePt, card.cost, card.descriptionEn, card.descriptionPt, card.tags, card.maxPerPlayer, card.maxPerTurn]
      );
      console.log(`  ✅ ${card.namePt} (${card.cost} SP)`);
    }

    console.log(`\n✅ Successfully seeded ${RESUPPLY_CARDS.length} resupply cards!`);
  } catch (error) {
    console.error('❌ Error seeding cards:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
