# 🐟 Sayiad — Full Platform Documentation

> **Egypt's premier fishing marketplace & live auction platform**
> Live: [https://saiyad-eg.vercel.app](https://saiyad-eg.vercel.app)
> API: [https://sayiad.runasp.net/swagger/index.html](https://sayiad.runasp.net/swagger/index.html)
> Backend GitHub Link: [https://github.com/AhmedSaad-EGY/Saiyad_UI](https://github.com/AhmedSaad-EGY/Saiyad_UI)
> Frontend GitHub Link: [https://github.com/AhmedSaad-EGY/Saiyad](https://github.com/AhmedSaad-EGY/Saiyad)

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

| Layer         | Technology                                                         |
| ------------- | ------------------------------------------------------------------ |
| **Frontend**  | Vanilla JavaScript ES2022+, Alpine.js, hash-based SPA routing      |
| **Styling**   | Pure CSS3 with OKLCH design tokens, glassmorphism, dark/light mode |
| **Backend**   | ASP.NET Core Web API (C#)                                          |
| **Auth**      | JWT (60min access token + 7-day refresh token)                     |
| **Real-time** | SignalR WebSockets for live auction bidding                        |
| **Database**  | SQL Server                                                         |
| **i18n**      | English + Arabic (RTL), ~470 keys per language                     |
| **PWA**       | Service worker with cache-first strategy                           |
| **Icons**     | Font Awesome 6.5 Free                                              |
| **Fonts**     | Inter (EN), Syne (headings), Cairo (AR)                            |
| **Hosting**   | Frontend on Vercel, API on sayiad.runasp.net                       |

---

## ✨ All Features

### 🛒 Marketplace

| Feature                | Details                                                                           |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Product Listings**   | Image gallery, condition badges, stock tracking, location                         |
| **Category Filtering** | Browse by category dropdown                                                       |
| **Condition Tabs**     | New, Like New, Good, Fair                                                         |
| **Price Sorting**      | Price low-to-high, high-to-low, newest first                                      |
| **Full-Text Search**   | Debounced search with URL param persistence                                       |
| **In-Stock Toggle**    | Filter to show only in-stock items                                                |
| **Product Detail**     | Breadcrumb, image lightbox, seller info, similar products                         |
| **Cart Management**    | Quantity steppers, remove, clear all, floating mobile bar                         |
| **Wishlist**           | Toggle heart button, dedicated dashboard tab                                      |
| **Saved Addresses**    | CRUD shipping addresses with set-default                                          |
| **Checkout**           | Address selection/creation, shipping method, payment method, wallet balance check |
| **Order Tracking**     | Order timeline, status badges, cancel pending orders                              |
| **Product Reviews**    | Star rating selector, comment, delete own reviews                                 |

### 🔨 Live Auctions

| Feature                 | Details                                                     |
| ----------------------- | ----------------------------------------------------------- |
| **Auction Listing**     | Grid with status filter (Active/Finished/Cancelled)         |
| **Countdown Timer**     | Live setInterval countdown, urgency pulse under 1 hour      |
| **Real-Time Bidding**   | SignalR WebSockets — no page refresh needed                 |
| **Bid Slider**          | Draggable range input synced with number input              |
| **Quick-Bid Buttons**   | +5%, +10%, fixed increment                                  |
| **Auto-Bid**            | Set max amount, auto-bid up to limit                        |
| **Bid History**         | Table with green highlight on new bids, flash animation     |
| **Winner Announcement** | Confetti burst + toast on auction end                       |
| **Auction Requests**    | Fishermen submit, Auctioneers approve/reject                |
| **Analytics Dashboard** | Total auctions, active/finished counts, total bids, revenue |

### 👤 User Accounts

| Feature                | Details                                                    |
| ---------------------- | ---------------------------------------------------------- |
| **Registration**       | 3-step wizard with role selection, password strength meter |
| **Login**              | Email + password, remember me, forgot password link        |
| **JWT Auth**           | Silent refresh on 401, in-memory token cache               |
| **Email Verification** | Verify token overlay, auto-redirect on success             |
| **Forgot Password**    | 3-step flow: email → OTP → new password                    |
| **Password Strength**  | 5-criteria meter on register + reset                       |
| **Profile Page**       | Avatar upload, stats, quick links                          |
| **Notification Bell**  | Live unread badge with 60s polling                         |
| **Recently Viewed**    | localStorage tracking (12 items max)                       |

### 💰 Wallet & Payments

| Feature                   | Details                                                |
| ------------------------- | ------------------------------------------------------ |
| **Wallet Balance**        | Total, held, available balance display                 |
| **Deposit**               | Amount input + deposit button                          |
| **Transaction History**   | Paginated table with type icons & labels               |
| **Held Funds**            | Funds held during active bids, released on outbid/loss |
| **Platform Fees**         | Auctioneer fee tracking, subscription payments         |
| **Wallet-Aware Checkout** | Checks balance before placing order                    |

### 📦 Subscriptions

| Feature                   | Details                                                                |
| ------------------------- | -----------------------------------------------------------------------|
| **Plan Cards**            | Feature comparison, "Most Popular" badge                               |
| **Role-Based Messaging**  | Different heading/desc per role (Customer/Auctioneer/Seller/Fisherman) |
| **Quota Limits**          | Monthly limits on bids, auctions, requests                             |
| **Upgrade Flow**          | Disable button if insufficient wallet balance                          |
| **Admin Plan Management** | CRUD subscription plans from admin panel                               |

### 🎨 UI/UX

| Feature                  | Details                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| **Dark/Light Mode**      | Smooth transition, persisted preference                             |
| **RTL Support**          | Full Arabic layout — logical CSS properties                         |
| **Mobile-First**         | Responsive at 480px, 768px, 1024px, 1280px breakpoints              |
| **Skeleton Loaders**     | 6 types: page, card, detail, table, form, auth                      |
| **Toast Notifications**  | Slide-in, auto-dismiss, max 3 visible, close button                 |
| **Confetti**             | 60-particle canvas burst on order placed & auction won              |
| **Canvas Background**    | Animated underwater scene — fish, kelp, bubbles, light rays         |
| **Gold Theme**           | Gold-tinted UI for Users who bought a Subscription                  |
| **Route Transitions**    | Scale+fade enter/leave cross-fade animations                        |
| **Pull-to-Refresh**      | Mobile gesture on home, products, auctions                          |
| **Swipe-to-Delete**      | Touch gesture on cart items (mobile)                                |
| **Filter Bottom Sheet**  | Slide-up panel on mobile for products/auctions filters              |
| **Dashboard Bottom Bar** | Fixed bottom tab bar on mobile                                      |

### ♿ Accessibility

| Feature                | Details                                               |
| ---------------------- | ----------------------------------------------------- |
| Skip-to-content link   | Keyboard navigation with visible focus rings          |
| ARIA live regions      | For toast notifications & route changes               |
| Focus trap             | In modals, lightbox, confirm dialogs                  |
| Reduced motion support | `prefers-reduced-motion` + manual toggle              |
| Semantic HTML          | `<nav>`, `<main>`, `<section>`, `<footer>` throughout |

### 🌐 Internationalization

| Feature                | Details                                    |
| ---------------------- | ------------------------------------------ |
| Arabic (RTL)           | Default language                           |
| English (LTR)          | One-click switch, full layout flip         |
| ~470 Keys/Language     | All UI strings translated                  |
| `data-i18n` Attributes | Static text auto-update on language switch |

### 📱 PWA

| Feature             | Details                                |
| ------------------- | -------------------------------------- |
| Service Worker      | `sayiad-v11`, 37 precached assets      |
| Cache-First         | Static assets (CSS, JS, images, fonts) |
| Network-First       | Navigation (HTML)                      |
| Network-Only        | API calls bypass cache                 |
| Update Notification | Broadcast channel for SW updates       |

---

## 👥 User Roles

### 1. Customer (`Customer`)

**The default buyer role.** Anyone can register as a Customer.

- **Can:** Browse products & auctions, buy, bid, manage cart/wishlist/orders, write reviews, use subscriptions, view/add shipping addresses, deposit funds in the wallet, view wallet balance, submit reports
- **Cannot:** Create products, start auctions, manage seller profile
- **Registration:** Self-register (no extra fields required)
- **UI:** Gold-themed dashboard when bying a subscription

---

### 2. Fisherman (`Fisherman`)

**A seller of fresh catch & fishing gear.**

- **Can:** All Customer abilities + submit request to admin to create/edit products, manage seller profile, submit auction requests for Auctioneer review
- **Cannot:** Start auctions directly, place bids
- **Registration:** Self-register — requires **Fishing License Number**
- **UI:** Gold-themed dashboard when bying a subscription

---

### 3. BaitSeller (`BaitSeller`)

**A seller of bait & tackle products.**

- **Can:** All Customer abilities + submit request to admin to create/edit products, manage seller profile
- **Cannot:** Start auctions, place bids, submit auction requests
- **Registration:** Self-register
- **UI:** Gold-themed dashboard when bying a subscription

---

### 4. Auctioneer (`Auctioneer`)

**A licensed auction operator who manages live auctions.**

- **Can:** Start/manage auctions, approve/reject Fisherman auction requests, view auctioneer analytics dashboard, submit reports, buy products, use cart, manage orders/wishlist/shipping addresses, write reviews, deposit funds in the wallet, view wallet balance
- **Cannot:** Place bids, manage seller profile, create products, start auctions directly
- **Registration:** Self-register — requires **Auctioneer License Number** — requires **Admin approvment**
- **UI:** Gold-themed dashboard when bying a subscription

---

### 5. Admin (`Admin`)

**Platform administrator with full control.**

- **Can:** Everything — manage users (suspend/activate), manage all products (approve/reject), update order status, manage categories (CRUD), manage reports (view/resolve), manage subscription plans, view revenue, end auctions, view wallet balance, withdraw funds
- **Cannot:** Self-register — accounts are seeded manually in the database, place orders, use cart/checkout, manage wishlist, manage shipping addresses, write reviews, place bids
- **UI:** Exclusive Admin panel tab in navbar + dashboard

---

## 🔐 Permission Matrix

| Feature                                  | Admin | Fisherman | BaitSeller | Auctioneer | Customer |
| ---------------------------------------- | :---: | :-------: | :--------: | :--------: | :------: |
| **Browse & Discover**                    |       |           |            |            |          |
| Browse products                          |  ✅  |    ✅     |     ✅     |     ✅     |    ✅    |
| Browse auctions                          |  ✅  |    ✅     |     ✅     |     ✅     |    ✅    |
| View seller profiles                     |  ✅  |    ✅     |     ✅     |     ✅     |    ✅    |
| View categories                          |  ✅  |    ✅     |     ✅     |     ✅     |    ✅    |
| View reviews & ratings                   |  ✅  |    ✅     |     ✅     |     ✅     |    ✅    |
| **Account & Auth**                       |       |           |            |            |          |
| Register / Login / Logout                |   —   |    ✅     |     ✅     |     ✅     |    ✅    |
| Manage own profile                       |  ✅  |    ✅     |     ✅     |     ✅     |    ✅    |
| Change password                          |  ✅  |    ✅     |     ✅     |     ✅     |    ✅    |
| **Shopping**                             |       |           |            |            |          |
| Place orders                             |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Cancel own pending orders                |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Manage cart                              |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Manage wishlist                          |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Manage shipping addresses                |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Write product reviews                    |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| File reports                             |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| **Wallet & Payments**                    |       |           |            |            |          |
| View wallet balance                      |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Deposit funds                            |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Withdraw funds                           |  ✅   |    ❌     |     ❌     |     ❌     |    ❌    |
| View transaction history                 |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| **General**                              |       |           |            |            |          |
| Manage notifications                     |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Upload files / images                    |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Upgrade subscription                     |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Connect to SignalR auction hub           |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| **Product Management**                   |       |           |            |            |          |
| Create / Edit / Delete products          |  ❌   |    ✅     |     ✅     |     ❌     |    ❌    |
| Submit Request to Admin to Create / Edit / Delete products          |  ❌   |    ✅     |     ✅     |     ❌     |    ❌    |
| View own products                        |  ❌   |    ✅     |     ✅     |     ❌     |    ❌    |
| **Seller Profile**                       |       |           |            |            |          |
| Create / Edit seller profile             |  ❌   |    ✅     |     ✅     |     ❌     |    ❌    |
| View own seller dashboard                |  ❌   |    ✅     |     ✅     |     ❌     |    ❌    |
| **Auctions**                             |       |           |            |            |          |
| Submit auction requests                  |  ❌   |    ✅     |     ❌     |     ❌     |    ❌    |
| Approve / Reject auction requests        |  ❌   |    ❌     |     ❌     |     ✅     |    ❌    |
| Start an auction                         |  ❌   |    ❌     |     ❌     |     ✅     |    ❌    |
| End an auction                           |  ✅   |    ❌     |     ❌     |     ✅     |    ❌    |
| Place a bid                              |  ❌   |    ❌     |     ❌     |     ❌     |    ✅    |
| **View Analytics**                       |       |           |            |            |          |
| Auctioneer analytics dashboard           |  ❌   |    ❌     |     ❌     |     ✅     |    ❌    |
| **Admin Only**                           |       |           |            |            |          |
| Manage all users (list, toggle status)   |  ✅   |    ❌     |     ❌     |     ❌     |    ❌    |
| Moderate product status (approve/reject) |  ✅   |    ❌     |     ❌     |     ❌     |    ❌    |
| Update order status                      |  ✅   |    ❌     |     ❌     |     ❌     |    ❌    |
| Manage categories (CRUD)                 |  ✅   |    ❌     |     ❌     |     ❌     |    ❌    |
| Manage reports (view, resolve)           |  ✅   |    ❌     |     ❌     |     ❌     |    ❌    |
| Manage subscription plans (CRUD)         |  ✅   |    ❌     |     ❌     |     ❌     |    ❌    |
| View platform revenue                    |  ✅   |    ❌     |     ❌     |     ❌     |    ❌    |

---

## 🗺 Route Access Matrix

| Page / Route                                | Admin | Fisherman | BaitSeller | Auctioneer | Customer |
| ------------------------------------------- | :---: | :-------: | :--------: | :--------: | :------: |
| Home (`#/`)                                 |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Products (`#/products`)                     |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Product Detail (`#/product-detail?id=`)     |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Auctions (`#/auctions`)                     |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Auction Detail (`#/auction-detail?id=`)     |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Seller Profile (`#/seller-profile?userId=`) |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Cart (`#/cart`)                             |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Checkout (`#/checkout`)                     |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Orders (`#/order-detail?id=`)               |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Profile (`#/profile`)                       |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Shipping (`#/shipping`)                     |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Subscriptions (`#/subscriptions`)           |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| Wallet (`#/wallet`)                         |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Dashboard (`#/dashboard`)                   |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| — Overview tab                              |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| — Orders tab                                |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| — Wishlist tab                              |  ❌   |    ✅     |     ✅     |     ✅     |    ✅    |
| — Notifications tab                         |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| — My Products tab                           |  ❌   |    ✅     |     ✅     |     ❌     |    ❌    |
| — Auctions tab (start/manage)               |  ❌   |    ❌     |     ❌     |     ✅     |    ❌    |
| — Auction Requests (submit)                 |  ❌   |    ✅     |     ❌     |     ❌     |    ❌    |
| — Auction Requests Review                   |  ❌   |    ❌     |     ❌     |     ✅     |    ❌    |
| — Auctioneer Analytics                      |  ❌   |    ❌     |     ❌     |     ✅     |    ❌    |
| Admin Panel (`#/admin`)                     |  ✅   |    ❌     |     ❌     |     ❌     |    ❌    |
| Login / Register / Forgot Password          |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |
| Terms / Privacy                             |  ✅   |    ✅     |     ✅     |     ✅     |    ✅    |