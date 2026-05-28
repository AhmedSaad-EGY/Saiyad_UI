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
- **Styles:** `src/css/` — 8 partials imported by `style.css` (variables, base, layout, components, animations, rtl, bootstrap-overrides) + Bootstrap 5.3 CSS
- **UI framework:** Bootstrap 5.3.8 installed via npm, imported in `style.css` first (base layer), then custom styles, then `_bootstrap-overrides.css` maps OKLCH tokens → Bootstrap CSS vars
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
- **Animations:** Animate.css 4.1 (CDN) for all decorative entry/attention animations. `animate(el, 'fadeIn', opts)` utility in `dom.js` applies Animate.css classes with auto-cleanup. Custom keyframes retained only for functional animations (skeleton, spinner, ripple, pulse) and subtle offset animations where Animate.css 100%-height transforms would break the design (slideUp 20px, slideDown 12px, scaleIn 0.94). All other keyframes (`fadeIn`, `fadeInUp`, `bounceIn`, `shake`, etc.) are provided by Animate.css CDN.
- **Scroll animations:** `observeAnimations()` in `dom.js` uses IntersectionObserver to apply Animate.css `fadeInUp` via `animate()`; stagger delay managed via CSS `nth-child` with `.stagger-1` through `.stagger-8`.
- **JS:** ES2022+, `async/await`, module-scoped exports
- **Alpine:** `x-data` components with `x-model`, `x-show`, `x-for`, `@click` — template functions exposed in `data()` return
- **Bootstrap:** Gradual migration — Bootstrap classes used alongside existing custom CSS. `_bootstrap-overrides.css` maps project OKLCH tokens to `--bs-*` CSS variables
- **Formatting:** No linter/formatter config yet
- **Routes:** All route/page mapping in `src/shared/constants/routes.js` — add new routes there
- **Translations:** Keys in `src/core/i18n/index.js` (both `en` and `ar` objects); use `t("key")` everywhere
- **API proxy:** Vite proxies `/api/*` and `/hubs/*` to `sayiad.runasp.net` in dev; Vercel rewrites in prod

## Gotchas

- **Alpine functions in templates:** Module-level functions called in Alpine directives (`x-text`, `@click`, etc.) must be exposed in the component's `data()` return object (e.g., `t`, `formatPrice` must be returned)
- **No test runner** — manual testing only; must check all 25 routes after changes
- **Service worker:** Cache version is **auto-versioned** via `__SW_VERSION__` placeholder in `sw.js` — Vite plugin injects a build timestamp on every `npm run build`. Do NOT manually edit the version string.
- **Bootstrap class conflicts:** Existing custom `.card` and `.btn` styles override Bootstrap's (correct cascade: Bootstrap first, custom overrides second). During migration, watch for partial Bootstrap styling on elements that mix classes.
- **Layout CSS audit (_layout.css):** All keyframes (`ping`, `fishSwim`, `navWave`) and classes are actively referenced. No unused code found in `_layout.css`. The `.auth-page .card` padding at 480px breakpoint is inert due to Bootstrap `:has()` override — pending cleanup.
- **Keyframes removal:** `priceFlash` and `shake` removed from `_components.css`. Both were unused — Animate.css CDN provides equivalent animations.
- **Card hover specificity:** Product cards use `.product-card.card:hover` (specificity 0-3-0) to override Bootstrap's `.card:hover` (0-1-0) and maintain `translateY(-5px)`. Touch device overrides also use `.product-card.card:hover` to correctly suppress hover transforms.
- **Card sub-component migration:** Cards using `.card-header`/`.card-body`/`.card-footer` get `padding: 0` on the outer `.card` (via `:has()` selector), with spacing handled entirely by the sub-component padding. Bare `.card` elements (without sub-components) keep `padding: 24px`. The `:has()` pseudo-class is supported in Chrome 105+, Firefox 121+, Safari 15.4+.
- **CSS variable hygiene:** `_variables.css` was audited for unused custom properties. 11 unused props were removed (May 28). Run a codebase-wide search for any `var(--*)` before adding new CSS variables — if unused, they bloat the bundle.
- **Bootstrap grid migration (May 28):** All custom CSS grids have been migrated to Bootstrap `.row` + `.col-*` grid classes. The `.product-grid` and `.features-grid` CSS Grid auto-fill layouts retain their `grid-template-columns: repeat(auto-fill, minmax(...))` but now use Bootstrap `.gap-4` instead of custom `gap`. Page layouts (checkout, dashboard, product-detail, auction-detail) use `.row.g-5`/`.g-3` with responsive column classes (`col-lg-6`, `col-md-3`, `col-md-9`, `col-sm-4`, `col-sm-6`). All stale custom grid CSS has been removed from `_components.css` and `_layout.css`.
- **Bootstrap `--bs-` variable naming:** Bootstrap 5.3 uses `--bs-*` CSS variables only for component-level custom properties (e.g., `--bs-modal-bg`, `--bs-card-bg`). Not all Sass variables have CSS variable equivalents — for example, `$input-bg` does NOT become `--bs-input-bg`. Always verify against Bootstrap's source CSS before adding `--bs-*` mappings.
- **`showToast` lives in** `src/core/utils/ui.js` (not app.js) — it was moved to break a circular dep
- **Circular deps:** `api/client.js` emits `auth:session-expired` event instead of importing auth/router directly
- **SignalR** uses CDN script in `index.html` (not npm package) — the global `signalR` object is available
- **Route cleanup:** Use `registerRouteCleanup(fn)` from `router/index.js` to hook cleanup on page leave (intervals, SignalR groups)
- **Build:** `vite.config.js` sets `root: 'src'`, `outDir: '../dist'` — CSS `@import` is fine but verify on build
- **File structure:** The old `js/` and old root `index.html` no longer exist — everything is in `src/`
- **`data-user-role`** attribute on `<html>` drives gold seller theme in CSS
- **All product/auction images** should use `loading="lazy"` — check product-detail main image, seller avatar
- **RTL audit:** After any CSS changes, test with Arabic (`dir="rtl"`) — logical properties handle most cases
