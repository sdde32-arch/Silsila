const fs = require('fs');
let code = fs.readFileSync('src/services/memorizationEngine.ts', 'utf8');

const newStep = `
    {
      stepNumber: 3,
      stepType: 'english-translation',
      title: 'Translation Recall',
      subtitle: 'Memorize the English meaning',
      ayah,
      surahNumber,
      surahName: surahMeta.name,
      audioUrl,
      mechanic: 'full_blind',
    },`;

code = code.replace(
  /stepType: 'word-breakdown',[\s\S]*?mechanic: 'full_blind',\s*\},/,
  match => match + newStep
);

// We need to re-number stepNumber to 4, 5, 6
code = code.replace(/stepNumber: 3,\s*stepType: 'active-recall',/, "stepNumber: 4,\n      stepType: 'active-recall',");
code = code.replace(/stepNumber: 4,\s*stepType: 'self-recitation',/, "stepNumber: 5,\n      stepType: 'self-recitation',");
code = code.replace(/stepNumber: 5,\s*stepType: 'self-scoring',/, "stepNumber: 6,\n      stepType: 'self-scoring',");

fs.writeFileSync('src/services/memorizationEngine.ts', code);
