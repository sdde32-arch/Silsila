import re

with open('src/services/downloadService.ts', 'r') as f:
    content = f.read()

# Replace ayah.text with ayah.arabic
content = content.replace('ayah.text', 'ayah.arabic')

# Replace the Promise.all
old1 = """    try {
      const [tafsir, insights] = await Promise.all([
        getAyahTafsir(surahNumber, ayah.number, surahMeta.name, ayah.arabic, ayah.translation),
        getAyahAIInsights(surahNumber, ayah.number, surahMeta.name, ayah.arabic, ayah.translation, ayah.transliteration)
      ]);"""

new1 = """    try {
      const tafsir = await getAyahTafsir(surahNumber, ayah.number, surahMeta.name, ayah.arabic, ayah.translation);"""

content = content.replace(old1, new1)

with open('src/services/downloadService.ts', 'w') as f:
    f.write(content)
