# Sayiad Platform — Complete Project Plan

> **Sayiad** is a full-stack e-commerce + auction marketplace built for the Egyptian fishing community.  
> **Theme:** Fishermen, bait sellers, and buyers connect to trade fresh catches and fishing gear via direct purchase and timed auctions.

---

## 📁 Project Structure

```
Sayiad/
├── Front-end/              # SPA — Alpine.js + Vanilla JS + Vite
│   └── src/
│       ├── core/           # Framework core (app shell, router, API, auth, i18n, stores, realtime, utils)
│       ├── pages/          # Route page components (~25 pages)
│       ├── features/       # Feature-specific helpers (checkout, subscriptions)
│       ├── css/            # Modular CSS (variables, base, layout, components, animations, RTL)
│       ├── shared/         # Shared components (modal, toast, pagination), constants, helpers
│       └── public/         # Service worker
│       ├── index.html      # SPA entry
│       └── main.js         # Bootstrap / config
├── Back-end/               # .NET 10 Web API (C#)
│   └── Sayiad.API/         # API controllers, middleware, Program.cs
│   └── Sayiad.Data/        # EF Core DbContext, Migrations, Models, Repositories
│   └── Sayiad.Domain/      # Business logic (Managers, DTOs, Validators, Contracts)
│   └── Sayiad.Tests/       # Unit + Integration tests (xUnit)
│   └── SQL/                # SQL migration scripts
└── MDs/                    # Project documentation
```

---

## 🖥️ Front-End Architecture

### Tech Stack
- **Alpine.js** (via CDN `alpinejs` npm package)
- **Vanilla JS** — modular ES modules with `type="module"`
- **Vite** — build tool, dev server
- **CSS** — custom modular CSS (no framework)
- **Service Worker** — PWA support (`public/sw.js`)
- **Deployment** — Vercel (`vercel.json` config)

### Core Modules (`src/core/`)

| Module | File | Purpose |
|--------|------|---------|
| **App Shell** | `app.js` | Application initialization, global config |
| **Router** | `router/index.js` | Hash-based SPA routing (`#/route`) with params, guards, cleanup |
| **API Client** | `api/client.js` | HTTP client with JWT, auto-refresh, error handling |
| **API Config** | `api/config.js` | Base URL, default headers |
| **Auth** | `auth/index.js` | JWT management, login/logout, role checks (`hasAnyRole`), cart badge |
| **i18n** | `i18n/index.js` | Multi-language (Arabic/English) with `t()` function |
| **Events** | `events/bus.js` | Custom event bus |
| **Realtime** | `realtime/index.js` | SignalR connection for live auction updates |
| **Stores** | `stores/alpine.js` | Alpine.js store registration for shared state |
| **Utils** | `utils/dom.js` | DOM helpers (loading, errors, escape, progressive images, animations) |
| **Utils** | `utils/format.js` | Price/date formatting, status classes, star rendering |
| **Utils** | `utils/ui.js` | Product cards, lightbox, toast, confirm dialogs, recently viewed |
| **Utils** | `utils/validation.js` | Password strength, email validation |
| **Utils** | `utils/ocean.js` | Ocean wave animation canvas |

### Pages (`src/pages/`) — Route Components

