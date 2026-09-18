const fs = require('fs');

const content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const search = `              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Reset Progress</h5>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Clears streak, XP, and completed Surahs</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Reset</span>
          </button>
        </div>
      </section>`;

const replacement = `              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Reset Progress</h5>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Clears streak, XP, and completed Surahs</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Reset</span>
          </button>

          <button
            onClick={() => setShowSignOutNotice(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl text-left border border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[50px] mt-2"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Sign Out</h5>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Log out of your account</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sign Out</span>
          </button>
        </div>
      </section>`;

fs.writeFileSync('src/components/SettingsView.tsx', content.replace(search, replacement));
console.log('patched SettingsView.tsx to add sign out button');
