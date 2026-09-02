const fs = require('fs');
let code = fs.readFileSync('src/components/ExerciseCard.tsx', 'utf8');

const targetBtn = `          {/* Tajweed Letters Highlight Toggle Button */}
          <button
            type="button"
            onClick={() => setShowTajweedLetters(!showTajweedLetters)}
            className={\`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 text-xs font-bold shrink-0 \${
              showTajweedLetters
                ? 'bg-amber-100/90 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }\`}
            title={showTajweedLetters ? 'Tajweed Letter Highlighting: ON (Tap to toggle)' : 'Tajweed Letter Highlighting: OFF'}
            aria-label="Toggle Tajweed letter highlights"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Tajweed</span>
            <span className="sm:hidden">Taj</span>
            <div className={\`w-2 h-2 rounded-full ml-0.5 \${showTajweedLetters ? 'bg-amber-500' : 'bg-slate-400'}\`} />
          </button>`;

code = code.replace(targetBtn, '');
fs.writeFileSync('src/components/ExerciseCard.tsx', code);
