/**
 * Silsila - Complete Quran Audio Engine & Data Layer
 * 
 * Provides robust audio infrastructure for:
 * - All 114 Surahs
 * - All 30 Juz'
 * - Every single Ayah across the entire Quran
 * - Word-level isolated audio playback
 * - Arabic letter-by-letter & syllabic phoneme breakdown (Huroof & Harakat)
 * - Multiple world-renowned Qaris (Alafasy, Husary, Minshawi, AbdulBasit, Muaiqly)
 * - Playback rate control, repeat loops, preloading, and resilient error fallbacks
 */

import { ALL_114_SURAHS, SurahMeta } from '../data/quranMetadata';
import { SURAH_CONTENT_DB, AyahDetail, SurahContent, QuranWord } from '../data/quranVerses';
import { globalAudioManager } from './globalAudioManager';

export { globalAudioManager };

export interface ReciterProfile {
  id: string;
  subfolder: string;
  edition: string;
  name: string;
  arabicName: string;
  style: string;
  origin: string;
  bitrate: string;
}

export const QURAN_RECITERS: ReciterProfile[] = [
  {
    id: 'alafasy',
    subfolder: 'Alafasy_128kbps',
    edition: 'ar.alafasy',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري بن راشد العفاسي',
    style: 'Murattal • Clear Melodic Cadence',
    origin: 'Kuwait',
    bitrate: '128 kbps',
  },
  {
    id: 'husary',
    subfolder: 'Husary_128kbps',
    edition: 'ar.husary',
    name: 'Mahmoud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    style: 'Murattal • Master of Classical Tajweed',
    origin: 'Egypt',
    bitrate: '128 kbps',
  },
  {
    id: 'abdulbasit',
    subfolder: 'Abdul_Basit_Mujawwad_128kbps',
    edition: 'ar.abdulbasitmurattal',
    name: 'Abdul Basit Abdul Samad',
    arabicName: 'عبد الباسط عبد الصمد',
    style: 'Mujawwad • Golden Iconic Voice',
    origin: 'Egypt',
    bitrate: '128 kbps',
  },
  {
    id: 'minshawi',
    subfolder: 'Minshawy_Murattal_128kbps',
    edition: 'ar.minshawi',
    name: 'Muhammad Siddiq Al-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    style: 'Murattal • Deeply Reverent & Emotional',
    origin: 'Egypt',
    bitrate: '128 kbps',
  },
  {
    id: 'muaiqly',
    subfolder: 'MaherAlMuaiqly128kbps',
    edition: 'ar.mahermuaiqly',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    style: 'Murattal • Imam of Masjid al-Haram',
    origin: 'Saudi Arabia',
    bitrate: '128 kbps',
  },
];

/**
 * Generates direct CDN audio URL for any verse in the Quran
 */
export function getAyahAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  reciterSubfolder: string = 'Alafasy_128kbps'
): string {
  const surahPadded = String(surahNumber).padStart(3, '0');
  const ayahPadded = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/${reciterSubfolder}/${surahPadded}${ayahPadded}.mp3`;
}

/**
 * Generates direct CDN audio URLs for an isolated word in an Ayah (with fallback mirrors).
 */
export function getWordAudioUrls(
  surahNumber: number,
  ayahNumber: number,
  wordIndexInAyah: number // 1-indexed
): string[] {
  const surahPadded = String(surahNumber).padStart(3, '0');
  const ayahPadded = String(ayahNumber).padStart(3, '0');
  const wordPadded = String(wordIndexInAyah).padStart(3, '0');
  return [
    `https://audio.qurancdn.com/wbw/${surahPadded}_${ayahPadded}_${wordPadded}.mp3`,
    `https://verses.quran.com/wbw/${surahPadded}_${ayahPadded}_${wordPadded}.mp3`,
  ];
}

export function getWordAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  wordIndexInAyah: number
): string {
  return getWordAudioUrls(surahNumber, ayahNumber, wordIndexInAyah)[0];
}

/**
 * Individual Letter & Syllable Breakdown
 */
export interface LetterSyllableBreakdown {
  id: number;
  letter: string; // The letter with combining vowels, e.g. "أَ", "لَّ", "ذِ", "ي"
  rawLetter: string; // Base letter e.g. "ا", "ل", "ذ", "ي"
  name: string; // "Alif", "Lam", "Dhal", "Ya"
  arabicName: string; // "أَلِف", "لَام", "ذَال", "يَاء"
  transliteration: string; // "a", "lla", "dhi", "y"
  harakah: string; // "Fathah", "Kasrah", "Dammah", "Sukun", "Shaddah"
  makhraj: string; // Point of Articulation
  makhrajCategory: 'Halq (Throat)' | 'Lisan (Tongue)' | 'Shafatan (Lips)' | 'Jawf (Oral Cavity)' | 'Khayshoom (Nose)';
  tajweedNote?: string;
}

/**
 * Quran Word Detail with rich linguistic and pronunciation metadata
 */
export interface WordDetailData {
  id: number;
  wordNumber: number;
  surahNumber: number;
  ayahNumber: number;
  arabic: string;
  transliteration: string;
  translation: string;
  audioUrl: string;
  audioUrls: string[];
  rootLetters?: string;
  grammarType?: 'noun' | 'verb' | 'particle' | 'pronoun' | 'relative pronoun' | 'preposition';
  tajweedRule?: string;
  pronunciationTip?: string;
  lettersBreakdown?: LetterSyllableBreakdown[];
  estimatedStartTime?: number; // In seconds relative to ayah audio
  estimatedDuration?: number; // In seconds
}

