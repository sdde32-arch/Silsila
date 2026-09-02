const fs = require('fs');
let code = fs.readFileSync('src/services/quranDataService.ts', 'utf8');

const stripFn = `export function removeBismillahFromTranslation(surahNumber: number, ayahNumber: number, text: string): string {
  if (surahNumber === 1 || surahNumber === 9 || ayahNumber !== 1 || !text) return text;
  return text.replace(/^[\\s]*(?:in\\s+the\\s+name\\s+of\\s+allah[,\\s]+the\\s+entirely\\s+merciful[,\\s]+the\\s+especially\\s+merciful[.\\s]*[-–—:]*)\\s*/i, '').trim();
}

export function stripHtmlTags(text: string): string {
  if (!text) return text;
  return text.replace(/<[^>]*>?/gm, '').trim();
}
`;

code = code.replace(/export function removeBismillahFromTranslation[\s\S]*?\}\n/, stripFn);

const cleanTranslationTarget = `          let transText = englishTranslationObj ? englishTranslationObj.text : '';
          let translitText = transliterationObj ? transliterationObj.text : '';

          transText = stripHtmlTags(transText);`;

code = code.replace(`          let transText = englishTranslationObj ? englishTranslationObj.text : '';\n          let translitText = transliterationObj ? transliterationObj.text : '';`, cleanTranslationTarget);

const cleanWordTarget = `              id: widx + 1,
              arabic: w.text_uthmani || w.text || '',
              transliteration: w.transliteration?.text || '',
              translation: stripHtmlTags(w.translation?.text || ''),`;

code = code.replace(/id: widx \+ 1,\s*arabic: w\.text_uthmani \|\| w\.text \|\| '',\s*transliteration: w\.transliteration\?\.text \|\| '',\s*translation: w\.translation\?\.text \|\| '',/, cleanWordTarget);

fs.writeFileSync('src/services/quranDataService.ts', code);
