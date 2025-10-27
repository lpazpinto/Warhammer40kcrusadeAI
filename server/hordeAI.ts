/**
 * Horde Mode AI System
 * Implements AI decision-making for Horde units
 */

export interface Position {
  x: number;
  y: number;
}

export interface HordeUnit {
  id: string;
  name: string;
  position: Position;
  weapons: string[];
  hasHeavyWeapons: boolean;
  hasMeleeWeapons: boolean;
  isInSpawningZone: boolean;
  isVisible: boolean;
}

export interface PlayerUnit {
  id: string;
  name: string;
  position: Position;
  isVisible: boolean;
}

export interface Objective {
  id: string;
  position: Position;
  controlledBy: 'player' | 'horde' | 'none';
  isInSpawningZone: boolean;
}

export interface AIDecision {
  unitId: string;
  action: 'move' | 'shoot' | 'charge' | 'advance' | 'fallback';
  target?: string;
  reasoning: string;
}

/**
 * Calculate distance between two positions
 */
function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the closest visible enemy unit
 */
function findClosestVisibleEnemy(unit: HordeUnit, enemies: PlayerUnit[]): PlayerUnit | null {
  const visibleEnemies = enemies.filter(e => e.isVisible);
  
  if (visibleEnemies.length === 0) return null;
  
  let closest = visibleEnemies[0];
  let minDistance = calculateDistance(unit.position, closest.position);
  
  for (const enemy of visibleEnemies.slice(1)) {
    const distance = calculateDistance(unit.position, enemy.position);
    if (distance < minDistance) {
      minDistance = distance;
      closest = enemy;
    }
  }
  
  return closest;
}

/**
 * Find the closest visible objective not controlled by another Horde unit
 */
function findClosestObjective(unit: HordeUnit, objectives: Objective[]): Objective | null {
  const validObjectives = objectives.filter(
    obj => !obj.isInSpawningZone && obj.controlledBy !== 'horde'
  );
  
  if (validObjectives.length === 0) return null;
  
  let closest = validObjectives[0];
  let minDistance = calculateDistance(unit.position, closest.position);
  
  for (const obj of validObjectives.slice(1)) {
    const distance = calculateDistance(unit.position, obj.position);
    if (distance < minDistance) {
      minDistance = distance;
      closest = obj;
    }
  }
  
  return closest;
}

/**
 * Determine if a unit should move
 * Units don't move if:
 * - Majority have Heavy weapons and can see an enemy in range
 * - Would lose significant bonus from abilities
 * - Within spawning zone (must always try to leave)
 */
export function shouldMove(
  unit: HordeUnit,
  enemies: PlayerUnit[],
  weaponRange: number = 24
): boolean {
  // Always move if in spawning zone
  if (unit.isInSpawningZone) return true;
  
  // Check if unit has Heavy weapons
  if (unit.hasHeavyWeapons) {
    const closestEnemy = findClosestVisibleEnemy(unit, enemies);
    if (closestEnemy) {
      const distance = calculateDistance(unit.position, closestEnemy.position);
      if (distance <= weaponRange) {
        return false; // Don't move, shoot instead
      }
    }
  }
  
  return true;
}

/**
 * Determine if a unit should advance
 */
export function shouldAdvance(unit: HordeUnit, hasAssaultWeapons: boolean): boolean {
  // Advance if all weapons are Assault
  if (hasAssaultWeapons) return true;
  
  // Advance if unit has ability to advance and still shoot/charge
  // (This would need to be checked against unit datasheet)
  
  // Advance if unit couldn't shoot anyway and has no reason to charge
  if (!unit.hasMeleeWeapons && unit.weapons.length === 0) return true;
  
  return false;
}

/**
 * Determine movement target
 * Priority: 1. Closest visible enemy, 2. Closest objective, 3. Defender board edge
 */
