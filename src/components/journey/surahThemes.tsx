import React from 'react';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import {
  Compass,
  Heart,
  Sparkles,
  Sun,
  BookOpen,
  Scale,
  Shield,
  Users,
  Mountain,
  Handshake,
  Droplets,
  Scroll,
  Moon,
  Hourglass,
  Crown,
  Feather,
  Flame,
  Eye,
  Key,
  Waves,
  TreePine,
  Wheat,
  Zap,
  Gem,
  Award,
  ShieldCheck,
  Radio,
  Lock,
} from 'lucide-react';

export interface ThematicIconItem {
  icon: React.ReactNode;
  label: string;
  colorClass?: string;
}

/**
 * High-recognition Guidance Lantern component crafted specifically for Surah Al-Fatihah
 * representing the beacon of divine light and guidance on Sirat al-Mustaqim.
 */
export const GuidanceLanternIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Hanging Ring & Top Cap */}
    <path d="M12 2v2" />
    <path d="M8 4h8l1.5 3.5h-11L8 4z" fill="currentColor" fillOpacity="0.25" />
    {/* Glass Chamber with Radiant Flame */}
    <path d="M6.5 7.5h11l-1.5 8h-8l-1.5-8z" />
    <path
      d="M12 9.5c-.8 1-1.2 1.8-1.2 2.5a1.2 1.2 0 0 0 2.4 0c0-.7-.4-1.5-1.2-2.5z"
      fill="currentColor"
    />
    {/* Base Pedestal */}
    <path d="M7.5 15.5h9l1 3h-11l1-3z" fill="currentColor" fillOpacity="0.25" />
    <path d="M9.5 18.5v2.5h5v-2.5" />
    {/* Light Glow Rays */}
    <line x1="3" y1="11.5" x2="4.5" y2="11.5" strokeOpacity="0.8" />
    <line x1="19.5" y1="11.5" x2="21" y2="11.5" strokeOpacity="0.8" />
  </svg>
);

export interface SurahThematicProfile {
  number: number;
  name: string;
  arabicName: string;
  subtitle: string;
  coreThemes: string[];
  primaryThematicIcon: ThematicIconItem;
  themeIcons: ThematicIconItem[];
  landmarkName: string;
  landmarkEmoji: string;
  landmarkType: 'gateway' | 'citadel' | 'mountain' | 'palace' | 'oasis' | 'observatory' | 'cavern' | 'sanctuary' | 'bastion' | 'portal';
  palette: {
    bgGradient: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
    glowColor: string;
    checkpointBg: string;
    accentColor: string;
    ringColor: string;
  };
  arabicSnippet: string;
  translationSnippet: string;
  description: string;
  totalAyahs: number;
  juzNumber: number;
}

/**
 * Registry of Surah Thematic Profiles mapping Surah Numbers to their core theological
 * themes, custom architectural landmarks, and distinctive Lucide iconography.
 */
