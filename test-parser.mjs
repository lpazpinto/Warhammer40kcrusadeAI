import { readFileSync } from 'fs';
import { parseArmyList } from './server/armyParser.ts';

const content = readFileSync('/home/ubuntu/upload/exercito.txt', 'utf-8');
const result = parseArmyList(content);

console.log('Army Name:', result.armyName);
console.log('Faction:', result.faction);
console.log('Detachment:', result.detachment);
console.log('Total Units:', result.units.length);
console.log('\nUnits:');
result.units.forEach((unit, i) => {
  console.log(`  ${i+1}. ${unit.unitName} (${unit.pointsCost} pts) - ${unit.category}`);
  console.log(`     Models: ${unit.models.length}`);
  unit.models.forEach(model => {
    console.log(`       - ${model.count}x ${model.name} (${model.weapons.length} weapons)`);
  });
});
