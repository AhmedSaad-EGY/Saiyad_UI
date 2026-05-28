# ✨ Sayiad — Premium Polish & Production Readiness Plan

> **Goal:** Every page looks and feels like a world-class marketplace — smooth animations, perfect UX, flawless responsive design, and complete accessibility.
>
> **Status:** 🟢 Planned | 🟡 In Progress | ✅ Completed | ❌ Not Started
>
> **Last Updated:** May 28, 2026

---

## 🎯 POLISH STANDARDS (Apply to Every Page)

Before diving into page-specific items, apply these universal standards:

### A. Motion & Animation
- ✅ **Page entrance**: Animate.css `fadeIn` or `fadeInUp` via `animate()` utility on page mount
- ✅ **Hover states**: All interactive elements have `transition: transform, box-shadow` (already in `_components.css`)
- ✅ **Button press**: Active state shows `scale(0.97)` (already implemented)
- ⬜ **List item stagger**: Sequential items should fade in with increasing delay (`--stagger-index`)
- ⬜ **Reduced motion**: All animations respect `prefers-reduced-motion: reduce` (check `.reduce-motion` class handling)
- ✅ **Scroll animations**: `observeAnimations()` adds `animate__fadeInUp` on scroll (already migrated)

### B. Loading States
- ⬜ **Skeleton screens**: Every data-fetching page shows skeleton BEFORE API response
- ⬜ **Button loading**: Submit/action buttons show spinner + disabled state during async
- ⬜ **Page transition**: Minimal flash between route changes (`page-fade-enter` class)
- ⬜ **Optimistic updates**: Cart, wishlist actions update UI immediately, roll back on error

### C. Empty States
- ⬜ **Every list view**: Has an icon + heading + description when data is empty
- ⬜ **Actionable empty states**: When possible, includes a CTA button ("Add your first product", "Browse auctions")
- ⬜ **Search empty states**: "No results for [query]" with suggestions

### D. Error States
- ⬜ **API failures**: Graceful error message, not "Unknown error"
- ⬜ **Network offline**: Offline banner (already implemented in app.js)
- ⬜ **Form validation**: Real-time inline errors (already in validation.js)
- ⬜ **Error recovery**: "Try again" or "Refresh" button (already in errors.js)

### E. Accessibility
- ⬜ **Skip to content**: Already present ✅
- ⬜ **Focus management**: `keyboard-nav` class toggled on first Tab press ✅
- ⬜ **ARIA labels**: All icon-only buttons have `aria-label`
- ⬜ **Status regions**: `aria-live="polite"` for dynamic updates (toast ✅)
- ⬜ **Color contrast**: All text meets WCAG AA (4.5:1 for normal text)
- ⬜ **Reduced motion**: All animations have fallback state

### F. Mobile
- ⬜ **Touch targets**: All interactive elements ≥44px (audited in Fix 23 ✅)
- ⬜ **Swipe gestures**: Edge swipe-back + cart swipe-to-delete (added ✅)
- ⬜ **Responsive tables**: Horizontal scroll on mobile (already in `_components.css`)
- ⬜ **Safe areas**: `env(safe-area-inset-*)` for notched devices (partial)
- ⬜ **Bottom bars**: Floating action bars for mobile (cart ✅, dashboard ✅)

### G. Dark Mode
- ⬜ **Every page**: Renders correctly in `[data-theme="dark"]`
- ⬜ **Images**: Dark mode may need different image treatment
- ⬜ **Glass effects**: `backdrop-filter` works in dark mode (already tuned)
- ⬜ **Form elements**: Inputs, selects have proper dark mode styling

### H. RTL
- ⬜ **Every page**: Layout flips correctly when `[dir="rtl"]`
- ⬜ **Text alignment**: All text aligned correctly
- ⬜ **Icons**: Chevrons, arrows flipped (using `inset-inline-start/end`)
- ⬜ **Margins/padding**: Logical properties (`margin-inline`, `padding-inline`)

### I. i18n
- ⬜ **Every visible string**: Goes through `t()` or `$t()` — no hardcoded English
- ⬜ **Variable interpolation**: `t('key', { name })` pattern used where needed
- ⬜ **Pluralization**: Handled correctly for Arabic (dual, plural forms)
- ⬜ **Dates/times**: Formatted with locale (toLocaleDateString('ar-EG'))

### J. Performance
- ⬜ **Code splitting**: Each page loads independently via dynamic import (✅ already done)
- ⬜ **Image lazy loading**: `loading="lazy"` on all dynamically created images
- ⬜ **Debounced inputs**: Search, filter inputs debounced at 300-400ms
- ⬜ **Reduced reflows**: Batch DOM updates, use `requestAnimationFrame` for animations

### K. Role-Gating
- ⬜ **Nav links**: Hidden/shown based on `data-roles` attributes ✅
- ⬜ **Route guards**: Redirect unauthorized users ✅
- ⬜ **Dashboard tabs**: Per-role tab visibility ✅
- ⬜ **Action buttons**: Bid UI, product creation, admin tools — all role-gated ✅
- ⬜ **Graceful degradation**: If user's role changes (session update), UI updates accordingly

---

## 📄 PAGE-BY-PAGE POLISH

---