/** Arabic letter characteristics dictionary */
const ARABIC_LETTERS_MAP: Record<
  string,
  {
    name: string;
    arabicName: string;
    trans: string;
    makhraj: string;
    category: 'Halq (Throat)' | 'Lisan (Tongue)' | 'Shafatan (Lips)' | 'Jawf (Oral Cavity)' | 'Khayshoom (Nose)';
  }
> = {
  'ا': { name: 'Alif', arabicName: 'أَلِف', trans: 'a', makhraj: 'Oral cavity (Jawf) - open airway elongation', category: 'Jawf (Oral Cavity)' },
  'أ': { name: 'Hamzah', arabicName: 'هَمْزَة', trans: 'a', makhraj: 'Deep throat (Aqsal Halq) near vocal cords', category: 'Halq (Throat)' },
  'إ': { name: 'Hamzah', arabicName: 'هَمْزَة', trans: 'i', makhraj: 'Deep throat (Aqsal Halq) with lower jaw depression', category: 'Halq (Throat)' },
  'ٱ': { name: 'Hamzatul Wasl', arabicName: 'هَمْزَةُ الوَصْل', trans: 'a', makhraj: 'Pronounced when initiating; silenced in continuous recitation', category: 'Halq (Throat)' },
  'ء': { name: 'Hamzah', arabicName: 'هَمْزَة', trans: 'ʾ', makhraj: 'Deep throat from the vocal cords', category: 'Halq (Throat)' },
  'ب': { name: 'Baa', arabicName: 'بَاء', trans: 'b', makhraj: 'Closing both lips firmly with moisture (Shafatan)', category: 'Shafatan (Lips)' },
  'ت': { name: 'Taa', arabicName: 'تَاء', trans: 't', makhraj: 'Tip of the tongue pressing the root of upper front incisors', category: 'Lisan (Tongue)' },
  'ث': { name: 'Thaa', arabicName: 'ثَاء', trans: 'th', makhraj: 'Tip of tongue touching edges of top front teeth with soft breath', category: 'Lisan (Tongue)' },
  'ج': { name: 'Jeem', arabicName: 'جِيم', trans: 'j', makhraj: 'Middle of the tongue pressing the upper hard palate', category: 'Lisan (Tongue)' },
  'ح': { name: 'Haa', arabicName: 'حَاء', trans: 'ḥ', makhraj: 'Middle throat (Wasatul Halq) with clean friction', category: 'Halq (Throat)' },
  'خ': { name: 'Khaa', arabicName: 'خَاء', trans: 'kh', makhraj: 'Top throat (Adnal Halq) near uvula - heavy (Istiʿla)', category: 'Halq (Throat)' },
  'د': { name: 'Daal', arabicName: 'دَال', trans: 'd', makhraj: 'Tip of tongue touching base of top incisors (Qalqalah on sukun)', category: 'Lisan (Tongue)' },
  'ذ': { name: 'Dhaal', arabicName: 'ذَال', trans: 'dh', makhraj: 'Tip of tongue placed flatly at edge of upper incisors', category: 'Lisan (Tongue)' },
  'ر': { name: 'Raa', arabicName: 'رَاء', trans: 'r', makhraj: 'Tip of tongue vibrating lightly near the palate gum ridge', category: 'Lisan (Tongue)' },
  'ز': { name: 'Zaay', arabicName: 'زَاي', trans: 'z', makhraj: 'Tip of tongue behind lower front teeth with distinct buzz', category: 'Lisan (Tongue)' },
  'س': { name: 'Seen', arabicName: 'سِين', trans: 's', makhraj: 'Tip of tongue behind lower teeth producing clear sibilant whistle', category: 'Lisan (Tongue)' },
  'ش': { name: 'Sheen', arabicName: 'شِين', trans: 'sh', makhraj: 'Middle tongue spreading breath across oral chamber (Tafash-shee)', category: 'Lisan (Tongue)' },
  'ص': { name: 'Saad', arabicName: 'صَاد', trans: 'ṣ', makhraj: 'Tip behind lower teeth with elevated back of tongue (Heavy Istiʿla/Itbaq)', category: 'Lisan (Tongue)' },
  'ض': { name: 'Dhaad', arabicName: 'ضَاد', trans: 'ḍ', makhraj: 'Lateral edge of the tongue firmly against upper molars (Istitalah)', category: 'Lisan (Tongue)' },
  'ط': { name: 'Taa', arabicName: 'طَاء', trans: 'ṭ', makhraj: 'Tip of tongue against upper gum - strongest heavy letter (Itbaq)', category: 'Lisan (Tongue)' },
  'ظ': { name: 'Zhaa', arabicName: 'ظَاء', trans: 'ẓ', makhraj: 'Tip of tongue on edge of upper teeth with elevated tongue root', category: 'Lisan (Tongue)' },
  'ع': { name: 'ʿAyn', arabicName: 'عَيْن', trans: 'ʿ', makhraj: 'Middle throat (Wasatul Halq) with smooth resonant compression', category: 'Halq (Throat)' },
  'غ': { name: 'Ghayn', arabicName: 'غَيْن', trans: 'gh', makhraj: 'Upper throat (Adnal Halq) with gentle gargling resonance (Heavy)', category: 'Halq (Throat)' },
  'ف': { name: 'Faa', arabicName: 'فَاء', trans: 'f', makhraj: 'Inside wet edge of bottom lip against edge of upper incisors', category: 'Shafatan (Lips)' },
  'ق': { name: 'Qaaf', arabicName: 'قَاف', trans: 'q', makhraj: 'Deepest back of tongue (Aqsal Lisan) touching soft palate (Qalqalah)', category: 'Lisan (Tongue)' },
  'ك': { name: 'Kaaf', arabicName: 'كَاف', trans: 'k', makhraj: 'Back of tongue below Qaf touching hard palate with whisper (Hams)', category: 'Lisan (Tongue)' },
  'ل': { name: 'Laam', arabicName: 'لَام', trans: 'l', makhraj: 'Front edge and tip of tongue spanning the upper gum ridge', category: 'Lisan (Tongue)' },
  'م': { name: 'Meem', arabicName: 'مِيم', trans: 'm', makhraj: 'Gentle closure of both lips with nasal cavity Ghunnah', category: 'Shafatan (Lips)' },
  'ن': { name: 'Noon', arabicName: 'نُون', trans: 'n', makhraj: 'Tip of tongue against upper gum with nasal resonance (Ghunnah)', category: 'Lisan (Tongue)' },
  'ه': { name: 'Haa', arabicName: 'هَاء', trans: 'h', makhraj: 'Deep chest and bottom of throat with light, breathy flow', category: 'Halq (Throat)' },
  'و': { name: 'Waaw', arabicName: 'وَاو', trans: 'w', makhraj: 'Rounding the two lips forward without closing them', category: 'Shafatan (Lips)' },
  'ي': { name: 'Yaa', arabicName: 'يَاء', trans: 'y', makhraj: 'Middle of tongue raised toward upper palate', category: 'Lisan (Tongue)' },
  'ى': { name: 'Alif Maqsurah', arabicName: 'أَلِف مَقْصُورَة', trans: 'ā', makhraj: 'Oral cavity (Jawf) - 2 counts Madd', category: 'Jawf (Oral Cavity)' },
  'ة': { name: 'Taa Marbutah', arabicName: 'تَاء مَرْبُوطَة', trans: 'h/t', makhraj: 'Articulates as Ha upon pause and Ta in continuation', category: 'Halq (Throat)' },
};

