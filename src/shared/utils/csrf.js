/**
 * CSRF token utility for defense-in-depth protection.
 *
 * Token source priority:
 * 1. XSRF-TOKEN cookie (ASP.NET Core standard — set by backend)
 * 2. sessionStorage (survives navigation within tab, cleared on close)
 * 3. Crypto-generated random token (fallback for initial requests)
 *
 * The token is sent as `X-CSRF-Token` header on mutating requests
 * (POST, PUT, PATCH, DELETE) via api/client.js.
 */

const STORAGE_KEY = 'sayiad_csrf_token';

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

function readCookie() {
  const match = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function readMeta() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : null;
}

/**
 * Get the current CSRF token without generating a new one.
 * Returns null if no token is available.
 */
export function getCsrfToken() {
  // 1. Check sessionStorage first (fastest)
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) return stored;

  // 2. Check XSRF-TOKEN cookie (ASP.NET Core standard)
  const cookie = readCookie();
  if (cookie) {
    sessionStorage.setItem(STORAGE_KEY, cookie);
    return cookie;
  }

  // 3. Check meta tag
  const meta = readMeta();
  if (meta) {
    sessionStorage.setItem(STORAGE_KEY, meta);
    return meta;
  }

  return null;
}

/**
 * Ensure a CSRF token exists, generating one if needed.
 * Returns the token.
 */
export function ensureCsrfToken() {
  const existing = getCsrfToken();
  if (existing) return existing;

  const token = generateToken();
  sessionStorage.setItem(STORAGE_KEY, token);
  return token;
}

/**
 * Clear the CSRF token (call on logout).
 */
export function clearCsrfToken() {
  sessionStorage.removeItem(STORAGE_KEY);
}
