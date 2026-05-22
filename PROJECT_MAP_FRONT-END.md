# Sayiad — Frontend Project Map

**Date:** 2026-05-22 | **Vanilla JS SPA | Bilingual (EN/AR) | PWA**

---

## Latest Session: Wave 6 — Platform Fee & Auction Settlement (May 22, 2026)

### On auction end with winner: wallet deduction + 95% seller payout
- **WalletManager.SettleAuctionPaymentAsync** — new method: deducts winning bid from winner's wallet (releases hold), credits seller 95% (5% platform fee implicit)
- **EndAuctionAsync** and **AuctionExpiryService** both call settlement on winner
- **Email notifications** updated to mention wallet deduction and 95% payout
- **Seller notification** now includes exact payout amount
- **Frontend**: No changes needed — wallet balance deduction and credit are automatic; auction winner already sees "You won" modal, seller already sees "Auction Ended" notification
- **Build:** 0 errors | **Tests:** 22/23 (same pre-existing)

## Previous: Wave 5 — Product Review Flow (May 22, 2026)

### Backend — New products require admin approval
- **ProductStatus.PendingReview** added — new products start as PendingReview
- **Admin endpoints** — `GET /api/products/pending-review`, `PATCH /{id}/approve`, `PATCH /{id}/reject`
- **Public listing** — filters `Status == Available`, hiding pending/rejected products
- **Migration** `AddProductReview` — adds `ReviewedByUserId`, `ReviewedAt`, `RejectionReason` columns

### Frontend — Pending badge + Admin review tab
- Seller's "My Products" page shows `PendingReview` badge (yellow/orange pill) on unapproved items
- Admin dashboard gets a "Product Reviews" tab with table of pending products + approve/reject buttons
- Product detail page: if viewer is the seller and status is PendingReview, shows "Under Review" banner
- Rejected products show the rejection reason in the seller's product list
- New translation keys for review statuses (EN + AR)

## Previous: Wave 4 — Bid-Wallet Integration (May 22, 2026)

### Backend — Bets hold funds, release on outbid/end
- **AuctionManager** — `IWalletManager` injected; bid placement now checks `HasSufficientBalanceAsync`, holds `HoldFundsAsync` on win, `ReleaseHeldFundsAsync` on outbid
- **Auto-bid resolution** — each round releases previous winner's funds, holds auto-bidder's funds
- **Auction end / expiry** — releases held funds when reserve not met (no winner)
- **Build:** 0 errors | **Tests:** 22/23 (same pre-existing)

### Frontend — No changes required
- Wallet balance display already shows `AvailableBalance` (which accounts for held funds)
- No new UI needed — bid button already has error handling for insufficient funds
- The `HasSufficientBalance` check returns a 400 error if wallet is too low
- Existing `wallet.js` deposit page already allows users to top up before bidding

## Previous: Wave 3 — Quota System + SubscriptionPlan (May 21, 2026)

### Backend — Quota System
- **SubscriptionPlan entity** — DB table with tier limits (auctions, bids, requests per month)
- **SubscriptionPlansController** — 5 endpoints (public list + Admin CRUD)
- **SubscriptionManager** — replaced hardcoded `TierLimits` dict with DB lookups
- **AuctionManager** — bid quota + request quota enforcement added
- **Migration** `AddSubscriptionPlans` — creates table + seeds 4 default plans (Free/Basic/Pro/Enterprise)
- 4 default plans seeded (Free: 3/3/3, Basic: 10/20/10, Pro: 25/50/25, Enterprise: 100/200/100)

### Frontend — Dynamic plan cards + Admin plan management
- `subscriptions.js` — now fetches plans from `GET /api/subscriptionplans` instead of hardcoded array
- `admin.js` — new "Plans" tab with table, edit modal, delete confirmation, add form

**Build:** 0 errors | **Tests:** 22/23 (same pre-existing)

### Backend — Wallet System
- New **Wallet** entity (`Balance`, `HeldBalance`, `AvailableBalance`, `RowVersion`)
- New **WalletTransaction** entity (`Amount`, `Type`, `ReferenceType`, `ReferenceId`, `BalanceSnapshot`)
- New `WalletRepository`, `WalletManager`, `WalletController` (3 endpoints)
- Auto-creates wallet on user registration (`AuthManager`)
- Migration: `AddWalletSystem`