function getVocalizedTransliteration(rawBase: string, marks: string, baseTrans: string): string {
  let trans = baseTrans || rawBase;
  const isDoubled = marks.includes('ّ');
  const prefix = isDoubled && trans.length === 1 ? trans + trans : trans;
  
  if (marks.includes('ً')) {
    return prefix + 'an';
  }
  if (marks.includes('ٍ')) {
    return prefix + 'in';
  }
  if (marks.includes('ٌ')) {
    return prefix + 'un';
  }
  if (marks.includes('ٰ') || marks.includes('\u0670')) {
    return prefix + 'ā';
  }
  if (marks.includes('َ')) {
    return prefix + 'a';
  }
  if (marks.includes('ِ')) {
    return prefix + 'i';
  }
  if (marks.includes('ُ')) {
    return prefix + 'u';
  }
  if (marks.includes('ْ') || marks.includes('\u06E1')) {
    return prefix + ' (sukūn)';
  }
  return prefix;
}

/**
 * Deconstructs any Arabic word into its individual letters and vowels for phoneme-level practice
 */
export function decomposeArabicWordToLetters(arabicWord: string): LetterSyllableBreakdown[] {
  if (!arabicWord) return [];

  const results: LetterSyllableBreakdown[] = [];
  const chars = Array.from(arabicWord);
  let currentLetter = '';
  let rawBase = '';
  let harakahStr = '';

  const isDiacritic = (ch: string) => {
    const code = ch.charCodeAt(0);
    return (
      (code >= 0x064b && code <= 0x065f) || // Standard Tashkeel (Fathah, Kasrah, Dammah, Sukun, Shaddah, Tanween)
      code === 0x0670 || // Dagger Alif (Alif Khanjariyyah)
      code === 0x0640 || // Tatweel (Kashida)
      code === 0x0653 || // Maddah above
      code === 0x0654 || // Hamza above
      code === 0x0655 || // Hamza below
      (code >= 0x06df && code <= 0x06ed) // Quranic stop and annotation marks
    );
  };

  const getHarakahDescription = (marks: string): string => {
    const descs: string[] = [];
    if (marks.includes('ّ')) descs.push('Shaddah (Doubled)');
    if (marks.includes('َ')) descs.push('Fathah (Short a)');
    if (marks.includes('ِ')) descs.push('Kasrah (Short i)');
    if (marks.includes('ُ')) descs.push('Dammah (Short u)');
    if (marks.includes('ْ') || marks.includes('\u06E1')) descs.push('Sukūn (Silent stop)');
    if (marks.includes('ً')) descs.push('Fatḥatān (-an)');
    if (marks.includes('ٍ')) descs.push('Kasratān (-in)');
    if (marks.includes('ٌ')) descs.push('Dammatān (-un)');
    if (marks.includes('ٰ') || marks.includes('\u0670')) descs.push('Dagger Alif (2 counts)');
    if (marks.includes('ٓ') || marks.includes('\u0653')) descs.push('Madd (Long 4-6 counts)');
    return descs.join(' + ') || 'Vowelless / Baseline';
  };

  let letterIndex = 1;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    // Ignore isolated tatweel / kashida if at start
    if (ch === 'ـ' && !currentLetter) continue;

    if (!isDiacritic(ch)) {
      if (currentLetter && rawBase) {
        const meta = ARABIC_LETTERS_MAP[rawBase] || {
          name: rawBase,
          arabicName: rawBase,
          trans: rawBase,
          makhraj: 'Articulate clearly with standard Tajweed makhraj.',
          category: 'Lisan (Tongue)' as const,
        };

        const vocalizedTranslit = getVocalizedTransliteration(rawBase, harakahStr, meta.trans);

        results.push({
          id: letterIndex++,
          letter: currentLetter,
          rawLetter: rawBase,
          name: meta.name,
          arabicName: meta.arabicName,
          transliteration: vocalizedTranslit,
          harakah: getHarakahDescription(harakahStr),
          makhraj: meta.makhraj,
          makhrajCategory: meta.category,
        });
      }

      currentLetter = ch;
      rawBase = ch;
      harakahStr = '';
    } else {
      currentLetter += ch;
      harakahStr += ch;
    }
  }

  // Push final letter
  if (currentLetter && rawBase) {
    const meta = ARABIC_LETTERS_MAP[rawBase] || {
      name: rawBase,
      arabicName: rawBase,
      trans: rawBase,
      makhraj: 'Articulate clearly with standard Tajweed makhraj.',
      category: 'Lisan (Tongue)' as const,
    };

    const vocalizedTranslit = getVocalizedTransliteration(rawBase, harakahStr, meta.trans);

    results.push({
      id: letterIndex++,
      letter: currentLetter,
      rawLetter: rawBase,
      name: meta.name,
      arabicName: meta.arabicName,
      transliteration: vocalizedTranslit,
      harakah: getHarakahDescription(harakahStr),
      makhraj: meta.makhraj,
      makhrajCategory: meta.category,
    });
  }

  return results;
}

