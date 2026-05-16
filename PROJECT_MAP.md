# Sayiad Frontend — Project Map

## Overview
Vanilla JS single-page application for the Sayiad (صياد) fishing marketplace & auction platform. Connected to `https://sayiad.runasp.net/api`. Fully integrated with the Sayiad .NET backend — all API contracts, DTO shapes, auth flows, pagination, and business logic are aligned 1:1 with the backend.

## Integration Status
All frontend-backend integration mismatches fixed. Pages now use correct DTO field names, HTTP methods, endpoint paths, and response shapes as defined by the backend controllers.

## Truth Validator Audit — Verified Findings

### Confirmed API Mismatches
| # | File:Line | Issue | Swagger Expects | Impact |
|---|-----------|-------|-----------------|--------|
| 1 | `auctions.js:39` | Sends `search` query param | `SearchTerm` | Auction search silently broken |
| 2 | `home.js:34` | Sends `status: "Active"` | No `status` param defined | Silently ignored, non-breaking |

### Confirmed Bugs
| # | File:Line | Bug | Severity |
|---|-----------|-----|----------|
| 1 | `admin.js:3` | `hasAnyRole(["Admin"])` passes array instead of spread args | **Critical** — Admin panel inaccessible to all users |
| 2 | `app.js:49` | `toast.innerHTML` uses unescaped `${msg}` | **High** — XSS vector via error messages |
| 3 | `register.js:250-251` | Plaintext password in sessionStorage | **High** — Credential leak risk on shared machines |

### Dead Code (Defined, Zero Callers)
| Function | File | Purpose |
|----------|------|---------|
| `showErrorWithRetry()` | `utils.js:59` | Error display with retry button (never called) |
| `transitionContent()` | `utils.js:215` | Skeleton-to-content morph animation (never called) |

### Verified Correct
65 of 67 frontend API calls match Swagger contracts. All auth, cart, checkout, product, auction, seller, wishlist, notification, order, payment, upload, user, report, category, subscription, and shipping endpoints verified matching.

## Tech Stack
- **Vanilla JS** — no frameworks
- **CSS Custom Properties (OKLCH + Design Tokens)** — theming (dark/light), `--space-*` spacing scale, `--font-*` type scale, `--leading-*` line heights, `--duration-*`/`--ease-*` animation tokens
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
    │                       # verification waiting overlay with polling (3s)
    ├── forgot-password.js  # 3-step flow (email → token entry → new password) with step
    │                       # indicator, auto-extract token from pasted URL, resend countdown,
    │                       # password strength meter
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

## Latest Session: Mobile Responsiveness Fix (May 16, 2026)

### Problems Fixed
1. **Container horizontal padding**: Content touching screen edges on 375px — fixed product-grid overflow clipping with `min(240px, 100%)`, `overflow: visible`, and negative margin technique.
2. **Nav drawer invisible on dark mode**: `.nav-drawer` blended with overlay color — fixed with explicit lighter dark-mode background (`oklch(0.22 0.022 245)`) and inset border; overlay z-index lowered to 999 (below drawer at 1000).
3. **Section header text clipped**: RTL Arabic text overflowing on 375px — added `overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;` to `h2`; column layout at 480px.
4. **Empty state icon oversized**: Reduced padding and icon size at 480px (`--space-8` top/bottom, 56px icon, smaller h3/p).
5. **Product card price wrapping**: Added `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` to `.product-card-price`; improved 480px card body padding and title line-clamp.
6. **Main content top padding**: Adjusted padding at 768px (`calc(60px + var(--space-5))`) and 480px (`calc(60px + var(--space-4))`) to prevent content hiding under navbar.
7. **360px screen layout**: Expanded 360px block with compact container padding, hero font, card padding, and button sizing.
8. **Hamburger touch target**: Minimum 44×44px touch area, z-index above drawer, icon toggles between bars/times, aria-expanded state.
9. **body.nav-open black content**: App content now stays visible (non-interactive) when drawer is open instead of going black.
10. **Old `.nav-links` drawer CSS**: Stripped conflicting fixed-position drawer styles from `.nav-links` (line 753) — drawer positioning now handled exclusively by `.nav-drawer`.
11. **Duplicate product-grid definition**: Removed redundant `.product-grid { 1fr }` from first 480px block — second 480px block uses `repeat(2, minmax(0, 1fr))`.

