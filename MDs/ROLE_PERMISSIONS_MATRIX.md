# Role-Based Access Control (RBAC) — Permissions Matrix

> **Generated:** June 4, 2026  
> **Source:** Sayiad Backend (`.NET 10` — `Sayiad.API/Controllers/*.cs`)  
> **Roles defined in:** `Sayiad.Data/Models/UserRole.cs`

## User Roles

| Role                          | Description                                        |
| ----------------------------- | -------------------------------------------------- |
| **Admin**                     | Platform administrator — full system access        |
| **Customer**                  | Consumer who buys products / places bids           |
| **Fisherman**                 | Fisher who sells fish products & requests auctions |
| **BaitSeller**                | Seller who sells bait/tackle products              |
| **Auctioneer**                | Manager who creates & moderates auctions           |
| **Guest** _(unauthenticated)_ | Public user — no login required                    |

---

## Permissions Matrix

| #   | Controller / Action             | HTTP   | Guest | Customer | Fisherman | BaitSeller | Auctioneer | Admin |
| --- | ------------------------------- | ------ | ----- | -------- | --------- | ---------- | ---------- | ----- |
|     | **AuthController**              |
| 1   | Register                        | POST   | ✅    | —        | —         | —          | —          | —     |
| 2   | Login                           | POST   | ✅    | —        | —         | —          | —          | —     |
| 3   | Refresh token                   | POST   | ✅    | —        | —         | —          | —          | —     |
| 4   | Logout                          | POST   | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 5   | ChangePassword                  | POST   | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 6   | VerifyEmail                     | GET    | ✅    | —        | —         | —          | —          | —     |
| 7   | ResendVerification              | POST   | ✅    | —        | —         | —          | —          | —     |
| 8   | ForgotPassword                  | POST   | ✅    | —        | —         | —          | —          | —     |
| 9   | VerifyResetCode                 | POST   | ✅    | —        | —         | —          | —          | —     |
| 10  | ResetPassword                   | POST   | ✅    | —        | —         | —          | —          | —     |
|     | **UsersController**             |
| 11  | GetProfile                      | GET    | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 12  | UpdateProfile                   | PUT    | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 13  | GetCurrentUser                  | GET    | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 14  | GetAll (users)                  | GET    | —     | —        | —         | —          | —          | ✅    |
| 15  | GetById (user)                  | GET    | —     | —        | —         | —          | —          | ✅    |
| 16  | ToggleStatus                    | PATCH  | —     | —        | —         | —          | —          | ✅    |
|     | **ProductsController**          |
| 17  | GetAll                          | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
| 18  | GetById                         | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
| 19  | Create                          | POST   | —     | —        | ✅        | ✅         | —          | ✅    |
| 20  | Update                          | PUT    | —     | —        | ✅        | ✅         | —          | ✅    |
| 21  | Delete                          | DELETE | —     | —        | ✅        | ✅         | —          | ✅    |
| 22  | GetMyProducts                   | GET    | —     | —        | ✅        | ✅         | —          | ✅    |
| 23  | AddImage                        | POST   | —     | —        | ✅        | ✅         | —          | ✅    |
| 24  | DeleteImage                     | DELETE | —     | —        | ✅        | ✅         | —          | ✅    |
| 25  | GetPendingReview                | GET    | —     | —        | —         | —          | —          | ✅    |
| 26  | Approve                         | PATCH  | —     | —        | —         | —          | —          | ✅    |
| 27  | Reject                          | PATCH  | —     | —        | —         | —          | —          | ✅    |
| 28  | UpdateStatus                    | PATCH  | —     | —        | —         | —          | —          | ✅    |
|     | **CategoriesController**        |
| 29  | GetAll                          | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
| 30  | GetById                         | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
| 31  | Create                          | POST   | —     | —        | —         | —          | —          | ✅    |
| 32  | Update                          | PUT    | —     | —        | —         | —          | —          | ✅    |
| 33  | Delete                          | DELETE | —     | —        | —         | —          | —          | ✅    |
|     | **AuctionsController**          |
| 34  | GetActive                       | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
| 35  | GetById                         | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
| 36  | Create                          | POST   | —     | —        | —         | —          | ✅         | ✅    |
| 37  | EndAuction                      | POST   | —     | —        | —         | —          | ✅         | ✅    |
| 38  | GetPendingRequests              | GET    | —     | —        | —         | —          | ✅         | ✅    |
| 39  | ApproveRequest                  | POST   | —     | —        | —         | —          | ✅         | ✅    |
| 40  | RejectRequest                   | POST   | —     | —        | —         | —          | ✅         | ✅    |
| 41  | GetAuctioneerDashboard          | GET    | —     | —        | —         | —          | ✅         | ✅    |
| 42  | PlaceBid                        | POST   | —     | ✅       | —         | —          | —          | ✅    |
| 43  | SubmitRequest                   | POST   | —     | —        | ✅        | —          | —          | ✅    |
| 44  | GetMyRequests                   | GET    | —     | —        | ✅        | —          | —          | ✅    |
|     | **CartController**              |
| 45  | GetCart                         | GET    | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 46  | AddItem                         | POST   | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 47  | UpdateItem                      | PUT    | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 48  | RemoveItem                      | DELETE | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 49  | Clear                           | DELETE | —     | ✅       | ✅        | ✅         | —          | ✅    |
|     | **OrdersController**            |
| 50  | Create                          | POST   | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 51  | GetMyOrders                     | GET    | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 52  | GetSellerOrders                 | GET    | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 53  | GetById                         | GET    | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 54  | Cancel                          | PUT    | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 55  | UpdateStatus                    | PUT    | —     | —        | —         | —          | —          | ✅    |
|     | **PaymentsController**          |
| 56  | Initiate                        | POST   | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 57  | Confirm                         | POST   | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 58  | GetOrderPayments                | GET    | —     | ✅       | ✅        | ✅         | —          | ✅    |
|     | **ReviewsController**           |
| 59  | GetProductReviews               | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
| 60  | GetProductRating                | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
| 61  | Create                          | POST   | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 62  | Delete                          | DELETE | —     | ✅       | ✅        | ✅         | —          | ✅    |
|     | **ReportsController**           |
| 63  | Create                          | POST   | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 64  | GetAll                          | GET    | —     | —        | —         | —          | —          | ✅    |
| 65  | GetById                         | GET    | —     | —        | —         | —          | —          | ✅    |
| 66  | Resolve                         | PUT    | —     | —        | —         | —          | —          | ✅    |
|     | **SellerProfileController**     |
| 67  | Create                          | POST   | —     | —        | ✅        | ✅         | —          | ✅    |
| 68  | Update                          | PUT    | —     | —        | ✅        | ✅         | —          | ✅    |
| 69  | GetMyProfile                    | GET    | —     | —        | ✅        | ✅         | —          | ✅    |
| 70  | GetDashboard                    | GET    | —     | —        | ✅        | ✅         | —          | ✅    |
| 71  | GetByUserId                     | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
|     | **ShippingAddressesController** |
| 72  | Create                          | POST   | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 73  | GetMyAddresses                  | GET    | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 74  | Delete                          | DELETE | —     | ✅       | ✅        | ✅         | —          | ✅    |
|     | **WishlistController**          |
| 75  | GetWishlist                     | GET    | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 76  | Toggle                          | POST   | —     | ✅       | ✅        | ✅         | —          | ✅    |
| 77  | Remove                          | DELETE | —     | ✅       | ✅        | ✅         | —          | ✅    |
|     | **WalletController**            |
| 78  | GetWallet                       | GET    | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 79  | GetTransactions                 | GET    | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 80  | Deposit                         | POST   | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
|     | **NotificationsController**     |
| 81  | GetAll                          | GET    | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 82  | GetUnreadCount                  | GET    | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 83  | MarkAsRead                      | PUT    | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 84  | MarkAllAsRead                   | PUT    | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
|     | **SubscriptionPlansController** |
| 85  | GetAll                          | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
| 86  | GetById                         | GET    | ✅    | ✅       | ✅        | ✅         | ✅         | ✅    |
| 87  | Create                          | POST   | —     | —        | —         | —          | —          | ✅    |
| 88  | Update                          | PUT    | —     | —        | —         | —          | —          | ✅    |
| 89  | Delete                          | DELETE | —     | —        | —         | —          | —          | ✅    |
|     | **SubscriptionsController**     |
| 90  | Upgrade                         | POST   | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 91  | GetMySubscription               | GET    | —     | ✅       | ✅        | ✅         | ✅         | ✅    |
| 92  | GetAll                          | GET    | —     | —        | —         | —          | —          | ✅    |
|     | **UploadController**            |
| 93  | Upload                          | POST   | —     | ✅       | ✅        | ✅         | ✅         | ✅    |