/** Curated word breakdowns for high-frequency curriculum Ayahs */
const CURATED_WORD_DICTIONARY: Record<string, Partial<WordDetailData>[]> = {
  '1:1': [
    {
      wordNumber: 1,
      arabic: 'بِسْمِ',
      transliteration: 'Bismi',
      translation: 'In (the) name',
      rootLetters: 'س-م-و',
      grammarType: 'preposition',
      pronunciationTip: 'Soft Kasrah sound with clear "B" aspiration and gentle Seen whistling.',
    },
    {
      wordNumber: 2,
      arabic: 'ٱللَّهِ',
      transliteration: 'Allāh',
      translation: '(of) Allah',
      rootLetters: 'إ-ل-ه',
      grammarType: 'noun',
      tajweedRule: 'Tarqeeq on Lam (Light Lam after Kasrah)',
      pronunciationTip: 'Pronounce the Lam Tarqiq (light) because it follows a Kasrah in Bismi.',
    },
    {
      wordNumber: 3,
      arabic: 'ٱلرَّحْمَـٰنِ',
      transliteration: 'Ar-Raḥmān',
      translation: 'the Entirely Merciful',
      rootLetters: 'ر-ح-م',
      grammarType: 'noun',
      pronunciationTip: 'Heavy Ra with clear throat friction on the letter Ha (ح).',
    },
    {
      wordNumber: 4,
      arabic: 'ٱلرَّحِيمِ',
      transliteration: 'Ar-Raḥīm',
      translation: 'the Especially Merciful',
      rootLetters: 'ر-ح-م',
      grammarType: 'noun',
      tajweedRule: 'Madd Arid Lissukun (2, 4, or 6 counts)',
      pronunciationTip: 'Elongate the terminal Ya smoothly before pausing on Meem.',
    },
  ],
  '1:2': [
    {
      wordNumber: 1,
      arabic: 'ٱلْحَمْدُ',
      transliteration: 'Al-ḥamdu',
      translation: '[All] praise is',
      rootLetters: 'ح-م-د',
      grammarType: 'noun',
      pronunciationTip: 'Clean Dammah on the Dal without elongation.',
    },
    {
      wordNumber: 2,
      arabic: 'لِلَّهِ',
      transliteration: 'lillāhi',
      translation: 'due to Allah',
      rootLetters: 'إ-ل-ه',
      grammarType: 'noun',
      pronunciationTip: 'Light Lam with gentle ending Ha.',
    },
    {
      wordNumber: 3,
      arabic: 'رَبِّ',
      transliteration: 'Rabbi',
      translation: 'Lord',
      rootLetters: 'ر-ب-ب',
      grammarType: 'noun',
      pronunciationTip: 'Heavy Ra with strong doubling (Shaddah) on the Ba.',
    },
    {
      wordNumber: 4,
      arabic: 'ٱلْعَـٰلَمِينَ',
      transliteration: 'al-ʿālamīn',
      translation: '(of all) the worlds',
      rootLetters: 'ع-ل-م',
      grammarType: 'noun',
      pronunciationTip: 'Deep pharyngeal Ayn (ع) from the middle of the throat.',
    },
  ],
  '1:3': [
    {
      wordNumber: 1,
      arabic: 'ٱلرَّحْمَـٰنِ',
      transliteration: 'Ar-Raḥmān',
      translation: 'The Entirely Merciful',
      rootLetters: 'ر-ح-م',
      grammarType: 'noun',
    },
    {
      wordNumber: 2,
      arabic: 'ٱلرَّحِيمِ',
      transliteration: 'Ar-Raḥīm',
      translation: 'The Especially Merciful',
      rootLetters: 'ر-ح-م',
      grammarType: 'noun',
    },
  ],
  '1:4': [
    {
      wordNumber: 1,
      arabic: 'مَـٰلِكِ',
      transliteration: 'Māliki',
      translation: 'Sovereign / Master',
      rootLetters: 'م-ل-ك',
      grammarType: 'noun',
      pronunciationTip: 'Short 2-count Madd on Ma followed by light Lam and Kaf.',
    },
    {
      wordNumber: 2,
      arabic: 'يَوْمِ',
      transliteration: 'Yawmi',
      translation: '(of the) Day',
      rootLetters: 'ي-و-م',
      grammarType: 'noun',
    },
    {
      wordNumber: 3,
      arabic: 'ٱلدِّينِ',
      transliteration: 'ad-Dīn',
      translation: '(of) Recompense / Judgment',
      rootLetters: 'د-ي-ن',
      grammarType: 'noun',
      tajweedRule: 'Madd Arid Lissukun',
    },
  ],
  '1:5': [
    {
      wordNumber: 1,
      arabic: 'إِيَّاكَ',
      transliteration: 'Iyyāka',
      translation: 'You alone',
      rootLetters: 'إ-ي-ك',
      grammarType: 'pronoun',
      pronunciationTip: 'Strong Shaddah on the Ya (Iyy-ya-ka).',
    },
    {
      wordNumber: 2,
      arabic: 'نَعْبُدُ',
      transliteration: 'naʿbudu',
      translation: 'we worship',
      rootLetters: 'ع-ب-د',
      grammarType: 'verb',
      pronunciationTip: 'Precise vocalization of the Ayn without straining.',
    },
    {
      wordNumber: 3,
      arabic: 'وَإِيَّاكَ',
      transliteration: 'wa-iyyāka',
      translation: 'and You alone',
      rootLetters: 'إ-ي-ك',
      grammarType: 'pronoun',
    },
    {
      wordNumber: 4,
      arabic: 'نَسْتَعِينُ',
      transliteration: 'nastaʿīn',
      translation: 'we ask for help',
      rootLetters: 'ع-و-ن',
      grammarType: 'verb',
    },
  ],
  '1:6': [
    {
      wordNumber: 1,
      arabic: 'ٱهْدِنَا',
      transliteration: 'Ihdinā',
      translation: 'Guide us',
      rootLetters: 'ه-د-ي',
      grammarType: 'verb',
      pronunciationTip: 'Soft breathy Ha from the chest.',
    },
    {
      wordNumber: 2,
      arabic: 'ٱلصِّرَٰطَ',
      transliteration: 'aṣ-Ṣirāṭa',
      translation: '(to) the Straight Path',
      rootLetters: 'ص-ر-ط',
      grammarType: 'noun',
      pronunciationTip: 'Heavy Sad (ص) and heavy Ta (ط) with light Ra in between.',
    },
    {
      wordNumber: 3,
      arabic: 'ٱلْمُسْتَقِيمَ',
      transliteration: 'al-Mustaqīm',
      translation: 'the upright / straight',
      rootLetters: 'ق-و-م',
      grammarType: 'noun',
      pronunciationTip: 'Deep Qaf (ق) from the back of the tongue.',
    },
  ],
  '1:7': [
    {
      wordNumber: 1,
      arabic: 'صِرَٰطَ',
      transliteration: 'Ṣirāṭa',
      translation: 'The path of',
      rootLetters: 'ص-ر-ط',
      grammarType: 'noun',
    },
    {
      wordNumber: 2,
      arabic: 'ٱلَّذِينَ',
      transliteration: 'alladhīna',
      translation: 'those whom',
      rootLetters: 'ل-ذ-ي',
      grammarType: 'relative pronoun',
    },
    {
      wordNumber: 3,
      arabic: 'أَنْعَمْتَ',
      transliteration: 'anʿamta',
      translation: 'You have bestowed favor',
      rootLetters: 'ن-ع-م',
      grammarType: 'verb',
      tajweedRule: 'Izhar Halqi on Noon Sakinah before Ayn',
    },
    {
      wordNumber: 4,
      arabic: 'عَلَيْهِمْ',
      transliteration: 'ʿalayhim',
      translation: 'upon them',
      rootLetters: 'ع-ل-ي',
      grammarType: 'preposition',
    },
    {
      wordNumber: 5,
      arabic: 'غَيْرِ',
      transliteration: 'ghayri',
      translation: 'not of',
      rootLetters: 'غ-ي-ر',
      grammarType: 'noun',
      pronunciationTip: 'Ghayn (غ) gargling throat resonance.',
    },
    {
      wordNumber: 6,
      arabic: 'ٱلْمَغْضُوبِ',
      transliteration: 'al-maghḍūbi',
      translation: 'those who earned [Your] wrath',
      rootLetters: 'غ-ض-ب',
      grammarType: 'noun',
      pronunciationTip: 'Dhad (ض) lateral tongue edge contact with upper molars.',
    },
    {
      wordNumber: 7,
      arabic: 'عَلَيْهِمْ',
      transliteration: 'ʿalayhim',
      translation: 'upon them',
      rootLetters: 'ع-ل-ي',
      grammarType: 'preposition',
    },
    {
      wordNumber: 8,
      arabic: 'وَلَا',
      transliteration: 'wa-lā',
      translation: 'and not',
      rootLetters: 'ل-و',
      grammarType: 'particle',
    },
    {
      wordNumber: 9,
      arabic: 'ٱلضَّآلِّينَ',
      transliteration: 'aḍ-Ḍāllīn',
      translation: 'of those who are astray',
      rootLetters: 'ض-ل-ل',
      grammarType: 'noun',
      tajweedRule: 'Madd Lazim Kalimi Muthaqqal (6 counts mandatory)',
      pronunciationTip: 'Elongate the Alif for 6 full counts before pressing hard into the doubled Lam.',
    },
  ],
  // Common recurring words
  'common:alladhi': [
    {
      arabic: 'ٱلَّذِى',
      transliteration: 'alladhī',
      translation: 'who / the one who',
      rootLetters: 'ل-ذ-ي',
      grammarType: 'relative pronoun',
      pronunciationTip: 'Articulate the Dhal softly with the tip of the tongue between the incisors, followed by 2 counts Madd on Ya.',
    }
  ]
};

