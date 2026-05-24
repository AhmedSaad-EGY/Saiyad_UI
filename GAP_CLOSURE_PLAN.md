# Post-Refactor Gap Closure Plan

**Generated:** 2026-05-24 (deep-audit corrected)
**Context:** 11-phase refactor complete. Deep audit found 17 issues. All fixed.

---

## Phase A — Fix `Alpine.start()` (CRITICAL) ✅

`src/core/stores/alpine.js` was registering stores, magics, and components but never calling `Alpine.start()`. Alpine was completely dead across all 9 migrated pages.

**Fix:** Added `Alpine.start()` at end of `alpine.js:91`.

---

## Phase B — Fix runtime crashes (CRITICAL) ✅

### B1 — Register.js missing `validateForm` import ✅
`validateForm()` called at register.js:69 but never imported. Added to import from `validation.js`.

### B2 — Dashboard.js missing `ROLES` import ✅
`ROLES.CUSTOMER`, `ROLES.FISHERMAN`, `ROLES.BAIT_SELLER` used at dashboard.js:20 but only `SELLER_ROLES` was imported. Added `ROLES` to the import.

### B3 — SignalR logout listener event mismatch ✅
Listened for DOM event `"logout"` on `document` but auth emits `"auth:logged-out"` on event bus. Changed to `on('auth:logged-out', ...)` using event bus import.

### B4 — Dashboard.js missing `updateCartBadge`, `updateNotifBadge` (MISSED by initial audit)  ✅
`updateCartBadge()` called at line 748, `updateNotifBadge()` at lines 803,813 — neither imported. Both exported from `core/auth/index.js`. Added to import.

---

## Phase C — Fix Alpine template function references (HIGH) ✅

Alpine evaluates template expressions in component scope, not module scope. Module-level functions called in `x-text`, `:aria-label`, `@input` etc. must be returned in the `data()` object.

| File | Functions added | Why |
|------|----------------|-----|
| login.js | `t` | Used in `:aria-label`, `x-text` |
| register.js | `t` | Used in `:aria-label`, `x-text` |
| forgot-password.js | `t` | Used in `x-text` at 3 locations |
| reset-password.js | `t` | Used in `x-text` |
| cart.js | `t, formatPrice` | Used in `:aria-label`, `x-text` (4 formatPrice calls) |
| checkout.js | `t, formatPrice, clearFieldError` | Used in `x-text`, `:aria-label`, `@input` (4 clearFieldError calls) |
| profile.js | *(none needed)* | `t` only used in JS template literals, not Alpine directives |

---

## Phase D — Fix checkout.js nested `x-text` bug (MEDIUM) ✅

checkout.js:162 had `<small x-text="...">` nested inside `<span x-text="...">`. Alpine's `x-text` sets `textContent`, erasing the `<small>` child. Quantity indicator was invisible.

**Fix:** Restructured to use an inner `<span x-text>` for the title, keeping `<small>` as a sibling.

---

## Phase E — Delete dead files (MEDIUM) ✅

- Root `index.html` — already absent (deleted by earlier cleanup)
- Root `css/` directory — already absent (deleted by earlier cleanup)

---

## Phase F — Remove unused imports (LOW) ✅

Planned removals in the original plan were **mostly wrong** — all imports in `login.js`, `register.js`, `forgot-password.js`, `reset-password.js`, `dashboard.js`, `cart.js`, `checkout.js`, `auth/index.js`, and `router/index.js` are actually used.

Only **2 real unused imports** existed:
- `app.js` (src/core/app.js): removed `isAuthenticated` and `updateNavbar` from the auth import (unreferenced in the file body).

---

## Phase G — Dead export cleanup (LOW) ✅

Original plan had several **inaccuracies** corrected by deep audit:

| Item | Status |
|------|--------|
| `shared/components/index.js` | **ALIVE** — imported by `alpine.js` (not dead) |
| `features/auth/validation.js` | **DEAD** — file never existed, no references |
| `features/wallet/components.js` | **DEAD** — file never existed |
| `features/profile/helpers.js` | **DEAD** — file never existed |
| `dom.js` exports (`$`, `showErrorWithRetry`, `transitionContent`, `disconnectAnimObserver`) | **None existed** — only `$$` is the actual export |
| `features/auctions/helpers.js` | **DEAD** — file existed, exported `formatAuctionCountdown` but was never imported by anything. **Deleted.** |

---

## Phase H — Optional polish (LOW)

- `window._routeCleanups` → module-level `let routeCleanups = []` in `router/index.js`
- Replace `__x.getUnobservedData()` in `forgot-password.js` with proper `registerRouteCleanup` pattern

(Not yet done — lowest priority.)

---

## Build status

All phases pass: **53 modules, 0 errors.**
