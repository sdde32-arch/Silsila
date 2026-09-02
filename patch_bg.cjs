const fs = require('fs');
let code = fs.readFileSync('src/components/SurahExplorerView.tsx', 'utf8');

// Fix 1217 Bismillah Background
code = code.replace(
  'rounded-3xl bg-white border border-slate-300 shadow-2xs"',
  'rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs"'
);

// Fix 1245/1246 Ayah Cards Background
code = code.replace(
  `? 'bg-white text-slate-950 border-2 border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                        : 'bg-white text-slate-950 border border-slate-300 shadow-2xs hover:border-slate-400'`,
  `? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 border-2 border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                        : 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-2xs hover:border-slate-400 dark:hover:border-slate-500'`
);

// Fix 1480 Mushaf Container
code = code.replace(
  'rounded-2xl bg-white border border-slate-300 shadow-2xs space-y-3"',
  'rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs space-y-3"'
);

// Fix 1482 Mushaf Header Ribbon
code = code.replace(
  'rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5 shadow-2xs"',
  'rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-0.5 shadow-2xs"'
);

// Fix 1493 Mushaf Bismillah
code = code.replace(
  'rounded-xl bg-slate-50 border border-slate-200 shadow-2xs"',
  'rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs"'
);

// Fix 1501 Classical Flowing Ayahs container
code = code.replace(
  'rounded-xl bg-slate-50/70 border border-slate-200 shadow-2xs text-justify space-y-2"',
  'rounded-xl bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-2xs text-justify space-y-2"'
);

// Let's also wrap the Bismillah text in Tajweed if Tajweed is on!
code = code.replace(
  `<p className="font-quran text-3xl sm:text-4xl font-bold text-black leading-loose overflow-visible dark:text-slate-100" dir="rtl">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                  </p>`,
  `<p className="font-quran text-3xl sm:text-4xl font-bold text-black leading-loose overflow-visible dark:text-slate-100" dir="rtl" style={{ color: '#000000' }}>
                    {displaySettings.showWordHints ? 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' : annotateText('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ')}
                  </p>`
);

code = code.replace(
  `<p className="font-quran text-2xl sm:text-3xl font-bold text-black leading-[2.2] overflow-visible dark:text-slate-100" dir="rtl">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </p>`,
  `<p className="font-quran text-2xl sm:text-3xl font-bold text-black leading-[2.2] overflow-visible dark:text-slate-100" dir="rtl" style={{ color: '#000000' }}>
                      {displaySettings.showWordHints ? 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' : annotateText('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ')}
                    </p>`
);

fs.writeFileSync('src/components/SurahExplorerView.tsx', code);
