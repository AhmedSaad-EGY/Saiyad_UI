# Project knowledge

This file gives Freebuff context about your project: goals, commands, conventions, and gotchas.

## What this is

**Sayiad** (صياد — Arabic for "Fisherman") — Egypt's premier fishing marketplace & live auction platform. Vanilla JS single-page app with hash routing, Alpine.js for reactive UI, SignalR for real-time bidding, full RTL/Arabic support, dark mode, and role-based navigation (5 roles: Customer, Fisherman, BaitSeller, Auctioneer, Admin).

Live: `https://saiyad-eg.vercel.app`  
Backend API: `https://sayiad.runasp.net/api`

## Quickstart

- **Dev:** `npm run dev` — Vite starts on port 3000 with API proxy to sayiad.runasp.net
- **Build:** `npm run build` — outputs to `dist/`
- **Preview:** `npm run preview` — serves built `dist/`
- **Install:** `npm install` (Vite 6 + Alpine 3.14)
- **Test:** No test runner configured yet

## Architecture

- **Entry:** `src/index.html` → single `<script type="module" src="/main.js">`
- **Core (framework-agnostic):** `src/core/` — api, auth, router, realtime (SignalR), i18n, events (EventBus), stores (Alpine), utils
- **Pages (25 route handlers):** `src/pages/` — lazy-loaded via dynamic `import()`
- **Shared:** `src/shared/` — constants (roles, route manifest), helpers (errors), components (Alpine modal, toast, pagination)
- **Styles:** `src/css/` — 7 partials imported by `style.css` (variables, base, layout, components, animations, rtl)
- **Router:** Hash-based (`#/path`), 25 routes, role-gated guards (`ECOMMERCE_ROLES`, `SELLER_ROLES` constants in `src/shared/constants/routes.js`), dynamic imports
- **Roles (5):** `Admin`, `Customer`, `Fisherman`, `BaitSeller`, `Auctioneer` — defined in `ROLES` enum
- **Role constants:** `SELLER_ROLES = [Fisherman, BaitSeller]`, `ECOMMERCE_ROLES = [Customer, Fisherman, BaitSeller, Auctioneer]`
- **Route guards:** Only `Customer` can place bids on auctions. Admin is excluded from all e-commerce (cart, checkout, orders, shipping, wishlist). Wallet route open to all authenticated roles (Admin sees read-only).
- **Wallet:** Deposit is available to all authenticated roles **except** Admin. Withdraw is Admin-only (not yet implemented in UI).
- **State:** Alpine stores (`src/core/stores/alpine.js`) for auth, cart, UI; localStorage for tokens, language, theme
- **Real-time:** SignalR (`src/core/realtime/index.js`) for auction bids — joins `auction-{id}` groups
- **i18n:** `src/core/i18n/index.js` — ~470 keys per language (EN/AR), `t()` function, RTL dir switching
- **Auth:** JWT access token (60min) + refresh token (7d) in localStorage; auto-refresh on 401
- **Data flow:** Pages → Core modules only (no circular deps). `pages/` imports from `core/` and `shared/`

## Conventions

- **CSS:** OKLCH design tokens (`--primary: oklch(0.55 0.22 265)`), BEM-inspired classes, logical properties for RTL
- **JS:** ES2022+, `async/await`, module-scoped exports
- **Alpine:** `x-data` components with `x-model`, `x-show`, `x-for`, `@click` — template functions exposed in `data()` return
- **Formatting:** No linter/formatter config yet
- **Routes:** All route/page mapping in `src/shared/constants/routes.js` — add new routes there
- **Translations:** Keys in `src/core/i18n/index.js` (both `en` and `ar` objects); use `t("key")` everywhere
- **API proxy:** Vite proxies `/api/*` and `/hubs/*` to `sayiad.runasp.net` in dev; Vercel rewrites in prod

## Gotchas

- **Alpine functions in templates:** Module-level functions called in Alpine directives (`x-text`, `@click`, etc.) must be exposed in the component's `data()` return object (e.g., `t`, `formatPrice` must be returned)
- **No test runner** — manual testing only; must check all 25 routes after changes
- **Service worker:** Cache version `sayiad-v12` in `sw.js` — increment on deploy; **do NOT** precache Vite hashed chunks
- **`showToast` lives in** `src/core/utils/ui.js` (not app.js) — it was moved to break a circular dep
- **Circular deps:** `api/client.js` emits `auth:session-expired` event instead of importing auth/router directly
- **SignalR** uses CDN script in `index.html` (not npm package) — the global `signalR` object is available
- **Route cleanup:** Use `registerRouteCleanup(fn)` from `router/index.js` to hook cleanup on page leave (intervals, SignalR groups)
- **Build:** `vite.config.js` sets `root: 'src'`, `outDir: '../dist'` — CSS `@import` is fine but verify on build
- **File structure:** The old `js/` and old root `index.html` no longer exist — everything is in `src/`
- **`data-user-role`** attribute on `<html>` drives gold seller theme in CSS
- **All product/auction images** should use `loading="lazy"` — check product-detail main image, seller avatar
- **RTL audit:** After any CSS changes, test with Arabic (`dir="rtl"`) — logical properties handle most cases
