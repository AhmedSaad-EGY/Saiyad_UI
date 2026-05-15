# Sayiad Frontend — Project Map

## Overview
Vanilla JS single-page application for the Sayiad (صياد) fishing marketplace & auction platform. Connected to `https://sayiad.runasp.net/api`.

## Tech Stack
- **Vanilla JS** — no frameworks
- **CSS Custom Properties (OKLCH)** — theming (dark/light), design tokens
- **Hash-based SPA Router** — `#/route?param=value`
- **Font Awesome 6** — icons (CDN)
- **Service Worker** — offline caching of app shell (precache + cache-first for static assets)
- **Google Fonts** — Inter (Latin) + Cairo (Arabic)
- **Vercel** — deployment config with API rewrites

## Project Structure

```
Front-end/
├── index.html              # Entry point, navbar, footer, skip-to-content link, aria-live region,
│                           # all script tags, back-to-top button
├── sw.js                   # Service worker (precache + cache-first strategies)
├── PROJECT_MAP.md          # This file
├── README.md               # Placeholder
├── vercel.json             # SPA rewrites + API proxy to sayiad.runasp.net
├── .vscode/
│   └── launch.json         # Chrome debug config for localhost:8080
├── css/
│   └── style.css           # Full design system (~2865 lines): OKLCH tokens, reset, navbar,
│                           # buttons, forms, hero, cards, lightbox, dashboard, mobile drawer,
│                           # skeleton loaders, keyframes, RTL, dark mode, responsive breakpoints
├── js/
│   ├── config.js           # APP_CONFIG.apiBaseUrl + swaggerUrl — single API URL source
│   ├── api.js              # Fetch wrapper with JWT injection, auto-refresh token flow,
│   │                       # error extraction (message/title/detail/errors), buildQuery, upload
│   ├── auth.js             # getUser, isAuthenticated, requireAuth, logout, hasAnyRole,
│   │                       # updateNavbar, updateCartBadge, updateNotifBadge, polling
│   ├── router.js           # Hash router (routeMap with 20 routes), param diff for re-render,
│   │                       # page transition (opacity + translateY), cleanup support
│   ├── utils.js            # $, $$, showLoading (5 skeleton types), showError, showErrorWithRetry,
│   │                       # renderEmptyState (with SVG illustrations), escapeHtml, formatDate,
│   │                       # formatPrice (EGP), statusClass, renderStars, transitionContent,
│   │                       # progressiveImg (blur-up), trackRecentlyViewed, renderRecentlyViewed,
│   │                       # emptyIllustration (6 SVGs), openQuickView, openLightbox,
│   │                       # showFieldError, clearFieldError, clearAllFieldErrors,
│   │                       # getPasswordStrength (5-criteria), validateForm, calculateAge
│   ├── translations.js     # en/ar i18n (~350 keys each), t(), setLanguage(), getCurrentLang(),
│   │                       # updateStaticText(data-i18n attributes)
│   ├── background.js       # Canvas animated water background (IIFE, 3 sine-wave layers + rising
│   │                       # particles), reads --blob-* CSS vars, MutationObserver for theme
│   │                       # changes, debounced resize handler
│   └── app.js              # Toast system (RTL-aware, aria-live announcements), IntersectionObserver
│                           # scroll animations, navbar scroll effect, back-to-top button,
│                           # mobile drawer (open/close/ESC/resize), theme toggle (smooth),
│                           # language toggle (fade + router reload), ripple effect, keyboard nav
│                           # detection, service worker registration
└── pages/
    ├── home.js             # Hero, features grid, product/auction card rendering (4 each),
    │                       # recently viewed strip, error states with retry
    ├── login.js            # Login form with email/password, inline validation, email blur check,
    │                       # password visibility toggle, unverified email warning
    ├── register.js         # Register form with role selector (Customer/Fisherman/BaitSeller/
    │                       # Auctioneer), conditional license field, birthdate + age calc,
    │                       # password strength meter + confirm match, terms checkbox,
    │                       # email uniqueness check, auto-login after verify
    ├── forgot-password.js  # Email form → success with 60s countdown resend + change email
    ├── reset-password.js   # Token from URL, new password + confirm, strength meter, auto-redirect
    ├── products.js         # Product listing with search, category filter, sort (price/n/newest),
    │                       # pagination (<=10), client-side sort, URL param persistence
    ├── product-detail.js   # Product images (lightbox gallery), meta, add-to-cart, wishlist,
    │                       # seller link, contact seller button, similar products,
    │                       # reviews section (star rating, submit), recently viewed, breadcrumb
    ├── auctions.js         # Auction listing with search, status filter, pagination, URL params
    ├── auction-detail.js   # Countdown timer (live update), bid history, bid placement,
    │                       # bid slider synced with input, auto-refresh every 10s, price flash,
    │                       # outbid toast notification, breadcrumb
    ├── cart.js             # Cart table with quantity update, remove, clear, total, floating bar
    ├── checkout.js         # Shipping address form + order creation + payment initiation
    │                       # (Credit Card / Cash on Delivery)
    ├── dashboard.js        # Sidebar tabs: overview, orders (paginated), products (create + list +
    │                       # image preview), wishlist (with remove), notifications (mark read +
    │                       # mark all read), profile update, change password (strength meter),
    │                       # mobile tab selector
    ├── verify-email.js     # Token verification, auto-login with stored credentials, fallback
    ├── shipping.js         # CRUD for shipping addresses (list, add form, delete)
    ├── seller-profile.js   # View public profile by userId, create/edit own seller profile
    ├── order-detail.js     # Single order view with items table, seller links
    ├── admin.js            # Admin panel: Users (toggle status), Reports (resolve), Orders,
    │                       # Categories (add/delete) — role-gated to Admin
    ├── privacy.js          # Privacy policy static page (4 sections)
    └── terms.js            # Terms & conditions static page (6 sections)
```

