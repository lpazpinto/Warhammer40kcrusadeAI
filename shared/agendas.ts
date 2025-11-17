/**
 * Agendas for Warhammer 40k Crusade battles
 * Translated to Portuguese
 */

export type AgendaType = 'normal' | 'tactical';

export type AgendaReward = {
  type: 'xp' | 'rp';
  amount: number;
  condition: string;
};

export type Agenda = {
  id: string;
  name: string;
  type: AgendaType;
  description: string;
  objectives: string[];
  rewards: AgendaReward[];
};

/**
 * Normal Agendas (5 total)
 */
export const NORMAL_AGENDAS: Agenda[] = [
  {
    id: 'assassinate',
    name: 'Assassinar',
    type: 'normal',
    description: 'Você pode ganhar glória e inspirar seus seguidores ao derrubar campeões, heróis e comandantes.',
    objectives: [
      'Cada vez que um modelo do seu exército de Cruzada destruir uma unidade inimiga de PERSONAGEM, aquele modelo ganha 1 XP adicional.',
      'Se o PERSONAGEM ADVERSÁRIO inimigo for destruído, você ganha 1 ponto estratégico adicional.',
      'Ao final da batalha, se o SENHOR DA GUERRA inimigo for destruído, você ganha 1 ponto estratégico.'
    ],
    rewards: [
      { type: 'xp', amount: 1, condition: 'Por destruir PERSONAGEM inimigo' },
      { type: 'rp', amount: 1, condition: 'Se PERSONAGEM ADVERSÁRIO for destruído' },
      { type: 'rp', amount: 1, condition: 'Se SENHOR DA GUERRA for destruído' }
    ]
  },
  {
    id: 'lines_of_defence',
    name: 'Linhas de Defesa',
    type: 'normal',
    description: 'Mantenha-se firme e permaneça desafiador. Você deve impedir que o inimigo avance, custe o que custar.',
    objectives: [
      'Ao final da batalha, você pode selecionar duas unidades do seu exército de Cruzada (excluindo AERONAVES e unidades Battle-shocked). Uma dessas unidades deve estar completamente dentro da sua zona de implantação, e a outra deve estar completamente dentro da zona de implantação do oponente.',
      'Se você não puder selecionar duas unidades, mas conseguir selecionar uma unidade que atenda às condições, você ainda pode alcançar esta Agenda. Cada unidade selecionada ganha 2XP.'
    ],
    rewards: [
      { type: 'xp', amount: 2, condition: 'Por unidade na zona correta' }
    ]
  },
  {
    id: 'warp_rites',
    name: 'Ritos Warp',
    type: 'normal',
    description: 'Rituais de combate de Armageddon devem ser realizados para obter uma vantagem.',
    objectives: [
      'No início da batalha, nenhum marcador objetivo tem Ritos Warp completados.',
      'Durante sua fase de Disparo, se uma unidade do seu exército destruir uma unidade inimiga dentro do alcance de um marcador objetivo que não teve Ritos Warp completados, aquele marcador objetivo tem Ritos Warp completados.',
      'Ao final do seu turno, se você controlar aquele marcador objetivo, ele teve Ritos Warp completados (a Ação ganha 1 contador e 2XP).',
      'Ao final da batalha, se três ou mais marcadores objetivo no campo de batalha tiveram Ritos Warp completados por você, você ganha 1 ponto estratégico. Uma unidade não pode ganhar mais de 1 ponto estratégico por batalha com esta Agenda.'
    ],
    rewards: [
      { type: 'xp', amount: 2, condition: 'Por Rito Warp completado' },
      { type: 'rp', amount: 1, condition: 'Se 3+ Ritos Warp completados' }
    ]
  },
  {
    id: 'cleanse_and_purge',
    name: 'Limpar e Purgar',
    type: 'normal',
    description: 'Não pode haver vitória enquanto o inimigo ainda viver. Caçá-los. Não deixar ninguém escapar com vida.',
    objectives: [
      'Cada vez que uma unidade do seu exército de Cruzada destruir uma unidade ADVERSÁRIA IMUNDA, aquela unidade ganha 1XP (se sua unidade não tinha contadores Warp, ela ganha 2XP ao invés).',
      'Uma unidade não pode ganhar mais de 2XP por batalha com esta Agenda.',
      'Ao final da batalha, se 5 ou mais unidades do seu exército de Cruzada ganharam XP com esta Agenda, você ganha 1 ponto estratégico.'
    ],
    rewards: [
      { type: 'xp', amount: 1, condition: 'Por destruir unidade ADVERSÁRIA IMUNDA' },
      { type: 'rp', amount: 1, condition: 'Se 5+ unidades ganharam XP' }
    ]
  },
  {
    id: 'sacrificial_defiance',
    name: 'Desafio Sacrificial',
    type: 'normal',
    description: 'Hora de não recuar. Não haverá rendição. Trace uma linha na areia e faça sua posição.',
    objectives: [
      'No início da batalha, seu oponente seleciona até dois marcadores objetivo diferentes no campo de batalha.',
      'Ao final da batalha, se você controlar ambos os marcadores objetivo que seu oponente selecionou, você ganha 1 ponto estratégico.',
      'Ao final da batalha, se você controlar ambos os marcadores objetivo, selecione uma unidade do seu exército de Cruzada que está dentro do alcance de um desses marcadores objetivo. Cada uma dessas unidades ganha 2XP.'
    ],
    rewards: [
      { type: 'rp', amount: 1, condition: 'Se controlar ambos objetivos' },
      { type: 'xp', amount: 2, condition: 'Por unidade no alcance do objetivo' }
    ]
  }
];

