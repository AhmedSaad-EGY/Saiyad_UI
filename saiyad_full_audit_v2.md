# SAIYAD_UI — FULL TECHNICAL AUDIT REPORT v2

**Repository:** https://github.com/AhmedSaad-EGY/Saiyad_UI  
**Live Deploy:** https://saiyad-eg.vercel.app  
**Backend API:** https://sayiad.runasp.net/swagger/index.html  
**Stack:** Vite 6 · Vanilla JS · Alpine.js v3 (CSP build) · Bootstrap 5 · ASP.NET Core  
**Total JS under audit:** ~13,900 lines across 90+ modules  
**Audit Date:** June 2026  
**Scope:** Full codebase static analysis — security, architecture, correctness, performance  

---

## Audit Context — What Changed Since the Prior Report

A previous audit report exists in the repository (`saiyad_audit_report.md`). The following issues from that report have been correctly resolved and are **not re-raised here**:

| Prior Issue | Status |
|---|---|
| `userMenu.innerHTML` XSS / structural bug | ✅ Fixed — now uses `textContent` on correct element |
| `unsafe-eval` in CSP | ✅ Fixed — removed from `vercel.json` |
| Access token in `localStorage` | ✅ Partially fixed — moved to `sessionStorage` |
| `isAuthenticated()` didn't validate JWT expiry | ✅ Fixed — now decodes and checks `exp` |
| `hasRole()` dual-source (localStorage vs JWT) | ✅ Fixed — JWT-only now |
| SignalR no null-guard in `getConnection()` | ✅ Fixed — now guarded |
| No SRI on Font Awesome / Animate.css CDN | ✅ Fixed — integrity hashes added |
| Placeholder WhatsApp number in footer | ✅ Fixed — real number |
| Auction `maxBid` cap at 5× starting price | ✅ Fixed — raised to 1000× |
| Manifest `lang: "ar"` | ✅ Fixed — now `"en"` |
| Login redirect not validated against route map | ✅ Fixed |
| Google Fonts missing `display=swap` | ✅ Fixed |
| `.agents/` AI tooling files committed | ✅ Fixed — removed |

This report covers only what is currently wrong. Issues below are either **new**, **surviving from the previous report**, or **introduced by incomplete fixes**.

---

## 1. Executive Summary

The codebase has improved substantially since the previous audit. The structural XSS vector is gone, the CSP is now meaningful, JWT validation is correct, and SRI is in place. If this were a static content site, it would be close to shippable.

It is not close to shippable, because **registration is completely broken at the code level**, a **route guard bypass requires two keystrokes in DevTools**, and the **confirm-password validator silently never runs**. These are not edge cases — they are the core user flows.

Beyond those blockers: credentials in a polled closure, an overly broad CSP script-src, a still-exposed internal audit document, and a refresh token that remains in localStorage for a platform processing real-money transactions.

**Verdict: NOT PRODUCTION READY.**  
The critical issues below must be resolved before any user traffic is sent to this application.

---

## 2. Critical Issues

---

### CRITICAL-01 — Registration is completely non-functional

**File:** `src/features/auth/register.js:42–43`  
**Also affected:** `src/shared/utils/validation.js:10–13`

```js
// register.js — Alpine component submit()
const errors = validateForm(this.$el.id, rules);
if (errors) { this.loading = false; return; }
```

```js
// validation.js — validateForm()
const form = (typeof formIdOrEl === 'string')
  ? document.getElementById(formIdOrEl)
  : formIdOrEl;
if (!form) return true;   // ← returns "valid" when form element not found
```

**Three compounding bugs that together make registration impossible:**

**Bug A — Wrong element ID:** The Alpine `x-data="registerForm"` directive is on the outer `<div class="auth-page">` wrapper (see `src/pages/register.js:18`). That element has no `id` attribute. `this.$el.id === ""`. `document.getElementById("")` returns `null` in all browsers. `validateForm` hits the early return guard and returns `true` — without running a single validation rule.

