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

Defined in `src/shared/constants/routes.js`:

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

- [ ] **Fix 6: XSS audit — consistent escapeHtml usage**
  - Audit all `innerHTML` assignments for user-generated content
  - Ensure `escapeHtml()` wraps all user data fields
- [ ] **Fix 7: Add input validation to wallet.js**
  - Max amount, decimal places, type validation
  - Real-time feedback via Alpine
- [ ] **Fix 8: Add loading states to async operations**
  - checkout.js (pay), subscriptions.js (subscribe), wallet.js (deposit)
- [ ] **Fix 9: Add loading="lazy" to dynamically generated images**
  - `renderProductCards` in `src/core/utils/ui.js`
  - Auction cards, home page product cards
- [ ] **Fix 10: Add missing registerRouteCleanup in auction-detail.js**
  - SignalR group leave
  - Countdown interval clear
- [ ] **Fix 11: Implement CSRF token header**
  - `src/core/api/client.js` — Read from meta tag or sessionStorage, add to requests
- [ ] **Fix 12: Add swipe gesture support**
  - Swipe-left for cart remove, swipe-right for back navigation
  - Passive scroll listeners
- [ ] **Fix 13: Add empty states to all list views**
  - cart, wishlist, notifications, admin tables, dashboard tabs
- [ ] **Fix 14: Consolidate table rendering**
  - Reuse pagination component across admin, dashboard, products, auctions
- [ ] **Fix 15: Standardize DOM approach (Alpine vs manual)**
  - Convert auction-detail.js to Alpine or document why manual is needed
- [ ] **Fix 16: Consolidate role constants (create roles.js)**
  - Move ROLES, ROLE_SETS to `src/shared/constants/roles.js`
  - Use consistently in index.html, routes.js, auth/index.js

### Phase 3 — 🟢 IMPROVEMENT (Polish)

- [ ] **Fix 17: Enable sourcemaps in build**
  - `vite.config.js` — Add `build.sourcemap` config
- [ ] **Fix 18: Add debounce on search inputs**
  - `products.js` search, `auctions.js` search
  - See `src/core/utils/dom.js` for existing `debounce` utility
- [ ] **Fix 19: Service worker auto-versioning**
  - Inject build hash into `sw.js` via Vite `define`
- [ ] **Fix 20: Enhance ARIA attributes**
  - aria-modal on dialogs, aria-describedby on form errors
  - aria-live on dynamic lists, aria-label on icon-only buttons
- [ ] **Fix 21: Add HTTP request deduplication**
  - `src/core/api/client.js` — Deduplicate concurrent identical requests
- [ ] **Fix 22: Add ESLint config**
  - Catch inline JS, missing async/await, unused vars
- [ ] **Fix 23: Mobile tap target audit**
  - Ensure 44x44px minimum for touch targets
  - Add touch feedback (active states)

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
| i18n (~470 keys) | `src/core/i18n/index.js` |
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
