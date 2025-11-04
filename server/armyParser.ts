/**
 * Army List Parser
 * Parses .txt files exported from the Warhammer 40k official app
 * and extracts army information and unit data
 */

export interface ParsedModel {
  name: string;
  count: number;
  weapons: string[];
}

export interface ParsedUnit {
  unitName: string;
  pointsCost: number;
  category: 'CHARACTERS' | 'BATTLELINE' | 'OTHER DATASHEETS' | 'UNKNOWN';
  models: ParsedModel[];
}

export interface ParsedArmy {
  armyName: string;
  faction: string;
  detachment: string;
  points: number;
  units: ParsedUnit[];
}

/**
 * Parse an army list from a .txt file content
 */
export function parseArmyList(content: string): ParsedArmy {
  const lines = content.split('\n').map(line => line.trimEnd());
  
  const result: ParsedArmy = {
    armyName: '',
    faction: '',
    detachment: '',
    points: 0,
    units: []
  };

  let currentCategory: 'CHARACTERS' | 'BATTLELINE' | 'OTHER DATASHEETS' | 'UNKNOWN' = 'UNKNOWN';
  let currentUnit: ParsedUnit | null = null;
  let currentModel: ParsedModel | null = null;
  let unitLines: string[] = []; // Collect lines for current unit
  let inUnit = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) continue;

    // Extract army name (first line with points)
    if (!result.armyName && trimmed.includes('Points') && trimmed.includes('(')) {
      const match = trimmed.match(/^(.+?)\s*\((\d+)\s*Points\)$/);
      if (match) {
        result.armyName = match[1].trim();
        result.points = parseInt(match[2]);
      }
      continue;
    }

    // Extract faction
    if (!result.faction && i > 0 && !trimmed.includes('(') && !trimmed.includes('•') && !trimmed.includes('◦')) {
      if (!['CHARACTERS', 'BATTLELINE', 'OTHER DATASHEETS'].includes(trimmed.toUpperCase())) {
        result.faction = trimmed;
        continue;
      }
    }

    // Extract detachment
    if (!result.detachment && trimmed && !trimmed.includes('(') && !trimmed.includes('•') && !trimmed.includes('◦') && result.faction) {
      if (!['CHARACTERS', 'BATTLELINE', 'OTHER DATASHEETS'].includes(trimmed.toUpperCase())) {
        result.detachment = trimmed;
        continue;
      }
    }

    // Detect category headers
    if (trimmed.toUpperCase() === 'CHARACTERS') {
      if (currentUnit && unitLines.length > 0) {
        parseUnit(currentUnit, unitLines);
        result.units.push(currentUnit);
      }
      currentCategory = 'CHARACTERS';
      currentUnit = null;
      unitLines = [];
      inUnit = false;
      continue;
    }
    if (trimmed.toUpperCase() === 'BATTLELINE') {
      if (currentUnit && unitLines.length > 0) {
        parseUnit(currentUnit, unitLines);
        result.units.push(currentUnit);
      }
      currentCategory = 'BATTLELINE';
      currentUnit = null;
      unitLines = [];
      inUnit = false;
      continue;
    }
    if (trimmed.toUpperCase() === 'OTHER DATASHEETS') {
      if (currentUnit && unitLines.length > 0) {
        parseUnit(currentUnit, unitLines);
        result.units.push(currentUnit);
      }
      currentCategory = 'OTHER DATASHEETS';
      currentUnit = null;
      unitLines = [];
      inUnit = false;
      continue;
    }

    // Parse unit name and points (e.g., "Death Korps of Krieg (145 Points)")
    const unitMatch = trimmed.match(/^(.+?)\s*\((\d+)\s*Points\)$/);
    if (unitMatch) {
      // Save previous unit
      if (currentUnit && unitLines.length > 0) {
        parseUnit(currentUnit, unitLines);
        result.units.push(currentUnit);
      }

      currentUnit = {
        unitName: unitMatch[1].trim(),
        pointsCost: parseInt(unitMatch[2]),
        category: currentCategory,
        models: []
      };
      unitLines = [];
      inUnit = true;
      continue;
    }

    // Collect lines for current unit
    if (inUnit && (trimmed.startsWith('•') || trimmed.startsWith('◦') || line.startsWith('  '))) {
      unitLines.push(line);
    }

    // Skip metadata
    if (trimmed.startsWith('Exported with')) {
      continue;
    }
  }

  // Add the last unit
  if (currentUnit && unitLines.length > 0) {
    parseUnit(currentUnit, unitLines);
    result.units.push(currentUnit);
  }

  // Log parsing summary
  const totalWeapons = result.units.reduce((sum, unit) => 
    sum + unit.models.reduce((modelSum, model) => modelSum + model.weapons.length, 0), 0
  );
  console.log(`[armyParser] Parsed ${result.units.length} units with ${totalWeapons} total weapons`);
  result.units.forEach(unit => {
    const unitWeapons = unit.models.reduce((sum, model) => sum + model.weapons.length, 0);
    console.log(`[armyParser] - ${unit.unitName}: ${unit.models.length} models, ${unitWeapons} weapons`);
  });

  return result;
}