| Page | File | Description | Auth Required |
|------|------|-------------|:---:|
| Home | `home.js` | Landing page with hero, featured products/auctions, categories | ❌ |
| Products | `products.js` | Product listing with filters, search, grid | ❌ |
| Product Detail | `product-detail.js` | Full product view, add-to-cart, wishlist, reviews, start auction | ❌ (cart=🔑) |
| Auctions | `auctions.js` | Active auction listings | ❌ |
| Auction Detail | `auction-detail.js` | Bid placement, auto-bid, countdown, realtime updates | ❌ (bid=🔑) |
| Cart | `cart.js` | Shopping cart management, quantity, checkout start | 🔑 |
| Checkout | `checkout.js` | Order review, address selection, payment | 🔑 |
| Login | `login.js` | Email/password login | ❌ |
| Register | `register.js` | User registration (Fisherman, BaitSeller, Buyer) | ❌ |
| Forgot Password | `forgot-password.js` | 3-step: email → OTP → new password (Alpine) | ❌ |
| Reset Password | `reset-password.js` | Direct token-based password reset (Alpine) | ❌ |
| Verify Email | `verify-email.js` | Email verification handler | ❌ |
| Dashboard | `dashboard.js` | User dashboard with tabs (orders, notifications, settings) | 🔑 |
| Admin | `admin.js` | Admin panel (users, products review, reports, categories, plans) | 🔑 (Admin) |
| Profile | `profile.js` | Edit user profile | 🔑 |
| Seller Profile | `seller-profile.js` | Seller storefront with products | ❌ |
| Shipping | `shipping.js` | CRUD shipping addresses | 🔑 |
| Subscriptions | `subscriptions.js` | Browse & upgrade subscription plans | 🔑 |
| Wallet | `wallet.js` | Wallet balance, deposit, transaction history (Alpine) | 🔑 |
| Auction Requests | `auction-requests.js` | Fisherman's auction requests CRUD | 🔑 (Fisherman) |
| Auction Requests Review | `auction-requests-review.js` | Auctioneer/Admin approve/reject requests | 🔑 (Auctioneer/Admin) |
| Auctioneer Analytics | `auctioneer-analytics.js` | Dashboard: total auctions, fees, revenue | 🔑 (Auctioneer/Admin) |
| Order Detail | `order-detail.js` | Single order view with cancel | 🔑 |
| Privacy | `privacy.js` | Privacy policy (AR/EN) | ❌ |
| Terms | `terms.js` | Terms & conditions (AR/EN) | ❌ |

### CSS Architecture (`src/css/`)

| File | Purpose |
|------|---------|
| `_variables.css` | CSS custom properties (colors, spacing, radii, typography) |
| `_base.css` | Reset, typography, body styles |
| `_layout.css` | Grid system, containers, navigation, sidebar, hero sections |
| `_components.css` | Cards, buttons, forms, tables, modals, alerts, badges, tabs, auth pages, product grid, detail page, cart, auction, wallet, dashboard, admin, legal, toast, lightbox, empty states, recently viewed |
| `_animations.css` | Keyframe animations (slide, fade, pulse, shimmer, bounce, scale) + intersection observer |
| `_rtl.css` | Right-to-left overrides for Arabic language |
| `style.css` | Imports all partials in order |

### Shared Components (`src/shared/`)

| Component | File | Purpose |
|-----------|------|---------|
| Modal | `components/modal.js` | Reusable modal dialog |
| Toast | `components/toast.js` | Toast notification system |
| Pagination | `components/pagination.js` | Paginated data display |
| Routes | `constants/routes.js` | Route definitions |
| Helpers | `helpers/index.js` | Shared utility functions |
| Errors | `helpers/errors.js` | Error handling helpers |

### Feature Helpers (`src/features/`)

| Module | File | Purpose |
|--------|------|---------|
| Checkout | `checkout/helpers.js` | Address selection, order placement |
| Subscriptions | `subscriptions/helpers.js` | Plan display, upgrade flow |

---

## 🖥️ Back-End Architecture (.NET 10)

### Tech Stack
- **.NET 10** — ASP.NET Core Web API
- **Entity Framework Core** — ORM with SQL Server
- **JWT Bearer** — Authentication
- **SignalR** — Real-time auction updates
- **Serilog** — Logging
- **FluentValidation** — Request validation
- **Swagger** — API documentation
- **Cloudinary** — File/image storage
- **SMTP** — Email service
- **xUnit** — Testing
- **SQL Server** — Database

### Project Layers

**Sayiad.API** — API Layer
- Controllers (REST endpoints)
- Middleware: Exception, InputSanitization, RequestLogging
- Hubs: AuctionHub (SignalR)
- Program.cs: DI registration, middleware pipeline, CORS, auth, rate limiting

**Sayiad.Domain** — Business Logic Layer
- **Managers** — 16 service classes (business logic)
- **Contracts** — Interfaces for managers & infrastructure services
- **Validators** — FluentValidation validators
- **DTOs** — Data transfer objects
- **Common** — Result pattern, InputSanitizer

**Sayiad.Data** — Data Access Layer
- **DbContext** (ApplicationDbContext)
- **Repositories** — EF Core data access
- **Models/Entities** — Database entity classes
- **Migrations** — EF Core migrations

### Entity Model Overview

