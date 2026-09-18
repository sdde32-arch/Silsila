const fs = require('fs');

const content = `import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SilsilaLogo } from '../SilsilaLogo';
import { Cloud, Lock, User, ArrowRight, BookOpen, Layers, Sparkles } from 'lucide-react';

export const SignInView: React.FC = () => {
  const { signInWithUsername } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Please enter a username to continue.');
      return;
    }

    try {
      setIsSigningIn(true);
      setErrorMessage('');
      await signInWithUsername(username, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      setErrorMessage(error.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0E121B] flex flex-col px-4 sm:px-6">
      {/* Mini Header */}
      <header className="w-full max-w-md mx-auto py-5 flex items-center justify-between">
        <SilsilaLogo variant="compact" size="sm" />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
          <Cloud className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Cloud Sync</span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-md mx-auto my-auto py-4 space-y-6">
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
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Enter a username to track your Hifz path. Set an optional password to log in securely from other devices.
          </p>
        </div>

        {/* Feature Pillars */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/60">
              <BookOpen className="w-4 h-4" />
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
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-800/60">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                Active Recall & SM-2
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Review verses right before your forgetting threshold for permanent recall.
              </p>
            </div>
          </div>
        </div>

        {/* Login / Register Form */}
        <form onSubmit={handleSignIn} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                placeholder="Choose a username (e.g. seeker1)"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Password (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                placeholder="Leave blank for open access"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 pl-1">If left blank, anyone with the username can log in.</p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full min-h-[52px] mt-2 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <span>Log in or Register</span>
                <ArrowRight className="w-4 h-4 ml-0.5 opacity-80" />
              </>
            )}
          </button>
        </form>
      </main>

      {/* Footer Note */}
      <footer className="w-full max-w-md mx-auto text-center pb-6">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Silsila v2.4 • Made with reverence & care for seekers of the Qur’an
        </p>
      </footer>
    </div>
  );
};
`;

fs.writeFileSync('src/components/auth/SignInView.tsx', content);
console.log('patched SignInView.tsx');
