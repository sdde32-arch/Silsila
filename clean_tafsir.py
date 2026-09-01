import re

with open('src/components/TafsirModal.tsx', 'r') as f:
    content = f.read()

# 1. Remove imports of getAyahAIInsights and AyahAIInsights
content = re.sub(r', getAyahAIInsights, AyahAIInsights', '', content)
content = re.sub(r'getAyahAIInsights, ', '', content)

# 2. Remove state for aiInsights
content = re.sub(r'\s*const \[aiInsights, setAiInsights\] = useState<AyahAIInsights \| null>\(null\);', '', content)

# 3. Remove Promise.all and replace with just getAyahTafsir
content = re.sub(r'Promise\.all\(\[\s*getAyahTafsir\(surahNumber, ayahNumber, surahName, arabicText, translation\),\s*getAyahAIInsights\(.*?\)\]\)\.then\(\(\[tafsir, insights\]\) => \{',
    r'getAyahTafsir(surahNumber, ayahNumber, surahName, arabicText, translation).then((tafsir) => {', content, flags=re.DOTALL)
content = re.sub(r'setAiInsights\(insights\);\n', '', content)

# 4. Remove the Tab 0 completely (AI Memorize & Hifz Anchor)
# Looking at the code, it's a huge block. Let's just remove the button and the content block.
# Button:
content = re.sub(r'\{/\* 3 Tabs.*?<div className="grid grid-cols-3', '<div className="grid grid-cols-2', content, flags=re.DOTALL)
content = re.sub(r'<button\s*onClick=\{.*?setActiveTab\(\'hifz\'\).*?</button>', '', content, flags=re.DOTALL)

# Content:
content = re.sub(r'\{/\* Tab 0: AI Memorize & Hifz Anchor \*/\}.*?\{/\* Tab 1: Exegesis / Tafsir \*/\}', '{/* Tab 1: Exegesis / Tafsir */}', content, flags=re.DOTALL)

# Also remove the AI Loading text
content = re.sub(r'<span>Generating authentic AI memorization insights...</span>', '<span>Loading Tafsir insights...</span>', content)

# Fix title
content = re.sub(r'AI Ayah Memorization & Tafsir', 'Ayah Tafsir & Vocabulary', content)

with open('src/components/TafsirModal.tsx', 'w') as f:
    f.write(content)