| Entity | Key Fields | Relationships |
|--------|------------|:---:|
| **User** | Id, FullName, Email, PasswordHash, Phone, Role, IsActive, IsEmailVerified, SubscriptionTier, LicenseNumber | 1→Cart, 1→Wallet, ∞→Products, ∞→Bids, ∞→Orders, ∞→Notifications |
| **Product** | Id, Title, Description, Price, StockQuantity, Condition, Status, IsAuctioned, SellerId | ∞→Images, ∞→CartItems, ∞→OrderItems, ∞→Reviews, ∞→Bids |
| **Category** | Id, Name, Description | ∞→Products |
| **Cart** | Id, UserId | ∞→CartItems |
| **CartItem** | Id, CartId, ProductId, Quantity | |
| **CustomerOrder** | Id, BuyerId, TotalPrice, Status, ShippingAddressId | ∞→OrderItems |
| **OrderItem** | Id, OrderId, ProductId, SellerId, Quantity, UnitPrice, Subtotal | |
| **Payment** | Id, OrderId, Amount, PaymentMethod, PaymentStatus, PaidAt | ∞→Transactions |
| **Auction** | Id, ProductId, CreatedByUserId, StartTime, EndTime, StartingPrice, ReservePrice, MinimumIncrement, CurrentHighestBid, Status, WinnerUserId | ∞→Bids |
| **Bid** | Id, AuctionId, UserId, Amount, IsAutoBid, MaxAutoBidAmount, BidStatus | |
| **AuctionRequest** | Id, FishermanId, ProductTitle, FishType, QuantityKg, EstimatedValue, Status, ReviewedByAuctioneerId, ResultingAuctionId | |
| **Wallet** | Id, UserId, Balance, HeldBalance | ∞→WalletTransactions |
| **WalletTransaction** | Id, WalletId, Amount, Type, ReferenceType, ReferenceId, Description, BalanceSnapshot | |
| **Subscription** | Id, UserId, Tier, StartDate, EndDate, IsActive, PaymentReference | |
| **SubscriptionPlan** | Id, Tier, Name, Description, Price, Currency, BillingCycle, MaxAuctionsPerMonth, MaxBidsPerMonth, MaxAuctionRequestsPerMonth | |
| **Review** | Id, ProductId, UserId, Rating, Comment | |
| **Notification** | Id, UserId, Title, Message, IsRead | |
| **Report** | Id, ReporterId, ProductId, Reason, Status | |
| **SellerProfile** | Id, UserId, StoreName, StoreDescription, AverageRating, TotalSales | |
| **ShippingAddress** | Id, UserId, FullName, Phone, City, AddressLine, PostalCode, IsDefault | |
| **ProductImage** | Id, ProductId, ImageUrl, IsPrimary | |

### Enums

| Enum | Values |
|------|--------|
| **UserRole** | Admin, Fisherman, BaitSeller, Buyer, Auctioneer |
| **ProductStatus** | PendingReview, Available, Sold, Rejected, Deleted |
| **ProductCondition** | New, LikeNew, Good, Fair, Poor |
| **AuctionStatus** | Scheduled, Active, Paused, Finished, Cancelled |
| **AuctionRequestStatus** | Pending, Approved, Rejected |
| **BidStatus** | Valid, Winning, Outbid |
| **CustomerOrderStatus** | Pending, Confirmed, Paid, Shipped, Delivered, Cancelled, Refunded |
| **SubscriptionTier** | Free, Basic, Pro, Enterprise |
| **PaymentStatus** | Pending, Confirmed, Failed, Refunded |

### Managers Overview (16 Services)

| Manager | Responsibility |
|---------|---------------|
| **AuthManager** | Register, Login, RefreshToken, Logout, VerifyEmail, ForgotPassword, ResetPassword, ChangePassword |
| **UserManager** | Get/Update profile, Admin: list/toggle users |
| **ProductManager** | CRUD products, image management, admin approve/reject, 5% product listing hold |
| **AuctionManager** | CRUD auctions, place bids, auto-bid resolution, end auction, auction requests (submit/approve/reject), analytics dashboard |
| **CartManager** | Get cart, add/update/remove items, clear cart |
| **WishlistManager** | Get wishlist, toggle item, remove item |
| **OrderManager** | Create from cart, get user/seller orders, cancel, update status |
| **PaymentManager** | Initiate/confirm payment, wallet settlement (deduct buyer, credit seller 95%, admin 5%) |
| **WalletManager** | Get wallet, deposit, hold/release funds, transfer, deduct for order, credit seller, settle auction, credit platform fee, deduct for subscription, transactions |
| **SubscriptionManager** | Upgrade subscription, get my subscription, admin list all |
| **SubscriptionPlanManager** | CRUD subscription plans |
| **CategoryManager** | CRUD categories |
| **SellerProfileManager** | Create/update profile, get by userId, dashboard |
| **ShippingAddressManager** | CRUD addresses |
| **NotificationManager** | CRUD notifications, mark read |
| **ReviewManager** | Create/delete reviews, get product reviews/rating |
| **ReportManager** | Create report, admin list/resolve |