export function determineMovementTarget(
  unit: HordeUnit,
  enemies: PlayerUnit[],
  objectives: Objective[]
): { target: Position; reasoning: string } {
  // 1. Closest visible enemy
  const closestEnemy = findClosestVisibleEnemy(unit, enemies);
  if (closestEnemy) {
    return {
      target: closestEnemy.position,
      reasoning: `Movendo em direção ao inimigo mais próximo: ${closestEnemy.name}`
    };
  }
  
  // 2. Closest visible objective
  const closestObjective = findClosestObjective(unit, objectives);
  if (closestObjective) {
    return {
      target: closestObjective.position,
      reasoning: `Movendo em direção ao objetivo mais próximo: ${closestObjective.id}`
    };
  }
  
  // 3. Defender board edge (assume y=0 is defender edge)
  return {
    target: { x: unit.position.x, y: 0 },
    reasoning: 'Movendo em direção à borda do defensor'
  };
}

/**
 * Determine shooting target (closest legal target)
 */
export function determineShootingTarget(
  unit: HordeUnit,
  enemies: PlayerUnit[]
): { target: PlayerUnit | null; reasoning: string } {
  const closestEnemy = findClosestVisibleEnemy(unit, enemies);
  
  if (!closestEnemy) {
    return {
      target: null,
      reasoning: 'Nenhum alvo visível para atirar'
    };
  }
  
  return {
    target: closestEnemy,
    reasoning: `Atirando no alvo mais próximo: ${closestEnemy.name}`
  };
}

/**
 * Determine if unit should charge
 * Charges if majority of unit has melee weapons better than Close Combat Weapon
 */
export function shouldCharge(unit: HordeUnit): boolean {
  return unit.hasMeleeWeapons;
}

/**
 * Determine charge target (closest enemy)
 */
export function determineChargeTarget(
  unit: HordeUnit,
  enemies: PlayerUnit[]
): { target: PlayerUnit | null; reasoning: string } {
  const closestEnemy = findClosestVisibleEnemy(unit, enemies);
  
  if (!closestEnemy) {
    return {
      target: null,
      reasoning: 'Nenhum alvo para carga'
    };
  }
  
  const distance = calculateDistance(unit.position, closestEnemy.position);
  
  if (distance > 12) {
    return {
      target: null,
      reasoning: 'Alvo muito distante para carga (>12")'
    };
  }
  
  return {
    target: closestEnemy,
    reasoning: `Carregando o inimigo mais próximo: ${closestEnemy.name}`
  };
}

/**
 * Generate complete AI decision for a unit's turn
 */
export function generateUnitDecisions(
  unit: HordeUnit,
  enemies: PlayerUnit[],
  objectives: Objective[]
): AIDecision[] {
  const decisions: AIDecision[] = [];
  
  // Movement phase
  if (shouldMove(unit, enemies)) {
    const movement = determineMovementTarget(unit, enemies, objectives);
    decisions.push({
      unitId: unit.id,
      action: 'move',
      reasoning: movement.reasoning
    });
    
    if (shouldAdvance(unit, false)) {
      decisions.push({
        unitId: unit.id,
        action: 'advance',
        reasoning: 'Avançando para cobrir mais terreno'
      });
    }
  }
  
  // Shooting phase
  const shooting = determineShootingTarget(unit, enemies);
  if (shooting.target) {
    decisions.push({
      unitId: unit.id,
      action: 'shoot',
      target: shooting.target.id,
      reasoning: shooting.reasoning
    });
  }
  
  // Charge phase
  if (shouldCharge(unit)) {
    const charge = determineChargeTarget(unit, enemies);
    if (charge.target) {
      decisions.push({
        unitId: unit.id,
        action: 'charge',
        target: charge.target.id,
        reasoning: charge.reasoning
      });
    }
  }
  
  return decisions;
}

/**
 * Generate decisions for all Horde units
 */
export function generateAllDecisions(
  hordeUnits: HordeUnit[],
  enemies: PlayerUnit[],
  objectives: Objective[]
): Map<string, AIDecision[]> {
  const allDecisions = new Map<string, AIDecision[]>();
  
  for (const unit of hordeUnits) {
    const decisions = generateUnitDecisions(unit, enemies, objectives);
    allDecisions.set(unit.id, decisions);
  }
  
  return allDecisions;
}

