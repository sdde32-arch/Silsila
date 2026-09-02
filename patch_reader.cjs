const fs = require('fs');
let code = fs.readFileSync('src/components/ReaderSettingsModal.tsx', 'utf8');

const target = `          <label className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer transition-colors">
            <div className="space-y-0.5">
              <p className="text-xs font-extrabold text-slate-900">Tajweed Colorization</p>
              <p className="text-[11px] text-slate-500 font-medium">Highlight phonetic pronunciation rules</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showTajweed ?? false}
              onChange={(e) => onUpdateSettings({ showTajweed: e.target.checked })}
              className="w-5 h-5 accent-emerald-500 rounded-md cursor-pointer"
            />
          </label>`;

code = code.replace(target, '');
fs.writeFileSync('src/components/ReaderSettingsModal.tsx', code);