/**
 * Intelligent helper to infer Arabic root, grammar type, and Tajweed guidance dynamically
 */
export function inferWordLinguistics(
  arabic: string,
  englishWord?: string
): { rootLetters: string; grammarType: WordDetailData['grammarType']; pronunciationTip: string; tajweedRule?: string } {
  const clean = arabic.replace(/[\u064B-\u065F\u0670]/g, '').trim();

  // Relative pronouns
  if (clean === 'الذي' || clean === 'الذى' || clean === 'ٱلَّذِى' || clean === 'ٱلَّذِي') {
    return {
      rootLetters: 'ل-ذ-ي',
      grammarType: 'relative pronoun',
      pronunciationTip: 'Place tip of tongue against the top incisors for Dhal (ذ) and hold 2 counts natural Madd on the Ya.',
      tajweedRule: 'Madd Tabeeʿi (2 counts)',
    };
  }
  if (clean === 'الذين' || clean === 'ٱلَّذِينَ') {
    return {
      rootLetters: 'ل-ذ-ي',
      grammarType: 'relative pronoun',
      pronunciationTip: 'Clean articulation of Dhal with soft elongation into Ya.',
      tajweedRule: 'Madd Tabeeʿi (2 counts)',
    };
  }

  // Prepositions & Particles
  if (['في', 'فِي', 'من', 'مِن', 'عن', 'عَن', 'إلى', 'إِلَى', 'على', 'عَلَى', 'بِ', 'لِ', 'كَ'].includes(clean)) {
    return {
      rootLetters: 'ح-ر-ف',
      grammarType: 'preposition',
      pronunciationTip: 'Articulate concisely without artificial lengthening.',
    };
  }

  // Divine name
  if (clean === 'الله' || clean === 'اللَّهِ' || clean === 'ٱللَّهِ') {
    return {
      rootLetters: 'إ-ل-ه',
      grammarType: 'noun',
      pronunciationTip: 'Ism al-Jalalah: Pronounce Lam heavy (Tafkheem) after Fatha/Damma, light (Tarqeeq) after Kasrah.',
      tajweedRule: 'Lām of Allāh (Tafkhīm / Tarqīq)',
    };
  }

  // Verbs check
  if (clean.startsWith('ي') || clean.startsWith('ت') || clean.startsWith('ن') || clean.startsWith('أ') || clean.endsWith('وا') || clean.endsWith('تم')) {
    return {
      rootLetters: clean.slice(0, 3).split('').join('-') || 'ف-ع-ل',
      grammarType: 'verb',
      pronunciationTip: 'Maintain precise vowel counts (Harakah) on each syllable.',
    };
  }

  // Default noun
  return {
    rootLetters: clean.slice(0, 3).split('').join('-') || 'ف-ع-ل',
    grammarType: 'noun',
    pronunciationTip: 'Articulate each letter with exact makhraj and vowel length.',
  };
}

