/**
 * Crusade Rules Engine
 * Implements official Warhammer 40k Crusade rules for XP, ranks, and progression
 */

export type Rank = 'battle_ready' | 'blooded' | 'battle_hardened' | 'heroic' | 'legendary';

/**
 * XP thresholds for each rank (cumulative)
 * Based on official Crusade rules
 */
export const RANK_THRESHOLDS: Record<Rank, number> = {
  battle_ready: 0,      // 0 XP
  blooded: 6,           // 6+ XP
  battle_hardened: 16,  // 16+ XP
  heroic: 31,           // 31+ XP
  legendary: 51,        // 51+ XP
};

/**
 * Get the next rank based on current XP
 */
export function getRankFromXP(xp: number): Rank {
  if (xp >= RANK_THRESHOLDS.legendary) return 'legendary';
  if (xp >= RANK_THRESHOLDS.heroic) return 'heroic';
  if (xp >= RANK_THRESHOLDS.battle_hardened) return 'battle_hardened';
  if (xp >= RANK_THRESHOLDS.blooded) return 'blooded';
  return 'battle_ready';
}

/**
 * Get XP progress for current rank
 * Returns { current, needed, percentage }
 */
export function getXPProgress(xp: number, currentRank: Rank): {
  current: number;
  needed: number;
  percentage: number;
  nextRank: Rank | null;
} {
  const ranks: Rank[] = ['battle_ready', 'blooded', 'battle_hardened', 'heroic', 'legendary'];
  const currentIndex = ranks.indexOf(currentRank);
  
  // Already at max rank
  if (currentIndex === ranks.length - 1) {
    return {
      current: xp - RANK_THRESHOLDS[currentRank],
      needed: 0,
      percentage: 100,
      nextRank: null,
    };
  }
  
  const nextRank = ranks[currentIndex + 1];
  const currentThreshold = RANK_THRESHOLDS[currentRank];
  const nextThreshold = RANK_THRESHOLDS[nextRank];
  const xpInCurrentRank = xp - currentThreshold;
  const xpNeededForNextRank = nextThreshold - currentThreshold;
  
  return {
    current: xpInCurrentRank,
    needed: xpNeededForNextRank,
    percentage: Math.min(100, Math.round((xpInCurrentRank / xpNeededForNextRank) * 100)),
    nextRank,
  };
}

/**
 * Calculate XP earned from a battle
 * Based on official rules:
 * - 1 XP for playing a battle
 * - 1 XP for surviving (not destroyed)
 * - 1 XP per enemy unit destroyed (marked for destruction)
 */
export function calculateBattleXP(params: {
  played: boolean;
  survived: boolean;
  enemyUnitsDestroyed: number;
}): number {
  let xp = 0;
  
  if (params.played) xp += 1;
  if (params.survived) xp += 1;
  xp += params.enemyUnitsDestroyed;
  
  return xp;
}

/**
 * Check if unit should gain a rank
 * Returns the new rank if promotion occurs, null otherwise
 */
export function checkRankPromotion(currentXP: number, currentRank: Rank): Rank | null {
  const newRank = getRankFromXP(currentXP);
  return newRank !== currentRank ? newRank : null;
}

/**
 * Get display name for rank
 */
export function getRankDisplayName(rank: Rank): string {
  const names: Record<Rank, string> = {
    battle_ready: 'Pronto para Batalha',
    blooded: 'Experiente',
    battle_hardened: 'Veterano',
    heroic: 'Heroico',
    legendary: 'Lendário',
  };
  return names[rank];
}

/**
 * Get maximum Battle Honours allowed for a rank
 */
export function getMaxBattleHonours(rank: Rank): number {
  const maxHonours: Record<Rank, number> = {
    battle_ready: 0,
    blooded: 1,
    battle_hardened: 2,
    heroic: 3,
    legendary: 4,
  };
  return maxHonours[rank];
}

/**
 * Get maximum Battle Scars allowed (always 3)
 */
export function getMaxBattleScars(): number {
  return 3;
}

/**
 * Check if unit can receive a Battle Honour
 */
export function canReceiveBattleHonour(rank: Rank, currentHonours: number): boolean {
  return currentHonours < getMaxBattleHonours(rank);
}

/**
 * Check if unit can receive a Battle Scar
 */
export function canReceiveBattleScar(currentScars: number): boolean {
  return currentScars < getMaxBattleScars();
}

