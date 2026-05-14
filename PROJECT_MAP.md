# Sayiad Frontend — Project Map

## Overview
Vanilla JS single-page application for the Sayiad (صياد) fishing marketplace & auction platform. Connected to `https://sayiad.runasp.net/api`.

## Tech Stack
- **Vanilla JS** — no frameworks
- **CSS Custom Properties** — theming (dark/light), design tokens
- **Hash-based SPA Router** — `#/route?param=value`
- **Font Awesome 6** — icons (CDN)
- **Service Worker** — offline caching of app shell

## Project Structure

```
Front-end/
├── index.html              # Entry point, navbar, footer, script tags
├── sw.js                   # Service worker (precache + cache strategies)
├── PROJECT_MAP.md          # This file
├── css/
│   └── style.css           # Full design system (~1300 lines)
├── js/
│   ├── config.js           # APP_CONFIG.apiBaseUrl — single API URL source
│   ├── api.js              # Fetch wrapper with JWT, error extraction, buildQuery
│   ├── auth.js             # isAuthenticated, requireAuth, logout, getUser, hasAnyRole
│   ├── router.js           # Hash router with param comparison for re-render
│   ├── utils.js            # $, $$, showLoading, formatDate, formatPrice, escapeHtml,
│   │                       # showErrorWithRetry, statusClass, renderStars,
│   │                       # showFieldError, clearFieldError, clearAllFieldErrors
│   ├── translations.js     # en/ar i18n (~200 keys), t(), setLanguage(), updateStaticText()
│   ├── background.js       # Canvas animated water background (waves + particles),
│   │                       # reads --blob-* CSS vars, auto-updates on theme change
│   └── app.js              # Toast, scroll observer, theme/lang toggles, ripple,
│                           # keyboard nav detection, service worker registration
└── pages/
    ├── home.js             # Hero, features grid, product/auction card rendering
    ├── login.js            # Login form with inline field validation
    ├── register.js         # Register form with role selector, inline validation
    ├── products.js         # Product listing with search, category filter, sort, pagination
    ├── product-detail.js   # Product images, meta, add-to-cart, wishlist
    ├── auctions.js         # Auction listing with status filter, search, pagination
    ├── auction-detail.js   # Countdown, bid history, bid placement
    ├── cart.js             # Cart table with quantity/remove, checkout link, retry on error
    ├── checkout.js         # Shipping address form + order creation + payment initiation
    └── dashboard.js        # Sidebar tabs: overview, orders (paginated), products,
                            # wishlist, notifications, profile, password
```

## Features Implemented

### UI / UX
- Dark/light theme toggle with localStorage persistence and CSS transitions
- Arabic/English i18n (~200 keys) with full RTL support
- Scroll animations via IntersectionObserver with stagger delays
- Canvas animated background (3 sine-wave layers + rising particles, reads --blob-* CSS vars, adapts to theme changes via MutationObserver)
- Page transitions: opacity + translateY fade between routes
- Button ripple effect
- Toast notification system
- Keyboard nav detection (focus rings only on Tab)
- `prefers-reduced-motion` support (disables all animations)
- Responsive layout (1024px, 768px, 480px breakpoints)
- Navbar glassmorphism with backdrop-filter and scroll shadow
- Product/auction card hover lift + image zoom
- Skeleton loading system (5 layout variants: page, card, detail, table, form)
- Mobile nav: slide-in drawer (RTL-aware), backdrop overlay with blur, body scroll lock, ESC/overlay/resize close

### Routing
- Hash-based SPA router with param comparison (`JSON.stringify`)
- Detects dashboard tab changes via param diff, skips identical navigations
- Query param persistence in URL hash for products (`search`, `categoryId`, `sort`, `page`)
- Query param persistence for auctions (`search`, `status`, `page`)
- Language switch triggers re-render via router() for full i18n consistency

### Forms
- Inline field validation (red border + error text per field)
- Shake animation on first invalid field
- Errors clear on input
- Constraint Validation API integration (uses `validationMessage`)
- `for`/`id` labels, `autocomplete`, `required`, `inputmode` attributes
- Submit button spinner while loading

### Data
- API fetch wrapper with JWT Bearer token injection
- Token refresh flow (`/auth/refresh`)
- Cart quantity/remove via event delegation
- Pagination for products, auctions, dashboard orders
- Error states with retry button (`showErrorWithRetry` using `common.retry` key)
- Locale-aware `formatDate` (`Intl.DateTimeFormat`) and `formatPrice` (`Intl.NumberFormat`)

### Checkout / Payment
- Requires auth
- Shipping address form (city, address line)
- Creates shipping address → creates order → initiates payment
- Payment method selector (Credit Card / Cash on Delivery)

### Accessibility
- `aria-label` on product/auction card links (title + price)
- `aria-hidden="true"` on decorative icons
- `.sr-only` CSS utility class
- Semantic `<a>` wrapping for product/auction cards
- Keyboard-navigable with visible focus rings

