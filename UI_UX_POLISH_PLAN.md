# UI/UX Polishing Plan — Sayiad

> Audit date: 2026-05-24 · 25 pages audited · Results stored here so nothing is forgotten.

---

## Phase 1 — "The Hard Edges" (P0)
UX gaps that produce visible friction for every user. **~6 hrs total.**

- [x] **Wallet deposit button not disabled during submission** — double-click risk (15 min, `wallet.js`)
- [x] **Add to Cart (product detail) not disabled during API call** (15 min, `product-detail.js`)
- [x] **No offline detection banner** — user sees dead UI with no explanation (1 hr, `app.js`)
- [x] **Checkout address form lacks per-field validation** — user doesn't know which field failed (30 min, `checkout.js`)
- [x] **Login/Checkout only show single generic error** instead of field-level messages (1 hr, `login.js`, `checkout.js`)
- [x] **Global error boundary** — unhandled exceptions produce blank page (1.5 hr, `app.js` + `errors.js`)
- [x] **Focus management after dynamic content** — screen reader thrown to top on every page load (1 hr, new utility + all pages)

---

## Phase 2 — "Missing Pieces" (P1)
Individual pages with missing states or incomplete flows. **~8 hrs total.**

- [x] **Convert "Loading..." text to skeleton loaders** — checkout, wallet, subscriptions, shipping, order-detail, profile, seller-profile (1 hr, 7 pages) *(profile.js: progressive render by design — shell renders instantly, stats fill in via Alpine — good as-is)*
- [x] **Empty states for subscriptions** (no plans = blank grid) and **wallet transactions** (just muted `<p>`) (30 min, `subscriptions.js`, `wallet.js`)
- [x] **Retry buttons on skeleton error** — home products/auctions, products list, auction detail (30 min, `home.js`, `products.js`, `auction-detail.js`) *(\*products.js already had retry — no changes needed)*
- [x] **Smooth skeleton-to-content transition** — replace abrupt `innerHTML` swaps with opacity fade (1 hr, `dom.js` + affected pages) *(`fadeInContent()` utility added to `dom.js`; wired into home, products, product-detail, auction-detail via one-liner each)*
- [x] **Route transitions** — current 150ms fade is very brief; add proper enter/leave cross-fade (1 hr, `router/index.js`) *(exit: 250ms scale+fade, enter: 350ms bounce, debounce 200ms)*
- [x] **404 page** — currently basic message, should show illustration + helpful links + search (30 min, `router/index.js`) *(added search bar with ↵ handler, auctions link, larger fish icon)*
- [x] **Button loading sprites audit** — wallet deposit, add-to-cart, any missing spinner (30 min, `wallet.js`, `product-detail.js`, product card) *(wallet + add-to-cart + place bid + place order + review submit + start auction all have spinners from Phase 1)*
- [x] **Toast manual dismiss** — users cannot click to dismiss early (30 min, `ui.js`) *(added × close button + shared `closeToast()` helper)*
- [x] **Optimistic cart/wishlist updates** — immediate UI then revert on failure (1.5 hr, `cart.js`, `product-detail.js`, wishlist) *(cart remove/qty/clear + wishlist toggle — all optimistic with rollback)*
- [x] **Confetti on order placed & auction won** (reuse email verification mechanism) (30 min, `checkout.js`, `auction-detail.js`) *(checkout fires `triggerConfetti()` before navigate; auction-detail checks winner match on render)*

---

## Phase 3 — "Mobile Love" (P1–P2)
Mobile-specific polish that makes touch experience feel native. **~7.5 hrs total.**

- [x] **Mobile filter bottom sheet** (products/auctions) — replace inline filters with slide-up panel (2 hr, `products.js` + CSS) *(Filters button on mobile opens bottom sheet with category, condition, sort, price range, in-stock; Apply syncs values to hidden desktop elements and reloads)*
- [x] **Cart swipe-to-delete** — touch gesture on cart items (1.5 hr, `cart.js`) *(touchstart/touchmove/touchend on cart rows; swipe left reveals red delete area, swipe past 120px auto-deletes; includes Alpine integration + CSS)*
- [x] **Pull-to-refresh** on home/products/auctions (2 hr, `home.js` + new utility) *(`initPullToRefresh()` utility in `dom.js` with animated indicator; wired into home, products, and auctions with proper debouncing)*
- [x] **Dashboard bottom tab bar** on mobile instead of `<select>` dropdown (1 hr, `dashboard.js` + CSS) *(fixed bottom bar with icon+label tabs; sidebar hidden on mobile, bottom bar active at <768px; includes safe-area padding)*
- [x] **Mobile search overlay** — full-screen search on tap (1 hr, `products.js` + CSS) *(search icon button on mobile opens full-screen overlay with large input; real-time sync with inline search; Enter or Esc dismisses)*

---

## Phase 4 — "Micro-Polish" (P2)
Delightful finishes that make the app feel premium. **~6.5 hrs total.**

- [ ] **`x-transition` on all Alpine components** — cart, checkout, wallet, subscriptions (currently no enter/leave animation) (1.5 hr, `cart.js`, `checkout.js`, `wallet.js`, `subscriptions.js`)
- [ ] **Animate bid price changes** — count-up effect on real-time update (1 hr, `auction-detail.js`)
- [ ] **Animate cart total on quantity change** — scale pop + direction flash (30 min, `cart.js`)
- [ ] **Table `<caption>` & `scope="col"`** on dashboard, admin, cart tables (30 min, `dashboard.js`, `admin.js`, `cart.js`)
- [ ] **`aria-live` on bid list** — screen reader announces new bids (30 min, `auction-detail.js`)
- [ ] **`aria-current="page"`** on active nav links (30 min, layout)
- [ ] **Consolidate toast systems** — deprecate unused Alpine `toast.js` component (15 min, `ui.js`)
- [ ] **RTL visual audit** — test all pages with RTL (1 hr, all)
- [ ] **Image `loading="lazy"` on all images** (check product-detail main image, seller avatar) (15 min, various)
- [ ] **Skeleton shimmer color** — lighter tint on dark mode (15 min, CSS)

---

## Phase 5 — "Architecture" (stretch)
Deeper refactors. ~6–8 hrs per page. Defer unless heavy iteration planned.

- [ ] **Convert products page** to full Alpine component (reactive filters, `x-for`, `x-show`)
- [ ] **Convert dashboard** to Alpine components per tab (avoid full re-renders)
- [ ] **Convert home** hero + sections to Alpine components
- [ ] **Infinite scroll** (mobile) for products & auctions
- [ ] **`pagination.js` component** — wire it up (exists but unused)

---

## Key Findings Summary

| Strength | Weakness |
|----------|----------|
| Excellent skeleton system (6 types) | Wallet + add-to-cart buttons not disabled during submission |
| Consistent `renderEmptyState()` with CTAs | No offline detection banner anywhere |
| Good toast system with stacking | Login/Checkout lack field-level validation |
| Thorough ARIA usage on interactive elements | No `x-transition` on any Alpine component |
| Focus management on modals/lightbox | Tables missing `<caption>` / `scope` |
| Reduced-motion support | No bottom mobile nav, no swipe gestures |
| Progressive image loading | Route transition is too brief (150ms) |
| Confirmation dialogs for all destructive actions | Skeleton → content swap is abrupt (no fade) |
| Design system (light/dark, spacing tokens) | 404 page is a basic text message |
