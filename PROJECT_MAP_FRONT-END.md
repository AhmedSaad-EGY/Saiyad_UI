# Sayiad Frontend — Project Map

## Overview
Vanilla JS single-page application for the Sayiad (صياد) fishing marketplace & auction platform. Connected to `https://sayiad.runasp.net/api`.

## Tech Stack
- **Vanilla JS** — no frameworks
- **CSS Custom Properties (OKLCH)** — theming (dark/light), design tokens, glassmorphism, gold seller theme
- **Hash-based SPA Router** — `#/route?param=value` with route guards (role-based access control)
- **Font Awesome 6** — icons (CDN)
- **SignalR** — real-time auction bids (Microsoft CDN via `<script>`)
- **Service Worker** — offline caching of app shell (precache + cache-first for static assets)
- **Google Fonts** — Inter (Latin) + Cairo (Arabic) + Syne (headings)
- **Vercel** — deployment config with API rewrites

## Project Structure

```
Front-end/
├── index.html              # Entry point, navbar, footer, skip-link, aria-live region,
│                           # 24 page script tags (defer), preload links, cache-busting (?v=)
├── sw.js                   # Service worker (precache + cache-first strategies)
├── PROJECT_MAP_FRONT-END.md # This file
├── README.md               # Placeholder
├── LICENSE
├── logo.png                # Favicon + nav logo
├── vercel.json             # SPA rewrites + API proxy to sayiad.runasp.net
├── .vscode/
│   └── launch.json         # Chrome debug config for localhost:8080
├── css/
│   └── style.css           # Full design system (~4750 lines): OKLCH tokens, reset, navbar glass,
│                           # buttons, forms, hero, product/auction cards, lightbox, dashboard,
│                           # skeleton loaders (5 types), shimmer, confetti, subscriptions,
│                           # gold seller theme, glassmorphism, urgency palette, RTL, dark mode,
│                           # responsive breakpoints, keyframes, stagger animations (1-8),
│                           # prefers-reduced-motion, back-to-top, mobile drawer, floating cart bar
├── js/
│   ├── config.js           # APP_CONFIG.apiBaseUrl + swaggerUrl + signalrHubUrl — single URL source
│   ├── api.js              # Fetch wrapper with JWT injection, access token caching, auto-refresh
│   │                       # token flow, AbortController support, error extraction
│   │                       # (message/title/detail/errors), buildQuery, upload file
│   ├── auth.js             # getuser, isAuthenticated, requireAuth, logout, hasRole, hasAnyRole,
│   │                       # getRoleFromToken (JWT payload parsing), updateNavbar, updateCartBadge,
│   │                       # updateNotifBadge, cart badge caching + invalidation, aria attributes
│   │                       # on user dropdown, notifications polling every 60s
│   ├── router.js           # Hash router (24 routes in routeMap), ROLES constants, routeGuards
│   │                       # (7 guarded routes), param diff for re-render, force re-render param,
│   │                       # page transition (opacity + translateY), registerRouteCleanup /
│   │                       # runRouteCleanups array, back-to-top dismiss, dynamic document title
│   │                       # via routeTitleKeys, a11y focus management, aria-live announcements,
│   │                       # 404 page with CTAs
│   ├── utils.js            # $, $$, showLoading (5 skeleton types), showError (role="alert"),
│   │                       # showErrorWithRetry, renderEmptyState (7 SVG illustrations + hover
│   │                       # float), escapeHtml, formatDate (Intl), formatPrice (EGP),
│   │                       # statusClass (15+ statuses), tStatus, renderStars, transitionContent,
│   │                       # progressiveImg + activateProgressiveImages (blur-up),
│   │                       # observeAnimations + disconnectAnimObserver, trackRecentlyViewed,
│   │                       # renderRecentlyViewed, emptyIllustration (7 SVGs), openQuickView
│   │                       # (focus trap, Esc, overlay click), openLightbox (focus trap, arrow
│   │                       # nav, RTL-aware), showFieldError / clearFieldError / clearAllFieldErrors,
│   │                       # getPasswordStrength (5-criteria), validateForm (10+ rule types),
│   │                       # calculateAge, triggerConfetti (60 particles), debounce (400ms),
│   │                       # showConfirm (custom modal with Promise, shake, Esc, focus),
│   │                       # renderProductCards (canonical, stagger, quick-add btn, badge, stock)
│   ├── translations.js     # en/ar i18n (~450 keys each), t() with {placeholder} replace,
│   │                       # setLanguage() (persists to sayiad_lang, dir/lang attr, re-render),
│   │                       # getCurrentLang(), updateStaticText (data-i18n, data-i18n-title,
│   │                       # data-i18n-placeholder)
│   ├── background.js       # Canvas animated water background (IIFE, 3 sine-wave layers + rising
│   │                       # particles), reads --blob-* CSS vars, MutationObserver for theme
│   │                       # changes, debounced resize handler (150ms)
│   ├── signalr.js          # SignalR connection management, BidPlaced handler (price flash
│   │                       # animation + bid history green highlight + outbid/self-bid toast),
│   │                       # AuctionEnded handler (countdown display update + confetti + toast),
│   │                       # leaveAuctionGroup(), stopSignalR()
│   └── app.js              # Toast system (RTL-aware, aria-live, max 3 visible), IntersectionObserver
│                           # scroll animations, navbar scroll glass effect, back-to-top button,
│                           # mobile drawer (open/close/ESC/resize, body scroll lock), theme toggle
│                           # (smooth CSS transition), language toggle (fade + router reload),
│                           # reduced motion toggle, onboarding tour (3-step), hero tilt parallax,
│                           # syncUserRoleAttribute (data-user-role on html), quick-add-to-cart
│                           # delegation, ripple effect, keyboard nav detection ('keyboard-user'
│                           # class on body), service worker registration
└── pages/
    ├── home.js             # Hero with tilt effect, role-based quick links, features grid (4),
    │                       # latest products + active auctions (4 each) via renderProductCards,
    │                       # recently viewed strip, loading/error states
    ├── login.js            # Login form with email/password, inline validation via Constraint API,
    │                       # password visibility toggle, forgot password link, unverified email
    │                       # warning + resend verification (i18n keys), auto-login redirect
    ├── register.js         # Register form with role selector (Customer/Fisherman/BaitSeller/
    │                       # Auctioneer), conditional Fishing License field, birthdate + age calc,
    │                       # password strength meter + confirm match, terms checkbox,
    │                       # email uniqueness check via blur, auto-login after verify redirect
    ├── forgot-password.js  # Email form → success with 60s countdown resend + change email link
    ├── reset-password.js   # Token from URL, new password + confirm, strength meter, auto-redirect
    ├── products.js         # Product listing with search (debounced 400ms), category filter, sort
    │                       # (price low/high, high/low, newest), URL param persistence, pagination
    ├── product-detail.js   # Product images (lightbox gallery), meta, add-to-cart, wishlist toggle,
    │                       # seller link + contact button, similar products (renderProductCards),
    │                       # reviews section (star rating, submit, delete), recently viewed track
    ├── auctions.js         # Auction listing with search, status filter, pagination, URL params
    ├── auction-detail.js   # Countdown timer (live update via setInterval), bid history table,
    │                       # bid placement (input + draggable slider synced), auto-refresh SignalR+
    │                       # fallback 10s poll, price flash animation, urgency pulse on <1hr,
    │                       # outbid/self-bid toast, breadcrumb, recently viewed track
    ├── cart.js             # Cart table with quantity +/- update, remove (confirm dialog), clear,
    │                       # total calculation, floating mobile bar, browse products CTA when
    │                       # empty, checkout button
    ├── checkout.js         # Shipping address form (name, phone, city, gov, street, postal code) +
    │                       # order creation + payment method selector (Credit Card / COD)
    ├── dashboard.js        # Sidebar tabs (11): overview (stats cards), orders (paginated table +
    │                       # cancel button for Pending/Confirmed), products (create + list + image
    │                       # preview + draft autosave), auctions (Auctioneer: start auction modal
    │                       # with scheduling), auction-requests (Fisherman), auction-requests-review
    │                       # (Auctioneer), auctioneer-analytics (Auctioneer), wishlist (remove),
    │                       # notifications (mark read + mark all), profile update (avatar upload),
    │                       # change password (strength meter), mobile tab selector
    ├── verify-email.js     # Token verification, auto-login with stored credentials fallback
    ├── shipping.js         # CRUD shipping addresses (list, add form inline, delete confirm)
    ├── seller-profile.js   # View public profile by userId, create/edit own seller profile form
    ├── order-detail.js     # Single order view with items table, seller links, cancel button
    │                       # (shown for Pending/Confirmed status only, confirm dialog, success/
    │                       # error alert)
    ├── profile.js          # User profile page: avatar upload (camera overlay, file input, save
    │                       # as data URL), role-based quick links to dashboard sections, account
    │                       # info display
    ├── auction-requests.js # Fisherman: submit auction request form (title, desc, fish type,
    │                       # quantity KG, estimated value, catch location/date, image URL) +
    │                       # view own requests table with status badges
    ├── auction-requests-review.js # Auctioneer: review pending requests, filter (Pending/
    │                       # Approved/Rejected/All), approve with scheduling modal (start/end
    │                       # datetime picker), reject with reason textarea, loading states
    ├── auctioneer-analytics.js # Auctioneer: analytics stats cards (total/active/finished
    │                       # auctions, total bids, revenue) + recent auctions table via Promise.all
    ├── subscriptions.js    # Subscription tiers display (Free/Premium/Pro) in 3-column grid,
    │                       # current plan card, upgrade flow with loading spinner, feature lists,
    │                       # "Most Popular" badge
    ├── admin.js            # Admin panel: Users tab (toggle active/inactive), Reports (resolve),
    │                       # Orders (view all), Categories (add/delete) — role-gated to Admin
    ├── privacy.js          # Privacy policy static page (4 sections)
    └── terms.js            # Terms & conditions static page (6 sections)
```

