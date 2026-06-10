# Consolidated Security & System Audit Report

**Date:** 2026-06-11
**Scope:** 263 files (152 frontend + 111 backend)
**Findings:** 95 defects (18 CRITICAL, 39 HIGH, 25 MEDIUM, 13 LOW)
**Strike 4:** 15 fixed — 63 remaining

---

## Strike 1 — Completed (2026-06-11)

| Issue | Fix | File:Line |
|-------|-----|-----------|
| B-002 | Hard-override registration role to `UserRole.Customer` — discards client-provided role entirely | `AuthManager.cs:32-33,44` |
| F-001 | Added base64url conversion (`.replace(/-/g, '+').replace(/_/g, '/')`) before `atob()` | `auth-state.js:13` |
| F-002 | Removed duplicate `/api` from CSRF fetch URL | `csrf.js:51` |
| F-007 | Replaced dead `if (data.accessToken)` with unconditional `#/login?registered=1` redirect; removed `setAccessToken` + `emit` imports | `register.js:55-62,1,6` |

---

## Strike 2 — Completed (2026-06-11)

| Issue | Fix | File:Line |
|-------|-----|-----------|
| F-003, F-004, F-005 | Rewrote `renderEmptyState` — replaced `innerHTML` with `document.createElement` + `textContent`; SVG handled via `safeSetHTML` | `dom.js:80-138` |
| F-008 | Removed `onclick="event.stopPropagation()"` (redundant — `e.target === overlay` guard exists) | `auction-modal.js:24` |
| F-009 | Replaced `innerHTML` for select options, spinner toggle, alert div — moved to DOM methods + pre-existing spinner element | `auction-modal.js:67,70,89,91,110` |
| F-052 | Changed `x-html="bidAlert"` → `x-text="bidAlert"` + removed `escapeHtml()` wrapper on error message (plain text via `x-text` is safe) | `render-main.js:166`, `bid.js:244` |
| F-053 | Changed `x-html="alert"` → reactive `alertMessage`/`alertType`/`showDepositLink` state; deposit link rendered via `<template x-if>` | `render-checkout-form.js:165`, `checkout.js:24,78,82,121,137` |

---

## Strike 3 — Completed (2026-06-11)

| Issue | Fix | File:Line |
|-------|-----|-----------|
| F-006 | Rewrote lightbox `render()` — replaced `innerHTML` with `document.createElement`; `<img src>` set via `.src` property (safe, no HTML injection) | `ui.js:271-289` |
| F-011 | Removed `Alpine.initTree?.(container)` — `@alpinejs/csp` does not expose `initTree`; Alpine auto-initializes | `pages/checkout.js:23` |
| F-012 | Added `.catch()` handler to `verifyEmail().then()` — renders error UI on network/server failure | `pages/verify-email.js:20` |
| F-013 | Replaced `onerror="..."` inline handler with Alpine `@error="imgError"` directive + handler method | `render-checkout-form.js:138`, `checkout.js` |
| F-014 | Replaced `submit.innerHTML` for spinner with `document.createElement` + `textContent` toggling | `requests.js:73,91-92` |
| F-015 | Replaced `deleteEl.innerHTML` with `document.createElement('i')` + `.className` | `cart/index.js:186` |
| F-016 | Fixed PascalCase query params: `SellerId`→`sellerId`, `PageSize`→`pageSize`, `Page`→`page` | `seller-profile/index.js:8` |
| F-017 | Wrapped `await requireAuth()` inside `try-catch` — unhandled rejection eliminated | `global-ui.js:28-41` |
| B-003 | Replaced `ex.Message` in generic `Exception` response with sanitized generic message; full details still logged | `ExceptionMiddleware.cs:35-38` |

---

## Strike 4 — Completed (2026-06-11)

