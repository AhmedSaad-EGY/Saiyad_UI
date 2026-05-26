# 🎯 Sayiad (صياد) — Master Reference & TODO

> **Project**: Egypt's premier fishing marketplace & live auction platform  
> **Stack**: Vanilla JS SPA + Alpine.js 3.14.8 + Vite 6 + SignalR + i18n (EN/AR)  
> **Last Updated**: May 26, 2026  
> **Purpose**: Single entry point — each section links to the deeper doc it summarizes

---

## 📚 DOCS MAP — What Each `.md` File Contains

| File | Contains | Open when... |
|------|----------|-------------|
| **`MASTER-REFERENCE.md`** *(this file)* | Hub + TODO — accounts, commands, links, file refs, checklist | Every session — start here |
| **`AUDIT_REPORT.md`** | Deep audit: 22 findings with code snippets, before/after, severity per file | Implementing a fix — copy-paste the exact code changes |
| **`user-role-flow.md`** | Permission matrices: 16 tables covering every feature × 5 roles | Debugging role/permission issues |
| **`phase-spec.md`** | Strategy: backend stack, what's broken, priorities, roadmap | Planning sprints, understanding the full picture |
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
│   └── components/         # modal.js, pagination.js, toast.js
├── css/                    # 7 partials → style.css
├── public/sw.js            # Service worker (sayiad-v12)
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
ECOMMERCE_ROLES = [Customer, Fisherman, BaitSeller, Auctioneer]  # Cart/Orders/Checkout
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

### Immediate (Fix this sprint)
1. Phase 1 — Critical fixes (inline JS, EventBus, SignalR, i18n keys, !important)
2. Push + redeploy to Vercel
3. Verify all 5 roles on live site

### Short-term
4. Phase 2 — XSS audit, form validation, loading states, lazy images
5. Phase 2 — Route cleanup, CSRF, swipe gestures, empty states

### Medium-term
6. Phase 3 — Sourcemaps, debounce, SW auto-versioning, ARIA
7. Phase 3 — ESLint, request dedup, mobile tap targets

---

*Keep this file updated! Mark tasks as `[x]` when completed.*