## Features Implemented

### UI / UX
- Dark/light theme toggle with localStorage persistence and CSS transitions (OKLCH colors)
- Arabic/English i18n (~350 keys each) with full RTL support
- Scroll animations via IntersectionObserver with stagger delays (8 levels)
- Canvas animated background (3 sine-wave layers + rising particles, reads --blob-* CSS vars, adapts to theme changes via MutationObserver)
- Page transitions: opacity + translateY fade between routes
- Button ripple effect
- Toast notification system (slide-in, auto-dismiss)
- Keyboard nav detection (focus rings only on Tab)
- `prefers-reduced-motion` support (disables all animations)
- Responsive layout (1024px, 768px, 480px breakpoints)
- Navbar glassmorphism with backdrop-filter and scroll shadow
- Product/auction card hover lift + image zoom
- Skeleton loading system (5 layout variants: page, card, detail, table, form)
- Mobile nav: slide-in drawer (RTL-aware), backdrop overlay with blur, body scroll lock, ESC/overlay/resize close
- Back-to-top button (appears after 400px scroll, smooth scroll)
- Floating cart summary bar on mobile (sticky bottom)
- Skeleton-to-content morph transition (`transitionContent`)
- Quick-view modal on product/auction cards (data-attribute driven)
- Empty state SVG illustrations (cart, products, auctions, bell, orders, search, heart) with hover float
- Recently viewed products strip (localStorage, horizontal scroll)
- Progressive image loading (blur-up placeholder → full image crossfade)
- Lightbox gallery (full-screen overlay, arrow navigation, keyboard support, RTL-aware)
- Bid countdown urgency animation (red pulsing border + "Ending soon" badge for <1hr)
- Animated price change on auction (flash green highlight + scale on bid update)
- Draggable bid slider (range slider synced with number input, min→max×10)

- Breadcrumb navigation on product-detail and auction-detail pages
- Similar products section on product-detail page
- Contact seller button on product-detail page
- Image preview before upload in dashboard product form
- Dashboard mobile tab selector (select dropdown on small screens)
- Mark All as Read on notifications page
- Remove from wishlist button
- Outbid toast notification on auction auto-refresh (10s poll)
- Password strength meter on dashboard change password
- Confirmation dialog on individual cart item remove

### Routing
- Hash-based SPA router with param comparison (`JSON.stringify`)
- 20 routes mapped in routeMap
- Detects dashboard tab changes via param diff, skips identical navigations
- Query param persistence in URL hash for products (`search`, `categoryId`, `sort`, `page`)
- Query param persistence for auctions (`search`, `status`, `page`)
- Language switch triggers re-render via router() for full i18n consistency
- `onRouteCleanup` callback for clearing intervals/listeners on route change
- 404 page with go-home button

