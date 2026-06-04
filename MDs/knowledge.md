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
- **Shared:** `src/shared/` — constants (roles, route manifest), helpers (errors), components (Alpine modal, pagination)
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
- **Animations:** Animate.css 4.1 (CDN) for ALL animations. `animate(el, 'fadeIn', opts)` utility in `dom.js` applies Animate.css classes with auto-cleanup. Zero custom `@keyframes` remain. All animation is powered by Animate.css via CSS classes (`animate__animated animate__{name}`) or the `animate()` JS utility.
  - **June 4 migration scope:** Removed 30+ `animation:` CSS property declarations from `_components.css` and `_layout.css`. Added `animate__fadeIn` to all 4 auth pages. Added `animate()` calls for dynamic elements (lightbox, modals, badges, tour overlay, filter sheets). Replaced `.order-timeline-step.active` pulse, `.countdown-unit.urgent` pulse, `.badge` bounceIn, `.lightbox.show` fadeIn, `.modal-overlay.show` fadeIn, and `.filter-sheet` fadeInUp — all now use Animate.css via `animate()` utility or Alpine `x-transition`.
- **Scroll animations:** `observeAnimations()` in `dom.js` uses IntersectionObserver to apply Animate.css `fadeInUp` via `animate()`; stagger delay managed via CSS `nth-child` with `.stagger-1` through `.stagger-8`.

- **JS:** ES2022+, `async/await`, module-scoped exports
- **Alpine:** `x-data` components with `x-model`, `x-show`, `x-for`, `@click` — template functions exposed in `data()` return
- **Bootstrap:** Gradual migration — Bootstrap classes used alongside existing custom CSS. `_bootstrap-overrides.css` maps project OKLCH tokens to `--bs-*` CSS variables
- **Formatting:** No linter/formatter config yet
- **Routes:** All route/page mapping in `src/shared/constants/routes.js` — add new routes there
- **Translations:** Keys in `src/core/i18n/index.js` (both `en` and `ar` objects); use `t("key")` everywhere
- **API proxy:** Vite proxies `/api/*` and `/hubs/*` to `sayiad.runasp.net` in dev; Vercel rewrites in prod

## Gotchas

- **Inline-style-to-Bootstrap migration (May 28, 2026):** Two-pass migration completed across 40 unique files, removing ~275 inline `style` attributes. **Phase 1** (22 files): skeleton spacing, auth skeletons, quick-view, empty states, nav banners, table captions, icons. **Phase 2** (18 files): auctioneer stats cards, admin modals/tables, checkout forms, product detail tabs, error pages. Key patterns: spacing uses `py-*`/`p-*`/`mt-*`/`gap-*` (Bootstrap's 0.25rem step scale — some values are approximations, e.g., 20px→`mt-4` (24px)), `flex:1` must stay inline because `flex-fill` uses `flex: 1 1 auto` (different basis than `flex: 1 1 0%`), empty state icons (3.5rem) kept inline because `fs-1` (~2.5rem) is 28% smaller, large admin icons (2rem) kept inline because `fs-2` (2.5rem) is 25% larger, some `font-size` values (1.1rem) kept inline because Bootstrap `fs-6` (1rem) rounds down. Border radius uses `rounded-2` (6px) or `rounded-3` (8px), table captions use `small text-muted` class. Always prefer Bootstrap utilities over inline styles for consistency, but verify Bootstrap's exact pixel values for precision-critical cases.

- **Alpine functions in templates:** Module-level functions called in Alpine directives (`x-text`, `@click`, etc.) must be exposed in the component's `data()` return object (e.g., `t`, `formatPrice` must be returned)
- **No test runner** — manual testing only; must check all 25 routes after changes
- **Service worker:** Cache version is **auto-versioned** via `__SW_VERSION__` placeholder in `sw.js` — Vite plugin injects a build timestamp on every `npm run build`. Do NOT manually edit the version string.
- **Bootstrap class conflicts:** Existing custom `.card` and `.btn` styles override Bootstrap's (correct cascade: Bootstrap first, custom overrides second). During migration, watch for partial Bootstrap styling on elements that mix classes.
- **Layout CSS audit (_layout.css):** Zero custom `@keyframes` remain. All animations are handled by Animate.css CDN. The `.auth-page .card` padding at 480px breakpoint is inert due to Bootstrap `:has()` override — pending cleanup.
- **Keyframes removal (complete):** All custom `@keyframes` have been removed from `_components.css`, `_layout.css`, and `_animations.css`. Every animation is now powered by Animate.css 4.1 CDN. The `animate()` utility in `dom.js` provides the JS API for dynamic elements. All `animation:` CSS property declarations removed and replaced with Animate.css classes (`animate__animated animate__{name}`) or `animate()` JS calls.
- **Card hover specificity:** Product cards use `.product-card.card:hover` (specificity 0-3-0) to override Bootstrap's `.card:hover` (0-1-0) and maintain `translateY(-5px)`. Touch device overrides also use `.product-card.card:hover` to correctly suppress hover transforms.
- **Card sub-component migration:** Cards using `.card-header`/`.card-body`/`.card-footer` get `padding: 0` on the outer `.card` (via `:has()` selector), with spacing handled entirely by the sub-component padding. Bare `.card` elements (without sub-components) keep `padding: 24px`. The `:has()` pseudo-class is supported in Chrome 105+, Firefox 121+, Safari 15.4+.
- **CSS variable hygiene:** `_variables.css` was audited for unused custom properties. 11 unused props were removed (May 28). Run a codebase-wide search for any `var(--*)` before adding new CSS variables — if unused, they bloat the bundle.
- **Bootstrap grid migration (May 28):** All custom CSS grids have been migrated to Bootstrap `.row` + `.col-*` grid classes:
  - **product-grid (5 pages):** `.product-grid gap-4` → `row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4` in home.js, products.js, auctions.js, product-detail.js, seller-profile.js. Original `grid-template-columns: repeat(auto-fill, minmax(270px, 1fr))` replaced with fixed column counts.
  - **features-grid (home.js):** `.features-grid gap-4` → `row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 my-5`. `row-cols-1` on xs matches original auto-fit collapse at narrow widths.
  - **profile-links-grid (profile.js):** `.profile-links-grid gap-3` → `row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3 mt-3`. `mt-3` matches original `margin-top: var(--space-4)` (16px).
  - Page layouts (checkout, dashboard, product-detail, auction-detail) use `.row.g-5`/`.g-3` with responsive column classes (`col-lg-6`, `col-md-3`, `col-md-9`, `col-sm-4`, `col-sm-6`).
  - All stale custom grid CSS removed from `_components.css` and `_layout.css`.
- **Card spacing conventions (June 4, 2026):** Cards that sit outside Bootstrap grid rows use explicit `mb-4`/`mt-4` Bootstrap margin classes rather than implicit CSS sibling selectors. `.product-card-grid` has `margin-block: var(--space-4) var(--space-8)` (top increased from `var(--space-2)` to `var(--space-4)`). The last grid on each page gets `margin-bottom: var(--space-10)` for proper page-end spacing. General `.card + .card` sibling rules are avoided — they cause double-spacing with existing manual margins.

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

## Dead code removal (June 4, 2026)
- Removed `shared/components/toast.js` — unused Alpine toast component; vanilla `showToast()` in `ui.js` handles all toast notifications.
- Removed `shared/components/index.js` — unused `registerAlpineComponents()` that registered an unused `walletCard` Alpine component.
