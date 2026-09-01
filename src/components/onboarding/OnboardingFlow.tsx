import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Target,
  Heart,
  Flame,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Compass,
  Star,
  Layers,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  MemorizationPlan,
  saveUserPlan,
  getUserProgression,
  saveUserProgression,
  createMemorizationPlan,
} from '../../services/memorizationEngine';
import { MEMORIZATION_PACKAGES } from '../../data/memorizationPackages';
import { addNiyyahEntry } from '../../services/niyyahService';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { useAuth } from '../../context/AuthContext';
import { SilsilaLogo, SilsilaEmblem } from '../ui/SilsilaLogo';

export interface OnboardingFlowProps {
  onComplete: () => void;
  onOpenDetailedPlanEditor?: () => void;
}

export type OnboardingStep = 'welcome' | 'path' | 'custom-start' | 'niyyah' | 'pace' | 'ready';

export const ONBOARDING_COMPLETED_KEY = 'silsila_onboarding_completed_v1';

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
  } catch {
    return true;
  }
}

export function setOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch {}
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onOpenDetailedPlanEditor,
}) => {
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedPathType, setSelectedPathType] = useState<
    'full_quran' | 'juz_30' | 'curated_package' | 'single_surah' | 'custom'
  >('full_quran');
  const [selectedCuratedPackageId, setSelectedCuratedPackageId] = useState<string>('foundations');
  const [startSurahNumber, setStartSurahNumber] = useState<number>(1);
  const [startAyahNumber, setStartAyahNumber] = useState<number>(1);
  const [dailyPace, setDailyPace] = useState<number>(3);
  const [niyyahText, setNiyyahText] = useState<string>(
    "To seek the pleasure and closeness of Allah, illuminate my heart, and live by His divine words."
  );
  const [niyyahCategory, setNiyyahCategory] = useState<'devotion' | 'understanding' | 'discipline' | 'legacy'>('devotion');
  const [niyyahCommitted, setNiyyahCommitted] = useState<boolean>(false);
  const [userName, setUserName] = useState(() => user?.displayName || 'Servant of Allah');

  const handleFinishOnboarding = async () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D97706', '#10B981', '#6366F1', '#F59E0B'],
      });
    } catch {}

    // 1. Build and save plan based on selection
    let selectedSurahs: number[] = [];
    let title = "The Whole Qur'an";
    let pType: 'full_quran' | 'single_surah' | 'package' | 'custom_selection' = 'full_quran';
    let pkgId: string | undefined = undefined;

    if (selectedPathType === 'full_quran') {
      selectedSurahs = Array.from({ length: 114 }, (_, i) => i + 1);
      title = "The Whole Qur'an (114 Surahs)";
      pType = 'full_quran';
    } else if (selectedPathType === 'juz_30') {
      selectedSurahs = Array.from({ length: 37 }, (_, i) => 78 + i);
      title = "Juz 'Amma (Juz 30)";
      pType = 'package';
      pkgId = 'juz_30';
    } else if (selectedPathType === 'curated_package') {
      const pkg = MEMORIZATION_PACKAGES.find((p) => p.id === selectedCuratedPackageId) || MEMORIZATION_PACKAGES[0];
      selectedSurahs = [...pkg.surahNumbers];
      title = pkg.title;
      pType = 'package';
      pkgId = pkg.id;
    } else if (selectedPathType === 'single_surah') {
      selectedSurahs = [startSurahNumber];
      const sMeta = ALL_114_SURAHS.find((s) => s.number === startSurahNumber) || ALL_114_SURAHS[0];
      title = `Surah ${sMeta.name} (${sMeta.arabicName})`;
      pType = 'single_surah';
    } else {
      selectedSurahs = [startSurahNumber];
      title = "Custom Hifz Journey";
      pType = 'custom_selection';
    }

    const createdPlan = createMemorizationPlan(
      pType,
      selectedSurahs,
      dailyPace,
      title,
      pkgId,
      { surahId: startSurahNumber, ayahNumber: startAyahNumber }
    );

    // 2. Save user progression initial position
    const prog = getUserProgression();
    prog.currentSurah = startSurahNumber;
    prog.currentAyah = startAyahNumber;
    prog.activeStudyPosition = {
      surahNumber: startSurahNumber,
      ayahNumber: startAyahNumber,
      stepNumber: 1,
    };
    saveUserProgression(prog);

    // 3. Save Niyyah Journal entry
    if (niyyahText.trim()) {
      addNiyyahEntry(niyyahText.trim(), niyyahCategory, 'Set during initial Silsila onboarding.', true);
    }

    // 4. Mark onboarding finished and sync to Firestore
    setOnboardingCompleted();
    await completeOnboarding(createdPlan);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF9F5] text-slate-900 p-3 sm:p-4 overflow-y-auto font-sans-ui selection:bg-[#FEF7DA]">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* TOP STEP TRACKER */}
        {currentStep !== 'welcome' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <button
                onClick={() => {
                  if (currentStep === 'path') setCurrentStep('welcome');
                  else if (currentStep === 'custom-start') setCurrentStep('path');
                  else if (currentStep === 'niyyah') setCurrentStep('custom-start');
                  else if (currentStep === 'pace') setCurrentStep('niyyah');
                  else if (currentStep === 'ready') setCurrentStep('pace');
                }}
                className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <span className="font-mono text-emerald-800 font-extrabold uppercase tracking-wider text-[11px]">
                Step{' '}
                {currentStep === 'path'
                  ? '1/4'
                  : currentStep === 'custom-start'
                  ? '2/4'
                  : currentStep === 'niyyah'
                  ? '3/4'
                  : currentStep === 'pace'
                  ? '4/4'
                  : 'Ready'}
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  ['path', 'custom-start', 'niyyah', 'pace', 'ready'].includes(currentStep)
                    ? 'bg-emerald-600 flex-1'
                    : 'bg-slate-200 flex-1'
                }`}
              />
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  ['custom-start', 'niyyah', 'pace', 'ready'].includes(currentStep)
                    ? 'bg-emerald-600 flex-1'
                    : 'bg-slate-200 flex-1'
                }`}
              />
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  ['niyyah', 'pace', 'ready'].includes(currentStep)
                    ? 'bg-emerald-600 flex-1'
                    : 'bg-slate-200 flex-1'
                }`}
              />
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  ['pace', 'ready'].includes(currentStep)
                    ? 'bg-emerald-600 flex-1'
                    : 'bg-slate-200 flex-1'
                }`}
              />
            </div>
          </div>
        )}

        {/* STEP 1: WELCOME & BRAND INTRODUCTION */}
        {currentStep === 'welcome' && (
          <div className="space-y-6 text-center py-2 animate-in fade-in">
            {/* Silsila Official Brand Logo */}
            <div className="flex justify-center pt-2">
              <SilsilaLogo
                variant="vertical"
                size="xl"
                tagline="Learn the Qur'an, Word by Word"
                className="drop-shadow-xs"
              />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
                Memorize the Holy Qur'an with unwavering retention, structured linear progression, and spiritual sincerity.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-3 gap-2.5 text-left pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-amber-800 font-extrabold text-xs block">1. Sabaq</span>
                <p className="text-[10.5px] text-slate-500 font-medium">New verse daily linear lock</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-indigo-800 font-extrabold text-xs block">2. Sabqi</span>
                <p className="text-[10.5px] text-slate-500 font-medium">Recent 7-day recall cycle</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-emerald-800 font-extrabold text-xs block">3. Manzil</span>
                <p className="text-[10.5px] text-slate-500 font-medium">Spaced lifetime revision</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('path')}
              className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Begin Setup →</span>
            </button>
          </div>
        )}

        {/* STEP 2: PATH SELECTION */}
        {currentStep === 'path' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Select Your Memorization Path
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose your primary Quranic goal to tailor your progression sequence.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'full_quran',
                  title: "The Whole Qur'an",
                  subtitle: "From Surah Al-Fatihah (1) to An-Nas (114) • 6,236 Ayahs",
                  badge: 'Complete Tahfeez',
                  icon: BookOpen,
                  color: 'border-amber-400 bg-amber-50/50',
                },
                {
                  id: 'juz_30',
                  title: "Juz 'Amma (Juz 30)",
                  subtitle: "Short Surahs (An-Naba 78 to An-Nas 114) • 37 Surahs",
                  badge: 'Popular for Starters',
                  icon: Target,
                  color: 'border-indigo-400 bg-indigo-50/50',
                },
                {
                  id: 'curated_package',
                  title: "Curated Surah Packages",
                  subtitle: "Essential surahs: Al-Mulk, As-Sajdah, Al-Kahf, Yasin, Ar-Rahman",
                  badge: 'Protection & Virtues',
                  icon: Sparkles,
                  color: 'border-purple-400 bg-purple-50/50',
                },
                {
                  id: 'single_surah',
                  title: "Specific Surah Focus",
                  subtitle: "Select any single Surah of your choice to master completely",
                  badge: 'Targeted',
                  icon: Compass,
                  color: 'border-emerald-400 bg-emerald-50/50',
                },
              ].map((path) => (
                <button
                  key={path.id}
                  onClick={() => setSelectedPathType(path.id as any)}
                  className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                    selectedPathType === path.id
                      ? `${path.color} ring-2 ring-emerald-400/20`
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedPathType === path.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <path.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900">{path.title}</h4>
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {path.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{path.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* If curated packages chosen, show selector */}
            {selectedPathType === 'curated_package' && (
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2 animate-in fade-in">
                <span className="text-[11px] font-extrabold text-purple-900 uppercase">
                  Select Curated Package:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {MEMORIZATION_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedCuratedPackageId(pkg.id)}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        selectedCuratedPackageId === pkg.id
                          ? 'bg-white border-purple-500 text-purple-950 ring-2 ring-purple-200 shadow-2xs'
                          : 'bg-purple-50/50 border-purple-200 text-purple-800 hover:bg-white'
                      }`}
                    >
                      <p className="truncate font-black">{pkg.title}</p>
                      <p className="text-[10px] font-normal opacity-80">{pkg.surahNumbers.length} Surahs</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setCurrentStep('custom-start')}
              className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer mt-2"
            >
              <span>Continue to Starting Verse →</span>
            </button>
          </div>
        )}

        {/* STEP 3: CUSTOM START POINT */}
        {currentStep === 'custom-start' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Where Would You Like to Begin?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Start from the beginning or resume from what you already know.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                  Starting Surah:
                </label>
                <select
                  value={startSurahNumber}
                  onChange={(e) => {
                    const sNum = parseInt(e.target.value, 10) || 1;
                    setStartSurahNumber(sNum);
                    setStartAyahNumber(1);
                  }}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 font-bold text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {ALL_114_SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. Surah {s.name} ({s.arabicName}) — {s.totalAyahs} Ayat
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                  Starting Ayah:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={ALL_114_SURAHS.find((s) => s.number === startSurahNumber)?.totalAyahs || 7}
                    value={startAyahNumber}
                    onChange={(e) => setStartAyahNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-24 p-3 rounded-xl bg-white border border-slate-300 font-bold text-xs sm:text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    of {ALL_114_SURAHS.find((s) => s.number === startSurahNumber)?.totalAyahs || 7} total ayahs
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('niyyah')}
              className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer mt-2"
            >
              <span>Continue to Niyyah (Intention) →</span>
            </button>
          </div>
        )}

        {/* STEP 4: NIYYAH (INTENTION) */}
        {currentStep === 'niyyah' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10.5px] font-black uppercase tracking-wider border border-rose-200">
                Innamal a'malu bin-niyyat
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Renew Your Sacred Intention (Niyyah)
              </h2>
              <p className="text-xs text-slate-500">
                "Actions are judged by intentions." State why you are memorizing Allah's book.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                  Your Primary Intention:
                </label>
                <textarea
                  rows={3}
                  value={niyyahText}
                  onChange={(e) => setNiyyahText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-rose-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Why are you embarking on this Quran journey?"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Intention Category:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'devotion', label: 'Devotion to Allah' },
                    { id: 'understanding', label: 'Living by Guidance' },
                    { id: 'discipline', label: 'Spiritual Discipline' },
                    { id: 'legacy', label: 'Preserving Sacred Tradition' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNiyyahCategory(cat.id as any)}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        niyyahCategory === cat.id
                          ? 'bg-rose-100 border-rose-400 text-rose-900 ring-2 ring-rose-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50/30'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Niyyah Commitment Checkbox - Defaults Unchecked */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-rose-200/90 cursor-pointer hover:bg-rose-50/40 transition-colors">
                <input
                  type="checkbox"
                  checked={niyyahCommitted}
                  onChange={(e) => setNiyyahCommitted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-extrabold text-slate-900 block">
                    I commit this sacred intention for the sake of Allah alone
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    To learn His divine words with sincerity, perseverance, and humility.
                  </span>
                </div>
              </label>
            </div>

            <button
              onClick={() => setCurrentStep('pace')}
              className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer mt-2"
            >
              <span>Continue to Daily Pace →</span>
            </button>
          </div>
        )}

        {/* STEP 5: DAILY PACE & COMMITMENT */}
        {currentStep === 'pace' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Choose Your Daily Pace
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consistency over intensity. Small daily habits produce steady Hafiz completion.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  pace: 1,
                  title: '1 Ayah / Day',
                  subtitle: '~10 mins daily • Deep reflection',
                  badge: 'Gentle & Steady',
                },
                {
                  pace: 3,
                  title: '3 Ayahs / Day',
                  subtitle: '~20 mins daily • Recommended standard',
                  badge: 'Balanced',
                },
                {
                  pace: 5,
                  title: '5 Ayahs / Day',
                  subtitle: '~35 mins daily • Active student',
                  badge: 'Accelerated',
                },
                {
                  pace: 10,
                  title: '10 Ayahs / Day',
                  subtitle: '~60 mins daily • Full-time Tahfeez',
                  badge: 'Intensive',
                },
              ].map((p) => (
                <button
                  key={p.pace}
                  onClick={() => setDailyPace(p.pace)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                    dailyPace === p.pace
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                    <h4 className="font-black text-sm text-slate-900 mt-1.5">{p.title}</h4>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium mt-1">{p.subtitle}</p>
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Points Gating Economy Activated</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-normal">
                You begin with <strong>15 Hifz Points</strong>. Keep a minimum balance of <strong>5 points</strong> by passing reviews (+1 pt each) to unlock consecutive verses.
              </p>
            </div>

            <button
              onClick={handleFinishOnboarding}
              className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer mt-2"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Complete Setup & Begin Interactive Tour →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