**Bug B — Inverted return value semantics:** `validateForm` returns `true` when the form is valid (no errors found) and `false` when validation fails. The calling code names the result `errors` and blocks submission with `if (errors)`. The logic is backwards: a valid form blocks submission, an invalid form allows it.

Because of Bug A, the form is never found and `true` is always returned. Because of Bug B, that `true` causes `if (errors) { return; }` to fire unconditionally. **No user can ever register.**

**Bug C — `matches` check is silently broken:** Even if Bugs A and B were fixed, the confirm-password rule passes `matches: 'password'` (a string). The validator expects `matches: { element: DOMElement }`. The branch `if (check.matches && check.matches.element)` never fires for a string. Passwords are never compared. A user can register with `password: "abc12345"` and `confirmPassword: "XXXXXXXX"`.

**Impact:** Zero new user registrations. The only way a user reaches the API is if they bypass the frontend entirely with a direct `POST /auth/register`. Every error validation scenario (underage, weak password, mismatched passwords) is silenced.

**Fix:**

```js
// register.js
// Pass the form element directly, not the Alpine wrapper's id
const form = this.$el.querySelector('form') || document.getElementById('registerForm');
clearAllFieldErrors(form);
const isValid = validateForm(form, rules);
if (!isValid) { this.loading = false; return; }  // stop if INVALID (false)

// validation.js — the early return should use false for "blocked"
if (!form) return false;  // treat missing form as validation failure

// For the matches rule — fix register.js rule definition:
{
  element: this.$refs.confirmPassword,
  required: true,
  matches: { element: this.$refs.password },  // pass element reference, not string
  messages: { required: t('...'), matches: t('...') }
}
```

---

### CRITICAL-02 — Route guards trust a forgeable `localStorage` object for all role-based access

**Files:** `src/shared/constants/routes.js:6–17`, `src/app/router.js:74`, `src/shared/utils/auth-state.js:3–7`

```js
// router.js
const user = getUser();      // reads localStorage.getItem(KEYS.USER)
if (!guard(user)) { ... }   // redirects based on user.role

// routes.js
'admin':                  (user) => !!user && user.role === ROLES.ADMIN,
'auction-requests-review':(user) => !!user && MODERATOR_ROLES.includes(user.role),
'auctioneer-analytics':   (user) => !!user && MODERATOR_ROLES.includes(user.role),
```

**Why this is critical:**

`getUser()` parses `localStorage.getItem('sayiad_user')`. Any browser user, logged in or not, can run:

```js
localStorage.setItem('sayiad_user', JSON.stringify({ id: 1, role: 'Admin', fullName: 'x' }));
```

...and navigate to `#/admin`. The route guard passes. The admin page renders in full — forms, category management, user suspension controls, subscription plan editors. All API calls to admin-only endpoints will return `403`, but the full admin UI is now rendered in the browser.

This is distinct from the previously fixed `hasRole()` bug. That fix correctly moved inline role checks to JWT. But the router's `routeGuards` still call `getUser()` for localStorage data, not `getRoleFromToken()` for JWT claims. The fix was applied to the wrong layer.

**Impact:** Any visitor can render the full admin panel UI. While backend APIs enforce authorization (preventing actual data modification), the admin UI surface is exposed to enumeration, confusion attacks, and any future misconfiguration of a single API endpoint.

**Fix:** Route guards must read from the JWT, not the user object in localStorage:

```js
// routes.js — replace user.role checks with JWT-sourced role
import { getRoleFromToken } from '../utils/auth-state.js';

export const routeGuards = {
  'admin':                  () => getRoleFromToken() === ROLES.ADMIN,
  'cart':                   () => ECOMMERCE_ROLES.includes(getRoleFromToken()),
  'checkout':               () => ECOMMERCE_ROLES.includes(getRoleFromToken()),
  'dashboard':              () => !!getRoleFromToken(),
  'shipping':               () => ECOMMERCE_ROLES.includes(getRoleFromToken()),
  'order-detail':           () => ECOMMERCE_ROLES.includes(getRoleFromToken()),
  'profile':                () => !!getRoleFromToken(),
  'auction-requests':       () => getRoleFromToken() === ROLES.FISHERMAN,
  'auction-requests-review':() => MODERATOR_ROLES.includes(getRoleFromToken()),
  'auctioneer-analytics':   () => MODERATOR_ROLES.includes(getRoleFromToken()),
  'subscriptions':          () => [...ECOMMERCE_ROLES, ROLES.AUCTIONEER].includes(getRoleFromToken()),
  'wallet':                 () => !!getRoleFromToken(),
};
```