| Issue | Fix | File:Line |
|-------|-----|-----------|
| F-021 | Replaced `innerHTML` for 404 page with `document.createElement` + `textContent` + `appendChild` | `router.js` |
| F-022 | Replaced `innerHTML` for SW update banner with DOM methods | `sw.js` |
| F-023 | Replaced `innerHTML` for swipe-back indicator with DOM methods | `swipe-back.js` |
| F-024 | Replaced `innerHTML` for tour overlay with DOM methods | `tour.js` |
| F-025 | Replaced `innerHTML` for offline/online banners with DOM methods | `offline.js` |
| F-026 | Replaced `innerHTML` for SignalR reconnection banner with DOM methods | `realtime.js` |
| F-027 | Replaced `innerHTML` for theme toggle icon with DOM methods | `theme.js` |
| F-047 | Removed `onclick="event.stopPropagation()"` (redundant) | `render-plans.js:16` |
| F-048 | Replaced `onclick` with `addEventListener` via `close()` ref | `product-card.js:71-72` |
| F-049 | Replaced `onclick` with `addEventListener` via ID | `product-detail.js:116` |
| F-050 | Replaced `onclick` with `addEventListener` via DOM methods | `loader.js:27-28` |
| F-051 | Replaced `onclick="loadWalletTransactions()"` with ID-based `addEventListener` | `render-transactions.js:50`, `wallet.js` |
| F-018 | Wrapped `async` logout handler in `try-catch` | `navbar.js:73-80` |
| F-019 | Added `.catch()` to both `router()` call sites | `router.js` |
| F-020 | Wrapped `setTimeout` async callback in `try-catch` | `router.js` |

---

## Consolidated Defect Table

