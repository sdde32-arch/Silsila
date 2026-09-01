import re

with open('src/components/TafsirModal.tsx', 'r') as f:
    content = f.read()

# Remove Tab 0 block
content = re.sub(r'\s*\{/\* Tab 0: AI Memorize & Hifz Anchor \*/\}.*?\{/\* Tab 1: Exegesis \*/\}', '\n            {/* Tab 1: Exegesis */}', content, flags=re.DOTALL)

# Remove keyRoots block in Tab 3
content = re.sub(r'\s*\{aiInsights\?\.keyRoots.*?\}\)', '', content, flags=re.DOTALL)

with open('src/components/TafsirModal.tsx', 'w') as f:
    f.write(content)
