/**
 * Badge System for Warhammer 40k Crusade
 * Badges are achievements/medals earned through gameplay milestones
 */

export type BadgeCategory = 'combat' | 'survival' | 'progression' | 'collection' | 'special';
export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: string;
  name: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  description: string;
  icon: string; // Icon identifier or emoji
  unlockCondition: string; // Human-readable unlock condition
  checkFunction: (stats: PlayerStats) => boolean; // Function to check if unlocked
}

/**
 * Player statistics used for badge unlock checks
 */
export interface PlayerStats {
  // Battle stats
  totalBattles: number;
  battlesWon: number;
  battlesLost: number;
  
  // Unit stats
  totalUnits: number;
  unitsDestroyed: number;
  enemyUnitsDestroyed: number;
  
  // XP and progression
  totalXP: number;
  highestRankUnit: number; // 0=Battle-ready, 1=Blooded, 2=Battle-hardened, 3=Heroic, 4=Legendary
  legendaryUnits: number;
  heroicUnits: number;
  
  // Battle Honours and Scars
  totalBattleHonours: number;
  totalBattleScars: number;
  
  // Requisitions
  totalRP: number;
  requisitionsPurchased: number;
  
  // Relics and traits
  relicsOwned: number;
  traitsEarned: number;
  
  // Agendas
  agendasCompleted: number;
  tacticalAgendasCompleted: number;
  
  // Special achievements
  perfectBattles: number; // Battles won with no units lost
  comebackVictories: number; // Battles won after being behind
  consecutiveWins: number;
  currentWinStreak: number;
}

/**
 * Combat Badges - Earned through battle performance
 */
export const COMBAT_BADGES: Badge[] = [
  {
    id: 'first_blood',
    name: 'Primeiro Sangue',
    category: 'combat',
    rarity: 'bronze',
    description: 'Venceu sua primeira batalha',
    icon: '⚔️',
    unlockCondition: 'Vencer 1 batalha',
    checkFunction: (stats) => stats.battlesWon >= 1
  },
  {
    id: 'veteran_commander',
    name: 'Comandante Veterano',
    category: 'combat',
    rarity: 'silver',
    description: 'Participou de 10 batalhas',
    icon: '🎖️',
    unlockCondition: 'Participar de 10 batalhas',
    checkFunction: (stats) => stats.totalBattles >= 10
  },
  {
    id: 'war_master',
    name: 'Mestre da Guerra',
    category: 'combat',
    rarity: 'gold',
    description: 'Venceu 25 batalhas',
    icon: '👑',
    unlockCondition: 'Vencer 25 batalhas',
    checkFunction: (stats) => stats.battlesWon >= 25
  },
  {
    id: 'legendary_general',
    name: 'General Lendário',
    category: 'combat',
    rarity: 'platinum',
    description: 'Venceu 50 batalhas',
    icon: '⭐',
    unlockCondition: 'Vencer 50 batalhas',
    checkFunction: (stats) => stats.battlesWon >= 50
  },
  {
    id: 'unstoppable',
    name: 'Imparável',
    category: 'combat',
    rarity: 'gold',
    description: 'Venceu 5 batalhas consecutivas',
    icon: '🔥',
    unlockCondition: 'Vencer 5 batalhas consecutivas',
    checkFunction: (stats) => stats.currentWinStreak >= 5
  },
  {
    id: 'perfect_victory',
    name: 'Vitória Perfeita',
    category: 'combat',
    rarity: 'silver',
    description: 'Venceu uma batalha sem perder nenhuma unidade',
    icon: '💎',
    unlockCondition: 'Vencer batalha sem perder unidades',
    checkFunction: (stats) => stats.perfectBattles >= 1
  },
  {
    id: 'comeback_king',
    name: 'Rei da Virada',
    category: 'combat',
    rarity: 'gold',
    description: 'Venceu 3 batalhas após estar em desvantagem',
    icon: '🎯',
    unlockCondition: 'Vencer 3 batalhas em desvantagem',
    checkFunction: (stats) => stats.comebackVictories >= 3
  },
  {
    id: 'executioner',
    name: 'Executor',
    category: 'combat',
    rarity: 'silver',
    description: 'Destruiu 50 unidades inimigas',
    icon: '💀',
    unlockCondition: 'Destruir 50 unidades inimigas',
    checkFunction: (stats) => stats.enemyUnitsDestroyed >= 50
  },
  {
    id: 'annihilator',
    name: 'Aniquilador',
    category: 'combat',
    rarity: 'gold',
    description: 'Destruiu 100 unidades inimigas',
    icon: '☠️',
    unlockCondition: 'Destruir 100 unidades inimigas',
    checkFunction: (stats) => stats.enemyUnitsDestroyed >= 100
  }
];