## Key Features

### UI / UX
- Dark/light theme toggle with localStorage persistence and smooth CSS transitions (OKLCH colors)
- Arabic/English i18n (~450 keys each) with full RTL support, `data-i18n` attribute binding
- Gold role-specific theme for seller roles (Fisherman/BaitSeller/Auctioneer) with shimmer gradients
- Glassmorphism navbar, cards, modals with backdrop-filter
- Scroll-triggered animations via IntersectionObserver with 8 stagger levels
- Canvas animated background (3 sine-wave layers + rising particles, theme-aware via MutationObserver)
- Page transitions: opacity + translateY fade on route change
- Onboarding tour (3-step) for first-time visitors
- Reduced motion toggle for accessibility
- Button ripple effect
- Toast notification system (slide-in, auto-dismiss, max 3 visible, RTL-aware, aria-live)
- Keyboard nav detection (focus rings only on Tab, `keyboard-user` class on body)
- `prefers-reduced-motion` support (disables all animations)
- Responsive layout (1024px, 768px, 480px breakpoints)
- Skeleton loading system (5 layout variants: page, card, detail, table, form)
- Mobile nav: slide-in drawer (RTL-aware), backdrop overlay with blur, body scroll lock, ESC/overlay/resize close
- Back-to-top button (appears after 400px scroll, smooth scroll)
- Floating cart summary bar on mobile (sticky bottom)
- Skeleton-to-content morph transition (`transitionContent`)
- Quick-view modal on product/auction cards (focus trap, Esc key, overlay click to close)
- Empty state SVG illustrations (cart, products, auctions, bell, orders, search, heart) with hover float
- Recently viewed products strip (localStorage, horizontal scroll, 12 max)
- Progressive image loading (blur-up placeholder → full image crossfade)
- Lightbox gallery (full-screen overlay, arrow navigation, keyboard support, RTL-aware)
- Bid countdown urgency animation (red pulsing border + "Ending soon" badge for <1hr)
- Animated price change on auction (flash green highlight + scale on bid update via SignalR)
- Draggable bid slider (range slider synced with number input, min→max×10)
- Confetti burst effect on auction end (`triggerConfetti`)
- `showConfirm` custom modal (Promise-based, shake on overlay click, Esc key, focus trap, role="alertdialog")

