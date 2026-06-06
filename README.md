<div align="center">

<img src="https://saiyad-eg.vercel.app/logo.png" alt="Sayiad Logo" width="96" height="96">

# Sayiad — Fishing Marketplace & Live Auctions

**Egypt's premier platform for buying, selling, and bidding on fishing gear and fresh catch.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-saiyad--eg.vercel.app-0ea5e9?style=for-the-badge&logo=vercel&logoColor=white)](https://saiyad-eg.vercel.app)
[![Backend API](https://img.shields.io/badge/API-sayiad.runasp.net-6366f1?style=for-the-badge&logo=dotnet&logoColor=white)](https://sayiad.runasp.net/swagger/index.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-f59e0b?style=for-the-badge&logo=javascript&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7c3aed?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Pages & Routes](#pages--routes)
- [User Roles](#user-roles)
- [Real-Time Auctions](#real-time-auctions)
- [Internationalization](#internationalization)
- [Progressive Web App](#progressive-web-app)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Sayiad is a full-featured, single-page marketplace application targeting Egypt's fishing community. It connects three types of sellers — fishermen, bait sellers, and auctioneers — with customers looking to buy fresh catch, equipment, and fishing supplies. The platform supports a live auction system where bids are pushed in real time via WebSockets, alongside a conventional e-commerce flow with cart, checkout, and order tracking.

The frontend is built as a zero-framework SPA: vanilla JavaScript modules handle routing, state, and page rendering, with Alpine.js providing reactive stores for cross-cutting UI state (auth, cart, wallet, notifications). Vite handles the build pipeline, delivering code-split dynamic imports for each page so the initial bundle stays lean.

---

## Live Demo

| Environment | URL |
|---|---|
| **Production** | [saiyad-eg.vercel.app](https://saiyad-eg.vercel.app) |
| **API (Swagger)** | [sayiad.runasp.net/swagger](https://sayiad.runasp.net/swagger/index.html) |

---

## Key Features

**Marketplace**
- Product catalog with full-text search, category filters, and price sorting
- Infinite scroll with intersection-observer-based lazy loading
- Quick-view modal for products without leaving the current page
- Image lightbox with keyboard navigation

**Live Auctions**
- Real-time bidding powered by ASP.NET Core SignalR
- Automatic reconnection with exponential back-off (0 → 2s → 5s → 10s → 20s → 30s)
- Live countdown timers and bid-placed / auction-ended push events
- Outbid toast notifications targeted only at the displaced bidder

**Authentication & Roles**
- JWT access token + refresh token rotation
- Role-based route guards enforced on the client
- Email verification flow with resend support
- Password strength meter with real-time feedback
- Login rate-limiting UX (countdown on too-many-attempts)

**Internationalisation**
- Full Arabic / English support baked into every string
- Runtime RTL ↔ LTR switch with zero page reload
- Locale-aware number and date formatting

**UX & Accessibility**
- Dark / light theme with `prefers-color-scheme` detection and manual toggle
- `prefers-reduced-motion` respected by the canvas ocean animation
- ARIA live regions announce navigation changes to screen readers
- Skip-to-content link, focus management on route change, keyboard-accessible modals
- Swipe-back gesture (touch-aware, RTL-correct) mirrors browser back

**E-commerce**
- Shopping cart with real-time quantity management and stock validation
- Multi-step checkout with address and payment integration
- Order detail and tracking page
- Wallet system with balance display and transaction history
- Subscription plans for sellers and auctioneers

**Admin & Moderation**
- Admin panel for user and content management
- Auction request submission (Fisherman) → review (Auctioneer/Admin) workflow
- Auctioneer analytics dashboard
- Seller public profile pages

**Progressive Web App**
- Installable on Android and iOS (standalone display mode)
- Service Worker with stale-while-revalidate strategy for static assets
- App shortcuts for Products and Auctions in the home-screen launcher

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Build** | [Vite](https://vitejs.dev) | Dev server, HMR, code-split production build |
| **UI Framework** | [Alpine.js](https://alpinejs.dev) | Reactive stores (auth, cart, wallet, notif, ui) |
| **CSS Framework** | [Bootstrap 5](https://getbootstrap.com) | Layout, grid, utility classes |
| **Design Tokens** | CSS Custom Properties + `oklch()` | Theme variables, dark/light mode |
| **Animations** | [Animate.css](https://animate.style) + Canvas API | Page transitions, ocean background |
| **Icons** | [Font Awesome 6](https://fontawesome.com) | UI iconography |
| **Fonts** | Syne · Cairo · Inter | Display, Arabic body, Latin body |
| **Real-Time** | [SignalR](https://learn.microsoft.com/aspnet/signalr) | Live auction bids and events |
| **HTTP Client** | Fetch API (custom wrapper) | JWT auth, CSRF, refresh, dedup |
| **Routing** | Hash router (custom) | Client-side SPA navigation |
| **i18n** | In-source translation map | AR/EN with RTL support |
| **PWA** | Service Worker + Web App Manifest | Offline shell, installability |
| **Hosting** | [Vercel](https://vercel.com) | Frontend deployment |
| **Backend** | ASP.NET Core | REST API + SignalR hub |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  index.html (app shell: navbar, bottom-nav, modals)     │
│       │                                                 │
│  main.js ─── Alpine stores ─── core/app.js              │
│                                     │                   │
│              ┌──────────────────────┤                   │
│              │                      │                   │
│         router/index.js        realtime/index.js        │
│              │                  (SignalR hub)            │
│     hashchange event                │                   │
│              │              BidPlaced / AuctionEnded     │
│       dynamic import()              │                   │
│              │                 events/bus.js             │
│         pages/*.js  ─────────── (pub/sub)               │
│              │                      │                   │
│         api/client.js    ◄──────────┘                   │
│    (fetch + JWT + CSRF + refresh)                       │
│              │                                          │
└──────────────┼──────────────────────────────────────────┘
               │  HTTPS / WSS
┌──────────────▼──────────────────────────────────────────┐
│            ASP.NET Core Backend                          │
│   REST API  ─────────────  SignalR /hubs/auction         │
└─────────────────────────────────────────────────────────┘
```

**Key design decisions:**

- **Zero global framework.** Each page is a plain async function that receives the `#app` container and renders itself. Alpine is used only for stores that need to be reactive across the navbar and multiple page instances (cart count, wallet balance, notification badge).
- **Dynamic imports per route.** Every page module is imported on demand so the initial parse budget is tiny, and Vite can produce per-page chunks automatically.
- **Scoped event bus.** Pages attach listeners to the DOM-backed bus via `createScopedBus()`, which exposes a `cleanup()` method. The router calls registered cleanups before mounting the next page, preventing listener leaks.
- **CSRF + JWT dual-layer security.** Every mutation request carries both a `Bearer` token and an `X-CSRF-Token` header extracted from a cookie, so the API is protected against both token theft and cross-site request forgery.

---

## Project Structure

```
src/
├── core/                        # Framework-level infrastructure
│   ├── api/
│   │   ├── client.js            # HTTP client: JWT, refresh, CSRF, dedup
│   │   └── config.js            # API & SignalR base URLs
│   ├── auth/
│   │   └── index.js             # Auth state, role helpers, navbar sync
│   ├── events/
│   │   └── bus.js               # App-wide event bus + scoped bus factory
│   ├── i18n/
│   │   └── index.js             # AR/EN translation map + setLanguage()
│   ├── realtime/
│   │   └── index.js             # SignalR connection lifecycle + event relay
│   ├── router/
│   │   └── index.js             # Hash router, route guards, history stack
│   ├── stores/
│   │   └── alpine.js            # Alpine.js stores (auth, cart, ui, wallet, notif)
│   ├── utils/
│   │   ├── csrf.js              # CSRF token read/write from cookie
│   │   ├── dom.js               # Skeletons, animations, DOMPurify escaping
│   │   ├── format.js            # Locale-aware price, date, number formatting
│   │   ├── ocean.js             # Canvas ocean + fish background animation
│   │   ├── seo.js               # Dynamic <title> and meta tag updates
│   │   ├── swipe.js             # RTL-aware touch swipe gesture detector
│   │   ├── ui.js                # Toasts, confirm dialogs, quick-view, lightbox
│   │   └── validation.js        # Form validation + password strength scorer
│   └── app.js                   # App bootstrap: navbar, drawer, theme, back-to-top
│
├── css/                         # Modular stylesheet architecture
│   ├── style.css                # Entry point — imports all partials
│   ├── _variables.css           # OKLCH design tokens (colors, spacing, radius)
│   ├── _base.css                # CSS reset + base element styles
│   ├── _layout.css              # Navbar, off-canvas drawer, page containers
│   ├── _components.css          # Cards, forms, badges, tables, toasts, modals
│   ├── _bootstrap-overrides.css # Bootstrap variable remapping to custom tokens
│   ├── _animations.css          # Skeleton loaders + custom keyframes
│   └── _rtl.css                 # RTL-specific layout overrides
│
├── features/                    # Feature-scoped business logic
│   ├── checkout/
│   │   └── helpers.js
│   └── subscriptions/
│       └── helpers.js
│
├── pages/                       # One file per route — async page renderers
│   ├── home.js
│   ├── products.js
│   ├── product-detail.js
│   ├── auctions.js
│   ├── auction-detail.js
│   ├── cart.js
│   ├── checkout.js
│   ├── dashboard.js
│   ├── profile.js
│   ├── wallet.js
│   ├── subscriptions.js
│   ├── seller-profile.js
│   ├── shipping.js
│   ├── order-detail.js
│   ├── auction-requests.js
│   ├── auction-requests-review.js
│   ├── auctioneer-analytics.js
│   ├── admin.js
│   ├── login.js
│   ├── register.js
│   ├── forgot-password.js
│   ├── reset-password.js
│   ├── verify-email.js
│   ├── terms.js
│   └── privacy.js
│
├── public/                      # Static assets served at root
│   ├── logo.png
│   ├── manifest.json            # PWA web app manifest
│   ├── robots.txt               # Crawl rules (private routes disallowed)
│   └── sw.js                    # Service Worker (stale-while-revalidate)
│
├── shared/                      # Reusable modules across features
│   ├── components/
│   │   ├── modal.js             # Alpine modal component
│   │   └── pagination.js        # Pagination component
│   ├── constants/
│   │   ├── roles.js             # Role constants + role-set arrays
│   │   └── routes.js            # Route map, guards, and title key map
│   └── helpers/
│       ├── errors.js            # API error normalizer + fallback UI renderer
│       └── index.js             # JWT claim extractor + misc helpers
│
├── index.html                   # App shell HTML (navbar, bottom nav, modals)
└── main.js                      # Entry point: Bootstrap JS + Alpine + app init
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or pnpm / yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/AhmedSaad-EGY/Saiyad_UI.git
cd Saiyad_UI

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Vite starts the dev server at `http://localhost:5173` with Hot Module Replacement enabled.

### Production Build

```bash
npm run build
```

The optimised output lands in `dist/`. Each page module becomes a separate chunk, and Vite injects content hashes for long-term caching.

### Preview the Build

```bash
npm run preview
```

Serves the `dist/` folder locally so you can verify the production build before deploying.

---

## Configuration

API endpoints and the SignalR hub URL are set in `src/core/api/config.js`:

```js
// src/core/api/config.js
export const APP_CONFIG = {
  apiBaseUrl:    'https://sayiad.runasp.net/api',
  swaggerUrl:    'https://sayiad.runasp.net/swagger/index.html',
  signalrHubUrl: 'https://sayiad.runasp.net/hubs/auction',
};
```

For a local backend, update these values before running `npm run dev`. To use environment variables instead, rename the fields to reference `import.meta.env.VITE_*` and add a `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SIGNALR_HUB_URL=http://localhost:5000/hubs/auction
```

---

## Pages & Routes

The router uses URL hashes (`#/route`). All routes with a `🔒` require authentication; routes with role icons are further restricted.

| Route | Page | Access |
|---|---|---|
| `#/` | Home — featured products & active auctions | Public |
| `#/products` | Product catalog with search & filters | Public |
| `#/product-detail?id=` | Product detail, quick-buy, reviews | Public |
| `#/auctions` | Active auction listings | Public |
| `#/auction-detail?id=` | Live bidding room | Public |
| `#/login` | Login | Public |
| `#/register` | Registration with role selection | Public |
| `#/forgot-password` | Password reset request | Public |
| `#/reset-password` | Password reset confirmation | Public |
| `#/verify-email` | Email verification | Public |
| `#/terms` | Terms & conditions | Public |
| `#/privacy` | Privacy policy | Public |
| `#/cart` | Shopping cart | 🔒 Customer / Fisherman / Bait Seller |
| `#/checkout` | Checkout flow | 🔒 Customer / Fisherman / Bait Seller |
| `#/shipping` | Shipping address management | 🔒 Customer / Fisherman / Bait Seller |
| `#/order-detail?id=` | Order tracking | 🔒 Customer / Fisherman / Bait Seller |
| `#/dashboard` | Role-adaptive user dashboard | 🔒 All authenticated |
| `#/profile` | Profile management | 🔒 All authenticated |
| `#/wallet` | Wallet balance & transactions | 🔒 All authenticated |
| `#/subscriptions` | Subscription plan management | 🔒 Seller / Auctioneer |
| `#/seller-profile?id=` | Public seller profile | Public |
| `#/auction-requests` | Submit auction requests | 🔒 Fisherman |
| `#/auction-requests-review` | Review auction requests | 🔒 Auctioneer / Admin |
| `#/auctioneer-analytics` | Auction analytics dashboard | 🔒 Auctioneer / Admin |
| `#/admin` | Admin control panel | 🔒 Admin |

Any unmatched hash renders a branded 404 page with an inline product search.

---

## User Roles

| Role | Constant | Capabilities |
|---|---|---|
| **Customer** | `Customer` | Browse, buy, cart, checkout, orders, wallet |
| **Fisherman** | `Fisherman` | All Customer capabilities + list products + submit auction requests |
| **Bait Seller** | `BaitSeller` | All Customer capabilities + list bait / equipment products |
| **Auctioneer** | `Auctioneer` | Review auction requests, run live auctions, view analytics |
| **Admin** | `Admin` | Full platform access including admin panel and moderation |

> **Note:** The `BaitSeller` role in the codebase is equivalent to the `Butler` role in the system specification. Both identifiers refer to the same account type.

Role sets used in guards:

```js
SELLER_ROLES    = [Fisherman, BaitSeller]
ECOMMERCE_ROLES = [Customer, Fisherman, BaitSeller]
MODERATOR_ROLES = [Auctioneer, Admin]
```

---

## Real-Time Auctions

The `src/core/realtime/index.js` module manages a single shared SignalR connection per session. It starts automatically when a user logs in and is torn down on logout.

**Events emitted by the hub:**

| SignalR Event | App Bus Event | Description |
|---|---|---|
| `BidPlaced` | `realtime:bid-placed` | A new bid was recorded; includes bidder ID and amount |
| `AuctionEnded` | `realtime:auction-ended` | The auction timer expired or was closed by the auctioneer |

**Reconnection strategy:** `[0, 2000, 5000, 10000, 20000, 30000]` ms. A dismissible status banner appears while disconnected and is hidden automatically on reconnect. After reconnecting, the client re-joins all previously subscribed auction groups.

Page modules subscribe to the app bus events rather than the hub directly, so they stay decoupled from the SignalR implementation:

```js
import { on } from '../core/events/bus.js';

on('realtime:bid-placed', ({ detail }) => {
  // update bid list UI
});
```

---

## Internationalization

All UI strings live in `src/core/i18n/index.js` as a flat key-value map under `en` and `ar` namespaces. The `t(key, vars?)` helper resolves keys at runtime and interpolates `{placeholder}` tokens.

```js
import { t, setLanguage } from './core/i18n/index.js';

t('home.welcome');                       // "Welcome to Sayiad"
t('auth.minAgeRequired', { minAge: 18 }); // "You must be at least 18 years old."

setLanguage('ar');  // switches locale and flips document.dir to 'rtl'
setLanguage('en');  // switches back to 'ltr'
```

The user's language preference is persisted to `localStorage` under the key `sayiad_lang` and applied before first paint to prevent a flash of the wrong direction.

---

## Progressive Web App

Sayiad is fully installable as a PWA on Android and iOS:

- **Manifest** (`/manifest.json`): standalone display, portrait orientation, Arabic default locale, app shortcuts for Products and Auctions.
- **Service Worker** (`/sw.js`): caches versioned `assets/` files with a stale-while-revalidate strategy and cleans up old cache versions on activation. API and SignalR traffic bypasses the cache entirely.
- **Theme integration**: `<meta name="theme-color">` and `apple-mobile-web-app-status-bar-style` are set for a native feel on both platforms.

---

## Security

| Mechanism | Implementation |
|---|---|
| **JWT Authentication** | `Authorization: Bearer <token>` on every API request |
| **Refresh Tokens** | Automatic silent refresh on 401; clears session and emits `auth:session-expired` on failure |
| **CSRF Protection** | `X-CSRF-Token` header included on all `POST` / `PUT` / `PATCH` / `DELETE` requests, value read from a cookie set by the server |
| **Route Guards** | Client-side guards check role before mounting each protected page; unauthenticated users are redirected to `/login` |
| **XSS Prevention** | All user-supplied content rendered via `escapeHtml()` (DOMPurify-backed) before being inserted into the DOM |
| **Request Deduplication** | Identical in-flight requests are coalesced to prevent double submissions |
| **robots.txt** | Private routes (`/admin`, `/dashboard`, `/wallet`, etc.) are disallowed for crawlers |

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository and create a feature branch from `main`.
2. Keep changes focused — one logical change per pull request.
3. Ensure the build passes locally with `npm run build` before opening a PR.
4. Follow the existing code conventions:
   - ES module imports, no CommonJS
   - Vanilla JS for page logic; Alpine stores only for persistent cross-page state
   - All user-visible strings go through `t()` — no hardcoded English copy
   - CSS changes should use the existing design tokens from `_variables.css`

For significant architectural changes, please open an issue first to discuss the approach.

---

## License

Released under the [MIT License](LICENSE). You are free to use, modify, and distribute this software with attribution.

---

<div align="center">

Built with care for Egypt's fishing community 🎣

[saiyad-eg.vercel.app](https://saiyad-eg.vercel.app) · [API Docs](https://sayiad.runasp.net/swagger/index.html) · [Report a Bug](https://github.com/AhmedSaad-EGY/Saiyad_UI/issues)

</div>