/**
 * Survival Badges - Earned through unit preservation
 */
export const SURVIVAL_BADGES: Badge[] = [
  {
    id: 'survivor',
    name: 'Sobrevivente',
    category: 'survival',
    rarity: 'bronze',
    description: 'Manteve uma unidade viva por 5 batalhas',
    icon: '🛡️',
    unlockCondition: 'Unidade sobrevive a 5 batalhas',
    checkFunction: (stats) => stats.totalBattles >= 5 // Simplified - actual check would be per unit
  },
  {
    id: 'iron_will',
    name: 'Vontade de Ferro',
    category: 'survival',
    rarity: 'silver',
    description: 'Manteve uma unidade viva por 10 batalhas',
    icon: '🏰',
    unlockCondition: 'Unidade sobrevive a 10 batalhas',
    checkFunction: (stats) => stats.totalBattles >= 10
  },
  {
    id: 'immortal',
    name: 'Imortal',
    category: 'survival',
    rarity: 'gold',
    description: 'Manteve uma unidade viva por 20 batalhas',
    icon: '👼',
    unlockCondition: 'Unidade sobrevive a 20 batalhas',
    checkFunction: (stats) => stats.totalBattles >= 20
  },
  {
    id: 'scarred_veteran',
    name: 'Veterano Marcado',
    category: 'survival',
    rarity: 'silver',
    description: 'Acumulou 5 Battle Scars em uma unidade',
    icon: '💔',
    unlockCondition: 'Unidade com 5+ Battle Scars',
    checkFunction: (stats) => stats.totalBattleScars >= 5
  }
];

/**
 * Progression Badges - Earned through XP and rank advancement
 */
export const PROGRESSION_BADGES: Badge[] = [
  {
    id: 'blooded',
    name: 'Batizado em Sangue',
    category: 'progression',
    rarity: 'bronze',
    description: 'Primeira unidade atingiu rank Blooded',
    icon: '🩸',
    unlockCondition: 'Unidade atinge rank Blooded',
    checkFunction: (stats) => stats.highestRankUnit >= 1
  },
  {
    id: 'battle_hardened',
    name: 'Endurecido em Batalha',
    category: 'progression',
    rarity: 'silver',
    description: 'Primeira unidade atingiu rank Battle-hardened',
    icon: '⚡',
    unlockCondition: 'Unidade atinge rank Battle-hardened',
    checkFunction: (stats) => stats.highestRankUnit >= 2
  },
  {
    id: 'heroic',
    name: 'Heroico',
    category: 'progression',
    rarity: 'gold',
    description: 'Primeira unidade atingiu rank Heroic',
    icon: '🦅',
    unlockCondition: 'Unidade atinge rank Heroic',
    checkFunction: (stats) => stats.highestRankUnit >= 3
  },
  {
    id: 'legendary',
    name: 'Lendário',
    category: 'progression',
    rarity: 'platinum',
    description: 'Primeira unidade atingiu rank Legendary',
    icon: '🌟',
    unlockCondition: 'Unidade atinge rank Legendary',
    checkFunction: (stats) => stats.highestRankUnit >= 4
  },
  {
    id: 'elite_force',
    name: 'Força de Elite',
    category: 'progression',
    rarity: 'gold',
    description: 'Possui 3 unidades Heroic ou superior',
    icon: '🎖️',
    unlockCondition: '3+ unidades Heroic/Legendary',
    checkFunction: (stats) => stats.heroicUnits >= 3
  },
  {
    id: 'hall_of_legends',
    name: 'Salão das Lendas',
    category: 'progression',
    rarity: 'platinum',
    description: 'Possui 3 unidades Legendary',
    icon: '🏛️',
    unlockCondition: '3+ unidades Legendary',
    checkFunction: (stats) => stats.legendaryUnits >= 3
  },
  {
    id: 'xp_hoarder',
    name: 'Acumulador de XP',
    category: 'progression',
    rarity: 'silver',
    description: 'Acumulou 100 XP total',
    icon: '📈',
    unlockCondition: 'Acumular 100 XP total',
    checkFunction: (stats) => stats.totalXP >= 100
  },
  {
    id: 'xp_master',
    name: 'Mestre do XP',
    category: 'progression',
    rarity: 'gold',
    description: 'Acumulou 500 XP total',
    icon: '📊',
    unlockCondition: 'Acumular 500 XP total',
    checkFunction: (stats) => stats.totalXP >= 500
  }
];