/**
 * Parse unit lines to extract models and weapons
 * Uses two-pass approach: first detect if single or multi-model, then parse accordingly
 */
function parseUnit(unit: ParsedUnit, lines: string[]): void {
  // First pass: detect if this is a single-model or multi-model unit
  // Single-model units (like CHARACTERS) have only • lines, no ◦ lines
  // Multi-model units have both • (models) and ◦ (weapons)
  const hasSubBullets = lines.some(line => line.trim().startsWith('◦'));
  
  console.log(`[armyParser] Parsing unit: ${unit.unitName}, hasSubBullets: ${hasSubBullets}`);

  if (!hasSubBullets && unit.category === 'CHARACTERS') {
    // Single-model CHARACTER unit: create one model with unit name, all • lines are weapons
    const model: ParsedModel = {
      name: unit.unitName,
      count: 1,
      weapons: []
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('•')) {
        const content = trimmed.substring(1).trim();
        
        // Skip "Warlord" designation
        if (content === 'Warlord') continue;
        
        // Extract weapon name (with or without count)
        const match = content.match(/^(?:\d+x\s+)?(.+)$/);
        if (match) {
          const weaponName = match[1].trim();
          model.weapons.push(weaponName);
          console.log(`[armyParser] Added weapon: ${weaponName} to single-model unit`);
        }
      }
    }

    unit.models.push(model);
  } else {
    // Multi-model unit: • lines are models, ◦ lines are weapons
    let currentModel: ParsedModel | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Model line (•)
      if (trimmed.startsWith('•')) {
        const content = trimmed.substring(1).trim();
        
        // Skip "Warlord" designation
        if (content === 'Warlord') continue;

        // Extract count and name (e.g., "2x Death Korps Watchmaster")
        const match = content.match(/^(\d+)x\s+(.+)$/);
        if (match) {
          // Save previous model
          if (currentModel) {
            unit.models.push(currentModel);
          }

          currentModel = {
            name: match[2].trim(),
            count: parseInt(match[1]),
            weapons: []
          };
          console.log(`[armyParser] Created model: ${currentModel.name} (count: ${currentModel.count})`);
        }
      }

      // Weapon line (◦)
      if (trimmed.startsWith('◦') && currentModel) {
        const content = trimmed.substring(1).trim();
        
        // Extract weapon name (with or without count)
        const match = content.match(/^(?:\d+x\s+)?(.+)$/);
        if (match) {
          const weaponName = match[1].trim();
          currentModel.weapons.push(weaponName);
          console.log(`[armyParser] Added weapon: ${weaponName} to model: ${currentModel.name}`);
        }
      }
    }

    // Save last model
    if (currentModel) {
      unit.models.push(currentModel);
    }
  }
}


/**
 * Estimate Power Rating from points cost
 * Rough approximation: 1 PR ≈ 20 points
 */
export function estimatePowerRating(points: number): number {
  return Math.max(1, Math.round(points / 20));
}
