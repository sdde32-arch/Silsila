import re

with open('src/components/SurahExplorerView.tsx', 'r') as f:
    content = f.read()

old_row = """                      <div className="flex items-center justify-between w-full">
                        <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 h-8 flex items-center shadow-xs">
                          Verse {ayah.number}
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">"""

new_row = """                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 h-8 flex items-center shadow-xs">
                            Verse {ayah.number}
                          </div>
                          <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 h-8 rounded-lg border border-slate-200 shadow-2xs select-none hover:bg-slate-50 transition-colors" title="Toggle Tajweed Colorization">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider hidden sm:inline">Tajweed</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider sm:hidden">Taj</span>
                            <input 
                              type="checkbox" 
                              checked={displaySettings.showTajweed ?? false} 
                              onChange={(e) => {
                                const newSettings = { ...displaySettings, showTajweed: e.target.checked };
                                setDisplaySettings(newSettings);
                                saveStoredReaderSettings(newSettings);
                              }}
                              className="w-3.5 h-3.5 accent-emerald-500 rounded-sm cursor-pointer" 
                            />
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">"""

content = content.replace(old_row, new_row)

with open('src/components/SurahExplorerView.tsx', 'w') as f:
    f.write(content)
