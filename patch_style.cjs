const fs = require('fs');
let code = fs.readFileSync('src/components/SurahExplorerView.tsx', 'utf8');

code = code.replace(
  /dir="rtl" style=\{\{ color: '#000000' \}\}>/g,
  'dir="rtl">'
);

fs.writeFileSync('src/components/SurahExplorerView.tsx', code);