The router signature changes to pass no `user` argument (guards are now zero-arg). Remove the `const user = getUser()` call in `router.js:74`.

---

## 3. High Severity Issues

---

### HIGH-01 — Refresh token remains in `localStorage`

**File:** `src/shared/api/client.js:22`, `src/features/auth/register.js:47`

```js
// client.js — clearTokens()
localStorage.removeItem(KEYS.REFRESH_TOKEN);   // confirms it lives in localStorage

// register.js — after successful registration
if (data.refreshToken) localStorage.setItem(KEYS.REFRESH_TOKEN, data.refreshToken);
```

The previous audit moved the access token to `sessionStorage`. The refresh token was not moved. Refresh tokens have a longer expiry window than access tokens — that is their entire purpose. Storing the refresh token in `localStorage` means any XSS on the page (past or future) yields persistent account access: an attacker steals the refresh token, exits the XSS, and can mint new access tokens indefinitely until the refresh token expires or is explicitly revoked.

For a platform that handles real-money wallet deposits and live auction bids, persistent session hijacking via a stolen refresh token is the worst possible outcome. This was listed as "post-launch hardening" in the previous report. It should not ship as a post-launch item.

**Impact:** Any XSS (even a transient one, now fixed) that ran during a user's session would have already exfiltrated the refresh token. Those tokens remain valid. Wallet balances remain at risk.

**Fix:** The refresh token must be in an `httpOnly; Secure; SameSite=Strict` cookie set by the backend on `/auth/login` and `/auth/register`. The `/auth/refresh` endpoint must accept the refresh token from the cookie, not the request body. This requires backend work. Remove `KEYS.REFRESH_TOKEN` from the frontend constants entirely — the frontend should never be able to read or write it.

---

### HIGH-02 — `showConfirm` injects title and message unsanitized into `innerHTML`

**File:** `src/shared/utils/ui.js:216–226`

```js
overlay.innerHTML = `
  <div class="modal modal-confirm" ...>
    <h3>${title}</h3>        // ← no escaping
    <p>${message}</p>        // ← no escaping
    ...
  </div>`;
```

Every caller currently passes `t()` return values (static translated strings) or the output of `formatPrice()` (a number formatter). No current caller passes user-controlled data, so this is not currently exploitable. But:

1. The API contract of `showConfirm(title, message)` does not enforce sanitization. Any future caller that passes user-controlled content — a product title in a "delete?" confirmation, a bid amount from an API response, an error message from the server — will introduce an XSS vector.
2. The bid confirmation in `src/features/auctions/bid.js:218` currently passes `formatPrice(amount)` where `amount = parseFloat(this.bidAmount)`. `parseFloat()` returns a number, so this is safe. If a future change replaced `parseFloat` with a string operation, it would instantly become exploitable.

**Impact:** Latent XSS. Not currently exploitable, but one careless future call away.

**Fix:** Apply `escapeHtml` to both parameters inside `showConfirm`:

```js
overlay.innerHTML = `
  <div class="modal modal-confirm" ...>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(message)}</p>
    ...
  </div>`;
```

---

### HIGH-03 — CSP `script-src` allowlists an entire CDN origin

**File:** `vercel.json:21`

```json
"script-src 'self' cdnjs.cloudflare.com"
```