### Routing
- Hash-based SPA router with role-based route guards (ROLES constant, 7 guarded routes)
- 24 routes mapped in `routeMap` with dynamic document titles via `routeTitleKeys`
- Detects dashboard tab changes via JSON.stringify param diff, skips identical navigations
- Force re-render parameter (`router(true)`)
- `registerRouteCleanup` / `runRouteCleanups` array for clearing intervals/listeners on route change
- Query param persistence in URL hash for products (`search`, `categoryId`, `sort`, `page`)
- Query param persistence for auctions (`search`, `status`, `page`)
- Language switch triggers re-render via router() for full i18n consistency
- 404 page with contextual CTAs (go home, browse products)
- aria-live announcements on route change for screen readers
- Focus management (tabindex on main content on navigation)

### Forms & Validation
- 10+ rule types in `validateForm`: required, email, minLength, hasUppercase, hasLowercase, hasDigit, hasSpecialChar, phone, matches, minAge
- Inline field validation (red border + error text per field + shake animation)
- Errors clear on input
- Constraint Validation API integration
- `for`/`id` labels, `autocomplete`, `required`, `inputmode` attributes
- Submit button with spinner while loading
- Password visibility toggle (login, register, reset-password)
- Password strength meter (5 criteria: length 8+, length 12+, uppercase+lowercase, digit, special char)
- Confirm password with match validation
- Email validation on blur (login + register)
- Age calculation from birthdate (register)
- Role-specific fields (Fishing License for Fisherman)
- Terms & conditions checkbox with legal links

### Data
- API fetch wrapper with JWT Bearer token injection, in-memory access token caching
- Token refresh flow (`/auth/refresh`) with automatic retry
- AbortController support (`api.abort()`)
- Cart quantity/remove via event delegation + cache invalidation
- Pagination for products, auctions, dashboard orders
- Error states with retry button (`showErrorWithRetry`)
- Locale-aware `formatDate` (`Intl.DateTimeFormat`) and `formatPrice` (`Intl.NumberFormat`, EGP)
- Debounced search inputs (400ms)
- Notifications polling every 60s
- Email uniqueness check before registration
- SignalR real-time updates with WebSocket fallback

