const fs = require('fs');
let code = fs.readFileSync('src/components/ExerciseCard.tsx', 'utf8');

code = code.replace(
  /'border-slate-300 bg-white text-slate-900 shadow-xs hover:border-slate-400'/g,
  "'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs hover:border-slate-400 dark:hover:border-slate-500'"
);

code = code.replace(
  'rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600',
  'rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400'
);

code = code.replace(
  "'bg-white text-slate-700 hover:bg-amber-100/70 border border-amber-200/80'",
  "'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800/80'"
);

code = code.replace(
  "`bg-white hover:${rule.colorScheme.badgeBg} text-slate-800 border-slate-200`",
  "`bg-white dark:bg-slate-800 hover:${rule.colorScheme.badgeBg} text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700`"
);

code = code.replace(
  "'bg-white border border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50'",
  "'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'"
);

fs.writeFileSync('src/components/ExerciseCard.tsx', code);
