import re

with open('src/components/SurahExplorerView.tsx', 'r') as f:
    content = f.read()

target = r"""                    {/\* Verse Card Top Bar: Aligned, Compact Action Row \*/}
                    <div className="flex flex-wrap items-center justify-between gap-2\.5 pb-3 mb-3 border-b border-slate-200/80">.*?{/\* Play Button \*/}"""

replacement = """                    {/* Verse Card Top Bar: Aligned, Compact Action Row */}
                    <div className="flex flex-col gap-2.5 pb-3 mb-3 border-b border-slate-200/80 w-full">
                      {/* Row 1: Utilities (Verse Pill, Bookmark, Download, Play) */}
                      <div className="flex items-center justify-between w-full">
                        <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 h-8 flex items-center shadow-xs">
                          Verse {ayah.number}
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleBookmark(ayah)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              isBookmarked
                                ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs'
                                : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-black border border-slate-200 shadow-xs'
                            }`}
                            title={isBookmarked ? 'Bookmarked' : 'Bookmark verse'}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Download Ayah Notes Button */}
                          <button
                            onClick={async () => {
                              if (downloadingAyah === ayah.number) return;
                              setDownloadingAyah(ayah.number);
                              setDownloadProgress(0);
                              
                              const interval = setInterval(() => {
                                setDownloadProgress(p => {
                                  if (p >= 90) return 90;
                                  return p + 15;
                                });
                              }, 200);
                              await downloadAyahOfflineNotes(selectedSurahMeta.number, ayah.number);
                              
                              clearInterval(interval);
                              setDownloadProgress(100);
                              setTimeout(() => {
                                setDownloadingAyah(null);
                                setDownloadProgress(0);
                                setDownloadedAyahs(prev => ({ ...prev, [ayah.number]: true }));
                              }, 600);
                            }}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                              downloadingAyah === ayah.number
                                ? 'bg-slate-50 border-slate-300'
                                : downloadedAyahs[ayah.number]
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                            title={downloadedAyahs[ayah.number] ? "Offline Notes Downloaded" : "Download Offline Notes for this Ayah"}
                            disabled={downloadingAyah === ayah.number}
                          >
                            <div className="relative w-4 h-4">
                              <DownloadCloud className={`absolute inset-0 w-4 h-4 ${
                                downloadingAyah === ayah.number 
                                  ? 'text-slate-300' 
                                  : downloadedAyahs[ayah.number] 
                                    ? 'text-emerald-500' 
                                    : 'text-slate-600'
                              }`} />
                              {downloadingAyah === ayah.number && (
                                <div
                                  className="absolute inset-0 text-emerald-500 overflow-hidden transition-all duration-200"
                                  style={{ clipPath: `inset(${100 - downloadProgress}% 0 0 0)` }}
                                >
                                  <DownloadCloud className="w-4 h-4 fill-current" />
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Play Button */}"""

new_content = re.sub(target, replacement, content, flags=re.DOTALL)

with open('src/components/SurahExplorerView.tsx', 'w') as f:
    f.write(new_content)
