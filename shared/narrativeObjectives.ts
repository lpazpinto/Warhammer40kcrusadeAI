/**
 * Narrative Objectives for Armageddon Campaign (Gatebreakers)
 * 
 * The campaign follows a branching narrative structure across 4 phases.
 * Each phase has a Narrative Objective that determines the story progression
 * based on whether players succeed or fail in achieving strategic points.
 */

export interface NarrativeObjective {
  id: string;
  phase: number;
  title: string;
  titlePt: string;
  description: string;
  descriptionPt: string;
  successBenefit: string;
  successBenefitPt: string;
  failureConsequence: string;
  failureConsequencePt: string;
  nextOnSuccess: string | null; // ID of next objective if successful
  nextOnFailure: string | null; // ID of next objective if failed
}

export const NARRATIVE_OBJECTIVES: Record<string, NarrativeObjective> = {
  // PHASE I
  establishing_the_front: {
    id: "establishing_the_front",
    phase: 1,
    title: "Establishing the Front",
    titlePt: "Estabelecendo a Frente",
    description: "Stabilising the front lines on Armageddon's principal continents will provide a vital foundation for its defenders.",
    descriptionPt: "Estabilizar as linhas de frente nos principais continentes de Armageddon fornecerá uma base vital para seus defensores.",
    successBenefit: "RESURGENT MORALE - In the next campaign phase, attempt the Reclaim the Lost Hives narrative goal, and each time you purchase the Increase Supply Limit requisition, increase your Crusade force's supply limit by 250 points, instead of 200.",
    successBenefitPt: "MORAL RESSURGENTE - Na próxima fase da campanha, tente o objetivo narrativo Recuperar as Colmeias Perdidas, e cada vez que você comprar a requisição Aumentar Limite de Suprimentos, aumente o limite de suprimentos da sua força de Cruzada em 250 pontos, ao invés de 200.",
    failureConsequence: "GRIM DETERMINATION - In the next campaign phase, attempt the Strengthen the Imperator Line narrative goal, and in each battle, the first time a unit from your Crusade army fails a Battle-shock test, that unit instead passes that test.",
    failureConsequencePt: "DETERMINAÇÃO SOMBRIA - Na próxima fase da campanha, tente o objetivo narrativo Fortalecer a Linha do Imperador, e em cada batalha, a primeira vez que uma unidade do seu exército de Cruzada falhar um teste de Choque de Batalha, essa unidade passa nesse teste.",
    nextOnSuccess: "reclaim_the_lost_hives",
    nextOnFailure: "strengthen_the_imperator_line",
  },

  // PHASE II - Success Path
  reclaim_the_lost_hives: {
    id: "reclaim_the_lost_hives",
    phase: 2,
    title: "Reclaim the Lost Hives",
    titlePt: "Recuperar as Colmeias Perdidas",
    description: "Building on early success, the Gatebreakers of Armageddon strike to seize and cleanse the fallen Hives of Hades and Thanatos.",
    descriptionPt: "Construindo sobre o sucesso inicial, os Quebradores de Portões de Armageddon atacam para tomar e limpar as Colmeias caídas de Hades e Thanatos.",
    successBenefit: "COMMANDING GRASP - In the next campaign phase, attempt the Raze the Monoliths narrative goal, and in each battle, at the start of the Declare Battle Formations step, you can select one unit from your Crusade army in Strategic Reserve. Set up that unit on the battlefield as if it was the third battle round.",
    successBenefitPt: "CONTROLE COMANDANTE - Na próxima fase da campanha, tente o objetivo narrativo Arrasar os Monólitos, e em cada batalha, no início da etapa Declarar Formações de Batalha, você pode selecionar uma unidade do seu exército de Cruzada em Reserva Estratégica. Configure essa unidade no campo de batalha como se fosse a terceira rodada de batalha.",
    failureConsequence: "STAGED WITHDRAWAL - In the next campaign phase, attempt the Light in the Dark narrative goal, and in each battle, at the start of the Declare Battle Formations step, you can select one INFANTRY or MOUNTED unit from your Crusade army. All models in that unit have the Scouts 6\" ability until the end of the battle.",
    failureConsequencePt: "RETIRADA PLANEJADA - Na próxima fase da campanha, tente o objetivo narrativo Luz na Escuridão, e em cada batalha, no início da etapa Declarar Formações de Batalha, você pode selecionar uma unidade de INFANTARIA ou MONTADA do seu exército de Cruzada. Todos os modelos nessa unidade têm a habilidade Batedores 6\" até o final da batalha.",
    nextOnSuccess: "raze_the_monoliths",
    nextOnFailure: "light_in_the_dark",
  },

  // PHASE II - Failure Path
  strengthen_the_imperator_line: {
    id: "strengthen_the_imperator_line",
    phase: 2,
    title: "Strengthen the Imperator Line",
    titlePt: "Fortalecer a Linha do Imperador",
    description: "Having suffered a series of defeats, the Gatebreakers must reinforce their defences and resume their offensive.",
    descriptionPt: "Tendo sofrido uma série de derrotas, os Quebradores de Portões devem reforçar suas defesas e retomar sua ofensiva.",
    successBenefit: "IMPENETRABLE WALL - In the next campaign phase, attempt the Raze the Monoliths narrative goal, and each time you select a unit from your Crusade army to be Marked for Greatness, it gains an additional 1XP.",
    successBenefitPt: "MURALHA IMPENETRÁVEL - Na próxima fase da campanha, tente o objetivo narrativo Arrasar os Monólitos, e cada vez que você selecionar uma unidade do seu exército de Cruzada para ser Marcada para a Grandeza, ela ganha 1XP adicional.",
    failureConsequence: "DEFENSIVE SWEEP - In the next campaign phase, attempt the Light in the Dark narrative goal, and in each battle, enemy units cannot be set up within your deployment zone (excluding Infiltrating).",
    failureConsequencePt: "VARREDURA DEFENSIVA - Na próxima fase da campanha, tente o objetivo narrativo Luz na Escuridão, e em cada batalha, unidades inimigas não podem ser configuradas dentro da sua zona de implantação (excluindo Infiltração).",
    nextOnSuccess: "raze_the_monoliths",
    nextOnFailure: "light_in_the_dark",
  },

  // PHASE III - Success Path
  raze_the_monoliths: {
    id: "raze_the_monoliths",
    phase: 3,
    title: "Raze the Monoliths",
    titlePt: "Arrasar os Monólitos",
    description: "With momentum behind them, the defenders of Armageddon make a bold strike to destroy the monoliths enchaining the Red Angel's Gate to reality.",
    descriptionPt: "Com momentum a seu favor, os defensores de Armageddon fazem um ataque ousado para destruir os monólitos que prendem o Portão do Anjo Vermelho à realidade.",
    successBenefit: "RIGHTEOUS RESOLVE - In the next campaign phase, attempt the Shatter the Red Angel's Gate narrative goal, and in each battle, each time a model makes an attack that targets a unit from your Crusade army with one or more Warp counters, subtract 1 from the Wound roll.",
    successBenefitPt: "RESOLUÇÃO JUSTA - Na próxima fase da campanha, tente o objetivo narrativo Despedaçar o Portão do Anjo Vermelho, e em cada batalha, cada vez que um modelo faz um ataque que tem como alvo uma unidade do seu exército de Cruzada com um ou mais contadores Warp, subtraia 1 da rolagem de Ferida.",
    failureConsequence: "DESPERATION - In the next campaign phase, attempt the Shatter the Red Angel's Gate narrative goal, and in each battle, at the start of your Command phase, you can select one unit from your Crusade army. Add or remove one Warp counter from that unit.",
    failureConsequencePt: "DESESPERO - Na próxima fase da campanha, tente o objetivo narrativo Despedaçar o Portão do Anjo Vermelho, e em cada batalha, no início da sua fase de Comando, você pode selecionar uma unidade do seu exército de Cruzada. Adicione ou remova um contador Warp dessa unidade.",
    nextOnSuccess: "shatter_the_red_angels_gate",
    nextOnFailure: "shatter_the_red_angels_gate",
  },

  // PHASE III - Failure Path
  light_in_the_dark: {
    id: "light_in_the_dark",
    phase: 3,
    title: "Light in the Dark",
    titlePt: "Luz na Escuridão",
    description: "As the planet descends into chaos, the Gatebreakers' forces remain as beacons of hatred and defiance, steadfast in the face of the foe.",
    descriptionPt: "Enquanto o planeta descende ao caos, as forças dos Quebradores de Portões permanecem como faróis de ódio e desafio, firmes diante do inimigo.",
    successBenefit: "FAITH REKINDLED - In the next campaign phase, attempt the Shatter the Red Angel's Gate narrative goal, and in each battle, each time a model from your Crusade army makes an attack that targets a unit with one or more Warp counters, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.",
    successBenefitPt: "FÉ REACENDIDA - Na próxima fase da campanha, tente o objetivo narrativo Despedaçar o Portão do Anjo Vermelho, e em cada batalha, cada vez que um modelo do seu exército de Cruzada faz um ataque que tem como alvo uma unidade com um ou mais contadores Warp, re-role uma rolagem de Acerto de 1 e re-role uma rolagem de Ferida de 1.",
    failureConsequence: "FORLORN HOPE - In the next campaign phase, attempt the Shatter the Red Angel's Gate narrative goal, and in each battle, once per turn, you can re-roll one Hit roll, one Wound roll or one Damage roll for a unit from your Crusade army.",
    failureConsequencePt: "ESPERANÇA PERDIDA - Na próxima fase da campanha, tente o objetivo narrativo Despedaçar o Portão do Anjo Vermelho, e em cada batalha, uma vez por turno, você pode re-rolar uma rolagem de Acerto, uma rolagem de Ferida ou uma rolagem de Dano para uma unidade do seu exército de Cruzada.",
    nextOnSuccess: "shatter_the_red_angels_gate",
    nextOnFailure: "shatter_the_red_angels_gate",
  },

  // PHASE IV - Final Phase
  shatter_the_red_angels_gate: {
    id: "shatter_the_red_angels_gate",
    phase: 4,
    title: "Shatter the Red Angel's Gate",
    titlePt: "Despedaçar o Portão do Anjo Vermelho",
    description: "The Gatebreakers throw everything into a final assault upon the Red Angel's Gate. Only by sealing the portal can Angron's invasion of Armageddon be foiled.",
    descriptionPt: "Os Quebradores de Portões lançam tudo em um assalto final ao Portão do Anjo Vermelho. Apenas selando o portal a invasão de Angron em Armageddon pode ser frustrada.",
    successBenefit: "At the end of each battle, if you are the victor, gain five strategic points. In each battle, at the start of the first battle round, gain a number of Command points equal to the alliance's campaign points (CP gained in this way are an exception to the Core Rules that limit the maximum number of CP you can have each battle round to 1).",
    successBenefitPt: "No final de cada batalha, se você for o vitorioso, ganhe cinco pontos estratégicos. Em cada batalha, no início da primeira rodada de batalha, ganhe um número de pontos de Comando igual aos pontos de campanha da aliança (CP ganhos dessa forma são uma exceção às Regras Principais que limitam o número máximo de CP que você pode ter em cada rodada de batalha a 1).",
    failureConsequence: "At the end of each battle, if you are the victor, gain five strategic points.",
    failureConsequencePt: "No final de cada batalha, se você for o vitorioso, ganhe cinco pontos estratégicos.",
    nextOnSuccess: null, // Campaign ends
    nextOnFailure: null, // Campaign ends
  },
};

// Helper function to get the starting objective
export function getStartingObjective(): NarrativeObjective {
  return NARRATIVE_OBJECTIVES.establishing_the_front;
}

// Helper function to get next objective based on current objective and result
export function getNextObjective(currentObjectiveId: string, wasSuccessful: boolean): NarrativeObjective | null {
  const current = NARRATIVE_OBJECTIVES[currentObjectiveId];
  if (!current) return null;
  
  const nextId = wasSuccessful ? current.nextOnSuccess : current.nextOnFailure;
  if (!nextId) return null;
  
  return NARRATIVE_OBJECTIVES[nextId];
}

// Helper function to check if objective is final phase
export function isFinalPhase(objectiveId: string): boolean {
  const objective = NARRATIVE_OBJECTIVES[objectiveId];
  return objective?.phase === 4;
}