/**
 * Collection Badges - Earned through collecting relics, traits, etc.
 */
export const COLLECTION_BADGES: Badge[] = [
  {
    id: 'relic_hunter',
    name: 'Caçador de Relíquias',
    category: 'collection',
    rarity: 'bronze',
    description: 'Adquiriu primeira relíquia',
    icon: '🏺',
    unlockCondition: 'Adquirir 1 relíquia',
    checkFunction: (stats) => stats.relicsOwned >= 1
  },
  {
    id: 'relic_collector',
    name: 'Colecionador de Relíquias',
    category: 'collection',
    rarity: 'silver',
    description: 'Adquiriu 5 relíquias',
    icon: '💍',
    unlockCondition: 'Adquirir 5 relíquias',
    checkFunction: (stats) => stats.relicsOwned >= 5
  },
  {
    id: 'relic_master',
    name: 'Mestre das Relíquias',
    category: 'collection',
    rarity: 'gold',
    description: 'Adquiriu 10 relíquias',
    icon: '👑',
    unlockCondition: 'Adquirir 10 relíquias',
    checkFunction: (stats) => stats.relicsOwned >= 10
  },
  {
    id: 'trait_collector',
    name: 'Colecionador de Traits',
    category: 'collection',
    rarity: 'silver',
    description: 'Ganhou 10 Battle Traits',
    icon: '🎭',
    unlockCondition: 'Ganhar 10 Battle Traits',
    checkFunction: (stats) => stats.traitsEarned >= 10
  },
  {
    id: 'decorated_hero',
    name: 'Herói Condecorado',
    category: 'collection',
    rarity: 'gold',
    description: 'Ganhou 20 Battle Honours',
    icon: '🏅',
    unlockCondition: 'Ganhar 20 Battle Honours',
    checkFunction: (stats) => stats.totalBattleHonours >= 20
  },
  {
    id: 'requisition_master',
    name: 'Mestre de Requisições',
    category: 'collection',
    rarity: 'silver',
    description: 'Comprou 15 requisições',
    icon: '📜',
    unlockCondition: 'Comprar 15 requisições',
    checkFunction: (stats) => stats.requisitionsPurchased >= 15
  }
];

/**
 * Special Badges - Unique achievements
 */
