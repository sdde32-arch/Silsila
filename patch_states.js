const fs = require('fs');
let code = fs.readFileSync('src/components/SurahExplorerView.tsx', 'utf8');

const importStatement = `import { downloadAyahOfflineNotes } from '../services/downloadService';\n`;
if (!code.includes('downloadAyahOfflineNotes')) {
    code = code.replace("import { getAyahTafsir, TafsirInfo } from '../services/quranDataService';", 
      "import { getAyahTafsir, TafsirInfo } from '../services/quranDataService';\n" + importStatement);
}

const stateDeclarations = `  const [downloadingAyah, setDownloadingAyah] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
`;

if (!code.includes('downloadingAyah')) {
    code = code.replace('const [bookmarkedVerses, setBookmarkedVerses] = useState<Record<number, boolean>>({});', 
      'const [bookmarkedVerses, setBookmarkedVerses] = useState<Record<number, boolean>>({});\n' + stateDeclarations);
}

fs.writeFileSync('src/components/SurahExplorerView.tsx', code);
