# 🎯 Sayiad (صياد) — Master Reference & TODO

> **Project**: Egypt's premier fishing marketplace & live auction platform  
> **Stack**: Vanilla JS SPA + Alpine.js 3.14.8 + Bootstrap 5.3 + Animate.css 4.1 + Vite 6 + SignalR + i18n (EN/AR)  
> **Last Updated**: June 4, 2026  
> **Purpose**: Single entry point — each section links to the deeper doc it summarizes

---

## 📚 DOCS MAP — What Each `.md` File Contains

| File | Contains | Open when... |
|------|----------|-------------|
| **`MASTER-REFERENCE.md`** *(this file)* | Hub + TODO — accounts, commands, links, file refs, checklist | Every session — start here |
| **`AUDIT_REPORT.md`** | Deep audit: 22 findings with code snippets, before/after, severity per file | Implementing a fix — copy-paste the exact code changes |
| **`user-role-flow.md`** | Permission matrices: 16 tables covering every feature × 5 roles | Debugging role/permission issues |
| **`phase-spec.md`** | Strategy: backend stack, what's broken, priorities, roadmap | Planning sprints, understanding the full picture |
| **`TOUGH_CLEANUP_PLAN.md`** | 70+ cleanup items across 7 phases — CSS dead code, unused imports, missing states, memory safety | **Every session — read first!** Prioritized execution order, updated as tasks complete |
| **`knowledge.md`** | Dev onboarding: conventions, gotchas, data flow rules | New devs, reminders about gotchas (Alpine, CDN, SW, circular deps) |

---

## 📌 QUICK LINKS

| Resource | URL |
|----------|-----|
| **Live Site** | https://saiyad-eg.vercel.app |
| **API Base** | https://sayiad.runasp.net/api |
| **Swagger** | https://sayiad.runasp.net/swagger/index.html |
| **SignalR Hub** | https://sayiad.runasp.net/hubs/auction |
| **Vercel Dashboard** | https://vercel.com/saiyad-eg/ |
| **Git Repo** | (main branch) |
| **GitHub Repo Frontend** | https://github.com/AhmedSaad-EGY/Saiyad_UI |
| **GitHub Repo Backend** | https://github.com/AhmedSaad-EGY/Saiyad |


---

## 🔑 TEST ACCOUNTS (All 5 Roles)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `sayiadapp@gmail.com` | `Sayiad@123` |
| **Customer** | `ahmedsaad20169711@gmail.com` | `Ahmed@123` |
| **Fisherman** | `ahmedback.net@gmail.com` | `Ahmed@123` |
| **BaitSeller** | `ahmedsaad20169755@gmail.com` | `Ahmed@123` |
| **Auctioneer** | `ahmedsaad20169799@gmail.com` | `Ahmed@123` |

---

## 🚀 COMMANDS

| Action | Command |
|--------|---------|
| Dev server (port 3000) | `npm run dev` |
| Build | `npm run build` |
| Preview dist | `npm run preview` |
| Install | `npm install` |
| Vercel deploy | `npx vercel --prod` |

---

## 🏗️ ARCHITECTURE

