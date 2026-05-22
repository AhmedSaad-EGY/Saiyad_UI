# Sayiad — What Each User Sees

## Profile Page — What Each Role Sees

**Source:** `pages/profile.js`

| Section | Admin | Fisherman | BaitSeller | Auctioneer | Customer |
|---|---|---|---|---|---|
| **Hero — Avatar + Name + Email + Phone** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Role badge** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit Profile button** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Change Password button** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Stat — Order count** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Stat — Wishlist count** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Stat — Notification count** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quick Link — Orders** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quick Link — Wishlist** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quick Link — Addresses** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quick Link — Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quick Link — My Products** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Quick Link — Seller Dashboard** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Avatar upload** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Dashboard Tabs — What Each Role Sees

**Source:** `pages/dashboard.js`

| Tab | Admin | Fisherman | BaitSeller | Auctioneer | Customer |
|---|---|---|---|---|---|
| **Overview** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Orders** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Products** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Auctions** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Auction Requests** (submit) | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Auction Requests Review** (approve/reject) | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Auctioneer Analytics** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Wishlist** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Profile (edit)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Password (change)** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Navbar Dropdown — What Each Role Sees

**Source:** `index.html` (via `data-roles` attribute)

| Menu Item | Admin | Fisherman | BaitSeller | Auctioneer | Customer |
|---|---|---|---|---|---|
| **Profile** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **My Orders** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **My Products** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Wishlist** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Subscriptions** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin (panel)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Logout** | ✅ | ✅ | ✅ | ✅ | ✅ |