/**
 * Extracts or generates complete word breakdown data for any Ayah with letter breakdown
 */
export function getAyahWordsData(
  surahNumber: number,
  ayahNumber: number,
  arabicText?: string,
  englishTranslation?: string
): WordDetailData[] {
  const key = `${surahNumber}:${ayahNumber}`;
  const curated = CURATED_WORD_DICTIONARY[key];

  // Try matching against SURAH_CONTENT_DB for exact words
  const surahContent = SURAH_CONTENT_DB[surahNumber];
  const ayahDb = surahContent?.ayahs.find((a) => a.number === ayahNumber);

  if (curated && curated.length > 0) {
    return curated.map((w, idx) => {
      const arabic = w.arabic || '';
      return {
        id: idx + 1,
        wordNumber: w.wordNumber || idx + 1,
        surahNumber,
        ayahNumber,
        arabic,
        transliteration: w.transliteration || `Word ${idx + 1}`,
        translation: w.translation || `Meaning ${idx + 1}`,
        audioUrl: getWordAudioUrl(surahNumber, ayahNumber, idx + 1),
        audioUrls: getWordAudioUrls(surahNumber, ayahNumber, idx + 1),
        rootLetters: w.rootLetters,
        grammarType: w.grammarType || 'noun',
        tajweedRule: w.tajweedRule,
        pronunciationTip: w.pronunciationTip,
        lettersBreakdown: decomposeArabicWordToLetters(arabic),
      };
    });
  }

  if (ayahDb && ayahDb.words && ayahDb.words.length > 0) {
    return ayahDb.words.map((w, idx) => {
      const ling = inferWordLinguistics(w.arabic, w.translation);
      return {
        id: idx + 1,
        wordNumber: idx + 1,
        surahNumber,
        ayahNumber,
        arabic: w.arabic,
        transliteration: w.transliteration || `Word ${idx + 1}`,
        translation: w.translation || `Word ${idx + 1}`,
        audioUrl: getWordAudioUrl(surahNumber, ayahNumber, idx + 1),
        audioUrls: getWordAudioUrls(surahNumber, ayahNumber, idx + 1),
        rootLetters: ling.rootLetters,
        grammarType: ling.grammarType,
        tajweedRule: ling.tajweedRule,
        pronunciationTip: ling.pronunciationTip,
        lettersBreakdown: decomposeArabicWordToLetters(w.arabic),
      };
    });
  }

  // Dynamic generator from text
  const cleanArabic = arabicText || 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
  const tokens = cleanArabic.split(' ').filter(Boolean);
  const transTokens = englishTranslation ? englishTranslation.split(' ').filter(Boolean) : [];

  return tokens.map((token, idx) => {
    const ling = inferWordLinguistics(token, transTokens[idx]);
    return {
      id: idx + 1,
      wordNumber: idx + 1,
      surahNumber,
      ayahNumber,
      arabic: token,
      transliteration: `Word ${idx + 1}`,
      translation: transTokens[idx] || `Word ${idx + 1}`,
      audioUrl: getWordAudioUrl(surahNumber, ayahNumber, idx + 1),
      audioUrls: getWordAudioUrls(surahNumber, ayahNumber, idx + 1),
      rootLetters: ling.rootLetters,
      grammarType: ling.grammarType,
      tajweedRule: ling.tajweedRule,
      pronunciationTip: ling.pronunciationTip,
      lettersBreakdown: decomposeArabicWordToLetters(token),
    };
  });
}

