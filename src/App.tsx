import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Flame,
  Sun,
  Compass,
  BarChart3,
  User,
  Check,
  Copy,
  X,
  Code2,
  BookOpen,
  Gamepad2,
  Target,
} from 'lucide-react';
import { TabType } from './types';
import { TodayView } from './components/today/TodayView';
import { SurahExplorerView } from './components/SurahExplorerView';
import { ProgressView } from './components/progress/ProgressView';
import { YouView } from './components/you/YouView';
import { PracticeGamesTabView } from './components/games/PracticeGamesTabView';
import { ExerciseCard } from './components/ExerciseCard';
import { mulkLessonExercises } from './data/mockExercises';
import { MemorizationLessonPage } from './components/memorization/MemorizationLessonPage';
import { MemorizationPlanPage } from './components/memorization/MemorizationPlanPage';
import { SpacedReviewSessionModal } from './components/memorization/SpacedReviewSessionModal';
import { SurahMasteryTestModal } from './components/memorization/SurahMasteryTestModal';
import { AyahGamesHubModal } from './components/games/AyahGamesHubModal';
import {
  ExerciseCompletionSummaryOverlay,
  ExerciseStepRecord,
} from './components/ExerciseCompletionSummaryOverlay';
import {
  recordRecallAttempt,
  getUserProgression,
  saveCurrentStudyPosition,
} from './services/memorizationEngine';
import { OnboardingFlow, isOnboardingCompleted } from './components/onboarding/OnboardingFlow';
import { InteractiveAppTour } from './components/tour/InteractiveAppTour';
import { hasUserCompletedTour, subscribeToTourReplay } from './services/tourService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SignInView } from './components/auth/SignInView';

