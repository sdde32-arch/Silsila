/**
 * Tajweed Analysis & Letter-by-Letter Rule Engine for Silsila Quran Learning
 */

export type TajweedCategory =
  | 'qalqalah'
  | 'ghunnah'
  | 'madd'
  | 'ikhfa'
  | 'idgham'
  | 'iqlab'
  | 'izhar'
  | 'tafkhim'
  | 'meem_sakinah'
  | 'hamzatul_wasl'
  | 'general';

export interface TajweedRuleInfo {
  id: string;
  name: string;
  arabicName: string;
  category: TajweedCategory;
  countDuration?: string;
  shortSummary: string;
  explanation: string;
  howToPronounce: string;
  makhraj: string;
  lettersList: string;
  colorScheme: {
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    letterHighlightBg: string;
    letterHighlightText: string;
    letterHighlightBorder: string;
    glowClass: string;
    accentColor: string;
  };
}

export interface TajweedLetterSegment {
  charIndex: number;
  letter: string; // The character with combining diacritics, e.g. "بْ", "نَّ", "صَـٰٓ"
  baseChar: string; // Base character without diacritics, e.g. "ب", "ن", "ص"
  diacritics: string;
  harakahName: string;
  wordIndex: number;
  wordText: string;
  rule?: TajweedRuleInfo;
  isRuleTrigger: boolean;
}

export interface TajweedWordBreakdown {
  wordIndex: number;
  wordText: string;
  segments: TajweedLetterSegment[];
  primaryRule?: TajweedRuleInfo;
}

