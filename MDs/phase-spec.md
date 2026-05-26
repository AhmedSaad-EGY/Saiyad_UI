# Sayiad — Phase Spec

> Generated from deep codebase reading + 5 rounds of user interview.
> Last updated: 2026-05-26

---

## 1. Project Overview

**Sayiad** (صياد) is an Arabic-first marketplace platform combining e-commerce and auctions. Built as a solo project by the developer.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core (.NET) — C#, REST API |
| Frontend | Vanilla JavaScript (no framework), custom CSS |
| Database | SQL Server |
| Hosting | Shared Windows hosting (monsterAsp.net) — IIS |
| Email | Configured (SMTP / provider) |
| Payments | Stripe (integrated, buggy) |
| Real-time | SignalR (AuctionHub) |
| i18n | Arabic-first, RTL layout |
| Build | Vite (frontend bundling) |

---

## 2. Current State

### ✅ What Works
- Basic scaffolding: Products, Categories, Cart, Orders, Shipping Addresses
- User authentication (register, login, email verification, password reset)
- Product CRUD with image upload
- Cart operations (add, remove, update quantities)
- Checkout flow (basic)
- Category management (CRUD)
- Seller profiles (basic)
- Reviews (basic)
- Reports (basic)
- Wishlist (basic)
- Wallet system (basic implementation)
- Subscription plans (basic)
- Auction CRUD (basic listing and bidding)
- Notifications (basic)
- Real-time auction updates via SignalR

### ❌ What's Broken / Missing

#### A. User Roles (TOP PRIORITY)
- Roles defined in code (`UserRole.cs`: Admin, Buyer, Seller, Auctioneer) but **not enforced** in the UI
- No role-based access control in frontend pages
- Admin dashboard exists (`admin.js`) but may not be properly gated
- Users can't see their own role or switch contexts
- No role management UI for admins

#### B. Frontend Polish
- App feels unfinished — rough UI, inconsistent spacing, missing hover/transition effects
- Responsive design needs work on some pages
- Loading states, empty states, error states often missing
- RTL / Arabic support needs polish in places

#### C. Auction System Bugs
- **Concurrency**: Simultaneous bids can conflict (test file `AuctionConcurrencyTests.cs` exists)
- **Auto-bidding**: Max bid / automatic increment logic is unreliable
- **Scheduling**: Auction start/end time transitions may not trigger correctly
- **Bid validation**: Minimum increments, bidder verification, outbid notifications need hardening
- **Real-time updates**: SignalR updates occasionally miss or double-fire

#### D. Payment / Wallet Flow
- Stripe integration works but edge cases are unhandled (webhook failures, idempotency, expired cards)
- Wallet deposit/withdrawal logic has inconsistencies
- Subscription billing (recurring) may not deduct correctly from wallet or charge card properly
- Checkout/payment flow on frontend is not fully polished

---

## 3. User's Vision & Priorities

### Priority Order

| # | Area | Why |
|---|------|-----|
| 1 | **User Roles** | Foundation for everything else — gating features, personalization, admin tools |
| 2 | **Frontend Polish** | The user-facing experience needs to feel complete and professional |
| 3 | **Auction System Fixes** | Core marketplace feature — must be reliable |
| 4 | **Payment / Wallet Hardening** | Money-critical — needs to be bulletproof |
| 5 | **Testing & Production Hardening** | Logging, error handling, security, backup |

### Design Preferences
- **Arabic-first**: Primary language is Arabic, RTL layout is default
- **Custom CSS**: Already has a custom stylesheet with variables, components, layout, RTL, and animations
- **No framework**: Vanilla JS + Alpine.js-like patterns
- **Professional feel**: Clean, modern marketplace aesthetics with good transitions and micro-interactions

### Timeline
- No hard deadline — ongoing continuous improvement

### Hosting Constraints
- Shared Windows hosting (monsterAsp.net) — likely limits:
  - No Docker
  - No custom server config
  - No WebSocket support? (SignalR may need long-polling fallback)
  - Limited background job support (scheduled auction transitions may need a workaround)

---

## 4. Detailed Architecture

### Backend (Sayiad.API / Sayiad.Domain / Sayiad.Data)
- **Clean Architecture**: API → Domain (Managers) → Data (EF Core + SQL Server)
- **Design Patterns**: Unit of Work, Repository, Manager abstraction
- **Auth**: JWT Bearer tokens, stored in localStorage on frontend
- **Validation**: FluentValidation validators per DTO
- **Real-time**: SignalR Hub (`AuctionHub`) for live bid updates
- **Payments**: Stripe integration (likely Stripe.net SDK)

### Frontend (Vite + Vanilla JS)
- **Router**: Custom hash-based SPA router (`src/core/router/`)
- **State**: Alpine.js store (`src/core/stores/alpine.js`)
- **Auth**: Token management in `src/core/auth/`
- **API Client**: Custom fetch wrapper in `src/core/api/client.js`
- **i18n**: Custom i18n module (`src/core/i18n/`)
- **Real-time**: SignalR JS client in `src/core/realtime/`
- **Pages**: Each page is a JS module in `src/pages/` — exported as `page()` function
- **CSS**: Custom CSS split into `_variables.css`, `_base.css`, `_layout.css`, `_components.css`, `_animations.css`, `_rtl.css`, `style.css`
- **PWA**: Service worker registered in `index.html`

