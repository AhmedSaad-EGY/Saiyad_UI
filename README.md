# 🐟 Sayiad — Fishing Marketplace & Live Auction Platform

> Egypt's premier web platform for fishing gear commerce and real-time fish auctions. Built as a production-grade, mobile-first Single-Page Application (SPA) with full RTL/Arabic support, dark mode, role-based navigation, and live bidding via SignalR.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend: Vanilla SPA](https://img.shields.io/badge/Frontend-Vanilla%20SPA-brightgreen)](/)
[![RTL Support](https://img.shields.io/badge/RTL-Arabic%20Ready-orange)](/)
[![PWA Ready](https://img.shields.io/badge/PWA-Service%20Worker-purple)](sw.js)
[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](vercel.json)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Role System](#-role-system)
- [Pages & Routing](#-pages--routing)
- [Design System](#-design-system)
- [Internationalization](#-internationalization)
- [PWA Support](#-pwa-support)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌊 Overview

**Sayiad** (صياد — Arabic for "Fisherman") is a full-featured marketplace connecting fishermen, bait sellers, and buyers across Egypt. The platform offers:

- A **product marketplace** for buying and selling fishing equipment and fresh catch
- A **live auction system** with real-time bidding powered by SignalR WebSockets
- **Role-based access control** across five user roles (Buyer, Fisherman, BaitSeller, Auctioneer, Admin)
- A **bilingual interface** supporting English (LTR) and Arabic (RTL) with one-click switching
- A **premium design system** using OKLCH color tokens, glassmorphism, and smooth micro-animations

---

## ✨ Features

### 🛒 Marketplace
- Product listings with image gallery, condition badges, and stock tracking
- Category & price filtering, full-text search, sort by newest/price
- Cart with quantity management and floating checkout bar on mobile
- Checkout with saved shipping addresses
- Order tracking and history

### 🔨 Live Auctions
- Real-time bid updates via SignalR (no page refresh needed)
- Countdown timers with urgent state detection (< 1 hour)
- Bid slider + quick-bid increment buttons (+5%, +10%, +fixed)
- Winner announcement and auction history
- Auctioneer analytics dashboard

### 👤 User Accounts
- JWT-based authentication with secure refresh
- Email verification overlay with animated confirmation
- Password strength meter on registration
- Profile page with avatar upload
- Notification bell with live unread badge

### 🎨 UI/UX
- Mobile-first responsive design
- Slide-in drawer navigation on mobile with staggered animations
- Dark mode / light mode toggle with smooth transition
- Skeleton loading states for all data grids
- Toast notification system
- Back-to-top button with scroll-aware visibility
- Glassmorphism card surfaces and OKLCH design tokens
- Luxury "Gold" theme variant for seller roles

### ♿ Accessibility
- Skip-to-content link
- ARIA live regions for dynamic content
- Keyboard navigation with visible focus rings
- Reduced motion support (`prefers-reduced-motion` + manual toggle)
- Semantic HTML throughout

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Vanilla JavaScript (ES2022+) |
| **Rendering** | Client-side SPA with hash-based routing |
| **Styling** | Pure CSS3 with OKLCH custom properties |
| **Fonts** | Inter (EN), Syne (headings), Cairo (AR) via Google Fonts |
| **Icons** | Font Awesome 6.5 Free |
| **Real-time** | SignalR (Microsoft ASP.NET Core) |
| **PWA** | Service Worker with cache-first strategy |
| **Deployment** | Vercel (static hosting) |
| **Backend** | ASP.NET Core Web API (external) |

---

## 📁 Project Structure

```
Front-end/
├── index.html              # Shell HTML — navbar, footer, app mount point
├── css/
│   └── style.css           # Full design system — tokens, components, responsive
├── js/
│   ├── config.js           # API base URL, environment config
│   ├── api.js              # Fetch wrapper with JWT injection & error handling
│   ├── auth.js             # Auth state: tokens, user role, login/logout helpers
│   ├── app.js              # Toast, loading, utils rendered into DOM
│   ├── router.js           # Hash-based SPA router
│   ├── utils.js            # Shared helpers: formatPrice, formatDate, escapeHtml…
│   ├── background.js       # Animated canvas blob background
│   ├── signalr.js          # SignalR hub connection & auction group management
│   └── translations.js     # i18n strings (EN + AR)
├── pages/
│   ├── home.js             # Landing page — hero, features, product/auction previews
│   ├── products.js         # Product listing with filters & pagination
│   ├── product-detail.js   # Product detail — image gallery, add-to-cart
│   ├── auctions.js         # Auction listing with live countdown badges
│   ├── auction-detail.js   # Live auction — real-time bid, countdown, history
│   ├── cart.js             # Cart table with qty controls & floating bar
│   ├── checkout.js         # Checkout form with address selection
│   ├── order-detail.js     # Order status & line items
│   ├── dashboard.js        # Multi-tab user dashboard (orders, products, wishlist…)
│   ├── profile.js          # User profile + avatar upload
│   ├── seller-profile.js   # Public seller profile & listings
│   ├── login.js            # Login form with "remember me"
│   ├── register.js         # Registration with password strength meter
│   ├── forgot-password.js  # Password reset request
│   ├── reset-password.js   # Token-based password reset
│   ├── verify-email.js     # Email verification overlay
│   ├── admin.js            # Admin panel (users, products, approvals)
│   ├── auction-requests.js # Seller auction request submission
│   ├── auction-requests-review.js # Admin auction review queue
│   ├── auctioneer-analytics.js    # Auctioneer performance charts
│   ├── subscriptions.js    # Subscription plans
│   ├── shipping.js         # Saved shipping addresses management
│   ├── terms.js            # Terms of service (structured legal layout)
│   └── privacy.js          # Privacy policy
├── sw.js                   # Service Worker (PWA)
├── logo.png                # Brand logo
├── vercel.json             # Vercel deployment config (SPA redirect rules)
└── PROJECT_MAP_FRONT-END.md # Internal architecture notes
```

---

## 🚀 Getting Started

### Prerequisites

- Any modern web server (Live Server, nginx, Caddy, Vercel)
- A running instance of the Sayiad ASP.NET Core backend API
- Node.js (optional — only if you run a local dev server via npm)

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-org/sayiad-frontend.git
cd sayiad-frontend/Front-end

# Option 1 — Using VS Code Live Server extension
# Right-click index.html → Open with Live Server

# Option 2 — Using Python
python -m http.server 3000
# Then open http://localhost:3000

# Option 3 — Using Node http-server
npx http-server . -p 3000 -c-1
```

### Configuration

Edit `js/config.js` to point to your backend:

```javascript
const API_BASE_URL = 'https://your-backend.api.com/api';
const SIGNALR_HUB_URL = 'https://your-backend.api.com/auctionHub';
```

---

## 👥 Role System

| Role | Description | Extra Access |
|---|---|---|
| `Buyer` | Default registered user | Cart, orders, wishlist, bidding |
| `Fisherman` | Seller of fresh catch & gear | My products, auction requests, gold theme |
| `BaitSeller` | Seller of bait products | My products, gold theme |
| `Auctioneer` | Licensed auction manager | Auction creation, analytics, gold theme |
| `Admin` | Platform administrator | Admin panel, user management, all reviews |

Role-based navigation items are injected dynamically. The dropdown menu, quick links on the home page, and the admin panel are all gated via `hasRole()` / `hasAnyRole()` checks in `js/auth.js`.

---

## 🗺 Pages & Routing

The router (`js/router.js`) uses hash-based routing (`#/path`). All routes are client-side — the `vercel.json` rewrites all requests to `index.html`.

| Route | Page | Auth Required |
|---|---|---|
| `#/` | Home | No |
| `#/products` | Product listing | No |
| `#/products/:id` | Product detail | No |
| `#/auctions` | Auction listing | No |
| `#/auctions/:id` | Live auction detail | No |
| `#/cart` | Shopping cart | Yes |
| `#/checkout` | Checkout | Yes |
| `#/dashboard` | User dashboard (tabs) | Yes |
| `#/profile` | User profile | Yes |
| `#/seller/:id` | Seller public profile | No |
| `#/login` | Login | No (redirects if logged in) |
| `#/register` | Register | No (redirects if logged in) |
| `#/forgot-password` | Password reset request | No |
| `#/reset-password` | Token-based reset | No |
| `#/verify-email` | Email verification | No |
| `#/admin` | Admin panel | Admin only |
| `#/subscriptions` | Subscription plans | Yes |
| `#/shipping` | Saved addresses | Yes |
| `#/terms` | Terms of service | No |
| `#/privacy` | Privacy policy | No |

---

## 🎨 Design System

All visual design is controlled by CSS custom properties in `:root` (and `[data-theme="dark"]`).

### Color Tokens (OKLCH)
```css
--primary: oklch(0.42 0.22 240);     /* Ocean Blue */
--accent: oklch(0.65 0.19 48);       /* Warm Amber */
--success: oklch(0.58 0.18 145);     /* Green */
--danger: oklch(0.55 0.22 30);       /* Red */
--warning: oklch(0.65 0.18 75);      /* Amber */
```

### Spacing Scale (4px base)
```css
--space-1: 4px  | --space-2: 8px  | --space-3: 12px | --space-4: 16px
--space-5: 20px | --space-6: 24px | --space-8: 32px | --space-10: 40px
--space-12: 48px | --space-16: 64px
```

### Typography
- **Body:** Inter (EN) / Cairo (AR)
- **Headings:** Syne (EN) / Cairo (AR)
- Scale: `--text-xs` (0.72rem) → `--text-5xl` (3rem)

### Component Classes
| Class | Description |
|---|---|
| `.btn`, `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.btn-danger` | Button variants |
| `.card`, `.card-sm` | Card containers |
| `.product-card`, `.product-grid` | Product listing cards |
| `.form-input`, `.form-select`, `.form-textarea` | Form controls |
| `.alert-success/error/info/warning` | Alert banners |
| `.status-active/pending/sold/shipped` | Status pill badges |
| `.skeleton`, `.skeleton-text`, `.skeleton-image` | Loading skeletons |
| `.modal-overlay`, `.modal` | Modal dialogs |
| `.tabs`, `.tab` | Tab navigation |
| `.table-wrapper`, `table` | Responsive tables |
| `.dashboard-layout`, `.dashboard-sidebar` | Dashboard layout |

---

## 🌐 Internationalization

The platform supports **English (LTR)** and **Arabic (RTL)** switching via the language toggle in the navbar.

- All UI strings are stored in `js/translations.js` as `{ en: {}, ar: {} }` objects
- Switching language calls `setLang(lang)` which updates `document.lang` and `document.dir`, re-renders the page, and applies Cairo font overrides
- RTL layout is handled via CSS logical properties (`padding-inline`, `margin-inline-start`, `border-inline-start`, etc.) throughout `style.css`
- Arabic font scale is bumped slightly for Cairo legibility

---

## 📱 PWA Support

The `sw.js` service worker enables:
- **Offline fallback** for cached pages
- **Cache-first** strategy for static assets (CSS, JS, fonts, images)
- **Background sync** ready (not yet implemented)

The app is installable on Android Chrome and iOS Safari as a standalone app.

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd Front-end
vercel --prod
```

The `vercel.json` already contains SPA rewrite rules routing all paths to `index.html`.

### Manual Static Hosting

Upload all files from `Front-end/` to any static host (nginx, S3, Cloudflare Pages). Ensure all routes return `index.html` — configure your host accordingly:

**nginx example:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Follow existing CSS token conventions — use `var(--space-*)`, `var(--text-*)`, `var(--radius-*)` throughout
4. Do not hardcode hex colors — use OKLCH tokens from `:root`
5. Test on Chrome, Firefox, Safari, and at 375px / 768px / 1280px viewport widths
6. Test in both LTR (English) and RTL (Arabic) modes
7. Submit a pull request with a clear description of the UI/UX change

### Code Style
- CSS: BEM-inspired class names, logical properties for RTL
- JS: Vanilla ES2022+, async/await, no frameworks
- Avoid inline styles where a CSS class exists
- Use design tokens — never raw pixel values outside the design system

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with 🐟 and ☕ for Egypt's fishing community</strong><br>
  <a href="#/products">Browse Products</a> · <a href="#/auctions">Live Auctions</a> · <a href="#/register">Join Sayiad</a>
</div>
