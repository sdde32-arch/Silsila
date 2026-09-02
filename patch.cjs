const fs = require('fs');
let code = fs.readFileSync('src/services/quranDataService.ts', 'utf8');

const target = `export function stripHtmlTags(text: string): string {
  if (!text) return text;
  // Completely remove any <sup>...</sup> elements and their inner content (footnotes)
  let cleaned = text.replace(/<sup[^>]*>.*?<\\/sup>/g, '');
  // Remove any remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>?/gm, '');
  return cleaned.trim();
}`;

const replacement = `export function stripHtmlTags(text: string): string {
  if (!text) return text;
  // Completely remove any <sup>...</sup> elements and their inner content (footnotes)
  let cleaned = text.replace(/<sup[^>]*>.*?<\\/sup>/gi, '');
  // Remove any remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>?/gmi, '');
  // Normalize extra spacing
  cleaned = cleaned.replace(/\\s{2,}/g, ' ');
  return cleaned.trim();
}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/services/quranDataService.ts', code);
