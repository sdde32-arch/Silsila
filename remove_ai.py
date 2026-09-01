import re

with open('server.ts', 'r') as f:
    content = f.read()

# Match the app.post block, it starts with // POST /api/gemini/ayah-insights and ends before the Vite middleware setup
pattern = re.compile(r'(\s*// POST /api/gemini/ayah-insights.*?\n\s*\}\);)', re.DOTALL)
content = pattern.sub('', content)

# Remove generateCuratedInsights function
pattern2 = re.compile(r'\n// Curated high-yield fallbacks.*?function generateCuratedInsights.*?return \{.*?\n\}\n', re.DOTALL)
content = pattern2.sub('\n', content)

with open('server.ts', 'w') as f:
    f.write(content)
