const fs = require('fs');
let code = fs.readFileSync('src/components/ExerciseCard.tsx', 'utf8');

const englishBlankAyahFunc = `
  const renderEnglishBlankAyah = () => {
    const parts = (ayahWithBlanks || '').split('___');

    return (
      <div
        id="exercise-ayah-text-container-english"
        ref={ayahContainerRef}
        className="font-sans text-base sm:text-lg text-slate-800 font-bold leading-relaxed text-center my-4 select-none max-h-[300px] sm:max-h-[360px] overflow-y-auto overflow-x-hidden scroll-smooth px-3 py-4 rounded-2xl border border-slate-200/70 bg-[#FCFBF7]/90 shadow-inner custom-scrollbar"
        tabIndex={0}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
          {parts.map((part, i) => {
            const isTargetBlank = i < parts.length - 1;
            const isFilled = Boolean(filledBlanks[i]);
            const isCurrentlyActive = isTargetBlank && i === activeBlankIndex && !isFilled;

            return (
              <React.Fragment key={i}>
                <span className="inline-flex items-center text-slate-700">{part}</span>
                {isTargetBlank && (
                  <button
                    id={\`exercise-blank-slot-\${i}\`}
                    ref={(el) => {
                      blankRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => handleRemoveBlank(i)}
                    className={\`inline-flex items-center justify-center min-w-[80px] h-10 min-h-[40px] px-3 align-middle rounded-xl border-2 transition-all font-sans text-sm font-bold active:scale-95 \${
                      isFilled
                        ? status === 'correct'
                          ? 'border-[#10B981] bg-[#ECFDF5] text-[#059669] shadow-xs'
                          : status === 'incorrect'
                          ? 'border-[#EF4444] bg-[#FEF2F2] text-[#B91C1C] shadow-xs'
                          : 'border-slate-300 bg-white text-slate-900 shadow-xs hover:border-slate-400'
                        : isCurrentlyActive
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-500/20 scale-[1.02]'
                        : 'border-slate-200 bg-slate-50 text-slate-400 border-dashed hover:border-slate-300'
                    }\`}
                  >
                    {isFilled ? filledBlanks[i] : '___'}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };
`;

code = code.replace(
  `  const renderBlankAyah = () => {`,
  englishBlankAyahFunc + `\n  const renderBlankAyah = () => {`
);

const renderFillBlankSection = `
        {type === 'english-fill-blank' && (
          <div className="space-y-4">
            {promptText && (
              <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-slate-100 text-center">
                <InteractiveTajweedAyah
                  arabicText={promptText}
                  fontFamily={fontFamily}
                  fontSizePx={28}
                  highlightCategory={activeCategoryFilter}
                  showTajweedIndicators={showTajweedLetters}
                  onLetterTap={(segment) => setSelectedTajweedSegment(segment)}
                />
              </div>
            )}

            {renderEnglishBlankAyah()}

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Word Bank (Tap word to insert)
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {availableWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectWord(word, index)}
                    className="min-h-[44px] h-11 px-5 rounded-xl bg-[#FAF9F5] hover:bg-slate-100 border border-slate-300 font-sans text-sm font-extrabold text-slate-800 transition-all shadow-2xs hover:scale-105 active:scale-95"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'fill-blank' && (`;

code = code.replace(
  `        {type === 'fill-blank' && (`,
  renderFillBlankSection
);

code = code.replace(
  `        {type !== 'fill-blank' && (`,
  `        {type !== 'fill-blank' && type !== 'english-fill-blank' && (`
);

fs.writeFileSync('src/components/ExerciseCard.tsx', code);