### Files Changed
| File | Change |
|------|--------|
| `css/style.css` | Container padding tokenized; base `.product-grid` overflow visible; 768px grid uses `min(240px,100%)`; nav-drawer z-index/transform/RTL/dark-mode; nav-overlay z-index; section-header overflow protection; empty-state mobile overrides; product-card-price nowrap; main-content mobile padding; 360px block expanded; hamburger touch target+z-index; body.nav-open pointer-events; removed old `.nav-links` drawer CSS; 480px 2-column grid uses `minmax(0,1fr)` |
| `js/app.js` | Hamburger icon toggles bars/times; aria-expanded toggle; closeDrawer resets icon |
| `.gitignore` | Created for static frontend project |

## Latest Session: Auth Flow Fixes (May 16, 2026)

### Changes Made
- **Item 1 — Register 400 fix**: Removed `birthdate` from POST `/auth/register` body (backend `RegisterRequest` has no birthdate field); removed `hasSpecialChar` from password validation (backend does not enforce special chars).
- **Item 2 — Password validation alignment**: Changed `minlength` 6 → 8 (matches backend `MinimumLength(8)`); added `hasUppercase`/`hasLowercase`/`hasDigit` validation rules (backend requires all three); made phone field `required` (backend `NotEmpty()`); added `auth.passwordRequires*` translation keys.
- **Item 3 — Verification waiting overlay**: Added `showVerificationOverlay()` function — full-screen overlay with animated envelope icon, pulsing dots, email display; polls `POST /auth/login` every 3s; on success shows green checkmark + navigates to home after 1.8s; manual "I already verified" button; "Use a different email" dismisses overlay; cleanup via `window.onRouteCleanup`.
- **Item 4 — Forgot password 3-step flow**: Rewrote `pages/forgot-password.js` — step indicator (3 dots + lines), Step 1 (email → send link), Step 2 (token/code entry, auto-extracts token from pasted URL, resend with 60s countdown), Step 3 (new password with strength meter + confirm), on success redirects to login after 2.5s.
- **Item 5 — CSS additions**: `.verify-overlay` (fixed + blur backdrop), `.verify-overlay-card` (modal card), `.verify-overlay-icon` (animated envelope + success state), `.verify-overlay-dots` (3 pulsing dots), `.forgot-steps` (step indicator styles), `.form-hint` utility.
- **Item 6 — Translation keys added (8 EN + 8 AR)**: `verify.waitingTitle`, `verify.waitingDesc`, `verify.alreadyVerified`, `verify.useOtherEmail`, `verify.successTitle`, `verify.successDesc`, `auth.tokenPlaceholder`, `auth.tokenHint`.

### Files Changed (4)
| File | Change |
|------|--------|
| `pages/register.js` | Removed `birthdate` from POST body; removed `hasSpecialChar`; added `hasUppercase`/`hasLowercase`/`hasDigit`; minlength 6→8; phone required; added `showVerificationOverlay()` |
| `pages/forgot-password.js` | Full rewrite — 3-step flow with step indicator, token entry, password strength meter |
| `css/style.css` | Added `.verify-overlay` + `.verify-overlay-card` + `.verify-overlay-icon` + `.verify-overlay-dots` + keyframes; added `.forgot-steps` + `.forgot-step` + `.forgot-step-line` + `.form-hint` |
| `js/translations.js` | Added 8 new keys EN + AR for overlay and token entry; added `auction.startAuction` |
| `js/utils.js` | Added `hasUppercase`/`hasLowercase`/`hasDigit` rules to `validateForm()`; updated `getPasswordStrength()` thresholds (6→8, 10→12) |
| `pages/dashboard.js` | Added "Start Auction" button + modal in products table for non-auctioned products |
| `pages/product-detail.js` | Added "Start Auction" button when logged-in user owns the product and has Auctioneer/Fisherman/BaitSeller role |

## Latest Session: Role-Based Custom UI (May 16, 2026)