| Issue ID | Layer | File Path | Line | Exact Technical Defect | Severity | Status |
|----------|-------|-----------|------|------------------------|----------|--------|
| B-001 | Backend | `Sayiad.Domain/Dtos/AuthDtos/AuthDto.cs` | 3 | `RegisterRequest` missing `birthdate` and `confirmPassword` — frontend sends them, backend silently drops them | CRITICAL | Open |
| B-002 | Backend | `Sayiad.Domain/Dtos/AuthDtos/AuthDto.cs` | 3 | Client-controlled `Role` parameter allows self-registration as `"Admin"` — no server-side enum restriction at DTO level | CRITICAL | ✅ Fixed |
| B-003 | Backend | `Sayiad.API/Middleware/ExceptionMiddleware.cs` | 35-38 | Generic `Exception` handler leaks `ex.Message` (file paths, SQL, stack) into HTTP response body | CRITICAL | ✅ Fixed |
| B-004 | Backend | `Sayiad.API/Middleware/ExceptionMiddleware.cs` | 14-18 | No `response.HasStarted` guard — double exception crashes pipeline on streaming responses | HIGH | Open |
| B-005 | Backend | `Sayiad.API/Middleware/InputSanitizationMiddleware.cs` | 16-24, 27-44 | Only sanitizes Form/Query data, NOT JSON request bodies — XSS bypass | HIGH | Open |
| B-006 | Backend | `Sayiad.API/Program.cs` | 43-52 | JWT token accepted from `access_token` query param — token leaks into server logs | HIGH | Open |
| B-007 | Backend | `Sayiad.API/Controllers/AuthController.cs` | 40-44 | No refresh token rotation or invalidation after use — replay attack vector | HIGH | Open |
| B-008 | Backend | `Sayiad.API/Program.cs` | — | No audit logging for security-critical operations (login, admin actions, payments) | HIGH | Open |
| B-009 | Backend | `Sayiad.API/Program.cs` | — | No security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy | HIGH | Open |
| B-010 | Backend | `Sayiad.API/Program.cs` | 180-184 | Swagger enabled in production — full API surface (endpoints, schemas, auth) exposed | HIGH | Open |
| B-011 | Backend | `Sayiad.Domain/Dtos/WalletDtos/WalletResponse.cs` | 3 | `DepositRequest` has no FluentValidation validator — zero/negative amounts accepted | HIGH | Open |
| B-012 | Backend | All 18 `*Controller.cs` files | — | `int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)` — null + format exception on missing claim | HIGH | Open |
| B-013 | Backend | `Sayiad.Domain/Dtos/AuthDtos/AuthDto.cs` | 7 | `AuthResponse.Token` serializes as `"token"` — frontend reads `data.accessToken` in `register.js:55` | HIGH | Open |
| F-001 | Frontend | `src/shared/utils/auth-state.js` | 13 | JWT base64url decoding uses `atob()` — fails on standard JWT base64url chars (`-`, `_`) | CRITICAL | ✅ Fixed |
| F-002 | Frontend | `src/shared/utils/csrf.js` | 51 | Duplicated `/api` in CSRF URL: `APP_CONFIG.apiBaseUrl` already ends with `/api`, then `/api/antiforgery/token` appended → `.../api/api/...` — always 404 | CRITICAL | ✅ Fixed |
| F-003 | Frontend | `src/shared/utils/dom.js` | 95, 97 | XSS: `actionHref`, `actionText` unsanitized in `renderEmptyState()` — arbitrary HTML injection | CRITICAL | ✅ Fixed |
| F-004 | Frontend | `src/shared/utils/dom.js` | 103-106, 122 | XSS: `icon` parameter injected as raw SVG (onload), `<img src>` (onerror), and class attribute (attr breakout) — no sanitization | CRITICAL | ✅ Fixed |
| F-005 | Frontend | `src/shared/utils/dom.js` | 128-134 | XSS: `title`, `desc`, `visual` all interpolated directly into `innerHTML` without escaping | CRITICAL | ✅ Fixed |
| F-006 | Frontend | `src/shared/utils/ui.js` | 274-279 | XSS: `images[current]` used directly in `<img src="">` without sanitization in `openLightbox` | CRITICAL | ✅ Fixed |
| F-007 | Frontend | `src/features/auth/register.js` | 55 | `if (data.accessToken)` always falsy — `data.accessToken` never exists (backend returns `token`). `#/login?registered=1` redirect is dead code | CRITICAL | ✅ Fixed |
| F-008 | Frontend | `src/features/auctions/auction-modal.js` | 23-24 | CSP violation: `innerHTML` for entire modal + inline `onclick="event.stopPropagation()"` in HTML attribute | CRITICAL | ✅ Fixed |
| F-009 | Frontend | `src/features/auctions/auction-modal.js` | 67, 70, 89, 91, 110 | CSP violation: 5× `innerHTML` for select options, spinner, error alerts | CRITICAL | ✅ Fixed |
| F-010 | Frontend | `src/features/checkout/checkout.js` | 82, 121, 137 | CSP violation: `this.alert` set to HTML strings rendered via Alpine `x-html` — blocks CSP | CRITICAL | ✅ Fixed |
| F-011 | Frontend | `src/pages/checkout.js` | 23 | `Alpine.initTree?.(container)` — Alpine.js does NOT expose `initTree`. TypeError at runtime | CRITICAL | ✅ Fixed |
| F-012 | Frontend | `src/pages/verify-email.js` | 20 | `verifyEmail(token).then(...)` without `.catch()` — unhandled promise rejection on verification failure | CRITICAL | ✅ Fixed |
| F-013 | Frontend | `src/widgets/checkout/render-checkout-form.js` | 138 | CSP violation: `onerror="this.style.display='none';..."` inline event handler in HTML attribute | CRITICAL | ✅ Fixed |
| F-014 | Frontend | `src/features/auctions/requests.js` | 73 | CSP violation: `submit.innerHTML = '<i class="fas fa-spinner spinner"></i>'` | CRITICAL | ✅ Fixed |
| F-015 | Frontend | `src/features/cart/index.js` | 186 | CSP violation: `deleteEl.innerHTML = '<i class="fas fa-trash-alt"></i>'` | CRITICAL | ✅ Fixed |
| F-016 | Frontend | `src/features/seller-profile/index.js` | 8 | PascalCase query params: `SellerId`, `PageSize`, `Page` sent as-is — should be camelCase `sellerId`, `pageSize`, `page` | CRITICAL | ✅ Fixed |
| F-017 | Frontend | `src/app/global-ui.js` | 28-41 | `async` click handler for `.quick-add-btn` — `await requireAuth()` outside `try-catch`; unhandled rejection | CRITICAL | ✅ Fixed |
| F-018 | Frontend | `src/app/navbar.js` | 73-80 | `async` click handler for `#logoutBtn` — `await showConfirm()` outside `try-catch`; unhandled rejection | HIGH | ✅ Fixed |
| F-019 | Frontend | `src/app/router.js` | 59, 216, 217 | `async router()` returns promise — called from `hashchange` and top-level without `.catch()` | HIGH | ✅ Fixed |
| F-020 | Frontend | `src/app/router.js` | 174 | `setTimeout(async () => {...}, 200)` — async callback promise never caught | HIGH | ✅ Fixed |
| F-021 | Frontend | `src/app/router.js` | 85-100 | CSP + XSS: `innerHTML` with unescaped `${t(...)}` interpolations + inline `style` attributes | HIGH | ✅ Fixed |
| F-022 | Frontend | `src/app/sw.js` | 47-65 | CSP + XSS: `innerHTML` with unescaped `${t('common.dismiss')}` + inline `style` attributes | HIGH | ✅ Fixed |
| F-023 | Frontend | `src/app/swipe-back.js` | 17 | CSP: `innerHTML` with unescaped `${t('common.back')}` | HIGH | ✅ Fixed |
| F-024 | Frontend | `src/app/tour.js` | 15-26 | CSP + XSS: `innerHTML` with unescaped `${t(...)}` and step data | HIGH | ✅ Fixed |
| F-025 | Frontend | `src/app/offline.js` | 13, 27 | CSP: `innerHTML` with unescaped translation strings | HIGH | ✅ Fixed |
| F-026 | Frontend | `src/app/realtime.js` | 117 | CSP: `innerHTML` for reconnection banner | HIGH | ✅ Fixed |
| F-027 | Frontend | `src/app/theme.js` | 18 | CSP: `innerHTML` for theme toggle icon | HIGH | ✅ Fixed |
| F-028 | Frontend | `src/shared/api/client.js` | 8 | Stale `_cachedAccessToken` on new tab — `sessionStorage` not shared across tabs, no re-hydration | HIGH | Open |
| F-029 | Frontend | `src/shared/api/client.js` | 130-158 | `doUpload()` lacks 401 retry — upload fails hard on session expiry; no `_retry` logic | HIGH | Open |
| F-030 | Frontend | `src/shared/utils/auth-state.js` | 20-22 | `isAuthenticated()` returns `true` for tokens with falsy `exp` (epoch-0 or missing `exp`) | HIGH | Open |
| F-031 | Frontend | `src/shared/utils/csrf.js` | 47-59 | `ensureCsrfToken()` always returns null due to wrong URL — no console warning | HIGH | Open |
| F-032 | Frontend | `src/shared/utils/errors.js` | 74-80 | `unhandledrejection` handler replaces full app UI via `showErrorFallback` on minor rejections | HIGH | Open |
| F-033 | Frontend | `src/shared/utils/seo.js` | 30 | Canonical URL strips hash fragment — all hash-routed pages share same canonical URL | HIGH | Open |
| F-034 | Frontend | `src/shared/utils/ocean.js` | 288 | `observer` referenced before `const` declaration (TDZ) in `visibilitychange` handler — ReferenceError | HIGH | Open |
| F-035 | Frontend | `src/shared/stores/ui.store.js` | 7-11 | `toggleTheme()` and `toggleLang()` do NOT persist to localStorage — preference lost on reload | HIGH | Open |
| F-036 | Frontend | `src/features/auctions/analytics.js` | 17, 75, 79, 83 | Endpoint casing: `/Auctions/` (capital A) — other files use `/auctions/` (lowercase) | HIGH | Open |
| F-037 | Frontend | `src/features/auctions/create.js` | 12 | PascalCase query params: `IsAuctioned`, `PageSize` — should be `isAuctioned`, `pageSize` | HIGH | Open |
| F-038 | Frontend | `src/features/auctions/bid.js` | 379, 410 | PascalCase query param: `SearchTerm` — should be `searchTerm` | HIGH | Open |
| F-039 | Frontend | `src/features/home/index.js` | 61 | PascalCase query param: `PageSize` — should be `pageSize` | HIGH | Open |
| F-040 | Frontend | `src/features/products/edit.js` | 5 | Endpoint casing: `/Products/my` (capital P) — should be `/products/my` | HIGH | Open |
| F-041 | Frontend | `src/features/subscriptions/subscriptions.js` | 19 | Endpoint casing: `/SubscriptionPlans` vs `/subscriptionplans` in `admin/index.js:60` | HIGH | Open |
| F-042 | Frontend | `src/features/admin/index.js` | 76-78 | Broken null guard: `txns.items \|\| txns.data \|\| txns \|\| []` — throws TypeError if `txns` is null | HIGH | Open |
| F-043 | Frontend | `src/app/navbar.js` | 19, 21, 30 | Dead DOM references: `#userRole`, `#userAvatar`, `#sellLink` — no elements exist in any HTML | MEDIUM | Open |
| F-044 | Frontend | `src/pages/dashboard.js` | 12 | Global `dashboard-tab-changed` event listener never removed — registers each navigation | HIGH | Open |
| F-045 | Frontend | `src/pages/profile.js` | 23-28 | Alpine template references `completionPercent` — never defined on `profilePage` component; renders `NaN%` | HIGH | Open |
| F-046 | Frontend | `src/widgets/profile/render-stats.js` | 11 | Alpine template references `stats.key` — `stats` object never defined on `profilePage` | HIGH | Open |
| F-047 | Frontend | `src/widgets/admin/render-plans.js` | 16 | CSP: `onclick="event.stopPropagation()"` inline handler in HTML attribute | HIGH | ✅ Fixed |
| F-048 | Frontend | `src/widgets/cards/product-card.js` | 71-72 | CSP: `onclick="..."` inline handlers in modal overlay HTML | HIGH | ✅ Fixed |
| F-049 | Frontend | `src/pages/product-detail.js` | 116 | CSP: `onclick="..."` inline handler in createModal HTML | HIGH | ✅ Fixed |
| F-050 | Frontend | `src/widgets/ui/loader.js` | 27-28 | CSP: `onclick` inline handlers for hash redirect and page reload | HIGH | ✅ Fixed |
| F-051 | Frontend | `src/widgets/wallet/render-transactions.js` | 50 | CSP: `onclick="loadWalletTransactions()"` inline handler | HIGH | ✅ Fixed |
| F-052 | Frontend | `src/widgets/auction-detail/render-main.js` | 166 | CSP: `x-html="bidAlert"` — unsanitized HTML from component state via Alpine | HIGH | ✅ Fixed |
| F-053 | Frontend | `src/widgets/checkout/render-checkout-form.js` | 165 | CSP: `x-html="alert"` — unsanitized HTML from component state via Alpine | HIGH | ✅ Fixed |
| F-054 | Frontend | `src/widgets/admin/render-admin-products.js` | 47 | Duplicate `class` attribute on `<select>` — second overwrites first, losing `product-status-select` | HIGH | Open |
| F-055 | Frontend | `src/features/auctions/create.js` | 4, 8 | Endpoint casing: `/Auctions/requests` (capital A) | HIGH | Open |
| F-056 | Frontend | `src/shared/utils/validation.js` | 103 | `check.matches.element.value` — no guard that `check.matches.element` is a DOM element with `.value` | MEDIUM | Open |
| F-057 | Frontend | `src/shared/utils/dom.js` | 382-386 | `safeSetHTML` allows `style` attribute via DOMPurify — CSS exfiltration risk | MEDIUM | Open |
| F-058 | Frontend | `src/shared/utils/format.js` | 27-35 | `formatPrice` hardcodes `"en-US"` locale — ignores Arabic locale setting | MEDIUM | Open |
| F-059 | Frontend | `src/shared/utils/i18n.js` | 1-1721 | No pluralization support — Arabic has complex plural rules (singular, dual, plural 3-10, plural 11+) | MEDIUM | Open |
| F-060 | Frontend | `src/shared/utils/recently-viewed.js` | 4 | `JSON.parse(localStorage.getItem(...))` without `try-catch` — throws on corrupt localStorage data | MEDIUM | Open |
| F-061 | Frontend | `src/shared/utils/ui.js` | 341-343 | `getCartItemCount` calls `items.reduce()` — throws TypeError if `items` is null/undefined | MEDIUM | Open |
| F-062 | Frontend | `src/features/auctions/bid.js` | 10 | Cross-feature import: `trackRecentlyViewed` from `../home/index.js` instead of `../../shared/utils/recently-viewed.js` | MEDIUM | Open |
| F-063 | Frontend | `src/features/auctions/bid.js` | data() | Alpine `_rafId`, `_ptrCleanup`, `_scrollCleanup` used but not declared in `data()` return | MEDIUM | Open |
| F-064 | Frontend | `src/features/products/search.js` | data() | Alpine `_ptrCleanup`, `_scrollCleanup` used but not declared in `data()` return | MEDIUM | Open |
| F-065 | Frontend | `src/features/products/search.js` | 132 | `data.total ?? 0` — if missing, `totalPages = 0`, pagination display shows 0 pages | MEDIUM | Open |
| F-066 | Frontend | `src/features/dashboard/tabs.js` | 238-243 | `handlePasswordChange()` throws bare errors — no `try-catch` wrapping | MEDIUM | Open |
| F-067 | Frontend | `src/features/auctions/requests.js` | 43-44 | `document.getElementById(id)` could be null — `.addEventListener()` called on null | MEDIUM | Open |
| F-068 | Frontend | `src/features/analytics.js` | 37-40 | `dash.totalAuctions \|\| 1` — percentage calculation when total is 0 gives wrong result | MEDIUM | Open |
| F-069 | Frontend | `src/shared/stores/ui.store.js` | 4-5 | Hardcoded `'sayiad_theme'` and `'sayiad_lang'` instead of `KEYS` constants | MEDIUM | Open |
| F-070 | Frontend | `src/shared/constants/routes.js` | 7-19 | `routeGuards` function keys not validated against actual route definitions | LOW | Open |
| F-071 | Frontend | `src/shared/utils/dom.js` | 158 | Event listeners on progressive images not removed if image never loads/errors | LOW | Open |
| B-014 | Backend | `Sayiad.Domain/Dtos/AuthDtos/AuthDto.cs` | 5 | `RefreshTokenRequest` has no FluentValidation validator — no null/empty check on `RefreshToken` | MEDIUM | Open |
| B-015 | Backend | `Sayiad.Domain/Dtos/AuthDtos/ResendVerificationRequest.cs` | — | No FluentValidation validator for email format | MEDIUM | Open |
| B-016 | Backend | `Sayiad.Domain/Dtos/AuthDtos/VerifyResetCodeRequest.cs` | — | No FluentValidation validator for email/token | MEDIUM | Open |
| B-017 | Backend | `Sayiad.Domain/Dtos/PaymentDtos/PaymentDto.cs` | — | `InitiatePaymentRequest` has no FluentValidation validator — no `OrderId > 0` check | MEDIUM | Open |
| B-018 | Backend | `Sayiad.Domain/Dtos/AuctionDtos/AuctionRequestDto.cs` | — | `ApproveAuctionRequestRequest` has no FluentValidation — no validation for price/increment values | MEDIUM | Open |
| B-019 | Backend | `Sayiad.Domain/Dtos/SubscriptionPlanDtos/SubscriptionPlanResponse.cs` | — | `CreateSubscriptionPlanRequest` and `UpdateSubscriptionPlanRequest` have no FluentValidation | MEDIUM | Open |
| B-020 | Backend | `Sayiad.API/Program.cs` | 57-67 | CORS `AllowAnyHeader()`, `AllowAnyMethod()`, single hardcoded origin — permissive | MEDIUM | Open |
| B-021 | Backend | `Sayiad.API/Controllers/UploadController.cs` | 34-35 | `file.FileName` passed to storage without path traversal sanitization | MEDIUM | Open |
| B-022 | Backend | `Sayiad.Domain/Dtos/AuthDtos/AuthDto.cs` | 3 | No `confirmPassword` at DTO level — password confirmation is frontend-only | MEDIUM | Open |
| B-023 | Backend | `Sayiad.API/Middleware/ExceptionMiddleware.cs` | 5 | Only 4 exception types handled — `ArgumentException`, `FormatException`, `DbUpdateException` fall to 500 | MEDIUM | Open |
| B-024 | Backend | `Sayiad.API/Program.cs` | 118-119 | `AddFluentValidationAutoValidation` — DTOs without validators silently accept invalid data | MEDIUM | Open |
| B-025 | Backend | `Sayiad.API/Program.cs` | 138-151 | `db.Database.MigrateAsync()` on startup — multi-instance race condition on migrations | MEDIUM | Open |
| B-026 | Backend | `Sayiad.API/Controllers/AuthController.cs` | 56-61 | `GET /api/auth/verify-email` — verification token in query string leaks to logs/referrer | MEDIUM | Open |
| B-027 | Backend | `Sayiad.API/Middleware/ApiErrorResponse.cs` | 7-10 | `Errors` serialized as `"errors": null` when null — no `JsonIgnoreCondition.WhenWritingNull` | LOW | Open |
| B-028 | Backend | `Sayiad.API/Program.cs` | 187 | `UseHttpsRedirection()` after `UseStaticFiles()` — static files served before HTTPS redirect | LOW | Open |
| B-029 | Backend | `Sayiad.API/Program.cs` | 153-173 | Admin wallet created unconditionally on startup — no existence check | LOW | Open |
| B-030 | Backend | `Sayiad.Domain/Dtos/WalletDtos/WalletResponse.cs` | 6-12 | `WalletTransactionsResponse` uses `class` with `{ get; set; }` — all other DTOs use `record` | LOW | Open |
| B-031 | Backend | `Sayiad.API/Controllers/SubscriptionPlansController.cs` | 37, 45, 53 | Hardcoded `"Admin"` string instead of `nameof(UserRole.Admin)` — brittle | LOW | Open |
| B-032 | Backend | `Sayiad.API/Controllers/UsersController.cs` | 60-67 | `GET ~/api/user` duplicates `GET /api/Users/profile` | LOW | Open |
| B-033 | Backend | `Sayiad.API/Program.cs` | 175-178 | Middleware order: ExceptionMiddleware last — exceptions in itself uncatchable | LOW | Open |
| F-072 | Frontend | `src/app/app.js` | 15 | `ensureCsrfToken()` called without `await` — if async and rejects, unhandled | MEDIUM | Open |
| F-073 | Frontend | `src/app/language.js` | 21 | `document.getElementById('app')` without null check before `.style` access | MEDIUM | Open |
| F-074 | Frontend | `src/shared/utils/ui.js` | 95-102 | `closeToast` may leak event listener on double call | LOW | Open |
| F-075 | Frontend | `src/widgets/wallet/modal.js` | 31, 43 | Modal cleanup performs fresh query — stale element reference on close | MEDIUM | Open |

