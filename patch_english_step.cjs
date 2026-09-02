const fs = require('fs');
let code = fs.readFileSync('src/components/memorization/MemorizationLessonPage.tsx', 'utf8');

const englishStepUI = `
            {/* STEP 3: ENGLISH TRANSLATION MEMORIZATION */}
            {currentStep.stepType === 'english-translation' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                  <div className="text-center space-y-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-900 font-extrabold text-xs inline-flex shadow-2xs">
                      Meaning & Translation
                    </span>
                    <p className="font-quran text-slate-900 leading-[2.2] text-center dark:text-slate-100" dir="rtl" style={{ fontSize: \`\${arabicFontSizePx}px\` }}>
                      {lessonData.ayah.arabic}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center relative space-y-4">
                     <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                       "{lessonData.ayah.translation}"
                     </p>
                     
                     <button
                        onClick={() => {
                          if ('speechSynthesis' in window) {
                             const utterance = new SpeechSynthesisUtterance(lessonData.ayah.translation);
                             utterance.lang = 'en-US';
                             utterance.rate = 0.9;
                             window.speechSynthesis.cancel();
                             window.speechSynthesis.speak(utterance);
                          }
                        }}
                        className="mx-auto w-10 h-10 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                        title="Listen to English Translation"
                     >
                        <Volume2 className="w-5 h-5" />
                     </button>
                  </div>
                  
                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-500 font-medium">Read the translation and tap the audio button to hear it. Memorize the core meaning before proceeding.</p>
                  </div>
                </div>
              </div>
            )}
`;

code = code.replace(
  /(\s*)({\/\* STEP 3: FILL IN THE BLANK \/ ACTIVE RECALL \*\/|\{currentStep.stepType === 'active-recall' && \()/g,
  match => englishStepUI + match
);

fs.writeFileSync('src/components/memorization/MemorizationLessonPage.tsx', code);
