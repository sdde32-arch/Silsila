import re

with open('src/services/memorizationEngine.ts', 'r') as f:
    content = f.read()

# Replace runningCumulative += meta ? meta.totalAyahs : 7;
content = content.replace(
    'runningCumulative += meta ? meta.totalAyahs : 7;',
    'runningCumulative += meta ? meta.totalAyahs : 0;'
)

with open('src/services/memorizationEngine.ts', 'w') as f:
    f.write(content)
