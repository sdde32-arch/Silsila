const fs = require('fs');
let code = fs.readFileSync('src/components/memorization/MemorizationLessonPage.tsx', 'utf8');

const target = `  // ---------------------------------------------------------------------------
  // AUDIO ENGINE (REFERENCE RECITER)
  // ---------------------------------------------------------------------------`;

const replacement = `  // Stop speech synthesis on step change
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [currentStepIdx]);

  // ---------------------------------------------------------------------------
  // AUDIO ENGINE (REFERENCE RECITER)
  // ---------------------------------------------------------------------------`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/memorization/MemorizationLessonPage.tsx', code);
