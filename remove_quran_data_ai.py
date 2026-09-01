import re

with open('src/services/quranDataService.ts', 'r') as f:
    content = f.read()

# Remove getAyahAIInsights function
content = re.sub(r'export async function getAyahAIInsights.*?\}\n\n', '\n', content, flags=re.DOTALL)
# It might not match if it doesn't end with \n\n, let's use a simpler approach
