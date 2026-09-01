import React, { useState, useEffect } from 'react';
import { X, BookOpen, Sparkles, Lightbulb, Compass, Share2, Bookmark, Check, Link as LinkIcon, AlertCircle, Volume2, Target, Brain, DownloadCloud } from 'lucide-react';
import { getAyahTafsir, TafsirInfo, toggleVerseBookmark, getBookmarks } from '../services/quranDataService';
import { AyahNumberBadge } from './ui/AyahNumberBadge';
import { downloadSurahOfflineNotes } from '../services/downloadService';
import { useScrollLock } from '../hooks/useScrollLock';

interface TafsirModalProps {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  transliteration?: string;
  initialTab?: 'exegesis' | 'reflections' | 'vocabulary';
  onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  surahNumber,
  ayahNumber,
  surahName,
  arabicText,
  translation,
  transliteration,
  initialTab = 'exegesis',
  onClose,
}) => {
  useScrollLock(true);
  const [tafsirData, setTafsirData] = useState<TafsirInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'exegesis' | 'reflections' | 'vocabulary'>(initialTab);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getAyahTafsir(surahNumber, ayahNumber, surahName, arabicText, translation).then((tafsir) => {
      if (isMounted) {
        setTafsirData(tafsir);
        setIsLoading(false);
      }
    });

    const bookmarks = getBookmarks();
    setIsBookmarked(bookmarks.some((b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber));

    return () => {
      isMounted = false;
    };
  }, [surahNumber, ayahNumber, surahName, arabicText, translation, transliteration]);

  const handleToggleBookmark = () => {
    const nextState = toggleVerseBookmark(surahNumber, ayahNumber, surahName, arabicText, translation, 'favorite');
    setIsBookmarked(nextState);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-slate-200 text-slate-900 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[88vh] overflow-y-auto no-scrollbar shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/80 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Ayah Tafsir & Vocabulary</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Surah {surahName} • Ayah {ayahNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleBookmark}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-95 ${
                isBookmarked
                  ? 'bg-amber-100 text-amber-600 shadow-inner'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl relative overflow-hidden">
          <p className="font-quran text-2xl sm:text-3xl text-right text-slate-900 leading-[2.2] tracking-wide mb-3 dark:text-slate-100" dir="rtl" style={{ color: '#000000' }}>
            {arabicText}
          </p>
          {transliteration && (
            <p className="text-xs sm:text-sm text-slate-500 font-serif italic text-center">{transliteration}</p>
          )}
          <p className="text-xs sm:text-sm text-slate-700 font-sans leading-relaxed text-center">"{translation}"</p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
          <button
            onClick={() => setActiveTab('exegesis')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'exegesis'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tafsir
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'vocabulary'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roots
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
            <div className="w-5 h-5 rounded-full border-2 border-[#6366F1] border-t-transparent animate-spin" />
            <span>Loading Tafsir insights...</span>
          </div>
        ) : (
          <>
            {/* Tab 1: Exegesis */}
            {activeTab === 'exegesis' && tafsirData && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-wider text-indigo-600">
                    <span>EXEGESIS & MEANING</span>
                    <span className="text-slate-400 font-medium">{tafsirData.source}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    {tafsirData.tafsirText}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-amber-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>THEMATIC LESSON</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{tafsirData.thematicLesson}</p>
                </div>
              </div>
            )}

            {/* Tab 3: Vocabulary */}
            {activeTab === 'vocabulary' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <p className="text-xs text-slate-500 px-1 font-medium">
                  Key Quranic roots & word-by-word structure:
                </p>
                <div className="space-y-2">
                  {arabicText
                    .split(' ')
                    .filter(Boolean)
                    .map((word, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-quran text-xl font-bold text-black leading-[2.2] overflow-visible dark:text-slate-100" dir="rtl" style={{ color: '#000000' }}>
                            {word}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase block">
                            Word #{idx + 1}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">Part of Ayah {ayahNumber}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