### Frontend — Wallet page
- New `pages/wallet.js` — displays balance card (total, held, available), deposit input, paginated transaction table
- Route `#/wallet` → guard: any authenticated user, title key: `wallet.title`
- Navbar dropdown: Wallet link visible for `Customer,Fisherman,BaitSeller,Auctioneer` (all non-Admin)
- Precache added to `sw.js`
- 14 translation keys (EN + AR)

**Build:** 0 errors | **Tests:** 22/23 (same pre-existing)

### Backend changes
- **Admin removed** from: Orders, Cart, Wishlist, Shipping, Payments, Reviews (create/delete), Reports (create), Subscriptions (upgrade/my), Place Bid
- **Admin added** to: Start auction, Approve/Reject auction requests
- **Auctioneer removed** from: ALL e-commerce (orders, cart, wishlist, shipping, payments, reviews, reports) + ALL product endpoints (CRUD, images, get-my)
- **Auctioneer kept** on: Start/End auctions, Approve/Reject requests, View analytics, Subscriptions

### Frontend changes
- `SELLER_ROLES`: Auctioneer removed (now: Fisherman, BaitSeller only)
- Navbar: My Orders/Wishlist → `Customer,Fisherman,BaitSeller`; My Products → `Fisherman,BaitSeller`; Subscriptions → `Customer,Fisherman,BaitSeller,Auctioneer`
- Route guards: cart/checkout/shipping/order-detail now check for e-commerce roles; auction-requests-review/analytics also allow Admin
- Dashboard: orders/wishlist hidden for Admin/Auctioneer; products hidden for Auctioneer; review+analytics tabs visible to Admin too
- Profile: orders/wishlist/shipping links hidden for Admin/Auctioneer; My Products hidden for Auctioneer
- Seller profile/Home/Product detail: Auctioneer removed from all seller-role checks

**Build:** 0 errors | **Tests:** 22/23 (same pre-existing failure)

---

## Overview

Vanilla JS single-page application for the Sayiad (صياد) fishing marketplace & auction platform. Connected to `https://sayiad.runasp.net/api`. Hash-based routing with role-based guards, real-time bidding via SignalR, dark/light theme, full Arabic/English i18n.

**Live:** `https://saiyad-eg.vercel.app`

---

## TECH STACK

| Component | Detail |
|-----------|--------|
| **Vanilla JS** | ES2022, no frameworks, IIFE modules, `defer` scripts |
| **CSS** | Custom Properties (OKLCH), glassmorphism, skeleton shimmers, dark/light mode, RTL |
| **Font Awesome 6** | Icons (CDN) |
| **SignalR** | Real-time auction bids (Microsoft CDN via `<script>`) |
| **Service Worker** | Offline caching, precache + cache-first for static assets |
| **Google Fonts** | Inter (Latin), Cairo (Arabic), Syne (headings) |
| **Vercel** | SPA rewrites + API proxy |

---

## PROJECT STRUCTURE

```
Front-end/
├── index.html                  # Entry point — preloads, 25 page scripts (defer), navbar, footer
├── sw.js                       # Service worker — sayiad-v10, 36 precached assets
├── PROJECT_MAP_FRONT-END.md   # This file
├── USER_ROLE.md                # Permission matrix for all 5 roles
├── USER_SEES.md                # What each role sees (profile, dashboard, navbar)
├── README.md
├── LICENSE
├── logo.png                    # Favicon + nav logo
├── .gitignore
├── vercel.json                 # SPA rewrites + API proxy to sayiad.runasp.net
├── css/
│   └── style.css               # ~5,000 lines — full design system
├── js/
│   ├── config.js               # APP_CONFIG — apiBaseUrl, signalrHubUrl, swaggerUrl
│   ├── api.js                  # Fetch wrapper — JWT injection, auto-refresh, AbortController
│   ├── auth.js                 # Auth state — getUser, isAuthenticated, hasRole, hasAnyRole
│   ├── router.js               # Hash router — 24 routes, routeGuards, page transitions
│   ├── utils.js                # DOM helpers, skeletons, formatting, modals, recently-viewed
│   ├── translations.js         # i18n — ~450 keys per language (EN/AR), t(), setLanguage()
│   ├── background.js           # Canvas underwater animation — fish, kelp, bubbles, light rays
│   ├── signalr.js              # SignalR connection — BidPlaced, AuctionEnded, auto-reconnect
│   ├── app.js                  # App entry — toast, init, event delegation, SW registration
│   └── pages/                  # 25 page scripts (one per route)
│       ├── home.js
│       ├── login.js
│       ├── register.js
│       ├── forgot-password.js
│       ├── reset-password.js
│       ├── verify-email.js
│       ├── products.js
│       ├── product-detail.js
│       ├── auctions.js
│       ├── auction-detail.js
│       ├── cart.js
│       ├── checkout.js
│       ├── dashboard.js
│       ├── shipping.js
│       ├── seller-profile.js
│       ├── order-detail.js
│       ├── profile.js
│       ├── auction-requests.js
│       ├── auction-requests-review.js
│       ├── auctioneer-analytics.js
│       ├── subscriptions.js
│       ├── admin.js
│       ├── privacy.js
│       └── terms.js
```

