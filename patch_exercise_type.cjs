const fs = require('fs');
let code = fs.readFileSync('src/components/ExerciseCard.tsx', 'utf8');

// 1. completeTargetArabicText
code = code.replace(
  `    if (direction === 'meaning-to-arabic') {`,
  `    if (type === 'english-fill-blank') {
      return promptText || '';
    }

    if (direction === 'meaning-to-arabic') {`
);

// 2. allExerciseArabicText
code = code.replace(
  `    if (direction === 'meaning-to-arabic') {
      return options.map((o) => o.text).join(' ');
    }`,
  `    if (type === 'english-fill-blank') {
      return promptText || '';
    }
    if (direction === 'meaning-to-arabic') {
      return options.map((o) => o.text).join(' ');
    }`
);

// 3. handleCheck
code = code.replace(
  `    if (type === 'fill-blank') {
      if (filledBlanks.length !== blankCount) return;`,
  `    if (type === 'fill-blank' || type === 'english-fill-blank') {
      if (filledBlanks.length !== blankCount) return;`
);

// 4. isCheckDisabled
code = code.replace(
  `  const isCheckDisabled =
    type === 'fill-blank' ? filledBlanks.length < blankCount : !selectedOptionId;`,
  `  const isCheckDisabled =
    (type === 'fill-blank' || type === 'english-fill-blank') ? filledBlanks.length < blankCount : !selectedOptionId;`
);

// 5. handleRemoveBlank scroll effect
code = code.replace(
  `    if (type !== 'fill-blank') return;`,
  `    if (type !== 'fill-blank' && type !== 'english-fill-blank') return;`
);

// 6. getStrategyTip
code = code.replace(
  `    if (type === 'fill-blank') {`,
  `    if (type === 'english-fill-blank') {
      return {
        strategy: 'Contextual Meaning',
        badgeColor: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/80',
        text: 'Look at the Arabic text and try to recall the general meaning. Look for familiar root words to connect to the English blanks.'
      };
    }
    if (type === 'fill-blank') {`
);

// 7. type title
code = code.replace(
  `              {type === 'fill-blank' && 'Fill in the Missing Word'}`,
  `              {type === 'fill-blank' && 'Fill in the Missing Word'}
              {type === 'english-fill-blank' && 'English Translation Recall'}`
);

fs.writeFileSync('src/components/ExerciseCard.tsx', code);