### 1. `src/pages/home.js` — Homepage
**Current state:** ✅ Good — hero section, features grid, recently viewed, product/auction listings

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 1.1 | **Hero parallax effect**: Subtle mouse-tracking parallax on hero content | 🟢 P2 | 30 min | ❌ |
| 1.2 | **Hero tilt effect**: 3D card tilt on `.hero-content` using mouse position | 🟢 P2 | 20 min | ❌ |
| 1.3 | **Staggered entrance**: Hero heading, subtitle, buttons fade in sequentially (x-data with $nextTick) | 🟡 P1 | 15 min | ❌ |
| 1.4 | **Feature cards icon animation**: On hover, icon scales + rotates (already partial) | 🟢 P2 | 5 min | ✅ |
| 1.5 | **Recently viewed horizontal scroll**: Add scroll buttons (prev/next) for desktop | 🟡 P1 | 20 min | ❌ |
| 1.6 | **Recently viewed empty state**: If no recently viewed items, show "Start browsing" CTA | 🟡 P1 | 10 min | ❌ |
| 1.7 | **Product count badges**: Show "New" badge on products created in last 24h | 🟢 P2 | 15 min | ❌ |
| 1.8 | **Live auction countdown on homepage**: Show ending-soon auctions with animated countdown | 🟡 P1 | 30 min | ❌ |
| 1.9 | **Skeleton loading**: Full-page skeleton grid before API data arrives | 🔴 P0 | 20 min | ❌ |
| 1.10 | **Dynamic hero background**: Subtle animated gradient or particle effect (ocean theme) | 🟢 P2 | 60 min | ❌ |
| 1.11 | **Intersection counters**: Stat numbers animate up when scrolled into view | 🟢 P2 | 20 min | ❌ |
| 1.12 | **Back to top button**: Show after scrolling past hero (already in _layout.css, check if wired) | 🟡 P1 | 10 min | ❌ |

---

### 2. `src/pages/login.js` — Login
**Current state:** ✅ Good — auth form with validation, password toggle

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 2.1 | **Social login buttons**: Google/Facebook login (if backend supports) | 🟢 P2 | 30 min | ❌ |
| 2.2 | **Remember me toggle**: "Stay signed in" checkbox | 🟢 P2 | 10 min | ❌ |
| 2.3 | **Auto-focus email field**: On page mount, focus the email input | 🟡 P1 | 5 min | ❌ |
| 2.4 | **Loading state animation**: Submit button shows spinner + disables | 🔴 P0 | 10 min | ✅ |
| 2.5 | **Error shake animation**: Wrong credentials — shake form | 🟡 P1 | 10 min | ❌ |
| 2.6 | **Success transition**: Smooth fade to redirect after login | 🟡 P1 | 10 min | ❌ |
| 2.7 | **Password visibility toggle**: Eye icon toggle (already in _components.css) | 🔴 P0 | 10 min | ✅ |
| 2.8 | **Form validation**: Real-time email format validation, min password length | 🔴 P0 | 15 min | ❌ |
| 2.9 | **Rate limiting notice**: "Too many attempts. Try again in X minutes" | 🟡 P1 | 15 min | ❌ |
| 2.10 | **Background animation**: Subtle floating ocean elements or gradient shift | 🟢 P2 | 30 min | ❌ |

---

### 3. `src/pages/register.js` — Register
**Current state:** ✅ Good — registration form with password strength

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 3.1 | **Password strength meter**: Visual bar with text labels (already in _components.css) | 🔴 P0 | 15 min | ✅ |
| 3.2 | **Password requirements checklist**: Show/hide requirements (8+ chars, uppercase, number) | 🟡 P1 | 15 min | ❌ |
| 3.3 | **Confirm password**: Second field with match validation | 🔴 P0 | 10 min | ❌ |
| 3.4 | **Role selection**: Dropdown/radio for role (Customer, Fisherman, etc.) | 🔴 P0 | 20 min | ❌ |
| 3.5 | **Email verification notice**: Tell user to check email after register | 🟡 P1 | 10 min | ❌ |
| 3.6 | **Auto-login after register**: Redirect to dashboard after success | 🟡 P1 | 10 min | ✅ |
| 3.7 | **Terms acceptance checkbox**: With link to /terms | 🔴 P0 | 10 min | ❌ |
| 3.8 | **Step indicator**: Multi-step form (Account → Profile → Role) | 🟢 P2 | 45 min | ❌ |
| 3.9 | **Real-time validation**: Inline errors on blur/input for all fields | 🔴 P0 | 20 min | ❌ |
| 3.10 | **Field focus transitions**: Smooth focus ring animation | 🟡 P1 | 5 min | ❌ |

---

### 4. `src/pages/products.js` — Products Listing
**Current state:** ✅ Good — search, filters, product grid, Alpine pagination

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 4.1 | **Skeleton grid**: Show 8 skeleton cards before products load | 🔴 P0 | 20 min | ❌ |
| 4.2 | **Filter animation**: Smooth slide-down for filter sheet on mobile | 🟡 P1 | 15 min | ❌ |
| 4.3 | **Search autocomplete**: Dropdown suggestions while typing | 🟢 P2 | 30 min | ❌ |
| 4.4 | **Active filter chips**: Show active filters as removable chips above results | 🟡 P1 | 20 min | ❌ |
| 4.5 | **Sort dropdown**: Sort by price (asc/desc), newest, name | 🟡 P1 | 15 min | ❌ |
| 4.6 | **Results count**: "Showing 24 of 142 products" text | 🟡 P1 | 10 min | ❌ |
| 4.7 | **Quick view modal**: Click product card to open quick-view lightbox | 🟡 P1 | 30 min | ✅ |
| 4.8 | **Quick add to cart**: "+" button on card hover (already in _components.css) | 🟡 P1 | 15 min | ❌ |
| 4.9 | **Wishlist toggle on cards**: Heart icon on card corner | 🟡 P1 | 20 min | ❌ |
| 4.10 | **Image lazy loading**: `loading="lazy"` on all product images | 🔴 P0 | 10 min | ❌ |
| 4.11 | **Price animation**: Price change animates on filter/sort change | 🟢 P2 | 15 min | ❌ |
| 4.12 | **Mobile filter bottom sheet**: Full-screen overlay filter on mobile | 🟡 P1 | 20 min | ✅ |
| 4.13 | **Category breadcrumbs**: Show current category path | 🟢 P2 | 15 min | ❌ |
| 4.14 | **View toggle**: Grid/List view toggle buttons | 🟢 P2 | 30 min | ❌ |

