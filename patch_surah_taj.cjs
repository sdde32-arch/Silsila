const fs = require('fs');
let code = fs.readFileSync('src/components/SurahExplorerView.tsx', 'utf8');

code = code.replace(/displaySettings\.showTajweed \? annotateText\(w\.arabic\) \: w\.arabic/g, 'annotateText(w.arabic)');

fs.writeFileSync('src/components/SurahExplorerView.tsx', code);
