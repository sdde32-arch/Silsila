import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Trophy,
  Check,
  Play,
  Pause,
  Shield,
  Flame,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ALL_114_SURAHS, SurahMeta } from '../../data/quranMetadata';
import { SURAH_CONTENT_DB, SurahContent } from '../../data/quranVerses';
import { getAyahAudioUrl } from '../../services/quranDataService';
import { globalAudioManager } from '../../services/globalAudioManager';
import {
  recordRecallAttempt,
  getRetentionDatabase,
  getUserProgression,
  saveUserProgression,
  adjustHifzPoints,
} from '../../services/memorizationEngine';
import { recordExamResult } from '../../services/examService';
import { AyahNumberBadge } from '../ui/AyahNumberBadge';
import { useScrollLock } from '../../hooks/useScrollLock';
import { CoachMarkOverlay } from '../tour/CoachMarkOverlay';

export interface SurahMasteryTestModalProps {
  surahNumber: number;
  onClose: () => void;
  onTestPassed?: (surahNumber: number) => void;
  onPracticeWeakAyah?: (surahNumber: number, ayahNumber: number) => void;
}

interface TestQuestion {
  id: number;
  type: 'sequence-continuation' | 'missing-word' | 'audio-recognition' | 'wasl-link';
  prompt: string;
  subPrompt?: string;
  arabicSnippet?: string;
  audioUrl?: string;
  targetAyahNumber: number;
  options: { id: string; text: string; isCorrect: boolean; arabic?: string }[];
  explanation: string;
}

