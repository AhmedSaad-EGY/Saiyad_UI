/**
 * CSRF token utility for defense-in-depth protection.
 *
 * Token source priority:
 * 1. XSRF-TOKEN cookie (ASP.NET Core standard — set by backend)
 * 2. sessionStorage (survives navigation within tab, cleared on close)
 *
 * The token is sent as `X-CSRF-Token` header on mutating requests
 * (POST, PUT, PATCH, DELETE) via api/client.js.
 *
 * NOTE: Client-side token generation was removed — the backend MUST
 * emit the XSRF-TOKEN cookie via AddAntiforgery(). See BACKEND_FIXES.md.
 */

const STORAGE_KEY = 'sayiad_csrf_token';

function readCookie() {
  const match = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

/**
 * Get the current CSRF token without generating a new one.
 * Returns null if no token is available.
 */
export function getCsrfToken() {
  // 1. Check sessionStorage first (fastest)
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) return stored;

  // 2. Check XSRF-TOKEN cookie (ASP.NET Core standard — set by AntiForgeryController)
  const cookie = readCookie();
  if (cookie) {
    sessionStorage.setItem(STORAGE_KEY, cookie);
    return cookie;
  }

  return null;
}

/**
 * Ensure a CSRF token exists — fetches from backend if not cached.
 * Returns the token, or null if the fetch fails.
 */
export async function ensureCsrfToken() {
  const existing = getCsrfToken();
  if (existing) return existing;
  try {
    const res = await fetch('/api/antiforgery/token', { credentials: 'include' });
    if (!res.ok) return null;
    const cookie = readCookie();
    if (cookie) sessionStorage.setItem(STORAGE_KEY, cookie);
    return cookie;
  } catch {
    return null;
  }
}

/**
 * Clear the CSRF token (call on logout).
 */
export function clearCsrfToken() {
  sessionStorage.removeItem(STORAGE_KEY);
}