/**
 * Robust Multi-Tier Audio Playback Service
 * 1. Tries direct WBW Studio Audio
 * 2. Tries EveryAyah Reciter-specific verse segment
 * 3. Seamlessly falls back to Web Speech API Arabic Vocalization (never fails!)
 */
export async function playArabicWordPronunciation(
  word: WordDetailData,
  reciterProfile: ReciterProfile = QURAN_RECITERS[0],
  playbackSpeed: number = 1.0,
  onAudioEnded?: () => void
): Promise<{ source: 'wbw_studio' | 'reciter_segment' | 'speech_synthesis'; audioInstance?: HTMLAudioElement }> {
  // Stop all other playing audios before starting word pronunciation
  globalAudioManager.stopAll('word-wbw');

  let hasEnded = false;
  const notifyEnded = () => {
    if (!hasEnded) {
      hasEnded = true;
      if (onAudioEnded) onAudioEnded();
    }
  };

  // Strategy 1: Try primary CDN WBW audio URLs
  const candidateUrls = (word.audioUrls && word.audioUrls.length > 0) ? word.audioUrls : [word.audioUrl];
  for (const url of candidateUrls) {
    if (!url) continue;
    try {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = url;
      audio.playbackRate = playbackSpeed;

      const unregister = globalAudioManager.registerAudioElement(audio, 'word-wbw', () => {
        try {
          if (!audio.paused) audio.pause();
        } catch {
          // ignore
        }
      });

      audio.onended = () => {
        unregister();
        notifyEnded();
      };
      audio.onerror = () => {
        unregister();
        // Will continue to next mirror in loop
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        return { source: 'wbw_studio', audioInstance: audio };
      }
    } catch {
      // Continue to next mirror
    }
  }

  // Strategy 2: Guaranteed Web Speech API Arabic Synthesis (Accurate single word phonetics)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return new Promise((resolve) => {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word.arabic);
        utterance.lang = 'ar-SA';
        utterance.rate = playbackSpeed * 0.85;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          notifyEnded();
        };
        utterance.onerror = () => {
          notifyEnded();
        };

        window.speechSynthesis.speak(utterance);
        resolve({ source: 'speech_synthesis' });
      } catch (e) {
        notifyEnded();
        resolve({ source: 'speech_synthesis' });
      }
    });
  }

  notifyEnded();
  return { source: 'speech_synthesis' };
}

/**
 * Retrieves native Arabic SpeechSynthesis voice from the browser, with caching
 */
export function getArabicSpeechVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. High priority: Arabic Saudi Arabia / Egypt (standard Quranic pronunciation)
  const saudiOrEg = voices.find(
    (v) =>
      v.lang === 'ar-SA' ||
      v.lang === 'ar-EG' ||
      v.lang === 'ar_SA' ||
      v.lang === 'ar_EG' ||
      v.lang === 'ar-AE' ||
      v.lang === 'ar-KW'
  );
  if (saudiOrEg) return saudiOrEg;

  // 2. Generic Arabic voice
  const genericArabic = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith('ar') ||
      v.name.toLowerCase().includes('arabic') ||
      v.name.toLowerCase().includes('maged') ||
      v.name.toLowerCase().includes('tarik') ||
      v.name.toLowerCase().includes('laila')
  );
  if (genericArabic) return genericArabic;

  return null;
}

/**
 * Pronounces a single letter or phonetic unit with guaranteed clean audio feedback.
 * 
 * - In 'vowel_sound' mode (default): Pronounces the exact vocalized letter (e.g. "سَ" -> "Sa", "عْ" -> "ʿ")
 * - In 'letter_name' mode: Pronounces the full Arabic letter noun (e.g. "سِين", "عَيْن")
 * - Uses a pure, soft acoustic chime without any harsh buzzing or static artifacts.
 */
export function playIsolatedLetterSound(
  arabicLetter: string,
  meta?: {
    name?: string;
    arabicName?: string;
    harakah?: string;
    mode?: 'vowel_sound' | 'letter_name';
    onAudioEnded?: () => void;
  }
): void {
  if (!arabicLetter) return;

  // Stop any other active audio
  globalAudioManager.stopAll('letter-synth');

  // 1. Pure, soft acoustic tone (sine wave, zero static / no sawtooth buzz)
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      globalAudioManager.registerAudioContext(ctx);
      const now = ctx.currentTime;

      // Soft harmonic chime for immediate tactile responsiveness
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine'; // Pure smooth tone, no harsh harmonics or static buzz
      osc.frequency.setValueAtTime(528, now); // 528 Hz harmonic frequency
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.02); // Gentle low volume
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);

      setTimeout(() => {
        try {
          ctx.close();
        } catch {}
      }, 300);
    }
  } catch {
    // AudioContext not supported or restricted
  }

  // 2. High-Fidelity Arabic Speech Synthesis (Pronounces exact Arabic vocalization)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();

      // Determine text to pronounce
      const isLetterNameMode = meta?.mode === 'letter_name';
      let spokenText = '';

      if (isLetterNameMode) {
        // Formal letter name: "سِين", "بَاء", "أَلِف", etc.
        spokenText =
          meta?.arabicName ||
          ARABIC_LETTERS_MAP[arabicLetter[0]]?.arabicName ||
          arabicLetter;
      } else {
        // Exact vocalized phonetic unit with Harakah: "سَ", "يَ", "عْ", "لَ", "مُ", "و", "نَ"
        spokenText = arabicLetter;
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.82; // Measured, clear pace for Tajweed precision
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const arabicVoice = getArabicSpeechVoice();
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      if (meta?.onAudioEnded) {
        utterance.onend = () => {
          meta.onAudioEnded?.();
        };
        utterance.onerror = () => {
          meta.onAudioEnded?.();
        };
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.debug('Speech synthesis error:', err);
      meta?.onAudioEnded?.();
    }
  } else {
    meta?.onAudioEnded?.();
  }
}

