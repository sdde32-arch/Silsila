const fs = require('fs');
let content = fs.readFileSync('src/components/WordInspectorModal.tsx', 'utf8');

content = content.replace(/p-5 sm:p-6 rounded-3xl/g, 'p-4 sm:p-5 rounded-2xl');
content = content.replace(/text-5xl sm:text-6xl/g, 'text-4xl sm:text-5xl');

fs.writeFileSync('src/components/WordInspectorModal.tsx', content);
console.log('patched WordInspectorModal.tsx padding');