/**
 * Tactical Agendas (18 total, organized in 3 tables)
 * Roll 2D6: 2-5 = Table A, 6-8 = Table B, 9-12 = Table C
 * Then roll 1D6 for specific agenda
 */
export const TACTICAL_AGENDAS: Record<'A' | 'B' | 'C', Agenda[]> = {
  A: [
    {
      id: 'tactical_a1',
      name: 'Vingança Ardente',
      type: 'tactical',
      description: 'O inimigo derramou sangue dos seus. Faça-os pagar.',
      objectives: ['Ao final de cada turno, se uma ou mais unidades do seu exército de Cruzada foram destruídas neste turno, selecione uma unidade do seu exército de Cruzada que destruiu uma ou mais unidades inimigas neste turno. Aquela unidade ganha 1XP (até um máximo de 3XP por batalha).'],
      rewards: [{ type: 'xp', amount: 1, condition: 'Por turno (máx 3XP)' }]
    },
    {
      id: 'tactical_a2',
      name: 'Caçada Implacável',
      type: 'tactical',
      description: 'Persiga o inimigo sem descanso. Não dê quartel.',
      objectives: ['Ao final de cada turno, se uma unidade do seu exército de Cruzada destruiu uma unidade inimiga que estava a mais de 12" de distância no início daquele turno, aquela unidade ganha 1XP. Uma unidade não pode ganhar mais de 2XP por batalha com esta Agenda.'],
      rewards: [{ type: 'xp', amount: 1, condition: 'Por unidade destruída a 12"+ (máx 2XP)' }]
    },
    {
      id: 'tactical_a3',
      name: 'Defesa Heroica',
      type: 'tactical',
      description: 'Mantenha sua posição contra todas as probabilidades.',
      objectives: ['Ao final da batalha, selecione uma unidade do seu exército de Cruzada que estava dentro de 6" de um marcador objetivo no final do turno 5. Se aquela unidade ainda estiver no campo de batalha, ela ganha 2XP.'],
      rewards: [{ type: 'xp', amount: 2, condition: 'Se unidade sobreviver perto de objetivo' }]
    },
    {
      id: 'tactical_a4',
      name: 'Golpe Cirúrgico',
      type: 'tactical',
      description: 'Ataque com precisão mortal onde o inimigo é mais fraco.',
      objectives: ['Ao final de cada turno, se uma unidade do seu exército de Cruzada destruiu uma unidade inimiga que tinha 5 ou menos modelos no início daquele turno, aquela unidade ganha 1XP. Uma unidade não pode ganhar mais de 2XP por batalha com esta Agenda.'],
      rewards: [{ type: 'xp', amount: 1, condition: 'Por destruir unidade pequena (≤5 modelos, máx 2XP)' }]
    },
    {
      id: 'tactical_a5',
      name: 'Avanço Relentless',
      type: 'tactical',
      description: 'Pressione o inimigo sem parar. Cada centímetro conquistado é uma vitória.',
      objectives: ['Ao final de cada turno, se uma ou mais unidades do seu exército de Cruzada estão completamente dentro da zona de implantação do oponente, selecione uma dessas unidades. Aquela unidade ganha 1XP (até um máximo de 3XP por batalha).'],
      rewards: [{ type: 'xp', amount: 1, condition: 'Por turno na zona inimiga (máx 3XP)' }]
    },
    {
      id: 'tactical_a6',
      name: 'Sangue pelo Imperador',
      type: 'tactical',
      description: 'Cada morte inimiga é uma oferenda ao Trono Dourado.',
      objectives: ['Ao final da batalha, conte o número de unidades inimigas destruídas pelo seu exército de Cruzada. Se 5 ou mais unidades inimigas foram destruídas, você ganha 1 ponto estratégico. Selecione uma unidade do seu exército que destruiu 2 ou mais unidades inimigas. Aquela unidade ganha 2XP.'],
      rewards: [
        { type: 'rp', amount: 1, condition: 'Se 5+ unidades inimigas destruídas' },
        { type: 'xp', amount: 2, condition: 'Unidade que destruiu 2+ inimigas' }
      ]
    }
  ],
  B: [
    {
      id: 'tactical_b1',
      name: 'Domínio Territorial',
      type: 'tactical',
      description: 'Controle o campo de batalha. Cada objetivo é um passo para a vitória.',
      objectives: ['Ao final de cada turno, se você controlar mais marcadores objetivo do que seu oponente, selecione uma unidade do seu exército de Cruzada dentro do alcance de um marcador objetivo. Aquela unidade ganha 1XP (até um máximo de 3XP por batalha).'],
      rewards: [{ type: 'xp', amount: 1, condition: 'Por turno controlando mais objetivos (máx 3XP)' }]
    },
    {
      id: 'tactical_b2',
      name: 'Quebra de Moral',
      type: 'tactical',
      description: 'Destrua o espírito do inimigo. Faça-os fugir em terror.',
      objectives: ['Ao final de cada turno, se uma ou mais unidades inimigas falharam em um teste de Battle-shock neste turno, selecione uma unidade do seu exército de Cruzada que estava a 12" ou menos de uma dessas unidades. Aquela unidade ganha 1XP (até um máximo de 2XP por batalha).'],
      rewards: [{ type: 'xp', amount: 1, condition: 'Por turno causando Battle-shock (máx 2XP)' }]
    },
    {
      id: 'tactical_b3',
      name: 'Contra-Ataque Devastador',
      type: 'tactical',
      description: 'Quando o inimigo ataca, responda com fúria dobrada.',
      objectives: ['Ao final de cada turno do oponente, se uma ou mais unidades do seu exército de Cruzada destruíram unidades inimigas durante aquele turno, selecione uma dessas unidades. Aquela unidade ganha 1XP (até um máximo de 2XP por batalha).'],
      rewards: [{ type: 'xp', amount: 1, condition: 'Por contra-ataque bem-sucedido (máx 2XP)' }]
    },
    {
      id: 'tactical_b4',
      name: 'Fortaleza Viva',
      type: 'tactical',
      description: 'Sua presença no campo de batalha é uma fortaleza que não pode ser quebrada.',
      objectives: ['Ao final da batalha, selecione uma unidade do seu exército de Cruzada que não perdeu nenhum modelo durante a batalha. Aquela unidade ganha 2XP. Se aquela unidade também estava dentro do alcance de um marcador objetivo no final da batalha, ela ganha 1XP adicional.'],
      rewards: [
        { type: 'xp', amount: 2, condition: 'Se não perdeu modelos' },
        { type: 'xp', amount: 1, condition: '+1XP se perto de objetivo' }
      ]
    },
    {
      id: 'tactical_b5',
      name: 'Caça ao Monstro',
      type: 'tactical',
      description: 'As maiores bestas caem para os mais bravos guerreiros.',
      objectives: ['Ao final da batalha, se uma ou mais unidades inimigas de VEÍCULO ou MONSTRO foram destruídas pelo seu exército de Cruzada, selecione uma unidade do seu exército que contribuiu para destruir uma dessas unidades. Aquela unidade ganha 2XP. Você ganha 1 ponto estratégico.'],
      rewards: [
        { type: 'xp', amount: 2, condition: 'Por destruir VEÍCULO/MONSTRO' },
        { type: 'rp', amount: 1, condition: 'Se destruiu VEÍCULO/MONSTRO' }
      ]
    },
    {
      id: 'tactical_b6',
      name: 'Cerco Implacável',
      type: 'tactical',
      description: 'Cerque o inimigo. Corte suas rotas de fuga.',
      objectives: ['Ao final da batalha, se você tem unidades do seu exército de Cruzada em três ou mais quartos do campo de batalha, você ganha 1 ponto estratégico. Selecione até duas unidades do seu exército que estão em quartos diferentes do campo de batalha. Cada uma ganha 1XP.'],
      rewards: [
        { type: 'rp', amount: 1, condition: 'Se em 3+ quartos do campo' },
        { type: 'xp', amount: 1, condition: 'Por unidade em quarto diferente (máx 2)' }
      ]
    }
  ],
  C: [
    {
      id: 'tactical_c1',
      name: 'Fúria Desencadeada',
      type: 'tactical',
      description: 'Libere toda a sua raiva sobre o inimigo. Não deixe nada em pé.',
      objectives: ['Ao final de cada fase de Combate, se uma ou mais unidades do seu exército de Cruzada destruíram unidades inimigas naquela fase, selecione uma dessas unidades. Aquela unidade ganha 1XP (até um máximo de 3XP por batalha).'],
      rewards: [{ type: 'xp', amount: 1, condition: 'Por fase de Combate (máx 3XP)' }]
    },
    {
      id: 'tactical_c2',
      name: 'Precisão Mortal',
      type: 'tactical',
      description: 'Cada tiro conta. Cada morte é calculada.',
      objectives: ['Ao final de cada fase de Disparo, se uma ou mais unidades do seu exército de Cruzada destruíram unidades inimigas naquela fase sem sofrer nenhuma baixa em resposta, selecione uma dessas unidades. Aquela unidade ganha 1XP (até um máximo de 2XP por batalha).'],
      rewards: [{ type: 'xp', amount: 1, condition: 'Por fase de Disparo sem baixas (máx 2XP)' }]
    },
    {
      id: 'tactical_c3',
      name: 'Deleitar-se na Carnificina',
      type: 'tactical',
      description: 'Comandantes graciosos ou os Deuses Sombrios devem recompensar qualquer um que se deleite.',
      objectives: ['Ao final do turno, selecione uma unidade do seu exército de Cruzada que destruiu uma ou mais unidades inimigas. Sua unidade marca 1XP por cada unidade inimiga destruída neste turno (até um máximo de 3XP).'],
      rewards: [{ type: 'xp', amount: 1, condition: 'Por unidade inimiga destruída (máx 3XP)' }]
    },
    {
      id: 'tactical_c4',
      name: 'Último a Cair',
      type: 'tactical',
      description: 'Mesmo diante da morte, você permanece desafiador.',
      objectives: ['Ao final da batalha, se você tem menos unidades no campo de batalha do que seu oponente, mas ainda controla pelo menos um marcador objetivo, você ganha 1 ponto estratégico. Selecione uma unidade do seu exército que está dentro do alcance de um marcador objetivo. Aquela unidade ganha 2XP.'],
      rewards: [
        { type: 'rp', amount: 1, condition: 'Se menos unidades mas controla objetivo' },
        { type: 'xp', amount: 2, condition: 'Unidade perto de objetivo' }
      ]
    },
    {
      id: 'tactical_c5',
      name: 'Glória em Batalha',
      type: 'tactical',
      description: 'Cada ato de bravura é uma lenda em formação.',
      objectives: ['Ao final da batalha, selecione uma unidade PERSONAGEM do seu exército de Cruzada que destruiu uma ou mais unidades inimigas. Aquele PERSONAGEM ganha 3XP. Se aquele PERSONAGEM destruiu um PERSONAGEM inimigo, você ganha 1 ponto estratégico.'],
      rewards: [
        { type: 'xp', amount: 3, condition: 'PERSONAGEM que destruiu inimigos' },
        { type: 'rp', amount: 1, condition: 'Se destruiu PERSONAGEM inimigo' }
      ]
    },
    {
      id: 'tactical_c6',
      name: 'Triunfo Absoluto',
      type: 'tactical',
      description: 'Vitória não é suficiente. Dominação total é o único objetivo.',
      objectives: ['Ao final da batalha, se você controlar todos os marcadores objetivo no campo de batalha, você ganha 2 pontos estratégicos. Selecione até três unidades do seu exército que estão dentro do alcance de marcadores objetivo. Cada uma ganha 1XP.'],
      rewards: [
        { type: 'rp', amount: 2, condition: 'Se controlar todos objetivos' },
        { type: 'xp', amount: 1, condition: 'Por unidade perto de objetivo (máx 3)' }
      ]
    }
  ]
};


