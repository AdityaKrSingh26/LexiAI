import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress Chrome extension errors
window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('chrome-extension://')) {
    event.preventDefault();
    return false;
  }
});

// Suppress unhandled promise rejections from Chrome extensions
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('chrome-extension') || 
       event.reason.message.includes('message port closed'))) {
    event.preventDefault();
    return false;
  }
});

createRoot(document.getElementById('root')!).render(
  <App />
);