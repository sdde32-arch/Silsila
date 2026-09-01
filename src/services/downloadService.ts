import { SURAH_CONTENT_DB } from '../data/quranVerses';
import { ALL_114_SURAHS } from '../data/quranMetadata';
import { getAyahTafsir } from './quranDataService';

export async function downloadSurahOfflineNotes(surahNumber: number) {
  const surahMeta = ALL_114_SURAHS.find((s) => s.number === surahNumber);
  if (!surahMeta) return;

  const content = SURAH_CONTENT_DB[surahNumber];
  if (!content) return;

  let textContent = `# Surah ${surahMeta.name} (${surahMeta.arabicName}) - Offline Hifz & Tafsir Notes\n`;
  textContent += `Total Ayahs: ${surahMeta.totalAyahs} | Revelation: ${surahMeta.revelationType}\n\n`;
  textContent += `==========================================================\n\n`;

  for (const ayah of content.ayahs) {
    textContent += `## Ayah ${ayah.number}\n\n`;
    textContent += `### Arabic\n${ayah.arabic}\n\n`;
    if (ayah.transliteration) {
      textContent += `### Transliteration\n${ayah.transliteration}\n\n`;
    }
    textContent += `### Translation\n${ayah.translation}\n\n`;

    try {
      const tafsir = await getAyahTafsir(surahNumber, ayah.number, surahMeta.name, ayah.arabic, ayah.translation);

      textContent += `### Tafsir (Exegesis)\n${tafsir.tafsirText}\n\n`;
      if (tafsir.thematicLesson) {
        textContent += `**Thematic Lesson:** ${tafsir.thematicLesson}\n\n`;
      }
      
      

      textContent += `---\n\n`;
    } catch (err) {
      console.error('Error fetching ayah data for download', err);
    }
  }

  const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Surah_${surahMeta.name}_Hifz_Notes.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAyahOfflineNotes(surahNumber: number, ayahNumber: number) {
  const surahMeta = ALL_114_SURAHS.find((s) => s.number === surahNumber);
  if (!surahMeta) return;

  const content = SURAH_CONTENT_DB[surahNumber];
  if (!content) return;

  const ayah = content.ayahs.find(a => a.number === ayahNumber);
  if (!ayah) return;

  let textContent = `# Surah ${surahMeta.name} (${surahMeta.arabicName}) - Ayah ${ayah.number} Notes\n\n`;

  textContent += `### Arabic\n${ayah.arabic}\n\n`;
  if (ayah.transliteration) {
    textContent += `### Transliteration\n${ayah.transliteration}\n\n`;
  }
  textContent += `### Translation\n${ayah.translation}\n\n`;

  try {
    const tafsir = await getAyahTafsir(surahNumber, ayah.number, surahMeta.name, ayah.arabic, ayah.translation);

    textContent += `### Tafsir (Exegesis)\n${tafsir.tafsirText}\n\n`;
    if (tafsir.thematicLesson) {
      textContent += `**Thematic Lesson:** ${tafsir.thematicLesson}\n\n`;
    }
    
    
  } catch (err) {
    console.error('Error fetching ayah data for download', err);
  }

  const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Surah_${surahMeta.name}_Ayah_${ayah.number}_Notes.md`;
  a.click();
  URL.revokeObjectURL(url);
}