/**
 * Faction-Specific Agendas
 * Each faction can have unique agendas that reflect their playstyle and lore
 */

export type FactionAgenda = Agenda & {
  faction: string; // Faction identifier
  restrictions?: string[]; // Optional restrictions (e.g., "Requires PSYKER unit")
};

/**
 * Astra Militarum Faction Agendas
 */
export const ASTRA_MILITARUM_AGENDAS: FactionAgenda[] = [
  {
    id: 'am_hold_the_line',
    name: 'Segurar a Linha',
    type: 'normal',
    faction: 'Astra Militarum',
    description: 'A Guarda Imperial nunca recua. Mantenha suas posições a todo custo.',
    objectives: [
      'Ao final de cada turno, se você tem mais unidades ASTRA MILITARUM dentro da sua zona de implantação do que o oponente tem na zona dele, você ganha 1 ponto estratégico.',
      'Ao final da batalha, selecione até duas unidades ASTRA MILITARUM que permaneceram dentro da sua zona de implantação durante toda a batalha. Cada uma ganha 2XP.'
    ],
    rewards: [
      { type: 'rp', amount: 1, condition: 'Por turno com mais unidades na zona' },
      { type: 'xp', amount: 2, condition: 'Por unidade que segurou posição' }
    ]
  },
  {
    id: 'am_artillery_supremacy',
    name: 'Supremacia de Artilharia',
    type: 'normal',
    faction: 'Astra Militarum',
    description: 'A artilharia da Guarda Imperial é lendária. Demonstre seu poder de fogo.',
    objectives: [
      'Ao final de cada fase de Disparo, se uma ou mais unidades ASTRA MILITARUM com a palavra-chave ARTILHARIA destruíram unidades inimigas, selecione uma dessas unidades. Aquela unidade ganha 1XP (máximo 3XP por batalha).',
      'Ao final da batalha, se unidades ARTILHARIA destruíram 3+ unidades inimigas, você ganha 1 ponto estratégico.'
    ],
    rewards: [
      { type: 'xp', amount: 1, condition: 'Por fase de Disparo (máx 3XP)' },
      { type: 'rp', amount: 1, condition: 'Se ARTILHARIA destruiu 3+ unidades' }
    ]
  }
];