---

### 5. `src/pages/product-detail.js` — Product Detail
**Current state:** ✅ Good — product info, image gallery, reviews

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 5.1 | **Image gallery**: Thumbnail strip with active state (already in _components.css) | 🔴 P0 | 15 min | ✅ |
| 5.2 | **Lightbox**: Full-screen image viewer with prev/next navigation | 🔴 P0 | 30 min | ✅ |
| 5.3 | **Image zoom**: Hover zoom effect on main image (magnifier) | 🟡 P1 | 20 min | ❌ |
| 5.4 | **Stock indicator**: Visual bar showing stock level (green/yellow/red) | 🟡 P1 | 15 min | ❌ |
| 5.5 | **Quantity selector**: +/- buttons with min/max validation (already in _components.css) | 🔴 P0 | 10 min | ❌ |
| 5.6 | **Add to cart animation**: Item flies from button to cart icon | 🟢 P2 | 30 min | ❌ |
| 5.7 | **Reviews star rating**: Interactive star rating for review submission | 🟡 P1 | 20 min | ❌ |
| 5.8 | **Review sorting**: Sort by newest, highest rating, lowest rating | 🟡 P1 | 15 min | ❌ |
| 5.9 | **Review pagination**: Load more reviews button | 🟡 P1 | 15 min | ❌ |
| 5.10 | **Related products**: Carousel/showcase of similar products | 🟡 P1 | 30 min | ❌ |
| 5.11 | **Category breadcrumb**: Products > Category > Product Name | 🟡 P1 | 10 min | ❌ |
| 5.12 | **Seller info card**: Show seller name, rating, "View Profile" link | 🟡 P1 | 10 min | ❌ |
| 5.13 | **Share buttons**: Copy link, share to social media | 🟢 P2 | 15 min | ❌ |
| 5.14 | **Sticky add-to-cart on mobile**: Bottom bar with quantity + "Add to Cart" | 🟡 P1 | 20 min | ❌ |
| 5.15 | **Wishlist toggle**: Heart button with animation | 🟡 P1 | 10 min | ❌ |

---

### 6. `src/pages/auctions.js` — Auctions Listing
**Current state:** ✅ Good — similar to products with auction-specific features

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 6.1 | **Live countdown on cards**: Mini countdown timer on each auction card | 🔴 P0 | 25 min | ❌ |
| 6.2 | **Status badges**: Active/Ending Soon/Finished badges on cards | 🔴 P0 | 10 min | ✅ |
| 6.3 | **Skeleton grid**: Skeleton cards before auctions load | 🔴 P0 | 20 min | ❌ |
| 6.4 | **Urgent filter**: Tab/filter for "Ending Today" / "Ending This Week" | 🟡 P1 | 15 min | ❌ |
| 6.5 | **Bid count display**: Show number of bids on each card | 🟡 P1 | 10 min | ❌ |
| 6.6 | **Current bid highlight**: Most recent bidder shown prominently | 🟡 P1 | 10 min | ❌ |
| 6.7 | **Reserve met badge**: "Reserve Met" green badge on qualifying auctions | 🟡 P1 | 10 min | ❌ |
| 6.8 | **Auction type indicator**: English auction vs sealed bid | 🟢 P2 | 10 min | ❌ |
| 6.9 | **Sort**: Ending soonest, newest, most bids, highest price | 🟡 P1 | 15 min | ❌ |
| 6.10 | **Watching toggle**: "Watch" button on cards to track auctions | 🟡 P1 | 15 min | ❌ |

---

### 7. `src/pages/auction-detail.js` — Auction Detail
**Current state:** ✅ Alpine rewrite complete — reactive bidding, countdown, bid history

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 7.1 | **Bid confirmation animation**: Modal or toast "Bid placed!" with bouncy checkmark | 🟡 P1 | 15 min | ❌ |
| 7.2 | **Outbid notification**: Toast/animation when another user outbids you | 🔴 P0 | 15 min | ✅ |
| 7.3 | **Countdown urgency states**: Visual change at <1 hour (red pulse), <10 min (rapid pulse) | 🟡 P1 | 20 min | ❌ |
| 7.4 | **Bid history auto-scroll**: Newest bid scrolls into view with highlight | 🟡 P1 | 10 min | ✅ |
| 7.5 | **Auto-bid confirmation**: Modal showing max bid settings with "confirm" | 🟡 P1 | 15 min | ❌ |
| 7.6 | **Bid increment helper**: Show suggested next bid amounts (quick-bid buttons) | 🔴 P0 | 15 min | ✅ |
| 7.7 | **Reserve price indicator**: "Reserve not yet met" / "Reserve met" status | 🟡 P1 | 10 min | ❌ |
| 7.8 | **Winner announcement**: Celebratory animation when auction ends + you won | 🟡 P1 | 20 min | ❌ |
| 7.9 | **Seller info**: Card showing seller stats, other auctions | 🟡 P1 | 15 min | ❌ |
| 7.10 | **Bid history table**: Full paginated table (not just last 10) | 🟡 P1 | 20 min | ❌ |
| 7.11 | **Price graph**: Small sparkline showing bid history over time | 🟢 P2 | 40 min | ❌ |
| 7.12 | **Share auction**: Copy link, social share buttons | 🟢 P2 | 15 min | ❌ |
| 7.13 | **Watchlist toggle**: Track this auction button | 🟡 P1 | 10 min | ❌ |
| 7.14 | **Similar auctions**: Carousel of similar/related auctions | 🟡 P1 | 20 min | ❌ |
| 7.15 | **Mobile sticky bid bar**: Bottom bar with current bid + "Place Bid" button | 🟡 P1 | 20 min | ❌ |

