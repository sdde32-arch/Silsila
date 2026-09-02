import { ExerciseCardProps } from '../types';

export interface LessonExercise extends ExerciseCardProps {
  id: string;
  title: string;
  stepNumber: number;
  stepType: 'listen-read' | 'fill-blank' | 'meaning-choice' | 'arabic-choice' | 'sequence-choice' | 'final-recall';
  explanation?: string;
  tajweedTip?: string;
}

export const mulkLessonExercises: LessonExercise[] = [
  {
    id: 'mulk-step-1',
    stepNumber: 1,
    stepType: 'fill-blank',
    title: 'Fill in the Missing Word',
    type: 'fill-blank',
    progressCurrent: 1,
    progressTotal: 6,
    ayahReference: 'Surah Al-Mulk [67:19]',
    ayahWithBlanks: 'أَوَلَمْ يَرَوْا۟ إِلَى ٱلطَّيْرِ فَوْقَهُمْ ___ وَيَقْبِضْنَ ۚ مَا يُمْسِكُهُنَّ إِلَّا ٱلرَّحْمَـٰنُ',
    wordBank: ['صَـٰٓفَّـٰتٍ', 'غَافِلِينَ', 'قَدِيرٌ', 'جُندٌ'],
    correctBlanks: ['صَـٰٓفَّـٰتٍ'],
    blankCount: 1,
    promptText: 'Complete the Ayah: "Do they not see the birds above them, spreading their wings [صَـٰٓفَّـٰتٍ] and folding them?"',
    tajweedTip: 'Observe Madd Lazim (6 counts) on صَـٰٓفَّـٰتٍ',
  },
  {
    id: 'mulk-step-2',
    stepNumber: 2,
    stepType: 'meaning-choice',
    title: 'Understand the Quranic Meaning',
    type: 'meaning-choice',
    direction: 'arabic-to-meaning',
    progressCurrent: 2,
    progressTotal: 6,
    ayahReference: 'Surah Al-Mulk [67:19]',
    promptText: 'مَا يُمْسِكُهُنَّ إِلَّا ٱلرَّحْمَـٰنُ',
    options: [
      {
        id: 'mulk-opt-2-1',
        text: 'None holds them up except the Most Merciful (Ar-Rahman)',
        isCorrect: true,
      },
      {
        id: 'mulk-opt-2-2',
        text: 'He creates what you know not',
        isCorrect: false,
      },
      {
        id: 'mulk-opt-2-3',
        text: 'And to Him is the final return of all creation',
        isCorrect: false,
      },
      {
        id: 'mulk-opt-2-4',
        text: 'Praise be to the Creator of the heavens and earth',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'mulk-step-3',
    stepNumber: 3,
    stepType: 'arabic-choice',
    title: 'Recognize the Arabic Ayah',
    type: 'arabic-choice',
    direction: 'meaning-to-arabic',
    progressCurrent: 3,
    progressTotal: 6,
    ayahReference: 'Surah Al-Mulk [67:20]',
    promptText: 'Or who is it that could be an army for you to help you besides the Most Merciful?',
    options: [
      {
        id: 'mulk-opt-3-1',
        text: 'أَمَّنْ هَـٰذَا ٱلَّذِى هُوَ جُندٌ لَّكُمْ يَنصُرُكُم مِّن دُونِ ٱلرَّحْمَـٰنِ',
        isCorrect: true,
      },
      {
        id: 'mulk-opt-3-2',
        text: 'أَمَّنْ هَـٰذَا ٱلَّذِى يَرْزُقُكُمْ إِنْ أَمْسَكَ رِزْقَهُۥ',
        isCorrect: false,
      },
      {
        id: 'mulk-opt-3-3',
        text: 'أَفَمَن يَمْشِى مُكِبًّا عَلَىٰ وَجْهِهِۦٓ أَهْدَىٰ',
        isCorrect: false,
      },
      {
        id: 'mulk-opt-3-4',
        text: 'قُلْ هُوَ ٱلَّذِىٓ أَنشَأَكُمْ وَجَعَلَ لَكُمُ ٱلسَّمْعَ',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'mulk-step-4',
    stepNumber: 4,
    stepType: 'sequence-choice',
    title: 'Sequence Recall (What comes next?)',
    type: 'sequence-choice',
    progressCurrent: 4,
    progressTotal: 6,
    ayahReference: 'Surah Al-Mulk [67:20 → 67:21]',
    promptText: 'إِنِ ٱلْكَـٰفِرُونَ إِلَّا فِى غُرُورٍ',
    options: [
      {
        id: 'mulk-opt-4-1',
        text: 'أَمَّنْ هَـٰذَا ٱلَّذِى يَرْزُقُكُمْ إِنْ أَمْسَكَ رِزْقَهُۥ ۚ بَل لَّجُّوا۟ فِى عُتُوٍّ وَنُفُورٍ',
        isCorrect: true,
      },
      {
        id: 'mulk-opt-4-2',
        text: 'أَفَمَن يَمْشِى مُكِبًّا عَلَىٰ وَجْهِهِۦٓ أَهْدَىٰٓ أَمَّن يَمْشِى سَوِيًّا',
        isCorrect: false,
      },
      {
        id: 'mulk-opt-4-3',
        text: 'قُلْ أَرَءَيْتُمْ إِنْ أَهْلَكَنِىَ ٱللَّهُ وَمَن مَّعِىَ',
        isCorrect: false,
      },
      {
        id: 'mulk-opt-4-4',
        text: 'قُلْ هُوَ ٱلرَّحْمَـٰنُ ءَامَنَّا بِهِۦ وَعَلَيْهِ تَوَكَّلْنَا',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'mulk-step-5',
    stepNumber: 5,
    stepType: 'fill-blank',
    title: 'English Translation Memorization',
    type: 'english-fill-blank',
    progressCurrent: 5,
    progressTotal: 6,
    ayahReference: 'Surah Al-Mulk [67:22]',
    ayahWithBlanks: 'Is he who walks fallen on his ___ more guided, or he who walks upright on a straight ___?',
    wordBank: ['face', 'path', 'heart', 'mountain', 'sky'],
    correctBlanks: ['face', 'path'],
    blankCount: 2,
    promptText: 'أَفَمَن يَمْشِى مُكِبًّا عَلَىٰ وَجْهِهِۦٓ أَهْدَىٰٓ أَمَّن يَمْشِى سَوِيًّا عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ',
  },
  {
    id: 'mulk-step-6',
    stepNumber: 6,
    stepType: 'arabic-choice',
    title: 'Final Mastery Recall (Ayah 23)',
    type: 'arabic-choice',
    direction: 'meaning-to-arabic',
    progressCurrent: 6,
    progressTotal: 6,
    ayahReference: 'Surah Al-Mulk [67:23]',
    promptText: 'Say, "It is He who has produced you and made for you hearing and vision and hearts; little are you grateful."',
    options: [
      {
        id: 'mulk-opt-6-1',
        text: 'قُلْ هُوَ ٱلَّذِىٓ أَنشَأَكُمْ وَجَعَلَ لَكُمُ ٱلسَّمْعَ وَٱلْأَبْصَـٰرَ وَٱلْأَفْـِٔدَةَ ۖ قَلِيلًا مَّا تَشْكُرُونَ',
        isCorrect: true,
      },
      {
        id: 'mulk-opt-6-2',
        text: 'قُلْ أَرَءَيْتُمْ إِنْ أَصْبَحَ مَآؤُكُمْ غَوْرًا فَمَن يَأْتِيكُم بِمَآءٍ مَّعِينٍۭ',
        isCorrect: false,
      },
      {
        id: 'mulk-opt-6-3',
        text: 'وَيَقُولُونَ مَتَىٰ هَـٰذَا ٱلْوَعْدُ إِن كُنتُمْ صَـٰدِقِينَ',
        isCorrect: false,
      },
      {
        id: 'mulk-opt-6-4',
        text: 'فَلَمَّا رَأَوْهُ زُلْفَةً سِيٓـَٔتْ وُجُوهُ ٱلَّذِينَ كَفَرُوا۟',
        isCorrect: false,
      },
    ],
  },
];