export const SPECIAL_BADGES: Badge[] = [
  {
    id: 'first_campaign',
    name: 'Primeira Cruzada',
    category: 'special',
    rarity: 'bronze',
    description: 'Criou sua primeira campanha',
    icon: '🚀',
    unlockCondition: 'Criar primeira campanha',
    checkFunction: () => true // Granted on campaign creation
  },
  {
    id: 'agenda_master',
    name: 'Mestre de Agendas',
    category: 'special',
    rarity: 'gold',
    description: 'Completou 10 agendas',
    icon: '📋',
    unlockCondition: 'Completar 10 agendas',
    checkFunction: (stats) => stats.agendasCompleted >= 10
  },
  {
    id: 'tactical_genius',
    name: 'Gênio Tático',
    category: 'special',
    rarity: 'gold',
    description: 'Completou 5 agendas táticas',
    icon: '🧠',
    unlockCondition: 'Completar 5 agendas táticas',
    checkFunction: (stats) => stats.tacticalAgendasCompleted >= 5
  },
  {
    id: 'rp_millionaire',
    name: 'Milionário de RP',
    category: 'special',
    rarity: 'platinum',
    description: 'Acumulou 100 Requisition Points',
    icon: '💰',
    unlockCondition: 'Acumular 100 RP total',
    checkFunction: (stats) => stats.totalRP >= 100
  },
  {
    id: 'completionist',
    name: 'Completista',
    category: 'special',
    rarity: 'platinum',
    description: 'Desbloqueou todos os badges disponíveis',
    icon: '🏆',
    unlockCondition: 'Desbloquear todos os badges',
    checkFunction: () => false // Special check required
  }
];

/**
 * All badges combined
 */
export const ALL_BADGES: Badge[] = [
  ...COMBAT_BADGES,
  ...SURVIVAL_BADGES,
  ...PROGRESSION_BADGES,
  ...COLLECTION_BADGES,
  ...SPECIAL_BADGES
];

/**
 * Get all badges
 */
export function getAllBadges(): Badge[] {
  return ALL_BADGES;
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return ALL_BADGES.filter(b => b.category === category);
}

/**
 * Get badges by rarity
 */
export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return ALL_BADGES.filter(b => b.rarity === rarity);
}

/**
 * Get badge by ID
 */
export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find(b => b.id === id);
}

/**
 * Check which badges a player has unlocked
 */
export function checkUnlockedBadges(stats: PlayerStats): Badge[] {
  return ALL_BADGES.filter(badge => badge.checkFunction(stats));
}

/**
 * Check if a specific badge is unlocked
 */
export function isBadgeUnlocked(badgeId: string, stats: PlayerStats): boolean {
  const badge = getBadgeById(badgeId);
  if (!badge) return false;
  return badge.checkFunction(stats);
}

/**
 * Get newly unlocked badges (badges that just became available)
 */
export function getNewlyUnlockedBadges(
  stats: PlayerStats,
  previouslyUnlockedBadgeIds: string[]
): Badge[] {
  const currentlyUnlocked = checkUnlockedBadges(stats);
  return currentlyUnlocked.filter(badge => !previouslyUnlockedBadgeIds.includes(badge.id));
}

/**
 * Calculate badge completion percentage
 */
export function getBadgeCompletionPercentage(unlockedBadgeIds: string[]): number {
  const totalBadges = ALL_BADGES.length;
  const unlockedCount = unlockedBadgeIds.length;
  return Math.round((unlockedCount / totalBadges) * 100);
}

/**
 * Get badges grouped by rarity
 */
export function getBadgesGroupedByRarity(unlockedBadgeIds: string[]): Record<BadgeRarity, { total: number; unlocked: number }> {
  const rarities: BadgeRarity[] = ['bronze', 'silver', 'gold', 'platinum'];
  const result: Record<BadgeRarity, { total: number; unlocked: number }> = {
    bronze: { total: 0, unlocked: 0 },
    silver: { total: 0, unlocked: 0 },
    gold: { total: 0, unlocked: 0 },
    platinum: { total: 0, unlocked: 0 }
  };

  ALL_BADGES.forEach(badge => {
    result[badge.rarity].total++;
    if (unlockedBadgeIds.includes(badge.id)) {
      result[badge.rarity].unlocked++;
    }
  });

  return result;
}
