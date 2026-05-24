# Sayiad Frontend — Full Refactoring Plan

**Status:** All 11 phases complete 🎉  
**Owner:** Senior frontend architect  
**Estimated timeline:** ~3 weeks (13 phases) — completed

---

## Goal

Refactor and modernize the existing Vanilla JavaScript SPA architecture without rewriting to React or Vue. The project must remain Vanilla JS-based but become modular, scalable, maintainable, performant, and future-ready for possible Vue migration later.

The refactor must improve architecture, dependency management, code organization, realtime handling, developer experience, route-level performance, and maintainability **without changing existing business logic or breaking functionality**.

---

## Constraints

- NO React
- NO Vue rewrite
- NO TypeScript migration
- NO overengineering
- NO microfrontend architecture
- NO unnecessary libraries
- NO backend rewrites
- NO functionality regressions
- NO business logic changes

---

## 1. Migration Roadmap (11 phases, ~3 weeks)

### Progress Tracker

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Vite scaffold + move to src/ | ✅ Complete | Vite 6.4.2, Alpine 3.14.8, src/ structure created |
| 2 — CSS partials | ✅ Complete | 7 partials, same 89 kB bundle |
| 3 — ES Modules — core/ | ✅ Complete | 14 ES module files, all 32+ functions ported, build passes |
| 4 — ES Modules — pages + dynamic router | ✅ Complete | 25 pages converted, router uses dynamic import(), 0 script tags left |
| 5 — Feature-based directory restructure | ✅ Complete | 6 feature dirs created with domain-specific helpers |
| 6 — Alpine.js integration | ✅ Complete | Alpine stores (wallet, notif) + shared components (modal, toast, pagination) wired via event bus; Alpine.start() runs on boot; vendor-alpine chunk now 46 kB |
| 7 — Alpine migration — wallet + subs | ✅ Complete | wallet.js and subscriptions.js converted to Alpine x-data components with x-for, x-model, x-show, @click; Alpine magic helpers ($t, $formatPrice, etc.) in alpine.js; proper function exposure in component data |
| 8 — Alpine migration — auth + profile | ✅ Complete | login, register, forgot-password, reset-password, profile converted to Alpine x-data components with x-model, @submit.prevent, x-show; forgot-password 3-step wizard preserved in Alpine form |
| 9 — Alpine migration — checkout + carts | ✅ Complete | cart.js and checkout.js converted to Alpine x-data with x-for for items, x-model for forms, @click for actions; cart floating bar preserved; checkout address selector + wallet display reactive |
| 10 — Event bus + error handling | ✅ Complete | shared/helpers/errors.js created with normalizeApiError, handleApiError, setupGlobalErrorHandlers; api/client.js emits api:error on non-401 failures; app.js delegates to centralized handlers |
| 11 — Service worker + deploy polish | ✅ Complete | sw.js cleaned: removed PRECACHE_ASSETS (incompatible with Vite hashed filenames), simplified install to skipWaiting, bumped to sayiad-v11; runtime caching (network-first for JS/CSS/HTML, cache-first for images/fonts) preserved unchanged |

```
Phase  1: Vite scaffold + move to src/       [1 day] ✅
Phase  2: CSS partials                        [1 day] ✅
Phase  3: ES Modules — core/                  [2 days]
Phase  4: ES Modules — pages + dynamic router [2 days]
Phase  5: Feature-based directory restructure [1 day]
Phase  6: Alpine.js integration               [1 day]
Phase  7: Alpine migration — wallet + subs    [1 day]
Phase  8: Alpine migration — auth + profile   [1 day]
Phase  9: Alpine migration — checkout + carts [1 day]
Phase 10: Event bus + error handling          [1 day]
Phase 11: Service worker + deploy polish      [1 day]
                                           ─────────
                              Total: ~13 days
```

---

## 2. Exact File/Folder Restructuring

### Current → Target mapping

```
Before                              After
──────                              ─────
index.html                          src/index.html
css/style.css                       src/css/style.css  (entry, @imports partials)
css/                                src/css/_variables.css
                                    src/css/_base.css
                                    src/css/_layout.css
                                    src/css/_components.css
                                    src/css/_animations.css
                                    src/css/_utilities.css
                                    src/css/_rtl.css

js/config.js                        src/core/api/config.js
js/api.js                           src/core/api/client.js
js/auth.js                          src/core/auth/index.js
js/router.js                        src/core/router/index.js
js/signalr.js                       src/core/realtime/index.js
js/translations.js                  src/core/i18n/index.js
js/utils.js                         src/core/utils/dom.js
                                    src/core/utils/format.js
                                    src/core/utils/validation.js
                                    src/core/utils/ui.js
js/app.js                           src/app.js   (moves to src/)
js/background.js                    src/core/utils/background.js

pages/home.js                       src/pages/home.js
pages/login.js                      src/pages/login.js
pages/wallet.js                     src/pages/wallet.js
... (25 page files)                 src/pages/*.js

(no file)                           src/core/events/bus.js
(no file)                           src/core/stores/alpine.js
(no file)                           src/shared/constants/routes.js
(no file)                           src/shared/helpers/errors.js

(no file)                           vite.config.js
(no file)                           package.json

sw.js                               sw.js      (updated precache list)
vercel.json                         vercel.json (updated build config)
```

### Final tree