/** Complete Tajweed Rules Catalog */
export const TAJWEED_RULES: Record<string, TajweedRuleInfo> = {
  qalqalah: {
    id: 'qalqalah',
    name: 'Qalqalah (Echoing / Bouncing Sound)',
    arabicName: 'قَلْقَلَة',
    category: 'qalqalah',
    countDuration: 'Instant vibration (No vowel addition)',
    shortSummary: 'Echoing or bouncing sound produced when the letter has Sukun (ْ) or upon stopping.',
    explanation:
      'Qalqalah creates an audible echoing bounce when one of the 5 letters of Qutb Jad (قطب جد) is unvoweled (has Sukun) or stopped upon at the end of a word.',
    howToPronounce:
      'Release the tongue/lips sharply after momentary contact to let the voice bounce off without adding a Kasrah, Fathah, or Dammah.',
    makhraj: 'Varies by letter (Tongue tip, Tongue base, Middle tongue, or Both lips).',
    lettersList: 'ق ، ط ، ب ، ج ، د (Mnemonic: قُطْبُ جَدّ)',
    colorScheme: {
      badgeBg: 'bg-emerald-100/90',
      badgeText: 'text-emerald-950',
      badgeBorder: 'border-emerald-300',
      letterHighlightBg: 'bg-emerald-100',
      letterHighlightText: 'text-emerald-950',
      letterHighlightBorder: 'border-emerald-400',
      glowClass: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
      accentColor: '#059669',
    },
  },
  ghunnah: {
    id: 'ghunnah',
    name: 'Ghunnah (Nasalization - 2 Counts)',
    arabicName: 'غُنَّة مُشَدَّدَة',
    category: 'ghunnah',
    countDuration: '2 full counts (Harakataan)',
    shortSummary: 'A resonant nasal sound held for 2 counts when Noon (نّ) or Meem (مّ) has a Shaddah.',
    explanation:
      'Noon and Meem with Shaddah possess the highest degree of Ghunnah (Ghunnah Kamilah). The airflow must vibrate completely through the nasal passage (Khayshoom).',
    howToPronounce:
      'Close off the mouth airway completely and let the resonant hum echo smoothly inside the nasal cavity for exactly 2 seconds/counts before moving to the vowel.',
    makhraj: 'Nose / Nasal Cavity (Al-Khayshoom / الخَيْشُوم)',
    lettersList: 'نّ (Noon Mushaddad) ، مّ (Meem Mushaddad)',
    colorScheme: {
      badgeBg: 'bg-amber-100/90',
      badgeText: 'text-amber-950',
      badgeBorder: 'border-amber-300',
      letterHighlightBg: 'bg-amber-100',
      letterHighlightText: 'text-amber-950',
      letterHighlightBorder: 'border-amber-400',
      glowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
      accentColor: '#D97706',
    },
  },
  madd_lazim: {
    id: 'madd_lazim',
    name: 'Madd Lāzim (Mandatory 6-Count Prolongation)',
    arabicName: 'مَدّ لَازِم',
    category: 'madd',
    countDuration: '6 mandatory counts (3 Alifs)',
    shortSummary: 'Compulsory 6-count elongation when a Madd letter is followed by a doubled (Shaddah) letter.',
    explanation:
      'When a Madd letter (Alif, Waw, or Yaa) is immediately followed by a letter with Shaddah (ّ) or permanent Sukun in the same word, it must be prolonged for 6 counts.',
    howToPronounce:
      'Elongate the vowel sound steadily and smoothly for 6 beats before locking firmly onto the heavy doubled consonant (e.g. صَـٰٓفَّـٰتٍ).',
    makhraj: 'Oral Cavity (Al-Jawf / الجَوْف)',
    lettersList: 'ـٰٓ ، آ ، ىٓ (Followed by Shaddah)',
    colorScheme: {
      badgeBg: 'bg-purple-100/90',
      badgeText: 'text-purple-950',
      badgeBorder: 'border-purple-300',
      letterHighlightBg: 'bg-purple-100',
      letterHighlightText: 'text-purple-950',
      letterHighlightBorder: 'border-purple-400',
      glowClass: 'shadow-[0_0_12px_rgba(168,85,247,0.35)]',
      accentColor: '#7E22CE',
    },
  },
  madd_muttasil: {
    id: 'madd_muttasil',
    name: 'Madd Muttaṣil (Connected Obligatory Madd)',
    arabicName: 'مَدّ وَاجِب مُتَّصِل',
    category: 'madd',
    countDuration: '4 to 5 counts',
    shortSummary: 'Elongation of 4-5 counts when a Madd letter and Hamzah (ء) meet within the SAME word.',
    explanation:
      'When an Alif, Waw, or Yaa is followed by Hamzah in one word (like سِيٓـَٔتْ, مَآؤُكُمْ, ٱلسَّمَاءِ), it is obligatory to elongate it 4 to 5 counts.',
    howToPronounce:
      'Flow the vowel sound continuously for 4-5 counts and articulate the Hamzah crisply from the deep vocal cords at the end.',
    makhraj: 'Oral Cavity (Al-Jawf) transitioning to Deep Throat (Aqsal Halq)',
    lettersList: 'ـٓء ، آء ، يٓـٔ',
    colorScheme: {
      badgeBg: 'bg-indigo-100/90',
      badgeText: 'text-indigo-950',
      badgeBorder: 'border-indigo-300',
      letterHighlightBg: 'bg-indigo-100',
      letterHighlightText: 'text-indigo-950',
      letterHighlightBorder: 'border-indigo-400',
      glowClass: 'shadow-[0_0_12px_rgba(99,102,241,0.35)]',
      accentColor: '#4F46E5',
    },
  },
  madd_munfasil: {
    id: 'madd_munfasil',
    name: 'Madd Munfaṣil (Separated Permissible Madd)',
    arabicName: 'مَدّ جَائِز مُنْفَصِل',
    category: 'madd',
    countDuration: '4 to 5 counts (or 2 in Qasr)',
    shortSummary: 'Elongation when a Madd letter ends a word and the next word starts with Hamzah.',
    explanation:
      'Occurs when a word ends with an Alif, Waw, or Yaa with a Madd sign (ٓ) and the next word begins with Hamzah (e.g. ٱلَّذِىٓ أَنشَأَكُمْ or أَهْدَىٰٓ أَمَّن).',
    howToPronounce:
      'Elongate the final vowel smoothly for 4-5 counts before initiating the next word with a clean throat Hamzah.',
    makhraj: 'Oral Cavity (Al-Jawf)',
    lettersList: 'ـٓ followed by أ / إ / ء',
    colorScheme: {
      badgeBg: 'bg-blue-100/90',
      badgeText: 'text-blue-950',
      badgeBorder: 'border-blue-300',
      letterHighlightBg: 'bg-blue-100',
      letterHighlightText: 'text-blue-950',
      letterHighlightBorder: 'border-blue-400',
      glowClass: 'shadow-[0_0_12px_rgba(59,130,246,0.35)]',
      accentColor: '#2563EB',
    },
  },
  madd_tabeei: {
    id: 'madd_tabeei',
    name: 'Madd Ṭabīʿī (Natural 2-Count Vowel)',
    arabicName: 'مَدّ طَبِيعِي',
    category: 'madd',
    countDuration: '2 counts (Standard cadence)',
    shortSummary: 'Natural vowel lengthening of Alif, Dagger Alif (ٰ), Waw, or Yaa without extra Hamzah/Sukun.',
    explanation:
      'The foundational elongation of classical Arabic where the vowel is extended naturally for 2 beats without excess pressure or clipping.',
    howToPronounce:
      'Allow the open airway sound to ring for 2 counts without cutting it short or exaggerating past 2 beats.',
    makhraj: 'Oral Cavity (Al-Jawf / الجَوْف)',
    lettersList: 'ـٰ (Dagger Alif) ، ا ، و ، ي',
    colorScheme: {
      badgeBg: 'bg-cyan-100/90',
      badgeText: 'text-cyan-950',
      badgeBorder: 'border-cyan-300',
      letterHighlightBg: 'bg-cyan-100',
      letterHighlightText: 'text-cyan-950',
      letterHighlightBorder: 'border-cyan-400',
      glowClass: 'shadow-[0_0_12px_rgba(6,182,212,0.35)]',
      accentColor: '#0891B2',
    },
  },
  madd_arid: {
    id: 'madd_arid',
    name: 'Madd ʿĀriḍ li-s-Sukūn (Pause Elongation)',
    arabicName: 'مَدّ عَارِض لِلسُّكُون',
    category: 'madd',
    countDuration: '2, 4, or 6 counts on pause',
    shortSummary: 'Elongation occurring on the vowel before the last letter of a verse when stopping.',
    explanation:
      'When you stop at an Ayah end or pause mark (e.g. ٱلرَّحْمَـٰنُ, مُسْتَقِيمٍ, تَشْكُرُونَ), the last letter becomes Sakin, allowing the preceding Madd vowel to be extended 2, 4, or 6 counts.',
    howToPronounce:
      'Extend the vowel sound for your chosen count (e.g., 4 beats) then close gracefully on the final consonant with mild Sukun.',
    makhraj: 'Oral Cavity (Al-Jawf)',
    lettersList: 'Vowel before last paused consonant',
    colorScheme: {
      badgeBg: 'bg-teal-100/90',
      badgeText: 'text-teal-950',
      badgeBorder: 'border-teal-300',
      letterHighlightBg: 'bg-teal-100',
      letterHighlightText: 'text-teal-950',
      letterHighlightBorder: 'border-teal-400',
      glowClass: 'shadow-[0_0_12px_rgba(20,184,166,0.35)]',
      accentColor: '#0D9488',
    },
  },
  ikhfa_haqiqi: {
    id: 'ikhfa_haqiqi',
    name: 'Ikhfāʾ Ḥaqīqī (Concealment with Ghunnah)',
    arabicName: 'إِخْفَاء حَقِيقِي',
    category: 'ikhfa',
    countDuration: '2 counts of hidden nasal sound',
    shortSummary: 'Hiding the Noon Sakinah or Tanween while holding a 2-count nasal Ghunnah before 15 letters.',
    explanation:
      'When Noon Sakinah (نْ) or Tanween (ً ٍ ٌ) is followed by one of the 15 Ikhfa letters (e.g. جُندٌ, يَنصُرُكُم, دُونِ, كُنتُمْ), the tongue does not touch the palate for Noon; instead, the sound is voiced through the nose as the mouth prepares for the next letter.',
    howToPronounce:
      'Do not touch the tip of the tongue to the upper gums for Noon. Instead, hover the tongue near the target letter’s makhraj while humming through the nose for 2 counts.',
    makhraj: 'Nasal Cavity (Khayshoom) with hovered tongue preparation',
    lettersList: 'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك',
    colorScheme: {
      badgeBg: 'bg-rose-100/90',
      badgeText: 'text-rose-950',
      badgeBorder: 'border-rose-300',
      letterHighlightBg: 'bg-rose-100',
      letterHighlightText: 'text-rose-950',
      letterHighlightBorder: 'border-rose-400',
      glowClass: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]',
      accentColor: '#E11D48',
    },
  },
  idgham_ghunnah: {
    id: 'idgham_ghunnah',
    name: 'Idghām with Ghunnah (Nasal Assimilation)',
    arabicName: 'إِدْغَام بِغُنَّة',
    category: 'idgham',
    countDuration: '2 counts nasal merge',
    shortSummary: 'Merging Noon Sakinah or Tanween into Yaa, Noon, Meem, or Waw with a 2-count nasal hum.',
    explanation:
      'When Noon Sakinah or Tanween meets one of the 4 letters of Yanmu (ي ن م و), such as قَلِيلًا مَّا or فَمَن يَأْتِيكُم or مِّن دُونِ, the Noon is completely blended into the following letter with 2 counts of Ghunnah.',
    howToPronounce:
      'Blend the sound completely into the second letter while maintaining a strong 2-count nasal resonance.',
    makhraj: 'Second letter makhraj combined with Nasal Cavity (Khayshoom)',
    lettersList: 'ي ، ن ، م ، و (Mnemonic: يَنْمُو)',
    colorScheme: {
      badgeBg: 'bg-orange-100/90',
      badgeText: 'text-orange-950',
      badgeBorder: 'border-orange-300',
      letterHighlightBg: 'bg-orange-100',
      letterHighlightText: 'text-orange-950',
      letterHighlightBorder: 'border-orange-400',
      glowClass: 'shadow-[0_0_12px_rgba(249,115,22,0.35)]',
      accentColor: '#EA580C',
    },
  },
  idgham_bila_ghunnah: {
    id: 'idgham_bila_ghunnah',
    name: 'Idghām without Ghunnah (Complete Merge)',
    arabicName: 'إِدْغَام بِغَيْرِ غُنَّة',
    category: 'idgham',
    countDuration: 'Direct, crisp transition (No nasal hum)',
    shortSummary: 'Total assimilation of Noon Sakinah or Tanween into Lam (ل) or Raa (ر) without nasalization.',
    explanation:
      'When Noon Sakinah or Tanween is followed by Lam (ل) or Raa (ر), the Noon disappears completely and is pronounced directly as a stressed Lam or Raa without any nasal humming (e.g. جُندٌ لَّكُمْ or مِن رَّبِّهِم).',
    howToPronounce:
      'Do not make any sound through the nose. Jump straight to a crisp, doubled Lam or Raa.',
    makhraj: 'Lam: Tip of tongue edge; Raa: Tongue tip with slight trill',
    lettersList: 'ل ، ر',
    colorScheme: {
      badgeBg: 'bg-sky-100/90',
      badgeText: 'text-sky-950',
      badgeBorder: 'border-sky-300',
      letterHighlightBg: 'bg-sky-100',
      letterHighlightText: 'text-sky-950',
      letterHighlightBorder: 'border-sky-400',
      glowClass: 'shadow-[0_0_12px_rgba(14,165,233,0.35)]',
      accentColor: '#0284C7',
    },
  },
  iqlab: {
    id: 'iqlab',
    name: 'Iqlāb (Conversion to Meem before Baa)',
    arabicName: 'إِقْلَاب',
    category: 'iqlab',
    countDuration: '2 counts of soft nasal Meem',
    shortSummary: 'Converting Noon Sakinah or Tanween into a soft Meem (م) with Ghunnah when before Baa (ب).',
    explanation:
      'When Noon Sakinah or Tanween meets the letter Baa (ب), it changes into a hidden Meem with 2 counts of Ghunnah. In the Quranic text, a small superscript Meem (ۭ / ۢ) is inscribed above it.',
    howToPronounce:
      'Lightly touch the lips together without pressing tightly and let the nasal hum resonate for 2 counts before releasing onto Baa.',
    makhraj: 'Lips (Shafatan) with Nasal Cavity (Khayshoom)',
    lettersList: 'ب (Preceded by Noon Sakinah or Tanween with small Meem ۭ)',
    colorScheme: {
      badgeBg: 'bg-fuchsia-100/90',
      badgeText: 'text-fuchsia-950',
      badgeBorder: 'border-fuchsia-300',
      letterHighlightBg: 'bg-fuchsia-100',
      letterHighlightText: 'text-fuchsia-950',
      letterHighlightBorder: 'border-fuchsia-400',
      glowClass: 'shadow-[0_0_12px_rgba(217,70,239,0.35)]',
      accentColor: '#C026D3',
    },
  },
  izhar_halqi: {
    id: 'izhar_halqi',
    name: 'Iẓhār Ḥalqī (Clear Throat Articulation)',
    arabicName: 'إِظْهَار حَلْقِي',
    category: 'izhar',
    countDuration: 'Crisp, natural duration without Ghunnah',
    shortSummary: 'Pronouncing Noon Sakinah or Tanween clearly and distinctly before 6 throat letters.',
    explanation:
      'When Noon Sakinah or Tanween is followed by any of the 6 throat letters (ء هـ ع ح غ خ), the Noon must be pronounced distinctly and naturally with zero extra nasalization or pausing.',
    howToPronounce:
      'Place the tip of the tongue firmly against the upper gum to articulate a clear Noon, then smoothly pronounce the throat letter.',
    makhraj: 'Throat (Al-Halq / الحَلْق): Bottom, Middle, and Top throat',
    lettersList: 'ء ، هـ ، ع ، ح ، غ ، خ (Throat Letters)',
    colorScheme: {
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-900',
      badgeBorder: 'border-slate-300',
      letterHighlightBg: 'bg-slate-200/80',
      letterHighlightText: 'text-slate-950',
      letterHighlightBorder: 'border-slate-400',
      glowClass: 'shadow-[0_0_12px_rgba(100,116,139,0.35)]',
      accentColor: '#475569',
    },
  },
  tafkhim: {
    id: 'tafkhim',
    name: 'Tafkhīm (Heavy / Full-Mouthed Letter)',
    arabicName: 'تَفْخِيم (حُرُوف الِاسْتِعْلَاء)',
    category: 'tafkhim',
    countDuration: 'Full resonance in oral cavity',
    shortSummary: 'Heavy, deep pronunciation with the back of the tongue raised towards the soft palate.',
    explanation:
      'The 7 heavy letters of Istiʿla (خ ص ض غ ط ق ظ) and the heavy Raa (with Fathah/Dammah) or Lam of Allah (after Fathah/Dammah) must be pronounced with a deep, full-mouthed resonance.',
    howToPronounce:
      'Elevate the back of the tongue towards the roof of the mouth and create resonance in the back of the mouth without rounding the lips.',
    makhraj: 'Back of the tongue (Aqsal Lisan) and upper palate',
    lettersList: 'خ ، ص ، ض ، غ ، ط ، ق ، ظ (Mnemonic: خُصَّ ضَغْطٍ قِظْ)',
    colorScheme: {
      badgeBg: 'bg-amber-100/90',
      badgeText: 'text-amber-950',
      badgeBorder: 'border-amber-300',
      letterHighlightBg: 'bg-amber-200/70',
      letterHighlightText: 'text-amber-950',
      letterHighlightBorder: 'border-amber-500',
      glowClass: 'shadow-[0_0_12px_rgba(217,119,6,0.35)]',
      accentColor: '#B45309',
    },
  },
  hamzatul_wasl: {
    id: 'hamzatul_wasl',
    name: 'Hamzatul Waṣl (Connecting Hamzah)',
    arabicName: 'هَمْزَةُ الوَصْل',
    category: 'hamzatul_wasl',
    countDuration: 'Voiced at start, silent in continuous flow',
    shortSummary: 'A temporary connecting Hamzah (ٱ) pronounced only when starting recitation from that word.',
    explanation:
      'Hamzatul Wasl (ٱ) serves to enable the pronunciation of an unvoweled letter at the beginning of a word. When reading continuously from the previous word, it drops out silently.',
    howToPronounce:
      'Pronounce as an Alif/Hamzah when beginning; skip straight over it when connecting from the preceding word.',
    makhraj: 'Deep Throat (Aqsal Halq) when initiated',
    lettersList: 'ٱ (Alif with miniature Saad ۜ)',
    colorScheme: {
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-900',
      badgeBorder: 'border-blue-200',
      letterHighlightBg: 'bg-blue-100',
      letterHighlightText: 'text-blue-950',
      letterHighlightBorder: 'border-blue-300',
      glowClass: 'shadow-[0_0_12px_rgba(59,130,246,0.25)]',
      accentColor: '#3B82F6',
    },
  },
};