### Fee Structure

| Fee Type | Percentage | Flow |
|----------|:---------:|------|
| **Product Listing Hold** | 5% of price | Held in seller's wallet, released when product is sold or rejected |
| **E-commerce Order Fee** | 5% of seller subtotal | Buyer pays full price → seller gets 95% → admin wallet gets 5% |
| **Auction Fee** | 5% of winning bid | Winner pays full → seller gets 95% → **auctioneer's** wallet gets 5% |
| **Subscription** | 100% of plan price | Deducted from user wallet → credited to admin wallet |

### Subscription Tiers & Limits

| Feature | Free | Basic | Pro | Enterprise |
|---------|:---:|:-----:|:---:|:----------:|
| Auctions/month | 3 | 10 | 25 | 100 |
| Bids/month | 3 | 15 | 50 | Unlimited |
| Auction Requests/month | 3 | 10 | 25 | 100 |
| Auto-bidding | ❌ | ✅ | ✅ | ✅ |
| Price (EGP) | 0 | 50 | 100 | 250 |

---

## 🔗 API Routes Summary

### Auth (`/api/auth`)
- `POST /register` — Register
- `POST /login` — Login
- `POST /refresh-token` — Refresh JWT
- `POST /logout` — Logout
- `GET /verify-email?token=` — Verify email
- `POST /resend-verification` — Resend verification
- `POST /forgot-password` — Send OTP
- `POST /verify-reset-code` — Verify OTP
- `POST /reset-password` — Reset password (multi-step)
- `PUT /change-password` — Change password (authenticated)

### Users (`/api/users`)
- `GET /profile` — Get my profile
- `PUT /profile` — Update profile
- `GET /` — Admin list
- `GET /{id}` — Admin get by ID
- `PUT /{id}/toggle-status` — Admin toggle active

### Products (`/api/products`)
- `GET /` — List with filters (category, search, price range, condition, status)
- `GET /{id}` — Get by ID (includes images, category, seller)
- `POST /` — Create (authenticated seller)
- `PUT /{id}` — Update (owner only)
- `DELETE /{id}` — Soft delete (owner)
- `POST /{id}/images` — Add image
- `DELETE /{id}/images/{imageId}` — Delete image
- `PUT /{id}/status` — Admin update status
- `GET /pending-review` — Admin get pending
- `POST /{id}/approve` — Admin approve
- `POST /{id}/reject` — Admin reject
- `GET /seller/{sellerId}` — Get by seller

### Categories (`/api/categories`)
- Standard CRUD

### Cart (`/api/cart`)
- `GET /` — Get cart
- `POST /items` — Add item
- `PUT /items/{productId}` — Update quantity
- `DELETE /items/{productId}` — Remove item
- `DELETE /` — Clear cart

### Orders (`/api/orders`)
- `POST /` — Create from cart
- `GET /` — User orders (paginated)
- `GET /seller` — Seller orders
- `GET /{id}` — Order detail
- `PUT /{id}/cancel` — Cancel
- `PUT /{id}/status` — Update status (admin/seller)

### Payments (`/api/payments`)
- `POST /initiate` — Initiate payment
- `POST /{paymentId}/confirm` — Confirm payment
- `GET /order/{orderId}` — Get order payments

### Auctions (`/api/auctions`)
- `GET /` — Active auctions (with filters)
- `GET /{id}` — Auction detail (with bids)
- `POST /` — Create auction
- `POST /{id}/bids` — Place bid
- `POST /{id}/end` — End auction manually
- `GET /dashboard` — Auctioneer dashboard/analytics

### Auction Requests (`/api/auctions/requests`)
- `POST /` — Submit request (fisherman)
- `GET /my` — My requests (fisherman)
- `GET /pending` — Pending requests (auctioneer/admin)
- `POST /{id}/approve` — Approve + create auction (auctioneer)
- `POST /{id}/reject` — Reject (auctioneer)