---

## Summary: Accessible Endpoints Per Role

| Role           | Public | Authenticated (general) | E-Commerce | Seller | Moderator | Admin-only | Total Accessible |
| -------------- | ------ | ----------------------- | ---------- | ------ | --------- | ---------- | ---------------- |
| **Guest**      | 17     | 0                       | 0          | 0      | 0         | 0          | **17**           |
| **Customer**   | 17     | 18                      | 26         | 0      | 0         | 0          | **61**           |
| **Fisherman**  | 17     | 18                      | 26         | 15     | 0         | 0          | **76**           |
| **BaitSeller** | 17     | 18                      | 26         | 15     | 0         | 0          | **76**           |
| **Auctioneer** | 17     | 18                      | 0          | 0      | 6         | 0          | **41**           |
| **Admin**      | 17     | 18                      | 0          | 0      | 6         | 37         | **78**           |

> **Note:** Admin is listed with access to seller/moderator endpoints because `[Authorize(Roles = "X,Y")]` checks are inclusive. Where the backend code explicitly includes `Admin` in the role list alongside other roles, Admin inherits that access. The "Admin-only" column counts endpoints where **only** Admin is listed (e.g., `[Authorize(Roles = "Admin")]`).

---

## Role Groupings (from Front-End)

From `src/shared/constants/roles.js`:

```
SELLER_ROLES   = [Fisherman, BaitSeller]
ECOMMERCE_ROLES = [Customer, Fisherman, BaitSeller, Auctioneer]
MODERATOR_ROLES = [Auctioneer, Admin]
```

---

## Key Observations

1. **Admin** has the broadest access (78 endpoints), lacking only role-specific write operations like `PlaceBid` or `SubmitRequest` which are Customer/Fisherman-exclusive. However, Admin can still perform these via management endpoints (e.g., approving products, managing users, updating order status).

2. **Fisherman** and **BaitSeller** have identical permission sets — both are "sellers" with full e-commerce + seller profile + product management access.

3. **Auctioneer** is specialized — no e-commerce/seller access, but has full auction moderation (requests, approvals, dashboard).

4. **Customer** has pure e-commerce access (cart, orders, payments, reviews, wishlist, billing).

5. **Guest** can only browse public data (products, auctions, categories, reviews, subscription plans, public seller profiles).
