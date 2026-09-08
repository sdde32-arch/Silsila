const fs = require('fs');
const content = fs.readFileSync('src/services/quranAudioEngine.ts', 'utf8');
const search = `  // Try matching against SURAH_CONTENT_DB for exact words
  const surahContent = SURAH_CONTENT_DB[surahNumber];
  const ayahDb = surahContent?.ayahs.find((a) => a.number === ayahNumber);`;
const replacement = `  // Try matching against cache/bundled for exact words
  let ayahDb = null;
  
  // 1. Check in-memory/local storage cache first (which includes live-fetched words)
  try {
    const localSaved = typeof window !== 'undefined' ? localStorage.getItem(\`quran_surah_\${surahNumber}_v5\`) : null;
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (parsed && parsed.ayahs) {
        ayahDb = parsed.ayahs.find((a: any) => a.number === ayahNumber);
      }
    }
  } catch (e) {}

  // 2. Fallback to bundled DB
  if (!ayahDb) {
    const surahContent = SURAH_CONTENT_DB[surahNumber];
    ayahDb = surahContent?.ayahs.find((a) => a.number === ayahNumber);
  }`;
fs.writeFileSync('src/services/quranAudioEngine.ts', content.replace(search, replacement));
console.log('patched quranAudioEngine.ts');
