import re

with open('src/components/HifzPlannerView.tsx', 'r') as f:
    content = f.read()

# Add saveUserPlan to imports
content = content.replace('getUserPlan,', 'getUserPlan,\n  saveUserPlan,')

# Replace the onClick handler
old_click = 'onClick={() => setDailyPace(rate)}'
new_click = """onClick={() => {
                  setDailyPace(rate);
                  const updatedPlan = { ...userPlan, dailyPace: rate };
                  setUserPlan(updatedPlan);
                  saveUserPlan(updatedPlan);
                  window.dispatchEvent(new Event('hafiz_progress_updated'));
                }}"""

content = content.replace(old_click, new_click)

with open('src/components/HifzPlannerView.tsx', 'w') as f:
    f.write(content)