function MainApp() {
  const { user, loading, isNewUser } = useAuth();
  // Four Flat Tabs Architecture: 'today' | 'explore' | 'progress' | 'you'
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [progressSubTab, setProgressSubTab] = useState<'hifz-map' | 'mastery-exams' | 'analytics'>('hifz-map');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number>(1);
  const [currentExerciseStep, setCurrentExerciseStep] = useState<number>(0);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !isOnboardingCompleted());
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Subscribe to tour replay events (from Settings or elsewhere)
  useEffect(() => {
    const unsubscribe = subscribeToTourReplay(() => {
      setIsTourOpen(true);
    });
    return () => unsubscribe();
  }, []);

  // Auto-launch tour on first landing if onboarding is done and tour hasn't run
  useEffect(() => {
    if (!showOnboarding && !hasUserCompletedTour()) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [showOnboarding]);

  // Exercise Sequence Step History & Completion Overlay State
  const [exerciseStepHistory, setExerciseStepHistory] = useState<ExerciseStepRecord[]>([]);
  const [showExerciseSummaryOverlay, setShowExerciseSummaryOverlay] = useState(false);
  const [completedSummaryStats, setCompletedSummaryStats] = useState<{
    totalExercises: number;
    correctCount: number;
    totalXP: number;
    streakDays: number;
    surahNumber: number;
    surahName: string;
    fullArabicRecitationSnippet: string;
  }>({
    totalExercises: 6,
    correctCount: 6,
    totalXP: 90,
    streakDays: 12,
    surahNumber: 67,
    surahName: 'Surah Al-Mulk',
    fullArabicRecitationSnippet:
      'أَوَلَمْ يَرَوْا۟ إِلَى ٱلطَّيْرِ فَوْقَهُمْ صَـٰٓفَّـٰتٍ وَيَقْبِضْنَ ۚ مَا يُمْسِكُهُنَّ إِلَّا ٱلرَّحْمَـٰنُ ۚ إِنَّهُۥ بِكُلِّ شَىْءٍۭ بَصِيرٌ',
  });

  // Standalone Full-Screen Overlays & Modals
  const [isMemorizationLessonOpen, setIsMemorizationLessonOpen] = useState(false);
  const [isSpacedReviewOpen, setIsSpacedReviewOpen] = useState(false);
  const [isSurahTestOpen, setIsSurahTestOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isGamesHubOpen, setIsGamesHubOpen] = useState(false);
  const [surahForTest, setSurahForTest] = useState<number>(1);

  // Cross-view handlers
  const handleStartLesson = (surahNumber = 1, ayahNumber = 1) => {
    setSelectedSurahNumber(surahNumber);
    setSelectedAyahNumber(ayahNumber);
    setIsMemorizationLessonOpen(true);
  };

  const handleStartExerciseSequence = () => {
    setCurrentExerciseStep(0);
    setExerciseStepHistory([]);
    setActiveTab('exercise');
  };

  const handleOpenPlanModal = () => {
    setIsPlanModalOpen(true);
  };

  const handleStartSurahTest = (surahNumber = 1) => {
    setSurahForTest(surahNumber);
    setIsSurahTestOpen(true);
  };

  const handleStartReview = (surahNumber?: number, ayahNumber?: number) => {
    if (surahNumber && ayahNumber) {
      setSelectedSurahNumber(surahNumber);
      setSelectedAyahNumber(ayahNumber);
      setIsMemorizationLessonOpen(true);
    } else {
      setIsSpacedReviewOpen(true);
    }
  };

  const handleExploreSurah = (surahNumber = 1) => {
    setSelectedSurahNumber(surahNumber);
    setActiveTab('study');
  };

  const handleExerciseComplete = (isCorrect: boolean) => {
    const currentEx = mulkLessonExercises[currentExerciseStep];
    if (!currentEx) return;

    const match = currentEx.ayahReference?.match(/\[(\d+):(\d+)\]/);
    const surahNum = match ? parseInt(match[1], 10) : selectedSurahNumber;
    const ayahNum = match ? parseInt(match[2], 10) : selectedAyahNumber;

    if (isCorrect) {
      recordRecallAttempt(surahNum, ayahNum, 'fill_blank', 4);
    }

    const stepRecord: ExerciseStepRecord = {
      stepNumber: currentEx.stepNumber || currentExerciseStep + 1,
      title: currentEx.title || `Exercise Step ${currentExerciseStep + 1}`,
      type: currentEx.type,
      ayahReference: currentEx.ayahReference,
      promptSnippet: currentEx.promptText?.slice(0, 50),
      isCorrect,
      xpEarned: isCorrect ? 15 : 0,
    };

    setExerciseStepHistory((prev) => {
      const filtered = prev.filter((s) => s.stepNumber !== stepRecord.stepNumber);
      return [...filtered, stepRecord];
    });
  };

  const handleExerciseContinue = () => {
    if (currentExerciseStep < mulkLessonExercises.length - 1) {
      setCurrentExerciseStep((prev) => prev + 1);
    } else {
      const currentEx = mulkLessonExercises[currentExerciseStep];
      const match = currentEx?.ayahReference?.match(/\[(\d+):(\d+)\]/);
      const surahNum = match ? parseInt(match[1], 10) : selectedSurahNumber;
      const ayahNum = match ? parseInt(match[2], 10) : selectedAyahNumber;

      recordRecallAttempt(surahNum, ayahNum, 'full_blind', 5);

      const allHistory = exerciseStepHistory;
      const correctCount = allHistory.filter((h) => h.isCorrect).length;
      const calculatedXP = correctCount * 15 + 30;
      const currentProg = getUserProgression();

      if (currentProg.activeStudyPosition) {
        setSelectedSurahNumber(currentProg.activeStudyPosition.surahNumber);
        setSelectedAyahNumber(currentProg.activeStudyPosition.ayahNumber);
      }

      setCompletedSummaryStats({
        totalExercises: mulkLessonExercises.length,
        correctCount: Math.max(correctCount, 1),
        totalXP: calculatedXP,
        streakDays: currentProg.streakDays || 12,
        surahNumber: surahNum || 67,
        surahName: surahNum === 67 ? 'Surah Al-Mulk' : `Surah ${surahNum}`,
        fullArabicRecitationSnippet:
          'أَوَلَمْ يَرَوْا۟ إِلَى ٱلطَّيْرِ فَوْقَهُمْ صَـٰٓفَّـٰتٍ وَيَقْبِضْنَ ۚ مَا يُمْسِكُهُنَّ إِلَّا ٱلرَّحْمَـٰنُ ۚ إِنَّهُۥ بِكُلِّ شَىْءٍۭ بَصِيرٌ',
      });

      setShowExerciseSummaryOverlay(true);
    }
  };

  const currentExercise = mulkLessonExercises[currentExerciseStep] || mulkLessonExercises[0];

  // Auth Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#FAF9F5] dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse mb-3">
          س
        </div>
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading your Silsila journey...</p>
      </div>
    );
  }

  // Google Sign-In Screen
  if (!user) {
    return <SignInView />;
  }

  // 100% Full-Screen Standalone First-Run Onboarding Flow
  if (isNewUser || showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => {
          setShowOnboarding(false);
          if (!hasUserCompletedTour()) {
            setTimeout(() => {
              setIsTourOpen(true);
            }, 300);
          }
        }}
        onOpenDetailedPlanEditor={() => {
          setShowOnboarding(false);
          setIsPlanModalOpen(true);
        }}
      />
    );
  }

  // 100% Full-Screen Standalone Memorization Drill
  if (isMemorizationLessonOpen) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-slate-900">
        <MemorizationLessonPage
          surahNumber={selectedSurahNumber}
          ayahNumber={selectedAyahNumber}
          onClose={() => setIsMemorizationLessonOpen(false)}
          onNavigateToAyah={(sNum, aNum) => {
            setSelectedSurahNumber(sNum);
            setSelectedAyahNumber(aNum);
          }}
          onOpenSurahTest={(sNum) => handleStartSurahTest(sNum)}
        />

        {/* Surah Mastery Test Modal */}
        {isSurahTestOpen && (
          <SurahMasteryTestModal
            surahNumber={surahForTest}
            onClose={() => setIsSurahTestOpen(false)}
            onPracticeWeakAyah={(sNum, aNum) => {
              setIsSurahTestOpen(false);
              handleStartLesson(sNum, aNum);
            }}
          />
        )}
      </div>
    );
  }

  // 100% Full-Screen Standalone Plan Selection & Configurator
  if (isPlanModalOpen) {
    return (
      <MemorizationPlanPage
        onClose={() => setIsPlanModalOpen(false)}
        onPlanCreated={() => {
          setIsPlanModalOpen(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF8] dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col font-sans-ui selection:bg-[#FEF7DA] dark:selection:bg-amber-950/50 selection:text-[#D97706] dark:selection:text-amber-400 transition-colors duration-200">
      {/* Main Content Viewport for 4 Flat Tabs */}
      <main className="flex-1 w-full max-w-xl mx-auto px-3 sm:px-4 pt-3 pb-20">
        {/* TAB 1: TODAY (HOME) */}
        {(activeTab === 'today' || activeTab === 'dashboard' || activeTab === 'learn') && (
          <TodayView
            onStartLesson={handleStartLesson}
            onNavigateToExplore={handleExploreSurah}
            onStartReviewSession={handleStartReview}
            onOpenSpacedDeck={() => setIsSpacedReviewOpen(true)}
            onOpenPlanModal={handleOpenPlanModal}
            onOpenGamesHub={() => setActiveTab('games')}
            onNavigateToProgress={(subTab = 'hifz-map') => {
              setProgressSubTab(subTab);
              setActiveTab('progress');
            }}
            onOpenSurahTest={handleStartSurahTest}
            onStartExerciseSequence={handleStartExerciseSequence}
          />
        )}

        {/* TAB 2: STUDY (Surah Explorer, Search, Tafsir, Quick Jump, Audio) */}
        {(activeTab === 'explore' || activeTab === 'study' || activeTab === 'surahs') && (
          <SurahExplorerView
            surahNumber={selectedSurahNumber}
            onBack={() => setActiveTab('today')}
            onStartLesson={handleStartLesson}
            onOpenAudio={(sNum) => {
              setSelectedSurahNumber(sNum);
            }}
          />
        )}

        {/* TAB 3 (CENTER): ARCADE & GAMES ARENA (Active Recall Games, Quests, 114 Surah Map, Spaced Decks) */}
        {(activeTab === 'games' || activeTab === 'arcade') && (
          <PracticeGamesTabView
            onStartLesson={handleStartLesson}
            onExploreSurah={handleExploreSurah}
            onOpenSpacedDeck={() => setIsSpacedReviewOpen(true)}
            onNavigateToProgress={(subTab = 'hifz-map') => {
              setProgressSubTab(subTab);
              setActiveTab('progress');
            }}
            onOpenSurahTest={handleStartSurahTest}
          />
        )}

        {/* TAB 4: PROGRESS / HIFZ JOURNEY MAP (Hifz Map, Mastery Exam History, SM-2 Retention) */}
        {(activeTab === 'progress' || activeTab === 'stats' || activeTab === 'review' || activeTab === 'journey' || activeTab === 'hifz') && (
          <ProgressView
            onStartLesson={handleStartLesson}
            onOpenSurahTest={handleStartSurahTest}
            onStartReviewSession={handleStartReview}
            onOpenSpacedDeck={() => setIsSpacedReviewOpen(true)}
            onExploreSurah={handleExploreSurah}
            onOpenPlanModal={handleOpenPlanModal}
            initialSubTab={activeTab === 'journey' || activeTab === 'hifz' ? 'hifz-map' : progressSubTab}
          />
        )}

        {/* TAB 5: YOU (Active Plan, Niyyah Journal, Preferences, Reciter) */}
        {(activeTab === 'you' || activeTab === 'profile' || activeTab === 'settings') && (
          <YouView
            onOpenPlanModal={handleOpenPlanModal}
          />
        )}

        {/* Optional standalone Exercise card if launched from arcade / drill */}
        {activeTab === 'exercise' && (
          <ExerciseCard
            type={currentExercise.type}
            progressCurrent={currentExercise.progressCurrent}
            progressTotal={currentExercise.progressTotal}
            promptText={currentExercise.promptText}
            ayahReference={currentExercise.ayahReference}
            ayahWithBlanks={currentExercise.ayahWithBlanks}
            wordBank={currentExercise.wordBank}
            correctBlanks={currentExercise.correctBlanks}
            blankCount={currentExercise.blankCount}
            options={currentExercise.options}
            direction={currentExercise.direction}
            tajweedTip={currentExercise.tajweedTip}
            onClose={() => setActiveTab('today')}
            onSubmit={handleExerciseComplete}
            onContinue={handleExerciseContinue}
          />
        )}
      </main>

      {/* Surah Mastery Verification Exam Modal */}
      {isSurahTestOpen && (
        <SurahMasteryTestModal
          surahNumber={surahForTest}
          onClose={() => setIsSurahTestOpen(false)}
          onPracticeWeakAyah={(sNum, aNum) => {
            setIsSurahTestOpen(false);
            handleStartLesson(sNum, aNum);
          }}
        />
      )}

      {/* Spaced Repetition Review Deck Modal */}
      {isSpacedReviewOpen && (
        <SpacedReviewSessionModal
          onClose={() => setIsSpacedReviewOpen(false)}
        />
      )}

      {/* Ayah Games Practice Hub Modal */}
      {isGamesHubOpen && (
        <AyahGamesHubModal
          onClose={() => setIsGamesHubOpen(false)}
          onStartLesson={(sNum = 1, aNum = 1) => {
            setIsGamesHubOpen(false);
            handleStartLesson(sNum, aNum);
          }}
          onDrillConfusionPair={(id1) => {
            setIsGamesHubOpen(false);
            const [s, a] = id1.split(':').map((v) => parseInt(v, 10));
            handleStartLesson(s || 1, a || 1);
          }}
        />
      )}

      {/* Exercise Sequence Celebratory Animation & Summary Overlay */}
      {showExerciseSummaryOverlay && (
        <ExerciseCompletionSummaryOverlay
          isOpen={showExerciseSummaryOverlay}
          onClose={() => {
            setShowExerciseSummaryOverlay(false);
            setActiveTab('today');
            setCurrentExerciseStep(0);
          }}
          onRestart={() => {
            setShowExerciseSummaryOverlay(false);
            handleStartExerciseSequence();
          }}
          onReturnToDashboard={() => {
            setShowExerciseSummaryOverlay(false);
            setActiveTab('today');
            setCurrentExerciseStep(0);
          }}
          onOpenSurahTest={(sNum) => {
            setShowExerciseSummaryOverlay(false);
            handleStartSurahTest(sNum);
          }}
          surahNumber={completedSummaryStats.surahNumber}
          surahName={completedSummaryStats.surahName}
          totalExercises={completedSummaryStats.totalExercises}
          correctCount={completedSummaryStats.correctCount}
          totalXP={completedSummaryStats.totalXP}
          streakDays={completedSummaryStats.streakDays}
          exerciseHistory={exerciseStepHistory}
          fullArabicRecitationSnippet={completedSummaryStats.fullArabicRecitationSnippet}
        />
      )}

      {/* ========================================================================= */}
      {/* 5 FLAT BOTTOM-NAV TABS: Today | Study | ARCADE (Center) | Progress | You   */}
      {/* ========================================================================= */}
      {activeTab !== 'exercise' && (
        <nav
          id="tour-bottom-nav"
          data-tour="bottom-nav"
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F5]/95 dark:bg-[#090C14]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-zinc-800/80 px-2 py-1 shadow-lg transition-colors"
        >
          <div className="max-w-xl mx-auto flex items-center justify-around h-14 sm:h-16">
            {/* Tab 1: Daily Sabaq (Home & Daily Queue) */}
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`flex-1 h-full flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all active:scale-95 cursor-pointer ${
                activeTab === 'today' || activeTab === 'dashboard' || activeTab === 'learn'
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-semibold'
              }`}
              aria-label="Daily Sabaq & Routine"
            >
              <div
                className={`px-2.5 py-1 rounded-full flex items-center justify-center transition-all ${
                  activeTab === 'today' || activeTab === 'dashboard' || activeTab === 'learn'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : ''
                }`}
              >
                <Sun className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10.5px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap">Sabaq</span>
            </button>

            {/* Tab 2: Mushaf (Quran Surahs, Recitations & Tafsir) */}
            <button
              type="button"
              onClick={() => setActiveTab('study')}
              className={`flex-1 h-full flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all active:scale-95 cursor-pointer ${
                activeTab === 'study' || activeTab === 'explore' || activeTab === 'surahs'
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-semibold'
              }`}
              aria-label="Mushaf & Quran Tafsir"
            >
              <div
                className={`px-2.5 py-1 rounded-full flex items-center justify-center transition-all ${
                  activeTab === 'study' || activeTab === 'explore' || activeTab === 'surahs'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : ''
                }`}
              >
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10.5px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap">Mushaf</span>
            </button>

            {/* Tab 3: PRACTICE */}
            <button
              type="button"
              onClick={() => setActiveTab('games')}
              className="flex-1 h-full flex flex-col items-center justify-center py-0.5 px-0.5 group cursor-pointer"
              aria-label="Quran Ayah Practice & Games"
            >
              <div
                className={`relative px-3 sm:px-3.5 py-1 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                  activeTab === 'games' || activeTab === 'arcade'
                    ? 'bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 scale-105 ring-2 ring-amber-400/40'
                    : 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/60 group-hover:scale-105 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60 shadow-2xs'
                }`}
              >
                <Target className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                  activeTab === 'games' || activeTab === 'arcade' ? 'stroke-[2.5]' : 'stroke-[2.2]'
                }`} />
              </div>
              <span className={`text-[10px] sm:text-[10.5px] font-black tracking-tight mt-0.5 whitespace-nowrap transition-colors ${
                activeTab === 'games' || activeTab === 'arcade'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-amber-800 dark:text-amber-400/90 group-hover:text-amber-600'
              }`}>
                Practice
              </span>
            </button>

            {/* Tab 4: Hifz Tracker (Journey Map, Mastery Exams, SM-2) */}
            <button
              type="button"
              onClick={() => {
                setProgressSubTab('hifz-map');
                setActiveTab('progress');
              }}
              className={`flex-1 h-full flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all active:scale-95 cursor-pointer ${
                activeTab === 'progress' || activeTab === 'stats' || activeTab === 'review' || activeTab === 'journey' || activeTab === 'hifz'
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-semibold'
              }`}
              aria-label="Hifz Tracker & Retention"
            >
              <div
                className={`px-2.5 py-1 rounded-full flex items-center justify-center transition-all ${
                  activeTab === 'progress' || activeTab === 'stats' || activeTab === 'review' || activeTab === 'journey' || activeTab === 'hifz'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : ''
                }`}
              >
                <BarChart3 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10.5px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap">Tracker</span>
            </button>

            {/* Tab 5: My Hifz (Niyyah, Target Plan, Audio & Profile) */}
            <button
              type="button"
              onClick={() => setActiveTab('you')}
              className={`flex-1 h-full flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all active:scale-95 cursor-pointer ${
                activeTab === 'you' || activeTab === 'profile' || activeTab === 'settings'
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-semibold'
              }`}
              aria-label="My Hifz, Niyyah & Preferences"
            >
              <div
                className={`px-2.5 py-1 rounded-full flex items-center justify-center transition-all ${
                  activeTab === 'you' || activeTab === 'profile' || activeTab === 'settings'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : ''
                }`}
              >
                <User className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10.5px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap">My Hifz</span>
            </button>
          </div>
        </nav>
      )}

      {/* Interactive Walkthrough Tour */}
      <InteractiveAppTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        activeTab={activeTab}
        onSwitchTab={(tab, subTab) => {
          setActiveTab(tab);
          if (subTab) {
            setProgressSubTab(subTab);
          }
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
