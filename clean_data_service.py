import re

with open('src/services/quranDataService.ts', 'r') as f:
    content = f.read()

# 1. Remove AyahAIInsights interface
content = re.sub(r'export interface AyahAIInsights \{.*?\n\}\n', '', content, flags=re.DOTALL)

# 2. Remove aiInsights from TafsirInfo
content = re.sub(r'\s*aiInsights\?: AyahAIInsights;', '', content)

# 3. Remove getAyahAIInsights function
content = re.sub(r'export async function getAyahAIInsights\(.*?\}\n', '', content, flags=re.DOTALL)

with open('src/services/quranDataService.ts', 'w') as f:
    f.write(content)
