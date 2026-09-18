/**
 * Islamic (Hijri) Calendar Utilities
 * Computes accurate Hijri dates with English & Arabic month names,
 * and highlights key Islamic events / blessed days (Jumu'ah, Ramadan, Dhul Hijjah, etc.).
 */

export interface HijriDateInfo {
  day: number;
  monthIndex: number; // 0-based
  monthNameEn: string;
  monthNameAr: string;
  year: number;
  formattedEn: string; // e.g., "5 Rabi' al-Awwal 1448 AH"
  formattedAr: string; // e.g., "٥ ربيع الأول ١٤٤٨ هـ"
  dayNameAr: string;
  isJumuah: boolean;
  specialNote?: string;
}

const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

const HIJRI_MONTHS_AR = [
  'المُحَرَّم',
  'صَفَر',
  'رَبِيع الأَوَّل',
  'رَبِيع الآخِر',
  'جُمَادَى الأُولَى',
  'جُمَادَى الآخِرَة',
  'رَجَب',
  'شَعْبَان',
  'رَمَضَان',
  'شَوَّال',
  'ذُو القَعْدَة',
  'ذُو الحِجَّة',
];

const ARABIC_DAYS = [
  'الأَحَد', // Sun
  'الإِثْنَيْن', // Mon
  'الثُّلاثَاء', // Tue
  'الأَرْبِعَاء', // Wed
  'الخَمِيس', // Thu
  'الجُمُعَة', // Fri
  'السَّبْت', // Sat
];

const ARABIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicNumerals(num: number): string {
  return num
    .toString()
    .split('')
    .map((ch) => ARABIC_NUMERALS[parseInt(ch, 10)] ?? ch)
    .join('');
}

/**
 * Returns Hijri date using native Intl.DateTimeFormat (Islamic civil or ummalqura calendar)
 * with robust algorithmic fallback.
 */
export function getHijriDate(date: Date = new Date()): HijriDateInfo {
  const isJumuah = date.getDay() === 5;
  const dayNameAr = ARABIC_DAYS[date.getDay()] || '';

  try {
    // 1. Primary: Browser standard Intl Islamic Umm al-Qura formatting
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    const parts = formatter.formatToParts(date);
    let day = 1;
    let month = 1;
    let year = 1448;

    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value, 10) || 1;
      if (part.type === 'month') month = parseInt(part.value, 10) || 1;
      if (part.type === 'year') year = parseInt(part.value, 10) || 1448;
    }

    const monthIndex = Math.max(0, Math.min(11, month - 1));
    const monthNameEn = HIJRI_MONTHS_EN[monthIndex];
    const monthNameAr = HIJRI_MONTHS_AR[monthIndex];

    let specialNote: string | undefined;
    if (isJumuah) {
      specialNote = "Mubarak Jumu'ah";
    } else if (monthIndex === 8) {
      specialNote = 'Blessed Ramadan';
    } else if (monthIndex === 11 && day <= 10) {
      specialNote = '10 Blessed Days of Dhul Hijjah';
    } else if (monthIndex === 0 && day === 10) {
      specialNote = 'Day of Ashura';
    }

    return {
      day,
      monthIndex,
      monthNameEn,
      monthNameAr,
      year,
      formattedEn: `${day} ${monthNameEn} ${year} AH`,
      formattedAr: `${toArabicNumerals(day)} ${monthNameAr} ${toArabicNumerals(year)} هـ`,
      dayNameAr,
      isJumuah,
      specialNote,
    };
  } catch (err) {
    // 2. Kuwaiti algorithm fallback
    return getKuwaitiHijriFallback(date);
  }
}

/**
 * Robust astronomical/civil fallback calculation
 */
function getKuwaitiHijriFallback(date: Date): HijriDateInfo {
  const isJumuah = date.getDay() === 5;
  const dayNameAr = ARABIC_DAYS[date.getDay()] || '';

  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
  b = 0;
  if (jd > 2299160) {
    a = Math.floor((jd - 1867216.25) / 36524.25);
    b = 1 + a - Math.floor(a / 4);
  }
  let bb = jd + b + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  let dd = Math.floor(365.25 * cc);
  let ee = Math.floor((bb - dd) / 30.6001);
  day = bb - dd - Math.floor(30.6001 * ee);
  month = ee - 1;
  if (ee > 13) {
    cc += 1;
    month = ee - 13;
  }
  year = cc - 4716;

  let wd = (jd + 1) % 7;
  let iyear = 10631 / 30;
  let epochastro = 1948084;
  let shift1 = 8.01 / 60;

  let z = jd - epochastro;
  let cyc = Math.floor(z / 10631);
  z = z - 10631 * cyc;
  let j = Math.floor((z - shift1) / iyear);
  let iy = 30 * cyc + j;
  z = z - Math.floor(j * iyear + shift1);
  let im = Math.floor((z + 28.5001) / 29.5);
  if (im === 13) im = 12;
  let id = z - Math.floor(29.5001 * im - 29);

  const hYear = iy;
  const hMonth = Math.max(0, Math.min(11, im - 1));
  const hDay = Math.max(1, Math.min(30, id));

  return {
    day: hDay,
    monthIndex: hMonth,
    monthNameEn: HIJRI_MONTHS_EN[hMonth],
    monthNameAr: HIJRI_MONTHS_AR[hMonth],
    year: hYear,
    formattedEn: `${hDay} ${HIJRI_MONTHS_EN[hMonth]} ${hYear} AH`,
    formattedAr: `${toArabicNumerals(hDay)} ${HIJRI_MONTHS_AR[hMonth]} ${toArabicNumerals(hYear)} هـ`,
    dayNameAr,
    isJumuah,
  };
}