/**
 * Strips Quranic diacritics to return the base character
 */
export function getBaseArabicChar(str: string): string {
  return str.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
}

/**
 * Intelligent Rule Matcher for a specific letter/cluster within a Quranic word
 */
export function analyzeLetterTajweedRule(
  word: string,
  charIndex: number,
  nextWord?: string
): TajweedRuleInfo | undefined {
  const fullWord = word;
  const char = word[charIndex];
  if (!char) return undefined;

  // Combining diacritics attached to this character
  let combined = char;
  let j = charIndex + 1;
  while (j < word.length && /[\u064B-\u065F\u0670\u06D6-\u06ED]/.test(word[j])) {
    combined += word[j];
    j++;
  }

  const base = getBaseArabicChar(char);
  const nextChar = word[j];
  const nextBase = nextChar ? getBaseArabicChar(nextChar) : '';

  // 1. Madd Lazim: Madd sign (ٓ) followed by Shaddah (ّ)
  if (combined.includes('\u0653') || combined.includes('ـٰٓ') || combined.includes('آ') || combined.includes('ىٓ')) {
    if (word.includes('\u0651') || (nextWord && nextWord.includes('\u0651'))) {
      return TAJWEED_RULES.madd_lazim;
    }
    // Madd Muttasil: Followed by Hamzah in the same word
    if (word.includes('ء') || word.includes('ئ') || word.includes('ؤ') || word.includes('أ') || word.includes('ـٔ')) {
      return TAJWEED_RULES.madd_muttasil;
    }
    // Madd Munfasil: Next word starts with Hamzah
    if (nextWord && /^[أإءٱ]/.test(nextWord)) {
      return TAJWEED_RULES.madd_munfasil;
    }
    return TAJWEED_RULES.madd_lazim;
  }

  // 2. Ghunnah Mushaddadah: Noon with Shaddah (نّ) or Meem with Shaddah (مّ)
  if ((base === 'ن' || base === 'م') && combined.includes('\u0651')) {
    return TAJWEED_RULES.ghunnah;
  }

  // 3. Qalqalah: ق ط ب ج د with Sukun (ْ) or without vowel at word-end
  const qalqalahLetters = ['ق', 'ط', 'ب', 'ج', 'د'];
  if (qalqalahLetters.includes(base)) {
    if (combined.includes('\u0652') || (!combined.includes('\u064E') && !combined.includes('\u064F') && !combined.includes('\u0650') && !combined.includes('\u0651'))) {
      return TAJWEED_RULES.qalqalah;
    }
    // If it's at the end of the word
    if (j >= word.length) {
      return TAJWEED_RULES.qalqalah;
    }
  }

  // 4. Iqlab: Small Meem (ۭ / ۢ) or Tanween / Noon before Baa (ب)
  if (combined.includes('\u06E2') || combined.includes('\u0658') || ((base === 'ن' || combined.includes('\u064B') || combined.includes('\u064C') || combined.includes('\u064D')) && (nextBase === 'ب' || (nextWord && nextWord.startsWith('ب'))))) {
    return TAJWEED_RULES.iqlab;
  }

  // 5. Idgham: Noon Sakinah or Tanween followed by Idgham letters
  const isNoonSakinOrTanween = (base === 'ن' && combined.includes('\u0652')) || combined.includes('\u064B') || combined.includes('\u064C') || combined.includes('\u064D') || (base === 'ن' && !combined.includes('\u064E') && !combined.includes('\u064F') && !combined.includes('\u0650'));
  
  if (isNoonSakinOrTanween) {
    const targetLetter = nextBase || (nextWord ? getBaseArabicChar(nextWord[0]) : '');
    if (['ي', 'ن', 'م', 'و'].includes(targetLetter)) {
      return TAJWEED_RULES.idgham_ghunnah;
    }
    if (['ل', 'ر'].includes(targetLetter)) {
      return TAJWEED_RULES.idgham_bila_ghunnah;
    }
    if (['ء', 'ه', 'ع', 'ح', 'غ', 'خ'].includes(targetLetter)) {
      return TAJWEED_RULES.izhar_halqi;
    }
    if (['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'].includes(targetLetter)) {
      return TAJWEED_RULES.ikhfa_haqiqi;
    }
  }

  // 6. Ikhfa inside single word (e.g. جُندٌ, يَنصُرُكُم, أَنشَأَكُمْ, كُنتُمْ)
  if (base === 'ن' && nextBase && ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'].includes(nextBase)) {
    return TAJWEED_RULES.ikhfa_haqiqi;
  }

  // 7. Hamzatul Wasl: ٱ
  if (char === 'ٱ' || base === 'ٱ') {
    return TAJWEED_RULES.hamzatul_wasl;
  }

  // 8. Madd Tabee'i: Dagger Alif (ٰ) or natural vowels
  if (combined.includes('\u0670') || (base === 'ا' && !combined.includes('\u0653')) || (base === 'ى' && !combined.includes('\u0653'))) {
    return TAJWEED_RULES.madd_tabeei;
  }

  // 9. Tafkhim Heavy letters: خ ص ض غ ط ق ظ
  const heavyLetters = ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ'];
  if (heavyLetters.includes(base)) {
    return TAJWEED_RULES.tafkhim;
  }

  return undefined;
}