This allows any script from any path on `cdnjs.cloudflare.com` to execute on Sayiad. cdnjs hosts thousands of JavaScript libraries. If an attacker achieves any script injection point (current or future), they can source any of those libraries to extend their attack. The allowlist should cover only the exact version of SignalR that is being loaded, not the entire CDN.

CSP does not support path-scoped script-src (only origins), so the proper fix is to move SignalR out of CDN delivery entirely.

**Fix:**

```bash
npm install @microsoft/signalr
```

Remove the CDN `<script>` tag from `index.html`. Import SignalR in `src/app/realtime.js`:

```js
import * as signalR from '@microsoft/signalr';
```

Remove `cdnjs.cloudflare.com` from `script-src` in `vercel.json`. Vite's bundler will include SignalR in the vendor chunk with proper tree-shaking. This also eliminates the `window.signalR` global access pattern.

---

### HIGH-04 — Plaintext credentials stored in a polling closure during email verification

**File:** `src/features/auth/register.js:62–82`

```js
function showVerificationOverlay(email, password) {  // ← password in scope
  // ...
  const timer = setInterval(async () => {
    // password in closure, in scope for up to 60 seconds
    const data = await api.post('/auth/login', { email, password });  // ← 30 API calls
  }, 2000);
}
```

After registration, if the backend returns an `accessToken` immediately (indicating email verification is still pending), the frontend enters a polling loop: it calls `POST /auth/login` with the user's raw email and password every 2 seconds for up to 60 seconds (30 calls) while waiting for email verification to complete.

Problems:

1. **Credential exposure:** The plaintext password lives in a JavaScript closure on the call stack and in memory for up to 60 seconds. It is accessible via Chrome DevTools → Sources → Scope inspection while the polling interval is active.

2. **Credential stuffing:** This makes 30 rate-limited `POST /auth/login` calls with real credentials. If the backend has login rate limiting (it should), the user's account could be temporarily locked out by their own registration flow.

3. **Race condition:** If the user navigates away mid-verification, `registerRouteCleanup(() => clearInterval(timer))` will fire and stop polling. But if the component reinitializes before cleanup fires, a second polling loop starts. Two concurrent loops will both attempt login, creating a thundering-herd on the auth endpoint.

**Impact:** Password accessible in-memory to any XSS, potential self-DoS on login rate limiting.

**Fix:** Remove this entire pattern. The correct flow is: after registration with email verification required, show a static "Check your email" screen and instruct the user to click the verification link. After clicking the link (handled server-side), they are redirected to `#/login`. Do not poll with credentials. If polling is required, have the backend return a verification-check token (not credentials) and poll a `/auth/verify-status?token=X` endpoint.

---

## 4. Medium / Low Issues

---

### MEDIUM-01 — Internal audit report committed to the repository

**File:** `saiyad_audit_report.md` (repo root)

The previous report identified `New Text Document.txt` as a problem. That file was renamed/converted to `saiyad_audit_report.md`. The contents are identical in nature: previously discovered vulnerabilities, internal architecture assessments, and technical debt discussion. This document is now version-controlled and will appear in every clone, fork, and pull request.

**Fix:** `git rm saiyad_audit_report.md`, add it to `.gitignore`, and remove it from git history: `git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch saiyad_audit_report.md'` or use `git-filter-repo`.

---

### MEDIUM-02 — `terms` acceptance is only enforced via a `disabled` button attribute

**File:** `src/pages/register.js:80`, `src/features/auth/register.js:14`

The registration submit button uses `:disabled="loading || !terms"`. There is no check for `terms === true` inside the `submit()` method. The Alpine `disabled` binding prevents normal interaction, but there are multiple ways to bypass it: submitting programmatically via the console, using a browser extension that removes `disabled` attributes, or triggering the submit event directly on the form. The backend must enforce terms acceptance independently — but the frontend should also validate this explicitly.

**Fix:**

```js
async submit() {
  this.loading = true;
  if (!this.terms) {
    showToast(t('auth.mustAcceptTerms'), 'error');
    this.loading = false;
    return;
  }
  // ... rest of submit
}
```

---

