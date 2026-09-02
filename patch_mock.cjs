const fs = require('fs');
let code = fs.readFileSync('src/data/mockExercises.ts', 'utf8');

const target = `    stepType: 'fill-blank',
    title: 'Multi-Word Recall (Ayah 22)',
    type: 'fill-blank',
    progressCurrent: 5,
    progressTotal: 6,
    ayahReference: 'Surah Al-Mulk [67:22]',
    ayahWithBlanks: 'أَفَمَن يَمْشِى مُكِبًّا عَلَىٰ ___ أَهْدَىٰٓ أَمَّن يَمْشِى سَوِيًّا عَلَىٰ صِرَٰطٍ ___',
    wordBank: ['وَجْهِهِۦٓ', 'مُّسْتَقِيمٍ', 'قَلْبِهِۦ', 'عَظِيمٍ', 'ٱلسَّمَاءِ'],
    correctBlanks: ['وَجْهِهِۦٓ', 'مُّسْتَقِيمٍ'],
    blankCount: 2,
    promptText: '"Is he who walks fallen on his face more guided, or he who walks upright on a straight path?"',`;

const replacement = `    stepType: 'fill-blank',
    title: 'English Translation Memorization',
    type: 'english-fill-blank',
    progressCurrent: 5,
    progressTotal: 6,
    ayahReference: 'Surah Al-Mulk [67:22]',
    ayahWithBlanks: 'Is he who walks fallen on his ___ more guided, or he who walks upright on a straight ___?',
    wordBank: ['face', 'path', 'heart', 'mountain', 'sky'],
    correctBlanks: ['face', 'path'],
    blankCount: 2,
    promptText: 'أَفَمَن يَمْشِى مُكِبًّا عَلَىٰ وَجْهِهِۦٓ أَهْدَىٰٓ أَمَّن يَمْشِى سَوِيًّا عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ',`;

code = code.replace(target, replacement);

fs.writeFileSync('src/data/mockExercises.ts', code);