/**
 * Space Marines Faction Agendas
 */
export const SPACE_MARINES_AGENDAS: FactionAgenda[] = [
  {
    id: 'sm_know_no_fear',
    name: 'Não Conhecem Medo',
    type: 'normal',
    faction: 'Space Marines',
    description: 'Os Adeptus Astartes são a elite da humanidade. Prove sua coragem.',
    objectives: [
      'Ao final da batalha, se nenhuma unidade ADEPTUS ASTARTES do seu exército fugiu ou ficou Battle-shocked, você ganha 1 ponto estratégico.',
      'Selecione até duas unidades ADEPTUS ASTARTES que destruíram unidades inimigas enquanto abaixo de metade da força. Cada uma ganha 2XP.'
    ],
    rewards: [
      { type: 'rp', amount: 1, condition: 'Se nenhuma unidade fugiu/Battle-shocked' },
      { type: 'xp', amount: 2, condition: 'Por unidade que lutou ferida' }
    ]
  },
  {
    id: 'sm_surgical_strike',
    name: 'Ataque Cirúrgico',
    type: 'normal',
    faction: 'Space Marines',
    description: 'Precisão e eficiência são as marcas dos Space Marines.',
    objectives: [
      'Ao final da batalha, se você destruiu o SENHOR DA GUERRA inimigo com uma unidade ADEPTUS ASTARTES, aquela unidade ganha 3XP e você ganha 1 ponto estratégico.',
      'Se você também destruiu pelo menos 2 unidades PERSONAGEM inimigas, você ganha 1 ponto estratégico adicional.'
    ],
    rewards: [
      { type: 'xp', amount: 3, condition: 'Por destruir SENHOR DA GUERRA' },
      { type: 'rp', amount: 1, condition: 'Se destruiu SENHOR DA GUERRA' },
      { type: 'rp', amount: 1, condition: 'Se destruiu 2+ PERSONAGENS' }
    ]
  }
];