export const SurahMasteryTestModal: React.FC<SurahMasteryTestModalProps> = ({
  surahNumber,
  onClose,
  onTestPassed,
  onPracticeWeakAyah,
}) => {
  useScrollLock(true);
  const meta: SurahMeta = ALL_114_SURAHS.find((s) => s.number === surahNumber) || ALL_114_SURAHS[0];
  const surahContent: SurahContent | undefined = SURAH_CONTENT_DB[surahNumber];

  // Test state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [missedAyahs, setMissedAyahs] = useState<number[]>([]);
  const [isTestFinished, setIsTestFinished] = useState(false);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamically generate questions tailored for this Surah
  const [questions] = useState<TestQuestion[]>(() => {
    return generateSurahQuestions(meta, surahContent);
  });

  const currentQ = questions[currentQuestionIdx] || questions[0];

  useEffect(() => {
    setIsAnswerChecked(false);
    setSelectedOptionId(null);
    setIsPlayingAudio(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [currentQuestionIdx]);

  const handleToggleAudio = () => {
    if (!currentQ.audioUrl) return;
    if (isPlayingAudio) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      globalAudioManager.stopAll('surah-mastery-test');
      const audio = new Audio(currentQ.audioUrl);
      audioRef.current = audio;

      const unregister = globalAudioManager.registerAudioElement(audio, 'surah-mastery-test', () => {
        try {
          if (!audio.paused) audio.pause();
        } catch {}
        setIsPlayingAudio(false);
      });

      audio.play().catch(() => {
        unregister();
        setIsPlayingAudio(false);
      });
      setIsPlayingAudio(true);
      audio.onended = () => {
        unregister();
        setIsPlayingAudio(false);
      };
      audio.onerror = () => {
        unregister();
        setIsPlayingAudio(false);
      };
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId || isAnswerChecked) return;
    setIsAnswerChecked(true);

    const chosen = currentQ.options.find((o) => o.id === selectedOptionId);
    if (chosen?.isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      setMissedAyahs((prev) => [...new Set([...prev, currentQ.targetAyahNumber])]);
      adjustHifzPoints(-3, `Wrong answer on Surah ${surahNumber} Mastery Exam`);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      // Finished Exam
      setIsTestFinished(true);
      const isLastChoiceCorrect = !!(selectedOptionId && currentQ.options.find((o) => o.id === selectedOptionId)?.isCorrect);
      const totalCorrect = correctAnswersCount + (isLastChoiceCorrect ? 1 : 0);
      const finalScore = Math.round((totalCorrect / questions.length) * 100);
      const passed = finalScore >= 80;

      // Record exam in persistent service & sync to Firestore
      recordExamResult({
        surahNumber,
        surahName: meta.name,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        score: finalScore,
        passed,
        correctQuestions: totalCorrect,
        totalQuestions: questions.length,
      });

      if (passed) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#10B981', '#6366F1', '#3B82F6'],
        });

        // Record Surah mastery in UserProgressionState
        const user = getUserProgression();
        if (!user.masteredSurahs.includes(surahNumber)) {
          user.masteredSurahs.push(surahNumber);
          user.userXP += 250;
          saveUserProgression(user);
        }

        // Record successful full_blind recalls for all ayahs in this Surah
        const totalAyahs = surahContent ? surahContent.ayahs.length : meta.totalAyahs;
        for (let a = 1; a <= Math.min(totalAyahs, 7); a++) {
          recordRecallAttempt(surahNumber, a, 'full_blind', 5);
        }

        if (onTestPassed) {
          onTestPassed(surahNumber);
        }
      }
    }
  };

  const scorePercentage = Math.round((correctAnswersCount / questions.length) * 100);
  const isPassed = scorePercentage >= 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Return back"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>Return back</span>
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  Mastery Verification Exam
                </span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Surah {meta.name} ({meta.arabicName})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!isTestFinished && (
          <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        )}

        {/* Content Body */}
        {!isTestFinished ? (
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Question Counter */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
                Question {currentQuestionIdx + 1} of {questions.length}
              </span>
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                Pass Requirement: 80%+
              </span>
            </div>

            {/* Question Card */}
            <div
              data-coach="mastery-exam"
              className="p-4 rounded-2xl bg-[#FAF9F5] border border-amber-900/10 space-y-3"
            >
              <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                {currentQ.prompt}
              </h4>

              {currentQ.arabicSnippet && (
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-right" dir="rtl">
                    <p className="font-quran text-2xl text-slate-950 dark:text-slate-100 font-bold leading-[2.2] overflow-visible">
                      {currentQ.arabicSnippet}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                    <span>Reference: Ayah {currentQ.targetAyahNumber}</span>
                    <AyahNumberBadge number={currentQ.targetAyahNumber} />
                  </div>
                </div>
              )}

              {currentQ.audioUrl && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                    <span>Listen to reference snippet:</span>
                  </span>
                  <button
                    onClick={handleToggleAudio}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
                    <span>{isPlayingAudio ? 'Pause' : 'Play Audio'}</span>
                  </button>
                </div>
              )}

              {currentQ.subPrompt && (
                <p className="text-xs text-slate-500 font-medium">{currentQ.subPrompt}</p>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2">
              {currentQ.options.map((opt) => {
                let btnStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';

                if (selectedOptionId === opt.id) {
                  if (isAnswerChecked) {
                    btnStyle = opt.isCorrect
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400'
                      : 'bg-red-50 border-red-500 text-red-950 ring-2 ring-red-400';
                  } else {
                    btnStyle = 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-300';
                  }
                } else if (isAnswerChecked && opt.isCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 border-dashed';
                }

                return (
                  <button
                    key={opt.id}
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <div className="space-y-1">
                      {opt.arabic && (
                        <p className="font-quran text-lg font-bold text-right" dir="rtl">
                          {opt.arabic}
                        </p>
                      )}
                      <p className="text-xs font-semibold">{opt.text}</p>
                    </div>

                    {isAnswerChecked && opt.isCorrect && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation */}
            {isAnswerChecked && (
              <div
                className={`p-3.5 rounded-2xl border text-xs space-y-1 animate-in fade-in ${
                  currentQ.options.find((o) => o.id === selectedOptionId)?.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="font-black flex items-center gap-1.5">
                  {currentQ.options.find((o) => o.id === selectedOptionId)?.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Correct!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Explanation:</span>
                    </>
                  )}
                </div>
                <p className="font-medium text-slate-700">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        ) : (
          /* Finished Test View */
          <div className="p-6 space-y-5 text-center flex-1 overflow-y-auto">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg ${
                isPassed
                  ? 'bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 ring-8 ring-amber-50'
                  : 'bg-slate-100 text-slate-600 ring-8 ring-slate-50'
              }`}
            >
              {isPassed ? <Award className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-2xl text-slate-900">
                {isPassed ? 'Surah Mastery Verified! 🎉' : 'Keep Practicing'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isPassed
                  ? `Congratulations! You scored ${scorePercentage}% on the ${meta.name} mastery exam.`
                  : `You scored ${scorePercentage}%. An 80% score is required to unlock full mastery badge.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl font-black text-slate-900">{scorePercentage}%</span>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">Accuracy Score</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-2xl font-black text-amber-800">
                  {isPassed ? '+250 XP' : '+50 XP'}
                </span>
                <p className="text-[11px] font-bold text-amber-600 mt-0.5">Experience Earned</p>
              </div>
            </div>

            {missedAyahs.length > 0 && onPracticeWeakAyah && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-left space-y-2">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-purple-600" />
                  <span>Targeted Reinforcement:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {missedAyahs.map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        onPracticeWeakAyah(surahNumber, a);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-purple-300 text-purple-950 font-bold text-xs hover:bg-purple-100 cursor-pointer"
                    >
                      Practice Ayah {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-[#FAF9F5] flex items-center justify-between">
          {!isTestFinished ? (
            <>
              {!isAnswerChecked ? (
                <button
                  disabled={!selectedOptionId}
                  onClick={handleCheckAnswer}
                  className={`w-full py-3 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                    selectedOptionId
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>

      <CoachMarkOverlay
        featureKey="mastery_exam"
        targetSelector='[data-coach="mastery-exam"]'
        badge="Mastery Exam"
        title="Surah Mastery Certification"
        description="Take a comprehensive blind active recall and verse ordering exam with 80%+ accuracy to earn your permanent Surah Mastery certification badge."
        icon={Trophy}
      />
    </div>
  );
};

function generateSurahQuestions(meta: SurahMeta, surahContent?: SurahContent): TestQuestion[] {
  if (meta.number === 1) {
    return [
      {
        id: 1,
        type: 'sequence-continuation',
        prompt: 'Which Ayah directly follows: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" [1:5]?',
        targetAyahNumber: 6,
        options: [
          {
            id: 'opt-1',
            text: 'Ihdināṣ-Ṣirāṭal-Mustaqīm (Guide us to the Straight Path)',
            arabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
            isCorrect: true,
          },
          {
            id: 'opt-2',
            text: 'Māliki Yawmid-Dīn (Sovereign of the Day of Recompense)',
            arabic: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
            isCorrect: false,
          },
          {
            id: 'opt-3',
            text: 'Ṣirāṭal-ladhīna anʿamta ʿalayhim',
            arabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
            isCorrect: false,
          },
        ],
        explanation: 'Ayah 5 is "Iyyāka naʿbudu wa-iyyāka nastaʿīn", which is directly followed by Ayah 6: "Ihdināṣ-Ṣirāṭal-Mustaqīm".',
      },
      {
        id: 2,
        type: 'missing-word',
        prompt: 'Fill in the missing word: "ٱلْحَمْدُ لِلَّهِ رَبِّ ________"',
        targetAyahNumber: 2,
        options: [
          { id: 'opt-a', text: 'al-ʿālamīn (The worlds)', arabic: 'ٱلْعَـٰلَمِينَ', isCorrect: true },
          { id: 'opt-b', text: 'an-Nās (Mankind)', arabic: 'ٱلنَّاسِ', isCorrect: false },
          { id: 'opt-c', text: 'al-Falaq (The Daybreak)', arabic: 'ٱلْفَلَقِ', isCorrect: false },
        ],
        explanation: 'Ayah 2 concludes with "Rabbi l-ʿālamīn" (Lord of all the worlds).',
      },
      {
        id: 3,
        type: 'audio-recognition',
        prompt: 'Listen to the verse recitation and identify its verse number:',
        audioUrl: getAyahAudioUrl(1, 4),
        targetAyahNumber: 4,
        options: [
          { id: 'opt-3a', text: 'Ayah 4: Māliki Yawmid-Dīn', isCorrect: true },
          { id: 'opt-3b', text: 'Ayah 3: Ar-Raḥmānir-Raḥīm', isCorrect: false },
          { id: 'opt-3c', text: 'Ayah 1: Bismillāhir-Raḥmānir-Raḥīm', isCorrect: false },
        ],
        explanation: 'The audio recites "Māliki Yawmid-Dīn", which is the 4th Ayah of Surah Al-Fatihah.',
      },
      {
        id: 4,
        type: 'wasl-link',
        prompt: 'How does the final verse of Al-Fatihah [1:7] begin?',
        targetAyahNumber: 7,
        options: [
          {
            id: 'opt-4a',
            text: 'Ṣirāṭal-ladhīna anʿamta ʿalayhim...',
            arabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
            isCorrect: true,
          },
          {
            id: 'opt-4b',
            text: 'Qul Huwal-Lāhu Aḥad',
            arabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
            isCorrect: false,
          },
        ],
        explanation: 'Ayah 7 begins with "Ṣirāṭal-ladhīna anʿamta ʿalayhim" and concludes with the 6-count Madd on "aḍ-Ḍāllīn".',
      },
    ];
  }

  return [
    {
      id: 1,
      type: 'sequence-continuation',
      prompt: `How does Surah ${meta.name} begin (Ayah 1)?`,
      targetAyahNumber: 1,
      options: [
        {
          id: 'opt-g1',
          text: surahContent?.ayahs[0]?.translation || `Opening verse of ${meta.name}`,
          arabic: surahContent?.ayahs[0]?.arabic || meta.arabicName,
          isCorrect: true,
        },
        {
          id: 'opt-g2',
          text: 'Qul Yā Ayyuhal-Kāfirūn',
          arabic: 'قُلْ يَـٰٓأَيُّهَا ٱلْكَـٰفِرُونَ',
          isCorrect: false,
        },
      ],
      explanation: `Ayah 1 of ${meta.name} starts the chapter with divine majesty.`,
    },
    {
      id: 2,
      type: 'audio-recognition',
      prompt: `Listen to this verse from Surah ${meta.name} and verify its sequence:`,
      audioUrl: getAyahAudioUrl(meta.number, 1),
      targetAyahNumber: 1,
      options: [
        { id: 'opt-g2a', text: `Ayah 1 of Surah ${meta.name}`, isCorrect: true },
        { id: 'opt-g2b', text: `Ayah 5 of Surah ${meta.name}`, isCorrect: false },
      ],
      explanation: `The recitation is the authentic opening verse of Surah ${meta.name}.`,
    },
  ];
}

export default SurahMasteryTestModal;
