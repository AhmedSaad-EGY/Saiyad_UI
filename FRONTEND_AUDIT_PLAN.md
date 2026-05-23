# Sayiad Frontend — Audit & Fix Plan

**Created:** 2026-05-23  
**IMPORTANT:** After each wave, READ and UPDATE `PROJECT_MAP_FRONT-END.md` with the changes made.

---

## CRITICAL

### Wave 1 — Missing translation keys
| Key | Used in | Fallback |
|-----|---------|----------|
| `common.select` | `dashboard.js:595` | `"Select"` |
| `common.required` | `dashboard.js:625` | `"Please select a product"` |
| `auction.startNew` | `dashboard.js:651` | `"Start a new auction for any product"` |
| `admin.addPlan` | `admin.js:508` | `"Add Plan"` |
| `common.name` | `admin.js:512` | `"Name"` |
| `common.tier` | `admin.js:512` | `"Tier"` |
| `common.status` | `admin.js:514` | `"Status"` |
| `common.actions` | `admin.js:514` | `"Actions"` |

### Wave 2 — `products.js:92-98` Client-side re-filtering breaks pagination
- After calling API with filter params, code re-filters items client-side
- `totalCount` from API no longer matches displayed items → pagination wrong
- Condition filter compares int (0/1) against string ("New"/"Used") — fragile
- Sort is applied client-side instead of server-side
- **Fix:** Remove lines 92-98, send correct params to API and trust the server

### Wave 3 — `admin.js:520` Hardcoded `$` for plan prices
- `$${Number(p.price).toFixed(2)}` → use `formatPrice(p.price)`
- `admin.js:599` `currency: "USD"` → change to `currency: "EGP"`

## MODERATE

### Wave 4 — `profile.js:126,137,151` Hardcoded English strings
- Avatar upload error/success messages use raw English
- Wrap in `t("")` calls

### Wave 5 — Role checks excluding Admin
- `auctioneer-analytics.js:3` — `hasAnyRole("Auctioneer")` → add `"Admin"`
- `auction-requests-review.js:3` — same

### Wave 6 — `app.js:120` Duplicate `observeAnimations`
- `utils.js:312` already defines it (with disconnect logic)
- `app.js:120` defines it again (no disconnect logic)
- **Fix:** Remove the version in `app.js` (keep `utils.js` version)

## MINOR

### Wave 7 — Various small fixes
- `checkout.js:122` — `a.fullName || a.fullName` → `a.fullName || a.name`
- `auction-requests-review.js:57-60` — Use `t()` for labels instead of fallback English
- `wallet.js:108,116,118` — Replace `var` with `let`/`const`
- `admin.js:546,552,554,556,569,570,580,592` — Replace `var` with `let`/`const`

---

## Execution Status
1. ✅ Create this file
2. ✅ Wave 1 — Missing translation keys added (8 keys)
3. ✅ Wave 2 — products.js client-side re-filtering removed
4. ✅ Wave 3 — admin.js hardcoded USD fixed (display + currency)
5. ✅ Wave 4 — profile.js avatar upload translated
6. ✅ Wave 5 — Role checks include Admin
7. ✅ Wave 6 — Duplicate observeAnimations removed
8. ✅ Wave 7 — Minor fixes (fullName, labels, var→let/const)
9. ✅ Committed (frontend)
10. ⬜ Backend changes needed? No — all frontend-only audit fixes.
11. ⬜ PROJECT_MAP updated: yes
