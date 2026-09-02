import React, { useState, useEffect } from 'react';
import {
  User,
  Heart,
  Target,
  Settings,
  Volume2,
  Bell,
  Sparkles,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Compass,
  ShieldCheck,
  Calendar,
  Layers,
  Edit3,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import {
  getUserPlan,
  getMemorizationStatsSummary,
  clearLearningHistory,
  getHifzPoints,
  getUserProgression,
} from '../../services/memorizationEngine';
import {
  getNiyyahEntries,
  addNiyyahEntry,
  setPrimaryNiyyah,
  deleteNiyyahEntry,
  NiyyahEntry,
  SPIRITUAL_REFLECTIONS,
} from '../../services/niyyahService';
import { RECITERS_LIST, ReciterInfo } from '../../services/quranDataService';
import { getStoredTheme, setAppTheme, AppTheme } from '../../services/themeService';
import { triggerTourReplay } from '../../services/tourService';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useAuth } from '../../context/AuthContext';
import { SilsilaLogo, SilsilaEmblem } from '../ui/SilsilaLogo';

export interface YouViewProps {
  onOpenPlanModal: () => void;
}

export const YouView: React.FC<YouViewProps> = ({ onOpenPlanModal }) => {
  const { user } = useAuth();
  const [userName, setUserName] = useState(() => user?.displayName || 'Seeker of Quran');
  const [userPlan, setUserPlan] = useState(() => getUserPlan());
  const [stats, setStats] = useState(() => getMemorizationStatsSummary());
  const [points, setPoints] = useState(() => getHifzPoints());
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => getStoredTheme());
  const [niyyahEntries, setNiyyahEntries] = useState<NiyyahEntry[]>(() => getNiyyahEntries());
  const [showAddNiyyah, setShowAddNiyyah] = useState(false);
  const [newIntentionText, setNewIntentionText] = useState('');
  const [newCategory, setNewCategory] = useState<NiyyahEntry['category']>('devotion');
  const [newReflectionNotes, setNewReflectionNotes] = useState('');
  const [selectedReciter, setSelectedReciter] = useState<string>('Mishary Rashid Alafasy');
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('06:30');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useScrollLock(showResetConfirm);

  useEffect(() => {
    if (user?.displayName) {
      setUserName(user.displayName);
    }
  }, [user?.displayName]);

  const refresh = () => {
    setUserPlan(getUserPlan());
    setStats(getMemorizationStatsSummary());
    setPoints(getHifzPoints());
    setNiyyahEntries(getNiyyahEntries());
    setCurrentTheme(getStoredTheme());
  };

  useEffect(() => {
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('hafiz_progress_updated', refresh);
    window.addEventListener('silsila_progression_updated', refresh);
    window.addEventListener('silsila_points_updated', refresh);
    window.addEventListener('hafiz_niyyah_updated', refresh);
    window.addEventListener('silsila_theme_changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('hafiz_progress_updated', refresh);
      window.removeEventListener('silsila_progression_updated', refresh);
      window.removeEventListener('silsila_points_updated', refresh);
      window.removeEventListener('hafiz_niyyah_updated', refresh);
      window.removeEventListener('silsila_theme_changed', refresh);
    };
  }, []);

  const handleCreateNiyyah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntentionText.trim()) return;
    addNiyyahEntry(newIntentionText, newCategory, newReflectionNotes, false);
    setNewIntentionText('');
    setNewReflectionNotes('');
    setShowAddNiyyah(false);
    setNiyyahEntries(getNiyyahEntries());
  };

  const handleSaveName = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    clearLearningHistory();
    setShowResetConfirm(false);
    refresh();
  };

  const primaryNiyyah = niyyahEntries.find((n) => n.isPrimary) || niyyahEntries[0];

  return (
    <div className="w-full space-y-4 pb-2 animate-in fade-in duration-300">
      {/* 1. TOP PROFILE HEADER */}
      <header className="flex items-center justify-between px-0.5 pt-1">
        <div>
          <h1 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            My Hifz Journey
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Your connection, intentions & preferences
          </p>
        </div>

        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={userName}
            className="w-9 h-9 rounded-xl object-cover shadow-xs border border-indigo-200 dark:border-indigo-800"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </header>

      {/* 2. CURRENT PLAN SUMMARY (TAHFEEZ PATH CHOSEN AT ONBOARDING) */}
      <section id="tour-you-plan" data-tour="you-plan" className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black text-xs flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <Target className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Active Hifz Path
              </h3>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                {userPlan.title}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPlanModal}
            className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs active:scale-95"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
              {userPlan.dailyPace || 3} Ayahs/Day
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Daily Target</span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 block">
              {userPlan.selectedSurahs?.length || 114} Surahs
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Scope</span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">
              {stats.planPercent}% Done
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Progress</span>
          </div>
        </div>
      </section>

      {/* 2.5 HIFZ POINTS & GATING ECONOMY */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Hifz Points & Verse Gating
              </h3>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                Minimum 5 points required to unlock new Sabaq verses
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-emerald-500/15 dark:bg-emerald-950/60 border border-emerald-500/30 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-300 font-black text-xs flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
            <span>{points} pts Balance</span>
          </div>
        </div>

        {/* Breakdown of Rules */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">+10 pts</span>
            <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">New Ayah Drill</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">+1 pt</span>
            <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">Spaced Review</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-xs font-black text-rose-700 dark:text-rose-400 block">-1 pt</span>
            <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">Lesson Mistake</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-xs font-black text-rose-700 dark:text-rose-400 block">-3 pts</span>
            <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">Exam Mistake</span>
          </div>
        </div>
      </section>

      {/* 3. NIYYAH (INTENTION) HISTORY & REFLECTION JOURNAL */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-black text-xs flex items-center justify-center border border-rose-200 dark:border-rose-800">
              <Heart className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Niyyah & Sincerity Journal
              </h3>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                Renew your intention for Allah's sake (Ikhlas)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddNiyyah(!showAddNiyyah)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Niyyah</span>
          </button>
        </div>

        {/* Primary Niyyah Highlight Banner */}
        {primaryNiyyah && (
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Primary Intention
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {new Date(primaryNiyyah.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 italic">
              "{primaryNiyyah.intentionText}"
            </p>
            {primaryNiyyah.reflectionNotes && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-amber-200/50 dark:border-amber-800/40">
                Reflection: {primaryNiyyah.reflectionNotes}
              </p>
            )}
          </div>
        )}

        {/* Add New Niyyah Form */}
        {showAddNiyyah && (
          <form onSubmit={handleCreateNiyyah} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Set a New Intention</h4>
            <textarea
              value={newIntentionText}
              onChange={(e) => setNewIntentionText(e.target.value)}
              placeholder="What is your sincere intention for this Hifz milestone?"
              rows={2}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
            <input
              type="text"
              value={newReflectionNotes}
              onChange={(e) => setNewReflectionNotes(e.target.value)}
              placeholder="Personal reflection or note (optional)"
              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddNiyyah(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Save Intention
              </button>
            </div>
          </form>
        )}

        {/* Spiritual Guidance Quote */}
        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-1">
          <p className="text-[11.5px] font-medium text-emerald-950 dark:text-emerald-200 italic">
            {SPIRITUAL_REFLECTIONS[0].hadith}
          </p>
          <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">
            — {SPIRITUAL_REFLECTIONS[0].source}
          </p>
        </div>
      </section>

      {/* 4. SETTINGS & AUDIO PREFERENCES */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
          Preferences & Audio Reciter
        </h3>

        {/* Theme Mode Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              Appearance & Theme
            </label>
            <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
              {currentTheme}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setCurrentTheme('light');
                setAppTheme('light');
              }}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                currentTheme === 'light'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Light</span>
            </button>

            <button
              onClick={() => {
                setCurrentTheme('dark');
                setAppTheme('dark');
              }}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                currentTheme === 'dark'
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Dark</span>
            </button>

            <button
              onClick={() => {
                setCurrentTheme('system');
                setAppTheme('system');
              }}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                currentTheme === 'system'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Auto</span>
            </button>
          </div>
        </div>

        {/* Reciter Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
            Default Quran Reciter
          </label>
          <select
            value={selectedReciter}
            onChange={(e) => setSelectedReciter(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            {RECITERS_LIST.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name} ({r.style})
              </option>
            ))}
          </select>
        </div>

        {/* Daily Notifications */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">Daily Hifz Reminder</span>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Gentle cue for daily Sabaq</span>
          </div>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Interactive App Tour */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">App Walkthrough Tour</span>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Replay the interactive guided tour</span>
          </div>
          <button
            onClick={() => triggerTourReplay()}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Replay Tour</span>
          </button>
        </div>

        {/* Reset / Backup Data */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">Learning Data</span>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Stored safely on this device</span>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            Reset Progress
          </button>
        </div>
      </section>

      {/* 5. OFFICIAL BRAND IDENTITY & ABOUT SILSILA */}
      <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs space-y-3.5 text-center">
        <div className="flex justify-center">
          <SilsilaLogo
            variant="vertical"
            size="md"
            tagline="Learn the Qur'an, Word by Word"
          />
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
          Silsila (سلسلة) is built with active recall drills, linear Sabaq locking, SM-2 spaced repetition, and authentic Uthmani Quranic script.
        </p>

        <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-bold text-amber-800 dark:text-amber-400">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80">
            Version 2.4.0
          </span>
          <span>•</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            Open Source Hifz
          </span>
        </div>
      </section>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Reset Learning Progress?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This will restore all memorization records and intervals back to initial starter values.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
