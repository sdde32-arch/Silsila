import re

with open('src/services/downloadService.ts', 'r') as f:
    content = f.read()

content = re.sub(r', getAyahAIInsights', '', content)
content = re.sub(r'const \[tafsir, insights\] = await Promise\.all\(\[\s*getAyahTafsir\(surahNumber, ayah\.number, surahMeta\.name, ayah\.text, ayah\.translation\),\s*getAyahAIInsights\(.*?\)\]\);',
    r'const tafsir = await getAyahTafsir(surahNumber, ayah.number, surahMeta.name, ayah.text, ayah.translation);', content, flags=re.DOTALL)
content = re.sub(r'const \[tafsir, insights\] = await Promise\.all\(\[\s*getAyahTafsir\(surahNumber, ayahNumber, surahMeta\.name, ayah\.text, ayah\.translation\),\s*getAyahAIInsights\(.*?\)\]\);',
    r'const tafsir = await getAyahTafsir(surahNumber, ayahNumber, surahMeta.name, ayah.text, ayah.translation);', content, flags=re.DOTALL)

# Delete Hifz Aid output section
content = re.sub(r'textContent \+= `### Hifz Aid.*?textContent \+= `\\n`;\s*\}', '', content, flags=re.DOTALL)

with open('src/services/downloadService.ts', 'w') as f:
    f.write(content)
