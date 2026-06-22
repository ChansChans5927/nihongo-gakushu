import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add global fetch interceptor to automatically append JWT token
const originalFetch = window.fetch;
window.fetch = async function (input, init) {
  const token = localStorage.getItem("nihongo_token");
  
  let urlStr = "";
  if (typeof input === "string") {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if (input && (input as Request).url) {
    urlStr = (input as Request).url;
  }

  let isApiCall = false;
  try {
    const parsedUrl = new URL(urlStr, window.location.origin);
    isApiCall = parsedUrl.pathname.startsWith("/api/");
  } catch (e) {
    isApiCall = urlStr.startsWith("/api/") || urlStr.includes("/api/");
  }

  if (token && isApiCall) {
    if (input instanceof Request) {
      const headers = new Headers(input.headers);
      headers.set("Authorization", `Bearer ${token}`);
      input = new Request(input, { headers });
    } else {
      init = init || {};
      let headers: Headers;
      if (init.headers instanceof Headers) {
        headers = init.headers;
      } else if (Array.isArray(init.headers)) {
        headers = new Headers(init.headers);
      } else {
        headers = new Headers(init.headers as Record<string, string> || {});
      }
      headers.set("Authorization", `Bearer ${token}`);
      init.headers = headers;
    }
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