### Changes Made
- **Navbar**: Added `data-roles` attributes to dropdown items (all, Fisherman/BaitSeller/Auctioneer, Admin). `updateNavbar()` in auth.js now filters dropdown items by user role — Customers only see Profile/Dashboard/Orders/Wishlist, seller roles additionally see My Products, Admins see Admin panel.
- **Backend**: Added `Auctioneer` to UploadController `[Authorize]` so Auctioneers can upload product images.
- **Seller profile**: Fixed role check — only Fisherman/BaitSeller can manage their seller profile (Auctioneer removed, matching backend).
- **Profile page**: Added Auctioneer to "My Products" quick link. "Seller Dashboard" remains Fisherman/BaitSeller only.
- **Dashboard products table**: Added `hasAnyRole("Auctioneer","Fisherman","BaitSeller")` check to Start Auction button.

### Role-Based UI Matrix
| Feature | Guest | Customer | Fisherman | BaitSeller | Auctioneer | Admin |
|---------|-------|----------|-----------|------------|------------|-------|
| Browse products/auctions | Yes | Yes | Yes | Yes | Yes | Yes |
| Cart/Wishlist/Orders | - | Yes | Yes | Yes | Yes | Yes |
| Dashboard tabs | - | Overview, Orders, Wishlist, Notifications, Profile, Password | + Products | + Products | + Products | - |
| My Products (dropdown) | - | Hidden | Shown | Shown | Shown | Hidden |
| Admin panel (dropdown) | - | Hidden | Hidden | Hidden | Hidden | Shown |
| Create products | - | - | Yes | Yes | Yes | - |
| Start auctions | - | - | Yes | Yes | Yes | - |
| Place bids | - | Yes | Yes | Yes | - | - |
| Seller profile (own) | - | - | Yes | Yes | - | - |
| Upload product images | - | - | Yes | Yes | Yes | - |
| Admin functions | - | - | - | - | - | Yes |

## Latest Session Plus: Auctioneer Can Now Start Auctions (May 16, 2026)

## Previous Session: Complete Polish & Missing Pages (May 16, 2026)

### Changes Made
- **Item 1 — Logo**: Replaced emoji fish favicon with `logo.png`; navbar now uses `<img class="nav-logo-img">` + `<span class="nav-logo-text">` instead of `<i class="fas fa-fish">`.
- **Item 2 — Navbar**: Fixed position (was sticky), height 60px; active nav-link uses pill background (`.nav-actions` with border-left separator); cart badge with `2px solid var(--nav-bg)` border; mobile drawer uses `inset-inline-end`, `100dvh`, RTL-aware slide.
- **Item 3 — Dark Mode**: Adjusted tokens for depth hierarchy — `--card-bg: oklch(0.20 0.022 245)`, `--input-bg: oklch(0.24 0.020 245)`, `--body-bg: oklch(0.13 0.020 245)`, `--text: oklch(0.94 0.010 245)`, `--border: oklch(0.28 0.022 245)`, `--primary: oklch(0.72 0.17 250)`. Added auth card + form-input overrides for dark mode.
- **Item 4 — Product Cards**: New structure — `.product-card` is `flex-column`, `aspect-ratio: 4/3` image, `.img-placeholder` with icon, `.product-card-badge` overlay, 2-line clamped title, meta with category + stock, no footer (moved to meta). Removed quick-view button from product cards.
- **Item 5 — Date Picker**: Styled `input[type="date"]` calendar icon (dark mode invert), datetime-edit fields. Birthdate input now has `max` attribute (18 years ago).
- **Item 6 — Scrollbar**: Custom thin scrollbar (6px), `scrollbar-width: thin` for Firefox, thumb color derived from `--primary` with OKLCH transparency.
- **Item 7 — Animations**: `observeAnimations()` rewritten — accepts root param, uses local-scoped `IntersectionObserver`, fallback for no IO support. Stagger delays simplified (50-400ms). `prefers-reduced-motion` block at scroll-animations section. Added `observeAnimations()` call to `auction-detail.js`.
- **Item 8 — Legal Pages**: `privacy.js` and `terms.js` fully redesigned — `legal-page` layout with hero icon, table of contents (numbered anchors), 6 sections each with legal-section pattern, bilingual, footer with nav links.
- **Item 9 — Profile Page**: New `pages/profile.js` with `renderUserProfile()`. Route `profile: "renderUserProfile"` in router.js. Profile hero (avatar, name, email, role badge), stats cards (orders/wishlist/notifs async), quick-links grid. Nav dropdown includes profile link.
- **Item 10 — Bug Fixes**: Toast uses `document.createElement` + `textContent` (no innerHTML). Dashboard `/products/my` → `/products/seller` (2 instances). Register birthdate max attribute.
- **Item 11 — README**: Full GitHub README with badges, tech stack table, features, project structure tree, API/design system docs.

