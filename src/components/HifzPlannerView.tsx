import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Check,
  Trophy,
  ArrowRight,
  Calculator,
  Flame,
  Target,
  Clock,
  Play,
} from 'lucide-react';
import { ALL_114_SURAHS, SurahMeta } from '../data/quranMetadata';
import {
  getUserProgression,
  UserProgressionState,
  getUserPlan,
  saveUserPlan,
  getMemorizationStatsSummary,
} from '../services/memorizationEngine';
import { SURAH_CONTENT_DB } from '../data/quranVerses';

interface HifzPlannerViewProps {
  onStartLesson: (surahNumber?: number, ayahNumber?: number) => void;
  onExploreSurah: (surahNumber: number) => void;
  onOpenPlanModal?: () => void;
}

export const HifzPlannerView: React.FC<HifzPlannerViewProps> = ({
  onStartLesson,
  onExploreSurah,
  onOpenPlanModal,
}) => {
  const [sabaqCompleted, setSabaqCompleted] = useState<boolean>(false);
  const [sabqiCompleted, setSabqiCompleted] = useState<boolean>(true);
  const [manzilCompleted, setManzilCompleted] = useState<boolean>(false);
  const [progression, setProgression] = useState<UserProgressionState>(() => getUserProgression());
  const [userPlan, setUserPlan] = useState(() => getUserPlan());
  const [stats, setStats] = useState(() => getMemorizationStatsSummary());
  const [targetJuz, setTargetJuz] = useState<number>(30);
  const [dailyPace, setDailyPace] = useState<number>(() => getUserPlan().dailyPace || 3);

  useEffect(() => {
    const refresh = () => {
      setProgression(getUserProgression());
      setUserPlan(getUserPlan());
      setStats(getMemorizationStatsSummary());
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('hafiz_progress_updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('hafiz_progress_updated', refresh);
    };
  }, []);

  const currentSurahMeta: SurahMeta =
    ALL_114_SURAHS.find((s) => s.number === progression.currentSurah) || ALL_114_SURAHS[0];
  const currentSurahContent =
    SURAH_CONTENT_DB[progression.currentSurah] || SURAH_CONTENT_DB[1];
  const currentAyahDetail =
    currentSurahContent?.ayahs?.find((a) => a.number === progression.currentAyah) ||
    currentSurahContent?.ayahs?.[0];

  const totalPlanAyahs = userPlan.orderedAyahSequence.length || 1;
  const memorizedInPlan = userPlan.currentIndex;
  const remainingAyahs = Math.max(0, totalPlanAyahs - memorizedInPlan);
  const pace = userPlan.dailyPace || 3;
  const daysNeeded = Math.ceil(remainingAyahs / pace);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysNeeded);

  const formattedDate = completionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Active Plan Header & Switcher */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white text-slate-900 border border-amber-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center border border-amber-500/20 shrink-0">
              <Target className="w-5 h-5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-base text-slate-900 truncate">
                  {userPlan.title || 'Active Hifz Plan'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-black text-[10px] shrink-0">
                  {userPlan.planType === 'full_quran'
                    ? "Whole Qur'an"
                    : userPlan.planType === 'single_surah'
                    ? 'Single Surah'
                    : userPlan.planType === 'package'
                    ? 'Package'
                    : 'Custom Multi-Surah'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {userPlan.targetSurahs.length} Surah{userPlan.targetSurahs.length === 1 ? '' : 's'} • {totalPlanAyahs} Total Ayat • {userPlan.dailyPace} ayat/day
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPlanModal}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 font-black text-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            Change Plan
          </button>
        </div>

        {/* Progress Bar & Stats */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, Math.round((memorizedInPlan / totalPlanAyahs) * 100))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500">
            <span>{memorizedInPlan} of {totalPlanAyahs} Ayat ({Math.round((memorizedInPlan / totalPlanAyahs) * 100)}%)</span>
            <span>Est. Finish: {formattedDate} ({daysNeeded}d)</span>
          </div>
        </div>

        {/* 3 Pillars Summary Cards */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
          {/* Sabaq Status */}
          <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-center space-y-1">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-800">1. Sabaq</span>
            <p className="text-xs font-bold text-slate-800">Today's Ayah {progression.currentAyah}</p>
            <span className={`text-[10px] font-bold flex items-center justify-center gap-1 ${sabaqCompleted ? 'text-emerald-600' : 'text-amber-700'}`}>
              {sabaqCompleted && <Check className="w-3 h-3 stroke-[2.5]" />}
              <span>{sabaqCompleted ? 'Done' : 'In Progress'}</span>
            </span>
          </div>

          {/* Sabqi Status */}
          <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center space-y-1">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-indigo-800">2. Sabqi</span>
            <p className="text-xs font-bold text-slate-800">Last 7 Days</p>
            <span className={`text-[10px] font-bold flex items-center justify-center gap-1 ${sabqiCompleted ? 'text-emerald-600' : 'text-indigo-700'}`}>
              {sabqiCompleted && <Check className="w-3 h-3 stroke-[2.5]" />}
              <span>{sabqiCompleted ? 'Completed' : 'Pending'}</span>
            </span>
          </div>

          {/* Manzil Status */}
          <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center space-y-1">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-800">3. Manzil</span>
            <p className="text-xs font-bold text-slate-800">1/30th Quran</p>
            <span className={`text-[10px] font-bold flex items-center justify-center gap-1 ${manzilCompleted ? 'text-emerald-600' : 'text-emerald-700'}`}>
              {manzilCompleted && <Check className="w-3 h-3 stroke-[2.5]" />}
              <span>{manzilCompleted ? 'Done' : 'Pending'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* TIER 1: SABAQ (TODAY'S NEW LESSON) */}
      <section className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xs">
              سبق
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Tier 1: Sabaq (Today's New Lesson)</h3>
              <p className="text-[11px] text-slate-500 font-medium">Memorize new verses with perfect Tajweed</p>
            </div>
          </div>

          <button
            onClick={() => setSabaqCompleted(!sabaqCompleted)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              sabaqCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
            <span>Surah {currentSurahMeta.name} ({currentSurahMeta.arabicName}) • Ayah {progression.currentAyah} of {currentSurahMeta.totalAyahs}</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-black text-[10px]">Active Target</span>
          </div>
          <p className="font-quran text-lg text-slate-800 text-right leading-loose dark:text-slate-100" dir="rtl">
            {currentAyahDetail?.arabic || 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'}
          </p>
          <p className="text-xs text-slate-600 line-clamp-1 italic">
            "{currentAyahDetail?.translation || currentSurahMeta.translation}"
          </p>
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => onStartLesson(progression.currentSurah, progression.currentAyah)}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs hover:bg-amber-700 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Practice Ayah {progression.currentAyah} Now</span>
            </button>
            <span className="text-[11px] text-amber-700 font-bold">Est. 5-10 mins</span>
          </div>
        </div>
      </section>

      {/* TIER 2: SABQI (RECENT RETENTION) */}
      <section className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xs">
              سبقي
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Tier 2: Sabqi (Recent 7-Day Memory)</h3>
              <p className="text-[11px] text-slate-500 font-medium">Solidify recently memorized verses</p>
            </div>
          </div>

          <button
            onClick={() => setSabqiCompleted(!sabqiCompleted)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              sabqiCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-indigo-950">
            <span>Surah Al-Mulk (67:1 – 67:30)</span>
            <span>Full Chapter Review</span>
          </div>
          <p className="text-xs text-slate-600">
            Recite without looking at the Mushaf to test rapid retrieval and smooth transitions.
          </p>
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => onExploreSurah(67)}
              className="px-4 py-2 rounded-xl bg-[#6366F1] text-white text-xs font-black flex items-center gap-1.5 shadow-xs hover:bg-[#4F46E5] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Review Al-Mulk</span>
            </button>
            <span className="text-[11px] text-indigo-700 font-bold">100% Solid</span>
          </div>
        </div>
      </section>

      {/* TIER 3: MANZIL (CYCLIC REVISION) */}
      <section className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs">
              منزل
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Tier 3: Manzil (Permanent Retention)</h3>
              <p className="text-[11px] text-slate-500 font-medium">Daily cyclic revision to prevent forgetting</p>
            </div>
          </div>

          <button
            onClick={() => setManzilCompleted(!manzilCompleted)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              manzilCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-emerald-950">
            <span>Today's Rotation: Juz 30 ('Amma)</span>
            <span>Surahs 78 – 114</span>
          </div>
          <p className="text-xs text-slate-600">
            Divide across your 5 daily prayers (recite 2 Surahs in each Salah Sunnah).
          </p>
        </div>
      </section>

      {/* TARGET CALCULATOR & TIMELINE PREDICTOR */}
      <section className="p-4 rounded-3xl bg-[#FAF9F5] border border-amber-900/15 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FEF7DA] text-[#D97706] flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Hifz Target & Timeline Predictor</h3>
            <p className="text-[11px] text-slate-500 font-medium">Calculate your completion date based on daily pace</p>
          </div>
        </div>

        {/* Goal Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTargetJuz(30)}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              targetJuz === 30
                ? 'bg-white border-amber-400 shadow-xs'
                : 'bg-slate-100/70 border-slate-200 text-slate-600'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Goal #1</span>
            <p className="text-xs font-extrabold text-slate-900">Juz 30 ('Amma)</p>
            <span className="text-[10px] text-slate-500">564 Verses</span>
          </button>

          <button
            onClick={() => setTargetJuz(0)}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              targetJuz === 0
                ? 'bg-white border-amber-400 shadow-xs'
                : 'bg-slate-100/70 border-slate-200 text-slate-600'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Goal #2</span>
            <p className="text-xs font-extrabold text-slate-900">Whole Qur'an</p>
            <span className="text-[10px] text-slate-500">6,236 Verses</span>
          </button>
        </div>

        {/* Daily Pace Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Daily Memorization Pace</span>
            <span className="text-amber-700 font-black">{dailyPace} Ayahs / Day</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 3, 5, 10].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  setDailyPace(rate);
                  const updatedPlan = { ...userPlan, dailyPace: rate };
                  setUserPlan(updatedPlan);
                  saveUserPlan(updatedPlan);
                  window.dispatchEvent(new Event('hafiz_progress_updated'));
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dailyPace === rate
                    ? 'bg-amber-500 text-white font-black shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {rate} {rate === 1 ? 'Ayah' : 'Ayahs'}
              </button>
            ))}
          </div>
        </div>

        {/* Projected Completion Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 block">
              Estimated Completion Date
            </span>
            <p className="text-sm sm:text-base font-black tracking-tight">{formattedDate}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
              {daysNeeded} Days
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
