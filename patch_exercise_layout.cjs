const fs = require('fs');
let content = fs.readFileSync('src/components/ExerciseCard.tsx', 'utf8');

content = content.replace(/max-w-xl/g, 'max-w-md');
content = content.replace(/p-4 sm:p-5 rounded-3xl/g, 'p-3.5 sm:p-4 rounded-2xl');

// Make English translations a little more structured if needed, but the sizing is the main request
fs.writeFileSync('src/components/ExerciseCard.tsx', content);
console.log('patched ExerciseCard.tsx layout');