### Wishlist (`/api/wishlist`)
- `GET /` — Get wishlist
- `POST /toggle` — Toggle item
- `DELETE /{productId}` — Remove

### Wallet (`/api/wallet`)
- `GET /` — Get wallet
- `POST /deposit` — Deposit
- `GET /transactions` — Transaction history (paginated)

### Subscriptions (`/api/subscriptions`)
- `POST /upgrade` — Upgrade subscription (deducts from wallet)
- `GET /my` — My current subscription
- `GET /plans` — List plans
- `GET /` — Admin all subscriptions

### Notifications (`/api/notifications`)
- `GET /` — My notifications
- `GET /unread-count` — Unread count
- `PUT /{id}/read` — Mark read
- `PUT /read-all` — Mark all read

### Reviews (`/api/reviews`)
- `GET /product/{productId}` — Product reviews
- `GET /product/{productId}/rating` — Average rating
- `POST /` — Create review
- `DELETE /{id}` — Delete review

### Reports (`/api/reports`)
- `POST /` — Create report
- `GET /` — Admin list
- `GET /{id}` — Admin get
- `PUT /{id}/resolve` — Admin resolve

### Seller Profile (`/api/seller-profile`)
- `POST /` — Create
- `PUT /` — Update
- `GET /{userId}` — Get by user
- `GET /my` — My profile
- `GET /dashboard` — Seller analytics

### Shipping Addresses (`/api/shippingaddresses`)
- `GET /` — My addresses
- `POST /` — Create
- `DELETE /{id}` — Delete

---

## 🌐 Front-End Routes

| Route | Page | Role |
|-------|------|:----:|
| `#/` | Home | All |
| `#/products` | Products | All |
| `#/product-detail?id=` | Product Detail | All |
| `#/auctions` | Auctions | All |
| `#/auction-detail?id=` | Auction Detail | All |
| `#/login` | Login | Guest |
| `#/register` | Register | Guest |
| `#/forgot-password` | Forgot Password | Guest |
| `#/reset-password?token=` | Reset Password | Guest |
| `#/verify-email?token=` | Verify Email | Guest |
| `#/profile` | Profile | Authenticated |
| `#/cart` | Cart | Customer, Fisherman, BaitSeller, Auctioneer |
| `#/checkout` | Checkout | Customer, Fisherman, BaitSeller, Auctioneer |
| `#/shipping` | Shipping | Customer, Fisherman, BaitSeller, Auctioneer |
| `#/dashboard` | Dashboard | Authenticated |
| `#/order-detail?id=` | Order Detail | Customer, Fisherman, BaitSeller, Auctioneer |
| `#/wallet` | Wallet | All authenticated (Admin read-only) |
| `#/subscriptions` | Subscriptions | Customer, Fisherman, BaitSeller, Auctioneer |
| `#/seller-profile?userId=` | Seller Profile | All |
| `#/auction-requests` | Auction Requests | Fisherman |
| `#/auction-requests-review` | Review Requests | Auctioneer/Admin |
| `#/auctioneer-analytics` | Auctioneer Analytics | Auctioneer/Admin |
| `#/admin` | Admin Panel | Admin |
| `#/privacy` | Privacy | All |
| `#/terms` | Terms | All |

---

## 🎯 Key Architectural Patterns

### Value Flow: E-Commerce Order
```
Buyer Wallet (-100%) → Admin Wallet (5%) → Seller Wallet (95%)
```
- Buyer pays full price via wallet
- 5% platform fee goes to admin wallet (`sayiadapp@gmail.com`)
- 95% goes to seller wallet
- 5% product listing hold released on each item

### Value Flow: Auction Win
```
Winner Wallet (-100%) → Seller Wallet (95%) → Auctioneer Wallet (5%)
```
- Winner's held funds become payment
- Seller gets 95% of winning bid
- Auctioneer (who created the auction) gets 5% fee
- Product status set to Sold

### Value Flow: Subscription
```
User Wallet (-100%) → Admin Wallet (100%)
```
- Plan price deducted from user wallet
- Credited to admin wallet

### Bid Hold System
- Each bid places a **hold** on the bidder's wallet for that amount
- When outbid, the hold is **released**
- When auction ends, the winning bid hold becomes the **payment**
- If no winner (below reserve), all holds released

