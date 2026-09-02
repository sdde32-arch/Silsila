const fs = require('fs');
let code = fs.readFileSync('src/components/SurahExplorerView.tsx', 'utf8');

const target = `                          <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 h-8 rounded-lg border border-slate-200 shadow-2xs select-none hover:bg-slate-50 transition-colors" title="Toggle Tajweed Colorization">
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
                          </label>`;

code = code.replace(target, '');
fs.writeFileSync('src/components/SurahExplorerView.tsx', code);
