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
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract army name (first line with points)
    if (!result.armyName && line.includes('Points') && line.includes('(')) {
      const match = line.match(/^(.+?)\s*\((\d+)\s*Points\)/);
      if (match) {
        result.armyName = match[1].trim();
        result.points = parseInt(match[2]);
      }
      continue;
    }

    // Extract faction
    if (!result.faction && i > 0 && !line.includes('(') && !line.includes('•') && !line.includes('◦')) {
      // Check if this looks like a faction name (not a category header)
      if (!['CHARACTERS', 'BATTLELINE', 'OTHER DATASHEETS'].includes(line.toUpperCase())) {
        result.faction = line;
        continue;
      }
    }

    // Extract detachment
    if (!result.detachment && line && !line.includes('(') && !line.includes('•') && !line.includes('◦') && result.faction) {
      if (!['CHARACTERS', 'BATTLELINE', 'OTHER DATASHEETS'].includes(line.toUpperCase())) {
        result.detachment = line;
        continue;
      }
    }

    // Detect category headers
    if (line.toUpperCase() === 'CHARACTERS') {
      currentCategory = 'CHARACTERS';
      if (currentModel && currentUnit) {
        currentUnit.models.push(currentModel);
      }
      if (currentUnit) result.units.push(currentUnit);
      currentUnit = null;
      currentModel = null;
      continue;
    }
    if (line.toUpperCase() === 'BATTLELINE') {
      currentCategory = 'BATTLELINE';
      if (currentModel && currentUnit) {
        currentUnit.models.push(currentModel);
      }
      if (currentUnit) result.units.push(currentUnit);
      currentUnit = null;
      currentModel = null;
      continue;
    }
    if (line.toUpperCase() === 'OTHER DATASHEETS') {
      currentCategory = 'OTHER DATASHEETS';
      if (currentModel && currentUnit) {
        currentUnit.models.push(currentModel);
      }
      if (currentUnit) result.units.push(currentUnit);
      currentUnit = null;
      currentModel = null;
      continue;
    }

    // Parse unit name and points (e.g., "Death Korps of Krieg (145 Points)")
    const unitMatch = line.match(/^(.+?)\s*\((\d+)\s*Points\)$/);
    if (unitMatch) {
      // Save previous model and unit
      if (currentModel && currentUnit) {
        currentUnit.models.push(currentModel);
      }
      if (currentUnit) {
        result.units.push(currentUnit);
      }

      currentUnit = {
        unitName: unitMatch[1].trim(),
        pointsCost: parseInt(unitMatch[2]),
        category: currentCategory,
        models: []
      };
      currentModel = null;
      continue;
    }

    // Parse model lines (start with •)
    if (line.startsWith('•')) {
      const modelLine = line.substring(1).trim();
      
      // Skip "Warlord" designation
      if (modelLine === 'Warlord') {
        continue;
      }
      
      // Extract count and name (e.g., "1x Lord Commissar" or "1x Laspistol")
      const match = modelLine.match(/^(\d+)x\s+(.+)$/);
      if (match && currentUnit) {
        const name = match[2].trim();
        const count = parseInt(match[1]);
        
        // Heuristic: if name starts with capital letter and we don't have a model yet,
        // OR if name contains common model keywords, it's probably a model
        const isLikelyModel = !currentModel || 
                             name.match(/^[A-Z]/) && (name.includes('Squad') || name.includes('Trooper') || name.includes('Guardsman') || name.includes('Watchmaster') || name.includes('Commissar') || name.includes('Marshal') || name.includes('Engineer') || name.includes('Gunner') || name.includes('Coordinator'));
        
        if (isLikelyModel && !name.toLowerCase().includes('weapon') && !name.toLowerCase().includes('pistol') && !name.toLowerCase().includes('gun') && !name.toLowerCase().includes('sword') && !name.toLowerCase().includes('fist') && !name.toLowerCase().includes('claw') && !name.toLowerCase().includes('las')) {
          // This is a model
          if (currentModel) {
            currentUnit.models.push(currentModel);
          }
          currentModel = {
            name: name,
            count: count,
            weapons: []
          };
          console.log(`[armyParser] Created model: ${name}`);
        } else {
          // This is a weapon
          if (!currentModel && currentUnit) {
            // Create implicit model for single-model CHARACTER units
            currentModel = {
              name: currentUnit.unitName,
              count: 1,
              weapons: []
            };
            console.log(`[armyParser] Created implicit model: ${currentModel.name}`);
          }
          if (currentModel) {
            currentModel.weapons.push(name);
            console.log(`[armyParser] Added weapon: ${name} to model: ${currentModel.name}`);
          }
        }
      }
      continue;
    }

    // Parse weapon lines (start with ◦ or indented with spaces)
    // Check for bullet point (◦) or heavy indentation (likely a weapon)
    const trimmedLine = line.trimStart();
    if ((trimmedLine.startsWith('◦') || trimmedLine.startsWith('•') || (line.startsWith('  ') && line.length > 2 && !line.startsWith('•'))) && currentModel) {
      // Remove bullet point if present
      let weaponLine = trimmedLine;
      if (weaponLine.startsWith('◦') || weaponLine.startsWith('•')) {
        weaponLine = weaponLine.substring(1).trim();
      } else {
        weaponLine = weaponLine.trim();
      }
      
      // Extract weapon count and name (e.g., "1x Laspistol" or "18x Close combat weapon")
      const weaponMatch = weaponLine.match(/^(\d+)x\s+(.+)$/);
      if (weaponMatch) {
        const weaponName = weaponMatch[2].trim();
        currentModel.weapons.push(weaponName);
        console.log(`[armyParser] Added weapon: ${weaponName} to model: ${currentModel.name}`);
      }
      continue;
    }

    // Skip export version and other metadata
    if (line.startsWith('Exported with')) {
      continue;
    }

    // Skip Warlord designation
    if (line === 'Warlord') {
      continue;
    }
  }

  // Add the last unit
  if (currentUnit) {
    if (currentModel) {
      currentUnit.models.push(currentModel);
    }
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
 * Calculate total models in a unit
 */
export function calculateTotalModels(unit: ParsedUnit): number {
  return unit.models.reduce((sum, model) => sum + model.count, 0);
}

/**
 * Estimate power rating based on points cost (rough approximation)
 * In 10th edition, Power Rating is approximately points / 20
 */
export function estimatePowerRating(pointsCost: number): number {
  return Math.ceil(pointsCost / 20);
}

