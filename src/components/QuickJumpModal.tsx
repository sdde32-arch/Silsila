import React, { useState } from 'react';
import { X, Navigation, Hash, BookOpen, Layers, Check } from 'lucide-react';
import { ALL_114_SURAHS } from '../data/quranMetadata';
import { useScrollLock } from '../hooks/useScrollLock';

interface QuickJumpModalProps {
  currentSurahNumber: number;
  totalAyahs: number;
  currentAyah: number;
  currentPage: number;
  onJumpToAyah: (ayahNumber: number) => void;
  onJumpToPage: (pageNumber: number) => void;
  onSelectSurah: (surahNumber: number) => void;
  onClose: () => void;
}

export const QuickJumpModal: React.FC<QuickJumpModalProps> = ({
  currentSurahNumber,
  totalAyahs,
  currentAyah,
  currentPage,
  onJumpToAyah,
  onJumpToPage,
  onSelectSurah,
  onClose,
}) => {
  useScrollLock(true);
  const [jumpTab, setJumpTab] = useState<'ayah' | 'juz' | 'page'>('ayah');
  const [targetAyahInput, setTargetAyahInput] = useState<number>(currentAyah);
  const [targetPageInput, setTargetPageInput] = useState<number>(currentPage);

  const currentSurah = ALL_114_SURAHS.find((s) => s.number === currentSurahNumber) || ALL_114_SURAHS[0];

  const handleApplyAyahJump = () => {
    const valid = Math.min(Math.max(1, targetAyahInput), totalAyahs);
    onJumpToAyah(valid);
    onClose();
  };

  const handleApplyPageJump = () => {
    const valid = Math.min(Math.max(1, targetPageInput), 604);
    onJumpToPage(valid);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick Jump and Navigation"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">Quick Jump & Navigation</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Jump to any Ayah, Juz, or Mushaf Page</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-all shadow-2xs active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setJumpTab('ayah')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              jumpTab === 'ayah' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            By Ayah (1–{totalAyahs})
          </button>
          <button
            onClick={() => setJumpTab('juz')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              jumpTab === 'juz' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            By Juz (1–30)
          </button>
          <button
            onClick={() => setJumpTab('page')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              jumpTab === 'page' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            By Page (1–604)
          </button>
        </div>

        {/* TAB 1: JUMP BY AYAH */}
        {jumpTab === 'ayah' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Current: Surah {currentSurah.transliteration}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalAyahs} Verses Total</span>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min={1}
                  max={totalAyahs}
                  value={targetAyahInput}
                  onChange={(e) => setTargetAyahInput(parseInt(e.target.value) || 1)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Ayah 1</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    Ayah {targetAyahInput}
                  </span>
                  <span>Ayah {totalAyahs}</span>
                </div>
              </div>

              {/* Quick Jump Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase w-full">Quick Shortcuts:</span>
                {[1, 5, 10, 20, 50, 100, Math.floor(totalAyahs / 2), totalAyahs]
                  .filter((v, i, a) => v <= totalAyahs && a.indexOf(v) === i)
                  .map((num) => (
                    <button
                      key={num}
                      onClick={() => setTargetAyahInput(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        targetAyahInput === num
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Ayah {num}
                    </button>
                  ))}
              </div>
            </div>

            <button
              onClick={handleApplyAyahJump}
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 transition-all min-h-[44px]"
            >
              <span>Jump to Ayah {targetAyahInput}</span>
            </button>
          </div>
        )}

        {/* TAB 2: JUMP BY JUZ */}
        {jumpTab === 'juz' && (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar pr-1 animate-in fade-in duration-150">
            {Array.from({ length: 30 }, (_, i) => {
              const juzNum = i + 1;
              const matchingSurah = ALL_114_SURAHS.find((s) => s.juzNumber === juzNum) || ALL_114_SURAHS[0];
              return (
                <button
                  key={juzNum}
                  onClick={() => {
                    onSelectSurah(matchingSurah.number);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/40 via-white to-indigo-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-indigo-950/20 hover:from-emerald-50/70 hover:to-indigo-50/50 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 shadow-2xs text-left transition-all cursor-pointer group min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-950/80 dark:to-teal-950/80 text-emerald-900 dark:text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-300/80 dark:border-emerald-800 group-hover:scale-105 transition-transform">
                      {juzNum}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Juz {juzNum}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Starts at Surah {matchingSurah.transliteration}</p>
                    </div>
                  </div>
                  <span className="font-quran text-lg font-bold block text-slate-950 dark:text-slate-100 leading-[2.2] overflow-visible" dir="rtl">
                    الجزء {juzNum}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 3: JUMP BY PAGE */}
        {jumpTab === 'page' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Standard Madinah Mushaf</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">604 Pages Total</span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min={1}
                  max={604}
                  value={targetPageInput}
                  onChange={(e) => setTargetPageInput(parseInt(e.target.value) || 1)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Page 1</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    Page {targetPageInput}
                  </span>
                  <span>Page 604</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleApplyPageJump}
              className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all min-h-[48px]"
            >
              <span>Open Page {targetPageInput} in Mushaf</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
