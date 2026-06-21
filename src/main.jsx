import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Fetch Interceptor to automatically add CSRF tokens
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      if (!options.headers) {
        options.headers = {};
      }
      if (options.headers instanceof Headers) {
        options.headers.set('x-csrf-token', csrfToken);
      } else if (Array.isArray(options.headers)) {
        options.headers.push(['x-csrf-token', csrfToken]);
      } else {
        options.headers = {
          ...options.headers,
          'x-csrf-token': csrfToken
        };
      }
    }
  }
  return originalFetch(url, options);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
