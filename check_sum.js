import fs from 'fs';
const content = fs.readFileSync('src/data/quranMetadata.ts', 'utf8');
const lines = content.split('\n');
let sum = 0;
for (const line of lines) {
  const match = line.match(/totalAyahs:\s*(\d+)/);
  if (match) {
    sum += parseInt(match[1], 10);
  }
}
console.log('Sum:', sum);
