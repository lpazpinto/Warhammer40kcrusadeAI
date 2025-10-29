const fs = require('fs');

// Read the file
const content = fs.readFileSync('/home/ubuntu/test-sororitas.txt', 'utf-8');
const lines = content.split('\n').map(line => line.trim()).filter(line => line);

console.log('Total lines:', lines.length);
console.log('\nFirst 20 lines:');
lines.slice(0, 20).forEach((line, i) => {
  console.log(`${i}: "${line}"`);
});

// Look for unit patterns
console.log('\n\nLines matching unit pattern (name + points):');
lines.forEach((line, i) => {
  const match = line.match(/^(.+?)\s*\((\d+)\s*Points\)$/);
  if (match) {
    console.log(`Line ${i}: "${line}" -> Unit: "${match[1]}", Points: ${match[2]}`);
  }
});

// Look for model patterns
console.log('\n\nLines starting with •:');
lines.forEach((line, i) => {
  if (line.startsWith('•')) {
    console.log(`Line ${i}: "${line}"`);
  }
});