---

## Severity Summary

| Severity | Original | Fixed | Remaining |
|----------|----------|-------|-----------|
| CRITICAL | 18 | 15 | 3 |
| HIGH | 39 | 17 | 22 |
| MEDIUM | 25 | 0 | 25 |
| LOW | 13 | 0 | 13 |
| **Total** | **95** | **32** | **63** |

## Top 3 Systemic Issues (Post-Strike-4)

1. **CSP-x-html contamination** — All `innerHTML` violations and inline `onclick` handlers in `src/app/` (F-021–F-027) and `src/widgets/` (F-047–F-051) eliminated. Remaining ~130 `innerHTML` uses are in feature/page files outside targeted scope. *(Strike 2: 6 fixed. Strike 3: 3 fixed. Strike 4: 12 fixed)*

2. **Backend contract gaps** — `RegisterRequest` silently drops `birthdate`/`confirmPassword`; `AuthResponse.Token` serializes as `"token"` but frontend dead-branch already fixed; CSRF `/api/api/` URL already fixed; registration role hard-locked. *(3 of 4 items resolved)*

3. **Broken auth/refresh chain** — JWT `atob()` base64url bug fixed; duplicated CSRF URL fixed; missing refresh token rotation + no admin audit logging still open. *(2 of 4 items resolved)*
