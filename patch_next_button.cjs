const fs = require('fs');
let code = fs.readFileSync('src/components/memorization/MemorizationLessonPage.tsx', 'utf8');

const target = `                <span>
                  {currentStepIdx === 0 && 'Next: Word Breakdown (Step 2/6) →'}
                  {currentStepIdx === 1 && 'Next: Shadowing Drill (Step 3/6) →'}
                  {currentStepIdx === 2 && 'Next: Self-Recite (Step 4/6) →'}
                  {currentStepIdx === 3 && 'Next: Active Recall Test (Step 5/6) →'}
                </span>`;

const replacement = `                <span>
                  {currentStepIdx === 0 && 'Next: Word Breakdown (Step 2/6) →'}
                  {currentStepIdx === 1 && 'Next: Translation Recall (Step 3/6) →'}
                  {currentStepIdx === 2 && 'Next: Shadowing Drill (Step 4/6) →'}
                  {currentStepIdx === 3 && 'Next: Self-Recite (Step 5/6) →'}
                  {currentStepIdx === 4 && 'Next: Active Recall Test (Step 6/6) →'}
                </span>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/memorization/MemorizationLessonPage.tsx', code);
