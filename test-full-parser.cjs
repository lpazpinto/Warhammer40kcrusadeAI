const fs = require('fs');

// Inline the parser code to test it
function parseArmyList(content) {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  const result = {
    armyName: '',
    faction: '',
    detachment: '',
    points: 0,
    units: []
  };

  let currentCategory = 'UNKNOWN';
  let currentUnit = null;
  let currentModel = null;

  console.log('=== PARSING START ===');
  console.log('Total lines:', lines.length);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log(`\nLine ${i}: "${line}"`);

    // Extract army name (first line with points)
    if (!result.armyName && line.includes('Points') && line.includes('(')) {
      const match = line.match(/^(.+?)\s*\((\d+)\s*Points\)/);
      if (match) {
        result.armyName = match[1].trim();
        result.points = parseInt(match[2]);
        console.log(`  -> Army name: ${result.armyName}, Points: ${result.points}`);
      }
      continue;
    }

    // Extract faction
    if (!result.faction && i > 0 && !line.includes('(') && !line.includes('•') && !line.includes('◦')) {
      if (!['CHARACTERS', 'BATTLELINE', 'DEDICATED TRANSPORTS', 'OTHER DATASHEETS'].includes(line.toUpperCase())) {
        result.faction = line;
        console.log(`  -> Faction: ${result.faction}`);
        continue;
      }
    }

    // Extract detachment
    if (!result.detachment && line && !line.includes('(') && !line.includes('•') && !line.includes('◦') && result.faction) {
      if (!['CHARACTERS', 'BATTLELINE', 'DEDICATED TRANSPORTS', 'OTHER DATASHEETS'].includes(line.toUpperCase())) {
        result.detachment = line;
        console.log(`  -> Detachment: ${result.detachment}`);
        continue;
      }
    }

    // Detect category headers
    if (line.toUpperCase() === 'CHARACTERS' || line.toUpperCase() === 'BATTLELINE' || 
        line.toUpperCase() === 'DEDICATED TRANSPORTS' || line.toUpperCase() === 'OTHER DATASHEETS') {
      console.log(`  -> Category change to: ${line.toUpperCase()}`);
      if (currentModel && currentUnit) {
        console.log(`    -> Saving last model: ${currentModel.name}`);
        currentUnit.models.push(currentModel);
      }
      if (currentUnit) {
        console.log(`    -> Saving unit: ${currentUnit.unitName} (${currentUnit.models.length} models)`);
        result.units.push(currentUnit);
      }
      currentCategory = line.toUpperCase();
      currentUnit = null;
      currentModel = null;
      continue;
    }

    // Parse unit name and points
    const unitMatch = line.match(/^(.+?)\s*\((\d+)\s*Points\)$/);
    if (unitMatch) {
      console.log(`  -> New unit detected: ${unitMatch[1]}`);
      if (currentModel && currentUnit) {
        console.log(`    -> Saving last model: ${currentModel.name}`);
        currentUnit.models.push(currentModel);
      }
      if (currentUnit) {
        console.log(`    -> Saving previous unit: ${currentUnit.unitName} (${currentUnit.models.length} models)`);
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
      const modelMatch = modelLine.match(/^(\d+)x\s+(.+)$/);
      if (modelMatch && currentUnit) {
        console.log(`  -> New model: ${modelMatch[1]}x ${modelMatch[2]}`);
        if (currentModel) {
          console.log(`    -> Saving previous model: ${currentModel.name}`);
          currentUnit.models.push(currentModel);
        }
        currentModel = {
          name: modelMatch[2].trim(),
          count: parseInt(modelMatch[1]),
          weapons: []
        };
      } else {
        console.log(`  -> Skipping special line: ${modelLine}`);
      }
      continue;
    }

    // Parse weapon lines (start with ◦)
    if (line.startsWith('◦') && currentModel) {
      const weaponLine = line.substring(1).trim();
      const weaponMatch = weaponLine.match(/^(\d+)x\s+(.+)$/);
      if (weaponMatch) {
        const weaponName = weaponMatch[2].trim();
        currentModel.weapons.push(weaponName);
        console.log(`  -> Weapon: ${weaponName}`);
      }
      continue;
    }
  }

  // Add the last model to the last unit
  if (currentModel && currentUnit) {
    console.log(`\nFinal: Saving last model: ${currentModel.name}`);
    currentUnit.models.push(currentModel);
  }
  
  // Add the last unit
  if (currentUnit) {
    console.log(`Final: Saving last unit: ${currentUnit.unitName} (${currentUnit.models.length} models)`);
    result.units.push(currentUnit);
  }

  console.log('\n=== PARSING END ===');
  return result;
}

const content = fs.readFileSync('/home/ubuntu/test-sororitas.txt', 'utf-8');
const result = parseArmyList(content);

console.log('\n\n=== FINAL RESULT ===');
console.log('Army:', result.armyName);
console.log('Faction:', result.faction);
console.log('Detachment:', result.detachment);
console.log('Total Units:', result.units.length);
console.log('\nUnits:');
result.units.forEach((unit, i) => {
  console.log(`  ${i+1}. ${unit.unitName} (${unit.pointsCost} pts) - ${unit.category} - ${unit.models.length} models`);
});