### Auto-Bid Resolution
- Sequential resolution (max 20 iterations)
- Finds user with highest max-auto-bid
- Places minimum increment above current highest bid
- Runs after each manual bid placement

### Concurrency
- `PlaceBidAsync` has retry loop (3 attempts) for `DbUpdateConcurrencyException`
- Each retry reloads auction state from database
- EndAuctionAsync runs inside a transaction

### Security & Validation
- JWT authentication + Bearer tokens
- Rate limiting on auth endpoints (10 req/min)
- Input sanitization middleware
- Request logging middleware
- Exception middleware
- FluentValidation on all requests
- InputSanitizer to prevent XSS
- SHA256 token hashing for verification tokens
- SQL Server with parameterized EF Core queries

### Multi-Language Support
- Custom `t()` function for translations
- Arabic (RTL) and English (LTR) support
- `dir="rtl"` attribute switching
- Separate `_rtl.css` stylesheet
- Language stored in Alpine store

### Realtime
- SignalR hub at `/hubs/auction`
- Used for live bid updates on auction detail page

---

## ✅ Current State (As of May 25, 2026)

### Implemented Features
- ✅ User registration, login, email verification, password reset (multi-step), profile management
- ✅ Role-based access: Admin, Fisherman, BaitSeller, Buyer, Auctioneer
- ✅ Product CRUD with images, categories, admin review/approve/reject
- ✅ Shopping cart (add/remove/update/clear)
- ✅ Wishlist (toggle)
- ✅ Order creation from cart, order management, cancellation
- ✅ Payment initiation/confirmation with full wallet settlement
- ✅ Wallet system: deposit, holds, releases, transfers, transactions
- ✅ Subscription plans (Free/Basic/Pro/Enterprise) with tiered limits
- ✅ Subscription upgrade via wallet payment
- ✅ Subscriptions system: admin CRUD plans, user upgrade via wallet
- ✅ Auction system: create, bid, auto-bid, end, winner determination
- ✅ Auction requests: fishermen submit, auctioneers approve/reject
- ✅ Auctioneer analytics dashboard
- ✅ Seller profiles with ratings and sales tracking
- ✅ Shipping addresses CRUD
- ✅ Product reviews and ratings
- ✅ Report system for flagging products
- ✅ Notifications (in-app) with email
- ✅ Multi-language (Arabic/English with RTL support)
- ✅ Admin panel: user management, product review, reports, categories, subscription plans
- ✅ PWA service worker
- ✅ i18n system
- ✅ Real-time auction updates via SignalR
- ✅ Product listing hold (5% of price)
- ✅ E-commerce order fee (5% to admin)
- ✅ Auction fee (5% to auctioneer)
- ✅ Subscription payment via wallet
- ✅ Fee tracking in wallet transactions (PlatformFee type)
- ✅ Admin wallet for platform fee collection

### Known Gaps / Potential Improvements
- ⬜ No unit tests for many managers (only a few exist)
- ⬜ No CI/CD pipeline visible
- ⬜ No Docker configuration
- ⬜ Some i18n strings may be missing for newer features
- ⬜ No image upload component UI (uses URL input)
- ⬜ No email template customization beyond inline HTML
- ⬜ No admin dashboard analytics (only auctioneer analytics exists)

---

## 📝 Test Coverage (`Sayiad.Tests`)

| Test File | Type | Tests |
|-----------|------|:-----:|
| `AuctionConcurrencyTests` | Integration | Concurrent bid attempts |
| `AuctionQuotaTests` | Unit | Monthly auction/bid limits |
| `AuthManagerTests` | Unit | Registration, login, verification |
| `ForgotPasswordTests` | Unit | Password reset flow |
| `PaymentManagerTests` | Unit | Payment initiation/confirmation |
| `ProductManagerTests` | Unit | Product CRUD, holds |
| `SubscriptionManagerTests` | Unit | Upgrade, limits |
| `WalletManagerTests` | Unit | Deposit, holds, transfers |

---

## 📦 External Services

| Service | Use | Configuration |
|---------|:---:|:-------------:|
| **SQL Server** | Database | Connection string in `appsettings.json` |
| **Cloudinary** | Image storage | API keys in config |
| **SMTP** | Email sending | SMTP settings in config |
| **Vercel** | Front-end hosting | `vercel.json`, CORS to `saiyad-eg.vercel.app` |
| **GitHub** | Source control | Not explicitly configured |
