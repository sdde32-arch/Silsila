import re

with open('src/components/SurahExplorerView.tsx', 'r') as f:
    content = f.read()

# Replace w.arabic inside the map
content = content.replace('{w.arabic}', '{displaySettings.showTajweed ? annotateText(w.arabic) : w.arabic}')

# Replace ayah.arabic
content = content.replace('{ayah.arabic}', '{displaySettings.showTajweed ? annotateText(ayah.arabic) : ayah.arabic}')

# There's also `isRevealed ? w.arabic : '••••'`
content = content.replace('isRevealed ? w.arabic : \'••••\'', 'isRevealed ? (displaySettings.showTajweed ? annotateText(w.arabic) : w.arabic) : \'••••\'')

with open('src/components/SurahExplorerView.tsx', 'w') as f:
    f.write(content)
