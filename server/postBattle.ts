/**
 * Post-Battle System
 * Handles XP calculation, rank progression, Out of Action rolls, and Battle Honours
 */

export interface OutOfActionResult {
  roll: number;
  result: 'survived' | 'battle_scar' | 'destroyed';
  scar?: string;
  description: string;
}

export interface XPCalculation {
  baseXP: number;
  objectiveBonus: number;
  killBonus: number;
  totalXP: number;
}

/**
 * Battle Scars table
 */
const BATTLE_SCARS = [
  'Ferimento Grave - Esta unidade sofre -1 em Toughness',
  'Traumatizado - Esta unidade sofre -1 em Leadership',
  'Equipamento Danificado - Uma arma aleatória sofre -1 em Strength',
  'Movimento Reduzido - Esta unidade sofre -1" em Movement',
  'Moral Abalado - Esta unidade não pode usar Stratagems',
  'Cicatriz Permanente - Esta unidade sofre -1 em Attacks'
];

/**
 * Battle Honours by rank
 */
const BATTLE_HONOURS = {
  blooded: [
    'Veterano de Combate - +1 em hit rolls no combate corpo-a-corpo',
    'Atirador Experiente - +1 em hit rolls com armas de tiro',
    'Resiliente - +1 em Wound',
    'Veloz - +1" em Movement'
  ],
  battle_hardened: [
    'Mestre de Armas - Re-roll 1s em hit rolls',
    'Inspirador - Unidades aliadas a 6" ganham +1 Leadership',
    'Implacável - Pode re-rolar charge rolls',
    'Tático - Ganha Objective Secured'
  ],
  heroic: [
    'Lenda Viva - Inimigos sofrem -1 em Leadership a 6"',
    'Golpe Mortal - Critical hits causam mortal wounds',
    'Inabalável - Ignora primeira falha de save por turno',
    'Comandante - Pode usar Command Re-roll uma vez por turno'
  ],
  legendary: [
    'Herói Imortal - 6+ Feel No Pain',
    'Mestre de Guerra - Ganha 1 CP adicional',
    'Destruidor - +1 Damage em todas as armas',
    'Avatar da Vitória - Re-roll all failed hit rolls'
  ]
};

/**
 * Roll for Out of Action
 */
export function rollOutOfAction(): OutOfActionResult {
  const roll = Math.floor(Math.random() * 6) + 1;
  
  if (roll >= 4) {
    return {
      roll,
      result: 'survived',
      description: 'A unidade sobreviveu sem ferimentos graves!'
    };
  } else if (roll === 2 || roll === 3) {
    const scarIndex = Math.floor(Math.random() * BATTLE_SCARS.length);
    return {
      roll,
      result: 'battle_scar',
      scar: BATTLE_SCARS[scarIndex],
      description: `A unidade sofreu uma cicatriz de batalha: ${BATTLE_SCARS[scarIndex]}`
    };
  } else {
    return {
      roll,
      result: 'destroyed',
      description: 'A unidade foi completamente destruída e removida da Order of Battle.'
    };
  }
}

/**
 * Calculate XP gained from a battle
 */
export function calculateXP(
  battlesPlayed: number,
  completedObjective: boolean,
  enemyUnitsKilled: number
): XPCalculation {
  let baseXP = 1; // All units gain 1 XP for participating
  
  // Horde Mode: If completed secret objective, all units gain 2 XP even if destroyed
  const objectiveBonus = completedObjective ? 2 : 0;
  
  // Bonus XP for destroying enemy units
  const killBonus = enemyUnitsKilled > 0 ? 1 : 0;
  
  return {
    baseXP,
    objectiveBonus,
    killBonus,
    totalXP: baseXP + objectiveBonus + killBonus
  };
}

/**
 * Determine rank based on XP
 */
export function determineRank(experiencePoints: number): string {
  if (experiencePoints >= 51) return 'legendary';
  if (experiencePoints >= 31) return 'heroic';
  if (experiencePoints >= 16) return 'battle_hardened';
  if (experiencePoints >= 6) return 'blooded';
  return 'battle_ready';
}

/**
 * Check if unit should gain a rank
 */
export function checkRankProgression(
  currentRank: string,
  newXP: number
): { shouldPromote: boolean; newRank: string } {
  const newRank = determineRank(newXP);
  const shouldPromote = newRank !== currentRank;
  
  return { shouldPromote, newRank };
}

/**
 * Roll for Battle Honour
 */
export function rollBattleHonour(rank: string): string | null {
  const honours = BATTLE_HONOURS[rank as keyof typeof BATTLE_HONOURS];
  
  if (!honours || honours.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * honours.length);
  return honours[randomIndex];
}

/**
 * Calculate Requisition Points gained
 */
export function calculateRequisitionPoints(
  completedObjective: boolean,
  isVictorious: boolean
): number {
  let rp = 1; // Base RP for all players
  
  // Horde Mode Victor Bonus: +1 RP if completed secret objective
  if (completedObjective) {
    rp += 1;
  }
  
  return rp;
}

/**
 * Process post-battle for a single unit
 */
export interface PostBattleUnitResult {
  unitId: number;
  xpGained: XPCalculation;
  newXP: number;
  rankProgression: {
    oldRank: string;
    newRank: string;
    promoted: boolean;
  };
  battleHonour?: string;
  outOfAction?: OutOfActionResult;
}

export function processUnitPostBattle(
  unitId: number,
  currentXP: number,
  currentRank: string,
  wasDestroyed: boolean,
  completedObjective: boolean,
  enemyUnitsKilled: number,
  battlesPlayed: number
): PostBattleUnitResult {
  // Calculate XP
  const xpGained = calculateXP(battlesPlayed, completedObjective, enemyUnitsKilled);
  const newXP = currentXP + xpGained.totalXP;
  
  // Check rank progression
  const rankProgression = checkRankProgression(currentRank, newXP);
  
  const result: PostBattleUnitResult = {
    unitId,
    xpGained,
    newXP,
    rankProgression: {
      oldRank: currentRank,
      newRank: rankProgression.newRank,
      promoted: rankProgression.shouldPromote
    }
  };
  
  // Roll for Battle Honour if promoted
  if (rankProgression.shouldPromote) {
    const honour = rollBattleHonour(rankProgression.newRank);
    if (honour) {
      result.battleHonour = honour;
    }
  }
  
  // Roll Out of Action if unit was destroyed
  if (wasDestroyed) {
    result.outOfAction = rollOutOfAction();
  }
  
  return result;
}

/**
 * Process post-battle for all units in a player's army
 */
export function processPlayerPostBattle(
  units: Array<{
    id: number;
    experiencePoints: number;
    rank: string;
    wasDestroyed: boolean;
    enemyUnitsKilled: number;
    battlesPlayed: number;
  }>,
  completedObjective: boolean
): PostBattleUnitResult[] {
  return units.map(unit => 
    processUnitPostBattle(
      unit.id,
      unit.experiencePoints,
      unit.rank,
      unit.wasDestroyed,
      completedObjective,
      unit.enemyUnitsKilled,
      unit.battlesPlayed
    )
  );
}