### Accessibility
- Skip-to-content link (hidden until focused via Tab)
- `aria-live="polite"` region for toast announcements + route changes
- `role="alertdialog"` on confirm and modal dialogs
- `aria-modal="true"` on overlays
- `aria-label` on product/auction card links (title + price)
- `aria-hidden="true"` on decorative icons
- `.sr-only` CSS utility class
- Semantic `<a>` wrapping for product/auction cards
- Keyboard-navigable with visible focus rings (Tab-only)
- Lightbox with `role="dialog"` and `aria-label`
- Focus restoration after closing lightbox/quick-view/confirm modals
- Focus trap in modals (Tab cycling, no escape to background)
- Navbar dropdown with `aria-haspopup`, `aria-expanded`
- `prefers-reduced-motion` query disables all non-essential animations

### Admin
- Role-gated (`Admin` role only, enforced by route guard + dashboard tab)
- 4 tabs: Users (toggle active/inactive), Reports (resolve with confirmation), Orders (view all), Categories (add/delete)

### Auction Requests (Fisherman)
- Role-gated to `Fisherman` role
- Dashboard tab + direct route (`#/auction-requests`)
- Submit form: product title, description, fish type, quantity (KG), estimated value, catch location/date, image URL
- View own requests table with status badges (Pending/Approved/Rejected) and rejection reason
- Form validation (required fields + number min="0")
- Submit button with loading spinner, alerts on success/error
- Empty state with CTA to create first request

### Auction Requests Review (Auctioneer)
- Role-gated to `Auctioneer` role
- Dashboard tab + direct route (`#/auction-requests-review`)
- Filter tabs: Pending / Approved / Rejected / All
- Table of requests with fisherman name, details, status badges
- Approve: scheduling modal with StartTime (required, min=1h from now) + EndTime (optional, default start+7d)
- Reject: modal with rejection reason textarea (required)
- Loading states on action buttons, success/error feedback

### Auctioneer Analytics
- Role-gated to `Auctioneer` role
- Dashboard tab + direct route (`#/auctioneer-analytics`)
- Stats cards: Total Auctions, Active Auctions, Finished Auctions, Total Bids, Total Revenue
- Recent auctions table with status, prices, bid count, end time
- Concurrent API calls via `Promise.all`

### Subscription Plans & Upgrade
- Dashboard dropdown link + direct route (`#/subscriptions`)
- Requires authentication (any role)
- Plan cards in 3-column grid with icon, price, feature list, "Most Popular" badge
- Current plan card shown above with plan name
- Upgrade button with loading spinner, auto-refresh on success
- Disabled "Current" button on active plan

### Order Cancellation
- Cancel button on orders with `Pending` or `Confirmed` status
- Two entry points: dashboard orders table + order detail page
- Confirmation dialog (`confirm()`)
- API: `PUT /orders/{id}/cancel`
- Success: refreshes order view + alert
- Failure: error message, button re-enabled

### Email Verification Resend
- Integrated into login page's unverified email warning
- "Resend Verification Email" button on API "verify your email" error
- API: `POST /auth/resend-verification` with email
- Error message fallback on failure

### Checkout / Payment
- Requires auth (route guard)
- Shipping address form (full name, phone, city, governorate, street, postal code)
- Creates shipping address → creates order → initiates payment
- Payment method selector (Credit Card / Cash on Delivery)

### Performance
- Service worker precaches app shell (31 items)
- Cache-first for static assets (GET requests to same origin, non-API)
- CSS animations only animate `transform` and `opacity`
- Canvas background uses `requestAnimationFrame` with minimal draw calls
- Progressive image loading (blur-up technique)
- Debounced search inputs (400ms)
- Debounced canvas resize handler (150ms)
- In-memory access token caching (avoids repeated localStorage reads)
- Cart badge caching with invalidation on cart mutations

## Key Config

| File | Setting | Value |
|------|---------|-------|
| `js/config.js` | `apiBaseUrl` | `https://sayiad.runasp.net/api` |
| `js/config.js` | `swaggerUrl` | `https://sayiad.runasp.net/swagger/index.html` |
| `js/config.js` | `signalrHubUrl` | `https://sayiad.runasp.net/hubs/auction` |
| `vercel.json` | API rewrite | `/api/*` → `https://sayiad.runasp.net/api/*` |
| `js/translations.js` | `currentLang` | `en` or `ar` (localStorage `sayiad_lang`) |
| CSS `:root` | `--primary` | `oklch(0.55 0.22 265)` |
| CSS `:root` | `--blob-1 / --blob-2 / --blob-3` | Canvas wave colors (light theme) |
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