### Database (SQL Server)
- Tables inferred from migrations and models:
  - Users (with LicenseNumber, role)
  - Products, Categories
  - CartItems, Orders, OrderItems
  - Auctions, Bids (with BidStatus, AutoBidMax)
  - AuctionRequests (request/review flow for sellers to create auctions)
  - WalletTransactions
  - SubscriptionPlans, UserSubscriptions
  - Reviews
  - ShippingAddresses
  - Notifications

---

## 5. Key Files & Their Roles

### Backend Core Files

| File | Role |
|------|------|
| `Sayiad.API/Program.cs` | App configuration (middleware, DI, CORS, auth, SignalR) |
| `Sayiad.API/Controllers/*.cs` | REST API endpoints |
| `Sayiad.API/Hubs/AuctionHub.cs` | SignalR real-time auction hub |
| `Sayiad.Domain/Managers/*.cs` | Business logic layer |
| `Sayiad.Data/Data/ApplicationDbContext.cs` | EF Core DbContext |
| `Sayiad.Domain/Contracts/IEmailService.cs` | Email abstraction |
| `Sayiad.Domain/Contracts/IFileStorageService.cs` | File upload abstraction |

### Frontend Core Files

| File | Role |
|------|------|
| `src/core/app.js` | App initialization, router setup, global state |
| `src/core/router/index.js` | Hash-based SPA router |
| `src/core/auth/index.js` | Auth state management, token handling |
| `src/core/api/client.js` | HTTP client with auth header injection |
| `src/core/i18n/index.js` | Internationalization (Arabic/English) |
| `src/core/realtime/index.js` | SignalR connection management |
| `src/core/stores/alpine.js` | Alpine.js reactive store config |
| `src/core/utils/format.js` | Formatting utilities (currency, dates) |
| `src/core/utils/dom.js` | DOM utilities |
| `src/core/utils/ui.js` | UI helpers (modals, toasts, etc.) |
| `src/shared/constants/routes.js` | Route definitions |
| `src/pages/*.js` | Individual page modules |

### CSS Files

| File | Role |
|------|------|
| `_variables.css` | Design tokens (colors, spacing, fonts, breakpoints) |
| `_base.css` | Reset, typography, base elements |
| `_layout.css` | Grid, header, footer, sidebar layout |
| `_components.css` | Card, button, form, modal, table, badge components |
| `_animations.css` | Keyframes, transitions, micro-interactions |
| `_rtl.css` | RTL overrides for all components |
| `style.css` | Imports all partials in order |

---

## 6. User Roles Specification (Implemented)

### Five Roles

| Role | Description |
|------|-------------|
| **Admin** | Platform administrator — full control, user management, product approval, revenue view. Cannot use e-commerce. Cannot self-register (seeded accounts). |
| **Customer** | Default buyer — browse, buy, bid, manage cart/wishlist/orders, write reviews, deposit wallet funds. The **only** role that can place bids on auctions. |
| **Fisherman** | Seller of fresh catch & fishing gear — inherits Customer abilities, plus manage seller profile, submit auction requests, create/edit products (requires admin approval). Cannot place bids. |
| **BaitSeller** | Seller of bait & tackle — inherits Customer abilities, plus manage seller profile, create/edit products (requires admin approval). Cannot place bids or submit auction requests. |
| **Auctioneer** | Auction operator — start/manage auctions, approve/reject auction requests, view analytics, buy products, use cart, manage orders/wishlist/shipping. Cannot place bids or manage seller profile. |

### Role Constants (Frontend)

```js
// src/shared/constants/routes.js
SELLER_ROLES = [Fisherman, BaitSeller]
ECOMMERCE_ROLES = [Customer, Fisherman, BaitSeller, Auctioneer]
```

### Key Permission Rules

- **Bidding:** Customer only
- **E-commerce (cart, checkout, orders, shipping, wishlist, reviews):** All roles except Admin
- **Product creation:** Fisherman, BaitSeller (requires admin approval)
- **Wallet deposit:** All roles except Admin
- **Wallet withdraw:** Admin only
- **Subscriptions:** Customer, Fisherman, BaitSeller, Auctioneer (not Admin — managed via admin panel)
- **Auction requests submit:** Fisherman only
- **Auction requests review:** Auctioneer or Admin
- **Auctioneer analytics:** Auctioneer or Admin
- **Admin panel:** Admin only

### Role Gating Implementation

- **Route guards** in `src/shared/constants/routes.js` — per-route role checks
- **Navbar dropdown** `data-roles` attributes in `src/index.html` — show/hide nav links
- **Dashboard tabs** in `src/pages/dashboard.js` — role-gated tab visibility
- **Profile quick links** in `src/pages/profile.js` — role-based link display
- **Bid controls** in `src/pages/auction-detail.js` — only Customer sees bid UI
- **Wallet deposit** in `src/pages/wallet.js` — hidden for Admin
- **Backend:** `[Authorize(Roles = "...")]` attributes on controllers

---

## 7. Future Work (Post-Roles)

Once roles are solid:
1. **Frontend Polish** — professional design, smooth animations, RTL consistency, responsive fixes
2. **Auction System Overhaul** — concurrency fix, auto-bidding, scheduling, validation
3. **Payment/Wallet Hardening** — Stripe webhook reliability, wallet consistency, subscription billing
4. **Testing** — unit tests for managers, integration tests for critical flows
5. **Production Hardening** — logging, error monitoring, rate limiting, backup strategy
