/**
 * Full Quran Metadata: 114 Surahs & 30 Juz
 */

export interface SurahMeta {
  number: number;
  name: string;
  transliteration: string;
  arabicName: string;
  translation: string;
  totalAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  juzNumber: number;
  pageNumber: number;
  memorizedAyahs?: number;
  status?: 'completed' | 'active' | 'in_review' | 'locked';
}

export interface JuzMeta {
  number: number;
  name: string;
  arabicName: string;
  startSurah: string;
  startAyah: number;
  endSurah: string;
  endAyah: number;
  totalVerses: number;
  memorizedVerses: number;
}

export const toArabicNumerals = (num: number): string => {
  return num.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
};

export const ALL_114_SURAHS: SurahMeta[] = [
  { number: 1, name: 'Al-Fatiha', transliteration: 'Al-Fātiḥah', arabicName: 'الفاتحة', translation: 'The Opening', totalAyahs: 7, revelationType: 'Meccan', juzNumber: 1, pageNumber: 1, memorizedAyahs: 7, status: 'completed' },
  { number: 2, name: 'Al-Baqarah', transliteration: 'Al-Baqarah', arabicName: 'البقرة', translation: 'The Cow', totalAyahs: 286, revelationType: 'Medinan', juzNumber: 1, pageNumber: 2, memorizedAyahs: 20, status: 'active' },
  { number: 3, name: 'Aal-Imran', transliteration: 'Āl \'Imrān', arabicName: 'آل عمران', translation: 'Family of Imran', totalAyahs: 200, revelationType: 'Medinan', juzNumber: 3, pageNumber: 50, memorizedAyahs: 0, status: 'locked' },
  { number: 4, name: 'An-Nisa', transliteration: 'An-Nisā\'', arabicName: 'النساء', translation: 'The Women', totalAyahs: 176, revelationType: 'Medinan', juzNumber: 4, pageNumber: 77, memorizedAyahs: 0, status: 'locked' },
  { number: 5, name: 'Al-Ma\'idah', transliteration: 'Al-Mā\'idah', arabicName: 'المائدة', translation: 'The Table Spread', totalAyahs: 120, revelationType: 'Medinan', juzNumber: 6, pageNumber: 106, memorizedAyahs: 0, status: 'locked' },
  { number: 6, name: 'Al-An\'am', transliteration: 'Al-An\'ām', arabicName: 'الأنعام', translation: 'The Cattle', totalAyahs: 165, revelationType: 'Meccan', juzNumber: 7, pageNumber: 128, memorizedAyahs: 0, status: 'locked' },
  { number: 7, name: 'Al-A\'raf', transliteration: 'Al-A\'rāf', arabicName: 'الأعراف', translation: 'The Heights', totalAyahs: 206, revelationType: 'Meccan', juzNumber: 8, pageNumber: 151, memorizedAyahs: 0, status: 'locked' },
  { number: 8, name: 'Al-Anfal', transliteration: 'Al-Anfāl', arabicName: 'الأنفال', translation: 'The Spoils of War', totalAyahs: 75, revelationType: 'Medinan', juzNumber: 9, pageNumber: 177, memorizedAyahs: 0, status: 'locked' },
  { number: 9, name: 'At-Tawbah', transliteration: 'At-Tawbah', arabicName: 'التوبة', translation: 'The Repentance', totalAyahs: 129, revelationType: 'Medinan', juzNumber: 10, pageNumber: 187, memorizedAyahs: 0, status: 'locked' },
  { number: 10, name: 'Yunus', transliteration: 'Yūnus', arabicName: 'يونس', translation: 'Jonah', totalAyahs: 109, revelationType: 'Meccan', juzNumber: 11, pageNumber: 208, memorizedAyahs: 0, status: 'locked' },
  { number: 11, name: 'Hud', transliteration: 'Hūd', arabicName: 'هود', translation: 'Hud', totalAyahs: 123, revelationType: 'Meccan', juzNumber: 11, pageNumber: 221, memorizedAyahs: 0, status: 'locked' },
  { number: 12, name: 'Yusuf', transliteration: 'Yūsuf', arabicName: 'يوسف', translation: 'Joseph', totalAyahs: 111, revelationType: 'Meccan', juzNumber: 12, pageNumber: 235, memorizedAyahs: 0, status: 'locked' },
  { number: 13, name: 'Ar-Ra\'d', transliteration: 'Ar-Ra\'d', arabicName: 'الرعد', translation: 'The Thunder', totalAyahs: 43, revelationType: 'Medinan', juzNumber: 13, pageNumber: 249, memorizedAyahs: 0, status: 'locked' },
  { number: 14, name: 'Ibrahim', transliteration: 'Ibrāhīm', arabicName: 'إبراهيم', translation: 'Abraham', totalAyahs: 52, revelationType: 'Meccan', juzNumber: 13, pageNumber: 255, memorizedAyahs: 0, status: 'locked' },
  { number: 15, name: 'Al-Hijr', transliteration: 'Al-Hijr', arabicName: 'الحجر', translation: 'The Rocky Tract', totalAyahs: 99, revelationType: 'Meccan', juzNumber: 14, pageNumber: 262, memorizedAyahs: 0, status: 'locked' },
  { number: 16, name: 'An-Nahl', transliteration: 'An-Naḥl', arabicName: 'النحل', translation: 'The Bee', totalAyahs: 128, revelationType: 'Meccan', juzNumber: 14, pageNumber: 267, memorizedAyahs: 0, status: 'locked' },
  { number: 17, name: 'Al-Isra', transliteration: 'Al-Isrā\'', arabicName: 'الإسراء', translation: 'The Night Journey', totalAyahs: 111, revelationType: 'Meccan', juzNumber: 15, pageNumber: 282, memorizedAyahs: 0, status: 'locked' },
  { number: 18, name: 'Al-Kahf', transliteration: 'Al-Kahf', arabicName: 'الكهف', translation: 'The Cave', totalAyahs: 110, revelationType: 'Meccan', juzNumber: 15, pageNumber: 293, memorizedAyahs: 10, status: 'in_review' },
  { number: 19, name: 'Maryam', transliteration: 'Maryam', arabicName: 'مريم', translation: 'Mary', totalAyahs: 98, revelationType: 'Meccan', juzNumber: 16, pageNumber: 305, memorizedAyahs: 0, status: 'locked' },
  { number: 20, name: 'Ta-Ha', transliteration: 'Ṭā-Hā', arabicName: 'طه', translation: 'Ta-Ha', totalAyahs: 135, revelationType: 'Meccan', juzNumber: 16, pageNumber: 312, memorizedAyahs: 0, status: 'locked' },
  { number: 21, name: 'Al-Anbiya', transliteration: 'Al-Anbiyā\'', arabicName: 'الأنبياء', translation: 'The Prophets', totalAyahs: 112, revelationType: 'Meccan', juzNumber: 17, pageNumber: 322, memorizedAyahs: 0, status: 'locked' },
  { number: 22, name: 'Al-Hajj', transliteration: 'Al-Ḥajj', arabicName: 'الحج', translation: 'The Pilgrimage', totalAyahs: 78, revelationType: 'Medinan', juzNumber: 17, pageNumber: 332, memorizedAyahs: 0, status: 'locked' },
  { number: 23, name: 'Al-Mu\'minun', transliteration: 'Al-Mu\'minūn', arabicName: 'المؤمنون', translation: 'The Believers', totalAyahs: 118, revelationType: 'Meccan', juzNumber: 18, pageNumber: 342, memorizedAyahs: 0, status: 'locked' },
  { number: 24, name: 'An-Nur', transliteration: 'An-Nūr', arabicName: 'النور', translation: 'The Light', totalAyahs: 64, revelationType: 'Medinan', juzNumber: 18, pageNumber: 350, memorizedAyahs: 0, status: 'locked' },
  { number: 25, name: 'Al-Furqan', transliteration: 'Al-Furqān', arabicName: 'الفرقان', translation: 'The Criterion', totalAyahs: 77, revelationType: 'Meccan', juzNumber: 18, pageNumber: 359, memorizedAyahs: 0, status: 'locked' },
  { number: 26, name: 'Ash-Shu\'ara', transliteration: 'Ash-Shu\'arā\'', arabicName: 'الشعراء', translation: 'The Poets', totalAyahs: 227, revelationType: 'Meccan', juzNumber: 19, pageNumber: 367, memorizedAyahs: 0, status: 'locked' },
  { number: 27, name: 'An-Naml', transliteration: 'An-Naml', arabicName: 'النمل', translation: 'The Ant', totalAyahs: 93, revelationType: 'Meccan', juzNumber: 19, pageNumber: 377, memorizedAyahs: 0, status: 'locked' },
  { number: 28, name: 'Al-Qasas', transliteration: 'Al-Qaṣaṣ', arabicName: 'القصص', translation: 'The Stories', totalAyahs: 88, revelationType: 'Meccan', juzNumber: 20, pageNumber: 385, memorizedAyahs: 0, status: 'locked' },
  { number: 29, name: 'Al-Ankabut', transliteration: 'Al-\'Ankabūt', arabicName: 'العنكبوت', translation: 'The Spider', totalAyahs: 69, revelationType: 'Meccan', juzNumber: 20, pageNumber: 396, memorizedAyahs: 0, status: 'locked' },
  { number: 30, name: 'Ar-Rum', transliteration: 'Ar-Rūm', arabicName: 'الروم', translation: 'The Romans', totalAyahs: 60, revelationType: 'Meccan', juzNumber: 21, pageNumber: 404, memorizedAyahs: 0, status: 'locked' },
  { number: 31, name: 'Luqman', transliteration: 'Luqmān', arabicName: 'لقمان', translation: 'Luqman', totalAyahs: 34, revelationType: 'Meccan', juzNumber: 21, pageNumber: 411, memorizedAyahs: 0, status: 'locked' },
  { number: 32, name: 'As-Sajdah', transliteration: 'As-Sajdah', arabicName: 'السجدة', translation: 'The Prostration', totalAyahs: 30, revelationType: 'Meccan', juzNumber: 21, pageNumber: 415, memorizedAyahs: 0, status: 'locked' },
  { number: 33, name: 'Al-Ahzab', transliteration: 'Al-Aḥzāb', arabicName: 'الأحزاب', translation: 'The Combined Forces', totalAyahs: 73, revelationType: 'Medinan', juzNumber: 21, pageNumber: 418, memorizedAyahs: 0, status: 'locked' },
  { number: 34, name: 'Saba', transliteration: 'Saba\'', arabicName: 'سبأ', translation: 'Sheba', totalAyahs: 54, revelationType: 'Meccan', juzNumber: 22, pageNumber: 428, memorizedAyahs: 0, status: 'locked' },
  { number: 35, name: 'Fatir', transliteration: 'Fāṭir', arabicName: 'فاطر', translation: 'Originator', totalAyahs: 45, revelationType: 'Meccan', juzNumber: 22, pageNumber: 434, memorizedAyahs: 0, status: 'locked' },
  { number: 36, name: 'Ya-Sin', transliteration: 'Yā-Sīn', arabicName: 'يس', translation: 'Ya Sin', totalAyahs: 83, revelationType: 'Meccan', juzNumber: 22, pageNumber: 440, memorizedAyahs: 0, status: 'locked' },
  { number: 37, name: 'As-Saffat', transliteration: 'Aṣ-Ṣāffāt', arabicName: 'الصافات', translation: 'Those who set the Ranks', totalAyahs: 182, revelationType: 'Meccan', juzNumber: 23, pageNumber: 446, memorizedAyahs: 0, status: 'locked' },
  { number: 38, name: 'Sad', transliteration: 'Ṣād', arabicName: 'ص', translation: 'The Letter Sad', totalAyahs: 88, revelationType: 'Meccan', juzNumber: 23, pageNumber: 453, memorizedAyahs: 0, status: 'locked' },
  { number: 39, name: 'Az-Zumar', transliteration: 'Az-Zumar', arabicName: 'الزمر', translation: 'The Troops', totalAyahs: 75, revelationType: 'Meccan', juzNumber: 23, pageNumber: 458, memorizedAyahs: 0, status: 'locked' },
  { number: 40, name: 'Ghafir', transliteration: 'Ghāfir', arabicName: 'غافر', translation: 'The Forgiver', totalAyahs: 85, revelationType: 'Meccan', juzNumber: 24, pageNumber: 467, memorizedAyahs: 0, status: 'locked' },
  { number: 41, name: 'Fussilat', transliteration: 'Fuṣṣilat', arabicName: 'فصلت', translation: 'Explained in Detail', totalAyahs: 54, revelationType: 'Meccan', juzNumber: 24, pageNumber: 477, memorizedAyahs: 0, status: 'locked' },
  { number: 42, name: 'Ash-Shura', transliteration: 'Ash-Shūrā', arabicName: 'الشورى', translation: 'The Consultation', totalAyahs: 53, revelationType: 'Meccan', juzNumber: 25, pageNumber: 483, memorizedAyahs: 0, status: 'locked' },
  { number: 43, name: 'Az-Zukhruf', transliteration: 'Az-Zukhruf', arabicName: 'الزخرف', translation: 'The Ornaments of Gold', totalAyahs: 89, revelationType: 'Meccan', juzNumber: 25, pageNumber: 489, memorizedAyahs: 0, status: 'locked' },
  { number: 44, name: 'Ad-Dukhan', transliteration: 'Ad-Dukhān', arabicName: 'الدخان', translation: 'The Smoke', totalAyahs: 59, revelationType: 'Meccan', juzNumber: 25, pageNumber: 496, memorizedAyahs: 0, status: 'locked' },
  { number: 45, name: 'Al-Jathiyah', transliteration: 'Al-Jāthiyah', arabicName: 'الجاثية', translation: 'The Crouching', totalAyahs: 37, revelationType: 'Meccan', juzNumber: 25, pageNumber: 499, memorizedAyahs: 0, status: 'locked' },
  { number: 46, name: 'Al-Ahqaf', transliteration: 'Al-Aḥqāf', arabicName: 'الأحقاف', translation: 'The Wind-Curved Sandhills', totalAyahs: 35, revelationType: 'Meccan', juzNumber: 26, pageNumber: 502, memorizedAyahs: 0, status: 'locked' },
  { number: 47, name: 'Muhammad', transliteration: 'Muḥammad', arabicName: 'محمد', translation: 'Muhammad', totalAyahs: 38, revelationType: 'Medinan', juzNumber: 26, pageNumber: 507, memorizedAyahs: 0, status: 'locked' },
  { number: 48, name: 'Al-Fath', transliteration: 'Al-Fatḥ', arabicName: 'الفتح', translation: 'The Victory', totalAyahs: 29, revelationType: 'Medinan', juzNumber: 26, pageNumber: 511, memorizedAyahs: 0, status: 'locked' },
  { number: 49, name: 'Al-Hujurat', transliteration: 'Al-Ḥujurāt', arabicName: 'الحجرات', translation: 'The Rooms', totalAyahs: 18, revelationType: 'Medinan', juzNumber: 26, pageNumber: 515, memorizedAyahs: 0, status: 'locked' },
  { number: 50, name: 'Qaf', transliteration: 'Qāf', arabicName: 'ق', translation: 'The Letter Qaf', totalAyahs: 45, revelationType: 'Meccan', juzNumber: 26, pageNumber: 518, memorizedAyahs: 0, status: 'locked' },
  { number: 51, name: 'Adh-Dhariyat', transliteration: 'Adh-Dhāriyāt', arabicName: 'الذاريات', translation: 'The Winnowing Winds', totalAyahs: 60, revelationType: 'Meccan', juzNumber: 26, pageNumber: 520, memorizedAyahs: 0, status: 'locked' },
  { number: 52, name: 'At-Tur', transliteration: 'Aṭ-Ṭūr', arabicName: 'الطور', translation: 'The Mount', totalAyahs: 49, revelationType: 'Meccan', juzNumber: 27, pageNumber: 523, memorizedAyahs: 0, status: 'locked' },
  { number: 53, name: 'An-Najm', transliteration: 'An-Najm', arabicName: 'النجم', translation: 'The Star', totalAyahs: 62, revelationType: 'Meccan', juzNumber: 27, pageNumber: 526, memorizedAyahs: 0, status: 'locked' },
  { number: 54, name: 'Al-Qamar', transliteration: 'Al-Qamar', arabicName: 'القمر', translation: 'The Moon', totalAyahs: 55, revelationType: 'Meccan', juzNumber: 27, pageNumber: 528, memorizedAyahs: 0, status: 'locked' },
  { number: 55, name: 'Ar-Rahman', transliteration: 'Ar-Raḥmān', arabicName: 'الرحمن', translation: 'The Beneficent', totalAyahs: 78, revelationType: 'Medinan', juzNumber: 27, pageNumber: 531, memorizedAyahs: 0, status: 'locked' },
  { number: 56, name: 'Al-Waqi\'ah', transliteration: 'Al-Wāqi\'ah', arabicName: 'الواقعة', translation: 'The Inevitable', totalAyahs: 96, revelationType: 'Meccan', juzNumber: 27, pageNumber: 534, memorizedAyahs: 0, status: 'locked' },
  { number: 57, name: 'Al-Hadid', transliteration: 'Al-Ḥadīd', arabicName: 'الحديد', translation: 'The Iron', totalAyahs: 29, revelationType: 'Medinan', juzNumber: 27, pageNumber: 537, memorizedAyahs: 0, status: 'locked' },
  { number: 58, name: 'Al-Mujadila', transliteration: 'Al-Mujādilah', arabicName: 'المجادلة', translation: 'The Pleading Woman', totalAyahs: 22, revelationType: 'Medinan', juzNumber: 28, pageNumber: 542, memorizedAyahs: 0, status: 'locked' },
  { number: 59, name: 'Al-Hashr', transliteration: 'Al-Ḥashr', arabicName: 'الحشر', translation: 'The Exile', totalAyahs: 24, revelationType: 'Medinan', juzNumber: 28, pageNumber: 545, memorizedAyahs: 0, status: 'locked' },
  { number: 60, name: 'Al-Mumtahanah', transliteration: 'Al-Mumtaḥanah', arabicName: 'الممتحنة', translation: 'She that is to be examined', totalAyahs: 13, revelationType: 'Medinan', juzNumber: 28, pageNumber: 549, memorizedAyahs: 0, status: 'locked' },
  { number: 61, name: 'As-Saff', transliteration: 'Aṣ-Ṣaff', arabicName: 'الصف', translation: 'The Ranks', totalAyahs: 14, revelationType: 'Medinan', juzNumber: 28, pageNumber: 551, memorizedAyahs: 0, status: 'locked' },
  { number: 62, name: 'Al-Jumu\'ah', transliteration: 'Al-Jumu\'ah', arabicName: 'الجمعة', translation: 'The Congregation', totalAyahs: 11, revelationType: 'Medinan', juzNumber: 28, pageNumber: 553, memorizedAyahs: 0, status: 'locked' },
  { number: 63, name: 'Al-Munafiqun', transliteration: 'Al-Munāfiqūn', arabicName: 'المنافقون', translation: 'The Hypocrites', totalAyahs: 11, revelationType: 'Medinan', juzNumber: 28, pageNumber: 554, memorizedAyahs: 0, status: 'locked' },
  { number: 64, name: 'At-Taghabun', transliteration: 'At-Taghābun', arabicName: 'التغابن', translation: 'The Mutual Disillusion', totalAyahs: 18, revelationType: 'Medinan', juzNumber: 28, pageNumber: 556, memorizedAyahs: 0, status: 'locked' },
  { number: 65, name: 'At-Talaq', transliteration: 'Aṭ-Ṭalāq', arabicName: 'الطلاق', translation: 'The Divorce', totalAyahs: 12, revelationType: 'Medinan', juzNumber: 28, pageNumber: 558, memorizedAyahs: 0, status: 'locked' },
  { number: 66, name: 'At-Tahrim', transliteration: 'At-Taḥrīm', arabicName: 'التحريم', translation: 'The Prohibition', totalAyahs: 12, revelationType: 'Medinan', juzNumber: 28, pageNumber: 560, memorizedAyahs: 0, status: 'locked' },
  { number: 67, name: 'Al-Mulk', transliteration: 'Al-Mulk', arabicName: 'الملك', translation: 'The Sovereignty', totalAyahs: 30, revelationType: 'Meccan', juzNumber: 29, pageNumber: 562, memorizedAyahs: 18, status: 'active' },
  { number: 68, name: 'Al-Qalam', transliteration: 'Al-Qalam', arabicName: 'القلم', translation: 'The Pen', totalAyahs: 52, revelationType: 'Meccan', juzNumber: 29, pageNumber: 564, memorizedAyahs: 0, status: 'locked' },
  { number: 69, name: 'Al-Haqqah', transliteration: 'Al-Ḥāqqah', arabicName: 'الحاقة', translation: 'The Inevitable Truth', totalAyahs: 52, revelationType: 'Meccan', juzNumber: 29, pageNumber: 566, memorizedAyahs: 0, status: 'locked' },
  { number: 70, name: 'Al-Ma\'arij', transliteration: 'Al-Ma\'ārij', arabicName: 'المعارج', translation: 'The Ascending Stairways', totalAyahs: 44, revelationType: 'Meccan', juzNumber: 29, pageNumber: 568, memorizedAyahs: 0, status: 'locked' },
  { number: 71, name: 'Nuh', transliteration: 'Nūḥ', arabicName: 'نوح', translation: 'Noah', totalAyahs: 28, revelationType: 'Meccan', juzNumber: 29, pageNumber: 570, memorizedAyahs: 0, status: 'locked' },
  { number: 72, name: 'Al-Jinn', transliteration: 'Al-Jinn', arabicName: 'الجن', translation: 'The Jinn', totalAyahs: 28, revelationType: 'Meccan', juzNumber: 29, pageNumber: 572, memorizedAyahs: 0, status: 'locked' },
  { number: 73, name: 'Al-Muzzammil', transliteration: 'Al-Muzzammil', arabicName: 'المزمل', translation: 'The Enshrouded One', totalAyahs: 20, revelationType: 'Meccan', juzNumber: 29, pageNumber: 574, memorizedAyahs: 0, status: 'locked' },
  { number: 74, name: 'Al-Muddaththir', transliteration: 'Al-Muddaththir', arabicName: 'المدثر', translation: 'The Cloaked One', totalAyahs: 56, revelationType: 'Meccan', juzNumber: 29, pageNumber: 575, memorizedAyahs: 0, status: 'locked' },
  { number: 75, name: 'Al-Qiyamah', transliteration: 'Al-Qiyāmah', arabicName: 'القيامة', translation: 'The Resurrection', totalAyahs: 40, revelationType: 'Meccan', juzNumber: 29, pageNumber: 577, memorizedAyahs: 0, status: 'locked' },
  { number: 76, name: 'Al-Insan', transliteration: 'Al-Insān', arabicName: 'الإنسان', translation: 'The Human', totalAyahs: 31, revelationType: 'Medinan', juzNumber: 29, pageNumber: 578, memorizedAyahs: 0, status: 'locked' },
  { number: 77, name: 'Al-Mursalat', transliteration: 'Al-Mursalāt', arabicName: 'المرسلات', translation: 'The Emissaries', totalAyahs: 50, revelationType: 'Meccan', juzNumber: 29, pageNumber: 580, memorizedAyahs: 0, status: 'locked' },
  { number: 78, name: 'An-Naba', transliteration: 'An-Naba\'', arabicName: 'النبأ', translation: 'The Tidings', totalAyahs: 40, revelationType: 'Meccan', juzNumber: 30, pageNumber: 582, memorizedAyahs: 0, status: 'locked' },
  { number: 79, name: 'An-Nazi\'at', transliteration: 'An-Nāzi\'āt', arabicName: 'النازعات', translation: 'Those who drag forth', totalAyahs: 46, revelationType: 'Meccan', juzNumber: 30, pageNumber: 583, memorizedAyahs: 0, status: 'locked' },
  { number: 80, name: '\'Abasa', transliteration: '\'Abasa', arabicName: 'عبس', translation: 'He Frowned', totalAyahs: 42, revelationType: 'Meccan', juzNumber: 30, pageNumber: 585, memorizedAyahs: 0, status: 'locked' },
  { number: 81, name: 'At-Takwir', transliteration: 'At-Takwīr', arabicName: 'التكوير', translation: 'The Overthrowing', totalAyahs: 29, revelationType: 'Meccan', juzNumber: 30, pageNumber: 586, memorizedAyahs: 0, status: 'locked' },
  { number: 82, name: 'Al-Infitar', transliteration: 'Al-Infiṭār', arabicName: 'الانفطار', translation: 'The Cleaving', totalAyahs: 19, revelationType: 'Meccan', juzNumber: 30, pageNumber: 587, memorizedAyahs: 0, status: 'locked' },
  { number: 83, name: 'Al-Mutaffifin', transliteration: 'Al-Muṭaffifīn', arabicName: 'المطففين', translation: 'The Defrauding', totalAyahs: 36, revelationType: 'Meccan', juzNumber: 30, pageNumber: 587, memorizedAyahs: 0, status: 'locked' },
  { number: 84, name: 'Al-Inshiqaq', transliteration: 'Al-Inshiqāq', arabicName: 'الانشقاق', translation: 'The Splitting Open', totalAyahs: 25, revelationType: 'Meccan', juzNumber: 30, pageNumber: 589, memorizedAyahs: 0, status: 'locked' },
  { number: 85, name: 'Al-Buruj', transliteration: 'Al-Burūj', arabicName: 'البروج', translation: 'The Constellations', totalAyahs: 22, revelationType: 'Meccan', juzNumber: 30, pageNumber: 590, memorizedAyahs: 0, status: 'locked' },
  { number: 86, name: 'At-Tariq', transliteration: 'Aṭ-Ṭāriq', arabicName: 'الطارق', translation: 'The Nightcomer', totalAyahs: 17, revelationType: 'Meccan', juzNumber: 30, pageNumber: 591, memorizedAyahs: 0, status: 'locked' },
  { number: 87, name: 'Al-A\'la', transliteration: 'Al-A\'lā', arabicName: 'الأعلى', translation: 'The Most High', totalAyahs: 19, revelationType: 'Meccan', juzNumber: 30, pageNumber: 591, memorizedAyahs: 0, status: 'locked' },
  { number: 88, name: 'Al-Ghashiyah', transliteration: 'Al-Ghāshiyah', arabicName: 'الغاشية', translation: 'The Overwhelming', totalAyahs: 26, revelationType: 'Meccan', juzNumber: 30, pageNumber: 592, memorizedAyahs: 0, status: 'locked' },
  { number: 89, name: 'Al-Fajr', transliteration: 'Al-Fajr', arabicName: 'الفجر', translation: 'The Dawn', totalAyahs: 30, revelationType: 'Meccan', juzNumber: 30, pageNumber: 593, memorizedAyahs: 0, status: 'locked' },
  { number: 90, name: 'Al-Balad', transliteration: 'Al-Balad', arabicName: 'البلد', translation: 'The City', totalAyahs: 20, revelationType: 'Meccan', juzNumber: 30, pageNumber: 594, memorizedAyahs: 0, status: 'locked' },
  { number: 91, name: 'Ash-Shams', transliteration: 'Ash-Shams', arabicName: 'الشمس', translation: 'The Sun', totalAyahs: 15, revelationType: 'Meccan', juzNumber: 30, pageNumber: 595, memorizedAyahs: 0, status: 'locked' },
  { number: 92, name: 'Al-Layl', transliteration: 'Al-Layl', arabicName: 'الليل', translation: 'The Night', totalAyahs: 21, revelationType: 'Meccan', juzNumber: 30, pageNumber: 595, memorizedAyahs: 0, status: 'locked' },
  { number: 93, name: 'Ad-Duhaa', transliteration: 'Aḍ-Ḍuḥā', arabicName: 'الضحى', translation: 'The Morning Hours', totalAyahs: 11, revelationType: 'Meccan', juzNumber: 30, pageNumber: 596, memorizedAyahs: 0, status: 'locked' },
  { number: 94, name: 'Ash-Sharh', transliteration: 'Ash-Sharḥ', arabicName: 'الشرح', translation: 'The Relief', totalAyahs: 8, revelationType: 'Meccan', juzNumber: 30, pageNumber: 596, memorizedAyahs: 0, status: 'locked' },
  { number: 95, name: 'At-Tin', transliteration: 'At-Tīn', arabicName: 'التين', translation: 'The Fig', totalAyahs: 8, revelationType: 'Meccan', juzNumber: 30, pageNumber: 597, memorizedAyahs: 0, status: 'locked' },
  { number: 96, name: 'Al-\'Alaq', transliteration: 'Al-\'Alaq', arabicName: 'العلق', translation: 'The Clot', totalAyahs: 19, revelationType: 'Meccan', juzNumber: 30, pageNumber: 597, memorizedAyahs: 0, status: 'locked' },
  { number: 97, name: 'Al-Qadr', transliteration: 'Al-Qadr', arabicName: 'القدر', translation: 'The Power', totalAyahs: 5, revelationType: 'Meccan', juzNumber: 30, pageNumber: 598, memorizedAyahs: 5, status: 'completed' },
  { number: 98, name: 'Al-Bayyinah', transliteration: 'Al-Bayyinah', arabicName: 'البينة', translation: 'The Clear Proof', totalAyahs: 8, revelationType: 'Medinan', juzNumber: 30, pageNumber: 598, memorizedAyahs: 0, status: 'locked' },
  { number: 99, name: 'Az-Zalzalah', transliteration: 'Az-Zalzalah', arabicName: 'الزلزلة', translation: 'The Earthquake', totalAyahs: 8, revelationType: 'Medinan', juzNumber: 30, pageNumber: 599, memorizedAyahs: 0, status: 'locked' },
  { number: 100, name: 'Al-\'Adiyat', transliteration: 'Al-\'Ādiyāt', arabicName: 'العاديات', translation: 'The Courser', totalAyahs: 11, revelationType: 'Meccan', juzNumber: 30, pageNumber: 599, memorizedAyahs: 0, status: 'locked' },
  { number: 101, name: 'Al-Qari\'ah', transliteration: 'Al-Qāri\'ah', arabicName: 'القارعة', translation: 'The Calamity', totalAyahs: 11, revelationType: 'Meccan', juzNumber: 30, pageNumber: 600, memorizedAyahs: 0, status: 'locked' },
  { number: 102, name: 'At-Takathur', transliteration: 'At-Takāthur', arabicName: 'التكاثر', translation: 'The Rivalry in World Increase', totalAyahs: 8, revelationType: 'Meccan', juzNumber: 30, pageNumber: 600, memorizedAyahs: 0, status: 'locked' },
  { number: 103, name: 'Al-\'Asr', transliteration: 'Al-\'Aṣr', arabicName: 'العصر', translation: 'The Declining Day', totalAyahs: 3, revelationType: 'Meccan', juzNumber: 30, pageNumber: 601, memorizedAyahs: 3, status: 'completed' },
  { number: 104, name: 'Al-Humazah', transliteration: 'Al-Humazah', arabicName: 'الهمزة', translation: 'The Traducer', totalAyahs: 9, revelationType: 'Meccan', juzNumber: 30, pageNumber: 601, memorizedAyahs: 0, status: 'locked' },
  { number: 105, name: 'Al-Fil', transliteration: 'Al-Fīl', arabicName: 'الفيل', translation: 'The Elephant', totalAyahs: 5, revelationType: 'Meccan', juzNumber: 30, pageNumber: 601, memorizedAyahs: 0, status: 'locked' },
  { number: 106, name: 'Quraysh', transliteration: 'Quraysh', arabicName: 'قريش', translation: 'Quraysh', totalAyahs: 4, revelationType: 'Meccan', juzNumber: 30, pageNumber: 602, memorizedAyahs: 4, status: 'completed' },
  { number: 107, name: 'Al-Ma\'un', transliteration: 'Al-Mā\'ūn', arabicName: 'الماعون', translation: 'The Small Kindness', totalAyahs: 7, revelationType: 'Meccan', juzNumber: 30, pageNumber: 602, memorizedAyahs: 0, status: 'locked' },
  { number: 108, name: 'Al-Kawthar', transliteration: 'Al-Kawthar', arabicName: 'الكوثر', translation: 'The Abundance', totalAyahs: 3, revelationType: 'Meccan', juzNumber: 30, pageNumber: 602, memorizedAyahs: 3, status: 'completed' },
  { number: 109, name: 'Al-Kafirun', transliteration: 'Al-Kāfirūn', arabicName: 'الكافرون', translation: 'The Disbelievers', totalAyahs: 6, revelationType: 'Meccan', juzNumber: 30, pageNumber: 603, memorizedAyahs: 6, status: 'completed' },
  { number: 110, name: 'An-Nasr', transliteration: 'An-Naṣr', arabicName: 'النصر', translation: 'The Divine Support', totalAyahs: 3, revelationType: 'Medinan', juzNumber: 30, pageNumber: 603, memorizedAyahs: 3, status: 'completed' },
  { number: 111, name: 'Al-Masad', transliteration: 'Al-Masad', arabicName: 'المسد', translation: 'The Palm Fiber', totalAyahs: 5, revelationType: 'Meccan', juzNumber: 30, pageNumber: 603, memorizedAyahs: 5, status: 'completed' },
  { number: 112, name: 'Al-Ikhlas', transliteration: 'Al-Ikhlāṣ', arabicName: 'الإخلاص', translation: 'The Sincerity', totalAyahs: 4, revelationType: 'Meccan', juzNumber: 30, pageNumber: 604, memorizedAyahs: 4, status: 'completed' },
  { number: 113, name: 'Al-Falaq', transliteration: 'Al-Falaq', arabicName: 'الفلق', translation: 'The Daybreak', totalAyahs: 5, revelationType: 'Meccan', juzNumber: 30, pageNumber: 604, memorizedAyahs: 5, status: 'completed' },
  { number: 114, name: 'An-Nas', transliteration: 'An-Nās', arabicName: 'الناس', translation: 'Mankind', totalAyahs: 6, revelationType: 'Meccan', juzNumber: 30, pageNumber: 604, memorizedAyahs: 6, status: 'completed' },
];

