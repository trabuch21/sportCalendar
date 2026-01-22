import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize theme before React renders to prevent flash
function initializeTheme() {
  const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
  const theme = stored && (stored === 'light' || stored === 'dark' || stored === 'system') 
    ? stored 
    : 'system';
  
  const resolvedTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  
  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
