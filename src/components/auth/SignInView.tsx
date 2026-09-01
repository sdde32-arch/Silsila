import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Layers,
  Flame,
  ArrowRight,
  Compass,
  Lock,
  Cloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SilsilaLogo, SilsilaEmblem } from '../ui/SilsilaLogo';

export const SignInView: React.FC = () => {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningInGuest, setIsSigningInGuest] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setErrorMessage(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in window was closed. Please try again or continue as guest.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('Pop-up was blocked. If you are in a preview iframe, please use "Continue as Guest".');
      } else {
        setErrorMessage('Failed to sign in. Please try again or use "Continue as Guest".');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setIsSigningInGuest(true);
      setErrorMessage(null);
      await signInAsGuest();
    } catch (err: any) {
      console.error('Guest sign-in error:', err);
      setErrorMessage(err.message || 'Failed to sign in as guest.');
    } finally {
      setIsSigningInGuest(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-300">
      {/* Top Header Logo */}
      <header className="w-full max-w-md mx-auto pt-2 flex items-center justify-between">
        <SilsilaLogo variant="compact" size="sm" />

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
          <Cloud className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Cloud Sync</span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-md mx-auto my-auto py-4 space-y-5">
        {/* Brand Hero Stack */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <SilsilaLogo
              variant="vertical"
              size="lg"
              tagline="Learn the Qur'an, Word by Word"
              className="drop-shadow-xs"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Linear Sabaq & Active Recall</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Sign in to access your personalized Hifz path, SM-2 retention curves, audio reciters, and progress synchronization.
          </p>
        </div>

        {/* Feature Pillars */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/60 dark:border-amber-800/60">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                Structured Tahfeez Paths
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Follow guided Sabaq, Sabqi, and Manzil progression across all 114 Surahs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/60 dark:border-emerald-800/60">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                SM-2 Spaced Repetition Engine
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Review verses right before your forgetting threshold for permanent recall.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/60 dark:border-indigo-800/60">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                Active Recall & Mastery Verification
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Fill-in-the-blank, word-by-word scramble, and comprehensive Surah Mastery exams.
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="flex-1">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Action Button: Sign in with Google */}
        <div className="space-y-3">
          <button
            id="btn-google-signin"
            onClick={handleSignIn}
            disabled={isSigningIn || isSigningInGuest}
            className="w-full min-h-[52px] py-3.5 px-5 rounded-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg shadow-slate-900/10 dark:shadow-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Signing in with Google...</span>
              </div>
            ) : (
              <>
                {/* Official Google G Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.37 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="w-4 h-4 ml-0.5 opacity-80" />
              </>
            )}
          </button>

          <button
            id="btn-guest-signin"
            onClick={handleGuestSignIn}
            disabled={isSigningIn || isSigningInGuest}
            className="w-full min-h-[52px] py-3.5 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-sm flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSigningInGuest ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Continuing as Guest...</span>
              </div>
            ) : (
              <>
                <span>Continue as Guest</span>
                <ArrowRight className="w-4 h-4 ml-0.5 opacity-80" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 font-medium pt-1">
            By continuing, your Hifz progress and Niyyah journal will securely sync to your account. Guest mode will still save to the cloud but won't be linked to an email.
          </p>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="w-full max-w-md mx-auto text-center pb-2">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Silsila v2.4 • Made with reverence & care for seekers of the Qur’an
        </p>
      </footer>
    </div>
  );
};