export const ALL_30_JUZ: JuzMeta[] = [
  { number: 1, name: 'Juz 1', arabicName: 'الجزء الأول', startSurah: 'Al-Fatiha', startAyah: 1, endSurah: 'Al-Baqarah', endAyah: 141, totalVerses: 148, memorizedVerses: 27 },
  { number: 2, name: 'Juz 2', arabicName: 'الجزء الثاني', startSurah: 'Al-Baqarah', startAyah: 142, endSurah: 'Al-Baqarah', endAyah: 252, totalVerses: 111, memorizedVerses: 0 },
  { number: 3, name: 'Juz 3', arabicName: 'الجزء الثالث', startSurah: 'Al-Baqarah', startAyah: 253, endSurah: 'Aal-Imran', endAyah: 92, totalVerses: 126, memorizedVerses: 0 },
  { number: 4, name: 'Juz 4', arabicName: 'الجزء الرابع', startSurah: 'Aal-Imran', startAyah: 93, endSurah: 'An-Nisa', endAyah: 23, totalVerses: 131, memorizedVerses: 0 },
  { number: 5, name: 'Juz 5', arabicName: 'الجزء الخامس', startSurah: 'An-Nisa', startAyah: 24, endSurah: 'An-Nisa', endAyah: 147, totalVerses: 124, memorizedVerses: 0 },
  { number: 6, name: 'Juz 6', arabicName: 'الجزء السادس', startSurah: 'An-Nisa', startAyah: 148, endSurah: 'Al-Ma\'idah', endAyah: 81, totalVerses: 110, memorizedVerses: 0 },
  { number: 7, name: 'Juz 7', arabicName: 'الجزء السابع', startSurah: 'Al-Ma\'idah', startAyah: 82, endSurah: 'Al-An\'am', endAyah: 110, totalVerses: 149, memorizedVerses: 0 },
  { number: 8, name: 'Juz 8', arabicName: 'الجزء الثامن', startSurah: 'Al-An\'am', startAyah: 111, endSurah: 'Al-A\'raf', endAyah: 87, totalVerses: 142, memorizedVerses: 0 },
  { number: 9, name: 'Juz 9', arabicName: 'الجزء التاسع', startSurah: 'Al-A\'raf', startAyah: 88, endSurah: 'Al-Anfal', endAyah: 40, totalVerses: 159, memorizedVerses: 0 },
  { number: 10, name: 'Juz 10', arabicName: 'الجزء العاشر', startSurah: 'Al-Anfal', startAyah: 41, endSurah: 'At-Tawbah', endAyah: 92, totalVerses: 127, memorizedVerses: 0 },
  { number: 11, name: 'Juz 11', arabicName: 'الجزء الحادي عشر', startSurah: 'At-Tawbah', startAyah: 93, endSurah: 'Hud', endAyah: 5, totalVerses: 151, memorizedVerses: 0 },
  { number: 12, name: 'Juz 12', arabicName: 'الجزء الثاني عشر', startSurah: 'Hud', startAyah: 6, endSurah: 'Yusuf', endAyah: 52, totalVerses: 170, memorizedVerses: 0 },
  { number: 13, name: 'Juz 13', arabicName: 'الجزء الثالث عشر', startSurah: 'Yusuf', startAyah: 53, endSurah: 'Ibrahim', endAyah: 52, totalVerses: 154, memorizedVerses: 0 },
  { number: 14, name: 'Juz 14', arabicName: 'الجزء الرابع عشر', startSurah: 'Al-Hijr', startAyah: 1, endSurah: 'An-Nahl', endAyah: 128, totalVerses: 227, memorizedVerses: 0 },
  { number: 15, name: 'Juz 15', arabicName: 'الجزء الخامس عشر', startSurah: 'Al-Isra', startAyah: 1, endSurah: 'Al-Kahf', endAyah: 74, totalVerses: 185, memorizedVerses: 10 },
  { number: 16, name: 'Juz 16', arabicName: 'الجزء السادس عشر', startSurah: 'Al-Kahf', startAyah: 75, endSurah: 'Ta-Ha', endAyah: 135, totalVerses: 269, memorizedVerses: 0 },
  { number: 17, name: 'Juz 17', arabicName: 'الجزء السابع عشر', startSurah: 'Al-Anbiya', startAyah: 1, endSurah: 'Al-Hajj', endAyah: 78, totalVerses: 190, memorizedVerses: 0 },
  { number: 18, name: 'Juz 18', arabicName: 'الجزء الثامن عشر', startSurah: 'Al-Mu\'minun', startAyah: 1, endSurah: 'Al-Furqan', endAyah: 20, totalVerses: 202, memorizedVerses: 0 },
  { number: 19, name: 'Juz 19', arabicName: 'الجزء التاسع عشر', startSurah: 'Al-Furqan', startAyah: 21, endSurah: 'An-Naml', endAyah: 55, totalVerses: 339, memorizedVerses: 0 },
  { number: 20, name: 'Juz 20', arabicName: 'الجزء العشرون', startSurah: 'An-Naml', startAyah: 56, endSurah: 'Al-Ankabut', endAyah: 45, totalVerses: 171, memorizedVerses: 0 },
  { number: 21, name: 'Juz 21', arabicName: 'الجزء الحادي والعشرون', startSurah: 'Al-Ankabut', startAyah: 46, endSurah: 'Al-Ahzab', endAyah: 30, totalVerses: 178, memorizedVerses: 0 },
  { number: 22, name: 'Juz 22', arabicName: 'الجزء الثاني والعشرون', startSurah: 'Al-Ahzab', startAyah: 31, endSurah: 'Ya-Sin', endAyah: 27, totalVerses: 169, memorizedVerses: 0 },
  { number: 23, name: 'Juz 23', arabicName: 'الجزء الثالث والعشرون', startSurah: 'Ya-Sin', startAyah: 28, endSurah: 'Az-Zumar', endAyah: 31, totalVerses: 357, memorizedVerses: 0 },
  { number: 24, name: 'Juz 24', arabicName: 'الجزء الرابع والعشرون', startSurah: 'Az-Zumar', startAyah: 32, endSurah: 'Fussilat', endAyah: 46, totalVerses: 175, memorizedVerses: 0 },
  { number: 25, name: 'Juz 25', arabicName: 'الجزء الخامس والعشرون', startSurah: 'Fussilat', startAyah: 47, endSurah: 'Al-Jathiyah', endAyah: 37, totalVerses: 246, memorizedVerses: 0 },
  { number: 26, name: 'Juz 26', arabicName: 'الجزء السادس والعشرون', startSurah: 'Al-Ahqaf', startAyah: 1, endSurah: 'Adh-Dhariyat', endAyah: 30, totalVerses: 195, memorizedVerses: 0 },
  { number: 27, name: 'Juz 27', arabicName: 'الجزء السابع والعشرون', startSurah: 'Adh-Dhariyat', startAyah: 31, endSurah: 'Al-Hadid', endAyah: 29, totalVerses: 399, memorizedVerses: 0 },
  { number: 28, name: 'Juz 28', arabicName: 'الجزء الثامن والعشرون', startSurah: 'Al-Mujadila', startAyah: 1, endSurah: 'At-Tahrim', endAyah: 12, totalVerses: 137, memorizedVerses: 0 },
  { number: 29, name: 'Juz 29', arabicName: 'الجزء التاسع والعشرون', startSurah: 'Al-Mulk', startAyah: 1, endSurah: 'Al-Mursalat', endAyah: 50, totalVerses: 431, memorizedVerses: 18 },
  { number: 30, name: 'Juz 30', arabicName: 'الجزء الثلاثون', startSurah: 'An-Naba', startAyah: 1, endSurah: 'An-Nas', endAyah: 6, totalVerses: 564, memorizedVerses: 38 },
];
