import re

with open('src/main.tsx', 'r') as f:
    content = f.read()

content = content.replace("import App from './App.tsx';", "import App from './App.tsx';\nimport { TajweedProvider } from './components/tajweed/TajweedProvider';")

content = content.replace("<App />", "<TajweedProvider>\n      <App />\n    </TajweedProvider>")

with open('src/main.tsx', 'w') as f:
    f.write(content)
