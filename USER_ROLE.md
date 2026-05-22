# Sayiad — User Roles & Permissions

## Roles

| Role | Code | Can Self-Register | Notes |
|---|---|---|---|
| **Customer** | `Customer` | ✅ | Regular buyer — can browse, purchase, bid |
| **Fisherman** | `Fisherman` | ✅ | Catches/sells fish — requires license number |
| **BaitSeller** | `BaitSeller` | ✅ | Bait & tackle seller |
| **Auctioneer** | `Auctioneer` | ✅ | Auction operator — starts/manages auctions |
| **Admin** | `Admin` | ❌ | Seeded manually in database |

---

## Full Permission Matrix

| Feature | Admin | Fisherman | BaitSeller | Auctioneer | Customer |
|---|---|---|---|---|---|
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
| Place orders | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cancel own pending orders | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage cart | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage wishlist | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage shipping addresses | ✅ | ✅ | ✅ | ✅ | ✅ |
| Write product reviews | ✅ | ✅ | ✅ | ✅ | ✅ |
| File reports | ✅ | ✅ | ✅ | ✅ | ✅ |
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
| Start an auction | ❌ | ❌ | ❌ | ✅ | ❌ |
| End an auction | ✅ | ❌ | ❌ | ✅ | ❌ |
| Place a bid | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Auction Requests** | | | | | |
| Submit auction requests (as Fisherman) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve / Reject auction requests | ❌ | ❌ | ❌ | ✅ | ❌ |
| View auctioneer analytics | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Admin Only** | | | | | |
| Manage all users (list, toggle status) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Moderate product status (PATCH status) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update order status (delivered, etc.) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage categories (CRUD) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage reports (view, resolve) | ✅ | ❌ | ❌ | ❌ | ❌ |
| List all subscriptions | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Frontend Route Access

| Page / Route | Admin | Fisherman | BaitSeller | Auctioneer | Customer |
|---|---|---|---|---|---|
| Home (`#/`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Products (`#/products`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Product Detail (`#/product-detail?id=`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auctions (`#/auctions`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auction Detail (`#/auction-detail?id=`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Seller Profile (public, `#/seller-profile?userId=`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cart (`#/cart`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Checkout (`#/checkout`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Orders (`#/order-detail?id=`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile (`#/profile`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Shipping (`#/shipping`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Subscriptions (`#/subscriptions`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard — Overview, Orders, Wishlist | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard — My Products tab | ❌ | ✅ | ✅ | ✅ | ❌ |
| Dashboard — Auctions tab | ❌ | ❌ | ❌ | ✅ | ❌ |
| Dashboard — Auction Requests tab | ❌ | ✅ | ❌ | ❌ | ❌ |
| Dashboard — Auction Requests Review tab | ❌ | ❌ | ❌ | ✅ | ❌ |
| Dashboard — Auctioneer Analytics tab | ❌ | ❌ | ❌ | ✅ | ❌ |
| Admin panel (all tabs) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Login / Register / Forgot Password | ✅ | ✅ | ✅ | ✅ | ✅ |
| Terms / Privacy | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Backend API Authorization Summary

| Level | Scope | Applies To |
|---|---|---|
| **`[AllowAnonymous]`** | No authentication required | Product listing, auction listing, categories, public seller profiles, reviews (read), auth endpoints (register, login, forgot-password, etc.) |
| **`[Authorize]`** | Any authenticated user | Cart, orders, wishlist, payments, notifications, shipping addresses, uploads, own profile, own subscriptions |
| **`[Authorize(Roles = "Fisherman,BaitSeller,Auctioneer")]`** | Seller roles only | Product CRUD, product images |
| **`[Authorize(Roles = "Fisherman,BaitSeller")]`** | Fisherman + BaitSeller only | Seller profile management |
| **`[Authorize(Roles = "Fisherman")]`** | Fisherman only | Auction requests (submit, view own) |
| **`[Authorize(Roles = "Auctioneer")]`** | Auctioneer only | Start auctions, approve/reject requests, view pending requests, auctioneer dashboard |
| **`[Authorize(Roles = "Customer,Admin")]`** | Customer + Admin only | Place bids |
| **`[Authorize(Roles = "Auctioneer,Admin")]`** | Auctioneer + Admin only | End auctions, view auctioneer dashboard |
| **`[Authorize(Roles = "Admin")]`** | Admin only | User management, category CRUD, product status moderation, order status update, reports management, subscription list |

---

## Key Rules

- **Admin cannot self-register.** Admin accounts are created manually/seeded in the database.
- **Registration dropdown** offers: Customer, Fisherman, BaitSeller, Auctioneer (no Admin option).
- **Fisherman registration** requires a license number (validated server-side).
- **Seller roles** (`Fisherman`, `BaitSeller`, `Auctioneer`) share product management capabilities and a gold-tinted UI theme (`data-user-role` CSS attribute on `<html>`).
- **Bids** are restricted to Customer and Admin — sellers cannot bid.
- **Auctioneer** is the only role that can start auctions, but Fishermen can *request* auctions for review.
- **All order endpoints** require authentication, but any authenticated user can place/cancel their own orders.



//admin should be abel to aprove products
//admin should be abel to delete products
//admin should be abel to aprove edited products
//admin should be abel to delete
