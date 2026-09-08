const fs = require('fs');
const content = fs.readFileSync('src/components/memorization/MemorizationLessonPage.tsx', 'utf8');

// Replace line 333 area
const search1 = `        setWordsData(getAyahWordsData(activeSurahNumber, activeAyahNumber, exactAyah.arabic, exactAyah.translation));`;
const replacement1 = `        // Set words using precise API words if available
        if (exactAyah.words && exactAyah.words.length > 0) {
          setWordsData(exactAyah.words.map((w: any, idx: number) => ({
            id: w.id || idx + 1,
            wordNumber: idx + 1,
            surahNumber: activeSurahNumber,
            ayahNumber: activeAyahNumber,
            arabic: w.arabic,
            transliteration: w.transliteration || \`Word \${idx + 1}\`,
            translation: w.translation || '',
            audioUrl: \`https://everyayah.com/data/translations/wbw/arabic/\${String(activeSurahNumber).padStart(3, '0')}_\${String(activeAyahNumber).padStart(3, '0')}_\${String(idx + 1).padStart(3, '0')}.mp3\`,
            audioUrls: [\`https://everyayah.com/data/translations/wbw/arabic/\${String(activeSurahNumber).padStart(3, '0')}_\${String(activeAyahNumber).padStart(3, '0')}_\${String(idx + 1).padStart(3, '0')}.mp3\`],
            rootLetters: w.root || '',
            grammarType: w.grammar || 'noun',
            lettersBreakdown: [],
          })));
        } else {
          setWordsData(getAyahWordsData(activeSurahNumber, activeAyahNumber, exactAyah.arabic, exactAyah.translation));
        }`;

// Replace line 406 area
const search2 = `    setWordsData(getAyahWordsData(sNum, aNum, newLesson.ayah.arabic, newLesson.ayah.translation));`;
const replacement2 = `    if (newLesson.ayah.words && newLesson.ayah.words.length > 0) {
      setWordsData(newLesson.ayah.words.map((w: any, idx: number) => ({
        id: w.id || idx + 1,
        wordNumber: idx + 1,
        surahNumber: sNum,
        ayahNumber: aNum,
        arabic: w.arabic,
        transliteration: w.transliteration || \`Word \${idx + 1}\`,
        translation: w.translation || '',
        audioUrl: \`https://everyayah.com/data/translations/wbw/arabic/\${String(sNum).padStart(3, '0')}_\${String(aNum).padStart(3, '0')}_\${String(idx + 1).padStart(3, '0')}.mp3\`,
        audioUrls: [\`https://everyayah.com/data/translations/wbw/arabic/\${String(sNum).padStart(3, '0')}_\${String(aNum).padStart(3, '0')}_\${String(idx + 1).padStart(3, '0')}.mp3\`],
        rootLetters: w.root || '',
        grammarType: w.grammar || 'noun',
        lettersBreakdown: [],
      })));
    } else {
      setWordsData(getAyahWordsData(sNum, aNum, newLesson.ayah.arabic, newLesson.ayah.translation));
    }`;

let newContent = content.replace(search1, replacement1);
newContent = newContent.replace(search2, replacement2);
fs.writeFileSync('src/components/memorization/MemorizationLessonPage.tsx', newContent);
console.log('patched MemorizationLessonPage.tsx additional setWordsData');
