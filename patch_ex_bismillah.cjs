const fs = require('fs');
let code = fs.readFileSync('src/components/ExerciseCard.tsx', 'utf8');

const target = `        <ExerciseAyahAudioPlayer`;

const replacement = `        {/* Optional Bismillah for Verse 1 (if not Fatiha/Tawbah) */}
        {ayahNumber === 1 && surahNumber && surahNumber !== 1 && surahNumber !== 9 && (
          <div className="text-center py-3 px-3 mb-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
             <InteractiveTajweedAyah
                arabicText="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
                fontFamily={fontFamily}
                fontSizePx={24}
                highlightCategory={activeCategoryFilter}
                showTajweedIndicators={showTajweedLetters}
                onLetterTap={(segment) => setSelectedTajweedSegment(segment)}
              />
          </div>
        )}
        
        {/* Native Audio Player Widget for Target Ayah */}
        <ExerciseAyahAudioPlayer`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/ExerciseCard.tsx', code);
