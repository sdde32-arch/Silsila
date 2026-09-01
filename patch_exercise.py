import re

with open('src/components/ExerciseCard.tsx', 'r') as f:
    content = f.read()

# Import
content = content.replace("import { ExerciseAyahAudioPlayer } from './ExerciseAyahAudioPlayer';", "import { ExerciseAyahAudioPlayer } from './ExerciseAyahAudioPlayer';\nimport { useTajweed } from './tajweed/TajweedProvider';")

# State
content = content.replace("  const [showTajweedLetters, setShowTajweedLetters] = useState(true);", "  const [showTajweedLetters, setShowTajweedLetters] = useState(true);\n  const { annotateText } = useTajweed();\n  const [showTajweed, setShowTajweed] = useState(false);")

# Header toggle
header_old = """        {/* Ayah Reference Badge & Prompt Category */}
        <div className="flex items-center justify-between">
          <Badge variant="warm" size="sm">
            {ayahReference}
          </Badge>"""

header_new = """        {/* Ayah Reference Badge & Prompt Category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="warm" size="sm">
              {ayahReference}
            </Badge>
            <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs select-none">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Tajweed</span>
              <input 
                type="checkbox" 
                checked={showTajweed} 
                onChange={(e) => setShowTajweed(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500 rounded-sm cursor-pointer" 
              />
            </label>
          </div>"""

content = content.replace(header_old, header_new)

# renderBlankAyah
render_old = """            <React.Fragment key={i}>
              {renderInteractiveTextSegment(part, `part-${i}`)}
              {i < parts.length - 1 && ("""

render_new = """            <React.Fragment key={i}>
              <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-black font-bold" dir="rtl" style={{ color: '#000000' }}>
                {showTajweed ? annotateText(part) : renderInteractiveTextSegment(part, `part-${i}`)}
              </span>
              {i < parts.length - 1 && ("""
# wait, renderInteractiveTextSegment returns a span with the exact same classes:
# <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-black font-bold" dir="rtl" style={{ color: '#000000' }}>

# so I should replace just the renderInteractiveTextSegment call
render_new_alt = """            <React.Fragment key={i}>
              {showTajweed ? (
                <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-black font-bold" dir="rtl" style={{ color: '#000000' }}>
                  {annotateText(part)}
                </span>
              ) : (
                renderInteractiveTextSegment(part, `part-${i}`)
              )}
              {i < parts.length - 1 && ("""

content = content.replace(render_old, render_new_alt)

with open('src/components/ExerciseCard.tsx', 'w') as f:
    f.write(content)