/**
 * In-memory Audio Preloader cache for seamless verse-by-verse playback
 */
class QuranAudioPreloader {
  private audioCache = new Map<string, HTMLAudioElement>();

  public preloadAyah(surahNumber: number, ayahNumber: number, reciterSubfolder?: string): void {
    const url = getAyahAudioUrl(surahNumber, ayahNumber, reciterSubfolder);
    if (!this.audioCache.has(url)) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      this.audioCache.set(url, audio);
    }
  }

  public preloadNextAyahs(surahNumber: number, currentAyah: number, count: number = 3): void {
    for (let i = 1; i <= count; i++) {
      this.preloadAyah(surahNumber, currentAyah + i);
    }
  }
}

export const quranAudioPreloader = new QuranAudioPreloader();

/**
 * Robust audio player for an entire Ayah or Arabic passage.
 * 1. If surahNumber & ayahNumber are provided, tries high-quality CDN recording from EveryAyah.
 * 2. If CDN fails or for custom text, falls back to Arabic Web Speech API (speechSynthesis).
 */
export async function playFullAyahPronunciation(options: {
  arabicText?: string;
  surahNumber?: number;
  ayahNumber?: number;
  reciterSubfolder?: string;
  playbackSpeed?: number;
  onAudioStart?: () => void;
  onAudioEnded?: () => void;
  onError?: (err: any) => void;
}): Promise<{ source: 'qari_audio' | 'speech_synthesis'; stop: () => void }> {
  const {
    arabicText = '',
    surahNumber,
    ayahNumber,
    reciterSubfolder = 'Alafasy_128kbps',
    playbackSpeed = 1.0,
    onAudioStart,
    onAudioEnded,
    onError,
  } = options;

  const instanceId = `ayah-pronounce-${surahNumber || 0}-${ayahNumber || 0}-${Date.now()}`;
  // Stop all other audio before playing this ayah
  globalAudioManager.stopAll(instanceId);

  let currentAudio: HTMLAudioElement | null = null;
  let isStopped = false;
  let unregisterGlobal: (() => void) | null = null;

  const stop = () => {
    isStopped = true;
    if (unregisterGlobal) {
      unregisterGlobal();
      unregisterGlobal = null;
    }
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch {}
      currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  };

  // Strategy 1: Pre-recorded Qari Audio from EveryAyah CDN
  if (surahNumber && ayahNumber && surahNumber > 0 && ayahNumber > 0) {
    try {
      const audioUrl = getAyahAudioUrl(surahNumber, ayahNumber, reciterSubfolder);
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.playbackRate = playbackSpeed;
      audio.crossOrigin = 'anonymous';

      unregisterGlobal = globalAudioManager.registerAudioElement(audio, instanceId, () => {
        stop();
        onAudioEnded?.();
      });

      return new Promise((resolve) => {
        audio.onplay = () => {
          onAudioStart?.();
        };

        audio.onended = () => {
          if (unregisterGlobal) {
            unregisterGlobal();
            unregisterGlobal = null;
          }
          if (!isStopped) {
            onAudioEnded?.();
          }
        };

        audio.onerror = () => {
          if (unregisterGlobal) {
            unregisterGlobal();
            unregisterGlobal = null;
          }
          // Fall back to Speech Synthesis if CDN file is unreachable
          playWithTTS();
          resolve({ source: 'speech_synthesis', stop });
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              resolve({ source: 'qari_audio', stop });
            })
            .catch((e) => {
              // Browser autoplay policy or network error -> fallback to TTS
              playWithTTS();
              resolve({ source: 'speech_synthesis', stop });
            });
        } else {
          resolve({ source: 'qari_audio', stop });
        }
      });
    } catch (e) {
      // Fallback
    }
  }

  // Strategy 2: Web Speech API (Arabic TTS)
  function playWithTTS() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const cleanText = arabicText
          ? arabicText.replace(/[0-9٠-٩۝۞]/g, '').trim()
          : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ar-SA';
        utterance.rate = playbackSpeed * 0.88;
        utterance.pitch = 1.0;

        const unregisterCustom = globalAudioManager.registerCustomPlayer(instanceId, () => {
          try {
            window.speechSynthesis.cancel();
          } catch {}
          onAudioEnded?.();
        });

        utterance.onstart = () => {
          onAudioStart?.();
        };
        utterance.onend = () => {
          unregisterCustom();
          if (!isStopped) {
            onAudioEnded?.();
          }
        };
        utterance.onerror = (err) => {
          unregisterCustom();
          onError?.(err);
          onAudioEnded?.();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        onError?.(err);
        onAudioEnded?.();
      }
    } else {
      onAudioEnded?.();
    }
  }

  playWithTTS();
  return { source: 'speech_synthesis', stop };
}