/**
 * Chaos Space Marines Faction Agendas
 */
export const CHAOS_SPACE_MARINES_AGENDAS: FactionAgenda[] = [
  {
    id: 'csm_blood_for_the_blood_god',
    name: 'Sangue para o Deus do Sangue',
    type: 'normal',
    faction: 'Chaos Space Marines',
    description: 'Khorne exige sacrifício. Deixe os corpos se acumularem.',
    objectives: [
      'Ao final de cada fase de Combate, se uma ou mais unidades HERETIC ASTARTES destruíram unidades inimigas em combate corpo a corpo, selecione uma dessas unidades. Aquela unidade ganha 1XP (máximo 4XP por batalha).',
      'Ao final da batalha, se você destruiu 5+ unidades inimigas em combate corpo a corpo, você ganha 1 ponto estratégico.'
    ],
    rewards: [
      { type: 'xp', amount: 1, condition: 'Por fase de Combate (máx 4XP)' },
      { type: 'rp', amount: 1, condition: 'Se destruiu 5+ unidades em corpo a corpo' }
    ]
  },
  {
    id: 'csm_dark_pacts',
    name: 'Pactos Sombrios',
    type: 'normal',
    faction: 'Chaos Space Marines',
    description: 'Os Deuses do Caos recompensam aqueles que servem bem.',
    objectives: [
      'Ao final da batalha, selecione uma unidade HERETIC ASTARTES PERSONAGEM que destruiu uma ou mais unidades inimigas. Aquele PERSONAGEM ganha 2XP.',
      'Se aquele PERSONAGEM também sobreviveu à batalha com menos de metade dos ferimentos, você ganha 1 ponto estratégico e o PERSONAGEM ganha 1XP adicional.'
    ],
    rewards: [
      { type: 'xp', amount: 2, condition: 'PERSONAGEM que destruiu inimigos' },
      { type: 'rp', amount: 1, condition: 'Se sobreviveu ferido' },
      { type: 'xp', amount: 1, condition: 'Bônus por sobreviver ferido' }
    ]
  }
];

