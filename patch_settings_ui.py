import re

with open('src/components/ReaderSettingsModal.tsx', 'r') as f:
    content = f.read()

new_toggle = """          <label className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer transition-colors">
            <div>
              <p className="text-xs font-extrabold text-slate-900">Tajweed Colorization</p>
              <p className="text-[11px] text-slate-500 font-medium">Highlight phonetic pronunciation rules</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showTajweed ?? false}
              onChange={(e) => onUpdateSettings({ showTajweed: e.target.checked })}
              className="w-5 h-5 accent-emerald-500 rounded-md cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer transition-colors">"""

content = content.replace(
    '<label className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer transition-colors">',
    new_toggle,
    1 # only replace the first occurrence or specific occurrence? Let's just do a direct string replace of the transliteration one to ensure location
)

with open('src/components/ReaderSettingsModal.tsx', 'w') as f:
    f.write(content)
