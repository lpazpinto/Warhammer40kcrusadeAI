/**
 * Requisitions System
 * Players can spend Requisition Points (RP) to purchase upgrades
 * Maximum 10 RP per Crusade force
 * Each battle grants +1 RP (win, lose, or draw)
 */

export interface Requisition {
  id: string;
  name: string;
  cost: number | string; // Can be "1-3RP" for variable cost
  description: string;
  timing: 'anytime' | 'before_battle' | 'after_battle';
  restrictions?: string;
}

export const REQUISITIONS: Requisition[] = [
  {
    id: 'increase_supply_limit',
    name: 'Increase Supply Limit',
    cost: 1,
    description: 'Purchase at any time. Increase your Crusade force\'s Supply Limit by 200 points.',
    timing: 'anytime',
  },
  {
    id: 'rearm_and_resupply',
    name: 'Rearm and Resupply',
    cost: 1,
    description: 'Purchase before a battle. Select one unit from your Crusade force. You can change any weapon options models in that unit are equipped with as described on that unit\'s datasheet. If you give a weapon that is a Relic or is upgraded by Weapon Modifications (pg 64), that Crusade Relic or any Weapon Modifications are lost. Recalculate the unit\'s points value as a result of any of these changes and update its Crusade card. You cannot make any changes that would cause you to exceed your Supply Limit.',
    timing: 'before_battle',
  },
  {
    id: 'repair_and_recuperate',
    name: 'Repair and Recuperate',
    cost: '1-5RP',
    description: 'Purchase after a battle. Select one unit from your Crusade force that has one or more Battle Scars. Select one of that unit\'s Battle Scars and remove it from its Crusade card (for each Battle Scar removed, the unit\'s Crusade points total will increase by 1). This Requisition costs 1RP plus 1 additional RP for each Battle Honour that unit has (to a maximum of 5RP).',
    timing: 'after_battle',
    restrictions: 'Unit must have at least one Battle Scar',
  },
  {
    id: 'fresh_recruits',
    name: 'Fresh Recruits',
    cost: '1-4RP',
    description: 'Purchase at any time. Select one unit from your Crusade force. You can add additional models to that unit, up to the maximum listed on that unit\'s datasheet. Recalculate the unit\'s points value as a result of any of these changes and update its Crusade card. You cannot make any changes that would cause you to exceed your Supply Limit. This Requisition costs 1RP plus 1 additional RP for every 2 Battle Honours the unit has, rounding up (to a maximum of 4RP).',
    timing: 'anytime',
    restrictions: 'Cannot exceed unit\'s maximum size or Supply Limit',
  },
  {
    id: 'renowned_heroes',
    name: 'Renowned Heroes',
    cost: '1-3RP',
    description: 'When you first start a Crusade force, you can purchase this Requisition to add one CHARACTER unit to your Crusade force. After that point, you can purchase this Requisition when a unit from your Crusade force gains a rank. In either case, you cannot select an EPIC HERO unit, a unit that already has the Disgraced or Mark of Shame Battle Scars (pg 61). You can select one Enhancement that unit has access to (if using this Requisition when that unit gains a rank, this is instead a Battle Honour). When mustering your army for a battle, that unit can have this Enhancement even though you have not yet started to muster your army and so have not selected any Detachment rules yet. If the selected Enhancement replaces a weapon that is a Crusade Relic or is upgraded by Weapon Modifications (pg 64), that Crusade Relic or Weapon Modifications are lost. Recalculate the unit\'s points value as a result of gaining this Enhancement and update its Crusade card. You cannot make any changes that would cause you to exceed your Supply Limit. This Requisition costs 1RP plus 1 additional RP for each other Enhancement that your Crusade force contains (to a maximum of 3RP).',
    timing: 'anytime',
    restrictions: 'Cannot select EPIC HERO, Disgraced, or Mark of Shame units',
  },
  {
    id: 'legendary_veterans',
    name: 'Legendary Veterans',
    cost: 3,
    description: 'Purchase when a unit from your Crusade force (excluding CHARACTER units) reaches 30XP. That unit\'s Experience Points total is no longer limited to a maximum of 30XP and it can now be promoted above the Battle-hardened rank. In addition, the maximum number of Battle Honours that unit can have is increased to 6.',
    timing: 'anytime',
    restrictions: 'Unit must have 30XP and not be a CHARACTER',
  },
];

/**
 * Calculate the actual RP cost for a requisition based on player/unit state
 */
export function calculateRequisitionCost(
  requisitionId: string,
  context?: {
    unitBattleHonours?: number;
    unitBattleScars?: number;
    crusadeEnhancements?: number;
  }
): number {
  const requisition = REQUISITIONS.find(r => r.id === requisitionId);
  if (!requisition) return 0;

  if (typeof requisition.cost === 'number') {
    return requisition.cost;
  }

  // Variable cost requisitions
  switch (requisitionId) {
    case 'repair_and_recuperate':
      return 1 + (context?.unitBattleHonours || 0);
    
    case 'fresh_recruits':
      return 1 + Math.ceil((context?.unitBattleHonours || 0) / 2);
    
    case 'renowned_heroes':
      return 1 + (context?.crusadeEnhancements || 0);
    
    default:
      return 1;
  }
}