/**
 * Necrons Faction Agendas
 */
export const NECRONS_AGENDAS: FactionAgenda[] = [
  {
    id: 'nec_reanimation_protocols',
    name: 'Protocolos de Reanimação',
    type: 'normal',
    faction: 'Necrons',
    description: 'Os Necrons não morrem facilmente. Levante-se novamente.',
    objectives: [
      'Ao final de cada turno, conte quantos modelos NECRONS retornaram via Protocolos de Reanimação neste turno. Selecione uma unidade que teve modelos reanimados. Aquela unidade ganha 1XP (máximo 3XP por batalha).',
      'Ao final da batalha, se você reanimou 10+ modelos durante a batalha, você ganha 1 ponto estratégico.'
    ],
    rewards: [
      { type: 'xp', amount: 1, condition: 'Por turno com reanimação (máx 3XP)' },
      { type: 'rp', amount: 1, condition: 'Se reanim ou 10+ modelos' }
    ]
  }
];

/**
 * Orks Faction Agendas
 */
export const ORKS_AGENDAS: FactionAgenda[] = [
  {
    id: 'ork_waaagh',
    name: 'WAAAGH!',
    type: 'normal',
    faction: 'Orks',
    description: 'Quanto mais Orkos, mais forte o WAAAGH!',
    objectives: [
      'Ao final de cada fase de Combate, se você tem mais unidades ORKS engajadas em combate do que o oponente, selecione uma unidade ORKS que destruiu uma unidade inimiga. Aquela unidade ganha 1XP (máximo 3XP por batalha).',
      'Ao final da batalha, se você destruiu mais unidades inimigas em combate corpo a corpo do que em disparos, você ganha 1 ponto estratégico.'
    ],
    rewards: [
      { type: 'xp', amount: 1, condition: 'Por fase de Combate (máx 3XP)' },
      { type: 'rp', amount: 1, condition: 'Se mais mortes em corpo a corpo' }
    ]
  }
];