/**
 * Parses an entire Arabic Ayah string into words and interactive letter segments with Tajweed rules
 */
export function parseAyahIntoTajweedWords(ayahText: string): TajweedWordBreakdown[] {
  const words = ayahText.split(/\s+/).filter(Boolean);

  return words.map((word, wordIdx) => {
    const nextWord = words[wordIdx + 1];
    const segments: TajweedLetterSegment[] = [];
    let primaryRule: TajweedRuleInfo | undefined = undefined;

    let i = 0;
    while (i < word.length) {
      const char = word[i];
      if (/[\u064B-\u065F\u0670\u06D6-\u06ED]/.test(char)) {
        // standalone diacritic without base (attach to previous if exists)
        if (segments.length > 0) {
          segments[segments.length - 1].letter += char;
          segments[segments.length - 1].diacritics += char;
        }
        i++;
        continue;
      }

      // Base letter found, accumulate its combining diacritics
      let cluster = char;
      let diacritics = '';
      let k = i + 1;
      while (k < word.length && /[\u064B-\u065F\u0670\u06D6-\u06ED]/.test(word[k])) {
        cluster += word[k];
        diacritics += word[k];
        k++;
      }

      const base = getBaseArabicChar(char);
      const rule = analyzeLetterTajweedRule(word, i, nextWord);

      if (rule && !primaryRule) {
        primaryRule = rule;
      }

      let harakahName = 'Sukūn';
      if (cluster.includes('\u064E')) harakahName = 'Fatḥah';
      else if (cluster.includes('\u064F')) harakahName = 'Ḍammah';
      else if (cluster.includes('\u0650')) harakahName = 'Kasrah';
      else if (cluster.includes('\u0651')) harakahName = 'Shaddah';
      else if (cluster.includes('\u064B')) harakahName = 'Fatḥatān (Tanwīn)';
      else if (cluster.includes('\u064C')) harakahName = 'Ḍammatān (Tanwīn)';
      else if (cluster.includes('\u064D')) harakahName = 'Kasratān (Tanwīn)';
      else if (cluster.includes('\u0670')) harakahName = 'Dagger Alif';

      segments.push({
        charIndex: i,
        letter: cluster,
        baseChar: base,
        diacritics,
        harakahName,
        wordIndex: wordIdx,
        wordText: word,
        rule,
        isRuleTrigger: !!rule,
      });

      i = k;
    }

    return {
      wordIndex: wordIdx,
      wordText: word,
      segments,
      primaryRule,
    };
  });
}
