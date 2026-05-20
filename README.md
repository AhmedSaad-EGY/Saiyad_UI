<div align="center">
  <img src="Front-end/logo.png" alt="Sayiad Logo" width="80" height="80">
  <h1>Sayiad — Fishing Marketplace & Auctions</h1>
  <p>Egypt's premier platform for buying, selling, and auctioning fishing gear</p>

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-saiyad--eg.vercel.app-0077b6?style=for-the-badge&logo=vercel)](https://saiyad-eg.vercel.app)
  [![API](https://img.shields.io/badge/API-runasp.net-023e8a?style=for-the-badge&logo=swagger)](https://sayiad.runasp.net/swagger/index.html)
  [![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)](LICENSE)
</div>

---

## Overview

Sayiad is a full-stack Egyptian fishing marketplace featuring:

- **Product listings** — browse and purchase fishing gear from verified sellers
- **Live auctions** — real-time auction bidding with concurrent bid protection
- **Multi-role system** — Customer, Fisherman, BaitSeller, Auctioneer, Admin
- **Bilingual** — full Arabic (RTL) and English (LTR) support
- **Dark / Light mode** — system preference aware with manual toggle

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Vanilla JS (ES2022) | No framework — fast, lightweight SPA |
| CSS Custom Properties (OKLCH) | Design token system |
| Hash-based Router | Client-side navigation |
| Canvas 2D API | Animated ocean background |
| Font Awesome 6.5 | Icons |
| Google Fonts (Inter + Cairo) | Latin + Arabic typography |

### Backend
| Technology | Version |
|-----------|---------|
| ASP.NET Core | 10.0 |
| Entity Framework Core | 10.0 |
| SQL Server | Cloud (MonsterASP.NET) |
| JWT Bearer Auth | Refresh token rotation |
| FluentValidation | 12.1 |
| Mapster | 10.0 |
| Serilog | Structured logging |

---

## Features

### For Customers
- Browse and search products with filters (category, price, condition)
- Add to cart and wishlist
- Checkout with saved shipping addresses
- Track orders and view order history
- Bid on live auctions with real-time countdown
- Leave product reviews and ratings

### For Sellers (Fisherman / BaitSeller)
- Create and manage product listings
- Upload product images (Cloudinary)
- View seller dashboard with revenue and ratings
- Create and manage auctions
- Seller public profile page

### For Admins
- User management (ban/unban)
- Report resolution
- Product moderation

---

## Getting Started

### Prerequisites
- A modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- No build step required — pure HTML/CSS/JS

### Run Locally

```bash
git clone https://github.com/AhmedSaad-EGY/Saiyad_UI.git
cd Saiyad_UI/Front-end

# Option 1: VS Code Live Server (recommended)
# Install the "Live Server" extension, right-click index.html → Open with Live Server

# Option 2: Python
python -m http.server 5500

# Option 3: Node
npx serve .
```

Open `http://localhost:5500` in your browser.

### Configuration

**File: `Front-end/js/config.js`**

```javascript
const APP_CONFIG = {
  apiBaseUrl: "https://sayiad.runasp.net/api",
};
```

To point to a local backend, change `apiBaseUrl` to `https://localhost:7001/api`.

---

## Project Structure
```
Front-end/
├── index.html              # App shell — navbar, footer, canvas
├── logo.png                # Site logo
├── css/
│   └── style.css           # Full design system (OKLCH tokens, components)
├── js/
│   ├── config.js           # API base URL
│   ├── api.js              # Fetch wrapper, auth headers, token refresh
│   ├── auth.js             # Session management, role checks
│   ├── router.js           # Hash-based SPA router
│   ├── app.js              # App init, theme, lang, navbar, notifications
│   ├── background.js       # Canvas ocean animation
│   ├── translations.js     # EN + AR strings
│   └── utils.js            # Shared utilities (toast, skeletons, escape)
├── pages/
│   ├── home.js             # Landing page
│   ├── login.js            # Authentication
│   ├── register.js         # Registration with email verification
│   ├── forgot-password.js  # Password reset request
│   ├── reset-password.js   # Password reset with token
│   ├── verify-email.js     # Email verification handler
│   ├── products.js         # Product listing with filters
│   ├── product-detail.js   # Product detail + reviews + add to cart
│   ├── auctions.js         # Auction listing with filters
│   ├── auction-detail.js   # Auction detail + bidding
│   ├── cart.js             # Shopping cart
│   ├── checkout.js         # Order placement with address
│   ├── dashboard.js        # User dashboard (tabs)
│   ├── shipping.js         # Shipping address management
│   ├── profile.js          # User profile page
│   ├── seller-profile.js   # Seller public profile
│   ├── order-detail.js     # Single order detail
│   ├── admin.js            # Admin panel
│   ├── terms.js            # Terms and Conditions
│   └── privacy.js          # Privacy Policy
└── sw.js                   # Service worker (offline support)
```

---

## API Integration

All API calls go through `js/api.js` which handles:

- JWT Bearer token injection
- Automatic token refresh on 401
- Request deduplication for concurrent refresh calls
- Error extraction from ProblemDetails / custom error responses

**Base URL:** `https://sayiad.runasp.net/api`
**Swagger:** `https://sayiad.runasp.net/swagger/index.html`

---

## Authentication Flow
Register → Email sent → User clicks verify link → Auto-login → Home
Login → JWT (60min) + RefreshToken (7 days) stored in localStorage
401 response → Auto-refresh → Retry original request
Logout → POST /auth/logout (revoke refresh token) → Clear localStorage

---

## Design System

The UI uses OKLCH color tokens with a maritime-inspired palette:

| Token | Light | Dark |
|-------|-------|------|
| `--primary` | Ocean blue | Bright blue |
| `--body-bg` | Off-white | Deep navy |
| `--card-bg` | White | Dark slate |
| `--text` | Near-black | Near-white |

Typography: **Inter** (English) + **Cairo** (Arabic)
Spacing: 4px base scale (`--space-1` through `--space-16`)
Animations: `animate-on-scroll` + IntersectionObserver, stagger delays

---

## Deployment

**Frontend** → Vercel (automatic from GitHub main branch)
**Backend** → MonsterASP.NET (WebDeploy from Visual Studio)
**Database** → SQL Server (MonsterASP.NET cloud)
**Images** → Cloudinary (free tier)
**Email** → Gmail SMTP via App Password

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the existing code patterns
4. Test in both EN/AR and dark/light modes
5. Open a pull request with a clear description

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Made for fishermen, by fishermen 🎣
  <br>
  <a href="https://saiyad-eg.vercel.app">saiyad-eg.vercel.app</a>
</div>
