# User Roles Audit — Specification

> **Project:** Sayiad (صياد) — Egypt's fishing marketplace & live auction platform
> **Date:** 2026-05-26
> **Status:** Spec ready — no code changes made yet

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Discrepancies Found](#2-discrepancies-found)
3. [Interview Decisions](#3-interview-decisions)
4. [Action Plan](#4-action-plan)
5. [Open Questions](#5-open-questions)
6. [Reference: Permission Matrix (Target)](#6-reference-permission-matrix-target)

---

## 1. Current State Analysis

### 1.1 Role Definitions

Five roles exist in the codebase (`src/shared/constants/routes.js`):

| Role | Enum Key | Description |
|------|----------|-------------|
| `Admin` | `ROLES.ADMIN` | Platform administrator with full control |
| `Customer` | `ROLES.CUSTOMER` | Default buyer role |
| `Fisherman` | `ROLES.FISHERMAN` | Seller of fresh catch & fishing gear |
| `BaitSeller` | `ROLES.BAIT_SELLER` | Seller of bait & tackle |
| `Auctioneer` | `ROLES.AUCTIONEER` | Licensed auction operator |

### 1.2 Helper Constants

```js
SELLER_ROLES = [Fisherman, BaitSeller]  // used in dashboard + seller-profile
```

### 1.3 Auth Functions (`src/core/auth/index.js`)

- `getUser()` — parses `localStorage.getItem("user")`
- `isAuthenticated()` — checks `!!localStorage.getItem("accessToken")`
- `getRoleFromToken()` — parses JWT payload, extracts role from multiple possible claim paths
- `hasRole(role)` — checks token OR stored user object
- `hasAnyRole(...roles)` — checks if user matches any listed role
- `requireAuth()` — redirects to `#/login` if not authenticated

> **Note:** `hasRole` checks BOTH the JWT token payload AND the `localStorage["user"]` object. This dual-route is intentional for cases where the token hasn't been decoded yet but user object exists.

### 1.4 Route Guards (`src/shared/constants/routes.js`)

Current route guard definitions:

| Route | Guarded Roles | Notes |
|-------|---------------|-------|
| `admin` | `Admin` only | ✅ Correct |
| `cart` | `Customer`, `Fisherman`, `BaitSeller` | ❌ Auctioneer missing |
| `checkout` | `Customer`, `Fisherman`, `BaitSeller` | ❌ Auctioneer missing |
| `shipping` | `Customer`, `Fisherman`, `BaitSeller` | ❌ Auctioneer missing |
| `order-detail` | `Customer`, `Fisherman`, `BaitSeller` | ❌ Auctioneer missing |
| `dashboard` | Any authenticated user | ⚠️ Tab-level guards are separate |
| `profile` | Any authenticated user | ✅ |
| `wallet` | Any authenticated user | ⚠️ No role-based deposit/withdraw |
| `subscriptions` | `Customer`, `Fisherman`, `BaitSeller`, `Auctioneer` | ⚠️ Admin excluded (intentional) |
| `auction-requests` | `Fisherman` only | ✅ |
| `auction-requests-review` | `Auctioneer` or `Admin` | ✅ |
| `auctioneer-analytics` | `Auctioneer` or `Admin` | ✅ |
| (unprotected) | `home`, `login`, `register`, etc. | ✅ Public |

### 1.5 Navbar Dropdown (`src/index.html`)

Links with `data-roles` attribute control visibility:
- `data-roles="all"` — Profile, Dashboard
- `data-roles="Customer,Fisherman,BaitSeller"` — My Orders, Wishlist
- `data-roles="Fisherman,BaitSeller"` — My Products
- `data-roles="Customer,Fisherman,BaitSeller,Auctioneer"` — Wallet, Subscriptions
- `data-roles="Admin"` — Admin panel

> ❌ Auctioneer not in My Orders/Wishlist dropdown (but they should be per interview decision)
> ❌ Admin not in Wallet dropdown (but they should be per interview decision)

### 1.6 Dashboard Tab Guards (`src/pages/dashboard.js`)

| Tab | Guard | Notes |
|-----|-------|-------|
| Overview | Any authenticated user | ✅ |
| Orders | `isECommerceRole` (Customer, Fisherman, BaitSeller) | ❌ Auctioneer missing |
| Products | `isSellerRole` (Fisherman, BaitSeller) | ✅ |
| Auctions | `Auctioneer` only | ✅ |
| Auction Requests | `Fisherman` only | ✅ |
| Auction Requests Review | `Auctioneer` or `Admin` | ✅ |
| Auctioneer Analytics | `Auctioneer` or `Admin` | ✅ |
| Wishlist | `isECommerceRole` (Customer, Fisherman, BaitSeller) | ❌ Auctioneer missing |
| Notifications | Any authenticated user | ✅ |
| Profile | Any authenticated user | ✅ |
| Password | Any authenticated user | ✅ |

### 1.7 Profile Page Quick Links (`src/pages/profile.js`)

Profile links check roles directly:
- Orders/Wishlist/Shipping links: `user?.role !== 'Admin' && user?.role !== 'Auctioneer'`
  - ❌ Auctioneer is excluded — should be included per interview
- My Products/Seller Dashboard: `user?.role === 'Fisherman' || user?.role === 'BaitSeller'`
  - ✅ Correct

---

## 2. Discrepancies Found

### 2.1 Base_Roles.md vs Codebase Conflicts

| # | Area | Doc Says | Codebase Does | Resolution |
|---|------|----------|---------------|------------|
| 1 | Admin → Cart/Checkout/Orders | ✅ Access granted | ❌ Restricted to Customer, Fisherman, BaitSeller | **Code is truth** — fix doc |
| 2 | Auctioneer → E-commerce (cart, checkout, orders, shipping, wishlist, reviews) | ✅ Access granted | ❌ Excluded from all e-commerce | **Doc is truth** — update code |
| 3 | Wallet deposit permissions | Admin ❌, others ✅ | No enforcement (any auth user) | **Enforce** — role-based deposit |
| 4 | Wallet withdraw permissions | Admin ✅ (only) | No enforcement (any auth user) | **Enforce** — Admin-only withdraw |
| 5 | Admin → Subscriptions | ✅ Access granted | ❌ Excluded from route guard | **Code is truth** — fix doc |
| 6 | Fisherman → Place bids | ❌ Cannot bid | No bid-place guard (any auth user can bid) | **Doc is truth** — enforce |
| 7 | Fisherman/BaitSeller → Product creation | ✅ Can create/delete directly | Code shows direct CRUD via API | **Doc is wrong** — should require admin approval |
| 8 | Fisherman → Bids | "Cannot place bids" | No enforcement in code | **Enforce** — block Fisherman from bidding |

### 2.2 Internal Codebase Inconsistencies

| # | Area | Issue |
|---|------|-------|
| 1 | Wallet route | Any authenticated user can deposit — no role check |
| 2 | Wallet route | Any authenticated user can withdraw — should be Admin-only |
| 3 | Auction detail page | No role check on bid placement — should block non-Customer |
| 4 | Product CRUD | Fisherman/BaitSeller create directly — no admin approval needed |
| 5 | Dashboard Orders tab | Auctioneer excluded from e-commerce tabs |
| 6 | Dashboard Wishlist tab | Auctioneer excluded from wishlist tabs |
| 7 | Profile quick links | Auctioneer excluded from orders/wishlist/shipping links |
| 8 | Navbar dropdown | Admin missing Wallet link; Auctioneer missing Orders/Wishlist links |
| 9 | Dashboard Products tab | Products tab only visible for SELLER_ROLES (Fisherman, BaitSeller) — correct |

---

## 3. Interview Decisions

### Round 1 — Foundational

**Q1: Source of truth for permissions?**
> **Decision:** Code is truth. Fix the doc to match what the code enforces. Admin should NOT have cart/checkout access.

**Q2: Auctioneer e-commerce access?**
> **Decision:** Auctioneer CAN also buy. The doc is correct — update the code to add Auctioneer to all e-commerce routes (cart, checkout, shipping, order-detail, reviews).

**Q3: Wallet deposit/withdraw role enforcement?**
> **Decision:** Yes — enforce role-based checks:
> - Deposit: All authenticated users except Admin
> - Withdraw: Admin only
> - View: All authenticated users

### Round 2 — Edge Cases

**Q4: Admin subscriptions page access?**
> **Decision:** No — admin panel only. The route guard correctly excludes Admin.

**Q5: Admin wallet access?**
> **Decision:** Route guard checks role. Admin sees wallet read-only (no deposit button). Non-Admin roles see the full deposit experience.

**Q6: Dashboard tabs for Auctioneer and Admin?**
> **Decision:** Auctioneer gets e-commerce tabs (Orders, Wishlist). Admin does NOT get an Orders tab in dashboard (they have the admin panel).

### Round 3 — Nuance

**Q7: Fisherman bidding?**
> **Decision:** Customer only bids. Fisherman, BaitSeller, and Auctioneer should be blocked from placing bids.

**Q8: Product creation workflow?**
> **Decision:** Admin approval required. Products created by Fisherman/BaitSeller should go through a pending review → approval/rejection flow.

**Q9: Navbar dropdown — Admin Wallet link?**
> **Decision:** Add Wallet link for Admin in the dropdown (read-only view). Keep Subscriptions as-is (no Admin link).

**Q10: Notification permissions?**
> **Decision:** Correct as-is. All authenticated users receive notifications.

---

## 4. Action Plan

### Phase 1: Route Guards (`src/shared/constants/routes.js`)

| Change | Details |
|--------|---------|
| Add Auctioneer to `cart` guard | `hasAnyRole(Customer, Fisherman, BaitSeller)` → add `Auctioneer` |
| Add Auctioneer to `checkout` guard | Same as cart |
| Add Auctioneer to `shipping` guard | Same as cart |
| Add Auctioneer to `order-detail` guard | Same as cart |

No routes need to be removed from any guard.

### Phase 2: Wallet Page (`src/pages/wallet.js`)

| Change | Details |
|--------|---------|
| Check if current user is Admin | If yes: hide deposit button, show "Read-only view" message |
| Hide deposit for Admin | Admin should see balance + transactions only |
| Restrict withdraw to Admin | If withdraw functionality exists, show Admin-only button |

### Phase 3: Dashboard Tab Guards (`src/pages/dashboard.js`)

| Change | Details |
|--------|---------|
| Update `isECommerceRole` | Add `ROLES.AUCTIONEER` to the list |
| Add Auctioneer to Orders tab | Already covered by `isECommerceRole` change |
| Add Auctioneer to Wishlist tab | Already covered by `isECommerceRole` change |
| Keep Admin out of Orders tab | Admin dashboard should not show an Orders tab |

### Phase 4: Profile Page (`src/pages/profile.js`)

| Change | Details |
|--------|---------|
| Update quick links condition | Change `user?.role !== 'Auctioneer'` logic to allow Auctioneer to see orders/wishlist/shipping links |

### Phase 5: Navbar Dropdown (`src/index.html`)

| Change | Details |
|--------|---------|
| Add Auctioneer to My Orders | `data-roles="Customer,Fisherman,BaitSeller,Auctioneer"` |
| Add Auctioneer to Wishlist | `data-roles="Customer,Fisherman,BaitSeller,Auctioneer"` |
| Add Admin to Wallet | `data-roles="Admin"` — but show read-only view |

### Phase 6: Bid Placement — Auction Detail Page (`src/pages/auction-detail.js`)

| Change | Details |
|--------|---------|
| Read `auction-detail.js` | Analyze current bid placement logic |
| Add role check on bid | Only `Customer` role can place bids. Show "Only customers can bid" message for Fisherman, BaitSeller, Auctioneer. Hide bid controls for non-Customer. |

### Phase 7: Product Approval Workflow

| Change | Details |
|--------|---------|
| Dashboard Products tab | On product create/edit, status should be "PendingReview" instead of direct publication |
| Admin Products panel | Add "Pending Review" filter tab to show products awaiting approval |
| Product status flow | PendingReview → Admin approves (Available) or rejects (Rejected with reason) |

> **Note:** This requires backend support. The frontend currently simulates this partially (product status select in admin panel has "Available", "Draft", "Sold", "Rejected", "Suspended" but no "PendingReview").

### Phase 8: Doc Fixes (`Base_Roles.md`)

Update the permission matrix (and any related sections) to reflect:

| Row | Current (Doc) | Target |
|-----|---------------|--------|
| Admin → Cart/Checkout/Orders/Shipping | ✅ | ❌ |
| Auctioneer → Cart/Checkout/Orders/Shipping | ❌ (not shown or assumed no) | ✅ |
| Admin → Wallet deposit | ❌ | ❌ (no change) |
| Admin → Wallet withdraw | ✅ | ✅ (no change, but enforce in code) |
| Admin → Subscriptions | ✅ | ❌ |
| Fisherman → Place bids | ❌ | ❌ (no change, but needs code enforcement) |
| Fisherman/BaitSeller → Create/Edit/Delete products | ✅ Direct | ✅ But requires admin approval |
| Auctioneer → Manage wishlist | ❌ (or not listed) | ✅ |
| Customer → Place bids | ✅ (implied) | ✅ Explicit |

### Phase 9: Update `knowledge.md`

Update the project knowledge file with:
- Updated SELLER_ROLES definition and e-commerce roles
- Note that Auctioneer is now an e-commerce role
- Note that Admin is excluded from e-commerce
- Note that only Customer can place bids

---

## 5. Open Questions

> ❓ **Resolved through interview.** No remaining open questions at this time.

If new questions arise during implementation, they should be raised before writing any code.

---

## 6. Reference: Permission Matrix (Target)

Below is the **target state** of the permission matrix after all changes are applied.

`✅` = has permission | `❌` = does not have permission | `—` = not applicable

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
| Place orders / Checkout | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cancel own pending orders | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage cart | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage wishlist | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage shipping addresses | ❌ | ✅ | ✅ | ✅ | ✅ |
| Write product reviews | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Wallet & Payments** | | | | | |
| View wallet balance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Deposit funds | ❌ | ✅ | ✅ | ✅ | ✅ |
| Withdraw funds | ✅ | ❌ | ❌ | ❌ | ❌ |
| View transaction history | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Auctions** | | | | | |
| Place a bid | ❌ | ❌ | ❌ | ❌ | ✅ |
| Submit auction requests | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve / reject requests | ❌ | ❌ | ❌ | ✅ | ❌ |
| Start an auction | ❌ | ❌ | ❌ | ✅ | ❌ |
| End an auction | ✅ | ❌ | ❌ | ✅ | ❌ |
| View auctioneer analytics | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Product Management** | | | | | |
| Create / edit / delete products (requires admin approval) | ❌ | ✅ | ✅ | ❌ | ❌ |
| Approve / reject products | ✅ | ❌ | ❌ | ❌ | ❌ |
| View own products | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Seller Profile** | | | | | |
| Create / edit seller profile | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Admin Only** | | | | | |
| Manage all users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage categories (CRUD) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage subscription plans (CRUD) | ✅ | ❌ | ❌ | ❌ | ❌ |
| View platform revenue | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage reports (view, resolve) | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Appendix A: Files to Modify

| File | Changes Needed |
|------|----------------|
| `src/shared/constants/routes.js` | Add Auctioneer to cart, checkout, shipping, order-detail route guards |
| `src/pages/wallet.js` | Hide deposit for Admin, restrict withdraw to Admin |
| `src/pages/dashboard.js` | Add Auctioneer to `isECommerceRole` |
| `src/pages/profile.js` | Include Auctioneer in orders/wishlist/shipping quick links |
| `src/index.html` | Add Auctioneer to dropdown Orders/Wishlist; add Admin to Wallet |
| `src/pages/auction-detail.js` | Block non-Customer from placing bids |
| `src/pages/dashboard.js` (Products) | Add PendingReview status + admin approval flow |
| `src/pages/admin.js` | Add Pending Review tab for product approvals |
| `knowledge.md` | Update role/permission notes |
| `Base_Roles.md` | Fix permission matrix to match target state |

## Appendix B: Route Access Matrix (Target)

| Route | Admin | Fisherman | BaitSeller | Auctioneer | Customer |
|---|---|---|---|---|---|
| Home (`#/`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Products (`#/products`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Product Detail (`#/product-detail?id=`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auctions (`#/auctions`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auction Detail (`#/auction-detail?id=`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Seller Profile (`#/seller-profile?userId=`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cart (`#/cart`) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Checkout (`#/checkout`) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Order Detail (`#/order-detail?id=`) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Profile (`#/profile`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Shipping (`#/shipping`) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Subscriptions (`#/subscriptions`) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Wallet (`#/wallet`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard (`#/dashboard`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| — Orders tab | ❌ | ✅ | ✅ | ✅ | ✅ |
| — Wishlist tab | ❌ | ✅ | ✅ | ✅ | ✅ |
| — Notifications tab | ✅ | ✅ | ✅ | ✅ | ✅ |
| — My Products tab | ❌ | ✅ | ✅ | ❌ | ❌ |
| — Auctions tab (start/manage) | ❌ | ❌ | ❌ | ✅ | ❌ |
| — Auction Requests (submit) | ❌ | ✅ | ❌ | ❌ | ❌ |
| — Auction Requests Review | ❌ | ❌ | ❌ | ✅ | ❌ |
| — Auctioneer Analytics | ❌ | ❌ | ❌ | ✅ | ❌ |
| Admin Panel (`#/admin`) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Login / Register / Forgot Password | ✅ | ✅ | ✅ | ✅ | ✅ |
| Terms / Privacy | ✅ | ✅ | ✅ | ✅ | ✅ |