### MEDIUM-03 — `validateForm` returns `true` when form element is not found

**File:** `src/shared/utils/validation.js:10–13`

```js
if (!form) return true;  // "valid" when form not found
```

Returning "valid" on a missing form element is a silent failure. If any other caller passes an incorrect form ID, validation is skipped entirely and form submission proceeds. The semantics are: "if we can't find the form, assume it passed." This is the opposite of a safe default.

**Fix:** Return `false` (failed validation) when the form is not found, and log a warning:

```js
if (!form) {
  console.warn(`[validateForm] Form element not found for id: "${String(formIdOrEl)}"`);
  return false;
}
```

---

### MEDIUM-04 — `normalizeNotifications` still has excessive fallback chain

**File:** `src/features/notifications/index.js:16–26`

The notification shape normalization now tries three response shapes (`Array`, `data.items`, `data.data`). This is reduced from the previous eight-level chain, which is an improvement. However, the property-level normalization still accepts 14 different field names for 5 fields:

```js
const isRead = Boolean(n.isRead ?? n.read ?? n.readAt ?? n.readOn ?? n.dateRead);
const createdAt = n.createdAt ?? n.createdOn ?? n.createdDate ?? n.dateCreated
                ?? n.timestamp ?? n.sentAt;
```

This is a symptom of an unstable API contract that has changed repeatedly. Each fallback is a silent regression hider. When the API response schema changes again, no error is thrown — the UI just renders blank or wrong data.

**Fix:** Establish one canonical response shape with the backend and document it. Keep exactly one property name per field. Add a dev-mode assertion that warns if an unexpected shape is received.

---

### MEDIUM-05 — PWA manifest shortcut URLs missing leading slash

**File:** `src/public/manifest.json:28–35`

```json
"shortcuts": [
  { "name": "Products", "url": "#/products" },
  { "name": "Auctions", "url": "#/auctions" }
]
```

PWA shortcut URLs are resolved relative to the manifest's `start_url` (`"/"`). The string `"#/products"` is technically a relative URL that strips the path and appends only the hash, making it equivalent to `"/#/products"` when resolved from the root. However, this behavior is browser-defined and inconsistent. Several Chromium versions treat bare `"#/route"` as a same-document navigation to the current URL's hash, not an absolute navigation. The safe and unambiguous form is `"/#/products"`.

**Fix:** Change shortcut URLs to use the absolute hash path:

```json
{ "name": "Products", "url": "/#/products" },
{ "name": "Auctions", "url": "/#/auctions" }
```

---

### MEDIUM-06 — `robots.txt` disallow rules are completely ineffective

**File:** `src/public/robots.txt`

```
Disallow: /#/admin
Disallow: /#/dashboard
Disallow: /#/checkout
Disallow: /#/wallet
Disallow: /#/profile
Disallow: /#/shipping
Disallow: /#/order/
```

Search engine crawlers (Google, Bing, Yandex) strip the fragment portion of URLs before crawling. `/#/admin` is treated identically to `/` by every major crawler. These `Disallow` rules protect nothing. The crawlers index one page: the SPA shell at `/`. All of the protected routes are unreachable by crawlers regardless of `robots.txt`, because they exist only as JavaScript-rendered hash routes.

**Fix:** Remove all `Disallow` entries. They provide no security benefit, add noise, and reveal internal route names to anyone who reads the file. If the sitemap reference is present, keep it. Otherwise:

```
User-agent: *
Allow: /

Sitemap: https://saiyad-eg.vercel.app/sitemap.xml
```

---

### MEDIUM-07 — PWA uses a single icon for both `any` and `maskable` purposes

**File:** `src/public/manifest.json:6–21`

The same `logo.png` at 192×192 is declared twice — once for purpose `"any"` and once for purpose `"maskable"`. A maskable icon requires the primary visual content to sit within the center 80% (the "safe zone") of the image. If `logo.png` uses the full image area, it will be visually cropped by the OS circular or squircle mask applied to maskable icons. No 512×512 icon is provided, meaning high-DPI home screens and splash screens use the 192×192 version at 2.67× upscaling.

