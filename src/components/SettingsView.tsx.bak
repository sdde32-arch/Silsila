import React, { useState, useEffect } from 'react';
import {
  User,
  Volume2,
  Bell,
  Heart,
  HelpCircle,
  RotateCcw,
  LogOut,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Check,
  Sparkles,
  Info,
  Type,
  Moon,
  Sun,
  Laptop,
  Flame,
  Star,
  X,
  BookOpen,
  Compass,
} from 'lucide-react';
import { mockQaris } from '../data/appData';
import { Card } from './ui/Card';
import { getUserPlan } from '../services/memorizationEngine';
import { Target } from 'lucide-react';
import { getStoredTheme, setAppTheme, AppTheme } from '../services/themeService';
import { triggerTourReplay } from '../services/tourService';
import { useScrollLock } from '../hooks/useScrollLock';
import { useAuth } from '../context/AuthContext';
import { CoachMarkOverlay } from './tour/CoachMarkOverlay';
import { SilsilaLogo, SilsilaEmblem } from './ui/SilsilaLogo';

interface SettingsViewProps {
  onBack?: () => void;
  onOpenPlanModal?: () => void;
  onStartTour?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, onOpenPlanModal, onStartTour }) => {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(() => user?.displayName || 'Seeker of Quran');
  const userEmail = user?.email || 'Authenticated with Google';
  const [selectedReciter, setSelectedReciter] = useState('Mishary Alafasy');
  const [dailyReminder, setDailyReminder] = useState(true);
  const [selectedFont, setSelectedFont] = useState<'Amiri' | 'Scheherazade New'>('Amiri');
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [showAppGuideModal, setShowAppGuideModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSignOutNotice, setShowSignOutNotice] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => getStoredTheme());
  const userPlan = getUserPlan();

  useScrollLock(showReciterModal || showAppGuideModal || showResetConfirm || showSignOutNotice);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);

  useEffect(() => {
    const handleThemeChange = () => {
      setCurrentTheme(getStoredTheme());
    };
    window.addEventListener('silsila_theme_changed', handleThemeChange);
    return () => window.removeEventListener('silsila_theme_changed', handleThemeChange);
  }, []);

  const handleSelectTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    setAppTheme(theme);
  };

  const handleSaveName = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleConfirmSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      setShowSignOutNotice(false);
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto pb-2 space-y-4 animate-in fade-in duration-300">
      {/* 1. TOP HEADER */}
      <header className="flex items-center justify-between px-1 pt-1 pb-1">
        <div>
          <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Profile & Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Manage your account, recitation audio & preferences
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>60 XP</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 text-xs font-bold shadow-2xs">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>12d</span>
          </div>
        </div>
      </header>

      {/* 2. PROFILE SECTION */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Profile
          </h3>
          <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 px-2 py-0.5 rounded-md">
            Standard Member
          </span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              className="w-12 h-12 rounded-xl object-cover shadow-xs border border-indigo-200 dark:border-indigo-800"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">{displayName}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
          </div>
        </div>

        {/* Display Name Input */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Display Name
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            <button
              onClick={handleSaveName}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold text-xs transition-all min-h-[40px] cursor-pointer"
            >
              {savedSuccess ? 'Saved!' : 'Save'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Shown in your greeting on the home screen
          </p>
        </div>

        {/* Replay Interactive App Tour Row */}
        <button
          onClick={() => {
            if (onStartTour) {
              onStartTour();
            } else {
              triggerTourReplay();
            }
            if (onBack) onBack();
          }}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100/70 dark:hover:bg-amber-950/70 border border-amber-200/80 dark:border-amber-900/60 transition-colors text-left cursor-pointer min-h-[44px]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>Interactive App Tour</span>
                <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-950 dark:text-amber-200">
                  Walkthrough
                </span>
              </h5>
              <p className="text-[10.5px] text-slate-600 dark:text-slate-400">Spotlight guide for every core feature</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-300">
            <span>Replay</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* App Guide Row */}
        <button
          onClick={() => setShowAppGuideModal(true)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer min-h-[44px]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">App Guide</h5>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">How every part of Silsila works</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </button>
      </section>

      {/* 2.5 DEDICATED MEMORIZATION PLAN & TARGET SETTING */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-500/20 dark:border-amber-800/60 flex items-center justify-center font-bold">
              <Target className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Memorization Target & Plan
              </h3>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                Configure your active Hifz roadmap, target Surahs, and daily pace
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
            {userPlan.planType === 'full_quran'
              ? "Whole Qur'an"
              : userPlan.planType === 'single_surah'
              ? 'Single Surah'
              : userPlan.planType === 'package'
              ? 'Curated Package'
              : 'Custom Selection'}
          </span>
        </div>

        {/* Active Plan Detail Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20 border border-amber-500/30 dark:border-amber-800/40 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                {userPlan.title || "The Whole Qur'an"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                {userPlan.selectedSurahs?.length || 114} Surahs included • {userPlan.dailyPace || 3} Ayat daily pace
              </p>
            </div>

            <button
              onClick={() => onOpenPlanModal?.()}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1"
            >
              <span>Change Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2 border-t border-amber-500/20 dark:border-amber-800/40 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Full-screen Strategy & Walkthrough available</span>
            </span>
            <button
              onClick={() => onOpenPlanModal?.()}
              className="font-bold text-amber-900 dark:text-amber-300 hover:underline cursor-pointer text-[11px]"
            >
              Open Walkthrough
            </button>
          </div>
        </div>
      </section>

      {/* 3. SETTINGS & PREFERENCES */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Preferences
        </h3>

        {/* Theme & Dark Mode Selection */}
        <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Appearance & Theme</h5>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Supports system mode & night reading</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
              {currentTheme}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => handleSelectTheme('light')}
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
              onClick={() => handleSelectTheme('dark')}
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
              onClick={() => handleSelectTheme('system')}
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

        {/* Reciter Picker */}
        <button
          data-coach="reciter-setting"
          onClick={() => setShowReciterModal(true)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border border-slate-200/70 dark:border-slate-800 min-h-[50px] cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Reciter</h5>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Used for verse recitation audio</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>{selectedReciter}</span>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
        </button>

        {/* Daily Reminder Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 min-h-[50px]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Daily Reminder</h5>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">A nudge each day to open the Qur'an</p>
            </div>
          </div>

          <button
            onClick={() => setDailyReminder(!dailyReminder)}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
              dailyReminder ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                dailyReminder ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Hearts Remaining */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 min-h-[50px]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Hearts Remaining</h5>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Refills daily to 5</p>
            </div>
          </div>

          <div className="flex items-center gap-1 font-black text-xs text-slate-800 dark:text-slate-200">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>5 / 5</span>
          </div>
        </div>

        {/* Quick Tour Replays */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onBack?.()}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-left border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer min-h-[48px]"
          >
            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Take the Tour &gt;</h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Replay Home walkthrough</p>
          </button>

          <button
            onClick={() => onBack?.()}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-left border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer min-h-[48px]"
          >
            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Study Tour &gt;</h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Replay Study walkthrough</p>
          </button>
        </div>
      </section>

      {/* 4. DATA & ACCOUNT ACTIONS */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Account & Data
        </h3>

        <div className="space-y-2 pt-1">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl text-left border border-slate-200/70 dark:border-slate-800 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer min-h-[50px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Reset Progress</h5>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Clears streak, XP, and completed Surahs</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Reset</span>
          </button>

          <button
            onClick={() => setShowSignOutNotice(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl text-left border border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[50px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Sign Out</h5>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Return to welcome screen</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Sign Out</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl text-left border border-rose-100 dark:border-rose-900/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer min-h-[50px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-rose-700 dark:text-rose-400">Delete Account</h5>
                <p className="text-[10.5px] text-rose-500 dark:text-rose-400">Permanently erase your account and all data</p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Delete</span>
          </button>
        </div>
      </section>

      {/* 5. ABOUT SILSILA */}
      <section className="p-4 rounded-3xl bg-[#FAF9F5] dark:bg-slate-900 border border-amber-900/10 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">About Silsila</h4>
        <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-300">Memorize the Quran, One Ayah at a Time</p>
        <p>
          Silsila helps you memorize the whole Qur'an one verse at a time, with spaced repetition (SM-2) and short vocabulary notes to build deep comprehension — not just surface repetition.
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
          Silsila v2.4 • Made with reverence & care
        </p>
      </section>

      {/* RECITER PICKER MODAL */}
      {showReciterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#FAF9F5] dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#6366F1]" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Select Reciter</h3>
              </div>
              <button
                onClick={() => setShowReciterModal(false)}
                className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {[
                { name: 'Mishary Alafasy', style: 'Murattal • Clear & Melodic', rating: '5.0' },
                { name: 'Abdul Rahman Al-Sudais', style: 'Murattal • Haramain Style', rating: '4.9' },
                { name: 'Siddiq Al-Minshawi', style: 'Mujawwad • Classical Egyptian', rating: '5.0' },
                { name: 'Maher Al-Muaiqly', style: 'Murattal • Measured & Rhythmic', rating: '4.8' },
              ].map((qari) => (
                <button
                  key={qari.name}
                  onClick={() => {
                    setSelectedReciter(qari.name);
                    setShowReciterModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all min-h-[52px] cursor-pointer ${
                    selectedReciter === qari.name
                      ? 'bg-[#EEF2FF] dark:bg-indigo-950/60 border-2 border-[#6366F1]'
                      : 'bg-[#FAF9F5] dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{qari.name}</h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{qari.style}</p>
                  </div>
                  {selectedReciter === qari.name && <Check className="w-4 h-4 text-[#6366F1]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* APP GUIDE MODAL */}
      {showAppGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#FAF9F5] dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <SilsilaEmblem className="w-7 h-7" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">How Silsila Works</h3>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Learn the Qur'an, Word by Word</p>
                </div>
              </div>
              <button
                onClick={() => setShowAppGuideModal(false)}
                className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">1. Guided Road & Checkpoints</h4>
                <p>
                  Follow the Serpentine Road through all 114 Surahs. Complete Ayah practice drills, 10-question checkpoint quizzes, and comprehensive milestone exams.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">2. Spaced Repetition (SM-2)</h4>
                <p>
                  Verses you memorize are scheduled for review right before your brain reaches the forgetting threshold, locking them into permanent memory.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">3. Multi-Dimension Exercises</h4>
                <p>
                  Practice Arabic sequence ordering, fill-in-the-blank words, root vocabulary matching, and audio recitation recall.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIGN OUT CONFIRMATION DIALOG */}
      {showSignOutNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Sign Out</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your progress is synced to the cloud. You can sign back in anytime.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowSignOutNotice(false)}
                disabled={isSigningOut}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                disabled={isSigningOut}
                className="py-2.5 px-3 rounded-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs min-h-[44px] cursor-pointer"
              >
                {isSigningOut ? 'Signing out...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Are you sure?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will reset your local streak and recall queue. This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs min-h-[44px] cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Coach Mark: Reciter Settings */}
      <CoachMarkOverlay
        featureKey="reciter_settings"
        targetSelector='[data-coach="reciter-setting"]'
        badge="Reciter Audio"
        title="Audio Reciter & Reader Preferences"
        description="Choose your reference Qari from world-renowned reciters, adjust repetition loops, and customize visual themes for daytime or night recitation."
        icon={Volume2}
      />
    </div>
  );
};