---

## CORE MODULES

### `js/config.js`
```js
const APP_CONFIG = {
  apiBaseUrl: "https://sayiad.runasp.net/api",
  swaggerUrl: "https://sayiad.runasp.net/swagger/index.html",
  signalrHubUrl: "https://sayiad.runasp.net/hubs/auction"
};
```

### `js/api.js`
| Function | Description |
|----------|-------------|
| `api.get(url, params, signal)` | GET with query params, signal for abort |
| `api.post(url, body, signal)` | POST JSON or FormData |
| `api.put(url, body)` | PUT JSON |
| `api.delete(url)` | DELETE |
| `api.upload(url, formData)` | POST FormData (file upload) |

**Features:**
- JWT Bearer token injection (in-memory cache + localStorage fallback)
- 401 auto-refresh via `/auth/refresh` + retry original request
- Network error wrapping with descriptive messages
- `buildQuery(params)` — builds query string from object

### `js/auth.js`
| Function | Description |
|----------|-------------|
| `getUser()` | Returns parsed user from localStorage |
| `isAuthenticated()` | Checks accessToken exists and not expired |
| `requireAuth()` | Redirects to `#/login` if not authenticated |
| `logout()` | Clears tokens + user, calls POST `/auth/logout`, redirects |
| `getRoleFromToken()` | Parses JWT payload to extract role |
| `hasRole(role)` | Checks if current user has specific role |
| `hasAnyRole(...roles)` | Checks if user has any of the listed roles |
| `updateNavbar()` | Updates nav dropdown based on auth state + role |
| `updateCartBadge()` | Fetches cart count, caches, updates badge |
| `updateNotifBadge()` | Fetches unread count, updates badge |
| `startNotifPolling()` | Polls `/notifications/unread-count` every 60s |
| `stopNotifPolling()` | Stops polling interval |

**Token flow:**
- Access token: 60min expiry, stored in localStorage + in-memory
- Refresh token: 7 days, stored in localStorage
- On 401: POST `/auth/refresh` → new access token → retry

### `js/router.js`
| Item | Description |
|------|-------------|
| `ROUTES` | Enum: Admin="Admin", Customer="Customer", Fisherman="Fisherman", BaitSeller="BaitSeller", Auctioneer="Auctioneer" |
| `SELLER_ROLES` | [Fisherman, BaitSeller] |
| `routeGuards` | Object mapping route → required role(s); 12 protected routes |
| `routeMap` | 25 route entries mapping hash → render function + title key |
| `routeTitles` | Title keys for each route (i18n) |
| `registerRouteCleanup(fn)` | Hooks cleanup callback into route change |
| `runRouteCleanups` | Array of cleanup callbacks |
| `navigate(hash, force)` | Sets location.hash, optionally forces re-render |
| `handleRoute()` | Main router: parse hash, check guards, run cleanup, render page, update title, focus management |

**Route guards (12 protected routes):**
- Cart, Checkout, Dashboard, Shipping, Order Detail, Profile, Subscriptions, Wallet → any authenticated
- Admin → Admin role only
- Auction Requests → Fisherman only
- Auction Requests Review → Auctioneer only
- Auctioneer Analytics → Auctioneer only