```
F:\DEPI Graduation Project\Front-end\
├── index.html                       # (remains at root for Vercel static serving)
├── package.json
├── vite.config.js
├── vercel.json
├── sw.js
├── logo.png
├── src/
│   ├── index.html                   # SPA shell (moved from root)
│   ├── app.js                       # Entry point — mounts app
│   ├── main.js                      # Vite entry — does Alpine.init + router.start
│   │
│   ├── core/
│   │   ├── api/
│   │   │   ├── config.js            # APP_CONFIG
│   │   │   ├── client.js            # request(), api object
│   │   │   └── errors.js            # normalizeApiError()
│   │   ├── auth/
│   │   │   └── index.js             # getUser, isAuthenticated, hasRole, requireAuth, logout
│   │   ├── router/
│   │   │   └── index.js             # navigate, router, routeMap, routeGuards, dynamic imports
│   │   ├── realtime/
│   │   │   └── index.js             # joinAuctionGroup, leaveAuctionGroup, getConnection
│   │   ├── i18n/
│   │   │   └── index.js             # t, getCurrentLang, setLanguage, translations data
│   │   ├── events/
│   │   │   └── bus.js               # EventBus — pub/sub
│   │   ├── stores/
│   │   │   └── alpine.js            # Alpine stores (auth, wallet, notif, cart)
│   │   └── utils/
│   │       ├── dom.js               # $, $$, showLoading, showError, renderEmptyState
│   │       ├── format.js            # formatPrice, formatDate, getCurrency
│   │       ├── validation.js        # validateForm, showFieldError, getPasswordStrength
│   │       ├── ui.js                # showConfirm, showToast, renderProductCards, renderStars
│   │       └── background.js        # Canvas underwater animation (IIFE preserved)
│   │
│   ├── features/
│   │   ├── auctions/
│   │   │   └── helpers.js           # Auction-specific formatters, status helpers
│   │   ├── wallet/
│   │   │   └── components.js        # Alpine components: walletCard, depositForm
│   │   ├── checkout/
│   │   │   └── validation.js        # Checkout-specific validators
│   │   ├── subscriptions/
│   │   │   └── helpers.js           # Plan helpers, price calc
│   │   ├── profile/
│   │   │   └── helpers.js           # Avatar upload helpers
│   │   └── auth/
│   │       └── validation.js        # Login/register form rules
│   │
│   ├── shared/
│   │   ├── constants/
│   │   │   └── routes.js            # ROLES, SELLER_ROLES, routeMap, routeGuards, routeTitleKeys
│   │   └── helpers/
│   │       └── errors.js            # globalErrorHandler, unhandledRejectionHandler
│   │
│   └── pages/
│       ├── home.js
│       ├── login.js
│       ├── register.js
│       ├── forgot-password.js
│       ├── reset-password.js
│       ├── products.js
│       ├── product-detail.js
│       ├── auctions.js
│       ├── auction-detail.js
│       ├── cart.js
│       ├── checkout.js
│       ├── dashboard.js
│       ├── verify-email.js
│       ├── shipping.js
│       ├── seller-profile.js
│       ├── order-detail.js
│       ├── admin.js
│       ├── terms.js
│       ├── privacy.js
│       ├── profile.js
│       ├── auction-requests.js
│       ├── auction-requests-review.js
│       ├── auctioneer-analytics.js
│       ├── subscriptions.js
│       └── wallet.js
```

---

## 3. Step-by-Step Execution Order (with exact code)

### Phase 1 — Vite scaffold

**Files to create:**

`package.json`:
```json
{
  "name": "sayiad",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "alpinejs": "^3.14.8"
  },
  "devDependencies": {
    "vite": "^6.3.0"
  }
}
```

`vite.config.js`:
```js
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-alpine': ['alpinejs'],
          'vendor-signalr': [],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://sayiad.runasp.net',
        changeOrigin: true,
      },
    },
  },
});
```

**Commands:**
```bash
cd "F:\DEPI Graduation Project\Front-end"
npm init -y
npm install vite --save-dev alpinejs --save
```

**Move `index.html` to `src/index.html`:**
- Copy `index.html` to `src/index.html`
- Remove all 35 `<script>` tags (lines 135-170)
- Replace with single entry: `<script type="module" src="/app.js"></script>`
- Change `<link rel="stylesheet" href="css/style.css">` → `href="/css/style.css"`
- Update preload links to point to `src/` paths

**Risk:** Vite root is `src/`, so paths in index.html are relative to `src/`. Static assets (`logo.png`) need to be accessible — either copy to `src/` or configure Vite with `publicDir: '../'`.

**Regression risk:** None if no code has changed yet — just file moves.

---

### Phase 2 — CSS partials

Split `css/style.css` into:

`src/css/_variables.css` — Extract `:root` and `[data-theme="dark"]` blocks (~300 lines)

`src/css/_base.css` — Reset, typography, body/html, sr-only, skip-link (~200 lines)

`src/css/_layout.css` — Navbar, footer, grid, containers, drawer (~800 lines)

`src/css/_components.css` — Cards, buttons, forms, tables, modals, badges, skeleton loaders, dropdowns, hero (~2000 lines)

`src/css/_animations.css` — Confetti, shimmers, keyframes, transitions (~500 lines)

`src/css/_utilities.css` — Spacing, text colors, display helpers, `.text-success`, `.text-danger` (~500 lines)

`src/css/_rtl.css` — All `[dir="rtl"]` overrides (~200 lines)

`src/css/style.css` — Entry point:
```css
@import '_variables.css';
@import '_base.css';
@import '_layout.css';
@import '_components.css';
@import '_animations.css';
@import '_utilities.css';
@import '_rtl.css';
```

**Tool:** Use a script or manually carve each section. The `:root` block + `[data-theme="dark"]` block are the easiest delimiters — they sit at the top of the file. Components can be identified by comments (`/* ── CARD ── */`, `/* ── BUTTON ── */`, etc.).

**Risk:** Low — CSS `@import` is well-supported and order-preserving.

---