export const SURAH_THEMATIC_REGISTRY: Record<number, SurahThematicProfile> = {
  // Surah 1: Al-Fatihah (The Opening)
  1: {
    number: 1,
    name: 'Al-Fatihah',
    arabicName: 'سُورَةُ الفَاتِحَة',
    subtitle: 'The Opening',
    coreThemes: ['Guidance (Sirat al-Mustaqim)', 'Sincere Worship', 'Divine Praise & Mercy'],
    primaryThematicIcon: {
      icon: <GuidanceLanternIcon className="w-4 h-4" />,
      label: 'Guidance Lantern',
      colorClass: 'text-amber-300',
    },
    themeIcons: [
      { icon: <GuidanceLanternIcon className="w-3.5 h-3.5" />, label: 'Guidance Lantern (Sirat al-Mustaqim)', colorClass: 'text-amber-300' },
      { icon: <Compass className="w-3.5 h-3.5" />, label: 'Straight Path', colorClass: 'text-yellow-300' },
      { icon: <Heart className="w-3.5 h-3.5 fill-pink-400/80 text-pink-300" />, label: 'Pure Worship', colorClass: 'text-pink-300' },
      { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Divine Mercy & Grace', colorClass: 'text-yellow-200' },
    ],
    landmarkName: 'Golden Sunrise Gateway',
    landmarkEmoji: '⛩️',
    landmarkType: 'gateway',
    palette: {
      bgGradient: 'from-amber-50/90 via-white to-amber-100/60',
      borderColor: 'border-amber-300',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-900',
      glowColor: 'rgba(217, 119, 6, 0.25)',
      checkpointBg: 'bg-amber-500',
      accentColor: '#d97706',
      ringColor: 'ring-amber-400/40',
    },
    arabicSnippet: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ • ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
    translationSnippet: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds.',
    description: 'The foundation of revelation—establishing prayer, divine sovereignty, and the eternal prayer for the straight path.',
    totalAyahs: 7,
    juzNumber: 1,
  },

  // Surah 2: Al-Baqarah (The Cow)
  2: {
    number: 2,
    name: 'Al-Baqarah',
    arabicName: 'سُورَةُ البَقَرَة',
    subtitle: 'The Cow',
    coreThemes: ['Foundations of Faith', 'Divine Legislation & Justice', 'Spiritual Shield (Ayat al-Kursi)', 'Building the Ummah'],
    primaryThematicIcon: {
      icon: <BookOpen className="w-4 h-4" />,
      label: 'Scripture & Shield',
      colorClass: 'text-emerald-700',
    },
    themeIcons: [
      { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Guidance Without Doubt', colorClass: 'text-emerald-700' },
      { icon: <Scale className="w-3.5 h-3.5" />, label: 'Justice & Divine Law', colorClass: 'text-teal-700' },
      { icon: <Shield className="w-3.5 h-3.5" />, label: 'Spiritual Armor (Ayat al-Kursi)', colorClass: 'text-emerald-700' },
      { icon: <Users className="w-3.5 h-3.5" />, label: 'Community & Covenant', colorClass: 'text-emerald-600' },
    ],
    landmarkName: 'Sandstone Citadel of Knowledge',
    landmarkEmoji: '🕌',
    landmarkType: 'citadel',
    palette: {
      bgGradient: 'from-emerald-50/90 via-white to-emerald-100/60',
      borderColor: 'border-emerald-300',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-900',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      checkpointBg: 'bg-emerald-600',
      accentColor: '#059669',
      ringColor: 'ring-emerald-400/40',
    },
    arabicSnippet: 'رَبَّنَا وَٱجْعَلْنَا مُسْلِمَيْنِ لَكَ وَمِن ذُرِّيَّتِنَآ أُمَّةً مُّسْلِمَةً لَّكَ',
    translationSnippet: 'Our Lord, and make us Muslims [in submission] to You and from our descendants a Muslim nation [in submission] to You.',
    description: 'The great citadel of faith encompassing covenants of Ibrahim, moral fortitude, legal architecture, and comprehensive spiritual protection.',
    totalAyahs: 286,
    juzNumber: 1,
  },

  // Surah 3: Aal 'Imran (The Family of Imran)
  3: {
    number: 3,
    name: "Aal 'Imran",
    arabicName: 'سُورَةُ آلِ عِمْرَان',
    subtitle: 'The Family of Imran',
    coreThemes: ['Steadfastness in Adversity', 'Battle of Uhud Lessons', 'Devotion of Maryam & Zakariya', 'Firmness in Truth'],
    primaryThematicIcon: {
      icon: <Mountain className="w-4 h-4" />,
      label: 'Mount Uhud Sabr',
      colorClass: 'text-amber-700',
    },
    themeIcons: [
      { icon: <Mountain className="w-3.5 h-3.5" />, label: 'Steadfast Mount Uhud', colorClass: 'text-amber-700' },
      { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Endurance & Sabr', colorClass: 'text-amber-700' },
      { icon: <Sun className="w-3.5 h-3.5" />, label: 'Clear Proofs & Bayyinat', colorClass: 'text-orange-700' },
      { icon: <Heart className="w-3.5 h-3.5 fill-amber-500/80 text-amber-600" />, label: 'Devotion of Family of Imran', colorClass: 'text-orange-600' },
    ],
    landmarkName: 'Mount Uhud Slopes of Perseverance',
    landmarkEmoji: '🏔️',
    landmarkType: 'mountain',
    palette: {
      bgGradient: 'from-amber-50/90 via-white to-orange-100/60',
      borderColor: 'border-amber-300',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-900',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      checkpointBg: 'bg-amber-600',
      accentColor: '#d97706',
      ringColor: 'ring-amber-500/40',
    },
    arabicSnippet: 'قُلْ إِن كُنتُمْ تُحِبُّونَ ٱللَّهَ فَٱتَّبِعُونِى يُحْبِبْكُمُ ٱللَّهُ',
    translationSnippet: 'Say, [O Muhammad], "If you should love Allah, then follow me, [so] Allah will love you and forgive you your sins."',
    description: 'A steadfast bastion teaching resilience against trials, spiritual unity, and profound trust in the divine decree during moments of hardship.',
    totalAyahs: 200,
    juzNumber: 3,
  },

  // Surah 4: An-Nisa' (The Women)
  4: {
    number: 4,
    name: "An-Nisa'",
    arabicName: 'سُورَةُ النِّسَاء',
    subtitle: 'The Women',
    coreThemes: ['Universal Justice & Equity', 'Protection of Orphans & Women', 'Family Sanctity & Inheritance', 'Sacred Covenants'],
    primaryThematicIcon: {
      icon: <Scale className="w-4 h-4" />,
      label: 'Scale of Equity',
      colorClass: 'text-sky-700',
    },
    themeIcons: [
      { icon: <Scale className="w-3.5 h-3.5" />, label: 'Absolute Justice & Equity', colorClass: 'text-sky-700' },
      { icon: <Users className="w-3.5 h-3.5" />, label: 'Family & Orphan Protection', colorClass: 'text-cyan-700' },
      { icon: <Scroll className="w-3.5 h-3.5" />, label: 'Sacred Treaties & Rights', colorClass: 'text-blue-700' },
      { icon: <Heart className="w-3.5 h-3.5 fill-cyan-500/80 text-cyan-600" />, label: 'Kinship & Social Compassion', colorClass: 'text-cyan-700' },
    ],
    landmarkName: 'Sapphire Mosque of Equity',
    landmarkEmoji: '🏰',
    landmarkType: 'palace',
    palette: {
      bgGradient: 'from-sky-50/90 via-white to-blue-100/60',
      borderColor: 'border-sky-300',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-900',
      glowColor: 'rgba(56, 189, 248, 0.25)',
      checkpointBg: 'bg-sky-600',
      accentColor: '#0284c7',
      ringColor: 'ring-sky-400/40',
    },
    arabicSnippet: 'يَـٰٓأَيُّهَا ٱلنَّاسُ ٱتَّقُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُم مِّن نَّفْسٍ وَٰحِدَةٍ',
    translationSnippet: 'O mankind, fear your Lord, who created you from one soul and created from it its mate and dispersed from both of them many men and women.',
    description: 'A monument of social justice establishing fundamental rights for the vulnerable, fair inheritance, and harmonious community governance.',
    totalAyahs: 176,
    juzNumber: 4,
  },

  // Surah 5: Al-Ma'idah (The Table Spread)
  5: {
    number: 5,
    name: "Al-Ma'idah",
    arabicName: 'سُورَةُ المَائِدَة',
    subtitle: 'The Table Spread',
    coreThemes: ['Fulfilling Contracts', 'Purity & Ritual Wudu', 'Perfection of Islam', 'The Heavenly Table'],
    primaryThematicIcon: {
      icon: <Handshake className="w-4 h-4" />,
      label: 'Sacred Covenants',
      colorClass: 'text-teal-700',
    },
    themeIcons: [
      { icon: <Handshake className="w-3.5 h-3.5" />, label: 'Sacred Contracts & Treaties', colorClass: 'text-emerald-700' },
      { icon: <Droplets className="w-3.5 h-3.5 text-teal-600" />, label: 'Ritual Purification (Wudu)', colorClass: 'text-teal-700' },
      { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Perfected Religion', colorClass: 'text-emerald-700' },
      { icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />, label: 'Heavenly Table Blessings', colorClass: 'text-amber-700' },
    ],
    landmarkName: 'Bedouin Oasis of Abundant Grace',
    landmarkEmoji: '🎪',
    landmarkType: 'oasis',
    palette: {
      bgGradient: 'from-teal-50/90 via-white to-emerald-100/60',
      borderColor: 'border-teal-300',
      badgeBg: 'bg-teal-100',
      badgeText: 'text-teal-900',
      glowColor: 'rgba(52, 211, 153, 0.25)',
      checkpointBg: 'bg-teal-600',
      accentColor: '#0d9488',
      ringColor: 'ring-teal-500/40',
    },
    arabicSnippet: 'ٱلْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِى',
    translationSnippet: 'This day I have perfected for you your religion and completed My favor upon you and have approved for you Islam as your religion.',
    description: 'The oasis of completed revelation, detailing legal contracts, lawful sustenance, cleanliness, and the historic covenant of the Table Spread.',
    totalAyahs: 120,
    juzNumber: 6,
  },

  // Surah 6: Al-An'am (The Cattle)
  6: {
    number: 6,
    name: "Al-An'am",
    arabicName: 'سُورَةُ الأَنْعَام',
    subtitle: 'The Cattle',
    coreThemes: ['Cosmic Monotheism (Tawhid)', 'Signs in the Heavens & Earth', 'Dialogue of Prophet Ibrahim'],
    primaryThematicIcon: {
      icon: <Sun className="w-4 h-4" />,
      label: 'Cosmic Signs',
      colorClass: 'text-purple-700',
    },
    themeIcons: [
      { icon: <Sun className="w-3.5 h-3.5" />, label: 'Cosmic Creation of Light', colorClass: 'text-amber-600' },
      { icon: <Eye className="w-3.5 h-3.5" />, label: 'Contemplating the Signs', colorClass: 'text-purple-700' },
      { icon: <Compass className="w-3.5 h-3.5" />, label: 'Pure Monotheism (Hanif)', colorClass: 'text-orange-600' },
      { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Celestial Wonders', colorClass: 'text-yellow-600' },
    ],
    landmarkName: 'Obsidian Star Observatory',
    landmarkEmoji: '🔭',
    landmarkType: 'observatory',
    palette: {
      bgGradient: 'from-purple-50/90 via-white to-fuchsia-100/60',
      borderColor: 'border-purple-300',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-900',
      glowColor: 'rgba(232, 121, 249, 0.25)',
      checkpointBg: 'bg-purple-600',
      accentColor: '#7c3aed',
      ringColor: 'ring-purple-400/40',
    },
    arabicSnippet: 'وَهُوَ ٱلَّذِى جَعَلَ لَكُمُ ٱلنُّجُومَ لِتَهْتَدُوا۟ بِهَا فِى ظُلُمَـٰتِ ٱلْبَرِّ وَٱلْبَحْرِ',
    translationSnippet: 'And it is He who placed for you the stars that you may be guided by them through the darknesses of the land and sea.',
    description: 'A deep cosmological reflection calling mankind to observe constellations, seed germination, and the undeniable signs of the Creator.',
    totalAyahs: 165,
    juzNumber: 7,
  },

  // Surah 12: Yusuf (Joseph)
  12: {
    number: 12,
    name: 'Yusuf',
    arabicName: 'سُورَةُ يُوسُف',
    subtitle: 'Joseph',
    coreThemes: ['Beautiful Patience (Sabrun Jameel)', 'Dreams & Divine Providence', 'Elevation from Well to Crown'],
    primaryThematicIcon: {
      icon: <Crown className="w-4 h-4" />,
      label: 'Crown of Patience',
      colorClass: 'text-indigo-700',
    },
    themeIcons: [
      { icon: <Moon className="w-3.5 h-3.5" />, label: 'Eleven Stars & Dream Vision', colorClass: 'text-indigo-700' },
      { icon: <Crown className="w-3.5 h-3.5" />, label: 'Royal Elevation', colorClass: 'text-amber-600' },
      { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Beautiful Patience (Sabrun Jameel)', colorClass: 'text-yellow-600' },
      { icon: <Wheat className="w-3.5 h-3.5" />, label: 'Wisdom in Abundance & Scarcity', colorClass: 'text-amber-700' },
    ],
    landmarkName: 'Starlit Palace of Dreams',
    landmarkEmoji: '🌾',
    landmarkType: 'palace',
    palette: {
      bgGradient: 'from-indigo-50/90 via-white to-amber-100/60',
      borderColor: 'border-indigo-300',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-900',
      glowColor: 'rgba(251, 191, 36, 0.25)',
      checkpointBg: 'bg-indigo-600',
      accentColor: '#4f46e5',
      ringColor: 'ring-indigo-400/40',
    },
    arabicSnippet: 'إِنَّهُۥ مَن يَتَّقِ وَيَصْبِرْ فَإِنَّ ٱللَّهَ لَا يُضِيعُ أَجْرَ ٱلْمُحْسِنِينَ',
    translationSnippet: 'Indeed, he who fears Allah and is patient, then indeed, Allah does not allow to be lost the reward of those who do good.',
    description: 'The best of stories revealing how adversity transforms into triumph through steadfast patience, purity of heart, and unwavering trust.',
    totalAyahs: 111,
    juzNumber: 12,
  },

  // Surah 18: Al-Kahf (The Cave)
  18: {
    number: 18,
    name: 'Al-Kahf',
    arabicName: 'سُورَةُ الكَهْف',
    subtitle: 'The Cave',
    coreThemes: ['Sanctuary from Fitnah', 'Companions of the Cave', 'Wisdom of Musa & Khidr', 'Dhul-Qarnayn Power & Justice'],
    primaryThematicIcon: {
      icon: <Shield className="w-4 h-4" />,
      label: 'Cave Sanctuary',
      colorClass: 'text-amber-700',
    },
    themeIcons: [
      { icon: <Shield className="w-3.5 h-3.5" />, label: 'Sanctuary from Trials (Fitnah)', colorClass: 'text-amber-700' },
      { icon: <Mountain className="w-3.5 h-3.5" />, label: 'Sacred Cave Shelter', colorClass: 'text-orange-700' },
      { icon: <Compass className="w-3.5 h-3.5" />, label: 'Hidden Wisdom of Khidr', colorClass: 'text-emerald-700' },
      { icon: <Sun className="w-3.5 h-3.5" />, label: 'Light from Friday to Friday', colorClass: 'text-yellow-600' },
    ],
    landmarkName: 'Golden Cavern of the Seven Sleepers',
    landmarkEmoji: '⛰️',
    landmarkType: 'cavern',
    palette: {
      bgGradient: 'from-amber-50/90 via-white to-amber-100/70',
      borderColor: 'border-amber-300',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-900',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      checkpointBg: 'bg-amber-600',
      accentColor: '#d97706',
      ringColor: 'ring-amber-500/40',
    },
    arabicSnippet: 'إِنَّهُمْ فِتْيَةٌ ءَامَنُوا۟ بِرَبِّهِمْ وَزِدْنَـٰهُمْ هُدًۭى',
    translationSnippet: 'Indeed, they were youths who believed in their Lord, and We increased them in guidance.',
    description: 'A luminous sanctuary illuminated every Friday to shield the believer from the greatest trials of faith, wealth, knowledge, and power.',
    totalAyahs: 110,
    juzNumber: 15,
  },

  // Surah 36: Ya-Sin (The Heart of the Quran)
  36: {
    number: 36,
    name: 'Ya-Sin',
    arabicName: 'سُورَةُ يس',
    subtitle: 'The Heart of the Quran',
    coreThemes: ['Heart of Revelation', 'Proofs of Resurrection', 'Signs of Sun, Moon & Ships'],
    primaryThematicIcon: {
      icon: <Heart className="w-4 h-4 fill-rose-500/80 text-rose-600" />,
      label: 'Heart of Quran',
      colorClass: 'text-rose-700',
    },
    themeIcons: [
      { icon: <Heart className="w-3.5 h-3.5 fill-rose-500/80 text-rose-600" />, label: 'Heart of the Quran', colorClass: 'text-rose-700' },
      { icon: <Hourglass className="w-3.5 h-3.5" />, label: 'The Resurrection & Kun Fayakun', colorClass: 'text-amber-700' },
      { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Divine Cosmic Order', colorClass: 'text-yellow-600' },
      { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Clear Warning (Balagh)', colorClass: 'text-rose-700' },
    ],
    landmarkName: 'Crimson Heart Sanctuary',
    landmarkEmoji: '🏮',
    landmarkType: 'sanctuary',
    palette: {
      bgGradient: 'from-rose-50/90 via-white to-pink-100/60',
      borderColor: 'border-rose-300',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-900',
      glowColor: 'rgba(251, 113, 133, 0.25)',
      checkpointBg: 'bg-rose-600',
      accentColor: '#e11d48',
      ringColor: 'ring-rose-400/40',
    },
    arabicSnippet: 'إِنَّمَآ أَمْرُهُۥٓ إِذَآ أَرَادَ شَيْـًٔا أَن يَقُولَ لَهُۥ كُن فَيَكُونُ',
    translationSnippet: 'His command is only when He intends a thing that He says to it, "Be," and it is.',
    description: 'The pulsing heart of the scripture, awakening the human soul with vivid reminders of life after death and divine omnipotence.',
    totalAyahs: 83,
    juzNumber: 22,
  },

  // Surah 55: Ar-Rahman (The All-Merciful)
  55: {
    number: 55,
    name: 'Ar-Rahman',
    arabicName: 'سُورَةُ الرَّحْمَـٰن',
    subtitle: 'The All-Merciful',
    coreThemes: ['Endless Blessings', 'The Two Meeting Seas', 'Twin Paradises of Coral & Pearl'],
    primaryThematicIcon: {
      icon: <Waves className="w-4 h-4" />,
      label: 'Two Meeting Seas',
      colorClass: 'text-cyan-700',
    },
    themeIcons: [
      { icon: <Waves className="w-3.5 h-3.5" />, label: 'Two Meeting Seas (Maraja al-Bahrayn)', colorClass: 'text-cyan-700' },
      { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Which Favors will you deny?', colorClass: 'text-emerald-700' },
      { icon: <TreePine className="w-3.5 h-3.5" />, label: 'Twin Gardens of Paradise', colorClass: 'text-emerald-700' },
      { icon: <Heart className="w-3.5 h-3.5 fill-teal-500/80 text-teal-600" />, label: 'Infinite Divine Compassion', colorClass: 'text-teal-700' },
    ],
    landmarkName: 'Twin Gardens of Coral & Pearl',
    landmarkEmoji: '🏝️',
    landmarkType: 'oasis',
    palette: {
      bgGradient: 'from-cyan-50/90 via-white to-teal-100/60',
      borderColor: 'border-cyan-300',
      badgeBg: 'bg-cyan-100',
      badgeText: 'text-cyan-900',
      glowColor: 'rgba(45, 212, 191, 0.25)',
      checkpointBg: 'bg-teal-600',
      accentColor: '#0891b2',
      ringColor: 'ring-teal-400/40',
    },
    arabicSnippet: 'فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ',
    translationSnippet: 'So which of the favors of your Lord would you deny?',
    description: 'A majestic hymn celebrating the boundless blessings woven into the fabric of creation, from oceanic depths to gardens of eternal bliss.',
    totalAyahs: 78,
    juzNumber: 27,
  },

  // Surah 67: Al-Mulk (The Dominion)
  67: {
    number: 67,
    name: 'Al-Mulk',
    arabicName: 'سُورَةُ المُلْك',
    subtitle: 'The Dominion',
    coreThemes: ['Sovereignty over Life & Death', 'Flawless Seven Heavens', 'Shield from the Grave'],
    primaryThematicIcon: {
      icon: <Crown className="w-4 h-4" />,
      label: 'Supreme Dominion',
      colorClass: 'text-violet-700',
    },
    themeIcons: [
      { icon: <Crown className="w-3.5 h-3.5" />, label: 'Supreme Dominion (Mulk)', colorClass: 'text-violet-700' },
      { icon: <Shield className="w-3.5 h-3.5" />, label: 'Intercessor in the Grave', colorClass: 'text-purple-700' },
      { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Flawless Canopy of Creation', colorClass: 'text-yellow-600' },
      { icon: <Hourglass className="w-3.5 h-3.5" />, label: 'Trial of Life and Death', colorClass: 'text-amber-700' },
    ],
    landmarkName: 'Royal Bastion of the Seven Heavens',
    landmarkEmoji: '👑',
    landmarkType: 'bastion',
    palette: {
      bgGradient: 'from-violet-50/90 via-white to-purple-100/60',
      borderColor: 'border-violet-300',
      badgeBg: 'bg-violet-100',
      badgeText: 'text-violet-900',
      glowColor: 'rgba(168, 85, 247, 0.25)',
      checkpointBg: 'bg-violet-600',
      accentColor: '#7c3aed',
      ringColor: 'ring-purple-400/40',
    },
    arabicSnippet: 'تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌ',
    translationSnippet: 'Blessed is He in whose hand is dominion, and He is over all things competent.',
    description: 'The nightly protector that intercedes for its reciter, revealing the flawless architecture of cosmic space and accountability.',
    totalAyahs: 30,
    juzNumber: 29,
  },

  // Surah 112: Al-Ikhlas (Purity of Faith)
  112: {
    number: 112,
    name: 'Al-Ikhlas',
    arabicName: 'سُورَةُ الإِخْلَاص',
    subtitle: 'Purity of Faith',
    coreThemes: ['Absolute Monotheism (Tawhid)', 'As-Samad (The Eternal Refuge)', 'Equal to One-Third of Quran'],
    primaryThematicIcon: {
      icon: <Gem className="w-4 h-4" />,
      label: 'Diamond of Tawhid',
      colorClass: 'text-sky-700',
    },
    themeIcons: [
      { icon: <Gem className="w-3.5 h-3.5" />, label: 'Pure Diamond of Tawhid', colorClass: 'text-sky-700' },
      { icon: <Shield className="w-3.5 h-3.5" />, label: 'Eternal Refuge (As-Samad)', colorClass: 'text-amber-700' },
      { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Absolute Uniqueness', colorClass: 'text-yellow-600' },
    ],
    landmarkName: 'Crystal Monolith of Pure Tawhid',
    landmarkEmoji: '💎',
    landmarkType: 'sanctuary',
    palette: {
      bgGradient: 'from-sky-50/90 via-white to-cyan-100/60',
      borderColor: 'border-sky-300',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-900',
      glowColor: 'rgba(56, 189, 248, 0.25)',
      checkpointBg: 'bg-sky-600',
      accentColor: '#0284c7',
      ringColor: 'ring-sky-400/40',
    },
    arabicSnippet: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ • ٱللَّهُ ٱلصَّمَدُ',
    translationSnippet: 'Say, "He is Allah, [who is] One, Allah, the Eternal Refuge."',
    description: 'The supreme essence of monotheism—crystallizing the pure, indivisible oneness of Allah in four profound verses.',
    totalAyahs: 4,
    juzNumber: 30,
  },

  // Special Milestone: Juz' 30 (Amma Part)
  30: {
    number: 30,
    name: "Juz' 30",
    arabicName: 'جُزْءُ عَمَّ',
    subtitle: 'The Final Horizons',
    coreThemes: ['Cosmic Tremors & The Hour', 'Dawn of Eternity', 'Sincerity & Divine Refuge'],
    primaryThematicIcon: {
      icon: <Hourglass className="w-4 h-4" />,
      label: 'Great Announcement',
      colorClass: 'text-purple-700',
    },
    themeIcons: [
      { icon: <Hourglass className="w-3.5 h-3.5" />, label: 'The Great Announcement (An-Naba)', colorClass: 'text-purple-700' },
      { icon: <Moon className="w-3.5 h-3.5" />, label: 'Splitting Sky & Night Reflection', colorClass: 'text-indigo-700' },
      { icon: <Shield className="w-3.5 h-3.5" />, label: 'Divine Refuge (Mu\'awwidhatayn)', colorClass: 'text-purple-700' },
      { icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />, label: 'The Golden Dawn (Al-Fajr)', colorClass: 'text-amber-700' },
    ],
    landmarkName: 'Celestial Starlight Portal',
    landmarkEmoji: '🌌',
    landmarkType: 'portal',
    palette: {
      bgGradient: 'from-purple-50/90 via-white to-indigo-100/60',
      borderColor: 'border-purple-300',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-900',
      glowColor: 'rgba(192, 132, 252, 0.25)',
      checkpointBg: 'bg-purple-600',
      accentColor: '#7c3aed',
      ringColor: 'ring-purple-400/40',
    },
    arabicSnippet: 'عَمَّ يَتَسَآءَلُونَ • عَنِ ٱلنَّبَإِ ٱلْعَظِيمِ',
    translationSnippet: 'About what are they asking one another? About the great news, that over which they are in disagreement.',
    description: 'The cosmic culmination of thirty chapters—echoing with rhythmic warnings, vivid depictions of the Last Day, and timeless protection.',
    totalAyahs: 564,
    juzNumber: 30,
  },
};

/**
 * Helper to dynamically generate a complete Surah Thematic Profile for ANY Surah number (1-114).
 * If a custom profile exists in the registry, it is used. Otherwise, an intelligent thematic
 * profile is synthesized based on classical Quranic classification and themes.
 */
export function getSurahThematicProfile(surahNumber: number): SurahThematicProfile {
  if (SURAH_THEMATIC_REGISTRY[surahNumber]) {
    return SURAH_THEMATIC_REGISTRY[surahNumber];
  }

  // Meccan vs Medinan algorithmic heuristic for remaining Surahs
  const isMedinan = [2, 3, 4, 5, 8, 9, 22, 24, 33, 47, 48, 49, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 110].includes(surahNumber);

  // Look up Surah metadata from canonical database
  const surahMeta = ALL_114_SURAHS.find((s) => s.number === surahNumber) || ALL_114_SURAHS[surahNumber - 1];
  const surahName = surahMeta?.name || `Surah ${surahNumber}`;
  const surahArabicName = surahMeta?.arabicName ? `سُورَةُ ${surahMeta.arabicName}` : `سُورَةُ رَقْم ${surahNumber}`;
  const surahSubtitle = surahMeta?.translation || (isMedinan ? 'Medinan Chapter' : 'Meccan Chapter');
  const totalAyahs = surahMeta?.totalAyahs || 40;
  const juzNum = surahMeta?.juzNumber || Math.min(30, Math.ceil(surahNumber / 4));

  if (isMedinan) {
    return {
      number: surahNumber,
      name: surahName,
      arabicName: surahArabicName,
      subtitle: surahSubtitle,
      coreThemes: ['Community Law', 'Social Justice', 'Covenant & Peace', 'Spiritual Unity'],
      primaryThematicIcon: {
        icon: <Scale className="w-4 h-4" />,
        label: 'Social Justice',
        colorClass: 'text-teal-700',
      },
      themeIcons: [
        { icon: <Scale className="w-3.5 h-3.5" />, label: 'Social Justice & Legislation', colorClass: 'text-teal-700' },
        { icon: <Users className="w-3.5 h-3.5" />, label: 'Community Unity (Ummah)', colorClass: 'text-emerald-700' },
        { icon: <Shield className="w-3.5 h-3.5" />, label: 'Fortitude & Defense', colorClass: 'text-sky-700' },
      ],
      landmarkName: `Citadel of Medina • Station ${surahNumber}`,
      landmarkEmoji: '🏛️',
      landmarkType: 'citadel',
      palette: {
        bgGradient: 'from-emerald-50/90 via-white to-emerald-100/60',
        borderColor: 'border-emerald-300',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-900',
        glowColor: 'rgba(16, 185, 129, 0.25)',
        checkpointBg: 'bg-emerald-600',
        accentColor: '#059669',
        ringColor: 'ring-emerald-400/40',
      },
      arabicSnippet: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      translationSnippet: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      description: `A chapter revealed in Madinah (${surahName}), emphasizing divine law, moral integrity, community brotherhood, and worship of Allah.`,
      totalAyahs: totalAyahs,
      juzNumber: juzNum,
    };
  }

  // Meccan Chapter default
  return {
    number: surahNumber,
    name: surahName,
    arabicName: surahArabicName,
    subtitle: surahSubtitle,
    coreThemes: ['Purity of Faith (Tawhid)', 'The Hereafter', 'Prophetic Reminders', 'Patience'],
    primaryThematicIcon: {
      icon: <GuidanceLanternIcon className="w-4 h-4" />,
      label: 'Guidance & Faith',
      colorClass: 'text-amber-700',
    },
    themeIcons: [
      { icon: <GuidanceLanternIcon className="w-3.5 h-3.5" />, label: 'Guidance & Faith', colorClass: 'text-amber-700' },
      { icon: <Compass className="w-3.5 h-3.5" />, label: 'Pure Faith (Tawhid)', colorClass: 'text-amber-700' },
      { icon: <Hourglass className="w-3.5 h-3.5" />, label: 'The Hereafter & Accountability', colorClass: 'text-purple-700' },
      { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Prophetic Signs & Reflection', colorClass: 'text-yellow-600' },
    ],
    landmarkName: 'Sanctuary of Makkah',
    landmarkEmoji: '⛰️',
    landmarkType: 'sanctuary',
    palette: {
      bgGradient: 'from-amber-50/90 via-white to-indigo-50/60',
      borderColor: 'border-amber-300',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-900',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      checkpointBg: 'bg-amber-600',
      accentColor: '#d97706',
      ringColor: 'ring-amber-400/40',
    },
    arabicSnippet: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    translationSnippet: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    description: `An early Meccan chapter (${surahName}) calling humanity to contemplate the signs of creation, sincere monotheism, and eternal life.`,
    totalAyahs: totalAyahs,
    juzNumber: juzNum,
  };
}