> 📖 **Full architecture (backend, DB schema, SignalR hubs) → see [`phase-spec.md`](./phase-spec.md#4-detailed-architecture)**
> 📖 **Dev conventions & gotchas → see [`knowledge.md`](./knowledge.md)**

```
src/
├── index.html              # Entry point
├── main.js                 # Boot: stores → ocean → app
├── core/
│   ├── api/config.js       # APP_CONFIG (apiBaseUrl, signalrHubUrl, swaggerUrl)
│   ├── api/client.js       # Fetch wrapper (JWT, auto-refresh, upload)
│   ├── app.js              # App init: navbar, footer, theme, i18n, SW, events
│   ├── auth/index.js       # getUser, hasRole, hasAnyRole, login/logout
│   ├── router/index.js     # Hash router (25 routes), routeGuards, dynamic imports
│   ├── i18n/index.js       # t(key), setLanguage, ~470 keys EN/AR
│   ├── realtime/index.js   # SignalR connection, join/leave auction groups
│   ├── events/bus.js       # DOM-based EventBus
│   ├── stores/alpine.js    # Alpine stores: auth, cart, ui, $t magic
│   └── utils/              # dom.js, format.js, ui.js, validation.js, ocean.js
├── pages/                  # 25 page handlers (lazy-loaded)
├── shared/
│   ├── constants/routes.js # ROLES, routeGuards, routes, routeTitleKeys
│   ├── helpers/errors.js   # Error boundary with fallback UI
│   └── components/         # modal.js, pagination.js
├── css/                    # 8 partials → style.css (+ Bootstrap)
├── public/sw.js            # Service worker (auto-versioned via build)
└── features/               # checkout/helpers.js, subscriptions/helpers.js
```

---

## 📋 ROUTE MANIFEST (25 Routes)

| Route | Page File | Guard | Title Key |
|-------|-----------|-------|-----------|
| `#/` (home) | `pages/home.js` | Public | `home.welcome` |
| `#/login` | `pages/login.js` | Public (redirect if auth) | `nav.login` |
| `#/register` | `pages/register.js` | Public (redirect if auth) | `nav.register` |
| `#/forgot-password` | `pages/forgot-password.js` | Public | `auth.forgotPassword` |
| `#/reset-password` | `pages/reset-password.js` | Public | `auth.resetPassword` |
| `#/verify-email` | `pages/verify-email.js` | Public | `verify.title` |
| `#/products` | `pages/products.js` | Public | `products.title` |
| `#/product-detail` | `pages/product-detail.js` | Public | `products.title` |
| `#/auctions` | `pages/auctions.js` | Public | `auctions.title` |
| `#/auction-detail` | `pages/auction-detail.js` | Public | `auctions.title` |
| `#/cart` | `pages/cart.js` | ECOMMERCE_ROLES | `nav.cart` |
| `#/checkout` | `pages/checkout.js` | ECOMMERCE_ROLES | `cart.title` |
| `#/dashboard` | `pages/dashboard.js` | Auth required | `nav.dashboard` |
| `#/shipping` | `pages/shipping.js` | ECOMMERCE_ROLES | `shipping.title` |
| `#/seller-profile` | `pages/seller-profile.js` | Public | `seller.title` |
| `#/order-detail` | `pages/order-detail.js` | ECOMMERCE_ROLES | `order.title` |
| `#/profile` | `pages/profile.js` | Auth required | `dash.profile` |
| `#/auction-requests` | `pages/auction-requests.js` | Fisherman only | `auctionRequests.title` |
| `#/auction-requests-review` | `pages/auction-requests-review.js` | MODERATOR_ROLES | `auctionRequestsReview.title` |
| `#/auctioneer-analytics` | `pages/auctioneer-analytics.js` | MODERATOR_ROLES | `analytics.title` |
| `#/subscriptions` | `pages/subscriptions.js` | ECOMMERCE_ROLES | `subscriptions.title` |
| `#/wallet` | `pages/wallet.js` | Auth required | `wallet.title` |
| `#/admin` | `pages/admin.js` | Admin only | `admin.title` |
| `#/privacy` | `pages/privacy.js` | Public | `auth.privacyPolicy` |
| `#/terms` | `pages/terms.js` | Public | `auth.termsAndConditions` |

---

## 👥 ROLE CONSTANTS

> 📖 **Full permission matrix → see [`user-role-flow.md`](./user-role-flow.md)** (16 tables covering every feature × 5 roles)
> 📖 **Role strategy & backend design → see [`phase-spec.md`](./phase-spec.md#6-user-roles-specification)**

Defined in `src/shared/constants/roles.js`:

```javascript
ROLES = { ADMIN, CUSTOMER, FISHERMAN, BAIT_SELLER, AUCTIONEER }
SELLER_ROLES = [Fisherman, BaitSeller]               # Product CRUD
ECOMMERCE_ROLES = [Customer, Fisherman, BaitSeller]  # Cart/Orders/Checkout
MODERATOR_ROLES = [Auctioneer, Admin]                  # Review + Analytics
```

---

## 🔴 AUDIT FINDINGS — TODO TRACKER

> 📖 **Full audit with code snippets & before/after → see [`AUDIT_REPORT.md`](./AUDIT_REPORT.md)**
> Each finding below is a summary — open AUDIT_REPORT.md for the exact code to change.

### Phase 1 — 🔴 CRITICAL (Memory leaks + CSP violations)

- [x] **Fix 1: Remove inline JS from index.html**
  - ✅ `src/index.html:30` — Removed `onclick="..."` from nav-links (redundant, already handled by JS)
  - ✅ `src/index.html:70` — Changed `href="javascript:void(0)"` → `href="#"` (event listener already has `preventDefault`)
  - ✅ `src/core/app.js:135-136` — Removed `window.closeDrawer = closeDrawer` and `window.openDrawer = openDrawer`
  - ✅ `src/shared/helpers/errors.js:54` — Replaced `onclick="window.location.reload()"` with `data-action="refresh"` + event listener
- [x] **Fix 2: EventBus scoped subscription tracking**
  - ✅ `src/core/events/bus.js` — Added `createScopedBus()` helper with `on()`, `off()`, `cleanup()`
  - ✅ **Note:** Audit found all 5 existing `on()` callers are in **core modules** (auth, realtime, stores, errors) — registered once at app init, no page-level accumulation. `createScopedBus()` is a proactive utility for future page-level use.
- [x] **Fix 3: SignalR group tracking + deduplication**
  - ✅ `src/core/realtime/index.js` — Added `_joinedGroups` Set + `_onreconnectedHandler` variable
  - ✅ `joinAuctionGroup` — deduplicates (early return if already joined), single `onreconnected` handler iterates ALL joined groups
  - ✅ `leaveAuctionGroup` — returns early if group not in `_joinedGroups`
  - ✅ `stopSignalR` — clears `_joinedGroups` and resets `_onreconnectedHandler`
- [x] **Fix 4: Add i18n keys** — `common.days`, `common.hours`, `common.minutes`, `common.seconds`
  - ✅ `src/core/i18n/index.js` — Added `common.days/hours/minutes/seconds` in EN + AR (أيام/ساعات/دقائق/ثوان)
  - ✅ `src/pages/auction-detail.js` — Replaced hardcoded "days"/"hrs"/"min"/"sec" with `${t('common.days/hours/minutes/seconds')}`
  - ✅ `src/pages/auction-detail.js` — Also fixed hardcoded `title="Auto bid"` in bid history section (caught by review)
  - ✅ `src/core/realtime/index.js` — Replaced hardcoded `title="Auto bid"` with `title="${t('auction.autoBid')}"`
- [x] **Fix 5: Remove !important from app.js**
  - ✅ `src/core/app.js` — Removed `.navbar { transition: ... !important; }` from injected style block
  - ✅ `src/css/_layout.css` — Added `backdrop-filter` to existing navbar transition (was missing)

### Phase 2 — 🟡 WARNING (Bad practices + perf)

- [x] **Fix 6: XSS audit — consistent escapeHtml usage**
  - ✅ Audited 28 files, 145 `innerHTML` assignments
  - ✅ `src/shared/helpers/errors.js` — Added `escapeHtml()` import, wrapped `message` in `showErrorFallback()`
  - ✅ `src/core/utils/ui.js` — Added `escapeHtml()` on `image` in `openQuickView()` and `openLightbox()` <img src> attributes
  - ✅ Build passes — 3 vulnerabilities patched
- [x] **Fix 7: Add input validation to wallet.js**
  - ✅ Max amount check (EGP 100,000 limit)
  - ✅ Decimal places limit (2 max)
  - ✅ Real-time Alpine validation via `depositError` getter
  - ✅ Button disabled while invalid, inline error span shown
  - ✅ `submitDeposit()` reuses same validation logic
  - ✅ 2 new i18n keys: `wallet.amountTooLarge`, `wallet.invalidDecimal`
- [x] **Fix 8: Add loading states to async operations**
  - ✅ Already implemented in prior UI polish work
  - ✅ **checkout.js**: `placing` flag, `:disabled`, spinner `x-show`, text swap `$t('cart.placingOrder')`
  - ✅ **subscriptions.js**: `btn.disabled`, spinner `.innerHTML` swap, error recovery
  - ✅ **wallet.js**: `depositing` flag, spinner class swap, button `:disabled`
  - ✅ i18n key `cart.placingOrder` exists in both EN/AR
- [x] **Fix 9: Add loading="lazy" to dynamically generated images**
  - ✅ `src/core/utils/ui.js` — `openQuickView` image added `loading="lazy"`
  - ✅ `src/pages/auction-detail.js` — Main auction product image added `loading="lazy"`
  - ✅ `src/pages/profile.js` — Avatar image (template + upload handler) added `loading="lazy"`
- [x] **Fix 10: Add missing registerRouteCleanup in auction-detail.js**
  - ✅ **Already fully implemented** — verified against source
  - ✅ `registerRouteCleanup(() => { leaveAuctionGroup(id); _timers.forEach(t => clearInterval(t)); })` (lines 27-30)
  - ✅ `_timers.push(timer)` for countdown interval (line 148)
  - ✅ `_timers.push(refreshTimer)` for auto-refresh (line 185)
- [x] **Fix 11: Implement CSRF token header**
  - ✅ `src/core/utils/csrf.js` — New utility: `getCsrfToken()` (sessionStorage → XSRF-TOKEN cookie → meta tag), `ensureCsrfToken()` (generates 32-byte hex via `crypto.getRandomValues()`), `clearCsrfToken()`
  - ✅ `src/core/api/client.js` — `getCsrfHeader(method)` adds `X-CSRF-Token` on POST/PUT/PATCH/DELETE; wired into `request()` and `upload()`
  - ✅ `src/pages/login.js` — Calls `ensureCsrfToken()` after successful login
  - ✅ `src/pages/register.js` — Calls `ensureCsrfToken()` in `doLogin()` (auto-login overlay)
  - ✅ `src/core/auth/index.js` — Calls `clearCsrfToken()` in `logout()`
  - ✅ Build passes | Review: clean, no circular deps
- [x] **Fix 12: Add swipe gesture support**
  - ✅ `src/core/utils/swipe.js` — New utility: `createSwipeGesture()` (generic horizontal swipe with RTL-aware direction, edge-only mode, passive listeners) and `createSwipeReveal()` (swipe-to-reveal-action pattern for cart)
  - ✅ `src/pages/cart.js` — Refactored `initSwipe()` to use `createSwipeReveal()`, multiple fallback strategies for product ID extraction, cleanup via `registerRouteCleanup`
  - ✅ `src/core/router/index.js` — Added `goBack()` export (history.length > 1 ? back : navigate to previous page or home)
  - ✅ `src/core/app.js` — Edge swipe-back navigation (35px threshold from screen edge, 80px trigger distance, RTL-aware, slide indicator with progress)
  - ✅ `src/css/_components.css` — Enhanced `.cart-swipe-delete` with RTL support, hover/active states, icon animation; removed old duplicate from mobile media query
- [x] **Fix 13: Add empty states to all list views**
  - ✅ **Admin users tab** — `renderEmptyState(panel, { icon: "fa-users", ... })` when no users
  - ✅ **Admin reports tab** — `renderEmptyState(content, { icon: "fa-flag", ... })` when no reports
  - ✅ **Admin orders tab** — `renderEmptyState(panel, { icon: "fa-box", ... })` when no orders
  - ✅ **Admin categories tab** — Empty state with "Add Category" button + form (can add first category)
  - ✅ **Admin plans tab** — `renderEmptyState(panel, { icon: "fa-crown", ... })` when no plans
  - ✅ **Admin revenue tab** — Replaced inline text with icon+message empty state in fee income table
  - ✅ **All other list views already had empty states** — cart, checkout, products, auctions, home, dashboard orders/products/wishlist/notifications, shipping, wallet, auction requests, subscriptions
- [x] **Fix 14: Consolidate table rendering**
  - ✅ `src/shared/components/pagination.js` — Added `manualPaginationHtml()` and `wirePagination()` (prev/next with RTL-aware chevrons, `t("common.page")` i18n)
  - ✅ `src/pages/admin.js` — 3 pagination bars (users, products, orders) replaced with shared functions
  - ✅ `src/pages/dashboard.js` — 1 pagination bar (orders) replaced with shared functions
  - ✅ **Products & auctions already using Alpine pagination** — no changes needed
- [x] **Fix 15: Standardize DOM approach (Alpine vs manual)**
  - ✅ Full Alpine conversion of auction-detail.js — reactive state, event bus integration, countdown, bid form, SignalR updates all managed by Alpine reactivity
  - ✅ `src/core/realtime/index.js` — Replaced direct DOM manipulation with event bus emissions (`realtime:bid-placed`, `realtime:auction-ended`)
  - ✅ `src/pages/auction-detail.js` — Complete rewrite: Alpine component with reactive countdown, bid slider↔input sync, quick-bid buttons, auto-bid toggle, price animations, sorted bid history, proper cleanup
  - ✅ Build passes | Review: clean, no dead state, no memory leaks
- [x] **Fix 16: Consolidate role constants (create roles.js)**
  - ✅ `src/shared/constants/roles.js` — Created with ROLES (Object.freeze), SELLER_ROLES, ECOMMERCE_ROLES, MODERATOR_ROLES
  - ✅ `src/shared/constants/routes.js` — Now imports from roles.js, re-exports for backward compat
  - ✅ 7 page files updated to import from roles.js instead of routes.js
  - ✅ 5 hardcoded role strings replaced with ROLES constants (admin.js, auction-requests.js, dashboard.js, home.js)
  - ✅ Build passes | Review: clean, no circular deps

### Phase 3 — 🟢 IMPROVEMENT (Polish)

- [x] **Fix 17: Enable sourcemaps in build**
  - ✅ `vite.config.js` — Added `sourcemap: true` inside the `build` block
  - ✅ Build passes — all chunks generate `.map` files in `dist/assets/`
  - ✅ Review: clean, proper placement
- [x] **Fix 18: Add debounce on search inputs**
  - ✅ Already implemented via Alpine's `.debounce` modifier (products.js: `@input.debounce.400ms`, auctions.js: `@input.debounce.400ms`, minPrice/maxPrice: `@input.debounce.500ms`)
  - ✅ No changes needed — Alpine `.debounce` is the proper approach vs the JS `debounce()` utility in `ui.js`
- [x] **Fix 19: Service worker auto-versioning**
  - ✅ `vite.config.js` — Added `swVersionPlugin()` that replaces `__SW_VERSION__` with a build timestamp (`Date.now().toString(36)`) in `dist/sw.js` at closeBundle time
  - ✅ `src/public/sw.js` — `sayiad-v12` → `sayiad-__SW_VERSION__` (auto-versioned per build)
  - ✅ Build passes — version injected: `vXXXX` verified in dist/sw.js
- [x] **Fix 20: Enhance ARIA attributes**
  - ✅ `src/core/utils/validation.js` — `showFieldError()` links error element to input via unique `aria-describedby` ID (`fe-{counter}`)
  - ✅ `src/core/utils/ui.js` — Toast container gets `role="status"`, `aria-live="polite"`, `aria-atomic="false"`
  - ✅ `src/pages/admin.js` — `showFormModal()` sets `role="dialog"`, `aria-modal="true"`, `aria-label={title}`
  - ✅ `src/pages/auction-requests-review.js` — Both approve/reject modals set `role="dialog"`, `aria-modal="true"`, `aria-label`
  - ✅ Build passes | Review: clean, no issues
- [x] **Fix 21: Add HTTP request deduplication**
  - ✅ `src/core/api/client.js` — Added `_pendingRequests` Map + `requestWithDedup()` wrapper
  - ✅ GET-only dedup: concurrent identical requests share the same pending promise
  - ✅ Key = `${method}:${endpoint}` (endpoint includes query string for GET)
  - ✅ Skips dedup on `_retry` flag (prevents recursion in 401 auto-refresh)
  - ✅ Identity check in `.finally()` prevents premature cleanup
  - ✅ Upload also deduped via `UPLOAD:` prefix key, extracted to `doUpload()` helper
  - ✅ Build passes | Review: clean, no dead code
- [x] **Fix 22: Add ESLint config**
  - ✅ ESLint installed (`eslint`, `globals`, `@eslint/js`)
  - ✅ Flat config created (`eslint.config.js`) with browser + Alpine + SignalR globals
  - ✅ Rules: eqeqeq, no-var, prefer-const, no-empty (allowEmptyCatch), no-implicit-globals, no-shadow warnings
  - ✅ Fixed 16 errors across 11 files (empty catch, prefer-const, no-undef, no-useless-escape, duplicate keys)
  - ✅ `npm run lint` passes — 0 errors, 89 warnings (intentional: unused vars with ignore patterns, console warn/error)
  - ✅ `npm run build` passes — 0 errors
- [x] **Fix 23: Mobile tap target audit**
  - ✅ Universal: `.btn-icon` 40→44px, `#motionToggle` 40→44px
  - ✅ Touch overrides: `.notif-bell` 38→44px, `.footer-social-link` 36→44px, `.toggle-btn` min-h 44px, `.quick-add-btn` 36→44px
  - ✅ Mobile overrides: `.qty-btn` 36→44px (768px) / 48px (480px), `.cart-remove-cell .btn` 36→44px
  - ✅ `.toggle-password`: 4→10px padding, min-width/min-height 44px, flexbox centering
  - ✅ Touch-device hover transforms disabled on all cards
  - ✅ Build passes | Review: clean

---

## ✅ COMPLETED TASKS

> 📖 **Full audit document → [`AUDIT_REPORT.md`](./AUDIT_REPORT.md)**
> **Permission details → [`user-role-flow.md`](./user-role-flow.md)**
> **Strategic context → [`phase-spec.md`](./phase-spec.md)**

- [x] **May 26**: Create test accounts for all 5 roles
- [x] **May 26**: Verify all 5 role accounts on live site
- [x] **May 26**: Document discrepancies between codebase and live (old deployment)
- [x] **May 26**: Trigger Vercel redeploy (empty commit `54e6ae4`)
- [x] **May 26**: Update `user-role-flow.md` with deployment note
- [x] **May 26**: Refactor `t()` → `$t()` in Alpine directives (6 pages)
- [x] **May 26**: Full codebase audit (22 findings, see `AUDIT_REPORT.md`)
- [x] **May 26**: Create `codebase-audit.md` (short version of audit)
- [x] **May 26**: **Phase 1 Fix 1** — Remove inline JS (index.html: onclick + void(0), app.js: globals, errors.js: onclick) | Build: ✅ | Review: ✅
- [x] **May 26**: **Phase 1 Fix 2** — EventBus scoped subscription tracking (`createScopedBus()` helper in bus.js) | Build: ✅ | Review: ✅
- [x] **May 26**: **Phase 1 Fix 3** — SignalR group tracking + deduplication (`_joinedGroups` Set, single `onreconnected` handler, guarded `leaveAuctionGroup`, stop cleanup) | Build: ✅ | Review: ✅
- [x] **May 26**: **Phase 1 Fix 4** — i18n keys for countdown labels (`common.days/hours/minutes/seconds` EN/AR, replaced hardcoded labels in auction-detail.js + realtime/index.js) | Build: ✅ | Review: ✅
- [x] **May 26**: **Phase 1 Fix 5** — Remove `!important` from navbar transition (moved from injected JS block to `_layout.css`, added missing `backdrop-filter`) | Build: ✅ | Review: ✅
- [x] **May 26**: **Phase 2 Fix 7** — Wallet input validation (Alpine `depositError` getter, max 100k EGP, 2 decimal limit, real-time feedback, 2 i18n keys) | Build: ✅ | Review: ✅
- [x] **May 26**: **Phase 2 Fix 9** — Add `loading="lazy"` to dynamically generated images (`openQuickView`, auction-detail main image, profile avatar) | Build: ✅ | Review: ✅
- [x] **May 26**: **Phase 2 Fix 10** — `registerRouteCleanup` in auction-detail.js (already implemented — verified: SignalR group leave, countdown interval clear, auto-refresh timer all registered) | No changes needed
- [x] **May 28**: **Bootstrap Phase 1** — Foundation setup (install Bootstrap 5.3.8 + Popper, create `_bootstrap-overrides.css` mapping 30+ OKLCH tokens → Bootstrap CSS vars, wire imports in style.css + main.js) | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Animate.css Phase 1** — CDN link + `animate()` utility in `dom.js` (supports duration/delay/iterations/keep opts, auto-cleanup via `animationend`) | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Bootstrap Phase 2** — Navbar migration to Bootstrap component classes (html: navbar-expand-lg, navbar-brand, navbar-nav, navbar-toggler; CSS: .nav-logo→.navbar-brand, .nav-links→.navbar-nav, .hamburger→.navbar-toggler; JS: selector update) | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Bootstrap Phase 3** — Card component migration (added `card` class to all `product-card` + `glass-card` elements across 5 JS files; increased CSS specificity to `.product-card.card:hover` to beat `.card:hover` from overrides; fixed touch device override) | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Bootstrap Phase 4** — Auth cards + account pages migrated to Bootstrap card sub-components (`.card-header`, `.card-body`, `.card-footer` across 14 page files; CSS `:has()` selector logic to handle bare cards vs sub-component cards; mobile auth-page responsive overrides) | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Bootstrap Phase 5** — Cleanup redundant custom CSS (`.hidden`→`.d-none`, `.sr-only`→`.visually-hidden`, `.btn-block`→`.w-100`, `.flex .items-center`→`.d-flex .align-items-center`; removed 20+ utility classes from `_components.css`) | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Animate.css Phase 2** — Toast entrance + cart total pop + bid count-up flash: replaced custom keyframes with `animate(el, 'bounceIn')` via `animate()` utility; removed `@keyframes priceFlash`, `@keyframes cartTotalPop`, `.price-flash`, `.cart-total-pop` | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Animate.css Phase 3** — Scroll animation migration: `observeAnimations()` now applies Animate.css `fadeInUp` via `animate()` instead of custom fadeInUp/staggerIn keyframes; removed `@keyframes fadeInUp`, `@keyframes staggerIn`; stagger delay managed via CSS nth-child | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Animate.css Phase 4** — Removed unused `@keyframes fadeIn` (now provided by Animate.css CDN), `slideLeft`, `slideRight` (zero usages) from `_animations.css`; retained `slideUp`, `slideDown`, `scaleIn`, `shake` as custom (Animate.css equivalents use 100% element-height transforms that would visually break subtle offsets) | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Auth page entrance** — `.auth-page` CSS animation swapped from custom `slideUp` to Animate.css `fadeIn` (affects login.js, register.js, forgot-password.js) | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Auction detail-info entrance** — Replaced inline `animation:slideUp` on `.detail-info` in auction-detail.js with `animate(el, 'fadeInUp', { duration: '0.5s' })` inside `$nextTick`; removed CSS `animation: slideUp` from `.detail-info` rule in `_components.css` | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Animate.css audit — _animations.css** — Found and removed unused `@keyframes shimmer` (zero `animation:` references); cleaned up 2 stale comments from bounceIn migration; verified all 8 remaining keyframes + all classes are actively referenced | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **CSS vars audit — _variables.css** — Removed 11 unused CSS custom properties (9 from `:root`: `--leading-none`, `--ease-in-out`, `--accent-ghost`, `--text-4xl`, `--text-5xl`, `--blob-1/2/3`, `--color-border-tertiary`, `--shimmer-gradient`, `--urgency-bg`; 2 from `[data-theme="dark"]`: `--accent-ghost`, `--blob-1/2/3`) | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Keyframe audit — _components.css** — Found 2 unused keyframes (`priceFlash` — replaced by Animate.css `bounceIn` in Phase 2, `shake` — zero references, Animate.css provides same via CDN); 12 of 14 keyframes in active use | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Bootstrap overrides audit — _bootstrap-overrides.css** — Found 7 non-existent `--bs-input-*` mappings (inert — Bootstrap 5.3 doesn't define them, sets Sass vars like `$input-bg` not `--bs-input-bg`); 28 valid but unused component vars (modals, tooltips, popovers, dropdowns, badges, alerts — none of these Bootstrap JS components are used in the project) | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **_animations.css full audit** — All 8 keyframes (`slideUp`, `slideDown`, `scaleIn`, `spin`, `pulse`, `ripple`, `skeleton-loading`, `contentFadeIn`) and all classes verified in active use — no stale animations remain | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Remove 2 stale keyframes** — Removed `@keyframes priceFlash` and `@keyframes shake` (plus `.form-input.shake` selector) from `_components.css`; both were unused, Animate.css provides equivalents via CDN | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Layout CSS audit — _layout.css** — Audited all keyframes (`ping`, `fishSwim`, `navWave`), classes (`nav-actions`, `nav-toggles`, `footer-*`, etc.), and custom properties. All 100% in use. Minor finding: `.auth-page .card` padding at 480px breakpoint is inert (overridden by Bootstrap `:has()` selector) — pending future cleanup. | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Bootstrap Grid Phase A — Simple grids** — Migrated dashboard overview (`.grid.grid-2` → `.row.g-3.mt-3` + `.col-sm-6`), profile stats (`.profile-stats` → `.row.g-3` + `.col-sm-4`), admin revenue (inline grid → `.row.g-3.mb-4` + `.col-md-3`), profile links (`.profile-links-grid` → `.row-cols-2.row-cols-sm-3`); removed stale `.grid`, `.grid-2`, `.grid-3`, `.grid-4`, `.profile-stats` CSS rules | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Bootstrap Grid Phase B — Product/feature grids** — Replaced custom `gap: 24px` on `.product-grid` and `.features-grid` with Bootstrap `.gap-4` utility class (1.5rem = 24px); removed responsive gap overrides at 480px/360px; added `.gap-4` to all 8 grid instances across home.js, products.js, auctions.js | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Bootstrap Grid Phase C — Page layout grids** — Migrated checkout `.detail-page` → `.row.g-5` + `.col-lg-6`, dashboard `.dashboard-layout` → `.row.g-3` + `.col-md-3/.col-md-9`, product-detail/auction-detail `.detail-page` → `.row.g-5` + `.col-lg-6`; fixed mismatched HTML in checkout.js and product-detail.js; removed `.detail-page` and `.dashboard-layout` CSS rules | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Bootstrap Grid Phase D — CSS cleanup** — Removed stale responsive grid overrides from `_layout.css` at 1024px/768px/480px breakpoints for `.dashboard-layout`, `.detail-page`, `.grid-2/3/4`, `.features-grid`, `.product-grid`, `.profile-stats`; cleaned up dead `.checkout-grid` rule | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **product-grid → Bootstrap row/cols** — Replaced `.product-grid` CSS Grid across 5 pages (home.js, products.js, auctions.js, product-detail.js, seller-profile.js) with `row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4`; removed 4 CSS rules from `_components.css` and `_layout.css` | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **features-grid → Bootstrap row/cols** — Replaced `.features-grid` CSS Grid in home.js with `row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 my-5`; removed CSS rule from `_components.css` | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **profile-links-grid → Bootstrap row/cols** — Replaced `.profile-links-grid` CSS Grid in profile.js with `row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3 mt-3`; removed CSS rule from `_components.css`; restored `.profile-link-card` base rule after accidental deletion | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Inline style audit & migration — Phase 1** — Migrated 200+ inline `style` attributes to Bootstrap utility classes across 22 files: `dom.js` (skeleton padding→py-*, auth skeleton→mx-auto/rounded-3), `ui.js` (recently-viewed→d-flex/text-muted, quick-view→d-flex/gap-4/fw-bold), `app.js` (SW banner→fw-semibold/text-nowrap/border-0), `errors.js` (error fallback→d-flex/flex-column/text-center/py-5), `checkout.js` (icons→fs-1/text-muted, wallet info→p-3/rounded-3), `cart.js` (empty→fs-1/text-muted, images→rounded-2/flex-shrink-0), `admin.js` (captions→small/text-muted, banner→p-3/rounded-3/border-start), `dashboard.js` (captions→small/text-muted, icons→fs-5), `order-detail.js` (captions→small/text-muted), `auction-detail.js` (captions→small, empty→fs-1/text-muted), `product-detail.js` (margin→mt-5, tags→gap-2/flex-wrap), `subscriptions.js` (plan cards→p-3/gap-2, empty→fs-1/text-muted), `wallet.js` (icons→fs-5/text-muted, caption→small/text-muted), `auctions.js` (page→py-4/mt-4, empty→fs-1/text-muted), `home.js` (hero text→fw-bold/fs-5, counters→fs-3), `products.js` (empty→fs-1/text-muted), `seller-profile.js` (margin→mt-4, empty→fs-1/text-muted), `login.js` (icon→fs-1, actions→mt-4/d-flex/flex-column/gap-3), `register.js` (actions→mt-4/d-flex/flex-column/gap-3), `verify-email.js` (icon→fs-1/text-primary), `router/index.js` (loading overlay→d-flex/flex-column/align-items-center/justify-content-center), `pagination.js` (disabled→opacity-50) — 130 insertions, 132 deletions | Build: ✅ 0 errors | Review: ✅
- [x] **May 28**: **Inline style audit & migration — Phase 2 (Second Pass)** — Migrated remaining ~75 inline `style` attributes to Bootstrap utility classes across 18 files, catching styles missed in Phase 1. **auctioneer-analytics.js** (40 changes): 6 cards → `text-center`, icons → `text-primary/success/warning/info`, labels → `small text-muted`, fees → `fw-semibold`, featured card → `border-start border-3`. **admin.js** (32 changes): modal body → `p-3`, modal actions → `p-3 pt-2 d-flex gap-2`, chart icon → `fs-2 opacity-50`, loading → `p-4 text-center`, category desc → `text-muted`, tags icon → `fs-2 text-muted`, empty fee → `text-center p-4 text-muted`, no-fees → `mb-0`, fee total → `text-primary`. **checkout.js** (14 changes): item spans → `fw-semibold`, totals → `fs-6`, radio inputs → `mt-1`, item rows → `py-2`, hr → `my-3`, address cards → `p-3 gap-3`. **product-detail.js** (8 changes): tab links → `flex-fill text-center py-2`, section icons → `fs-4 text-primary`. **auction-detail.js** (6 changes): skeleton container → `py-4`, login link → `text-reset text-decoration-underline`, bid wrapper → `flex:1;min-width:200px`. **cart.js** (6 changes): placeholder icon → `fs-6`. **auctions.js** (6 changes): pe-none → applied, empty icon → `fas fa-gavel`. **profile.js** (6 changes): auth links → `d-flex gap-3`, user info → `d-none`. **home.js** (4 changes): counter icons → `text-primary fs-3`. **login.js** (4 changes): forgot link → `text-end text-primary`. **register.js** (4 changes): checkbox → `d-flex gap-2 align-items-start`. **app.js** (4 changes): ripple button → `flex-fill`, close → `fw-medium`. **dom.js** (4 changes): skeleton → `pt-0 pb-0`. **products.js** (4 changes): filter panel → `text-center p-3`. **seller-profile.js** (2 changes): section → `mx-auto`. **pagination.js** (2 changes): page info → `fs-6`. **router/index.js** (2 changes): results → `text-center`. **errors.js** (2 changes): error icon → `fs-1`. — 75 insertions, 75 deletions | Build: ✅ 0 errors | Review: ✅ (fixes applied after review feedback)

---

## 📊 CODE QUALITY METRICS

| Metric | Status | Target |
|--------|--------|--------|
| **Consistency** | ⚠️ Mixed | Single pattern (Alpine preferred) |
| **Error Handling** | 🟡 Partial | All async ops wrapped |
| **Memory Leaks** | 🟡 Partial | Core listeners scoped; page-level utility (`createScopedBus()`) available
| **CSS Hygiene** | ✅ Good | No `!important` on navbar, variables consistent
| **Security** | 🟡 Decent | CSP compliant, no inline JS |
| **Accessibility** | 🟡 Partial | WCAG AA compliant |
| **Performance** | 🟡 Good | Lazy images, debounced API |
| **Testing** | ❌ None | Integration tests for auth/realtime |
| **Documentation** | 🟢 Good | Keep updated |

---

## 🐛 KNOWN ISSUES (Live Site)

| Issue | Status | Notes |
|-------|--------|-------|
| `t is not a function` on login | 🟡 Old deployment | Resolves after redeploy |
| `Unknown error` alerts | 🟡 Old deployment | Cause: old JS bundle |
| Arabic countdown labels missing | ✅ Fixed | common.days/hours/minutes/seconds keys added + t() calls in countdown |
| SignalR group not leaving on nav | ✅ Fixed | _joinedGroups Set + guarded leave + stop cleanup |
| EventBus memory leak | ✅ Fixed | Added `createScopedBus()` utility; existing core listeners are global-only (no page-level leak)
| Navbar transition `!important` breaking cascade | ✅ Fixed | Moved to `_layout.css`, `backdrop-filter` added

---

## 📁 IMPORTANT FILES QUICK REFERENCE

> 📖 **Dev gotchas for each module → see [`knowledge.md`](./knowledge.md)** (Alpine CDN, circular deps, SW versioning, etc.)
> 📖 **Backend file structure → see [`phase-spec.md`](./phase-spec.md#5-key-files--their-roles)**

| Purpose | File Path |
|---------|-----------|
| Bootstrap overrides | `src/css/_bootstrap-overrides.css` |
| API config | `src/core/api/config.js` |
| Auth | `src/core/auth/index.js` |
| Router + guards | `src/core/router/index.js` |
| Router config | `src/shared/constants/routes.js` |
| Role constants | `src/shared/constants/roles.js` |
| SignalR | `src/core/realtime/index.js` |
| EventBus | `src/core/events/bus.js` |
| Alpine stores | `src/core/stores/alpine.js` |
| Error handler | `src/shared/helpers/errors.js` |
| Shared utils | `src/core/utils/format.js` (`formatPrice`, `formatDate`) |
| DOM helpers | `src/core/utils/dom.js` (`$`, `debounce`, `escapeHtml`, etc.) |
| UI helpers | `src/core/utils/ui.js` (`showToast`, `showLoading`, etc.) |
| Validation | `src/core/utils/validation.js` |
| Vite config | `vite.config.js` |
| Vercel config | `vercel.json` |
| Service worker | `src/public/sw.js` |
| HTML entry | `src/index.html` |
| App bootstrap | `src/core/app.js` |
| Page entry | `src/main.js` |
| Role flow doc | `MDs/user-role-flow.md` |
| Audit report | `MDs/AUDIT_REPORT.md` |
| Dev knowledge | `MDs/knowledge.md` |
| Phase spec | `MDs/phase-spec.md` |

---

## 🎯 NEXT SPRINT PLAN

> 📖 **Full future roadmap → see [`phase-spec.md`](./phase-spec.md#7-future-work-post-roles)**

> 📖 **Full cleanup checklist with per-item status → see [`TOUGH_CLEANUP_PLAN.md`](./TOUGH_CLEANUP_PLAN.md)**

### Completed (June 3)
- ✅ **Phase 1 All 5 Tasks Aligned to Plan** — Rewritten wallet.js (C1), added RTL CSS (C2), reverted CSP (C3), fixed d-none→hidden (C4), standardized role guards (C5). Full audit passed: build 0 errors, lint 0 errors. **2 runtime bugs fixed** (missing `getUser()` import in auction-requests.js + auction-requests-review.js)
- ✅ **TASK-H2 — SEO Meta Tags** — Added meta tags to index.html, created `setPageMeta(title, description)` helper in `src/core/utils/seo.js`, called in home/products/auctions pages
- ✅ **TASK-H3 — Social Footer Links** — Replaced 3 `href="#"` with fake social URLs (Facebook, Instagram, WhatsApp) with `target="_blank" rel="noopener noreferrer"`
- ✅ **TASK-H4 — DOMPurify + safeSetHTML()** — Added CDN, `safeSetHTML()` in `dom.js`, applied in product-detail & auction-detail pages
- ✅ **TASK-H5 — SignalR Reconnection** — Configured reconnect delays, event handlers (`onreconnecting/onreconnected/onclose`), yellow status banner helper
- ✅ **TASK-H6 — Login Rate Limiting** — 5 attempts → 30s lockout via `sessionStorage`, countdown timer, auto-clear on success
- ✅ **TASK-H7 — font-display: swap** — Already present in Google Fonts URL
- ✅ **TASK-H8 — viewport-fit + logo paths** — Added `viewport-fit=cover`, fixed `logo.png` → `/logo.png`. **Skipped** apple-touch-icon (needs USER-A2 file)
- ✅ **TASK-H9 — Sell on Sayiad link** — Added `id="footerSellLink"`, auth-aware routing to dashboard for Fisherman/BaitSeller
- ✅ **TASK-M1 — PWA Manifest** — Created `src/public/manifest.json`, linked in `index.html` with 4 PWA meta tags
- ✅ **TASK-M2 — Badge defaults** — Removed "0" from cart + notif badges, added `aria-label`
- ✅ **TASK-M3 — Empty states** — Added CSS; `renderEmptyState()` already existed, dashboard already used it
- ✅ **TASK-M4 — Nav search** — Search form in drawer + CSS + submit handler navigating to `#/products?search=QUERY`
- ✅ **TASK-M5 — Password strength** — Requirements list with live check icons + colored bar on register page
- ✅ **TASK-M6 — Copyright year** — Dynamic via `new Date().getFullYear()`
- ✅ **TASK-M7 — robots.txt** — Created in `src/public/robots.txt`
- ✅ **TASK-M8 — Chevron rotation** — `#userDropdown[aria-expanded="true"] .fa-chevron-down` with 180° rotation
- ✅ **TASK-M9 — Back-to-top hidden** — Added `hidden` class to back-to-top button
- ✅ **ESLint — 2 remaining errors fixed** — `prefer-const` in auctions.js, `no-self-assign` in profile.js
- ✅ **Bootstrap overrides cleanup** — Already done in prior session (verified)
- ✅ **June 4: Card margin fixes** — Increased `.product-card-grid` top margin (`var(--space-2)` → `var(--space-4)`), added `margin-bottom: var(--space-10)` to last grid. Added `mb-4`/`mt-4` spacing classes to dashboard, admin, auctioneer-analytics, profile, cart, checkout. Fixed broken `.grid-4`/`.grid-2` in auctioneer-analytics → Bootstrap `row g-3`. | Build: ✅ | Review: ✅
- ✅ **June 4: Animate.css full migration** — Removed remaining 28 `animation:` CSS property declarations from `_components.css` + 3 from `_layout.css`. Added `animate__fadeIn` to all auth pages. Added `animate()` calls for lightbox, modals, badges, tour overlay, filter sheets. | Build: ✅ | Review: ✅
- ✅ **June 4: Custom @keyframes audit** — Verified zero `@keyframes` remain in all CSS files. All confirmed removed by earlier cleanup. | Build: ✅
- ✅ **June 4: Dead code removal** — Removed `shared/components/toast.js` (unused Alpine toast) and `shared/components/index.js` (unused walletCard). Cleaned up `alpine.js` import. | Build: ✅ 114 modules | Review: ✅
- ✅ **June 4: Docs updated** — `knowledge.md` and `MASTER-REFERENCE.md` updated with all June 4 changes.
- ✅ **June 4: showConfirm modal fix** — Added `display: block; position: relative;` to `.modal` CSS to override Bootstrap's `display: none` | Build: ✅
- ✅ **June 4: Auction-requests Fisherman redirect** — Fixed guard from `!['Auctioneer','Admin'].includes(_u.role)` to `_u.role !== ROLES.FISHERMAN` | Build: ✅
- ✅ **June 4: Alpine null error on auction detail** — Replaced `x-show` with `template x-if` to prevent expression evaluation on null `auction` | Build: ✅
- ✅ **June 4: Auctioneer e-commerce hiding** — Removed Auctioneer from ECOMMERCE_ROLES; gated cart/wishlist/orders API calls; hidden e-commerce nav links for Auctioneer across navbar, bottom-nav, dropdown, footer, profile page | Build: ✅
- ✅ **June 4: Profile page Auctioneer polish** — Added Auctioneer-specific stats (active auctions, pending requests) and quick links (Auctions dashboard, Analytics) via `/auctions/dashboard` API | Build: ✅
- ✅ **June 4: Profile card sizing & spacing** — Increased padding (20→24px), icon sizes (1.5→1.75rem), stat number 24→30px; added min-height + flex centering to stat/link cards; mobile values adjusted | Build: ✅
- ✅ **June 4: Profile page DOM + grid fix** — Removed stray `</div>` breaking DOM; changed stat columns `col-sm-4` → `col-sm` (auto-equal) to prevent gaps from hidden `x-show` items; added `max-width: 320px; margin-inline: auto` to stat cards | Build: ✅
- ✅ **June 4: Upload limit 500KB → 5MB** — Increased frontend validation and updated EN/AR i18n toast messages | Build: ✅
- ✅ **June 4: Backend upload 500 fix** — Changed `UploadController.cs` to copy `IFormFile` into `MemoryStream` once, avoiding double-read stream issue between `IsValidImageBytes` and Cloudinary upload | Build: ✅ 0 errors
- ✅ **June 4: Auction-requests-review page polish** — Added pagination (prev/next), loading spinner on re-fetch, moved drawer inline styles to CSS with `.drawer-open` class toggling, RTL support, mobile full-width; removed duplicate `.form-control` and `novalidate` | Build: ✅
- ✅ **June 4: Product images backend fix** — Added 3× `.Include(p => p.Images)` in `ProductRepository.cs` (`GetAllAsync`, `GetByIdAsync`, `GetSellerProductsAsync`) — `primaryImageUrl` was always `null` | Build: ✅ | Commit: `f409400`
- ✅ **June 4: Cart backend — StockQuantity DTO + accumulated stock check** — Added `StockQuantity` to `CartItemResponse`; fixed `AddItemAsync` to sum existing + new quantity before stock comparison (prevents bypassing by adding repeatedly) | Build: ✅ | Commit: `a91bbc6`
- ✅ **June 4: Cart frontend — qty-btn-group, stock-aware disable, i18n, CSS** — Replaced `<input type="number">` with `qty-btn-group` (± buttons); `+` disabled when `quantity >= stockQuantity`; "MAX" label at stock limit; localized `cart.insufficientStock` toast on 400 | Build: ✅ | Commits: `862ae8f`, `d8bc92c`
- ✅ **June 4: Product-detail localized stock error toast** — `addToCart` handler shows `cart.insufficientStock` on 400 instead of raw error | Build: ✅ | Commit: `d8bc92c`

### Immediate (Next)
1. **Phase 4 — Low Priority** (L1: WhatsApp link, L2: hreflang, L3: skip-link CSS, L4: unique titles, L5: focus styles)

### Short-term
2. Follow TOUGH_CLEANUP_PLAN.md execution order (CSS → Core JS → Pages → Shared → Config)
3. Standardize Bootstrap usage patterns across all 25 page modules

---

### Backend Files Modified (This Session)

| File | Change |
|------|--------|
| `Sayiad.Data/Repository/ProductRepo/ProductRepository.cs` | 3× `.Include(p => p.Images)` added |
| `Sayiad.Domain/Dtos/CartDtos/CartDto.cs` | `StockQuantity` added to `CartItemResponse` |
| `Sayiad.Domain/Managers/CartManager.cs` | Accumulated stock check in `AddItemAsync`; `StockQuantity` in `MapToResponse` |

### Cart DTO (API Response)
```json
{
  "items": [{
    "productId": 1,
    "quantity": 2,
    "stockQuantity": 10,
    "unitPrice": 150.00,
    "productTitle": "Nile Tilapia",
    "productImageUrl": "https://..."
  }],
  "total": 300.00
}
```

*Keep this file updated! Mark tasks as `[x]` when completed.*
