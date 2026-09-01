import re

with open('src/components/TafsirModal.tsx', 'r') as f:
    content = f.read()

# I will replace lines 64 to 99 with the proper structure
proper = """        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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

        <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110">
            <BookOpen className="w-24 h-24" />
          </div>
          <p className="font-quran text-2xl sm:text-3xl text-right text-slate-900 leading-[2.2] tracking-wide mb-3" dir="rtl" style={{ color: '#000000' }}>
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
        </div>"""

content = re.sub(r'<div className="flex items-center justify-between border-b border-slate-100 pb-3">.*?</div>\s*\{isLoading \?', proper + '\n\n        {isLoading ?', content, flags=re.DOTALL)

with open('src/components/TafsirModal.tsx', 'w') as f:
    f.write(content)