---

### 8. `src/pages/cart.js` — Shopping Cart
**Current state:** ✅ Good — quantity controls, swipe-to-delete, floating bar

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 8.1 | **Empty cart state**: Illustration + "Start shopping" CTA button | 🔴 P0 | 15 min | ❌ |
| 8.2 | **Quantity animation**: +/- buttons with smooth numeric transition | 🟡 P1 | 10 min | ❌ |
| 8.3 | **Price update animation**: Subtotal/total amount animates on quantity change | 🟡 P1 | 15 min | ❌ |
| 8.4 | **Swipe-to-delete reveal**: Red delete button revealed on swipe (already implemented ✅) | 🔴 P0 | 20 min | ✅ |
| 8.5 | **Undo delete**: Toast with "Item removed. Undo?" after deletion | 🟡 P1 | 15 min | ❌ |
| 8.6 | **Cart item image**: Small thumbnail of product | 🟡 P1 | 10 min | ❌ |
| 8.7 | **Promo code**: Discount code input with apply button | 🟡 P1 | 20 min | ❌ |
| 8.8 | **Shipping estimate**: Show estimated shipping cost in summary | 🟡 P1 | 15 min | ❌ |
| 8.9 | **Tax breakdown**: Show calculated tax amount | 🟡 P1 | 15 min | ❌ |
| 8.10 | **Save for later**: Move items to wishlist instead of delete | 🟢 P2 | 15 min | ❌ |
| 8.11 | **Stock warning**: If item is low stock, show warning badge | 🟡 P1 | 10 min | ❌ |
| 8.12 | **Free shipping progress bar**: "Add $15 more for free shipping" | 🟢 P2 | 20 min | ❌ |
| 8.13 | **Mobile card layout**: Convert table rows to stacked cards on mobile (already done ✅) | 🔴 P0 | 20 min | ✅ |

---

### 9. `src/pages/checkout.js` — Checkout
**Current state:** ⚠️ Needs work — basic checkout flow

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 9.1 | **Step indicator**: Progress bar (Cart → Shipping → Payment → Review) | 🔴 P0 | 30 min | ❌ |
| 9.2 | **Shipping address selection**: Saved addresses with radio selection | 🔴 P0 | 20 min | ❌ |
| 9.3 | **New address form**: Modal/inline form for adding new address | 🔴 P0 | 25 min | ❌ |
| 9.4 | **Payment method selection**: Card icon + radio selection (Stripe) | 🔴 P0 | 15 min | ❌ |
| 9.5 | **Order summary sidebar**: Sticky summary with itemized costs | 🟡 P1 | 20 min | ❌ |
| 9.6 | **Place order loading**: Full overlay with spinner during submission | 🔴 P0 | 15 min | ✅ |
| 9.7 | **Order confirmation**: Success page with order number, estimated delivery | 🔴 P0 | 20 min | ❌ |
| 9.8 | **Form validation**: Real-time validation on all fields | 🔴 P0 | 25 min | ❌ |
| 9.9 | **Billing same as shipping toggle**: Checkbox | 🟡 P1 | 10 min | ❌ |
| 9.10 | **Edit cart link**: Navigate back to cart from checkout | 🟡 P1 | 5 min | ❌ |
| 9.11 | **Trust badges**: SSL, secure payment, money-back icons | 🟢 P2 | 10 min | ❌ |
| 9.12 | **Mobile responsive**: Single-column layout with collapsible sections | 🔴 P0 | 20 min | ❌ |

---

### 10. `src/pages/dashboard.js` — User Dashboard
**Current state:** ✅ Good — multi-tab dashboard with overview, orders, products, etc.

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 10.1 | **Welcome card**: "Welcome back, [Name]!" with account summary | 🟡 P1 | 10 min | ❌ |
| 10.2 | **Stats cards animation**: Count-up animation for numbers (orders, revenue, products) | 🟡 P1 | 15 min | ❌ |
| 10.3 | **Quick actions**: "Add Product", "View Orders", "Deposit Wallet" cards | 🟡 P1 | 15 min | ❌ |
| 10.4 | **Order status timeline**: Visual timeline for recent orders | 🟡 P1 | 20 min | ❌ |
| 10.5 | **Mobile bottom navigation**: Fixed bottom tab bar (already in CSS) | 🔴 P0 | 15 min | ✅ |
| 10.6 | **Tab transition**: Smooth fade when switching tabs | 🟡 P1 | 10 min | ❌ |
| 10.7 | **Skeleton loading**: Skeleton for each tab's content | 🔴 P0 | 20 min | ❌ |
| 10.8 | **Notification badge on tabs**: Show count for orders/notifications tabs | 🟡 P1 | 10 min | ❌ |
| 10.9 | **Accessibility fix**: Form field missing id/name attribute (TEST_REPORT finding) | 🔴 P0 | 5 min | ❌ |
| 10.10 | **Dashboard tour**: First-visit tutorial overlay (Tour overlay CSS exists) | 🟢 P2 | 30 min | ❌ |

