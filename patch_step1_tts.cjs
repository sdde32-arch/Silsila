const fs = require('fs');
let code = fs.readFileSync('src/components/memorization/MemorizationLessonPage.tsx', 'utf8');

const target = `                  <p className="text-[11px] sm:text-xs text-slate-700 italic font-medium text-center">
                    "{lessonData.ayah.translation}"
                  </p>`;

const replacement = `                  <div className="relative text-center">
                    <p className="text-[11px] sm:text-xs text-slate-700 italic font-medium">
                      "{lessonData.ayah.translation}"
                    </p>
                    <button
                      onClick={() => {
                        if ('speechSynthesis' in window) {
                           const utterance = new SpeechSynthesisUtterance(lessonData.ayah.translation);
                           utterance.lang = 'en-US';
                           window.speechSynthesis.cancel();
                           window.speechSynthesis.speak(utterance);
                        }
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                      title="Read Translation Aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/memorization/MemorizationLessonPage.tsx', code);