### Performance
- Service worker precaches app shell
- Cache-first for static assets and CDN resources
- Network-first for API calls
- CSS animations only animate `transform` and `opacity`
- Canvas background uses `requestAnimationFrame` with minimal draw calls

## Key Config

| File | Setting | Value |
|------|---------|-------|
| `js/config.js` | `apiBaseUrl` | `https://sayiad.runasp.net/api` |
| `js/config.js` | `apiBaseUrl` (local) | `https://localhost:7030/api` |
| `js/translations.js` | `currentLang` | `en` or `ar` (localStorage) |
| CSS `:root` | `--primary` | `#2563eb` |
| CSS `:root` | `--blob-1 / --blob-2 / --blob-3` | Canvas wave colors (light theme) |
| CSS `[data-theme="dark"]` | `--blob-1 / --blob-2 / --blob-3` | Canvas wave colors (dark theme) |
| CSS `[data-theme="dark"]` | `--primary` | `#60a5fa` |

## Running Locally

```powershell
# Frontend
node "C:\Users\pcc\AppData\Local\Temp\opencode\serve-frontend.js"
# Opens at http://localhost:8000

# Backend API
dotnet run --project "F:\DEPI Graduation Project\Sayiad.API"
# Runs at https://localhost:7030
```

## Deployment

- **API**: Published via Web Deploy to `sayiad.runasp.net`
  - Profile: `Sayiad.API\Properties\PublishProfiles\site68284-WebDeploy.pubxml`
  - Credentials: `sayiad.runasp.net-WebDeploy.publishSettings`
- **Frontend**: Served locally via Node.js (not deployed yet)

## Phased Execution Plan

### PHASE 1 — Polish & Performance
- [x] Item 1 — Canvas animated water background (replaced CSS blobs + fish)
- [x] Item 2 — Color system audit (added `--danger-dark`, `--success-dark`, `--primary-shadow`, `--danger-shadow`, `--success-shadow` CSS vars; fixed hardcoded button hover colors; added missing `:active` states; used `--text-inverse` everywhere)
- [x] Item 3 — Skeleton loading system (`showLoading` now accepts `type`: `page|card|detail|table|form`; renders shimmer placeholders matching each layout; all 7 call sites updated)
- [x] Item 4 — Password visibility toggle (login + register), password strength meter (register with 5 criteria), confirm password field (register), email validation on blur (login + register)
- [x] Item 5 — `renderEmptyState` helper in `utils.js` with icon/title/desc/CTA support; replaced 14 inline empty states across cart, checkout, products, auctions, home, dashboard, auction-detail
- [x] Item 6 — Slide-in mobile nav drawer (280px, right-side, CSS transition), backdrop overlay with backdrop-filter, body scroll lock, ESC/overlay/resize close, RTL support

### PHASE 2 — UX Enhancements
- [ ] Item 3 — Skeleton loading system (card, table, text variants)
- [ ] Item 4 — Password visibility toggle, strength meter, confirm password, email validation
- [ ] Item 5 — Empty state helper with contextual CTAs
- [ ] Item 6 — Slide-in mobile nav drawer with overlay and body scroll lock

### PHASE 3 — Feature Pages
- [ ] Item 7 — Verify email page
- [ ] Item 8 — Shipping address management
- [ ] Item 9 — Seller profile page
- [ ] Item 10 — Product image upload
- [ ] Item 11 — Auction UX polish
- [ ] Item 12 — Notifications badge
- [ ] Item 13 — Admin panel
- [ ] Item 14 — Order detail view
- [ ] Item 15 — Reviews & ratings

### PHASE 4 — Micro-interactions & Final Polish
- [x] Item 16 — Card zoom, icon bounce, heart beat micro-interactions
- [x] Item 17 — Page transitions / scroll reveal
- [x] Item 18 — Footer overhaul

## UI Enhancements (Post-PHASE 4)
- [x] Suggestion 1 — Product image lightbox gallery (full-screen overlay, arrow navigation, keyboard support, RTL-aware)
- [x] Suggestion 2 — Bid countdown urgency animation (red pulsing border + "Ending soon" badge for < 1hr)
- [x] Suggestion 3 — Cart floating summary bar (sticky bottom bar on mobile)
- [x] Suggestion 4 — Skeleton-to-content morph transition (smooth crossfade via `transitionContent`)
- [x] Suggestion 5 — Quick-view modal on product/auction cards (hover overlay button, data-attribute driven)
- [x] Suggestion 6 — Empty state illustrations (SVG illustrations for cart, products, auctions, bell, orders, search, heart)
- [x] Suggestion 7 — Recently viewed products strip (localStorage, horizontal scroll, snap)
- [x] Suggestion 8 — Progressive image loading (blur-up CSS placeholder → full image crossfade)
- [x] Suggestion 9 — Animated price change on auction (flash green highlight + scale on bid update)
- [x] Suggestion 10 — Draggable bid slider (range slider synced with number input, min→max×10)
