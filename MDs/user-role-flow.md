# User Role Flow — Sayiad (صياد)

> **Generated from codebase**: May 26, 2026  
> **Roles**: Admin · Customer · Fisherman · BaitSeller · Auctioneer
> **Deployment status**: 🔄 Redeploy triggered May 26, 2026 at commit `54e6ae4`  
> **🔍 Audited live**: All 5 role accounts tested on saiyad-eg.vercel.app

## Deployment Note

The live site at `saiyad-eg.vercel.app` was verified against the codebase on May 26, 2026 using 5 test accounts — one per role. Several discrepancies between the live behavior and this document were identified, all caused by the live site running an **older version** of the code (pre-Phase 1–9 role audit).

**Key differences (live vs. document):**
- Bid controls were visible to all roles on live; document restricts to Customer only (Phase 6)
- Customer saw "My Products" and "Admin" in navbar on live; document hides them via `data-roles` (Phase 5)
- Auctioneer dashboard had no Orders/Wishlist tabs on live; document includes them via `ECOMMERCE_ROLES` (Phase 1)
- Fisherman/BaitSeller/Auctioneer could see bid controls on live; document shows role-specific messaging (Phase 6)

A redeploy was triggered at commit `54e6ae4`. After the Vercel build completes (~1–2 min), the live site should match this document exactly. If the site doesn't update, check **Vercel Dashboard → Deployments** for any build failures.

**Console errors noted during testing:** `t is not a function` on login page and repeated `Unknown error` alerts. These likely stem from the old deployment's JS bundle referencing missing translation keys or API config — should resolve after redeploy.

---

## Constants

| Constant | Roles | Used In |
|----------|-------|---------|
| `SELLER_ROLES` | Fisherman, BaitSeller | Product CRUD, seller profile, dashboard products tab |
| `ECOMMERCE_ROLES` | Customer, Fisherman, BaitSeller, Auctioneer | Cart, checkout, orders, shipping, wishlist, subscriptions |
| `MODERATOR_ROLES` | Auctioneer, Admin | Auction request review, auctioneer analytics |

---

## 1. Route Access by Role

| Route | Admin | Customer | Fisherman | BaitSeller | Auctioneer |
|-------|:-----:|:--------:|:---------:|:----------:|:----------:|
| `#/home` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `#/login` | ❌* | ✅ | ✅ | ✅ | ✅ |
| `#/register` | ❌* | ✅ | ✅ | ✅ | ✅ |
| `#/products` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `#/product-detail` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `#/auctions` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `#/auction-detail` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `#/cart` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `#/checkout` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `#/shipping` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `#/order-detail` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `#/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `#/profile` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `#/wallet` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `#/subscriptions` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `#/auction-requests` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `#/auction-requests-review` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `#/auctioneer-analytics` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `#/admin` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `#/seller-profile` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `#/privacy` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `#/terms` | ✅ | ✅ | ✅ | ✅ | ✅ |

> \* Login/Register redirect to home if already authenticated.

---

## 2. Navbar Dropdown Visibility

Filtered via `data-roles` attribute on each dropdown item.

| Nav Item | Visible To | Link |
|----------|-----------|------|
| Profile | All authenticated (`data-roles="all"`) | `#/profile` |
| Dashboard | All authenticated (`data-roles="all"`) | `#/dashboard` |
| My Orders | Customer, Fisherman, BaitSeller, Auctioneer | `#/dashboard?tab=orders` |
| My Products | Fisherman, BaitSeller | `#/dashboard?tab=products` |
| Wishlist | Customer, Fisherman, BaitSeller, Auctioneer | `#/dashboard?tab=wishlist` |
| Wallet | Admin, Customer, Fisherman, BaitSeller, Auctioneer | `#/wallet` |
| Subscriptions | Customer, Fisherman, BaitSeller, Auctioneer | `#/subscriptions` |
| Admin Panel | Admin only | `#/admin` |

> The login/register buttons are hidden for authenticated users.  
> The user menu and notification bell are only shown when authenticated.

---

## 3. Dashboard Tab Visibility

