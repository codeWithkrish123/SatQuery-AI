/**
 * Dynamic API Base URL resolution.
 * If running on localhost / 127.0.0.1, it connects to local dev server (port 5001).
 * If running in production (Cloudflare Pages, custom domain, etc.),
 * it ALWAYS routes to the live production backend: https://satquery-backend-sandy.vercel.app
 */

export const getApiBaseUrl = () => {
  // If window is defined (browser runtime)
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '[::1]';
    
    // Remote deployment (e.g. Cloudflare Pages, custom domains)
    if (!isLocal) {
      return (import.meta.env.VITE_PROD_API_BASE_URL || 'https://satquery-backend-sandy.vercel.app').replace(/\/+$/, '');
    }
  }

  // Local development
  return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/+$/, '');
};

export const API_BASE_URL = getApiBaseUrl();
