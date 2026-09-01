import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  BookOpen,
  Sparkles,
  Layers,
  CheckSquare,
  Shield,
  Star,
  Flame,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  Compass,
  Bookmark,
  Info,
  Heart,
  Zap,
  HelpCircle,
  Brain,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sliders,
  CheckCircle,
  Lightbulb,
  X,
} from 'lucide-react';
import { ALL_114_SURAHS, SurahMeta } from '../../data/quranMetadata';
import { MEMORIZATION_PACKAGES } from '../../data/memorizationPackages';
import {
  PlanType,
  MemorizationPlan,
  createMemorizationPlan,
  getUserPlan,
} from '../../services/memorizationEngine';

interface MemorizationPlanPageProps {
  onClose: () => void;
  onPlanCreated?: (plan: MemorizationPlan) => void;
  initialStep?: 1 | 2 | 3;
}

export const MemorizationPlanPage: React.FC<MemorizationPlanPageProps> = ({
  onClose,
  onPlanCreated,
  initialStep = 1,
}) => {
  // Wizard view state: 1 (Path Selection), 2 (Path Details & Customization), 3 (Pace & Intention)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialStep);

  // Active top tab mode: 'planner' (Main 3-step wizard) or 'walkthrough' (Educational Feature Deep Dive & Why Guide)
  const [activeTabMode, setActiveTabMode] = useState<'planner' | 'walkthrough'>('planner');

  // Selected plan type
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType>('full_quran');

  // Screen 2a (Single Surah)
  const [selectedSingleSurah, setSelectedSingleSurah] = useState<number>(67); // Default Al-Mulk

  // Screen 2b (Package)
  const [selectedPackageId, setSelectedPackageId] = useState<string>('juz_30');

  // Screen 2c (Custom Multi-Surah Selection)
  const [selectedCustomSurahs, setSelectedCustomSurahs] = useState<number[]>([1, 67, 112, 113, 114]);

  // Filter & Search state for Surah lists
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'meccan' | 'medinan' | 'juz30' | 'short'>('all');

  // Screen 3 (Pace & Intention)
  const [dailyPace, setDailyPace] = useState<number>(3);
  const [hasConfirmedNiyyah, setHasConfirmedNiyyah] = useState<boolean>(false);
  const [hasPriorMemorization, setHasPriorMemorization] = useState<boolean>(false);
  const [customStartSurah, setCustomStartSurah] = useState<number>(1);
  const [customStartAyah, setCustomStartAyah] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Expandable "Why choose this?" drawers in Step 1
  const [expandedWhyPath, setExpandedWhyPath] = useState<PlanType | null>(null);

  // Synchronize with active plan on mount
  useEffect(() => {
    const activePlan = getUserPlan();
    if (activePlan) {
      setSelectedPlanType(activePlan.planType || 'full_quran');
      if (activePlan.planType === 'single_surah' && activePlan.selectedSurahs?.[0]) {
        setSelectedSingleSurah(activePlan.selectedSurahs[0]);
      } else if (activePlan.planType === 'package' && activePlan.packageId) {
        setSelectedPackageId(activePlan.packageId);
      } else if (activePlan.planType === 'custom_selection' && activePlan.selectedSurahs?.length > 0) {
        setSelectedCustomSurahs(activePlan.selectedSurahs);
      }
      setDailyPace(activePlan.dailyPace || 3);
    }
  }, []);

  // Quick picks for popular surahs in Single Surah mode
  const popularSurahIds = [67, 18, 36, 55, 56, 78, 1, 112, 113, 114];

  // Filtered Surahs for Screen 2a (Single) and 2c (Custom)
  const filteredSurahs = useMemo(() => {
    return ALL_114_SURAHS.filter((surah) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        surah.name.toLowerCase().includes(q) ||
        surah.transliteration.toLowerCase().includes(q) ||
        surah.translation.toLowerCase().includes(q) ||
        surah.number.toString() === q;

      if (!matchesQuery) return false;

      if (filterCategory === 'meccan') return surah.revelationType === 'Meccan';
      if (filterCategory === 'medinan') return surah.revelationType === 'Medinan';
      if (filterCategory === 'juz30') return surah.number >= 78;
      if (filterCategory === 'short') return surah.totalAyahs < 20;

      return true;
    });
  }, [searchQuery, filterCategory]);

  // Compute selected surahs list in mushaf order based on plan type
  const effectiveSelectedSurahs = useMemo(() => {
    if (selectedPlanType === 'full_quran') {
      return Array.from({ length: 114 }, (_, i) => i + 1);
    }
    if (selectedPlanType === 'single_surah') {
      return [selectedSingleSurah];
    }
    if (selectedPlanType === 'package') {
      const pkg = MEMORIZATION_PACKAGES.find((p) => p.id === selectedPackageId);
      return pkg ? [...pkg.surahNumbers].sort((a, b) => a - b) : [67];
    }
    if (selectedPlanType === 'custom_selection') {
      return selectedCustomSurahs.length > 0 ? [...selectedCustomSurahs].sort((a, b) => a - b) : [1];
    }
    return [1];
  }, [selectedPlanType, selectedSingleSurah, selectedPackageId, selectedCustomSurahs]);

  // Compute total ayat count for active selection
  const totalSelectedAyat = useMemo(() => {
    return effectiveSelectedSurahs.reduce((sum, sNum) => {
      const meta = ALL_114_SURAHS.find((s) => s.number === sNum);
      return sum + (meta ? meta.totalAyahs : 7);
    }, 0);
  }, [effectiveSelectedSurahs]);

  // Estimated days calculation
  const estDays = Math.ceil(totalSelectedAyat / Math.max(1, dailyPace));
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + estDays);
  const formattedTargetDate = completionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Toggle surah selection in custom multi-select mode
  const handleToggleSurah = (surahNumber: number) => {
    setSelectedCustomSurahs((prev) => {
      if (prev.includes(surahNumber)) {
        const next = prev.filter((id) => id !== surahNumber);
        return next.length > 0 ? next : [surahNumber]; // Keep at least 1
      } else {
        return [...prev, surahNumber].sort((a, b) => a - b);
      }
    });
  };

  // Select all / clear all in custom mode
  const handleSelectAllFiltered = () => {
    const ids = filteredSurahs.map((s) => s.number);
    setSelectedCustomSurahs((prev) => {
      const set = new Set([...prev, ...ids]);
      return Array.from(set).sort((a, b) => a - b);
    });
  };

  const handleClearSelection = () => {
    setSelectedCustomSurahs([1]); // default to Al-Fatihah
  };

  // Next step handler
  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedPlanType === 'custom_selection' && selectedCustomSurahs.length === 0) {
        setSelectedCustomSurahs([1]);
      }
      setCurrentStep(3);
    }
  };

  // Final plan submission
  const handleConfirmPlan = () => {
    setIsSubmitting(true);
    let title = '';
    let pkgId: string | undefined = undefined;

    if (selectedPlanType === 'full_quran') {
      title = "The Whole Qur'an";
    } else if (selectedPlanType === 'single_surah') {
      const s = ALL_114_SURAHS.find((m) => m.number === selectedSingleSurah);
      title = `Surah ${s?.name || 'Selected'} (${s?.transliteration || ''})`;
    } else if (selectedPlanType === 'package') {
      const pkg = MEMORIZATION_PACKAGES.find((p) => p.id === selectedPackageId);
      title = pkg ? pkg.title : 'Memorization Package';
      pkgId = selectedPackageId;
    } else if (selectedPlanType === 'custom_selection') {
      title = `Custom Selection (${effectiveSelectedSurahs.length} Surahs)`;
    }

    const startAyahPosition = hasPriorMemorization
      ? { surahId: customStartSurah, ayahNumber: customStartAyah }
      : undefined;

    const createdPlan = createMemorizationPlan(
      selectedPlanType,
      effectiveSelectedSurahs,
      dailyPace,
      title,
      pkgId,
      startAyahPosition
    );

    setTimeout(() => {
      setIsSubmitting(false);
      if (onPlanCreated) {
        onPlanCreated(createdPlan);
      }
      onClose();
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col selection:bg-amber-100 selection:text-amber-900 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP FULL-PAGE APP BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-tight truncate">
                  Memorization Target & Strategy
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 shrink-0">
                  {activeTabMode === 'planner' ? `Step ${currentStep} of 3` : 'Feature Guide'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                {activeTabMode === 'walkthrough'
                  ? 'Feature walkthrough & the science behind the Hifz engine'
                  : currentStep === 1
                  ? 'Choose your learning path (Whole Qur’an, Single Surah, Package, or Custom)'
                  : currentStep === 2
                  ? 'Customize Surahs, chapters & linear milestones'
                  : 'Set daily pace, study schedule & confirm sincere intention'}
              </p>
            </div>
          </div>

          {/* Toggle between Interactive Configurator and Feature Guide */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTabMode(activeTabMode === 'planner' ? 'walkthrough' : 'planner')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                activeTabMode === 'walkthrough'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">
                {activeTabMode === 'walkthrough' ? 'Return to Plan' : 'Why & Features'}
              </span>
              <span className="sm:hidden">
                {activeTabMode === 'walkthrough' ? 'Plan' : 'Why'}
              </span>
            </button>
          </div>
        </div>

        {/* STEP PROGRESS NAVIGATION TABS (Shown when in planner mode) */}
        {activeTabMode === 'planner' && (
          <div className="max-w-4xl mx-auto mt-2.5 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-3 text-center text-xs font-bold divide-x divide-slate-200/60 bg-slate-100/90 rounded-xl p-1 border border-slate-200/60">
              <button
                onClick={() => setCurrentStep(1)}
                className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  currentStep === 1
                    ? 'bg-white text-amber-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-amber-500/15 text-amber-900 text-[10px] flex items-center justify-center font-black">
                  1
                </span>
                <span className="truncate">1. Select Path</span>
              </button>

              <button
                onClick={() => setCurrentStep(2)}
                className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  currentStep === 2
                    ? 'bg-white text-amber-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-amber-500/15 text-amber-900 text-[10px] flex items-center justify-center font-black">
                  2
                </span>
                <span className="truncate">2. Configure</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  currentStep === 3
                    ? 'bg-white text-amber-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-amber-500/15 text-amber-900 text-[10px] flex items-center justify-center font-black">
                  3
                </span>
                <span className="truncate">3. Commitment</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN BODY CONTENT */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-28 space-y-6">
        {/* ======================================================================= */}
        {/* MODE A: FEATURE WALKTHROUGH & "WHY" GUIDE */}
        {/* ======================================================================= */}
        {activeTabMode === 'walkthrough' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Hero banner for walkthrough */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-lg sm:text-xl leading-tight">
                    The Science & Tradition of Quranic Memorization
                  </h2>
                  <p className="text-amber-100 text-xs font-medium">
                    Why structured targets, spaced repetition, and 3-tier review guarantee long-term retention.
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-amber-50/90 leading-relaxed pt-1">
                Memorizing the Qur’an is a sacred lifelong covenant. Traditional madrasahs combined with modern cognitive science (SuperMemo SM-2 & Ebbinghaus Forgetting Curve) prove that systematic, low-stress daily consistency outperforms rapid cramming every time.
              </p>
            </div>

            {/* Feature 1: The 3 Pillars of Classical Hifz */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    The 3-Tier Memorization Engine (Sabaq, Sabqi, Manzil)
                  </h3>
                  <p className="text-xs text-slate-500">How Silsila organizes every verse you study</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <span className="font-black uppercase tracking-wider text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md inline-block">
                    Tier 1: Sabaq (New Verse)
                  </span>
                  <h4 className="font-extrabold text-slate-900">Initial Discovery</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Interactive audio-visual breakdown: word-by-word tajweed, root vocabulary, audio repetition, and 2-3 letter word-bank drills.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <span className="font-black uppercase tracking-wider text-[10px] text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded-md inline-block">
                    Tier 2: Sabqi (Recent Lessons)
                  </span>
                  <h4 className="font-extrabold text-slate-900">Near-Term Consolidation</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Reviewing the previous 3–5 pages memorized within the past 14 days to prevent early memory fading before neural consolidation.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <span className="font-black uppercase tracking-wider text-[10px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md inline-block">
                    Tier 3: Manzil (Permanent Retention)
                  </span>
                  <h4 className="font-extrabold text-slate-900">Spaced Cycle (SM-2)</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Automated review cues calculated specifically before your retention drops below 85%, ensuring permanent memory for life.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2: Why 4 Different Path Types? */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Why Choose Different Paths?
                  </h3>
                  <p className="text-xs text-slate-500">Finding the exact strategy matching your current life stage</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900">1. The Whole Qur'an (114 Surahs)</h4>
                    <p className="text-slate-600 mt-0.5 font-medium leading-relaxed">
                      <strong>Why choose this:</strong> For dedicated seekers committed to full Hifz. It provides a structured 30-Juz linear milestone roadmap from Surah Al-Fatihah to An-Nas with continuous retention tracking.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 flex items-start gap-3">
                  <Target className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900">2. Specific Single Surah</h4>
                    <p className="text-slate-600 mt-0.5 font-medium leading-relaxed">
                      <strong>Why choose this:</strong> Perfect when you want to master high-virtue chapters like Surah Al-Mulk (nightly protection), Surah Al-Kahf (Friday light), Surah Ya-Sin, or Ar-Rahman without feeling overwhelmed by 30 Ajza’.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 flex items-start gap-3">
                  <Layers className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900">3. Curated Packages</h4>
                    <p className="text-slate-600 mt-0.5 font-medium leading-relaxed">
                      <strong>Why choose this:</strong> Handpicked thematic sets structured for natural milestones (e.g. Juz 'Amma, The 4 Quls & Daily Protection, Virtues & Solace). Ideal for families, busy students, and progressive learners.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200/60 flex items-start gap-3">
                  <CheckSquare className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900">4. Custom Multi-Surah Selection</h4>
                    <p className="text-slate-600 mt-0.5 font-medium leading-relaxed">
                      <strong>Why choose this:</strong> Complete flexibility to select any 3, 7, or 25 Surahs you wish to memorize together. The engine automatically orders your custom picks in traditional Mushaf sequence.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: The Power of Daily Pace & Niyyah */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Why Pace & Sincere Intention (Niyyah) Matter
                  </h3>
                  <p className="text-xs text-slate-500">The psychological and spiritual principles behind steady progress</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 font-medium leading-relaxed">
                <p>
                  The Prophet ﷺ taught: <em className="text-slate-800 font-semibold">"The most beloved of deeds to Allah are those that are most consistent, even if they are small."</em> (Sahih al-Bukhari).
                </p>
                <p>
                  Setting a daily pace of <strong>3 to 5 ayat per day</strong> allows you to allocate 15–20 focused minutes daily. This builds deep neural memory traces while leaving ample cognitive capacity for daily revision drills.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveTabMode('planner');
                    setCurrentStep(1);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Ready to Configure Your Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* MODE B: 3-STEP INTERACTIVE PLANNER */}
        {/* ======================================================================= */}
        {activeTabMode === 'planner' && (
          <div className="space-y-6">
            {/* ===================================================================== */}
            {/* STEP 1: PATH SELECTION */}
            {/* ===================================================================== */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Choose Your Memorization Goal
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto font-medium">
                    Select a structured path below. Each path adapts the daily drills, review cycles, and milestone exams to your exact target.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {/* OPTION 1: Whole Quran */}
                  <div
                    className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                      selectedPlanType === 'full_quran'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-xs ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedPlanType('full_quran')}
                      className="flex items-start gap-3.5 cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          selectedPlanType === 'full_quran'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                        }`}
                      >
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                            Memorize the Whole Qur'an
                          </h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 shrink-0">
                            114 Surahs • 6,236 Ayat
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                          Complete 30-Juz linear journey from Surah Al-Fatihah to An-Nas with continuous retention gating.
                        </p>
                      </div>
                      <div className="shrink-0 pt-1">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedPlanType === 'full_quran'
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selectedPlanType === 'full_quran' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible "Why this path?" button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex flex-col gap-2">
                      <button
                        onClick={() =>
                          setExpandedWhyPath(expandedWhyPath === 'full_quran' ? null : 'full_quran')
                        }
                        className="text-[11px] font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1 cursor-pointer self-start"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Why choose this path?</span>
                        {expandedWhyPath === 'full_quran' ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedWhyPath === 'full_quran' && (
                        <div className="p-3 rounded-2xl bg-amber-50/70 text-xs text-slate-700 space-y-1.5 animate-in fade-in">
                          <p>
                            <strong>Best for:</strong> Aspiring Huffaz committed to the full traditional curriculum.
                          </p>
                          <p>
                            <strong>How it works:</strong> The system gates your progress through checkpoints at the end of each Quarter-Hizb, Half-Juz, and Full-Juz, testing your long-term retention before unlocking subsequent chapters.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OPTION 2: Specific Single Surah */}
                  <div
                    className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                      selectedPlanType === 'single_surah'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-xs ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedPlanType('single_surah')}
                      className="flex items-start gap-3.5 cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          selectedPlanType === 'single_surah'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200/60'
                        }`}
                      >
                        <Target className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                            Memorize a Specific Surah
                          </h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 shrink-0">
                            Single Chapter Focus
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                          Master high-virtue chapters (e.g. Al-Mulk, Al-Kahf, Ya-Sin, Ar-Rahman) with dedicated depth.
                        </p>
                      </div>
                      <div className="shrink-0 pt-1">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedPlanType === 'single_surah'
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selectedPlanType === 'single_surah' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex flex-col gap-2">
                      <button
                        onClick={() =>
                          setExpandedWhyPath(expandedWhyPath === 'single_surah' ? null : 'single_surah')
                        }
                        className="text-[11px] font-bold text-indigo-800 hover:text-indigo-600 flex items-center gap-1 cursor-pointer self-start"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Why choose this path?</span>
                        {expandedWhyPath === 'single_surah' ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedWhyPath === 'single_surah' && (
                        <div className="p-3 rounded-2xl bg-indigo-50/70 text-xs text-slate-700 space-y-1.5 animate-in fade-in">
                          <p>
                            <strong>Best for:</strong> Achieving a tangible, deeply rewarding spiritual milestone in 1 to 4 weeks.
                          </p>
                          <p>
                            <strong>How it works:</strong> Breaks down your chosen Surah into small 3-5 ayah clusters with comprehensive final Surah Mastery Exam upon completion.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OPTION 3: Curated Packages */}
                  <div
                    className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                      selectedPlanType === 'package'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-xs ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedPlanType('package')}
                      className="flex items-start gap-3.5 cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          selectedPlanType === 'package'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                        }`}
                      >
                        <Layers className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                            Choose a Curated Package
                          </h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 shrink-0">
                            Themed Collections
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                          Sets like Juz 'Amma (Juz 30), The 4 Quls & Daily Protection, or Virtues & Light.
                        </p>
                      </div>
                      <div className="shrink-0 pt-1">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedPlanType === 'package'
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selectedPlanType === 'package' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex flex-col gap-2">
                      <button
                        onClick={() =>
                          setExpandedWhyPath(expandedWhyPath === 'package' ? null : 'package')
                        }
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-600 flex items-center gap-1 cursor-pointer self-start"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Why choose this path?</span>
                        {expandedWhyPath === 'package' ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedWhyPath === 'package' && (
                        <div className="p-3 rounded-2xl bg-emerald-50/70 text-xs text-slate-700 space-y-1.5 animate-in fade-in">
                          <p>
                            <strong>Best for:</strong> Practical daily prayers, protection athkar, and natural Juz-level milestones.
                          </p>
                          <p>
                            <strong>How it works:</strong> Pre-grouped chapters ordered logically to maximize motivation and frequent recitations in Salah.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OPTION 4: Custom Multi-Surah Selection */}
                  <div
                    className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                      selectedPlanType === 'custom_selection'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-xs ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedPlanType('custom_selection')}
                      className="flex items-start gap-3.5 cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          selectedPlanType === 'custom_selection'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-purple-50 text-purple-800 border border-purple-200/60'
                        }`}
                      >
                        <CheckSquare className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                            Choose Your Own Surahs
                          </h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 shrink-0">
                            Custom Multi-Select
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                          Pick any combination of chapters from the 114 Surahs. Automatically organized in Mushaf order.
                        </p>
                      </div>
                      <div className="shrink-0 pt-1">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedPlanType === 'custom_selection'
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selectedPlanType === 'custom_selection' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex flex-col gap-2">
                      <button
                        onClick={() =>
                          setExpandedWhyPath(expandedWhyPath === 'custom_selection' ? null : 'custom_selection')
                        }
                        className="text-[11px] font-bold text-purple-800 hover:text-purple-600 flex items-center gap-1 cursor-pointer self-start"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-purple-700" />
                        <span>Why choose this path?</span>
                        {expandedWhyPath === 'custom_selection' ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedWhyPath === 'custom_selection' && (
                        <div className="p-3 rounded-2xl bg-purple-50/70 text-xs text-slate-700 space-y-1.5 animate-in fade-in">
                          <p>
                            <strong>Best for:</strong> Advanced learners with specific goals (e.g. reviewing Surahs previously learned in school).
                          </p>
                          <p>
                            <strong>How it works:</strong> Allows you to handpick 2, 5, or 20 Surahs and sequence them automatically according to standard Mushaf numbering.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* STEP 2: CONFIGURE PATH */}
            {/* ===================================================================== */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* 2a. FULL QURAN */}
                {selectedPlanType === 'full_quran' && (
                  <div className="space-y-4">
                    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                            The Whole Qur'an Linear Milestone Roadmap
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            114 Surahs • 30 Ajza' • 6,236 Ayat Total
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Your memorization path will begin with Surah Al-Fatihah, continuing through the foundational chapters of the Qur’an. The engine automatically inserts Spaced Review Sessions (Manzil) after every section.
                      </p>

                      <div className="grid grid-cols-3 gap-2.5 text-center pt-2">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Milestones
                          </span>
                          <span className="font-black text-sm sm:text-base text-slate-900">30 Ajza'</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Total Verses
                          </span>
                          <span className="font-black text-sm sm:text-base text-amber-800">6,236 Ayat</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Retention Gating
                          </span>
                          <span className="font-black text-sm sm:text-base text-slate-900">SM-2 Spaced</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2b. SINGLE SURAH */}
                {selectedPlanType === 'single_surah' && (
                  <div className="space-y-4">
                    {/* Quick Picks for popular surahs */}
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                        Popular Focus Surahs
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                        {popularSurahIds.map((sNum) => {
                          const s = ALL_114_SURAHS.find((m) => m.number === sNum);
                          if (!s) return null;
                          const isSelected = selectedSingleSurah === sNum;
                          return (
                            <button
                              key={sNum}
                              onClick={() => setSelectedSingleSurah(sNum)}
                              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-100 shadow-2xs'
                              }`}
                            >
                              <span>{s.transliteration}</span>
                              <span className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-slate-400'}`}>
                                ({s.totalAyahs}a)
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Search & Filter Header */}
                    <div className="space-y-2.5">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search 114 Surahs by name or number (e.g. Al-Mulk, 67)..."
                          className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Filter categories */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                        {[
                          { id: 'all', label: 'All 114 Surahs' },
                          { id: 'juz30', label: "Juz 'Amma (37)" },
                          { id: 'short', label: 'Short (<20)' },
                          { id: 'meccan', label: 'Meccan' },
                          { id: 'medinan', label: 'Medinan' },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setFilterCategory(cat.id as any)}
                            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap text-xs transition-colors cursor-pointer ${
                              filterCategory === cat.id
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 shadow-2xs'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Surah List */}
                    <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
                      {filteredSurahs.map((surah) => {
                        const isSelected = selectedSingleSurah === surah.number;
                        return (
                          <button
                            key={surah.number}
                            onClick={() => setSelectedSingleSurah(surah.number)}
                            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20'
                                : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {surah.number}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                                    {surah.transliteration}
                                  </h4>
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    • {surah.totalAyahs} ayat
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate font-medium">
                                  {surah.translation} ({surah.revelationType})
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-quran text-base sm:text-lg text-slate-700 dark:text-slate-200">
                                {surah.name}
                              </span>
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-amber-600 bg-amber-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2c. CURATED PACKAGES */}
                {selectedPlanType === 'package' && (
                  <div className="space-y-3">
                    <div className="text-center pb-1">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Select a Curated Memorization Package
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Structured sets curated around classical themes and daily recitation virtues.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-1">
                      {MEMORIZATION_PACKAGES.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        const totalAyahs = pkg.surahNumbers.reduce((sum, sNum) => {
                          const m = ALL_114_SURAHS.find((s) => s.number === sNum);
                          return sum + (m ? m.totalAyahs : 0);
                        }, 0);

                        return (
                          <button
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`w-full p-4 sm:p-5 rounded-3xl border text-left transition-all flex flex-col gap-2.5 cursor-pointer relative ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500/40 shadow-xs ring-2 ring-amber-500/20'
                                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                                  }`}
                                >
                                  <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                                      {pkg.title}
                                    </h4>
                                    {pkg.badge && (
                                      <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                        {pkg.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs font-semibold text-slate-500">
                                    {pkg.subtitle}
                                  </p>
                                </div>
                              </div>

                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                                  isSelected
                                    ? 'border-amber-600 bg-amber-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              {pkg.description}
                            </p>

                            <div className="flex items-center justify-between pt-2 text-xs font-bold text-slate-500 border-t border-slate-100">
                              <span>{pkg.surahNumbers.length} Surahs included</span>
                              <span className="text-amber-800 font-extrabold">{totalAyahs} Ayat total</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2d. CUSTOM MULTI-SELECT */}
                {selectedPlanType === 'custom_selection' && (
                  <div className="space-y-4">
                    {/* Top Running Summary Pill */}
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="font-extrabold text-xs sm:text-sm text-amber-900">
                          {selectedCustomSurahs.length} Surah{selectedCustomSurahs.length !== 1 ? 's' : ''} selected •{' '}
                          {totalSelectedAyat} ayat total
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSelectAllFiltered}
                          className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 text-amber-900 hover:bg-amber-100/60 transition-colors cursor-pointer shadow-2xs"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleClearSelection}
                          className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="space-y-2.5">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search 114 Surahs by name, number, meaning..."
                          className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Filter categories */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                        {[
                          { id: 'all', label: 'All (114)' },
                          { id: 'juz30', label: "Juz 'Amma (37)" },
                          { id: 'short', label: 'Short (<20)' },
                          { id: 'meccan', label: 'Meccan (86)' },
                          { id: 'medinan', label: 'Medinan (28)' },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setFilterCategory(cat.id as any)}
                            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap text-xs transition-colors cursor-pointer ${
                              filterCategory === cat.id
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 shadow-2xs'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 114 Surahs Checkbox List */}
                    <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
                      {filteredSurahs.map((surah) => {
                        const isChecked = selectedCustomSurahs.includes(surah.number);
                        return (
                          <div
                            key={surah.number}
                            onClick={() => handleToggleSurah(surah.number)}
                            className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                              isChecked
                                ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20'
                                : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                  isChecked
                                    ? 'bg-amber-600 border-amber-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>

                              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {surah.number}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                                    {surah.transliteration}
                                  </h4>
                                  <span className="text-[10px] font-bold text-slate-400">
                                    • {surah.totalAyahs} ayat
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate font-medium">
                                  {surah.translation} ({surah.revelationType})
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-quran text-base text-slate-700 dark:text-slate-200">
                                {surah.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================== */}
            {/* STEP 3: COMMITMENT, PACE & NIYYAH */}
            {/* ===================================================================== */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Plan Summary Card */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                        {selectedPlanType === 'full_quran'
                          ? "Whole Qur'an"
                          : selectedPlanType === 'single_surah'
                          ? 'Single Surah'
                          : selectedPlanType === 'package'
                          ? 'Curated Package'
                          : 'Custom Selection'}
                      </span>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mt-1.5">
                        {selectedPlanType === 'full_quran'
                          ? "The Whole Qur'an (114 Surahs)"
                          : selectedPlanType === 'single_surah'
                          ? `Surah ${ALL_114_SURAHS.find((s) => s.number === selectedSingleSurah)?.name || ''} (${
                              ALL_114_SURAHS.find((s) => s.number === selectedSingleSurah)?.transliteration || ''
                            })`
                          : selectedPlanType === 'package'
                          ? MEMORIZATION_PACKAGES.find((p) => p.id === selectedPackageId)?.title || 'Curated Package'
                          : `Custom Selection (${effectiveSelectedSurahs.length} Surahs)`}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        {totalSelectedAyat} Ayat
                      </span>
                      <p className="text-xs text-slate-400 font-semibold">
                        {effectiveSelectedSurahs.length} Surah{effectiveSelectedSurahs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* List of included surahs preview */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Sequence of Surahs
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {effectiveSelectedSurahs.slice(0, 24).map((sNum) => {
                        const meta = ALL_114_SURAHS.find((s) => s.number === sNum);
                        return (
                          <span
                            key={sNum}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                          >
                            <span className="text-slate-400">#{sNum}</span>
                            <span>{meta?.transliteration || `Surah ${sNum}`}</span>
                          </span>
                        );
                      })}
                      {effectiveSelectedSurahs.length > 24 && (
                        <span className="px-2 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-black">
                          +{effectiveSelectedSurahs.length - 24} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Daily Pace Selector Card */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                        Daily Verse Pace
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        How many new verses (Sabaq) you aim to memorize each day
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 font-black text-sm sm:text-base">
                      {dailyPace} {dailyPace === 1 ? 'Ayah' : 'Ayat'} / day
                    </div>
                  </div>

                  {/* Preset Pace Chips */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { pace: 1, label: 'Gentle (1/day)', time: '~10 min' },
                      { pace: 3, label: 'Balanced (3/day)', time: '~20 min' },
                      { pace: 5, label: 'Dedicated (5/day)', time: '~35 min' },
                      { pace: 10, label: 'Intensive (10/day)', time: '~60 min' },
                    ].map((item) => (
                      <button
                        key={item.pace}
                        onClick={() => setDailyPace(item.pace)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          dailyPace === item.pace
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-extrabold text-xs block">{item.pace} Ayat</span>
                        <span className={`text-[10px] block mt-0.5 ${dailyPace === item.pace ? 'text-amber-100' : 'text-slate-400'}`}>
                          {item.time}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Estimated Target Date */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                      <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <span className="font-bold">Projected Completion:</span>
                    </div>
                    <span className="font-black text-amber-950 dark:text-amber-100">
                      {formattedTargetDate} ({estDays} days)
                    </span>
                  </div>
                </div>

                {/* Prior Memorization Starting Point (Optional for experienced learners) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                          Prior Memorization Starting Point
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Have you already memorized part of this plan? Set your exact starting point. Strict linear advancement applies forward from there.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={hasPriorMemorization}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setHasPriorMemorization(checked);
                          if (checked && effectiveSelectedSurahs.length > 0) {
                            setCustomStartSurah(effectiveSelectedSurahs[0]);
                            setCustomStartAyah(1);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {hasPriorMemorization && (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/40 space-y-3 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                            Starting Surah:
                          </label>
                          <select
                            value={customStartSurah}
                            onChange={(e) => {
                              const sNum = parseInt(e.target.value, 10);
                              setCustomStartSurah(sNum);
                              setCustomStartAyah(1);
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                            {effectiveSelectedSurahs.map((sNum) => {
                              const meta = ALL_114_SURAHS.find((s) => s.number === sNum);
                              return (
                                <option key={sNum} value={sNum}>
                                  #{sNum} {meta?.transliteration || `Surah ${sNum}`} ({meta?.totalAyahs || 7} ayat)
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                            Starting Ayah:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={ALL_114_SURAHS.find((s) => s.number === customStartSurah)?.totalAyahs || 7}
                              value={customStartAyah}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                const maxAyahs = ALL_114_SURAHS.find((s) => s.number === customStartSurah)?.totalAyahs || 7;
                                setCustomStartAyah(Math.max(1, Math.min(val, maxAyahs)));
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <span className="text-xs text-indigo-800 dark:text-indigo-300 font-semibold whitespace-nowrap">
                              / {ALL_114_SURAHS.find((s) => s.number === customStartSurah)?.totalAyahs || 7}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-indigo-900 dark:text-indigo-200 font-medium">
                        <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>All preceding verses will be registered as prior retention for rolling Spaced Review.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sincere Intention (Niyyah) Oath Card */}
                <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
                    <Heart className="w-5 h-5 fill-amber-700 text-amber-700" />
                    <span>Confirm Your Sincere Intention (Niyyah)</span>
                  </div>

                  <p className="font-quran text-right text-base sm:text-lg text-amber-950 leading-loose">
                    إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ
                  </p>

                  <p className="text-xs text-amber-900/90 font-medium leading-relaxed">
                    "I intend to memorize these verses purely for the pleasure of Allah, to preserve His words in my heart, and to act upon its guidance."
                  </p>

                  <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasConfirmedNiyyah}
                      onChange={(e) => setHasConfirmedNiyyah(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      I make this commitment with reverence and consistency
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. STICKY BOTTOM ACTION BAR */}
      {/* ========================================================================= */}
      {activeTabMode === 'planner' && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 sm:px-6 py-3.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1))}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs min-h-[44px]"
              >
                Cancel
              </button>
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleConfirmPlan}
                disabled={!hasConfirmedNiyyah || isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Activating Plan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Activate Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};
