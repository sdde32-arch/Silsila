const fs = require('fs');
let code = fs.readFileSync('src/services/quranDataService.ts', 'utf8');

const updatedStripFn = `export function stripHtmlTags(text: string): string {
  if (!text) return text;
  // Completely remove any <sup>...</sup> elements and their inner content (footnotes)
  let cleaned = text.replace(/<sup[^>]*>.*?<\\/sup>/g, '');
  // Remove any remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>?/gm, '');
  return cleaned.trim();
}`;

code = code.replace(/export function stripHtmlTags\([^)]*\):\s*string\s*\{[\s\S]*?\n\}/, updatedStripFn);

fs.writeFileSync('src/services/quranDataService.ts', code);