| Tab | Visible To | Route Param |
|-----|-----------|-------------|
| Overview | All authenticated | `overview` (default) |
| Orders | Customer, Fisherman, BaitSeller, Auctioneer | `?tab=orders` |
| Products | Fisherman, BaitSeller | `?tab=products` |
| Auctions | Auctioneer only | `?tab=auctions` |
| Auction Requests (submit) | Fisherman only | `?tab=auction-requests` |
| Auction Requests (review) | Auctioneer or Admin | `?tab=auction-requests-review` |
| Auctioneer Analytics | Auctioneer or Admin | `?tab=auctioneer-analytics` |
| Wishlist | Customer, Fisherman, BaitSeller, Auctioneer | `?tab=wishlist` |
| Notifications | All authenticated | `?tab=notifications` |
| Profile (edit) | All authenticated | `?tab=profile` |
| Change Password | All authenticated | `?tab=password` |

---

## 4. Profile Quick Links

| Link | Visible To |
|------|-----------|
| Orders (`#/dashboard?tab=orders`) | All roles **except** Admin |
| Wishlist (`#/dashboard?tab=wishlist`) | All roles **except** Admin |
| Shipping (`#/shipping`) | All roles **except** Admin |
| Notifications (`#/dashboard?tab=notifications`) | All authenticated |
| My Products (`#/dashboard?tab=products`) | Fisherman, BaitSeller only |
| Seller Dashboard (`#/dashboard?tab=overview`) | Fisherman, BaitSeller only |

---

## 5. Wallet Permissions

| Action | Admin | Customer | Fisherman | BaitSeller | Auctioneer |
|--------|:-----:|:--------:|:---------:|:----------:|:----------:|
| View balance | ✅ | ✅ | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Deposit funds | ❌ | ✅ | ✅ | ✅ | ✅ |
| Withdraw funds | ✅ | ❌ | ❌ | ❌ | ❌ |

> Admin sees wallet in read-only mode: deposit row is hidden, info notice shown.  
> Withdraw UI is not yet implemented — endpoint exists but no front-end form.

---

## 6. Auction & Bidding Permissions

| Action | Admin | Customer | Fisherman | BaitSeller | Auctioneer |
|--------|:-----:|:--------:|:---------:|:----------:|:----------:|
| View auction details | ✅ | ✅ | ✅ | ✅ | ✅ |
| View bid history | ✅ | ✅ | ✅ | ✅ | ✅ |
| View countdown timer | ✅ | ✅ | ✅ | ✅ | ✅ |
| Place bids | ❌ | ✅ | ❌ | ❌ | ❌ |
| Use auto-bid | ❌ | ✅ | ❌ | ❌ | ❌ |
| Use quick-bid buttons | ❌ | ✅ | ❌ | ❌ | ❌ |
| Winner confetti 🎉 | ✅* | ✅* | ✅* | ✅* | ✅* |

> *Confetti fires for any role that is the auction winner.  
> Non-Customer authenticated users see: "Only customers can place bids."  
> Unauthenticated users see: "Login as a customer to place bids."  
> The countdown timer and 10-second auto-refresh run for all viewing roles.

---

## 7. Product Permissions

| Action | Admin | Customer | Fisherman | BaitSeller | Auctioneer |
|--------|:-----:|:--------:|:---------:|:----------:|:----------:|
| Browse products | ✅ | ✅ | ✅ | ✅ | ✅ |
| View product detail | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add to cart / Buy | ❌ | ✅ | ✅ | ✅ | ✅ |
| Add to wishlist | ❌ | ✅ | ✅ | ✅ | ✅ |
| Write reviews | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Create products** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Edit own products** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Delete own products** | ❌ | ❌ | ✅ | ✅ | ❌ |
| Start auction from product | ❌ | ❌ | ✅ | ✅ | ❌ |
| Moderate product status | ✅ | ❌ | ❌ | ❌ | ❌ |

> Products created by Fisherman/BaitSeller start as `PendingReview` and require admin approval before becoming `Available`.

---

## 8. Seller Profile

| Action | Admin | Customer | Fisherman | BaitSeller | Auctioneer |
|--------|:-----:|:--------:|:---------:|:----------:|:----------:|
| View public seller profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create own seller profile | ❌ | ❌ | ✅ | ✅ | ❌ |
| Edit own seller profile | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## 9. Auction Requests

