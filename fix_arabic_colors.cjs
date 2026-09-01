const fs = require('fs');
const path = require('path');

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = dir + '/' + file;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, filesList);
    } else if (name.endsWith('.ts') || name.endsWith('.tsx')) {
      filesList.push(name);
    }
  }
  return filesList;
}

const files = getFiles('./src');

let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Handle template literals containing classNames: className={`...`}
  // Handle regular strings: className="..."
  // Let's do a simple regex that finds `className=` followed by string or template literal
  
  // First regular string
  content = content.replace(/className=["']([^"']+)["']/g, (match, classStr) => {
    if (classStr.includes('font-quran') || classStr.includes('font-amiri')) {
      if (/(text-slate-(800|900|950)|text-gray-(800|900|950)|text-black)/.test(classStr) && !classStr.includes('dark:text-')) {
        return `className="${classStr} dark:text-slate-100"`;
      }
      if (/text-slate-700/.test(classStr) && !classStr.includes('dark:text-')) {
        return `className="${classStr} dark:text-slate-200"`;
      }
      if (/text-slate-400/.test(classStr) && !classStr.includes('dark:text-')) {
        let newClassStr = classStr.replace('text-slate-400', 'text-slate-500 dark:text-slate-300');
        return `className="${newClassStr}"`;
      }
    }
    return match;
  });

  // Handle template literals: className={`...`}
  content = content.replace(/className=\{`([^`]+)`\}/g, (match, classStr) => {
    if (classStr.includes('font-quran') || classStr.includes('font-amiri')) {
      if (/(text-slate-(800|900|950)|text-gray-(800|900|950)|text-black)/.test(classStr) && !classStr.includes('dark:text-')) {
        return `className={\`${classStr} dark:text-slate-100\`}`;
      }
      if (/text-slate-700/.test(classStr) && !classStr.includes('dark:text-')) {
        return `className={\`${classStr} dark:text-slate-200\`}`;
      }
      if (/text-slate-400/.test(classStr) && !classStr.includes('dark:text-')) {
        let newClassStr = classStr.replace('text-slate-400', 'text-slate-500 dark:text-slate-300');
        return `className={\`${newClassStr}\`}`;
      }
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${updatedCount} files.`);