**Fix:** Create a properly padded 192×192 `logo-maskable.png` (content in the inner 80%) and a 512×512 `logo-512.png`. Update the manifest:

```json
"icons": [
  { "src": "/logo.png",          "sizes": "192x192", "type": "image/png", "purpose": "any" },
  { "src": "/logo-maskable.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
  { "src": "/logo-512.png",      "sizes": "512x512", "type": "image/png", "purpose": "any" }
]
```

---

### MEDIUM-08 — `hreflang` alternates both point to the same URL

**File:** `src/index.html:34–35`

```html
<link rel="alternate" hreflang="en"        href="https://saiyad-eg.vercel.app">
<link rel="alternate" hreflang="x-default" href="https://saiyad-eg.vercel.app">
```

The Arabic hreflang was removed since the prior report, which was the right call. What remains is `hreflang="en"` and `hreflang="x-default"` both pointing to the same URL. These are redundant — `x-default` is for when no language-specific version exists, and `en` for an English-specific version. Having both point to the same URL is not incorrect, but it is meaningless. Google's search documentation suggests including `hreflang` only when you have actual separate-URL language variants.

**Fix:** Since this SPA serves both languages from one URL using client-side i18n, remove both alternate hreflang tags. They add no SEO value and could confuse crawlers that expect separate URLs for different languages.

---

### LOW-01 — `require-atomic-updates` ESLint rule disabled globally

**File:** `eslint.config.js:42`

```js
"require-atomic-updates": "off", // too many false positives
```

This rule catches race conditions like:
```js
this.bidAmount = await api.post('/bids', ...);  // 'this' may be stale after await
```
In Alpine.js components that handle concurrent bid placement, cart updates, and wallet operations — all with `await` boundaries — this class of bug is real and hard to debug. Disabling globally rather than line-by-line hides future instances.

**Fix:** Re-enable the rule, suppress specific known false positives inline with `// eslint-disable-next-line require-atomic-updates` and a comment explaining why each suppression is safe.

---

### LOW-02 — Service Worker offline fallback is hardcoded English

**File:** `src/public/sw.js` (offline HTML template, lines 50–80)

```html
<h1>You are offline</h1>
<p>No internet connection. Check your network and try again.</p>
```

This runs outside the i18n system. Arabic-speaking users see English when offline. Accepted as a known limitation in the previous report and still unfixed.

**Fix Option A (Simple):** Accept it and document it. The offline page is a fallback of last resort and a corner case.  
**Fix Option B (Complete):** Serve two offline response variants. On the first page navigation, cache the current `document.documentElement.lang` value. In the Service Worker fetch handler, use a `BroadcastChannel` or a stored cache key to select the correct language for the fallback response.

---

### LOW-03 — `escapeHtml` uses a live DOM node

**File:** `src/shared/utils/dom.js`

```js
export function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}
```

Functionally correct in a browser. Requires `document`, meaning it breaks in Node.js unit tests, any future SSR scenario, or Web Workers. Called in 165+ places throughout the codebase — every render function depends on it. A test suite cannot import any render module without mocking the DOM.

**Fix:**

```js
const HTML_ESCAPES = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":"&#39;" };
export function escapeHtml(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, c => HTML_ESCAPES[c]);
}
```

---

## 5. Architectural Breakdown

### 5.1 Layering

The 5-layer architecture (`app / features / widgets / shared / pages`) is sound in intent. The `pages/` layer continues to add indirection without behavior — every page module does exactly:

```js
// src/pages/products.js (representative)
export default async function renderProducts(container) {
  container.innerHTML = `<div x-data="productsPage">...</div>`;
}
```

This is router-adapter boilerplate. The actual logic lives in `features/` and `widgets/`. The `pages/` layer exists solely to satisfy the dynamic import convention in `route-map.js`. It does not enforce any architectural boundary, add any behavior, or provide any abstraction. It adds one more directory to navigate for every feature. Consider collapsing it: each feature module exports a `render` function directly, and `route-map.js` imports from features.

