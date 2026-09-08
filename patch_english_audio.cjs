const fs = require('fs');
const content = fs.readFileSync('src/components/memorization/MemorizationLessonPage.tsx', 'utf8');

const regex = /<button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?if \('speechSynthesis' in window\) \{[\s\S]*?const utterance = new SpeechSynthesisUtterance\(lessonData\.ayah\.translation\);[\s\S]*?utterance\.lang = 'en-US';[\s\S]*?window\.speechSynthesis\.cancel\(\);[\s\S]*?window\.speechSynthesis\.speak\(utterance\);[\s\S]*?\}[\s\S]*?\}\}[\s\S]*?className="p-1\.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"[\s\S]*?title="Play English Translation"[\s\S]*?>[\s\S]*?<Volume2 className="w-3\.5 h-3\.5" \/>[\s\S]*?<\/button>/;

const replacement = `<button
                      onClick={() => {
                        playEnglishTranslationAudio(activeSurahNumber, activeAyahNumber, lessonData.ayah.translation);
                      }}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                      title="Play English Translation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>`;

if (regex.test(content)) {
  fs.writeFileSync('src/components/memorization/MemorizationLessonPage.tsx', content.replace(regex, replacement));
  console.log('patched MemorizationLessonPage.tsx english audio with regex');
} else {
  console.log('Could not find search string with regex, please check');
}