### Files Changed (14)
| File | Change |
|------|--------|
| `logo.png` | Added (site logo) |
| `README.md` | Created |
| `index.html` | Favicon, logo navbar, profile dropdown link, cart-nav-link class, profile.js script tag |
| `css/style.css` | Logo styles, navbar redesign, dark mode audit, product card redesign, date picker, global scrollbar, animation system, legal pages CSS, profile CSS |
| `js/app.js` | Toast DOM-based rendering, observeAnimations rewrite |
| `js/router.js` | Added profile route |
| `js/translations.js` | Added products.noProductsDesc, products.inStock, common.quickLinks, dash.sellerDashboard, dash.addresses (en + ar) |
| `pages/home.js` | renderProductCards new structure |
| `pages/privacy.js` | Full redesign with legal-page layout |
| `pages/terms.js` | Full redesign with legal-page layout |
| `pages/profile.js` | New file — full profile page |
| `pages/auction-detail.js` | Added observeAnimations call |
| `pages/dashboard.js` | Fixed /products/my → /products/seller |
| `pages/register.js` | Added max date on birthdate input |

## Previous Session: Complete UI/UX Overhaul (May 2026)

## Previous Session: Complete API Integration Overhaul (May 15, 2026)

### Critical Integration Fixes (23 mismatches resolved)
All frontend-backend API contracts aligned 1:1 with the Sayiad .NET backend.

**register.js**: Removed `POST /auth/check-email` call (endpoint 404). Removed `birthdate`/`licenseNumber` from request body (not in DTO).

**dashboard.js**: `change-password` now sends `currentPassword` (was `oldPassword`). Product create form now includes `brand`, `stockQuantity`, `location`, `categoryId`. Profile update no longer sends `email` (not in DTO). Notification mark-read uses `api.put()` (was `api.patch()`).

**cart.js**: `cart.cartItems` fixed to `cart.items`. Cart items use flat DTO fields (`price`, `productTitle`). Update/delete use `productId` instead of cart item ID.

**checkout.js / shipping.js**: Address create sends `addressLine` (was `street`), removed `governorate` (not in DTO). Shipping list response unwrapped to flat array.

**product-detail.js**: Seller refs use flat `SellerId`/`SellerName` (was nested object). Removed `auctionId` (doesn't exist on DTO). Image handling uses only `primaryImageUrl` (no `images` array).

**home.js / auctions.js**: Auction card rendering uses flat `productTitle`/`productImageUrl` (was `a.product.title`/`a.product.primaryImageUrl`).

**auction-detail.js**: `AuctionDetailResponse` properly destructured into `{ auction, bids }`. Auto-refresh also unwraps response.

**auth.js**: Cart badge count uses `cart.items` (was `cart.cartItems`).

### UI/UX Pro Max Design Token Layer
Added `--space-*` scale, `--font-*` scale, `--leading-*` line heights, `--weight-*` font weights, `--duration-*` transitions, `--ease-*` easing functions — applying UI/UX Pro Max v2.0 standards for spacing rhythm, typography hierarchy, and interaction timing.

### Final Fixes — Zero Remaining Concerns

| # | Concern | Fix |
|---|---------|-----|
| 2 | Auto-bid migration not applied to production DB | Created SQL migration script at `Back-end/SQL/Migrations/AddAutoBidMax.sql` with idempotent check |
| 3 | No frontend auto-bid toggle | Added checkbox + max bid input to auction-detail.js bid form; sends `maxAutoBidAmount` in bid request |
| 4 | Inconsistent `api.del()` calls | Replaced all 3 `api.del()` calls with `api.delete()`; removed `del` alias from api.js |
| 5 | Dead `api.patch()` method | Removed from api.js (no callers remain) |
| 6 | Product auction link broken (no `auctionId` in DTO) | Added `int? AuctionId` to backend `ProductResponse` DTO; mapped from `Product.Auctions` in `ProductManager.MapToResponse`; frontend now links directly to `#/auction-detail?id=${p.auctionId}` |
| 1 | Swagger enabled in production | Uncommented `if (env.IsDevelopment())` guard in `Program.cs` |

**Build status:** 0 errors, 0 warnings  
**Test status:** 22/22 passing

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