---

### 11. `src/pages/profile.js` — User Profile
**Current state:** ✅ Good — editable profile with avatar, stats, quick links

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 11.1 | **Avatar drag-and-drop**: Drag image onto avatar to upload | 🟢 P2 | 15 min | ❌ |
| 11.2 | **Avatar upload preview**: Show cropped preview before saving | 🟡 P1 | 15 min | ❌ |
| 11.3 | **Profile completion bar**: "80% complete" progress bar | 🟡 P1 | 15 min | ❌ |
| 11.4 | **Inline editing**: Click field to edit inline (vs separate form) | 🟢 P2 | 30 min | ❌ |
| 11.5 | **Change password section**: Expandable panel with old/new/confirm password | 🟡 P1 | 20 min | ❌ |
| 11.6 | **Activity log**: Recent actions (reviews, orders, bids) | 🟢 P2 | 25 min | ❌ |
| 11.7 | **Account deletion**: "Delete account" with confirmation modal | 🟡 P1 | 15 min | ❌ |
| 11.8 | **Notification preferences**: Email notification toggles | 🟢 P2 | 20 min | ❌ |
| 11.9 | **Linked accounts**: Link social media accounts | 🟢 P2 | 20 min | ❌ |
| 11.10 | **Language/theme persistence**: Show current preferences | 🟡 P1 | 5 min | ❌ |

---

### 12. `src/pages/admin.js` — Admin Panel
**Current state:** ✅ Good — 7 tabs with CRUD, modals, empty states

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 12.1 | **Admin stats dashboard**: Overview cards (total users, revenue, orders) on first load | 🔴 P0 | 20 min | ❌ |
| 12.2 | **Tab transition**: Smooth fade between tab content | 🟡 P1 | 10 min | ❌ |
| 12.3 | **Bulk actions**: Select multiple users/products and batch delete/update | 🟡 P1 | 25 min | ❌ |
| 12.4 | **Search in tables**: Real-time table filter for each admin tab | 🟡 P1 | 20 min | ❌ |
| 12.5 | **Export to CSV**: Download table data as CSV | 🟢 P2 | 20 min | ❌ |
| 12.6 | **Inline editing**: Click cell to edit value inline | 🟢 P2 | 30 min | ❌ |
| 12.7 | **Confirm delete modals**: "Are you sure?" with item name (already partial) | 🔴 P0 | 10 min | ✅ |
| 12.8 | **Success/error toasts**: Feedback after CRUD operations (already using toast) | 🔴 P0 | 15 min | ✅ |
| 12.9 | **Table row hover**: Highlight row on hover (already in CSS) | 🔴 P0 | 5 min | ✅ |
| 12.10 | **Mobile responsive tables**: Card view on mobile (horizontal scroll already) | 🟡 P1 | 20 min | ❌ |

---

### 13. `src/pages/wallet.js` — Wallet
**Current state:** ✅ Good — Alpine reactive with validation, balance display

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 13.1 | **Balance animation**: Amount counts up when page loads | 🟡 P1 | 15 min | ❌ |
| 13.2 | **Transaction history**: Paginated list with filter (all/deposits/withdrawals/purchases) | 🔴 P0 | 25 min | ❌ |
| 13.3 | **Deposit presets**: Quick-amount buttons ($10, $25, $50, $100) | 🟡 P1 | 15 min | ❌ |
| 13.4 | **Deposit success animation**: Checkmark + new balance count-up | 🟡 P1 | 15 min | ❌ |
| 13.5 | **Empty transaction state**: Nice illustration when no history | 🟡 P1 | 10 min | ❌ |
| 13.6 | **Wallet card design**: Premium glass card for balance display (Alpine `walletCard` component exists) | 🟡 P1 | 15 min | ✅ |
| 13.7 | **Withdraw functionality**: Withdraw to bank/card (if backend supports) | 🟡 P1 | 25 min | ❌ |
| 13.8 | **Auto-bid funding**: Set aside wallet amount for auto-bidding | 🟢 P2 | 20 min | ❌ |
| 13.9 | **Transaction detail**: Click transaction to see full details | 🟢 P2 | 15 min | ❌ |
| 13.10 | **Currency display**: Show balance in EGP with proper formatting | 🔴 P0 | 5 min | ✅ |

---

### 14. `src/pages/subscriptions.js` — Subscriptions
**Current state:** ✅ Good — plan cards with Alpine, loading states

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 14.1 | **Plan comparison table**: Side-by-side feature comparison (Free vs Basic vs Pro vs Enterprise) | 🟡 P1 | 30 min | ❌ |
| 14.2 | **Popular plan highlight**: "Most Popular" badge on the best-value plan | 🔴 P0 | 10 min | ✅ |
| 14.3 | **Annual/monthly toggle**: Show annual pricing with "Save 20%" discount | 🟡 P1 | 20 min | ❌ |
| 14.4 | **Current plan indicator**: Show which plan user is currently on | 🔴 P0 | 10 min | ❌ |
| 14.5 | **Upgrade confirmation**: Modal showing prorated amount, new features | 🟡 P1 | 15 min | ❌ |
| 14.6 | **Downgrade warning**: "You will lose access to: [features]" | 🟡 P1 | 15 min | ❌ |
| 14.7 | **Plan feature animation**: Features reveal on hover/expand | 🟢 P2 | 15 min | ❌ |
| 14.8 | **Payment method on file**: Show last 4 digits of saved card | 🟡 P1 | 10 min | ❌ |
| 14.9 | **Invoices/Billing history**: Link to past invoices | 🟢 P2 | 20 min | ❌ |
| 14.10 | **Free trial badge**: "14 days free" on paid plans | 🟡 P1 | 10 min | ❌ |