/**
 * Tyranids Faction Agendas
 */
export const TYRANIDS_AGENDAS: FactionAgenda[] = [
  {
    id: 'tyr_endless_swarm',
    name: 'Enxame Infinito',
    type: 'normal',
    faction: 'Tyranids',
    description: 'A Mente Colmeia nunca para. O enxame sempre cresce.',
    objectives: [
      'Ao final de cada turno, se você tem mais unidades TYRANIDS no campo de batalha do que tinha no início do turno (via reforços, etc.), você ganha 1 ponto estratégico.',
      'Ao final da batalha, selecione até duas unidades TYRANIDS que foram reforçadas durante a batalha. Cada uma ganha 2XP.'
    ],
    rewards: [
      { type: 'rp', amount: 1, condition: 'Por turno com mais unidades' },
      { type: 'xp', amount: 2, condition: 'Por unidade reforçada' }
    ]
  }
];

/**
 * Tau Empire Faction Agendas
 */
export const TAU_EMPIRE_AGENDAS: FactionAgenda[] = [
  {
    id: 'tau_greater_good',
    name: 'Bem Maior',
    type: 'normal',
    faction: 'T\'au Empire',
    description: 'Para o Tau\'va. Trabalhe em conjunto para a vitória.',
    objectives: [
      'Ao final de cada fase de Disparo, se duas ou mais unidades T\'AU EMPIRE dispararam na mesma unidade inimiga e a destruíram, selecione uma dessas unidades. Aquela unidade ganha 1XP (máximo 3XP por batalha).',
      'Ao final da batalha, se você destruiu 3+ unidades inimigas via fogo combinado, você ganha 1 ponto estratégico.'
    ],
    rewards: [
      { type: 'xp', amount: 1, condition: 'Por fase de Disparo (máx 3XP)' },
      { type: 'rp', amount: 1, condition: 'Se destruiu 3+ via fogo combinado' }
    ]
  }
];

