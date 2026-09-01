import re

with open('src/services/downloadService.ts', 'r') as f:
    content = f.read()

old2 = """    const [tafsir, insights] = await Promise.all([
      getAyahTafsir(surahNumber, ayah.number, surahMeta.name, ayah.arabic, ayah.translation),
      getAyahAIInsights(surahNumber, ayah.number, surahMeta.name, ayah.arabic, ayah.translation, ayah.transliteration)
    ]);"""

new2 = """    const tafsir = await getAyahTafsir(surahNumber, ayah.number, surahMeta.name, ayah.arabic, ayah.translation);"""

content = content.replace(old2, new2)

with open('src/services/downloadService.ts', 'w') as f:
    f.write(content)