---

### 15. `src/pages/shipping.js` — Shipping Addresses
**Current state:** ⚠️ Basic CRUD

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 15.1 | **Address cards**: Clean card layout for each saved address | 🔴 P0 | 15 min | ❌ |
| 15.2 | **Default address badge**: "Default" tag on primary address | 🟡 P1 | 10 min | ❌ |
| 15.3 | **Set as default**: Button to set any address as default | 🟡 P1 | 10 min | ❌ |
| 15.4 | **Add address form validation**: Real-time validation on all fields | 🔴 P0 | 20 min | ❌ |
| 15.5 | **Address selector modal**: Reusable modal for checkout flow | 🟡 P1 | 20 min | ❌ |
| 15.6 | **Empty state**: "No addresses saved. Add one!" with CTA | 🔴 P0 | 10 min | ❌ |
| 15.7 | **Edit address**: Pre-populated form modal | 🔴 P0 | 15 min | ❌ |
| 15.8 | **Delete confirmation**: "Are you sure?" modal | 🔴 P0 | 10 min | ❌ |
| 15.9 | **Address type labels**: "Home", "Work", "Other" tags | 🟢 P2 | 10 min | ❌ |
| 15.10 | **Map preview**: Show approximate location on mini map (Google Maps embed) | 🟢 P2 | 30 min | ❌ |

---

### 16. `src/pages/seller-profile.js` — Seller Profile
**Current state:** ⚠️ Basic — public seller page

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 16.1 | **Seller hero**: Avatar, name, join date, rating, total sales | 🔴 P0 | 20 min | ❌ |
| 16.2 | **Seller stats**: Products listed, items sold, response time, rating | 🟡 P1 | 15 min | ❌ |
| 16.3 | **Contact seller button**: Open inquiry form/modal | 🟡 P1 | 15 min | ❌ |
| 16.4 | **Seller products grid**: Show seller's products with pagination | 🔴 P0 | 20 min | ❌ |
| 16.5 | **Seller reviews section**: Customer reviews about this seller | 🟡 P1 | 20 min | ❌ |
| 16.6 | **Badge/verification**: "Verified Seller" badge | 🟡 P1 | 10 min | ❌ |
| 16.7 | **Response time**: "Usually responds within X hours" | 🟢 P2 | 10 min | ❌ |
| 16.8 | **Member since**: Display join date | 🟡 P1 | 5 min | ❌ |
| 16.9 | **Active auctions**: If seller runs auctions, show them | 🟡 P1 | 15 min | ❌ |
| 16.10 | **Empty state**: Seller hasn't listed anything yet | 🟡 P1 | 10 min | ❌ |

---

### 17. `src/pages/order-detail.js` — Order Detail
**Current state:** ⚠️ Basic — order tracking

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 17.1 | **Order timeline**: Visual step-by-step status (Confirmed → Shipped → Delivered) | 🔴 P0 | 25 min | ❌ |
| 17.2 | **Order items**: List purchased items with images, quantities, prices | 🔴 P0 | 15 min | ❌ |
| 17.3 | **Shipping info**: Address, carrier, tracking number (if available) | 🟡 P1 | 10 min | ❌ |
| 17.4 | **Payment info**: Payment method, transaction ID, amounts | 🟡 P1 | 10 min | ❌ |
| 17.5 | **Cancel order button**: With confirmation modal (if status allows) | 🟡 P1 | 15 min | ❌ |
| 17.6 | **Return/refund request**: Button to initiate return | 🟢 P2 | 20 min | ❌ |
| 17.7 | **Contact seller**: Quick message to seller about this order | 🟢 P2 | 15 min | ❌ |
| 17.8 | **Track package**: Link to carrier tracking page | 🟢 P2 | 10 min | ❌ |
| 17.9 | **Order summary card**: Total, subtotal, shipping, tax breakdown | 🟡 P1 | 10 min | ❌ |
| 17.10 | **Reorder button**: One-click add all items to cart | 🟡 P1 | 10 min | ❌ |

---

### 18. `src/pages/forgot-password.js` — Forgot Password
**Current state:** ⚠️ Basic

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 18.1 | **Email validation**: Real-time email format check | 🔴 P0 | 10 min | ❌ |
| 18.2 | **Success message**: "Check your email for reset link" with icon | 🔴 P0 | 10 min | ❌ |
| 18.3 | **Back to login link**: "Remember your password? Login" | 🟡 P1 | 5 min | ❌ |
| 18.4 | **Loading state**: Submit button spinner | 🔴 P0 | 10 min | ❌ |
| 18.5 | **Error handling**: "Email not found" vs "Network error" messages | 🔴 P0 | 10 min | ❌ |
| 18.6 | **Email sent animation**: Envelope icon with fly-away effect | 🟢 P2 | 15 min | ❌ |
| 18.7 | **Resend cooldown**: "Resend email in 60s" countdown | 🟡 P1 | 15 min | ❌ |

---

