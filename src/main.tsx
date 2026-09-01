import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { TajweedProvider } from './components/tajweed/TajweedProvider';
import { initTheme } from './services/themeService';
import './index.css';

// Initialize dark / light / system theme immediately on boot
initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TajweedProvider>
      <App />
    </TajweedProvider>
  </StrictMode>,
);
