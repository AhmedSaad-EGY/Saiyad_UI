# 🐟 Sayiad — Full Platform Documentation

> **Egypt's premier fishing marketplace & live auction platform**
> Live: [https://saiyad-eg.vercel.app](https://saiyad-eg.vercel.app)
> API: [https://sayiad.runasp.net/swagger/index.html](https://sayiad.runasp.net/swagger/index.html)

---

## Table of Contents

1. [Platform Overview](#-platform-overview)
2. [Tech Stack](#-tech-stack)
3. [All Features](#-all-features)
4. [User Roles](#-user-roles)
5. [Permission Matrix](#-permission-matrix)
6. [Route Access Matrix](#-route-access-matrix)
7. [User Flows](#-user-flows-by-role)
8. [Auth Flow](#-authentication-flow)
9. [Real-Time Auction Flow](#-real-time-auction-flow)
10. [Admin Panel Flow](#-admin-panel-flow)
11. [Project Structure](#-project-structure)

---

## 🌊 Platform Overview

**Sayiad** (صياد — Arabic for "Fisherman") is a full-featured marketplace connecting fishermen, bait sellers, auctioneers, and buyers across Egypt. The platform offers:

- A **product marketplace** for buying and selling fishing equipment and fresh catch
- A **live auction system** with real-time bidding powered by SignalR WebSockets
- **Role-based access control** across five user roles
- A **bilingual interface** supporting English (LTR) and Arabic (RTL) with one-click switching
- **PWA support** with service worker caching for offline-capable app shell
- **Wallet system** with deposits, holds, and transaction history
- **Subscription tiers** with quota management (bids, auctions, requests per month)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JavaScript ES2022+, Alpine.js, hash-based SPA routing |
| **Styling** | Pure CSS3 with OKLCH design tokens, glassmorphism, dark/light mode |
| **Backend** | ASP.NET Core Web API (C#) |
| **Auth** | JWT (60min access token + 7-day refresh token) |
| **Real-time** | SignalR WebSockets for live auction bidding |
| **Database** | SQL Server |
| **i18n** | English + Arabic (RTL), ~470 keys per language |
| **PWA** | Service worker with cache-first strategy |
| **Icons** | Font Awesome 6.5 Free |
| **Fonts** | Inter (EN), Syne (headings), Cairo (AR) |
| **Hosting** | Frontend on Vercel, API on sayiad.runasp.net |

---

## ✨ All Features

### 🛒 Marketplace

| Feature | Details |
|---------|---------|
| **Product Listings** | Image gallery, condition badges, stock tracking, location |
| **Category Filtering** | Browse by category dropdown |
| **Condition Tabs** | New, Like New, Good, Fair |
| **Price Sorting** | Price low-to-high, high-to-low, newest first |
| **Full-Text Search** | Debounced search with URL param persistence |
| **In-Stock Toggle** | Filter to show only in-stock items |
| **Product Detail** | Breadcrumb, image lightbox, seller info, similar products |
| **Cart Management** | Quantity steppers, remove, clear all, floating mobile bar |
| **Wishlist** | Toggle heart button, dedicated dashboard tab |
| **Saved Addresses** | CRUD shipping addresses with set-default |
| **Checkout** | Address selection/creation, shipping method, payment method, wallet balance check |
| **Order Tracking** | Order timeline, status badges, cancel pending orders |
| **Product Reviews** | Star rating selector, comment, delete own reviews |

### 🔨 Live Auctions

| Feature | Details |
|---------|---------|
| **Auction Listing** | Grid with status filter (Active/Finished/Cancelled) |
| **Countdown Timer** | Live setInterval countdown, urgency pulse under 1 hour |
| **Real-Time Bidding** | SignalR WebSockets — no page refresh needed |
| **Bid Slider** | Draggable range input synced with number input |
| **Quick-Bid Buttons** | +5%, +10%, fixed increment |
| **Auto-Bid** | Set max amount, auto-bid up to limit |
| **Bid History** | Table with green highlight on new bids, flash animation |
| **Winner Announcement** | Confetti burst + toast on auction end |
| **Auction Requests** | Fishermen submit, Auctioneers approve/reject |
| **Analytics Dashboard** | Total auctions, active/finished counts, total bids, revenue |

### 👤 User Accounts

| Feature | Details |
|---------|---------|
| **Registration** | 3-step wizard with role selection, password strength meter |
| **Login** | Email + password, remember me, forgot password link |
| **JWT Auth** | Silent refresh on 401, in-memory token cache |
| **Email Verification** | Verify token overlay, auto-redirect on success |
| **Forgot Password** | 3-step flow: email → OTP → new password |
| **Password Strength** | 5-criteria meter on register + reset |
| **Profile Page** | Avatar upload, stats, quick links |
| **Notification Bell** | Live unread badge with 60s polling |
| **Recently Viewed** | localStorage tracking (12 items max) |

### 💰 Wallet & Payments

| Feature | Details |
|---------|---------|
| **Wallet Balance** | Total, held, available balance display |
| **Deposit** | Amount input + deposit button |
| **Transaction History** | Paginated table with type icons & labels |
| **Held Funds** | Funds held during active bids, released on outbid/loss |
| **Platform Fees** | Auctioneer fee tracking, subscription payments |
| **Wallet-Aware Checkout** | Checks balance before placing order |

### 📦 Subscriptions

| Feature | Details |
|---------|---------|
| **Plan Cards** | Feature comparison, "Most Popular" badge |
| **Role-Based Messaging** | Different heading/desc per role (Customer/Auctioneer/Seller) |
| **Quota Limits** | Monthly limits on bids, auctions, requests |
| **Upgrade Flow** | Disable button if insufficient wallet balance |
| **Admin Plan Management** | CRUD subscription plans from admin panel |

### 🎨 UI/UX

| Feature | Details |
|---------|---------|
| **Dark/Light Mode** | Smooth transition, persisted preference |
| **RTL Support** | Full Arabic layout — logical CSS properties |
| **Mobile-First** | Responsive at 480px, 768px, 1024px, 1280px breakpoints |
| **Skeleton Loaders** | 6 types: page, card, detail, table, form, auth |
| **Toast Notifications** | Slide-in, auto-dismiss, max 3 visible, close button |
| **Confetti** | 60-particle canvas burst on order placed & auction won |
| **Canvas Background** | Animated underwater scene — fish, kelp, bubbles, light rays |
| **Gold Theme** | Gold-tinted UI for seller roles (Fisherman, BaitSeller, Auctioneer) |
| **Route Transitions** | Scale+fade enter/leave cross-fade animations |
| **Pull-to-Refresh** | Mobile gesture on home, products, auctions |
| **Swipe-to-Delete** | Touch gesture on cart items (mobile) |
| **Filter Bottom Sheet** | Slide-up panel on mobile for products/auctions filters |
| **Dashboard Bottom Bar** | Fixed bottom tab bar on mobile |

### ♿ Accessibility

| Feature | Details |
|---------|---------|
| Skip-to-content link | Keyboard navigation with visible focus rings |
| ARIA live regions | For toast notifications & route changes |
| Focus trap | In modals, lightbox, confirm dialogs |
| Reduced motion support | `prefers-reduced-motion` + manual toggle |
| Semantic HTML | `<nav>`, `<main>`, `<section>`, `<footer>` throughout |

### 🌐 Internationalization

| Feature | Details |
|---------|---------|
| English (LTR) | Default language |
| Arabic (RTL) | One-click switch, full layout flip |
| ~470 Keys/Language | All UI strings translated |
| `data-i18n` Attributes | Static text auto-update on language switch |

### 📱 PWA

| Feature | Details |
|---------|---------|
| Service Worker | `sayiad-v10`, 37 precached assets |
| Cache-First | Static assets (CSS, JS, images, fonts) |
| Network-First | Navigation (HTML) |
| Network-Only | API calls bypass cache |
| Update Notification | Broadcast channel for SW updates |

---

## 👥 User Roles

### 1. Customer (`Customer`)
**The default buyer role.** Anyone can register as a Customer.

- **Can:** Browse products & auctions, buy, bid, manage cart/wishlist/orders, write reviews, use subscriptions
- **Cannot:** Create products, start auctions, manage seller profile
- **Registration:** Self-register (no extra fields required)

---

### 2. Fisherman (`Fisherman`)
**A seller of fresh catch & fishing gear.**

- **Can:** All Customer abilities + create/manage products, manage seller profile, submit auction requests for Auctioneer review
- **Cannot:** Start auctions directly, place bids
- **Registration:** Self-register — requires **Fishing License Number**
- **UI:** Gold-themed dashboard, `data-user-role="seller"` CSS attribute

---

### 3. BaitSeller (`BaitSeller`)
**A seller of bait & tackle products.**

- **Can:** All Customer abilities + create/manage products, manage seller profile
- **Cannot:** Start auctions, place bids, submit auction requests
- **Registration:** Self-register
- **UI:** Gold-themed dashboard

---

### 4. Auctioneer (`Auctioneer`)
**A licensed auction operator who manages live auctions.**

- **Can:** Start/manage auctions, approve/reject Fisherman auction requests, view auctioneer analytics dashboard
- **Cannot:** Buy products, use cart, place bids, manage seller profile
- **Registration:** Self-register
- **UI:** Gold-themed dashboard

---

### 5. Admin (`Admin`)
**Platform administrator with full control.**

- **Can:** Everything — manage users (suspend/activate), manage all products (approve/reject), manage orders (update status), manage categories (CRUD), manage reports (view/resolve), manage subscription plans, view revenue, end auctions
- **Cannot:** Self-register — accounts are seeded manually in the database
- **UI:** Exclusive Admin panel tab in navbar + dashboard

---

## 🔐 Permission Matrix

| Feature | Admin | Fisherman | BaitSeller | Auctioneer | Customer |
|---------|:-----:|:---------:|:----------:|:----------:|:--------:|
| **Browse & Discover** | | | | | |
| Browse products | ✅ | ✅ | ✅ | ✅ | ✅ |
| Browse auctions | ✅ | ✅ | ✅ | ✅ | ✅ |
| View seller profiles | ✅ | ✅ | ✅ | ✅ | ✅ |
| View categories | ✅ | ✅ | ✅ | ✅ | ✅ |
| View reviews & ratings | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Account & Auth** | | | | | |
| Register / Login / Logout | — | ✅ | ✅ | ✅ | ✅ |
| Manage own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Change password | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Shopping** | | | | | |
| Place orders | ✅ | ✅ | ✅ | ❌ | ✅ |
| Cancel own pending orders | ✅ | ✅ | ✅ | ❌ | ✅ |
| Manage cart | ✅ | ✅ | ✅ | ❌ | ✅ |
| Manage wishlist | ✅ | ✅ | ✅ | ❌ | ✅ |
| Manage shipping addresses | ✅ | ✅ | ✅ | ❌ | ✅ |
| Write product reviews | ✅ | ✅ | ✅ | ❌ | ✅ |
| File reports | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Wallet & Payments** | | | | | |
| View wallet balance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Deposit funds | ✅ | ✅ | ✅ | ✅ | ✅ |
| View transaction history | ✅ | ✅ | ✅ | ✅ | ✅ |
| **General** | | | | | |
| Manage notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload files / images | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upgrade subscription | ✅ | ✅ | ✅ | ✅ | ✅ |
| Connect to SignalR auction hub | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Product Management** | | | | | |
| Create / Edit / Delete products | ❌ | ✅ | ✅ | ✅ | ❌ |
| View own products | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Seller Profile** | | | | | |
| Create / Edit seller profile | ❌ | ✅ | ✅ | ❌ | ❌ |
| View own seller dashboard | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Auctions** | | | | | |
| Submit auction requests | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve / Reject auction requests | ❌ | ❌ | ❌ | ✅ | ❌ |
| Start an auction | ❌ | ❌ | ❌ | ✅ | ❌ |
| End an auction | ✅ | ❌ | ❌ | ✅ | ❌ |
| Place a bid | ✅ | ❌ | ❌ | ❌ | ✅ |
| **View Analytics** | | | | | |
| Auctioneer analytics dashboard | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Admin Only** | | | | | |
| Manage all users (list, toggle status) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Moderate product status (approve/reject) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update order status | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage categories (CRUD) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage reports (view, resolve) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage subscription plans (CRUD) | ✅ | ❌ | ❌ | ❌ | ❌ |
| View platform revenue | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🗺 Route Access Matrix

| Page / Route | Admin | Fisherman | BaitSeller | Auctioneer | Customer |
|--------------|:-----:|:---------:|:----------:|:----------:|:--------:|
| Home (`#/`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Products (`#/products`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Product Detail (`#/product-detail?id=`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auctions (`#/auctions`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auction Detail (`#/auction-detail?id=`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Seller Profile (`#/seller-profile?userId=`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cart (`#/cart`) | ✅ | ✅ | ✅ | ❌ | ✅ |
| Checkout (`#/checkout`) | ✅ | ✅ | ✅ | ❌ | ✅ |
| Orders (`#/order-detail?id=`) | ✅ | ✅ | ✅ | ❌ | ✅ |
| Profile (`#/profile`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Shipping (`#/shipping`) | ✅ | ✅ | ✅ | ❌ | ✅ |
| Subscriptions (`#/subscriptions`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wallet (`#/wallet`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard (`#/dashboard`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| — Overview tab | ✅ | ✅ | ✅ | ✅ | ✅ |
| — Orders tab | ✅ | ✅ | ✅ | ❌ | ✅ |
| — Wishlist tab | ✅ | ✅ | ✅ | ❌ | ✅ |
| — Notifications tab | ✅ | ✅ | ✅ | ✅ | ✅ |
| — My Products tab | ❌ | ✅ | ✅ | ✅ | ❌ |
| — Auctions tab (start/manage) | ❌ | ❌ | ❌ | ✅ | ❌ |
| — Auction Requests (submit) | ❌ | ✅ | ❌ | ❌ | ❌ |
| — Auction Requests Review | ❌ | ❌ | ❌ | ✅ | ❌ |
| — Auctioneer Analytics | ❌ | ❌ | ❌ | ✅ | ❌ |
| Admin Panel (`#/admin`) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Login / Register / Forgot Password | ✅ | ✅ | ✅ | ✅ | ✅ |
| Terms / Privacy | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🚶 User Flows by Role

### 👤 Customer Flow

```
                         START
                           │
                    ┌──────▼──────┐
                    │   Landing   │
                    │    Page     │
                    │  (#/home)   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼────┐ ┌────▼────┐ ┌─────▼──────┐
     │   Browse    │ │ Browse  │ │  Register  │
     │  Products   │ │Auctions │ │  / Login   │
     └──────┬──────┘ └────┬────┘ └──────┬─────┘
            │             │             │
     ┌──────▼──────┐ ┌────▼────┐       │
     │  Product    │ │ Auction │       │
     │  Detail     │ │ Detail  │       │
     └──────┬──────┘ └────┬────┘       │
            │             │            │
     ┌──────▼──────┐      │     ┌──────▼──────┐
     │ Add to Cart │      │     │  Profile    │
     │ or Wishlist │      │     │  Settings   │
     └──────┬──────┘      │     └──────┬──────┘
            │             │            │
     ┌──────▼──────┐ ┌────▼────┐      │
     │   Cart      │ │ Place   │      │
     │  (#/cart)   │ │ Bid     │      │
     └──────┬──────┘ └────┬────┘      │
            │             │            │
     ┌──────▼──────┐      │     ┌──────▼──────┐
     │  Checkout   │ ┌────▼────┐│  Dashboard  │
     │ (#/checkout)│ │  Win    ││  ┌─Overview  │
     └──────┬──────┘ │  🎉     ││  ├─Orders    │
            │        └─────────┘│  └─Wishlist  │
     ┌──────▼──────┐            └──────────────┘
     │   Order     │
     │   Detail    │
     │  (#/order-  │
     │  detail)    │
     └──────┬──────┘
            │
     ┌──────▼──────┐
     │  Write      │
     │  Review     │
     └─────────────┘
```

**Detailed Customer Flow:**

1. **Discovery**
   - Visit Home → Browse featured products & active auctions
   - Search for products by keyword
   - Filter by category, condition, price, in-stock
   - View product detail with image gallery, description, seller info

2. **Purchase**
   - Add product to cart with quantity
   - View cart with summary & quantity adjustments
   - Proceed to checkout
   - Select or create shipping address
   - Choose payment method (Credit Card / Cash on Delivery)
   - System checks wallet balance if applicable
   - Place order → navigated to order detail

3. **Auctions**
   - Browse active auctions with countdown timers
   - View auction detail with bid history
   - Place bids manually or set auto-bid max
   - Receive real-time updates via SignalR
   - Win auction → confetti + notification → pay via wallet

4. **Account Management**
   - View profile with avatar, stats, quick links
   - Manage shipping addresses
   - View order history
   - Manage wishlist
   - Change password
   - Upgrade subscription for more bids

---

### 🎣 Fisherman Flow

```
                         START
                           │
                    ┌──────▼──────┐
                    │   Register  │
                    │  (with      │
                    │  License #) │
                    └──────┬──────┘
                           │
              ┌────────────┼─────────────────┐
              │            │                  │
     ┌────────▼────┐ ┌────▼────┐     ┌───────▼──────┐
     │  Create     │ │  Browse │     │   Dashboard  │
     │  Seller     │ │Products/│     │  ┌─Overview   │
     │  Profile    │ │Auctions │     │  ├─Orders     │
     └──────┬──────┘ └─────────┘     │  ├─Products   │
            │                        │  ├─Auction    │
     ┌──────▼──────┐                 │  │  Requests  │
     │  Create     │                 │  └─Wishlist   │
     │  Products   │                 └──────┬────────┘
     └──────┬──────┘                        │
            │                               │
     ┌──────▼──────┐                 ┌──────▼────────┐
     │  Receive    │                 │  Submit       │
     │  Orders     │                 │  Auction      │
     │  & Fulfill  │                 │  Request      │
     └─────────────┘                 └──────┬────────┘
                                            │
                                     ┌──────▼────────┐
                                     │  Wait for     │
                                     │  Auctioneer   │
                                     │  Approval     │
                                     └──────┬────────┘
                                            │
                              ┌─────────────┼─────────────┐
                              │             │             │
                     ┌────────▼───┐  ┌──────▼──────┐  ┌───▼────────┐
                     │ Approved   │  │  Rejected   │  │  Pending   │
                     │ → Auction  │  │  (see       │  │  (waiting) │
                     │   Goes     │  │  reason)    │  │            │
                     │   Live     │  └─────────────┘  └────────────┘
                     └────────────┘
```

**Detailed Fisherman Flow:**

1. **Onboarding**
   - Register with Fishing License Number
   - Create seller profile (store info, description, contact)
   - Gold-themed UI activates

2. **Selling Products**
   - Create product listings with images, condition, price, stock
   - Products start as `PendingReview` (admin moderation)
   - Track product status (Pending → Approved → Available)
   - Receive customer orders → fulfill shipments

3. **Auction Requests**
   - Submit auction request for a product (title, description, fish type, quantity, estimated value, catch location/date, image)
   - Track request status: Pending → Approved/Rejected
   - If approved → Auctioneer starts the auction
   - If rejected → View rejection reason

4. **Dashboard**
   - Overview: stats cards (products, orders, requests)
   - My Products: manage listings, view status badges
   - Auction Requests: submit new, track existing
   - Orders: incoming orders from customers
   - Wishlist: monitor bookmarked items

---

### 🪱 BaitSeller Flow

```
                         START
                           │
                    ┌──────▼──────┐
                    │   Register  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────────┐
              │            │                 │
     ┌────────▼────┐ ┌────▼────┐    ┌───────▼──────┐
     │  Create     │ │  Browse │    │  Dashboard   │
     │  Seller     │ │Products/│    │  ┌─Overview   │
     │  Profile    │ │Auctions │    │  ├─Orders     │
     └──────┬──────┘ └─────────┘    │  ├─Products   │
            │                       │  └─Wishlist   │
     ┌──────▼──────┐                └──────┬────────┘
     │  Create     │                       │
     │  Products   │                       │
     └──────┬──────┘                       │
            │                              │
     ┌──────▼──────┐                       │
     │  Receive    │                       │
     │  Orders     │                       │
     │  & Fulfill  │                       │
     └─────────────┘                       │
```

**Detailed BaitSeller Flow:**

1. **Onboarding**
   - Register → Create seller profile
   - Gold-themed UI activates

2. **Selling Products**
   - Create bait & tackle product listings
   - Manage inventory, pricing, images
   - Receive orders → fulfill shipments

3. **Dashboard**
   - Same as Fisherman but **no Auction Requests tab**
   - Focus on product management and order fulfillment

---

### 🔨 Auctioneer Flow

```
                         START
                           │
                    ┌──────▼──────┐
                    │   Register  │
                    │(Auctioneer) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Dashboard  │
                    │  ┌─Overview │
                    │  ├─Auctions │
                    │  ├─Requests │
                    │  │  Review  │
                    │  ├─Analytics│
                    │  └─Wishlist │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼────┐ ┌────▼────┐ ┌─────▼──────┐
     │  Review     │ │  Start  │ │  View      │
     │  Fisherman  │ │  Auction│ │  Analytics │
     │  Requests   │ └────┬────┘ └─────┬──────┘
     └──────┬──────┘      │            │
            │             │            │
     ┌──────▼──────┐      │            │
     │ Approve or  │      │            │
     │ Reject with │      │            │
     │ Reason      │      │            │
     └─────────────┘      │            │
                          │            │
                    ┌─────▼────┐       │
                    │  Monitor │       │
                    │  Live    │       │
                    │  Bidding │       │
                    └─────┬────┘       │
                          │            │
                    ┌─────▼────┐       │
                    │  End     │       │
                    │  Auction │       │
                    │  → Winner│       │
                    └──────────┘       │
```

**Detailed Auctioneer Flow:**

1. **Request Management**
   - View incoming auction requests from Fishermen
   - Filter by status: Pending / Approved / Rejected / All
   - **Approve**: Set start time (min 1h from now), optional end time
   - **Reject**: Provide reason (required)

2. **Auction Operations**
   - Start new auctions (schedule start/end time)
   - Monitor live bidding in real-time
   - End auctions manually when needed
   - Winner automatically determined

3. **Analytics**
   - Stats cards: Total Auctions, Active, Finished, Total Bids, Total Fees Earned
   - Recent auctions table
   - Fee income history

4. **Dashboard**
   - Auctions tab: manage your auctions
   - Auction Requests Review: approve/reject workflow
   - Auctioneer Analytics: performance metrics

---

### 👑 Admin Flow

```
                         START
                           │
                    ┌──────▼──────┐
                    │   Login     │
                    │(seeded acct)│
                    └──────┬──────┘
                           │
                    ┌──────▼─────────────────────┐
                    │     Admin Panel (#/admin)   │
                    │                             │
                    │  ┌─────────────────────┐    │
                    │  │ Tab Navigation      │    │
                    │  │ Users │ Reports │    │    │
                    │  │ Products │ Orders │   │    │
                    │  │ Categories │ Plans │  │    │
                    │  │ Revenue             │    │    │
                    │  └─────────────────────┘    │
                    └─────────────────────────────┘
                           │
              ┌────────────┼────────────┬───────────┬───────────┐
              │            │            │           │           │
     ┌────────▼────┐ ┌────▼────┐ ┌─────▼──────┐ ┌──▼───┐ ┌────▼────┐
     │  Users      │ │ Products│ │  Orders    │ │Cats  │ │ Reports │
     │  Tab        │ │ Tab     │ │  Tab       │ │Tab   │ │ Tab     │
     │             │ │         │ │            │ │      │ │         │
     │ List all    │ │Pending  │ │List all    │ │Add   │ │View &   │
     │ users       │ │review   │ │orders      │ │delete│ │resolve   │
     │ Suspend/    │ │Approve  │ │Update      │ │cats  │ │reports   │
     │ activate    │ │Reject   │ │status      │ │      │ │         │
     └─────────────┘ └─────────┘ └────────────┘ └──────┘ └─────────┘

     ┌────────────┐ ┌─────────┐
     │  Plans     │ │ Revenue │
     │  Tab       │ │ Tab     │
     │            │ │         │
     │ Add/edit   │ │Fees from│
     │ delete     │ │auctions │
     │ plans      │ │+ subs   │
     └────────────┘ └─────────┘
```

**Detailed Admin Flow:**

1. **User Management**
   - View all users in paginated table
   - Toggle user active/suspended status
   - Can't self-register; accounts seeded manually

2. **Product Moderation**
   - View pending products awaiting review
   - **Approve** product → status becomes Available
   - **Reject** product → provide reason, seller can see it
   - Delete any product

3. **Order Management**
   - View all orders
   - Update order status (Processing, Shipped, Delivered, etc.)

4. **Category Management**
   - Add new categories
   - Delete existing categories

5. **Subscription Plan Management**
   - View all subscription plans in table
   - Edit plan details (name, price, features, limits)
   - Delete plans
   - Add new plans

6. **Report Management**
   - View user-submitted reports
   - Mark reports as resolved

7. **Revenue Dashboard**
   - View platform earnings from auctioneer fees
   - View subscription payment income
   - Wallet balance overview

8. **Additional Powers**
   - End any auction
   - Place bids (as Customer)
   - View all content unrestricted

---

## 🔐 Authentication Flow

```
                    ┌─────────────────────────────┐
                    │       Register               │
                    │  POST /api/auth/register     │
                    │  Choose role from dropdown:  │
                    │  • Customer (default)        │
                    │  • Fisherman (+ License #)   │
                    │  • BaitSeller                │
                    │  • Auctioneer                │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │         Login                │
                    │  POST /api/auth/login        │
                    │  → accessToken (60 min)      │
                    │  → refreshToken (7 days)     │
                    │  → user object (role, info)  │
                    └─────────────┬───────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
         ┌────▼────┐        ┌─────▼─────┐       ┌─────▼─────┐
         │ Public  │        │  API Call │       │  Logout   │
         │ Pages   │        │  Returns  │       │  POST     │
         │ (no     │        │  401      │       │  /auth/   │
         │  auth)  │        │           │       │  logout   │
         └─────────┘        └─────┬─────┘       └─────┬─────┘
                                  │                   │
                           ┌──────▼──────┐      ┌─────▼─────┐
                           │  Silent     │      │  Clear    │
                           │  Refresh    │      │  tokens   │
                           │  POST       │      │  & user   │
                           │  /auth/     │      │  from     │
                           │  refresh    │      │  localStorage│
                           └──────┬──────┘      └───────────┘
                                  │
                     ┌────────────▼────────────┐
                     │  Retry Original Request │
                     │  with new accessToken   │
                     └────────────┬────────────┘
                                  │
                     ┌────────────▼────────────┐
                     │  If refresh fails too:  │
                     │  → Navigate to #/login  │
                     │  → Clear all auth data  │
                     └─────────────────────────┘
```

**Token Storage:**
- `accessToken` & `refreshToken` in `localStorage`
- Access token also cached in-memory for immediate reads
- JWT payload parsed for role extraction (multiple claim formats supported)

**Session Management:**
- 60s polling for unread notification count
- Cart badge auto-updated on cart changes
- Events: `auth:logged-out`, `auth:session-expired`, `cart-updated`

---

## 🔄 Real-Time Auction Flow

```
                    ┌─────────────────────────────┐
                    │   User opens Auction Detail  │
                    │   #/auction-detail?id=123    │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │   SignalR Connection         │
                    │   Joins group "auction-123"  │
                    └─────────────┬───────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
         ┌────▼────┐        ┌─────▼─────┐       ┌─────▼─────┐
         │ Bid     │        │ Auto-Bid  │       │ Timer     │
         │ Slider  │        │ Toggle    │       │ Countdown │
         │ + Input │        │ + Max     │       │ Live      │
         └────┬────┘        │ Amount    │       │ Update    │
              │             └─────┬─────┘       └───────────┘
         ┌────▼────┐             │
         │ Quick   │             │
         │ Bid:    │             │
         │ +5%     │             │
         │ +10%    │             │
         │ +Fixed  │             │
         └────┬────┘             │
              │                  │
              └────────┬─────────┘
                       │
              ┌────────▼─────────┐
              │  SignalR:        │
              │  placeBid(       │
              │   auctionId,     │
              │   amount,        │
              │   maxAutoBid)    │
              └────────┬─────────┘
                       │
              ┌────────▼─────────┐
              │  Server validates│
              │  • Is auction    │
              │    active?       │
              │  • Is bid >      │
              │    current?      │
              │  • Does user     │
              │    have wallet   │
              │    balance?      │
              │  • Is user not   │
              │    the seller?   │
              └────────┬─────────┘
                       │
              ┌────────▼─────────┐
              │  On Success:     │
              │  SignalR emits:  │
              │  BidPlaced       │
              │  → All group     │
              │    members       │
              │    receive event │
              └────────┬─────────┘
                       │
              ┌────────▼─────────┐
              │  Client receives │
              │  BidPlaced:       │
              │  • Price flash   │
              │    animation     │
              │  • Bid history   │
              │    green glow    │
              │  • Toast:        │
              │    "You've been  │
              │     outbid!"     │
              │    OR            │
              │    "Bid placed!" │
              └────────┬─────────┘
                       │
              ┌────────▼─────────┐
              │  On Auction End: │
              │  SignalR emits:  │
              │  AuctionEnded    │
              │  → Winner: 🎉   │
              │    confetti      │
              │  → Losers:       │
              │    "Auction      │
              │     ended" toast │
              └──────────────────┘
```

---

## 🖥 Admin Panel Flow

```
                    ┌─────────────────────────────┐
                    │    Admin Panel (#/admin)     │
                    │    Role-gated: Admin only    │
                    └─────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────┐
  │                        TABS                                  │
  │                                                              │
  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
  │ │  Users   │ │ Products │ │  Orders  │ │Categories│  ...   │
  │ │  🧑      │ │  📦      │ │  📋      │ │  🏷️      │       │
  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
  │ ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
  │ │ Reports  │ │  Plans   │ │ Revenue  │                     │
  │ │  ⚠️      │ │  💎      │ │  💰      │                     │
  │ └──────────┘ └──────────┘ └──────────┘                     │
  └─────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  USERS TAB                                                     │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Table: ID | Name | Email | Role | Status | Actions   │    │
│  │  ─────────────────────────────────────────────────── │    │
│  │  #1 | Ahmed | a@b.com | Fisherman | ✅ Active | 🔄  │    │
│  │  #2 | Mona  | m@b.com | Customer  | ❌ Suspended | 🔄│    │
│  │  ... paginated (20/page)                              │    │
│  └───────────────────────────────────────────────────────┘    │
│  Action: Toggle user active/suspended status                  │
├───────────────────────────────────────────────────────────────┤
│  PRODUCTS TAB                                                  │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Sub-tab: Pending Review | All Products               │    │
│  │                                                        │    │
│  │  Pending: List of products awaiting admin approval     │    │
│  │  Action: ✅ Approve | ❌ Reject (with reason)          │    │
│  │                                                        │    │
│  │  All: Full product list with status badges             │    │
│  │  Action: Delete product                                │    │
│  └───────────────────────────────────────────────────────┘    │
├───────────────────────────────────────────────────────────────┤
│  ORDERS TAB                                                    │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Table: ID | Customer | Total | Status | Date | ...   │    │
│  │  Action: Update order status dropdown                 │    │
│  └───────────────────────────────────────────────────────┘    │
├───────────────────────────────────────────────────────────────┤
│  CATEGORIES TAB                                                │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Table: Name | Actions                                 │    │
│  │  Action: ❌ Delete (with confirm)                      │    │
│  │  Form: Add new category (name input + button)          │    │
│  └───────────────────────────────────────────────────────┘    │
├───────────────────────────────────────────────────────────────┤
│  REPORTS TAB                                                   │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Table: ID | Reporter | Type | Description | Status    │    │
│  │  Action: ✅ Mark as Resolved                           │    │
│  └───────────────────────────────────────────────────────┘    │
├───────────────────────────────────────────────────────────────┤
│  PLANS TAB                                                     │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Table: Name | Price | Features | Bids | Actions      │    │
│  │  Action: ✏️ Edit | ❌ Delete | ➕ Add New Plan          │    │
│  │  Edit Modal: name, price, currency, features, limits   │    │
│  └───────────────────────────────────────────────────────┘    │
├───────────────────────────────────────────────────────────────┤
│  REVENUE TAB                                                   │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Stat Cards: Total Fees | Auction Fees | Sub Payments  │    │
│  │  Table: Fee income with date, amount, description     │    │
│  └───────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Front-end/
├── index.html                   # Entry point — shell HTML
├── vercel.json                  # Vercel SPA rewrite rules
├── sw.js                        # Service Worker (PWA)
├── css/
│   └── style.css                # ~5,000 line design system
├── src/
│   ├── core/
│   │   ├── api/
│   │   │   ├── client.js        # Fetch wrapper — JWT, refresh, errors
│   │   │   └── config.js        # API base URL, SignalR URL
│   │   ├── app.js               # App entry — toast, navbar, theme, i18n
│   │   ├── auth/
│   │   │   └── index.js         # Auth state — login, logout, roles, guards
│   │   ├── events/
│   │   │   └── bus.js           # Event bus — on/emit
│   │   ├── i18n/
│   │   │   └── index.js         # Translations EN/AR, t(), setLanguage()
│   │   ├── realtime/
│   │   │   └── index.js         # SignalR — bid placement, connection
│   │   ├── router/
│   │   │   └── index.js         # Hash router — 24 routes, guards, transitions
│   │   ├── stores/
│   │   │   └── alpine.js        # Alpine.js stores + data components
│   │   └── utils/
│   │       ├── dom.js           # DOM helpers, skeletons, loaders
│   │       ├── format.js        # Price, date, status formatting
│   │       ├── ocean.js         # Canvas underwater background animation
│   │       ├── ui.js            # Toast, confirm, modals, recent view
│   │       └── validation.js    # Form validation, password strength
│   ├── pages/                   # 24 page renderers
│   │   ├── home.js              # Landing page
│   │   ├── login.js             # Login form
│   │   ├── register.js          # 3-step registration
│   │   ├── products.js          # Product listing + filters
│   │   ├── product-detail.js    # Product detail + reviews
│   │   ├── auctions.js          # Auction listing
│   │   ├── auction-detail.js    # Live auction + bidding
│   │   ├── cart.js              # Shopping cart
│   │   ├── checkout.js          # Checkout + payment
│   │   ├── dashboard.js         # Multi-tab user dashboard
│   │   ├── profile.js           # Profile + avatar
│   │   ├── seller-profile.js    # Public seller page
│   │   ├── order-detail.js      # Order tracking
│   │   ├── wallet.js            # Wallet + transactions
│   │   ├── subscriptions.js     # Subscription plans
│   │   ├── shipping.js          # Saved addresses
│   │   ├── auction-requests.js  # Fisherman request submission
│   │   ├── auction-requests-review.js  # Auctioneer review queue
│   │   ├── auctioneer-analytics.js     # Auctioneer stats
│   │   ├── admin.js             # Admin panel (7 tabs)
│   │   ├── forgot-password.js   # Forgot password flow
│   │   ├── reset-password.js    # Token-based reset
│   │   ├── verify-email.js      # Email verification
│   │   ├── terms.js             # Terms of service
│   │   └── privacy.js           # Privacy policy
│   ├── shared/
│   │   ├── components/          # Modal, toast, pagination
│   │   ├── constants/
│   │   │   └── routes.js        # Route definitions, roles, guards
│   │   └── helpers/
│   │       ├── errors.js        # Error handling
│   │       └── index.js         # Shared utilities
│   └── public/
│       └── sw.js                # Service Worker copy

Back-end/
├── Sayiad.API/
│   ├── Controllers/             # 16 REST API controllers
│   │   ├── AuthController.cs    # Login, Register, Refresh, Verify, etc.
│   │   ├── ProductsController.cs # Product CRUD + filtering
│   │   ├── AuctionsController.cs # Auction CRUD + status
│   │   ├── CartController.cs    # Cart operations
│   │   ├── OrdersController.cs  # Order management
│   │   ├── WalletController.cs  # Balance, deposit, transactions
│   │   ├── WishlistController.cs # Toggle, list
│   │   ├── NotificationsController.cs # Read, unread count
│   │   ├── ReviewsController.cs # Product reviews
│   │   ├── CategoriesController.cs # Category CRUD
│   │   ├── ShippingAddressesController.cs # Address CRUD
│   │   ├── PaymentsController.cs # Payment processing
│   │   ├── SubscriptionsController.cs # User subscriptions
│   │   ├── SubscriptionPlansController.cs # Plan CRUD
│   │   ├── SellerProfileController.cs # Seller storefront
│   │   ├── ReportsController.cs # User reports
│   │   ├── UsersController.cs  # Admin user management
│   │   └── UploadController.cs # File uploads
│   ├── Hubs/
│   │   └── AuctionHub.cs       # SignalR real-time bidding
│   └── Middleware/              # Exception, logging, sanitization
├── Sayiad.Data/                 # Data layer — models, repositories
├── Sayiad.Domain/               # Domain layer — managers, interfaces
├── Sayiad.Tests/                # Unit tests
└── SQL/                         # Database migrations
```

---

<div align="center">
  <strong>Built with 🐟 and ☕ for Egypt's fishing community</strong><br>
  <a href="https://saiyad-eg.vercel.app">Live Site</a> ·
  <a href="https://sayiad.runasp.net/swagger/index.html">API Docs</a> ·
  <a href="https://github.com/AhmedSaad-EGY/Saiyad">Backend Repo</a>
</div>
