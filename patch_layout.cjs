const fs = require('fs');
let content = fs.readFileSync('src/components/memorization/MemorizationLessonPage.tsx', 'utf8');

// Replace large cards with tighter, more fluid cards
content = content.replace(/p-4 sm:p-5 rounded-3xl/g, 'p-3.5 sm:p-4 rounded-2xl');

// Make the main container slightly narrower for better fluid reading on desktop
// Find the header constraint
content = content.replace(/<div className="max-w-xl mx-auto space-y-1.5">/g, '<div className="max-w-md mx-auto space-y-1.5">');

// Find the main section constraint
content = content.replace(/<main className="max-w-xl mx-auto/g, '<main className="max-w-md mx-auto');

// Word Breakdown adjustments
content = content.replace(/grid-cols-2 sm:grid-cols-3 gap-2.5/g, 'grid-cols-3 sm:grid-cols-4 gap-2');
content = content.replace(/className="p-3 rounded-2xl bg-white/g, 'className="p-2.5 rounded-2xl bg-white');
content = content.replace(/font-quran text-2xl text-slate-900/g, 'font-quran text-xl sm:text-2xl text-slate-900');
content = content.replace(/text-xs text-amber-900 font-bold block truncate/g, 'text-[10px] sm:text-[11px] text-amber-900 font-bold block truncate');
content = content.replace(/text-\[11px\] text-slate-500 font-medium block truncate/g, 'text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate');

fs.writeFileSync('src/components/memorization/MemorizationLessonPage.tsx', content);
console.log('patched MemorizationLessonPage.tsx layout');
