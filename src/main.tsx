import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add global fetch interceptor to automatically append JWT token
const originalFetch = window.fetch;
window.fetch = async function (input, init) {
  const token = localStorage.getItem("nihongo_token");
  const url = typeof input === "string" ? input : (input instanceof URL ? input.toString() : (input as Request).url);
  
  if (token && url.startsWith("/api/")) {
    init = init || {};
    init.headers = init.headers || {};
    if (init.headers instanceof Headers) {
      init.headers.set("Authorization", `Bearer ${token}`);
    } else if (Array.isArray(init.headers)) {
      init.headers.push(["Authorization", `Bearer ${token}`]);
    } else {
      (init.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
