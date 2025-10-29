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
  category: 'CHARACTERS' | 'BATTLELINE' | 'DEDICATED TRANSPORTS' | 'OTHER DATASHEETS' | 'UNKNOWN';
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

  let currentCategory: 'CHARACTERS' | 'BATTLELINE' | 'DEDICATED TRANSPORTS' | 'OTHER DATASHEETS' | 'UNKNOWN' = 'UNKNOWN';
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
      if (!['CHARACTERS', 'BATTLELINE', 'DEDICATED TRANSPORTS', 'OTHER DATASHEETS'].includes(line.toUpperCase())) {
        result.faction = line;
        continue;
      }
    }

    // Extract detachment
    if (!result.detachment && line && !line.includes('(') && !line.includes('•') && !line.includes('◦') && result.faction) {
      if (!['CHARACTERS', 'BATTLELINE', 'DEDICATED TRANSPORTS', 'OTHER DATASHEETS'].includes(line.toUpperCase())) {
        result.detachment = line;
        continue;
      }
    }

    // Detect category headers
    if (line.toUpperCase() === 'CHARACTERS') {
      currentCategory = 'CHARACTERS';
      if (currentModel && currentUnit) currentUnit.models.push(currentModel);
      if (currentUnit) result.units.push(currentUnit);
      currentUnit = null;
      currentModel = null;
      continue;
    }
    if (line.toUpperCase() === 'BATTLELINE') {
      currentCategory = 'BATTLELINE';
      if (currentModel && currentUnit) currentUnit.models.push(currentModel);
      if (currentUnit) result.units.push(currentUnit);
      currentUnit = null;
      currentModel = null;
      continue;
    }
    if (line.toUpperCase() === 'DEDICATED TRANSPORTS') {
      currentCategory = 'DEDICATED TRANSPORTS';
      if (currentModel && currentUnit) currentUnit.models.push(currentModel);
      if (currentUnit) result.units.push(currentUnit);
      currentUnit = null;
      currentModel = null;
      continue;
    }
    if (line.toUpperCase() === 'OTHER DATASHEETS') {
      currentCategory = 'OTHER DATASHEETS';
      if (currentModel && currentUnit) currentUnit.models.push(currentModel);
      if (currentUnit) result.units.push(currentUnit);
      currentUnit = null;
      currentModel = null;
      continue;
    }

    // Parse unit name and points (e.g., "Death Korps of Krieg (145 Points)")
    const unitMatch = line.match(/^(.+?)\s*\((\d+)\s*Points\)$/);
    if (unitMatch) {
      // Save the last model of the previous unit
      if (currentModel && currentUnit) {
        currentUnit.models.push(currentModel);
      }
      
      // Save previous unit
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
      
      // Extract model count and name (e.g., "1x Lord Commissar" or "18x Death Korps Trooper")
      const modelMatch = modelLine.match(/^(\d+)x\s+(.+)$/);
      if (modelMatch && currentUnit) {
        // Save previous model before creating new one
        if (currentModel) {
          currentUnit.models.push(currentModel);
        }

        currentModel = {
          name: modelMatch[2].trim(),
          count: parseInt(modelMatch[1]),
          weapons: []
        };
      }
      // If line doesn't match model format (e.g., "Warlord"), just skip it
      continue;
    }

    // Parse weapon lines (start with ◦)
    if (line.startsWith('◦') && currentModel) {
      const weaponLine = line.substring(1).trim();
      
      // Extract weapon count and name (e.g., "1x Laspistol" or "18x Close combat weapon")
      const weaponMatch = weaponLine.match(/^(\d+)x\s+(.+)$/);
      if (weaponMatch) {
        const weaponName = weaponMatch[2].trim();
        currentModel.weapons.push(weaponName);
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

  // Add the last model to the last unit
  if (currentModel && currentUnit) {
    currentUnit.models.push(currentModel);
  }
  
  // Add the last unit
  if (currentUnit) {
    result.units.push(currentUnit);
  }

  // Post-process: Fix vehicle units
  // Vehicles have their weapons listed with • instead of ◦, so they appear as multiple "models"
  // If a unit has multiple "models" but none of them have weapons, it's likely a vehicle
  for (const unit of result.units) {
    if (unit.models.length > 1) {
      const hasAnyWeapons = unit.models.some(model => model.weapons.length > 0);
      
      if (!hasAnyWeapons) {
        // This is likely a vehicle - consolidate all "models" into weapons of a single model
        const vehicleWeapons: string[] = [];
        for (const model of unit.models) {
          vehicleWeapons.push(model.name);
        }
        
        unit.models = [{
          name: unit.unitName,
          count: 1,
          weapons: vehicleWeapons
        }];
      }
    }
  }

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