### Phase 3 — ES Modules: core/

#### 3a: `src/core/i18n/index.js` (leaves, no deps)

Current: `translations.js` defines global `t()`, `getCurrentLang()`, `setLanguage()`, `data-i18n` scanner.

New:
```js
// src/core/i18n/index.js
export const translations = { en: { ... }, ar: { ... } }; // from existing
export let currentLang = localStorage.getItem("sayiad_lang") || "en";

export function t(key, replacements) { /* existing logic */ }
export function getCurrentLang() { return currentLang; }
export function setLanguage(lang) { /* existing logic */ }
export function updateStaticText() { /* existing logic */ }
```

#### 3b: `src/core/api/config.js`

```js
export const APP_CONFIG = {
  apiBaseUrl: "/api",
  swaggerUrl: "https://sayiad.runasp.net/swagger/index.html",
  signalrHubUrl: "/hubs/auction",
};
```

Note: `apiBaseUrl` changed from `https://sayiad.runasp.net/api` to `/api` because Vite proxy handles routing in dev, and Vercel rewrite handles it in prod.

#### 3c: `src/core/api/client.js`

```js
import { APP_CONFIG } from './config.js';
import { getAccessToken, setAccessToken, clearTokens, updateNavbar } from '../auth/index.js';
import { navigate } from '../router/index.js';
// ... rest of api.js logic as exports
export const api = { get, post, put, patch, delete, upload };
```

#### 3d: `src/core/auth/index.js`

```js
import { api } from '../api/client.js';
import { navigate } from '../router/index.js';
// ... all auth functions as exports
export function getUser() { ... }
export function isAuthenticated() { ... }
// etc.
```

#### 3e: `src/core/utils/format.js`, `dom.js`, `validation.js`, `ui.js`

Split `utils.js` (867 lines) by concern:

```js
// src/core/utils/format.js
import { t, getCurrentLang } from '../i18n/index.js';
export function getLocale() { ... }
export function getCurrency() { return "EGP"; }
export function formatDate(dateStr) { ... }
export function formatPrice(n) { ... }
export function statusClass(status) { ... }
export function tStatus(status, prefix) { ... }
export function tCondition(condition) { ... }

// src/core/utils/dom.js
export function $(sel, parent) { ... }
export function $$(sel, parent) { ... }
export function showLoading(container, type) { ... }
export function showError(container, msg) { ... }
export function showErrorWithRetry(container, msg, retryFn) { ... }
export function renderEmptyState(container, opts) { ... }
export function transitionContent(container, realHTML) { ... }
export function observeAnimations(root) { ... }
export function disconnectAnimObserver() { ... }

// src/core/utils/validation.js
export function showFieldError(el, msg) { ... }
export function clearFieldError(el) { ... }
export function clearAllFieldErrors(formEl) { ... }
export function getPasswordStrength(pw) { ... }
export function validateForm(formEl, rules) { ... }

// src/core/utils/ui.js
import { t } from '../i18n/index.js';
import { formatPrice } from './format.js';
import { escapeHtml } from './dom.js';
export function showConfirm(title, message, options) { ... }
export function renderStars(rating) { ... }
export function triggerConfetti() { ... }
export function debounce(fn, delay) { ... }
export function renderProductCards(container, products) { ... }
export function openQuickView(product) { ... }
export function openLightbox(images, startIndex) { ... }
export function trackRecentlyViewed(id, title, image, price, type) { ... }
export function renderRecentlyViewed(container) { ... }
export function progressiveImg(src, alt, className) { ... }
export function activateProgressiveImages(root) { ... }
export function calculateAge(birthdate) { ... }
// Keep escapeHtml in dom.js since it's a DOM-safety utility
```

Note: `showToast` stays in `app.js` (it's app-level, not a utility) but is exported from there.

#### 3f: `src/core/realtime/index.js`

```js
import { APP_CONFIG } from '../api/config.js';
import * as signalR from '@microsoft/signalr';  // or keep CDN
import { formatPrice, formatDate } from '../utils/format.js';
import { escapeHtml } from '../utils/dom.js';
import { t } from '../i18n/index.js';
import { getUser } from '../auth/index.js';
import { triggerConfetti } from '../utils/ui.js';
import { showToast } from '../../app.js'; // circular? Extract showToast to core/utils/

export let _connection = null;
export let _connectionPromise = null;

export function getConnection() { ... }
export async function startIfNeeded() { ... }
export async function joinAuctionGroup(auctionId) { ... }
export async function leaveAuctionGroup(auctionId) { ... }
export async function stopSignalR() { ... }
```

**Important:** `showToast` creates a circular dependency if app.js imports from realtime and realtime imports showToast from app.js. Solution: **Extract `showToast` into `src/core/utils/ui.js`** alongside other UI globals, where it logically belongs. Then realtime imports from ui.js.

#### 3g: `src/core/router/index.js`

```js
import { t } from '../i18n/index.js';
import { getUser } from '../auth/index.js';
import { showLoading } from '../utils/dom.js';
import { observeAnimations } from '../utils/dom.js';
import { updateNavbar } from '../auth/index.js';
import { runRouteCleanups } from './cleanups.js';
import { routes } from '../../shared/constants/routes.js'; // route manifest with lazy imports

let currentRouteKey = null;
let currentParams = {};

export function navigate(path) {
  window.location.hash = `#/${path}`;
}

export function getRoute() { ... }