**Route map (25 routes):**
```
"#/home" | "#/login" | "#/register" | "#/forgot-password" | "#/reset-password"
"#/verify-email" | "#/products" | "#/product-detail" | "#/auctions"
"#/auction-detail" | "#/cart" | "#/checkout" | "#/dashboard"
"#/shipping" | "#/seller-profile" | "#/order-detail" | "#/profile"
"#/auction-requests" | "#/auction-requests-review" | "#/auctioneer-analytics"
"#/subscriptions" | "#/wallet" | "#/admin" | "#/privacy" | "#/terms"
```

### `js/utils.js`
| Function | Description |
|----------|-------------|
| `$(selector, parent)` | querySelector shorthand |
| `$$(selector, parent)` | querySelectorAll shorthand |
| `showLoading(container, type)` | Injects skeleton HTML (page/card/detail/table/form/auth) |
| `showError(container, msg)` | Shows error alert in container |
| `showErrorWithRetry(container, msg, retryFn)` | Error with retry button |
| `renderEmptyState(container, type)` | SVG illustration + message (7 types) |
| `escapeHtml(str)` | HTML-entity escape |
| `formatPrice(amount)` | EGP formatting via Intl.NumberFormat |
| `formatDate(dateStr, style)` | Date formatting via Intl.DateTimeFormat |
| `statusClass(status)` | CSS class mapping for 15+ statuses |
| `tStatus(status)` | i18n translated status label |
| `renderStars(rating, size)` | Star SVG rendering (full/half/empty) |
| `debounce(fn, delay)` | Global debounce utility (default 400ms) |
| `showFieldError(field, msg)` / `clearFieldError(field)` / `clearAllFieldErrors(form)` | Inline field validation |
| `getPasswordStrength(password)` | 5-criteria strength meter (0-5) |
| `validateForm(form, rules)` | Validates against 10+ rule types |
| `calculateAge(birthdate)` | Age from date |
| `triggerConfetti()` | 60-particle canvas confetti burst |
| `showConfirm(options)` | Promise-based custom modal (danger type, shake, Esc, focus trap) |
| `setupModal(modal)` / `closeModal(modal)` | Modal open/close with focus trap |
| `confirmDialog(msg)` | Simple confirm dialog |
| `initScrollAnimations()` / `disconnectAnimObserver()` | IntersectionObserver scroll animations |
| `trackRecentlyViewed(product)` / `renderRecentlyViewed(container)` | localStorage recently viewed (12 max) |
| `renderProductCards(container, products, options)` | Renders product cards (canonical URL, stagger, quick-add, badge, stock) |
| `openQuickView(product, type)` | Quick-view modal with focus trap |
| `openLightbox(images, startIndex)` | Full-screen gallery with arrow nav |
| `transitionContent(container, newHtml)` | Skeleton-to-content morph |
| `progressiveImg(img)` / `activateProgressiveImages()` | Blur-up image loading |
| `togglePasswordVisibility(input, toggleBtn)` | Show/hide password |

### `js/translations.js`
- `translations` — Object with `en` and `ar` keys, ~470 keys each
- `t(key, params)` — Returns translated string with `{placeholder}` substitution
- `setLanguage(lang)` — Persists to localStorage `sayiad_lang`, sets `dir`/`lang` attributes, re-renders
- `getCurrentLang()` — Returns `'en'` or `'ar'`
- `updateStaticText()` — Updates `data-i18n`, `data-i18n-title`, `data-i18n-placeholder` elements

### `js/background.js`
- IIFE that draws canvas underwater scene
- Elements: 3 sine-wave layers, rising particles (bubbles), kelp, light rays, fish
- Reads `--blob-*` CSS variables for theme-aware colors
- MutationObserver on `data-theme` for dark/light transitions
- Debounced resize handler (150ms)
- Disables on `prefers-reduced-motion`

