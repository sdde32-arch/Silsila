const fs = require('fs');
let code = fs.readFileSync('src/services/quranDataService.ts', 'utf-8');

const target = `  // 4. Fetch full 114 Surah data live from AlQuran Cloud API
  try {
    const meta = ALL_114_SURAHS.find((s) => s.number === surahNumber) || {
      number: surahNumber,
      name: \`Surah \${surahNumber}\`,
      transliteration: \`Surah \${surahNumber}\`,
      arabicName: \`سورة \${surahNumber}\`,
      translation: \`Chapter \${surahNumber}\`,
      totalAyahs: 10,
      revelationType: 'Meccan' as const,
      juzNumber: 1,
      pageNumber: 1,
    };

    const res = await fetch(
      \`https://api.alquran.cloud/v1/surah/\${surahNumber}/editions/quran-uthmani,en.sahih,en.transliteration\`
    );

    if (res.ok) {
      const json = await res.json();
      if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 3) {
        const arabicData = json.data[0].ayahs;
        const translationData = json.data[1].ayahs;
        const transliterationData = json.data[2].ayahs;

        const ayahs: AyahDetail[] = arabicData.map((a: any, idx: number) => {
          const ayahNum = a.numberInSurah;
          let arabicText = a.text;
          let transText = translationData[idx]?.text || '';
          let translitText = transliterationData[idx]?.text || '';

          // Clean Bismillah from Verse 1 for all Surahs other than Al-Fatiha (Surah 1) and At-Tawbah (Surah 9)
          if (ayahNum === 1 && surahNumber !== 1 && surahNumber !== 9) {
            arabicText = removeBismillahFromAyah(surahNumber, ayahNum, arabicText);
            translitText = removeBismillahFromTransliteration(surahNumber, ayahNum, translitText);
            transText = removeBismillahFromTranslation(surahNumber, ayahNum, transText);
          }

          // Split arabic text into words for interactive word masking
          const arabicWords = arabicText.split(' ').filter(Boolean);
          const words = arabicWords.map((w: string, widx: number) => ({
            id: widx + 1,
            arabic: w,
            transliteration: '',
            translation: '',
          }));

          return {
            number: ayahNum,
            arabic: arabicText,
            transliteration: translitText,
            translation: transText,
            words,
            audioUrl: getAyahAudioUrl(surahNumber, ayahNum, reciterSubfolder),
            isMemorized: false,
          };
        });`;

const replacement = `  // 4. Fetch full 114 Surah data live from Quran.com API (Context-aware word translations)
  try {
    const meta = ALL_114_SURAHS.find((s) => s.number === surahNumber) || {
      number: surahNumber,
      name: \`Surah \${surahNumber}\`,
      transliteration: \`Surah \${surahNumber}\`,
      arabicName: \`سورة \${surahNumber}\`,
      translation: \`Chapter \${surahNumber}\`,
      totalAyahs: 10,
      revelationType: 'Meccan' as const,
      juzNumber: 1,
      pageNumber: 1,
    };

    const res = await fetch(
      \`https://api.quran.com/api/v4/verses/by_chapter/\${surahNumber}?words=true&translations=20,57&fields=text_uthmani&word_fields=text_uthmani,translation,transliteration&per_page=300\`
    );

    if (res.ok) {
      const json = await res.json();
      if (json.verses && Array.isArray(json.verses)) {
        const ayahs: AyahDetail[] = json.verses.map((v: any, idx: number) => {
          const ayahNum = v.verse_number;
          let arabicText = v.text_uthmani || '';
          
          // Translations: 20 is Sahih International (English), 57 is Transliteration
          const englishTranslationObj = v.translations?.find((t: any) => t.resource_id === 20);
          const transliterationObj = v.translations?.find((t: any) => t.resource_id === 57);
          
          let transText = englishTranslationObj ? englishTranslationObj.text : '';
          let translitText = transliterationObj ? transliterationObj.text : '';

          // Clean Bismillah from Verse 1 for all Surahs other than Al-Fatiha (Surah 1) and At-Tawbah (Surah 9)
          if (ayahNum === 1 && surahNumber !== 1 && surahNumber !== 9) {
            arabicText = removeBismillahFromAyah(surahNumber, ayahNum, arabicText);
            translitText = removeBismillahFromTransliteration(surahNumber, ayahNum, translitText);
            transText = removeBismillahFromTranslation(surahNumber, ayahNum, transText);
          }

          // Word-by-word data from Quran.com API
          const words = (v.words || [])
            .filter((w: any) => w.char_type_name === 'word')
            .map((w: any, widx: number) => ({
              id: widx + 1,
              arabic: w.text_uthmani || w.text || '',
              transliteration: w.transliteration?.text || '',
              translation: w.translation?.text || '',
            }));

          // Remove Bismillah from words array for first Ayah of each non-Fatiha/Tawbah Surah
          if (ayahNum === 1 && surahNumber !== 1 && surahNumber !== 9 && words.length > 4) {
            const firstWord = words[0].arabic;
            if (firstWord && (firstWord.includes('بِسْمِ') || firstWord.includes('بِسمِ') || firstWord.includes('بسم'))) {
              words.splice(0, 4);
              words.forEach((w: any, wIdx: number) => { w.id = wIdx + 1; });
            }
          }

          return {
            number: ayahNum,
            arabic: arabicText,
            transliteration: translitText,
            translation: transText,
            words,
            audioUrl: getAyahAudioUrl(surahNumber, ayahNum, reciterSubfolder),
            isMemorized: false,
          };
        });`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/services/quranDataService.ts', code);
  console.log('Successfully replaced');
} else {
  console.log('Target not found');
}