### 19. `src/pages/reset-password.js` — Reset Password
**Current state:** ⚠️ Basic

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 19.1 | **Password strength meter**: Visual strength indicator (CSS exists) | 🔴 P0 | 15 min | ❌ |
| 19.2 | **Confirm password**: Second field with match validation | 🔴 P0 | 10 min | ❌ |
| 19.3 | **Token validation**: Check token validity before showing form | 🔴 P0 | 10 min | ❌ |
| 19.4 | **Success redirect**: Auto-redirect to login with success toast | 🟡 P1 | 10 min | ❌ |
| 19.5 | **Expired token handling**: "Link expired. Request new one." | 🔴 P0 | 10 min | ❌ |
| 19.6 | **Loading state**: Submit button spinner | 🔴 P0 | 10 min | ❌ |

---

### 20. `src/pages/verify-email.js` — Email Verification
**Current state:** ✅ Good — overlay animation, confetti, success state

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 20.1 | **Auto-verify on load**: Check token and show result automatically | 🔴 P0 | 15 min | ✅ |
| 20.2 | **Loading dots animation**: Three bouncing dots (CSS exists) | 🔴 P0 | 10 min | ✅ |
| 20.3 | **Success confetti**: Particle burst on verification (CSS exists) | 🟡 P1 | 20 min | ✅ |
| 20.4 | **Failed verification**: "Link expired" or "Already verified" messages | 🔴 P0 | 10 min | ❌ |
| 20.5 | **Redirect after success**: Auto-redirect to dashboard after 3s | 🟡 P1 | 10 min | ❌ |
| 20.6 | **Resend verification**: Button to send new verification email | 🟡 P1 | 10 min | ❌ |

---

### 21. `src/pages/auction-requests.js` — Auction Requests (Fisherman)
**Current state:** ⚠️ Basic — request form

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 21.1 | **Request form with validation**: Product selection, starting price, duration, reserve price | 🔴 P0 | 25 min | ❌ |
| 21.2 | **Existing requests list**: Show submitted requests with status (Pending/Approved/Rejected) | 🔴 P0 | 20 min | ❌ |
| 21.3 | **Status badges**: Color-coded status badges (CSS exists) | 🟡 P1 | 10 min | ✅ |
| 21.4 | **Empty state**: "No auction requests yet. Submit one!" | 🟡 P1 | 10 min | ❌ |
| 21.5 | **Form preview**: Show auction preview before submission | 🟡 P1 | 15 min | ❌ |
| 21.6 | **Loading state**: Submit button spinner | 🔴 P0 | 10 min | ❌ |
| 21.7 | **Success toast**: Request submitted confirmation | 🔴 P0 | 10 min | ❌ |

---

### 22. `src/pages/auction-requests-review.js` — Review Requests (Moderator)
**Current state:** ⚠️ Basic — approve/reject flow

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 22.1 | **Requests list**: Paginated list with search/filter by status | 🔴 P0 | 20 min | ❌ |
| 22.2 | **Approve modal**: Confirm approval with optional notes | 🔴 P0 | 15 min | ✅ |
| 22.3 | **Reject modal**: Require rejection reason (sent to Fisherman) | 🔴 P0 | 15 min | ✅ |
| 22.4 | **Request detail view**: Expand/collapse to see full request details | 🟡 P1 | 15 min | ❌ |
| 22.5 | **Batch actions**: Select multiple and approve/reject in bulk | 🟡 P1 | 20 min | ❌ |
| 22.6 | **Empty state**: "No pending requests" | 🟡 P1 | 10 min | ❌ |
| 22.7 | **Loading state**: Skeleton for request list | 🔴 P0 | 10 min | ❌ |
| 22.8 | **Sort**: Newest first, status filter | 🟡 P1 | 10 min | ❌ |

---

### 23. `src/pages/auctioneer-analytics.js` — Analytics Dashboard
**Current state:** ⚠️ Basic — stats

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 23.1 | **Stats cards**: Total auctions, active, completed, revenue | 🔴 P0 | 15 min | ❌ |
| 23.2 | **Charts**: Simple bar/line charts (use a lightweight lib or Canvas) | 🟡 P1 | 40 min | ❌ |
| 23.3 | **Date range picker**: Filter analytics by date range | 🟡 P1 | 20 min | ❌ |
| 23.4 | **Top auctions**: List of highest-grossing auctions | 🟡 P1 | 15 min | ❌ |
| 23.5 | **Auctioneer leaderboard**: Top auctioneers by volume/revenue | 🟢 P2 | 20 min | ❌ |
| 23.6 | **Category breakdown**: Pie/donut chart by category | 🟢 P2 | 20 min | ❌ |
| 23.7 | **Export report**: Download analytics as PDF/CSV | 🟢 P2 | 25 min | ❌ |
| 23.8 | **Empty state**: No data available yet | 🟡 P1 | 10 min | ❌ |
| 23.9 | **Skeleton loading**: Skeleton for stat cards | 🟡 P1 | 15 min | ❌ |

---

### 24. & 25. `src/pages/privacy.js` & `src/pages/terms.js` — Legal Pages
**Current state:** ✅ Good — well-structured with TOC, section anchors, responsive

| # | Polish Item | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| 24.1 | **Print-friendly styles**: `@media print` CSS for legal pages | 🟢 P2 | 10 min | ❌ |
| 24.2 | **Last updated date**: Show "Last updated: [date]" at top | 🟡 P1 | 5 min | ❌ |
| 24.3 | **Jump-to-top**: Each section header has "Back to top" link | 🟢 P2 | 10 min | ❌ |
| 24.4 | **Active TOC highlight**: Highlight current section in TOC on scroll | 🟡 P1 | 15 min | ❌ |
| 24.5 | **Language toggle**: Switch between EN/AR versions | 🟡 P1 | 10 min | ❌ |

---

