const fs = require('fs');
let code = fs.readFileSync('src/components/ExerciseCard.tsx', 'utf8');

const target = `            <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs select-none">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Tajweed</span>
              <input 
                type="checkbox" 
                checked={showTajweed} 
                onChange={(e) => setShowTajweed(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500 rounded-sm cursor-pointer" 
              />
            </label>`;

code = code.replace(target, '');
fs.writeFileSync('src/components/ExerciseCard.tsx', code);
