import re

with open('src/components/TafsirModal.tsx', 'r') as f:
    content = f.read()

# Replace the Promise.all
old = """    Promise.all([
      getAyahTafsir(surahNumber, ayahNumber, surahName, arabicText, translation),
      getAyahAIInsights(surahNumber, ayahNumber, surahName, arabicText, translation, transliteration),
    ]).then(([tafsir, insights]) => {
      if (isMounted) {
        setTafsirData(tafsir);
                setIsLoading(false);
      }
    });"""

new = """    getAyahTafsir(surahNumber, ayahNumber, surahName, arabicText, translation).then((tafsir) => {
      if (isMounted) {
        setTafsirData(tafsir);
        setIsLoading(false);
      }
    });"""

content = content.replace(old, new)

with open('src/components/TafsirModal.tsx', 'w') as f:
    f.write(content)