### 5.2 Dependency Issues

**Cross-feature imports:** `src/features/auctions/bid.js` imports `getUser`, `requireAuth`, and `hasRole` from `src/features/auth/login.js`. These are shared utilities. Cross-feature imports should route through `src/shared/`. `login.js` re-exports from `auth-state.js`, creating two valid import paths for the same function.

**Feature-level utilities in wrong location:** `trackRecentlyViewed` was previously in `src/features/home/index.js`. It has been moved to `src/shared/utils/recently-viewed.js` — this is correct. However, `src/features/auctions/bid.js` still imports it from `src/features/home/index.js`:

```js
import { trackRecentlyViewed } from '../home/index.js';
```

This creates a cross-feature dependency where the auction feature depends on the home feature for a shared utility. Update this import to use `src/shared/utils/recently-viewed.js` directly.

**Alpine vs. imperative DOM update collision:** The navbar badge counts, the wallet top-up button states, and several other UI elements are managed by direct DOM manipulation (`button.innerHTML = ...`, `badge.textContent = n`) outside of Alpine reactivity. The main page content is managed by Alpine. Both update the same DOM tree. When Alpine re-renders due to a state change, it can overwrite direct DOM mutations made outside its scope. This is an architectural smell but not currently causing visible bugs.

### 5.3 Design Pattern Violations

**`showConfirm` and `createModal` accept raw HTML strings:** Both utility functions take arbitrary HTML content that is injected via `innerHTML`. Every caller is responsible for its own escaping. This is the wrong default — the API should accept text content and build the DOM structure internally (or accept a template object), not a raw HTML string. The current design means one careless future caller introduces XSS.

**Verification polling encodes authentication semantics in the UI layer:** The `showVerificationOverlay` function in `register.js` polls `/auth/login` to detect when a user verifies their email. This means a frontend UI function carries responsibility for session management. The polling logic, the interval cleanup, the credential closure, and the auth state transition all live in a render function. This should be a backend concern: the email verification link should issue a token directly, not require the frontend to poll with credentials.

---

## 6. Security Review

| ID | Issue | Severity | Location |
|---|---|---|---|
| S-1 | Route guards trust forgeable `localStorage` user.role | CRITICAL | `routes.js:6–17`, `router.js:74` |
| S-2 | Refresh token in `localStorage` | HIGH | `client.js:22`, `register.js:47` |
| S-3 | `showConfirm` injects title/message unsanitized into `innerHTML` | HIGH | `ui.js:216` |
| S-4 | CSP `script-src` allows all of `cdnjs.cloudflare.com` | HIGH | `vercel.json:21` |
| S-5 | Plaintext credentials in polling closure (verification flow) | HIGH | `register.js:62–82` |
| S-6 | Terms acceptance only enforced via `disabled` button | MEDIUM | `register.js`, `pages/register.js` |
| S-7 | `robots.txt` reveals internal route names | LOW | `public/robots.txt` |

**What remains well implemented:** `escapeHtml` usage is consistent across all ~170 render sites. `DOMPurify.sanitize` is correctly used via `safeSetHTML` in product detail review rendering. The CSRF implementation reads from `XSRF-TOKEN` cookie (ASP.NET Core standard). `clearCsrfToken()` is called on logout. Access token is in `sessionStorage`. Vite build has `sourcemap: false`. The SignalR CDN script has a correct SHA-512 SRI hash. Request deduplication prevents duplicate GET calls. `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security` headers are present and correct in `vercel.json`.

---

## 7. Performance Review

### Bottlenecks

**Google Fonts sync stylesheet:** Three font families × 5 weights from Google Fonts are loaded as `<link rel="stylesheet">`. `display=swap` is now added, which prevents FOIT. This is a meaningful improvement. The remaining issue is the two `preconnect` links — they correctly establish early connections to `fonts.googleapis.com` and `fonts.gstatic.com`, which is optimal. No remaining blocking performance regression here.