export async function router(force = false) {
  const { route, params } = getRoute();
  const app = document.getElementById("app");
  const routeKey = route.includes("/") ? route.split("/")[0] : route;

  // Route guard check
  const guard = routeGuards[routeKey];
  if (guard) { /* same logic */ }

  // Dynamic import from route manifest
  const routeEntry = routes[routeKey];
  if (!routeEntry) { /* 404 */ return; }

  runRouteCleanups();

  showLoading(app, "page");
  try {
    const pageModule = await routeEntry(); // lazy import
    await pageModule.default(app, route, params);
    updateNavbar();
    // title, a11y, animations...
  } catch (err) {
    showError(app, "Failed to load page");
  }
}
```

#### 3h: `src/shared/constants/routes.js`

```js
import { ROLES } from './roles.js';
import { hasAnyRole } from '../../core/auth/index.js';

export const routeMap = {
  "": "home",
  login: "login",
  register: "register",
  // ... all 25 routes, value is page module name
};

export const routeGuards = {
  'admin':     (user) => !!user && user.role === ROLES.ADMIN,
  'wallet':    (user) => !!user,
  // ... all guards
};

export const routeTitleKeys = {
  "": "home.welcome",
  login: "nav.login",
  // ... all title keys
};

export const routes = {
  home:    () => import('../../pages/home.js'),
  login:   () => import('../../pages/login.js'),
  register: () => import('../../pages/register.js'),
  wallet:  () => import('../../pages/wallet.js'),
  subscriptions: () => import('../../pages/subscriptions.js'),
  // ... all 25 routes — each is a dynamic import
};
```

#### 3i: `src/core/events/bus.js`

```js
class EventBus {
  constructor() {
    this._target = new EventTarget();
  }

  on(event, callback) {
    const handler = (e) => callback(e.detail);
    this._target.addEventListener(event, handler);
    return () => this._target.removeEventListener(event, handler);
  }

  emit(event, detail = {}) {
    this._target.dispatchEvent(new CustomEvent(event, { detail }));
  }

  off(event, callback) { /* alias for removeEventListener */ }
}

export const bus = new EventBus();
```

Events to support:
- `auth:login` / `auth:logout`
- `cart:updated`
- `wallet:updated`
- `notif:updated`
- `route:changed`
- `realtime:bid`
- `realtime:auctionEnded`

#### 3j: `src/core/stores/alpine.js`

```js
import Alpine from 'alpinejs';
import { getUser } from '../auth/index.js';
import { bus } from '../events/bus.js';

document.addEventListener('alpine:init', () => {
  Alpine.store('auth', {
    user: getUser(),
    get isAuthenticated() { return !!this.user; },

    init() {
      bus.on('auth:login', (user) => { this.user = user; });
      bus.on('auth:logout', () => { this.user = null; });
    }
  });

  Alpine.store('wallet', {
    balance: 0,
    available: 0,
    async refresh() {
      try {
        const { default: apiModule } = await import('../api/client.js');
        const data = await apiModule.api.get('/wallet');
        this.balance = data.totalBalance;
        this.available = data.availableBalance;
      } catch {}
    }
  });
});
```

#### 3k: `src/app.js` — Entry point

```js
import Alpine from 'alpinejs';
import { router } from './core/router/index.js';
import { applyTheme, syncUserRoleAttribute, initHeroTilt } from './core/utils/ui.js';
import { applyLanguage } from './core/i18n/index.js';
import { getCurrentLang } from './core/i18n/index.js';
import { bus } from './core/events/bus.js';

// Make Alpine globally accessible for inline x-data
window.Alpine = Alpine;

// Initialize all app services
applyTheme(localStorage.getItem("sayiad_theme") || "light");
syncUserRoleAttribute();
initHeroTilt();
applyLanguage(getCurrentLang());

// Start Alpine
Alpine.start();

// Start router
window.addEventListener("hashchange", () => router());
window.addEventListener("DOMContentLoaded", () => router());

// Service worker registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
```

#### 3l: `src/main.js` — Vite entry (imports app.js)

```js
import './app.js';
```

---

### Phase 4: Convert pages/ to ES modules

Each page file converts from:
```js
// BEFORE
async function renderWallet(container) { ... }  // global
```
to:
```js
// AFTER
import { requireAuth } from '../core/auth/index.js';
import { api } from '../core/api/client.js';
import { t } from '../core/i18n/index.js';
import { formatPrice, formatDate } from '../core/utils/format.js';
import { escapeHtml } from '../core/utils/dom.js';
import { showToast } from '../core/utils/ui.js';

export default async function renderWallet(container) {
  if (!(await requireAuth())) return;
  // ... same logic
}
```

**All 25 pages follow identical pattern.** The body of each function is copied verbatim — **no business logic changes**.

The router calls `pageModule.default(container, path, params)`.

**Risk:** Any function that was called via `window[fnName]` from another page (e.g., `renderAuctionCards` from home.js → auctions.js) must be imported explicitly. For `renderAuctionCards` defined in `pages/home.js` and used in `pages/auctions.js`:

```js
// pages/home.js
export { renderAuctionCards };