### Forms
- Inline field validation (red border + error text per field + shake animation)
- Errors clear on input
- Constraint Validation API integration (uses `validationMessage`)
- `for`/`id` labels, `autocomplete`, `required`, `inputmode` attributes
- Submit button spinner while loading
- Password visibility toggle (login, register, reset-password)
- Password strength meter (5 criteria: length, uppercase, lowercase, digit, special char)
- Confirm password with match validation
- Email validation on blur (login + register)
- Age calculation from birthdate (register)
- Role-specific fields (Fishing License for Fisherman)
- Terms & conditions checkbox with legal links

### Data
- API fetch wrapper with JWT Bearer token injection
- Token refresh flow (`/auth/refresh`) with automatic retry
- Cart quantity/remove via event delegation
- Pagination for products, auctions, dashboard orders
- Error states with retry button (`showErrorWithRetry`)
- Locale-aware `formatDate` (`Intl.DateTimeFormat`) and `formatPrice` (`Intl.NumberFormat`, EGP)
- Debounced search inputs (400ms)
- Notifications polling every 60s
- Email uniqueness check before registration

### Checkout / Payment
- Requires auth
- Shipping address form (full name, phone, city, governorate, street, postal code)
- Creates shipping address → creates order → initiates payment
- Payment method selector (Credit Card / Cash on Delivery)

### Admin
- Role-gated (`Admin` role only)
- 4 tabs: Users (toggle active/inactive), Reports (resolve), Orders (view all), Categories (add/delete)

### Accessibility
- `aria-label` on product/auction card links (title + price)
- `aria-hidden="true"` on decorative icons
- `.sr-only` CSS utility class
- Semantic `<a>` wrapping for product/auction cards
- Keyboard-navigable with visible focus rings (Tab-only)
- Lightbox with `role="dialog"` and `aria-label`
- Skip-to-content link (hidden until focused via Tab)
- `aria-live="polite"` region for toast announcements to screen readers
- Focus restoration after closing lightbox/quick-view modals

### Performance
- Service worker precaches app shell (31 items)
- Cache-first for static assets (GET requests to same origin, non-API)
- CSS animations only animate `transform` and `opacity`
- Canvas background uses `requestAnimationFrame` with minimal draw calls
- Progressive image loading (blur-up technique)
- Debounced search inputs (400ms)
- Debounced canvas resize handler (150ms)

## Key Config

| File | Setting | Value |
|------|---------|-------|
| `js/config.js` | `apiBaseUrl` | `https://sayiad.runasp.net/api` |
| `js/config.js` | `swaggerUrl` | `https://sayiad.runasp.net/swagger/index.html` |
| `vercel.json` | API rewrite | `/api/*` → `https://sayiad.runasp.net/api/*` |
| `js/translations.js` | `currentLang` | `en` or `ar` (localStorage `sayiad_lang`) |
| CSS `:root` | `--primary` | `oklch(0.55 0.22 265)` |
| CSS `:root` | `--blob-1 / --blob-2 / --blob-3` | Canvas wave colors (light theme) |
| CSS `[data-theme="dark"]` | `--blob-1 / --blob-2 / --blob-3` | Canvas wave colors (dark theme) |
| CSS `[data-theme="dark"]` | `--primary` | `oklch(0.7 0.16 265)` |

## Running Locally

```powershell
# Frontend (uses Node.js static server)
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
- **Frontend**: Configured for Vercel deployment with SPA rewrites and API proxy (`vercel.json`)

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
- [x] Item 7 — Verify email page
- [x] Item 8 — Shipping address management
- [x] Item 9 — Seller profile page
- [x] Item 10 — Product image upload (dashboard products tab, FormData upload)
- [x] Item 11 — Auction UX polish (bid slider, auto-refresh, price flash)
- [x] Item 12 — Notifications badge (polling every 60s)
- [x] Item 13 — Admin panel (users, reports, orders, categories)
- [x] Item 14 — Order detail view
- [x] Item 15 — Reviews & ratings (product-detail with star rating)
- [x] Item 16 — Forgot/Reset password flow
- [x] Item 17 — Privacy policy & Terms pages

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