### `js/signalr.js`
```js
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${APP_CONFIG.signalrHubUrl}`, {
    accessTokenFactory: () => getAccessToken()
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
  .build();
```

| Function | Description |
|----------|-------------|
| `startSignalR()` | Starts connection |
| `stopSignalR()` | Stops connection |
| `joinAuctionGroup(auctionId)` | Joins SignalR group `auction-{id}` |
| `leaveAuctionGroup(auctionId)` | Leaves group |
| `placeBid(auctionId, amount, maxAutoBid)` | Places bid via SignalR |

**Event handlers:**
- `BidPlaced` — Price flash animation, bid history green highlight, outbid/self-bid toast
- `AuctionEnded` — Countdown display update, confetti, winner announcement toast
- `AuctionExtended` — End time update

### `js/app.js`
| Function | Description |
|----------|-------------|
| `showToast(msg, type)` | Toast notification (success/error/info/warning), RTL-aware, max 3 visible, auto-dismiss |
| Route handler wrapper | try/catch with loading state |
| `initApp()` | Main init: navbar, footer, theme, language, SW, background, event delegation |
| `handleNavOverlay()` | Mobile nav drawer open/close/ESC/resize |
| `handleSearchToggle()` | Search bar toggle |
| `handleScrollHeader()` | Navbar scroll glass effect, back-to-top |
| `syncUserRoleAttribute()` | Sets `data-user-role` on `<html>` for CSS targeting |
| Onboarding tour | 3-step first-visit tour |
| Hero tilt parallax | Mouse-move tilt on hero section |
| Ripple effect | Button click ripple |
| Keyboard nav detection | `keyboard-user` class on `<body>` |

**Event delegation (global listeners):**
- `click` on `[data-action="quick-add"]` — Quick add to cart
- `click` on `[data-action="logout"]` — Logout
- Navigation overlay toggle
- Search toggle
- Theme toggle
- Language toggle

---

## PAGE SCRIPTS — All 24 Pages

### `home.js` — `#/home`
- Hero with tilt parallax effect
- Role-based quick link cards (different CTAs per role)
- Features grid (4 items)
- Latest products section (4 cards via `renderProductCards`)
- Active auctions section (4 cards)
- Recently viewed strip (from localStorage)
- Skeleton shimmer injected before API calls

### `login.js` — `#/login`
- Email + password form with inline validation
- Password visibility toggle
- Forgot password link
- Unverified email warning + resend verification button
- Auto-login redirect on success
- i18n error messages

### `register.js` — `#/register`
- 3-step wizard: (1) profile info, (2) role selection, (3) seller details
- Role selector: Customer/Fisherman/BaitSeller/Auctioneer
- Conditional Fishing License field (when Fisherman selected)
- Birthdate picker + age 18+ validation
- Password strength meter + confirm match
- Terms checkbox with legal links
- Email uniqueness check on blur
- Auto-login on success, overlay poll for email verification
- `registerRouteCleanup` for cleanup on page leave

### `forgot-password.js` — `#/forgot-password`
- 3-step flow:
  1. Email input → on 404 redirects to register
  2. 6-digit OTP → verify via `/auth/verify-reset-code`
  3. New password + confirm → POST `/auth/reset-password`
- 60s countdown on OTP resend
- Password strength meter
- Progress indicator (step 1/2/3)

### `reset-password.js` — `#/reset-password`
- Token from URL query param
- New password + confirm with strength meter
- Auto-redirect to login on success

### `verify-email.js` — `#/verify-email`
- Token from URL query params
- GET `/auth/verify-email?token=...`
- Auto-login with stored credentials fallback
- Auto-redirect after 2s on success
- Error display on failure

### `products.js` — `#/products`
- Product grid with search, filters, pagination
- Filters: category (dropdown), condition (tabs), sort (price low/high, high/low, newest), InStock toggle
- URL param persistence (search, categoryId, sort, page)
- Debounced search (400ms via global `debounce`)
- Pagination controls (prev/next + page info)
- Skeleton shimmer loading

### `product-detail.js` — `#/product-detail`
- Product images gallery (lightbox on click)
- Breadcrumb navigation
- Meta: price, stock, condition, location, brand, category
- Quantity selector + add-to-cart
- Wishlist toggle (stateful filled/outline button via API fetch)
- Seller link + contact button
- Similar products (via `renderProductCards`)
- Reviews section: list with star ratings, submit form (star selector + comment), delete own review, in-place append
- Recently viewed track (localStorage)

### `auctions.js` — `#/auctions`
- Auction grid with search + status filter
- Status filter (Active/Finished/Cancelled) wired to API + URL sync
- Countdown timer on each card
- URL param persistence (search, status, page)
- Pagination controls
- Skeleton shimmer loading

### `auction-detail.js` — `#/auction-detail`
- Countdown timer (live `setInterval` update)
- Bid history table (real-time via SignalR + 10s fallback poll)
- Bid placement: number input + draggable slider (synced, min→max*10)
- Auto-bid toggle with max amount field
- Price flash animation on new bid (SignalR)
- Urgency pulse on < 1hr remaining
- Outbid/self-bid toasts
- Breadcrumb
- Recently viewed track
- Winner display on auction end

### `cart.js` — `#/cart`
- Cart table: product thumbnail (48x48), title, unit price, quantity stepper (+/-), subtotal, remove
- Quantity update via +/- buttons with `cart-updated` event
- Remove with `showConfirm` dialog
- Clear cart button
- Total calculation
- Floating mobile cart bar (sticky bottom)
- Checkout button
- Empty state SVG

### `checkout.js` — `#/checkout`
- Shipping address: new address form OR select existing
- Fields: full name, phone, city, governorate, street, postal code
- Shipping method selector
- Payment method: Credit Card / Cash on Delivery
- Order summary with total
- Creates address → creates order → initiates payment
- Navigates to order confirmation on success
- Dispatches `cart-updated` event
- API path: uses `/shippingaddresses` (no hyphen, C3 fix applied)

### `dashboard.js` — `#/dashboard`
- Sidebar with 11 tabs (role-gated visibility)
- **Overview tab**: stats cards + seller onboarding banner (if no seller profile)
- **Orders tab**: paginated table + cancel via `showConfirm`
- **Products tab**: create form + list + image preview + draft autosave + image type/size validation
- **Auctions tab** (Auctioneer only): start auction modal with scheduling
- **Auction Requests tab** (Fisherman only): submit request form + list
- **Auction Requests Review tab** (Auctioneer only): approve/reject workflow
- **Auctioneer Analytics tab** (Auctioneer only): stats + recent auctions
- **Wishlist tab**: remove + add-to-cart with spinner
- **Notifications tab**: mark read + mark all
- **Profile tab**: avatar upload + info edit
- **Password tab**: change password with strength meter
- Mobile tab selector dropdown

### `shipping.js` — `#/shipping`
- Address list with set-default toggle
- Add new address inline form
- Delete via `showConfirm`
- API path: uses `/shippingaddresses` (no hyphen, C3 fix applied)

### `seller-profile.js` — `#/seller-profile`
- Public view: store info + seller's products (by userId from query param)
- Edit/create own seller profile form
- Role check includes Auctioneer via `SELLER_ROLES`

### `order-detail.js` — `#/order-detail`
- Order info: ID, date, status, total
- Items table with product links + seller links
- Shipping address display
- Cancel button (Pending/Confirmed only) with `showConfirm`
- Success/error alert
- Order timeline

### `profile.js` — `#/profile`
- Avatar upload: camera overlay, file input, save as data URL
- Account info: name, email, phone, role badge
- Stats: order count, wishlist count, notification count
- Quick Links: role-gated (My Products for sellers, Dashboard for Fisherman/BaitSeller)
- Edit profile button
- Change password button

### `auction-requests.js` — `#/auction-requests`
- Fisherman role-gated
- Submit form: title, description, fish type, quantity KG, estimated value, catch location/date, image URL
- Form validation (required + number min=0)
- Submit with loading spinner
- Own requests table with status badges (Pending/Approved/Rejected) + rejection reason
- Empty state with CTA

### `auction-requests-review.js` — `#/auction-requests-review`
- Auctioneer role-gated
- Filter tabs: Pending / Approved / Rejected / All
- Requests table: fisherman name, details, status badges
- Approve: scheduling modal (StartTime required, min 1h from now, EndTime optional default +7d)
- Reject: modal with reason textarea (required)
- Loading states on actions

### `auctioneer-analytics.js` — `#/auctioneer-analytics`
- Auctioneer role-gated
- Stats cards: Total Auctions, Active Auctions, Finished Auctions, Total Bids, Total Revenue
- Recent auctions table
- Concurrent API via `Promise.all`

### `wallet.js` — `#/wallet`
- Requires authentication (any role)
- Balance card: total balance, held balance, available balance
- Deposit input + button (calls `POST /api/wallet/deposit`)
- Paginated transaction history table (calls `GET /api/wallet/transactions`)
- i18n for all text, EGP currency formatting via Intl

### `subscriptions.js` — `#/subscriptions`
- Fetches plans from `GET /api/subscriptionplans` (previously hardcoded)
- Plan cards: icon, price (USD), feature list, "Most Popular" badge
- Current plan card
- Upgrade button with loading spinner
- Disabled "Current" button on active plan
- Fetches `/subscriptions/my` for current user status

### `admin.js` — `#/admin`
- Admin role-gated (route guard + role check)
- Tabs: Users, Reports, Products, Orders, Categories, Plans
- **Users**: paginated table (20/page), suspend/activate toggle
- **Reports**: list + resolve with confirmation
- **Orders**: paginated table (20/page)
- **Categories**: list + add/delete with `showConfirm`

### `privacy.js` — `#/privacy`
- Static privacy policy with TOC (4 sections)
- Bilingual inline content (EN/AR)
- Scroll-reveal animations

### `terms.js` — `#/terms`
- Static terms & conditions with TOC (6 sections)
- Bilingual inline content (EN/AR)
- Scroll-reveal animations

---

## DESIGN SYSTEM (`css/style.css`)

### CSS Custom Properties (OKLCH)
```
--primary: oklch(0.55 0.22 265)       /* Blue */
--primary-light: oklch(0.7 0.16 265)   /* Lighter blue */
--surface: oklch(0.97 0.01 265)        /* Light bg */
--text: oklch(0.15 0.02 265)           /* Near-black */
--glass-bg: oklch(0.97 0.01 265 / 0.7) /* Glassmorphism */
--gold-gradient: oklch(0.7 0.18 85)    /* Seller gold theme */
--danger: oklch(0.6 0.22 25)           /* Red */
--success: oklch(0.6 0.18 145)         /* Green */
--warning: oklch(0.7 0.17 85)          /* Amber */
```

Dark mode overrides via `[data-theme="dark"]`: surfaces become darker, text lighter.

### Major Sections
- **Reset** — box-sizing, margin/padding reset
- **Typography** — Inter/Cairo/Syne fonts, RTL overrides for Arabic
- **Navbar** — near-solid backgrounds (not glass), dropdown with role-gated items
- **Buttons** — primary, secondary, outline, ghost, danger, gold seller theme, ripple
- **Forms** — inputs, selects, textareas, validation states, password strength meter
- **Hero** — full-width landing section
- **Product/Auction cards** — glassmorphism, hover lift, gold border for sellers
- **Lightbox** — full-screen overlay, arrow nav, keyboard support
- **Dashboard** — sidebar layout, tab content, stats cards
- **Skeleton loaders** — 5 types (page, card, detail, table, form, auth)
- **Shimmer** — animated gradient for loading states
- **Confetti** — canvas burst animation
- **Subscriptions** — pricing grid, feature comparison
- **Gold seller theme** — shimmer gradients for seller roles
- **Glassmorphism** — card/modals with backdrop blur
- **Urgency palette** — red pulse for ending soon auctions
- **Back-to-top** — fixed button, appears at 400px
- **Mobile drawer** — slide-in nav, safe-area support
- **Floating cart bar** — sticky bottom on mobile
- **Toast notifications** — slide-in, auto-dismiss, max 3 visible
- **Responsive** — 1024px, 768px, 480px breakpoints
- **Accessibility** — `.sr-only`, focus rings, `prefers-reduced-motion`

---

## SERVICE WORKER (`sw.js`)

| Setting | Value |
|---------|-------|
| Cache name | `sayiad-v10` |
| Precache | 37 assets (all core JS + 25 page scripts + CSS) |
| Navigation | NetworkFirst (HTML) |
| Static assets | CacheFirst (CSS, JS, images, fonts) |
| API calls (`/api/`) | NetworkOnly (bypass cache) |
| Broadcast channel | `sw-updates` for update notifications |

---

## ROUTING SUMMARY

| Route | Page Script | Auth Required | Role Required |
|-------|-------------|---------------|---------------|
| `#/home` | home.js | ❌ | — |
| `#/login` | login.js | ❌ | — |
| `#/register` | register.js | ❌ | — |
| `#/forgot-password` | forgot-password.js | ❌ | — |
| `#/reset-password` | reset-password.js | ❌ | — |
| `#/verify-email` | verify-email.js | ❌ | — |
| `#/products` | products.js | ❌ | — |
| `#/product-detail` | product-detail.js | ❌ | — |
| `#/auctions` | auctions.js | ❌ | — |
| `#/auction-detail` | auction-detail.js | ❌ | — |
| `#/cart` | cart.js | ✅ | Any |
| `#/checkout` | checkout.js | ✅ | Any |
| `#/dashboard` | dashboard.js | ✅ | Any |
| `#/shipping` | shipping.js | ✅ | Any |
| `#/order-detail` | order-detail.js | ✅ | Any |
| `#/profile` | profile.js | ✅ | Any |
| `#/subscriptions` | subscriptions.js | ✅ | Any |
| `#/wallet` | wallet.js | ✅ | Any |
| `#/auction-requests` | auction-requests.js | ✅ | Fisherman |
| `#/auction-requests-review` | auction-requests-review.js | ✅ | Auctioneer |
| `#/auctioneer-analytics` | auctioneer-analytics.js | ✅ | Auctioneer |
| `#/admin` | admin.js | ✅ | Admin |
| `#/privacy` | privacy.js | ❌ | — |
| `#/terms` | terms.js | ❌ | — |
| `#/seller-profile` | seller-profile.js | ❌ | — |

---

## KEY CONFIG

| File | Setting | Value |
|------|---------|-------|
| `js/config.js` | `apiBaseUrl` | `https://sayiad.runasp.net/api` |
| `js/config.js` | `swaggerUrl` | `https://sayiad.runasp.net/swagger/index.html` |
| `js/config.js` | `signalrHubUrl` | `https://sayiad.runasp.net/hubs/auction` |
| `vercel.json` | API rewrite | `/api/*` → `https://sayiad.runasp.net/api/*` |
| `js/translations.js` | `currentLang` | `en` or `ar` (localStorage `sayiad_lang`) |
| `sw.js` | Cache version | `sayiad-v10` (increment on deploy) |
| CSS `:root` | `--primary` | `oklch(0.55 0.22 265)` |
| CSS `[data-theme="dark"]` | `--primary` | `oklch(0.7 0.16 265)` |

---

## PERFORMANCE FEATURES

- Service worker precache (37 app shell items)
- Cache-first for static assets (CSS, JS, images, fonts)
- CSS animations on `transform` + `opacity` only
- Canvas background via `requestAnimationFrame`
- Progressive image loading (blur-up → crossfade)
- Debounced search (400ms)
- Debounced canvas resize (150ms)
- In-memory access token cache
- Cart badge caching with mutation invalidation
- Skeleton loaders for all page types

## ACCESSIBILITY

- Skip-link to main content
- `aria-live="polite"` for toasts + route changes
- `role="alertdialog"` on confirm/prompt modals
- `aria-modal="true"` on overlays
- `aria-label` on interactive elements
- `.sr-only` CSS utility
- Semantic HTML (nav, main, section, footer)
- Focus trap in modals/lightbox
- Focus restoration on modal close
- Keyboard nav detection (focus rings on Tab only)
- `prefers-reduced-motion` support

## PWA

- Web app manifest via `index.html` meta tags
- Service worker with precache + runtime caching
- Offline-capable app shell
- Update notification via broadcast channel
- Mobile-friendly responsive layout

## RUNNING LOCALLY

```powershell
# Frontend (static server)
node "C:\Users\pcc\AppData\Local\Temp\opencode\serve-frontend.js"
# → http://localhost:8000

# Backend API
dotnet run --project "F:\DEPI Graduation Project\Back-end\Sayiad.API"
# → https://localhost:7030
```

## DEPLOYMENT

- **API**: Web Deploy → `sayiad.runasp.net`
- **Frontend**: Vercel → `saiyad-eg.vercel.app` (with API proxy rewrites)
- **Cache version**: Bump `sayiad-v10` in `sw.js` on deploy
- **Build**: No build step (static files)
