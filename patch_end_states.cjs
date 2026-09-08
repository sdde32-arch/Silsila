const fs = require('fs');
let content = fs.readFileSync('src/components/memorization/MemorizationLessonPage.tsx', 'utf8');

content = content.replace(/p-5 sm:p-6 rounded-3xl/g, 'p-4 sm:p-5 rounded-2xl');
content = content.replace(/p-5 bg-slate-50 rounded-2xl/g, 'p-4 bg-slate-50 rounded-xl');
content = content.replace(/p-5 sm:p-7 rounded-2xl/g, 'p-4 sm:p-5 rounded-2xl');

fs.writeFileSync('src/components/memorization/MemorizationLessonPage.tsx', content);
console.log('patched MemorizationLessonPage.tsx end states');
