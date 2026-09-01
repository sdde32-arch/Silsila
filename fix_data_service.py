import re

with open('src/services/quranDataService.ts', 'r') as f:
    content = f.read()

# Delete lines from `const cacheKey = \`ai_hifz_insights_...` to `};`
# Actually let's just find where it starts and ends
content = re.sub(r'const cacheKey = `ai_hifz_insights.*?\}\s*\n', '', content, flags=re.DOTALL)

with open('src/services/quranDataService.ts', 'w') as f:
    f.write(content)