| Action | Admin | Customer | Fisherman | BaitSeller | Auctioneer |
|--------|:-----:|:--------:|:---------:|:----------:|:----------:|
| Submit auction request | ❌ | ❌ | ✅ | ❌ | ❌ |
| View own requests | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve/reject requests | ✅ | ❌ | ❌ | ❌ | ✅ |
| Schedule auction on approve | ✅ | ❌ | ❌ | ❌ | ✅ |

---

## 10. Auctioneer Analytics

| Action | Admin | Customer | Fisherman | BaitSeller | Auctioneer |
|--------|:-----:|:--------:|:---------:|:----------:|:----------:|
| View stats + charts | ✅ | ❌ | ❌ | ❌ | ✅ |
| View fee income | ✅ | ❌ | ❌ | ❌ | ✅ |
| View recent auctions | ✅ | ❌ | ❌ | ❌ | ✅ |

---

## 11. Admin Panel

| Tab | Description |
|-----|-------------|
| Users | Paginated user list, toggle suspend/activate |
| Reports | View product reports, resolve |
| Products | Browse all products, change status (Available/Draft/Sold/Rejected/Suspended) |
| Orders | View all orders with buyer info |
| Categories | Add/delete product categories |
| Plans | CRUD subscription plans (Free/Basic/Pro/Enterprise) |
| Revenue | View wallet balance, PlatformFee & SubscriptionPayment income |

> Admin panel is **Admin-only** at both route guard and page-level check.

---

## 12. Subscriptions (Role-Based Messaging)

| User Role | Heading | Description Intent |
|-----------|---------|-------------------|
| Customer | "Unlock More Bids" | Buy a subscription to bid on more auctions |
| Auctioneer | "Grow Your Business" | Buy a subscription to accept and manage more auctions |
| Fisherman | "Upgrade Your Experience" | Generic seller upgrade message |
| BaitSeller | "Upgrade Your Experience" | Generic seller upgrade message |

> All non-Admin roles can view and purchase subscriptions.  
> Available subscription plans: Free (default), Basic, Pro, Enterprise.

---

## 13. Registration Role Selection

Available roles when creating an account:

| Role | License Required |
|------|:----------------:|
| Customer | ❌ |
| Fisherman | ✅ (Fishing License Number) |
| BaitSeller | ❌ |
| Auctioneer | ❌ |

> Age 18+ verification required for all roles.

---

## 14. CSS Role-Based Theming

The HTML element gets `data-user-role="Fisherman"` (or role name). This drives:

- **Fisherman / BaitSeller (sellers)**: Gold accent theme via `--gold-gradient` CSS variables
- All roles get default theme otherwise

---

## 15. Cart Badge

The cart badge in the navbar (showing item count) is visible to all authenticated users. It updates:
- On page load via `updateCartBadge()`
- When `cart-updated` event fires (add/remove/checkout)
- Every login/logout

---

## 16. Notification Badge

The notification bell polls `/notifications/unread-count` every 60 seconds for all authenticated users. The polling starts on login and stops on logout.

---

## Summary Matrix

| Capability | Admin | Customer | Fisherman | BaitSeller | Auctioneer |
|-----------|:-----:|:--------:|:---------:|:----------:|:----------:|
| Browse & search | ✅ | ✅ | ✅ | ✅ | ✅ |
| Buy products | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create products | ❌ | ❌ | ✅ | ✅ | ❌ |
| Place bids | ❌ | ✅ | ❌ | ❌ | ❌ |
| Manage wallet | View only | Full | Full | Full | Full |
| Withdraw wallet | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage orders | View all | Own | Own | Own | Own |
| Manage shipping | ❌ | Own | Own | Own | Own |
| Write reviews | ❌ | ✅ | ✅ | ✅ | ✅ |
| Start auctions | ✅ (via requests) | ❌ | Submit request | ❌ | Direct |
| Manage auctions | Approve/reject | ❌ | ❌ | ❌ | Full |
| View analytics | ✅ | ❌ | ❌ | ❌ | ✅ |
| Seller profile | ❌ | ❌ | ✅ | ✅ | ❌ |
| Subscription plans | CRUD all | Purchase | Purchase | Purchase | Purchase |
| Users panel | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reports panel | ✅ | ❌ | ❌ | ❌ | ❌ |
| Categories panel | ✅ | ❌ | ❌ | ❌ | ❌ |
