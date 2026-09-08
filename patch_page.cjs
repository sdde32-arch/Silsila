const fs = require('fs');
const content = fs.readFileSync('src/components/memorization/MemorizationLessonPage.tsx', 'utf8');

const search = `  // Word-by-word data
  const [wordsData, setWordsData] = useState<WordDetailData[]>(() => {
    return getAyahWordsData(
      activeSurahNumber,
      activeAyahNumber,
      lessonData.ayah.arabic,
      lessonData.ayah.translation
    );
  });`;

const replacement = `  // Word-by-word data
  const [wordsData, setWordsData] = useState<WordDetailData[]>(() => {
    // If the ayah already has precise words from Quran.com, use them
    if (lessonData.ayah.words && lessonData.ayah.words.length > 0) {
      return lessonData.ayah.words.map((w: any, idx: number) => {
        // Fallback to dynamic if translation is missing
        const translation = w.translation || '';
        return {
          id: w.id || idx + 1,
          wordNumber: idx + 1,
          surahNumber: activeSurahNumber,
          ayahNumber: activeAyahNumber,
          arabic: w.arabic,
          transliteration: w.transliteration || \`Word \${idx + 1}\`,
          translation: translation,
          audioUrl: \`https://everyayah.com/data/translations/wbw/arabic/\${String(activeSurahNumber).padStart(3, '0')}_\${String(activeAyahNumber).padStart(3, '0')}_\${String(idx + 1).padStart(3, '0')}.mp3\`,
          audioUrls: [\`https://everyayah.com/data/translations/wbw/arabic/\${String(activeSurahNumber).padStart(3, '0')}_\${String(activeAyahNumber).padStart(3, '0')}_\${String(idx + 1).padStart(3, '0')}.mp3\`],
          rootLetters: w.root || '',
          grammarType: w.grammar || 'noun',
          lettersBreakdown: [],
        };
      });
    }
    
    // Otherwise fallback to generation
    return getAyahWordsData(
      activeSurahNumber,
      activeAyahNumber,
      lessonData.ayah.arabic,
      lessonData.ayah.translation
    );
  });`;

fs.writeFileSync('src/components/memorization/MemorizationLessonPage.tsx', content.replace(search, replacement));
console.log('patched MemorizationLessonPage.tsx');
