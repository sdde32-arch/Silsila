import re

with open('src/components/SurahExplorerView.tsx', 'r') as f:
    content = f.read()

target = r"""                          {/\* Play Button \*/}
                        <button
                          onClick=\{\(\) => handleTogglePlayAyah\(ayah\.number\)\}
                          className=\{`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 \$\{
                            isAyahPlaying
                              \? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                              : 'bg-slate-950 hover:bg-slate-800 text-white'
                          \}`\}
                          aria-label=\{`Play verse \$\{ayah\.number\}`\}
                        >
                          \{isAyahPlaying \? \(
                            <Pause className="w-3 h-3 fill-current" />
                          \) : \(
                            <Play className="w-3 h-3 fill-current ml-0\.5" />
                          \)\}
                        </button>
                      </div>
                    </div>

                    {/\* Arabic Calligraphy"""

replacement = """                          {/* Play Button */}
                        <button
                          onClick={() => handleTogglePlayAyah(ayah.number)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                            isAyahPlaying
                              ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                              : 'bg-slate-950 hover:bg-slate-800 text-white'
                          }`}
                          aria-label={`Play verse ${ayah.number}`}
                        >
                          {isAyahPlaying ? (
                            <Pause className="w-3 h-3 fill-current" />
                          ) : (
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Deep Actions (Stretched evenly) */}
                    <div className="flex items-center gap-2 w-full">
                      {/* 6-Step Memorization Lesson Button */}
                      <button
                        onClick={() => onStartLesson(selectedSurahMeta.number, ayah.number)}
                        className="flex-1 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                        title="Start Memorization Lesson for this Ayah"
                      >
                        <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Memorize</span>
                      </button>

                      {/* Tafsir & Reflections Button */}
                      <button
                        onClick={() => {
                          setSelectedTafsirAyah(ayah);
                          setInitialTafsirTab('exegesis');
                        }}
                        className="flex-1 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
                        title="Open Tafsir & Word Meanings"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Tafsir</span>
                      </button>
                    </div>
                  </div>

                  {/* Arabic Calligraphy"""

new_content = re.sub(target, replacement, content, flags=re.DOTALL)

with open('src/components/SurahExplorerView.tsx', 'w') as f:
    f.write(new_content)
