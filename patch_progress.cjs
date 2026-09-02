const fs = require('fs');
let code = fs.readFileSync('src/components/progress/ProgressView.tsx', 'utf8');

// Update state default
code = code.replace(
  "const [hifzViewMode, setHifzViewMode] = useState<'stepping-stones' | 'landmark-road' | 'matrix'>('stepping-stones');",
  "const [hifzViewMode, setHifzViewMode] = useState<'landmark-road' | 'matrix'>('landmark-road');"
);

// Remove stepping stones button
code = code.replace(
  `              <button
                type="button"
                onClick={() => setHifzViewMode('stepping-stones')}
                className={\`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer \${
                  hifzViewMode === 'stepping-stones'
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }\`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Stepping Stones</span>
              </button>`,
  ""
);

// Remove stepping stones view component
code = code.replace(
  `          {/* Stepping Stones Mode */}
          {hifzViewMode === 'stepping-stones' && (
            <div className="w-full">
              <MemorizationJourney
                onStartLesson={onStartLesson}
                onExploreSurah={onExploreSurah || (() => {})}
                onOpenSurahTest={onOpenSurahTest}
                onNavigateToReview={onStartReviewSession}
                onOpenPlanModal={onOpenPlanModal}
              />
            </div>
          )}`,
  ""
);

fs.writeFileSync('src/components/progress/ProgressView.tsx', code);