/**
 * Aeldari Faction Agendas
 */
export const AELDARI_AGENDAS: FactionAgenda[] = [
  {
    id: 'ael_swift_strike',
    name: 'Ataque Veloz',
    type: 'normal',
    faction: 'Aeldari',
    description: 'Os Aeldari atacam onde o inimigo é mais fraco.',
    objectives: [
      'Ao final de cada turno, se uma ou mais unidades AELDARI se moveram 12"+ e destruíram uma unidade inimiga, selecione uma dessas unidades. Aquela unidade ganha 1XP (máximo 3XP por batalha).',
      'Ao final da batalha, se nenhuma unidade AELDARI foi destruída, você ganha 1 ponto estratégico.'
    ],
    rewards: [
      { type: 'xp', amount: 1, condition: 'Por turno (máx 3XP)' },
      { type: 'rp', amount: 1, condition: 'Se nenhuma unidade perdida' }
    ]
  }
];

/**
 * Drukhari Faction Agendas
 */
export const DRUKHARI_AGENDAS: FactionAgenda[] = [
  {
    id: 'dru_pain_and_suffering',
    name: 'Dor e Sofrimento',
    type: 'normal',
    faction: 'Drukhari',
    description: 'Os Drukhari se alimentam da agonia dos outros.',
    objectives: [
      'Ao final de cada fase de Combate, se uma ou mais unidades DRUKHARI destruíram unidades inimigas em combate, selecione uma dessas unidades. Aquela unidade ganha 1XP (máximo 3XP por batalha).',
      'Ao final da batalha, se você destruiu o SENHOR DA GUERRA inimigo em combate corpo a corpo, você ganha 1 ponto estratégico.'
    ],
    rewards: [
      { type: 'xp', amount: 1, condition: 'Por fase de Combate (máx 3XP)' },
      { type: 'rp', amount: 1, condition: 'Se destruiu SENHOR DA GUERRA em corpo a corpo' }
    ]
  }
];

/**
 * Get all faction-specific agendas
 */
export const FACTION_AGENDAS: Record<string, FactionAgenda[]> = {
  'Astra Militarum': ASTRA_MILITARUM_AGENDAS,
  'Space Marines': SPACE_MARINES_AGENDAS,
  'Chaos Space Marines': CHAOS_SPACE_MARINES_AGENDAS,
  'Necrons': NECRONS_AGENDAS,
  'Orks': ORKS_AGENDAS,
  'Tyranids': TYRANIDS_AGENDAS,
  'T\'au Empire': TAU_EMPIRE_AGENDAS,
  'Aeldari': AELDARI_AGENDAS,
  'Drukhari': DRUKHARI_AGENDAS,
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
 * Get agendas available for a specific faction
 */
export function getAgendasForFaction(faction: string): Agenda[] {
  const factionAgendas = FACTION_AGENDAS[faction] || [];
  return [...NORMAL_AGENDAS, ...factionAgendas];
}

/**
 * Get only faction-specific agendas
 */
export function getFactionSpecificAgendas(faction: string): FactionAgenda[] {
  return FACTION_AGENDAS[faction] || [];
}

/**
 * Check if a faction has custom agendas
 */
export function hasFactionAgendas(faction: string): boolean {
  const agendas = FACTION_AGENDAS[faction];
  return agendas !== undefined && agendas.length > 0;
}
