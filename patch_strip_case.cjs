const fs = require('fs');
let code = fs.readFileSync('src/services/quranDataService.ts', 'utf8');

code = code.replace(/<sup\\[\\^>\\]\\*>\\.\\*\\?<\\\\\\/sup>\\/g/, '<sup[^>]*>.*?<\\\\/sup>/gi');
code = code.replace(/<sup\\[\^>\]\*>.\*?<\\\/sup>\/g/, '<sup[^>]*>.*?<\\/sup>/gi');

fs.writeFileSync('src/services/quranDataService.ts', code);