## 🎨 GLOBAL UI/UX ENHANCEMENTS

These improvements apply across multiple pages or globally:

| # | Enhancement | Priority | Effort | Status |
|---|-------------|----------|--------|--------|
| G1 | **Global loading indicator**: Top-of-page progress bar during route transitions (YouTube-style) | 🟡 P1 | 15 min | ❌ |
| G2 | **Page transition animation**: Smooth fade-slide between routes | 🟡 P1 | 20 min | ❌ |
| G3 | **Notification center**: Bell icon → dropdown with unread count, mark-as-read | 🔴 P0 | 30 min | ❌ |
| G4 | **Global search**: Cmd+K / Ctrl+K search overlay for products/auctions | 🟢 P2 | 40 min | ❌ |
| G5 | **Scroll to top on route change**: Auto-scroll to top when navigating | 🔴 P0 | 5 min | ❌ |
| G6 | **Connection status indicator**: Show "You are offline" banner (already exists) | 🔴 P0 | — | ✅ |
| G7 | **Keyboard shortcuts**: Navigation shortcuts (1→Home, 2→Products, 3→Auctions, etc.) | 🟢 P2 | 20 min | ❌ |
| G8 | **Toast stacking**: Multiple toasts stack vertically (already in toast.js) | 🟡 P1 | — | ✅ |
| G9 | **Pull-to-refresh**: Swipe down to refresh on mobile (CSS exists) | 🟡 P1 | 15 min | ❌ |
| G10 | **Reduced motion toggle**: Respect system preference + manual toggle button | 🟡 P1 | 15 min | ✅ |
| G11 | **Theme transition**: Smooth color transition when switching dark/light mode | 🔴 P0 | 10 min | ✅ |
| G12 | **Focus trap in modals**: Tab stays within modal when open | 🟡 P1 | 15 min | ❌ |

---

## 📋 EXECUTION PLAN

### Sprint 1: Critical UX Fixes (Week 1)
| Order | Item | Est. Time |
|-------|------|-----------|
| 1 | G5: Scroll to top on route change | 5 min |
| 2 | 10.9: Fix dashboard form field id/name | 5 min |
| 3 | 18.1, 19.1-19.3: Password reset & forgot password polish | 35 min |
| 4 | 8.1, 15.6, 13.5, 21.4, 22.6, 23.8: Empty states for all missing pages | 60 min |
| 5 | 4.1, 6.3, 10.7, 1.9: Skeleton loading for major listing pages | 60 min |
| 6 | 12.1: Admin stats dashboard | 20 min |

**Total Sprint 1:** ~3 hours

### Sprint 2: Core Page Polish (Week 2)
| Order | Item | Est. Time |
|-------|------|-----------|
| 1 | 7.1-7.15: Auction detail polish | 3 hours |
| 2 | 5.1-5.15: Product detail polish | 3 hours |
| 3 | 17.1-17.10: Order detail polish | 2 hours |
| 4 | 9.1-9.12: Checkout polish | 3 hours |

**Total Sprint 2:** ~11 hours

### Sprint 3: Remaining Pages (Week 3)
| Order | Item | Est. Time |
|-------|------|-----------|
| 1 | 4.1-4.14: Products listing polish | 3 hours |
| 2 | 6.1-6.10: Auctions listing polish | 2 hours |
| 3 | 11.1-11.10: Profile polish | 2 hours |
| 4 | 21.1-21.7, 22.1-22.8, 23.1-23.9: Admin/MOD pages | 3 hours |
| 5 | 24.1-24.5: Legal pages polish | 30 min |

**Total Sprint 3:** ~10.5 hours

### Sprint 4: Global Enhancements (Week 4)
| Order | Item | Est. Time |
|-------|------|-----------|
| 1 | G1: Global route loading indicator | 15 min |
| 2 | G2: Page transition animation | 20 min |
| 3 | G4: Global search (Cmd+K) | 40 min |
| 4 | G7: Keyboard shortcuts | 20 min |
| 5 | G12: Focus trap in modals | 15 min |
| 6 | G9: Pull-to-refresh | 15 min |
| 7 | 1.2, 1.10: Hero effects | 90 min |
| 8 | Final cross-browser testing | 60 min |

**Total Sprint 4:** ~5 hours

---

## ✅ VERIFICATION CHECKLIST

Before marking any page as "premium ready", verify:

- [ ] **Page loads with skeleton** (not blank/loading spinner)
- [ ] **All text is i18n-compliant** (no hardcoded English displayed)
- [ ] **RTL renders correctly** (toggle to Arabic and check)
- [ ] **Dark mode renders correctly** (toggle theme and check)
- [ ] **Mobile responsive** (test at 375px, 768px, 1024px)
- [ ] **Touch targets ≥44px** (all interactive elements)
- [ ] **Keyboard navigable** (Tab through all interactive elements)
- [ ] **Screen reader friendly** (ARIA labels, roles, live regions)
- [ ] **Reduced motion respected** (all animations have fallback)
- [ ] **Error state handled** (API failure shows graceful error)
- [ ] **Empty state handled** (no data shows helpful message)
- [ ] **Loading state handled** (async operations show spinner/skeleton)
- [ ] **Role-gated correctly** (right users see right content)
- [ ] **Console has 0 errors** (no 403s, no JS errors, no warnings)
- [ ] **Page entrance animation** (smooth fade-in on mount)
- [ ] **Hover states present** (buttons, cards, links have hover effects)
- [ ] **Transitions are smooth** (60fps, no jank)

---

*Last updated: May 28, 2026 — Keep this checklist updated as pages are polished!*