**Monolithic i18n bundle (unchanged):** `src/shared/utils/i18n.js` contains both English and Arabic translations in a single module assigned to the `core-i18n` Vite chunk. This chunk is loaded on every page visit regardless of the user's language. For Arabic text, at the current size (~1,800 lines), this adds ~35KB parsed-but-unused English strings to every session for Arabic-speaking users (and vice versa). If a third language is ever added, this doubles.

**SignalR connection lifecycle:** The connection opened when a user visits an auction page is never stopped until explicit logout. After the user leaves the auction page, `leaveAuctionGroup()` correctly removes the group subscription, but the underlying WebSocket connection to `sayiad.runasp.net/hubs/auction` remains open. For users who browse several auctions in a session, this maintains an idle WebSocket for minutes or hours. This creates unnecessary server-side connection overhead per concurrent user.

**Fallback polling on closed auctions:** `startFallbackRefresh()` starts a 60-second polling interval that only stops when `isActive === false` OR when the route cleanup fires. If SignalR is disconnected AND the auction has already ended before the user arrives, `this.isActive` is set to `false` in `init()` and the fallback interval is never started. This is correct. However, if the auction ends while the user is on the page and `isActive` transitions to `false` inside `startFallbackRefresh`, the interval stops itself correctly. The logic is sound but the code path is non-obvious.

### What Is Done Well

The Vite `manualChunks` configuration correctly vendors Alpine.js and Bootstrap into separate chunks. Dynamic imports in `route-map.js` mean page bundles are fetched only on first visit. `requestWithDedup` in the API client prevents concurrent duplicate GET requests. Skeleton loaders are consistently used during data fetching. `loading="lazy"` is on all product and auction card images. `IntersectionObserver`-based animations are used rather than scroll-based event handlers.

---

## 8. Final Verdict

### Production Ready: **NO**

### Minimum Required Fixes Before Deployment

These must be resolved before any real user traffic:

1. **[CRITICAL-01]** Fix registration. The correct call is `validateForm(this.$el.querySelector('form'), rules)` with inverted `if (!isValid) return` semantics. Fix `matches: 'password'` to pass the element reference. Fix `validateForm` early return to use `false` for missing forms.

2. **[CRITICAL-02]** Fix route guards. Replace all `(user) => user.role === ROLE` lambdas with zero-argument functions that call `getRoleFromToken()` from the JWT. Remove the `getUser()` call in `router.js`.

3. **[HIGH-01]** Move refresh token out of `localStorage`. Coordinate with backend to issue the refresh token as an `httpOnly; Secure; SameSite=Strict` cookie. This is a backend change.

4. **[HIGH-02]** Apply `escapeHtml()` to `title` and `message` parameters inside `showConfirm`.

5. **[HIGH-03]** Vendor the SignalR dependency via npm and remove `cdnjs.cloudflare.com` from `script-src` in the CSP.

6. **[HIGH-04]** Remove the credential-polling verification overlay. Show a static "check your email" screen and require the user to return via the verification link.

7. **[MEDIUM-01]** Remove `saiyad_audit_report.md` from the repository and git history.

8. **[MEDIUM-02]** Add server-side terms-acceptance check in the `submit()` method.

---

### Issues to Address Within First Sprint Post-Launch

- **[MEDIUM-03]** Fix `validateForm` to return `false` (not `true`) when form element is not found.
- **[MEDIUM-06]** Remove ineffective hash-based `Disallow` entries from `robots.txt`.
- **[MEDIUM-07]** Create proper maskable icon variant and 512×512 icon for PWA.
- **[MEDIUM-08]** Remove redundant `hreflang` alternates that point to the same URL.
- **[LOW-01]** Re-enable `require-atomic-updates` ESLint rule with targeted suppressions.
- **[HIGH-03 follow-up]** Once SignalR is vendored, implement `stopSignalR()` on tab backgrounding (Page Visibility API) to reduce idle WebSocket connections.

---

*End of Report — Saiyad_UI Audit v2*