// pages/auctions.js
import { renderAuctionCards } from './home.js';
```

This is cleaner but creates a chunk coupling — Vite will bundle them together. If this is undesirable, extract `renderAuctionCards` into a shared helper.

---

### Phase 5: Feature-based directory restructure

Move files from `src/core/utils/*` and `src/core/events/*` to their final locations. The actual exports don't change — just the import paths.

Example of path changes in a page:
```js
// Phase 4 path
import { formatPrice } from '../core/utils/format.js';
import { api } from '../core/api/client.js';

// Phase 5 path (same — the structure is already feature-based)
```

The `features/` directory is for **domain-specific helpers** that don't belong in core:
- `features/wallet/components.js` — Alpine components for wallet deposit modal, balance card
- `features/checkout/validation.js` — Checkout-specific form rules
- `features/subscriptions/helpers.js` — Plan tier icons, price display logic
- `features/profile/helpers.js` — Avatar upload, crop helpers

These are **NOT page handlers** — those stay in `pages/`. Feature modules are imported by pages when needed.

---

### Phase 6: Alpine.js integration

**Install via npm** (already done in Phase 1):
```bash
npm install alpinejs
```

**Initialize in `src/core/stores/alpine.js`** as shown above.

**Add Alpine globals** (stores for auth, wallet) so components can reference them without passing props.

**Create shared Alpine components** in `src/shared/components/`:

```js
// src/shared/components/modal.js
import Alpine from 'alpinejs';

Alpine.data('modal', ({ title, content, onClose }) => ({
  show: false,
  init() { this.show = true; },
  close() {
    this.show = false;
    setTimeout(() => { this.$el.remove(); onClose?.(); }, 200);
  }
}));
```

---

### Phase 7-9: Alpine page migration

**Only migrate these specific UI patterns** within page handlers:

| Pattern | Before | After |
|---------|--------|-------|
| Form state | `document.getElementById` + `addEventListener` | `x-model`, `@submit.prevent` |
| Toggle visibility | `element.style.display = "block/none"` | `x-show` |
| Button loading | `btn.innerHTML = '<i class="fas fa-spinner">...'` | `x-text` + conditional loading state |
| List rendering | `.map().join("")` inside template literal | `x-for` |
| Conditional content | ternary in template literal | `x-if` or `x-show` |

**Example migration: wallet.js**

Before (121 lines, vanilla):
```js
export default async function renderWallet(container) {
  if (!(await requireAuth())) return;
  container.innerHTML = `
    <div class="section-header"><h2>${t("wallet.title")}</h2></div>
    <div id="walletContent">${showLoading("card")}</div>`;

  const content = document.getElementById("walletContent");
  try {
    const wallet = await api.get("/wallet");
    const txns = await api.get("/wallet/transactions", { page: 1, pageSize: 20 });
    content.innerHTML = `
      <div x-data="walletPage">
        <div class="card">${formatPrice(wallet.totalBalance)}</div>
        <button @click="deposit()">${t("wallet.deposit")}</button>
      </div>`;
  } catch (err) { showError(content, err.message); }
}
```

After (~80 lines, Alpine):
```js
import { requireAuth } from '../core/auth/index.js';
import { api } from '../core/api/client.js';
import { t } from '../core/i18n/index.js';
import { formatPrice, formatDate } from '../core/utils/format.js';
import { showToast } from '../core/utils/ui.js';
import Alpine from 'alpinejs';

Alpine.data('walletPage', () => ({
  wallet: null,
  transactions: [],
  depositAmount: 0,
  showDeposit: false,
  loading: true,

  async init() {
    [this.wallet, this.transactions] = await Promise.all([
      api.get("/wallet"),
      api.get("/wallet/transactions", { page: 1, pageSize: 20 }),
    ]);
    this.loading = false;
  },

  async submitDeposit() {
    await api.post("/wallet/deposit", { amount: this.depositAmount });
    this.wallet = await api.get("/wallet");
    this.showDeposit = false;
    showToast(t("wallet.depositSuccess"), "success");
  }
}));

export default async function renderWallet(container) {
  if (!(await requireAuth())) return;
  container.innerHTML = `
    <div class="section-header"><h2>${t("wallet.title")}</h2></div>
    <div x-data="walletPage">
      <template x-if="loading">
        <div>${showLoading("card")}</div>
      </template>
      <template x-if="!loading">
        <div>
          <div class="card">
            <p x-text="t('wallet.balance')"></p>
            <h2 x-text="formatPrice(wallet.totalBalance)"></h2>
          </div>
          <button @click="showDeposit = !showDeposit">${t("wallet.deposit")}</button>
          <div x-show="showDeposit" x-transition>
            <input x-model="depositAmount" type="number">
            <button @click="submitDeposit()">${t("common.submit")}</button>
          </div>
          <table>
            <template x-for="txn in transactions" :key="txn.id">
              <tr>
                <td x-text="formatDate(txn.createdAt)"></td>
                <td x-text="formatPrice(txn.amount)"></td>
              </tr>
            </template>
          </table>
        </div>
      </template>
    </div>`;
}
```

---

### Phase 10: Event bus + error handling

**`src/core/events/bus.js`** — as defined in Phase 3.

**Global error handler** in `src/app.js`:
```js
import { showToast } from './core/utils/ui.js';
import { bus } from './core/events/bus.js';

window.addEventListener("unhandledrejection", (e) => {
  if (e.reason?.message?.includes("Network error")) return;
  if (e.reason?.message?.includes("Session expired")) return;
  showToast(e.reason?.message || "An unexpected error occurred", "error");
  console.warn("Unhandled rejection:", e.reason);
});

// Normalize API errors
bus.on("api:error", ({ status, message }) => {
  if (status === 401) return; // auth handles this
  if (status === 403) { showToast("Access denied", "error"); return; }
  if (status >= 500) { showToast("Server error. Please try again.", "error"); return; }
  showToast(message, "error");
});
```

---

### Phase 11: Service worker update

`sw.js` update:

```js
const CACHE_VERSION = "sayiad-v11";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",  // Vite output at dist/index.html
  "/assets/style.*.css",  // Vite hashed
  "/assets/vendor-alpine.*.js",
  "/assets/main.*.js",    // Vite entry chunk
];

// Then copy assets that change infrequently (fonts, images)
// ALWAYS use network-first for JS/CSS/HTML to avoid stale chunks
```

The key change: the SW **cannot precache individual page chunks** because they're dynamically imported and hash-named. Strategy change:
- **Install:** only cache `index.html`, entry JS, vendor JS, CSS
- **Page chunks (`assets/*.js`):** network-first (same as current)
- **Cache-first:** fonts, images (unchanged)

---

## 4. Potential Risks Per Phase

| Phase | Risk | Mitigation |
|-------|------|------------|
| 1 | Vite root change breaks asset paths | Test `npm run dev` before moving on |
| 1 | logo.png 404 | Copy to `src/` or use `publicDir` |
| 2 | CSS missing import causes style gaps | Check each partial after split, verify visually |
| 3 | Missing import in module chain | `npm run dev`, open browser console — red imports show instantly |
| 3 | Circular dependency (showToast ↔ realtime) | Extract showToast to core/utils/ui.js BEFORE module conversion |
| 3 | `signalR` CDN global not available as module | Keep CDN script in index.html OR `npm install @microsoft/signalr` |
| 4 | Dynamic import fails for some route | Test all 25 routes after conversion |
| 4 | `renderAuctionCards` cross-page import | Extract to shared helper or accept chunk coupling |
| 5 | Feature directories imported by wrong things | Lint: features/ should only import from core/, not other features/ |
| 6 | Alpine start() timing — DOM not ready | `Alpine.start()` after DOMContentLoaded in app.js |
| 7 | Alpine x-for breaks existing list rendering | Test wallet + subscriptions thoroughly — pagination must still work |
| 8 | Auth forms: Alpine.init replaces DOM listeners | Alpine handles form events via @submit, no conflict |
| 9 | Checkout flow: Alpine components interfere | Keep checkout in vanilla until stable, migrate last |
| 10 | Event bus memory leak from uncleaned subscriptions | `bus.on()` returns unsubscribe function; call in route cleanup |
| 11 | SW serves stale JS chunks | Add `version` query param to import paths or use import-meta.glob |
| 11 | Vite hashed filenames not in SW precache | SW must NOT precache dynamic chunks — they're network-first only |

---

## 5. Regression Risks

**Highest risk items that must be verified after each phase:**

1. **Authentication flow** — login, register, logout, token refresh, role guards
2. **All 25 routes** render without error (visit each one)
3. **SignalR** — join auction, place bid, see real-time update
4. **Wallet** — deposit, see balance update, paginated transactions
5. **Checkout** — full order flow with wallet deduction
6. **i18n** — toggle EN/AR on every page, verify no broken text
7. **Service worker** — fresh deploy doesn't serve stale chunks
8. **Mobile drawer** — open/close/escape key/backdrop click

---

## 6. Testing Checklist

```
□ `npm run dev` — Vite starts, HMR works
□ `npm run build` — clean dist/ output, no errors
□ All 25 routes load (visit each via navigation)
□ Login flow (with valid + invalid credentials)
□ Register flow
□ Token refresh on 401
□ Logout clears state
□ Role-based routing (Admin sees admin, Fisherman doesn't)
□ Wallet: view balance, deposit, paginated history
□ Subscriptions: view plans, upgrade
□ Checkout: add to cart → checkout → place order
□ Auctions: list, detail, place bid, real-time update
□ SignalR: join group, receive bid notification
□ i18n: switch EN→AR, verify RTL, verify translated strings
□ Theme: toggle dark/light
□ Mobile: hamburger menu, drawer open/close
□ Service worker: register, cache on first visit
□ SW update: deploy new version → refresh banner appears
□ 404 page renders for unknown routes
□ Back to top button works
□ Quick add to cart (from product cards)
□ Product detail page with review/report
```

---

## 7. Deployment Checklist

```
□ `npm run build` succeeds with 0 errors
□ `dist/` folder contains: index.html, assets/*.js, assets/*.css
□ vercel.json updated to point to dist/ (if Vite output dir changed)
□ SW.js precache list updated to reference Vite output
□ `npm run preview` — serves dist/, test all routes
□ Deploy to Vercel: vercel --prod
□ Verify deployed site loads without 404
□ Verify SW activates on first visit
□ Verify wallet API call succeeds (CORS, proxy)
```

---

## 8. Rollback Strategy

**At each phase boundary:**
```bash
git add -A && git commit -m "phase-N: description"
```

**If something breaks in production:**
```bash
git revert HEAD --no-edit  # revert last commit
vercel --prod              # redeploy previous version
```

**Pre-commit safety net:** Before each commit, run `npm run build`. If it fails, don't commit.

---

## 9. Suggested Commit Structure

```
commit 1  "vite scaffold + move src/ + package.json"
commit 2  "css: split into partials"
commit 3  "core/i18n: ES module conversion"
commit 4  "core/api: ES module conversion"
commit 5  "core/auth: ES module conversion"
commit 6  "core/utils: split into format, dom, validation, ui"
commit 7  "core/realtime: ES module conversion"
commit 8  "core/router: ES module + dynamic import manifest"
commit 9  "pages: convert 25 pages to ES module default exports"
commit 10 "events: EventBus + global error handler"
commit 11 "alpine: install, init stores, migrate wallet + subs"
commit 12 "alpine: migrate auth pages (login, register, profile)"
commit 13 "alpine: migrate checkout + remaining pages"
commit 14 "sw.js: update for Vite hashed output"
commit 15 "polish: remove dead code, update PROJECT_MAP"
```

---

## 10. Final Architecture Explanation

```
src/app.js                 ← Entry point (1 script tag)
│
├── core/                  ← Framework-agnostic, zero-dependency layer
│   ├── api/               ← HTTP client (fetch wrapper, JWT, refresh)
│   ├── auth/              ← Auth state (getUser, requireAuth, logout)
│   ├── router/            ← Hash router (navigate, guards, lazy imports)
│   ├── realtime/          ← SignalR (connection lifecycle, groups)
│   ├── i18n/              ← Translations (t(), setLanguage, RTL)
│   ├── events/            ← EventBus (pub/sub for cross-module comms)
│   ├── stores/            ← Alpine stores (auth, wallet, cart, notif)
│   └── utils/             ← Pure utility functions (format, dom, validation, ui)
│
├── features/              ← Domain-specific helpers (imported by pages)
│   ├── auctions/helpers.js
│   ├── wallet/components.js
│   ├── checkout/validation.js
│   ├── subscriptions/helpers.js
│   └── profile/helpers.js
│
├── shared/                ← Shared constants and helpers
│   ├── constants/routes.js
│   └── helpers/errors.js
│
└── pages/                 ← Route handlers (25 files, one per route)
    ├── home.js
    ├── wallet.js
    └── ...23 more
```

**Dependency direction:** `pages/` → `features/` → `core/` → nothing.  
**No circular deps.** `core/` never imports from `features/` or `pages/`.

---

## 11. Performance Impact Analysis

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Script tags in HTML | 35 | 1 | -97% |
| Initial JS loaded | ~8,500 lines (all files) | ~4,000 lines (core + router only) | -53% |
| Page-level JS loaded | All 25 pages upfront | Only the page you visit | ~-96% per page visit |
| Bundle size (prod) | ~350KB uncompressed | ~120KB core + ~20KB per page | -60% initial |
| HTTP requests on load | 35 (20KB overhead in headers) | 3 (entry + vendor + CSS) | -91% requests |
| HMR | None (manual refresh) | Instant via Vite | Developer productivity ↑ |
| Route transitions | 150ms debounce (manual) | Same (no change) | Neutral |
| Memory leaks | Risk from unstopped intervals/SignalR | Route cleanup + EventBus disposal | Fewer leaks |

**Chunk sizes (estimated after Vite build):**
- `assets/main-abc123.js` (~40KB) — core, router, i18n
- `assets/vendor-alpine-def456.js` (~10KB) — Alpine.js
- `assets/pages-wallet-ghi789.js` (~5KB) — wallet page (loaded on demand)
- `assets/pages-dashboard-jkl012.js` (~30KB) — dashboard page (loaded on demand)

---

## 12. Technical Debt Removed

| Debt | Removed in Phase |
|------|-----------------|
| Global scope pollution (34+ window globals) | 3 |
| Script load ordering fragility | 3 |
| 35 manual `<script>` tags in HTML | 3 |
| 5,000-line monolithic CSS | 2 |
| Manual DOM string construction (218 locations) | 7-9 |
| Scattered `addEventListener` (138 locations) | 7-9 |
| QuerySelector soup (430 locations) | 7-9 |
| Missing error normalization | 10 |
| No centralized event system | 10 |
| SignalR lifecycle leaks | 3 (cleanup in router) |
| Manual chunk management in SW | 11 |

---

## 13. Anti-Patterns Still Remaining After Migration

These are intentionally preserved because removing them would require a framework rewrite or change business logic:

| Anti-pattern | Why kept | Future migration impact |
|-------------|----------|-------------------------|
| `innerHTML` in Alpine-unconverted pages | Conversion is incremental; some pages stay vanilla | Future Phase: convert remaining |
| Global `Alpine` assignment | Alpine requires `window.Alpine` for inline directives | Removing `window.Alpine` requires build-time compilation (skip for now) |
| SignalR CDN (not npm) | `@microsoft/signalr` npm package is large (~80KB) | Can swap to npm later if tree-shook |
| `localStorage` as state store | No database, simple app state | If app grows, swap to IndexedDB via idb-keyval |
| Template literals in unconverted pages | Some pages stay vanilla until Alpine migration | Each page migration removes them |
| `document.getElementById` in unconverted pages | Same as above | Same |
| Inline `<style>` injection in app.js | Toast styles need to be available immediately | Could move to a critical CSS inline in head |

---

## 14. Completed Phases

### Phase 1 ✅ — Vite scaffold + move to src/

**Done:**
- Created `package.json` with Vite 6.4.2 + Alpine.js 3.14.8
- Created `vite.config.js` with dev proxy (`/api` → `sayiad.runasp.net`, `/hubs` → WebSocket proxy)
- `npm install` — 17 packages, 0 vulnerabilities
- Moved `index.html` → `src/index.html`, updated all paths to absolute (no more `?v=20260517` cache busters)
- Removed 6 preload link tags (Vite handles this)
- Moved `css/style.css` → `src/css/style.css`
- Copied all 9 `js/*.js` → `src/js/*.js`
- Copied all 25 `pages/*.js` → `src/pages/*.js`
- Copied `logo.png` → `src/logo.png`
- Updated `.gitignore` with `node_modules/` and `dist/`
- `npm run build` — clean, no errors, output in `dist/`
- `npm run dev` — Vite starts on port 3000, HMR ready

### Phase 2 ✅ — CSS partials

**Done:**
- Analyzed 5857-line `style.css` — identified 60+ named sections
- Split into 7 logical partials:
  - `_variables.css` (381 lines) — design tokens, dark mode, scrollbar, direction, theme transition
  - `_base.css` (67 lines) — reset, typography, base elements
  - `_animations.css` (223 lines) — keyframes, scroll animations, skeleton loaders
  - `_layout.css` (757 lines) — navbar, hamburger, main, footer, back-to-top, responsive base
  - `_components.css` (3527 lines) — cards, buttons, forms, tables, modals, hero, product cards, dashboard, etc.
  - `_rtl.css` (49 lines) — all `[dir="rtl"]` overrides
- `style.css` is now a 7-line entry point with `@import` directives
- `npm run build` — clean pass, CSS bundle unchanged (89 kB / 16 kB gzip)

### Phase 3 ✅ — ES Modules: core/

**Done:**
- Created **14 ES module files** across `src/core/` and `src/shared/`, covering every function from the 6 original script-tag files (config.js, api.js, auth.js, utils.js, signalr.js, router.js, translations.js)
- All **32+ utility functions** from the 867-line `src/js/utils.js` split into 4 concern-based modules:

  | Module | Exports |
  |--------|---------|
  | `src/core/utils/format.js` | `formatDate`, `formatPrice`, `statusClass`, `tStatus`, `tCondition`, `renderStars`, `getLocale`, `getCurrency` |
  | `src/core/utils/dom.js` | `$`, `$$`, `showLoading`, `showError`, `showErrorWithRetry`, `renderEmptyState`, `escapeHtml`, `transitionContent`, `progressiveImg`, `activateProgressiveImages`, `observeAnimations`, `disconnectAnimObserver`, `emptyIllustration` |
  | `src/core/utils/validation.js` | `showFieldError`, `clearFieldError`, `clearAllFieldErrors`, `getPasswordStrength`, `validateForm`, `calculateAge` |
  | `src/core/utils/ui.js` | `showConfirm`, `triggerConfetti`, `debounce`, `renderProductCards`, `openQuickView`, `openLightbox`, `trackRecentlyViewed`, `renderRecentlyViewed` |

- Core infrastructure modules:

  | Module | Exports |
  |--------|---------|
  | `src/core/api/config.js` | `APP_CONFIG` |
  | `src/core/api/client.js` | `getAccessToken`, `setAccessToken`, `clearTokens`, `api` (get/post/put/patch/delete/abort/upload), `refreshAccessToken` |
  | `src/core/auth/index.js` | `getUser`, `isAuthenticated`, `getRoleFromToken`, `hasRole`, `hasAnyRole`, `updateNavbar`, `invalidateCartCache`, `setCachedCartCount`, `updateCartBadge`, `updateNotifBadge`, `startNotifPolling`, `stopNotifPolling`, `logout`, `requireAuth` |
  | `src/core/router/index.js` | `registerRouteCleanup`, `navigate`, `router` |
  | `src/core/realtime/index.js` | `startIfNeeded`, `joinAuctionGroup`, `leaveAuctionGroup`, `stopSignalR` |
  | `src/core/events/bus.js` | `on`, `off`, `emit`, `once` |
  | `src/core/stores/alpine.js` | Alpine stores (auth, cart, ui) + `Alpine.start()` |
  | `src/core/i18n/index.js` | `translations`, `t`, `setLanguage`, `getCurrentLang`, `updateStaticText` |
  | `src/shared/constants/routes.js` | `ROLES`, `SELLER_ROLES`, `routeGuards`, `routeMap`, `routeTitleKeys` |
  | `src/shared/helpers/index.js` | `extractClaim`, `parseJwtPayload` |

- **Circular dependency avoided**: `api/client.js` emits `auth:session-expired` event instead of importing auth/router; `auth/index.js` listens and navigates via `window.location.hash`
- **i18n bugfix**: `t`, `setLanguage`, `getCurrentLang`, `updateStaticText` were missing `export` — fixed
- **Old files preserved**: All `src/js/*.js` and `src/pages/*.js` remain untouched — both old script-tag and new ES module imports can coexist
- `npm run build` — clean pass (expected warnings for non-module scripts in index.html)
- `npm run dev` — Vite starts on port 3000

### Phase 4 ✅ — ES Modules: pages + dynamic router

**Done:**
- **All 25 page files** converted from global functions to ES module default exports:
  - Each page now imports only the specific core modules it needs (i18n, api, auth, router, dom, format, validation, ui, realtime)
  - Cross-page dependencies handled properly: `renderAuctionCards` exported from `home.js`, imported by `auctions.js`; dashboard imports `renderAuctionRequests`, `renderAuctionRequestsReview`, `renderAuctioneerAnalytics` from their respective page modules
  - `window.onRouteCleanup` in forgot-password.js migrated to `registerRouteCleanup()`
  - `window.SELLER_ROLES` references in dashboard.js replaced with imported `SELLER_ROLES` constant

- **Router updated** (`src/core/router/index.js`):
  - Switched from `window[fnName]()` (global function lookup) to dynamic `import()` from route manifest
  - Route manifest added to `src/shared/constants/routes.js` with 25 lazy import functions
  - 404 handler preserved, route guards preserved, navigation logic unchanged

- **Entry point created** (`src/main.js`):
  - Single `<script type="module" src="/main.js">` replaces all 34 old script tags
  - Imports `src/core/app.js` which handles all app initialization: toast system, navbar scroll/dropdown/drawer, theme toggle, language toggle, ripple effect, focus-visible, global error handlers, onboarding tour, service worker registration

- **`showToast` extracted** from `src/js/app.js` into `src/core/utils/ui.js` to break the circular dependency between app.js and realtime module

- **`index.html` cleaned**:
  - Removed all 34 `<script defer>` tags (config.js, api.js, auth.js, utils.js, translations.js, 25 pages, background.js, signalr.js, router.js, app.js)
  - Kept only SignalR CDN script + single `<script type="module" src="/main.js">`

- **Build output** — 44 modules transformed, 30 chunks:
  - `assets/index-*.js` (103 kB / 28.7 kB gzip) — core + app init
  - 25 page chunks (1.5–34 kB each) — lazy-loaded on demand
  - 0 warnings, 0 errors
- `npm run dev` — Vite starts on port 3000
