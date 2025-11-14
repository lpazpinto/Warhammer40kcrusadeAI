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
