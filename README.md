# Sayiad (صياد) — Fishing Marketplace & Auction Platform

A fully-featured single-page application for buying, selling, and bidding on fishing gear and equipment. Built with vanilla JavaScript and powered by a .NET Web API backend.

---

## Features

### Marketplace
- **Product Listings** — Browse, search, filter by category, and sort by price or newest
- **Product Detail** — Image gallery with lightbox, reviews & ratings, add to cart/wishlist, similar products, contact seller
- **Shopping Cart** — Add/remove items, update quantities, persistent floating summary bar on mobile
- **Checkout** — Shipping address form, payment method selection (Credit Card / Cash on Delivery), order placement
- **Order Management** — View order history, detailed order view with item breakdowns

### Auctions
- **Live Auction Listings** — Filter by status (Active/Finished/Cancelled), search, pagination
- **Auction Detail** — Real-time countdown timer, bid history, bid placement with draggible slider
- **Auto-refresh** — Bid data refreshes every 10 seconds with price flash animation
- **Urgency Indicators** — Pulsing red border and "Ending soon" badge for auctions under 1 hour
- **Outbid Notifications** — Toast alert when a new bid is placed during the session

### Authentication & User Management
- **Registration** — Role-based signup (Customer, Fisherman, Bait Seller, Auctioneer), password strength meter, email verification flow
- **Login** — With password visibility toggle, "forgot password" flow, unverified email warnings
- **Password Reset** — Token-based reset with strength meter and confirm validation
- **Profile Management** — Update name, email, phone; change password with strength meter
- **Seller Profiles** — Create and manage store profiles with contact details and location

### Dashboard
- **Overview** — Quick stats on orders and products
- **Orders** — Paginated order table with status and date
- **My Products** — List and create products with image upload and live preview
- **Wishlist** — View and remove saved products
- **Notifications** — Per-item and "Mark All as Read" with unread badge polling
- **Profile & Password** — Update personal info, change password with strength meter

### Admin Panel
- **User Management** — View all users, toggle active/inactive status
- **Reports** — View and resolve reported content
- **Orders** — View all platform orders
- **Categories** — Add and delete product categories

### UI / UX
- 🌗 Dark/Light theme toggle with smooth OKLCH-based CSS transitions
- 🌐 Full Arabic/English i18n (~350 keys each) with RTL layout support
- 📱 Fully responsive: desktop → tablet → mobile with slide-in nav drawer
- ⚡ Skeleton loading system (5 layout variants) with morph transitions
- 🎨 Animated canvas water background (3 sine-wave layers + particles)
- 🖼️ Progressive image loading (blur-up → crossfade)
- 🔍 Quick-view modal on product/auction cards
- 🧭 Breadcrumb navigation on detail pages
- 🔝 Back-to-top button
- ♿ Skip-to-content link, aria-live announcements, keyboard-navigable

### Performance
- Service worker for offline app-shell caching
- Cache-first strategy for static assets
- Debounced search inputs and canvas resize handler
- CSS animations limited to `transform` and `opacity` only

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JavaScript (ES6+), no frameworks |
| **Styling** | CSS Custom Properties (OKLCH), responsive design |
| **Routing** | Hash-based SPA router (`#/route?param=value`) |
| **Icons** | Font Awesome 6 (CDN) |
| **Fonts** | Inter (Latin), Cairo (Arabic) — Google Fonts |
| **Offline** | Service Worker (precache + cache-first) |
| **Deployment** | Vercel (SPA rewrites + API proxy) |
| **API** | `https://sayiad.runasp.net/api` (.NET Web API) |

---

## Project Structure

```
Front-end/
├── index.html              # Entry point, navbar, footer, skip-to-content, aria-live
├── sw.js                   # Service worker (precache + cache-first)
├── PROJECT_MAP.md          # Detailed project map
├── vercel.json             # Vercel deployment config (SPA + API proxy)
├── .vscode/
│   └── launch.json         # Chrome debug configuration
├── css/
│   └── style.css           # Full design system (~2865 lines): OKLCH tokens, layouts,
│                           # components, keyframes, RTL, dark mode, responsive breakpoints
├── js/
│   ├── config.js           # API base URL configuration
│   ├── api.js              # Fetch wrapper with JWT injection, token refresh, error handling
│   ├── auth.js             # Authentication state, navbar updates, badge polling
│   ├── router.js           # Hash router — 20 routes, param diff, page transitions
│   ├── utils.js            # DOM helpers, skeleton loading, formatters, validation, lightbox
│   ├── translations.js     # en/ar i18n (~350 keys each), language switching
│   ├── background.js       # Canvas animated water background (IIFE)
│   └── app.js              # Toast system, scroll animations, theme/lang toggles,
│                           # mobile drawer, ripple effect, keyboard nav
└── pages/
    ├── home.js             # Hero section, feature cards, product/auction previews
    ├── login.js            # Login form with validation
    ├── register.js         # Registration with role selector, strength meter
    ├── forgot-password.js  # Password reset request with countdown resend
    ├── reset-password.js   # Token-based password reset
    ├── products.js         # Product listing with search, filter, sort, pagination
    ├── product-detail.js   # Product detail, gallery, reviews, similar products
    ├── auctions.js         # Auction listing with search, filter, pagination
    ├── auction-detail.js   # Auction detail, countdown, bid placement, bid history
    ├── cart.js             # Shopping cart with quantity, remove, clear
    ├── checkout.js         # Order checkout with shipping address and payment
    ├── dashboard.js        # User dashboard (orders, products, wishlist, notifications)
    ├── verify-email.js     # Email verification with auto-login
    ├── shipping.js         # Shipping address management (CRUD)
    ├── seller-profile.js   # Seller profile view and management
    ├── order-detail.js     # Single order detail view
    ├── admin.js            # Admin panel (users, reports, orders, categories)
    ├── privacy.js          # Privacy policy page
    └── terms.js            # Terms & conditions page
```

---

## Getting Started

### Prerequisites

- Node.js (any recent LTS version)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Running Locally

```bash
# Clone the repository
git clone <repo-url>
cd sayiad-frontend

# Serve the static files (no build step required)
npx serve .
# or use the project's local server script
node "C:\Users\pcc\AppData\Local\Temp\opencode\serve-frontend.js"
```

The app will be available at `http://localhost:8000`.

By default, the frontend connects to the production API at `https://sayiad.runasp.net/api`. To use a local API:

1. Open `js/config.js`
2. Change `apiBaseUrl` to `https://localhost:7030/api`
3. Run your local .NET API server

---

## Configuration

### API Endpoint

Edit `js/config.js`:

```js
const APP_CONFIG = {
  apiBaseUrl: "https://sayiad.runasp.net/api",
  swaggerUrl: "https://sayiad.runasp.net/swagger/index.html",
};
```

### Theme & Language

Persisted to `localStorage`:

| Key | Values | Default |
|-----|--------|---------|
| `sayiad_theme` | `light` / `dark` | `light` |
| `sayiad_lang` | `en` / `ar` | `en` |

---

## Deployment

### Vercel

The project includes a `vercel.json` for one-click deployment:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://sayiad.runasp.net/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This configures:
- SPA routing (all paths serve `index.html`)
- API proxy (`/api/*` → production API)

### API

The backend is published via Web Deploy to `sayiad.runasp.net`.

---

## Browser Support

- Chrome 80+
- Firefox 80+
- Safari 14+
- Edge 80+
- Opera 67+

---

## License

© 2026 Sayiad. All rights reserved.
