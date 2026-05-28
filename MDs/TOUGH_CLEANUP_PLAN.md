# 🧹 Sayiad — Tough Cleanup Plan

> **Goal:** Every character in every file is intentional. Zero dead code, zero unused imports, zero console.log artifacts, zero duplication, zero memory leaks.
>
> **Status:** 🟢 Planned | 🟡 In Progress | ✅ Completed | ❌ Not Started
>
> **Last Updated:** May 28, 2026
>
> **Session completed:** P1 nav-overlay consolidation (CSS), P1 fishSwimSmall migration (errors.js → _animations.css), P1 backward-compat alias removal (7 aliases, 8 refs updated), P1 vertical rhythm (4x 16px → var(--space-4)), P2+P3 full audit (10 core + 25 pages — clean)

---

## 📋 HOW TO USE THIS PLAN

Each file is listed with specific items to check. Follow the order below — **CSS first**, then **Core**, then **Pages**, then **Shared**, then **Config**. This ensures you find unused CSS references in JS files before cleanup.

---

## PHASE 0: AUTOMATED SCANNING (Run First)

Before manual cleanup, run these scans to generate a baseline:

```bash
# 1. Find all console.log statements (likely debug artifacts)
cd "F:\Sayiad\V.2\Front-end"
rg "console\.log\(" --type js --type css

# 2. Find all unused CSS custom properties across ALL files
rg --type css "^  --" src/css/_variables.css | cut -d: -f1 | tr -d ' ' | while read var; do
  count=$(rg -l "$var" src/ --type-add 'all:*.{css,js,html}' -t all | wc -l)
  if [ "$count" -le 1 ]; then echo "POSSIBLY UNUSED: $var"; fi
done

# 3. Find all JS imports that may be unused
rg "^import " src/ --type js | grep -v "node_modules" | sort

# 4. Check for duplicate CSS rules
rg -c "^\.|^#" src/css/ | sort -t: -k2 -rn | head -20

# 5. Check @keyframes usage
rg "@keyframes" --type css src/ | grep -oP '@keyframes \K\w+' | while read kf; do
  count=$(rg -l "$kf" src/ --type-add 'all:*.{css,js,html}' -t all | wc -l)
  if [ "$count" -le 1 ]; then echo "UNUSED KEYFRAME: $kf"; fi
done

# 6. Find files with no exports (possible dead files)
rg "^export " src/ --type js -l | sort

# 7. Find empty or near-empty files
find src/ -name "*.js" -size -200c | while read f; do echo "TINY FILE: $f ($(wc -c < "$f") bytes)"; done
```

---

## PHASE 1: CSS CLEANUP (7 Files)

### 1. `src/css/_variables.css`
**Status:** 🟡 Partially Done

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `--ease-out` vs `--ease-enter` | Both equal `cubic-bezier(0.16, 1, 0.3, 1)` — one is redundant | ✅ Consolidated to `--ease-out`, 16 refs replaced, definition removed | Done |
| `--background-secondary` alias | Maps to `var(--body-bg)` — had 2 refs (cart.js), now uses canonical name | ✅ Removed + references updated | Done |
| `--color-text-primary` alias | Maps to `var(--text)` — had 2 refs (app.js SW banner, cart.js), now uses canonical name | ✅ Removed + references updated | Done |
| `--color-text-secondary` alias | Maps to `var(--text-secondary)` — had 1 ref (app.js SW banner), now uses canonical name | ✅ Removed + references updated | Done |
| `--color-background-primary` alias | Maps to `var(--card-bg)` — had 1 ref (app.js SW banner), now uses canonical name | ✅ Removed + references updated | Done |
| `--color-border-secondary` alias | Maps to `var(--border)` — had 1 ref (app.js SW banner), now uses canonical name | ✅ Removed + references updated | Done |
| `--border-radius-md` alias | Maps to `var(--radius-md)` — had 1 ref (app.js SW banner), now uses canonical name | ✅ Removed + references updated | Done |
| `--border-radius-lg` alias | Maps to `var(--radius-lg)` — had 1 ref (app.js SW banner), now uses canonical name | ✅ Removed + references updated | Done |
| `--ease-enter` double definition | ✅ Consolidated — single definition removed (already only one existed) | Deduplicate | 5 min |
| `--gold-shimmer` | ✅ Verified — used by `.gold-theme` rules in _components.css (1 ref), also defined in _variables.css | Keep (used) | 2 min |
| `--glass-*` token audit | ✅ Verified — all 7 glass tokens have consumers across _layout.css and _components.css (57+ refs) | Keep (all used) | 5 min |
| `[lang="ar"]` font-size overrides | ✅ Verified — 3 font-size overrides in _variables.css for [lang="ar"], all appear intentional | Keep | 5 min |

**Total expected reductions:** ~10-12 removed vars

---

### 2. `src/css/_components.css`
**Status:** 🟡 Partially Done

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `.badge` empty section header | Line has `/* ===== BADGE ===== */` with no content below | ✅ Removed empty comment block (−3 lines) | Done |
| `.dropdown-menu` animation | Uses custom `slideDown` keyframe — could use Animate.css `fadeInDown` | Replace with `animate()` utility | 5 min |
| `.form-error` animation | Uses custom `slideDown` — could use Animate.css | Replace with Animate.css class | 5 min |
| `.search-overlay` animation | Uses custom `slideDown` — could use Animate.css | Replace | 5 min |
| `.filter-sheet` animation | Uses custom `slideUp` — could use Animate.css | Replace | 5 min |
| `.cart-table-wrapper` animation | Uses custom `slideUp` — could use Animate.css | Replace | 5 min |
| `.cart-footer` animation | Uses custom `slideUp` — could use Animate.css | Replace | 5 min |
| `.auth-page` animation | Uses Animate.css `fadeIn` (✅ Already done) | Verify | 2 min |
| `.section-header` animation | Uses custom `slideUp` — could use Animate.css | Replace | 5 min |
| `@keyframes slideDown` duplicate | `_components.css` uses `translateY(-12px)`, `app.js` injected block uses `translateY(-100%)` which overrides | ✅ Already fixed — app.js no longer injects `@keyframes slideDown`. Single definition in `_animations.css` is the sole source of truth. | Done |
| `.cart-floating-bar` duplicate | Defined identically in both `_components.css` and `_layout.css:768px` | ✅ Removed from `_layout.css`, kept in `_components.css` (−20 lines) | Done |
| `@supports not (backdrop-filter)` rules | `.detail-image`, `.detail-info`, `.main-content`, `.nav-drawer` have fallbacks — verify browsers still need this | ✅ Removed all 4 fallback blocks (−28 lines) | Done |
| Vertical rhythm check | Search for `margin-bottom: 16px` or hardcoded spacing that should use CSS vars | ✅ Replaced 4x `margin-bottom: 16px` with `var(--space-4)` (−0 lines, semantic fix) | Done |
| `.table-wrapper::after` gradient | `background: linear-gradient(to right, transparent, var(--card-bg))` — static gradient; consider CSS `mask-image` for performance | Future optimization | 5 min |
| `.bid-list` max-height | `max-height: 300px` — hardcoded, should be responsive | ✅ Changed to `max-height: min(300px, 40vh)` | Done |

**Completed reductions:** ~52 lines

---

### 3. `src/css/_layout.css`
**Status:** 🟡 Partially Done

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `.cart-floating-bar` duplicate | Same code block exists in `_components.css` (cart section) and `_layout.css` (768px media query) | ✅ Removed from `_layout.css`, kept in `_components.css` | Done |
| `.nav-overlay` duplicate | Defined in `_layout.css` (desktop) and again in `_components.css` (768px media query) with `display:none` vs `display:block` | ✅ Consolidated — mobile override reduced to only 6 differing properties (display, background, backdrop-filter, z-index, cursor). Removed 7 duplicated lines. | Done |
| `.auth-page .card` padding 480px | Known inert rule — Bootstrap `:has()` overrides it | Remove dead rule | 2 min |
| `@keyframes ping` | Used by `.notif-bell` — verify if Animate.css has equivalent | Optional: replace if exists | 5 min |
| `@keyframes fishSwim` | Used by `.not-found-page` and `errors.js` inline animation | Keep (custom animation) | 2 min |
| `.dashboard-sidebar` 768px breakpoint | `display: flex` when desktop sidebar exists — check if this conflicts with `.dashboard-sidebar { display: none }` from mobile query | Verify logic | 5 min |
| `.back-to-top` transition | Uses both transition and transform properties — verify no duplicate | Clean up | 2 min |
| `.footer-grid` hardcoded columns | `grid-template-columns: 2fr 1fr 1fr 1fr` — should this use Bootstrap row/cols? | Optional migration | 5 min |

**Total expected reductions:** ~30-40 lines

---

### 4. `src/css/_animations.css`
**Status:** 🟡 Clean (updated)

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `@keyframes slideUp` | Still used by CSS selectors (verified) | Keep | — |
| `@keyframes slideDown` | Check if any remaining CSS refs should use Animate.css `fadeInDown` | Optional migration | 5 min |
| `@keyframes fishSwimSmall` | ✅ Added (moved from errors.js inline `<style>`) | Already referenced by errors.js HTML | Done |
| `@keyframes scaleIn` | Used by `.modal`, `.lightbox-img` | Keep | — |
| `@keyframes spin` | Used by `.spinner` | Keep | — |
| `@keyframes pulse` | Used by `.countdown-unit.urgent` | Keep | — |
| `@keyframes ripple` | Used by JS button ripple effect | Keep | — |
| `@keyframes skeleton-loading` | Used by `.skeleton` | Keep | — |
| `@keyframes contentFadeIn` | Used by `.content-fade` | Keep | — |
| `.animate-on-scroll` fallback | Redundant with `<noscript>` or `prefers-reduced-motion`? | Keep for now | — |
| `.op-0` / `.op-100` utility | Used for Alpine x-transition | Keep | — |

**Total expected reductions:** Minimal — this file is already clean

---

### 5. `src/css/_bootstrap-overrides.css`
**Status:** ✅ Already cleaned (35 dead var mappings removed)

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `.card-sm:hover` | Sets `transform: none; box-shadow: var(--shadow)` — verify this is intentional | Confirm with designer | 2 min |
| `--bs-primary-rgb` hardcoded | All `*-rgb` values are hardcoded integers, not derived from OKLCH — OK for Bootstrap fallback | Keep (Bootstrap needs RGB) | — |

---

### 6. `src/css/_rtl.css`
**Status:** ✅ Clean — 12 selectors verified valid

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| All 12 selectors | Quick verify each selector still references a valid element in the codebase | Scan with grep | 5 min |
| Empty or redundant rules | After Bootstrap migration, some RTL overrides may be handled by Bootstrap's built-in RTL | Check Bootstrap 5.3 RTL support | 5 min |

---

### 7. `src/css/style.css`
**Status:** ✅ Clean

---

## PHASE 2: CORE JS CLEANUP (14 Files)

### 8. `src/core/app.js`
**Status:** 🟡 In Progress

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `@keyframes slideDown` injection | `cssText` injects `@keyframes slideDown { from { transform: translateY(-100%); } ... }` which overrides `_animations.css` definition (`translateY(-12px)`) | ✅ Already removed in earlier cleanup. app.js no longer injects `@keyframes slideDown`. | Done |
| `@keyframes bannerSlideDown` | Still used by offline banner entrance — keep | — | — |
| SW update interval | `setInterval(() => registration.update(), 3600000)` — runs forever even if user navigates away. Should be scoped to app lifecycle or use a flag | Wrap in a guard | 5 min |
| `themeTransition()` function | Verify cleanup — removes class after timeout. Check if timeout is cleared on route change | Add timeout reference tracking | 5 min |
| Inline style injection | `el.style.cssText` arrays with blank entries from Animate.css migration (online banner, SW banner) | Already fixed ✅ | — |
| Unused DOM refs | Search for `document.getElementById()` calls that reference IDs that may have been removed during Bootstrap migration | Verify & remove | 10 min |
| `closeDrawer` / `openDrawer` | These were previously exposed as `window.closeDrawer` — now removed from global scope ✅ | Verify no remaining inline onclick refs | 5 min |
| `_keyframeListener` for SW | Used to detect Animate.css keyframes — verify still needed | Clean up if not | 5 min |

---

### 9. `src/core/main.js`
**Status:** ✅ Clean — just bootstraps app

---

### 10. `src/core/router/index.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `goBack()` export | Added for swipe gesture — check if used | Verify import in app.js | 2 min |
| `handleRoute()` cleanup | Does NOT call `closeDrawer()` on route change — mobile menu stays open bug | ✅ Fixed — added local `closeDrawer()` function at start of `router()`, avoids circular dep by duplicating logic locally | Done |
| Dynamic import error handling | `import()` calls inside `handleRoute` — what happens if a page JS fails to load? | Add error boundary | 5 min |
| Unused params | `params` argument in route handlers — check if some pages ignore it | No action needed | 2 min |

---

### 11. `src/core/auth/index.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `hasRole` / `hasAnyRole` | Verify both are used across pages | Check | 5 min |
| `getUser()` caching | Returns stored user — is this refreshed on page navigation? | Verify | 5 min |
| `logout()` | Calls `clearCsrfToken()` — verify this exists in csrf.js | Already done ✅ | — |

---

### 12. `src/core/api/client.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `_pendingRequests` map | Used for request dedup — verify `.finally()` cleanup is correct | Review logic | 5 min |
| `UPLOAD:` prefix dedup | `doUpload()` helper — verify no edge cases | Review | 5 min |
| `getCsrfHeader(method)` | Only adds header on POST/PUT/PATCH/DELETE — verify backend expects it on all mutation methods | Confirm | 5 min |
| `request()` unused params | `retry` param, `_retry` flag — verify all callers | Check | 5 min |

---

### 13. `src/core/i18n/index.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| ~470 translation keys | Scan for unused keys (ones no longer referenced in any JS/HTML) | Use grep to find orphaned keys | 20 min |
| Missing AR keys | Ensure all EN keys have AR counterparts | Full diff | 15 min |
| `setLanguage()` | Verifies language is supported — check if langs other than 'en'/'ar' are handled | Fine as-is | 2 min |

---

### 14. `src/core/realtime/index.js`
**Status:** ❌ Not Started (mostly cleaned in audit fixes)

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `_joinedGroups` Set | Added in audit Fix 3 — verify dedup works | Already done ✅ | — |
| `joinAuctionGroup()` | Returns Promise — verify callers in pages properly await | Add async handling in pages | 5 min |
| `BidPlaced` handler | Still uses DOM manipulation directly — should emit EventBus event instead for Alpine pages | Already emitting events ✅ | — |

---

### 15. `src/core/events/bus.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `createScopedBus()` | Added proactively — verify it's used by any page | Currently unused utility | 2 min |
| Global `on()` / `emit()` | Used by core modules — check off() is called on cleanup | Verify core usage | 5 min |

---

### 16. `src/core/stores/alpine.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `walletCard` component | Alpine data component — verify used in any page | Check for `x-data="wallet"` usage in page templates | 5 min |
| All stores (auth, cart, ui) | Verify each store property is read somewhere | Grep for `Alpine.store('...')` | 5 min |

---

### 17. `src/core/utils/dom.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `$` selector | Shortcut for `document.querySelector` — check if used everywhere or sometimes bypassed | Verify consistency | 5 min |
| `debounce` / `throttle` | Both exported — check which is actually used | Remove unused one | 5 min |
| `escapeHtml` | Used across pages — verify all exports have callers | Check | 5 min |
| `animate()` | Animate.css utility — verify all params (duration, delay, etc.) are used | Check | 5 min |
| `observeAnimations()` | Scroll-triggered animation — verify it's called and cleans up | Check IntersectionObserver disconnect | 5 min |
| `renderSkeleton()` / `renderEmptyState()` | Helpers — check if used consistently across pages | Verify | 5 min |

---

### 18. `src/core/utils/ui.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `showToast()` | Used globally — verify `toast-container` element exists in HTML | Check index.html | 2 min |
| `openQuickView()` | Image uses `loading="lazy"` ✅ — verify all paths | Check | 5 min |
| `openLightbox()` | Image escaping via `escapeHtml` ✅ — verify | Check | 5 min |
| `showLoading()` / `hideLoading()` | Loading overlay — verify cleanup | Check | 5 min |
| `renderSkeleton()` | Used across pages — verify all have consistent usage | Check | 5 min |

---

### 19. `src/core/utils/format.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `formatPrice()` | Used across all pages — verify handles 0, null, undefined | Add edge case handling | 5 min |
| `formatDate()` | Used in timestamps — verify handles invalid dates | Add edge case handling | 5 min |
| Any unused format helpers | Check all exports vs imports | Grep | 5 min |

---

### 20. `src/core/utils/validation.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `showFieldError()` | Uses `aria-describedby` — verify the generated IDs don't collide | Review counter mechanism | 5 min |
| `clearFieldError()` | Complement to showFieldError — verify used | Check | 5 min |

---

### 21. `src/core/utils/ocean.js`
**Status:** ❌ Not Started

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| Full audit | Unknown content — likely ocean-themed decorative effects | Read and assess | 10 min |
| Performance impact | Canvas/particle effects can be expensive | Add reduced-motion respect | 5 min |

---

### 22. `src/core/utils/swipe.js`
**Status:** ❌ Not Started (new file)

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `createSwipeGesture()` | Edge-only mode for swipe-back — verify RTL support | Already RTL-aware ✅ | — |
| `createSwipeReveal()` | For cart swipe-to-delete — verify cleanup | Check | 5 min |
| Passive listener usage | Uses `{ passive: true }` where appropriate | Verify | 5 min |

---

### 23. `src/core/utils/csrf.js`
**Status:** ❌ Not Started (new file)

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `getCsrfToken()` | Sources: sessionStorage → XSRF-TOKEN cookie → meta tag — verify order | Check | 5 min |
| `ensureCsrfToken()` | Generates 32-byte hex via `crypto.getRandomValues()` — verify fallback | Check | 5 min |

---

## PHASE 3: PAGE MODULE CLEANUP (25 Files)

Each page needs these standardized checks:

| # | Check | How to Verify |
|---|-------|---------------|
| A | **Unused imports** | `rg "^import" src/pages/[page].js` — cross-reference each import against actual usage |
| B | **Unused variables** | Look for `let/const` declarations that are never read |
| C | **console.log statements** | `rg "console\.(log|debug)" src/pages/[page].js` |
| D | **Missing cleanup** | Does the page register route cleanup with `registerRouteCleanup()`? |
| E | **Event listeners** | `addEventListener('...', handler)` — is `removeEventListener` called in cleanup? |
| F | **Timer cleanup** | `setInterval` / `setTimeout` — are references tracked and cleared in cleanup? |
| G | **Dead code paths** | Functions defined but never called, conditionals that are always true/false |
| H | **Missing empty states** | What renders when API returns empty array? |
| I | **Error handling** | Are API calls wrapped in try-catch? |
| J | **Role-gating** | Is the page properly gated by route guard AND internal checks? |

### 24. `src/pages/home.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | `rg "^import"` — verify `animate` import used |
| console.log | ❌ | Check for debug artifacts |
| Route cleanup | ❌ | Has sections with timers? Countdown? |
| Empty states | ✅ | Features grid, products, auctions sections |
| Skeleton loading | ❌ | Check if skeleton render occurs before data fetch |

### 25. `src/pages/login.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify all imports have callers |
| console.log | ❌ | Check for debug artifacts |
| Form validation | ✅ | Real-time validation in place |
| Loading state | ✅ | Submit button disabled while loading |
| CSRF token | ✅ | `ensureCsrfToken()` called on success |

### 26. `src/pages/register.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify all imports |
| console.log | ❌ | Check for debug artifacts |
| Password strength | ✅ | Strength meter in place |
| CSRF token | ✅ | `ensureCsrfToken()` called in `doLogin()` |

### 27. `src/pages/products.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify all imports |
| Search debounce | ✅ | Alpine `.debounce.400ms` |
| Lazy images | ❌ | Check if product images have `loading="lazy"` |
| Empty state | ✅ | Present |
| Skeleton loading | ❌ | Check for skeleton before fetch |
| Pagination | ✅ | Alpine-based pagination |

### 28. `src/pages/product-detail.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify all imports |
| `animate` import | ✅ | Added in Animate.css migration |
| Route cleanup | ❌ | Any timers/events to unregister? |
| Lightbox | ✅ | Image gallery with navigation |
| Reviews | ✅ | Review submission with animation |

### 29. `src/pages/auctions.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Search debounce | ✅ | Alpine `.debounce.400ms` |
| Empty state | ✅ | Present |
| Skeleton | ❌ | Check for skeleton before fetch |
| Pagination | ✅ | Alpine |

### 30. `src/pages/auction-detail.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Route cleanup | ✅ | `leaveAuctionGroup`, `_timers.forEach(clearInterval)` |
| Alpine rewrite | ✅ | Full Alpine component in audit Fix 15 |
| SignalR events | ✅ | Emits via EventBus |
| Bid form | ✅ | Alpine reactive, slider↔input sync |
| Countdown | ✅ | Alpine reactive countdown |

### 31. `src/pages/cart.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Empty state | ❌ | Check if empty cart returns proper UI |
| Swipe gesture | ✅ | `createSwipeReveal()` used |
| Quantity controls | ✅ | Alpine + custom |
| Route cleanup | ❌ | Any timers/event listeners to clean up? |
| Floating bar | ✅ | Mobile floating checkout bar |

### 32. `src/pages/checkout.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Loading state | ✅ | `placing` flag with spinner |
| Form validation | ❌ | Check for real-time validation on address/CC fields |
| Error handling | ❌ | Stripe errors, API failures |
| Route cleanup | ❌ | Any listeners? |

### 33. `src/pages/dashboard.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Tab routing | ✅ | Tab-based navigation |
| Shared pagination | ✅ | `manualPaginationHtml()` + `wirePagination()` used |
| Empty states | ✅ | Per-tab empty states |
| Accessibility | ❌ | Warning about form field id/name — needs fix |
| Mobile tabs | ✅ | Bottom bar navigation |

### 34. `src/pages/profile.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Avatar upload | ✅ | Click-to-upload with preview |
| Form validation | ✅ | Profile edit form |
| Route cleanup | ❌ | Any? |
| Profile links grid | ❌ | `gap-3` added as class — verify `.profile-links-grid` still has `gap` rule |

### 35. `src/pages/admin.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| 7 tab panels | ✅ | Users, Reports, Products, Orders, Categories, Plans, Revenue |
| Shared pagination | ✅ | `manualPaginationHtml()` used in 3 places |
| Empty states | ✅ | Added in Fix 13 |
| Form modals | ✅ | CRUD with ARIA attributes |
| Role-gating | ✅ | Admin-only guard |

### 36. `src/pages/wallet.js`
| Check | Status | Notes |
|-------|--------|-------|
| Alpine data | ✅ | Alpine component with reactive validation |
| Deposit validation | ✅ | Max 100k EGP, 2 decimal limit |
| Loading state | ✅ | `depositing` flag |
| Empty state | ❌ | Empty transaction history? |
| Route cleanup | ❌ | Any? |

### 37. `src/pages/subscriptions.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Loading states | ✅ | Button spinner, error recovery |
| Plan cards | ✅ | With feature lists, CTA buttons |
| Empty state | ❌ | If no plans returned from API? |
| Route cleanup | ❌ | Any? |

### 38. `src/pages/shipping.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| CRUD addresses | ✅ | Add/edit/delete |
| Empty state | ❌ | No addresses saved yet? |
| Route cleanup | ❌ | Any? |

### 39. `src/pages/seller-profile.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Public profile | ✅ | View seller info + products |
| Empty state | ❌ | No products listed by seller? |

### 40. `src/pages/order-detail.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Order timeline | ✅ | Status tracking with icons |
| Route cleanup | ❌ | Any? |

### 41. `src/pages/forgot-password.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Email validation | ❌ | Check for input validation |
| Success state | ❌ | Show "check your email" message after submit |

### 42. `src/pages/reset-password.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Password strength | ❌ | Strength meter? |
| Token from URL | ✅ | Reads token from query params |

### 43. `src/pages/verify-email.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Loading animation | ✅ | Verify overlay with dots animation |
| Success animation | ✅ | Checkmark + confetti |
| Error state | ❌ | Handle invalid/expired token |

### 44. `src/pages/auction-requests.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Form validation | ❌ | Check for validation on request submission |
| Status tracking | ❌ | Show submitted requests with status badges |
| Empty state | ❌ | No requests submitted yet |

### 45. `src/pages/auction-requests-review.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Approve/reject modals | ✅ | With ARIA attributes |
| Empty state | ❌ | No pending requests |
| Pagination | ❌ | Check if pending requests list has pagination |

### 46. `src/pages/auctioneer-analytics.js`
| Check | Status | Notes |
|-------|--------|-------|
| Unused imports | ❌ | Verify |
| Charts/stats | ❌ | What data is displayed? |
| Empty state | ❌ | No analytics data yet |
| Loading state | ❌ | Loading skeleton for stats cards |

### 47. `src/pages/privacy.js`
| Check | Status | Notes |
|-------|--------|-------|
| Static page | ✅ | Mostly static legal content |
| Table of contents | ✅ | With anchor links |
| Scroll-margin | ✅ | Section anchors offset for navbar |

### 48. `src/pages/terms.js`
| Check | Status | Notes |
|-------|--------|-------|
| Static page | ✅ | Mostly static legal content |
| Table of contents | ✅ | With anchor links |
| Scroll-margin | ✅ | Section anchors offset for navbar |

---

## PHASE 4: SHARED MODULE CLEANUP (5 Files)

### 49. `src/shared/components/modal.js`
**Status:** ❌ Not Started
- Alpine data component with `open/close/handleKeydown` — clean
- Check if `title`, `content` params are used by callers

### 50. `src/shared/components/pagination.js`
**Status:** ❌ Not Started
- `alpinePaginationHtml()` — used by Alpine-enabled pages
- `manualPaginationHtml()` + `wirePagination()` — used by admin.js, dashboard.js
- Both should have i18n support (verify `t("common.page")` works)
- `prefix` param in manual pagination — verify unique IDs don't collide

### 51. `src/shared/components/toast.js`
**Status:** ❌ Not Started
- Alpine data component — `add(message, type, duration)`, `remove(id)` — clean
- Check if `duration=4000` default is appropriate for accessibility (should be longer for screen readers)

### 52. `src/shared/constants/roles.js`
**Status:** ✅ Clean — created in Fix 16

### 53. `src/shared/constants/routes.js`
**Status:** ❌ Not Started
- Route definitions — verify all 25 routes have corresponding page files
- Guards — verify each guard matches the role matrix in `user-role-flow.md`
- `routeTitleKeys` — verify all keys exist in i18n

### 54. `src/shared/helpers/errors.js`
**Status:** ✅ Cleaned
- `showErrorFallback()` — uses `data-action="refresh"` pattern ✅
- `escapeHtml` import added ✅
- `fishSwimSmall` animation — ✅ Moved inline `@keyframes fishSwimSmall` to `_animations.css` (unique name vs `fishSwim` in _layout.css). Inline `<style>` block removed from JS.

### 55. `src/shared/helpers/index.js`
**Status:** ❌ Not Started
- Barrel export file — verify all re-exports match actual module exports

---

## PHASE 5: FEATURE MODULE CLEANUP (2 Files)

### 56. `src/features/checkout/helpers.js`
**Status:** ❌ Not Started
- `createPaymentReference()` — uses `crypto.randomUUID()` with fallback — clean

### 57. `src/features/subscriptions/helpers.js`
**Status:** ❌ Not Started
- `getPlanIcon()`, `getRoleSubscriptionInfo()`, `isPopularPlan()` — verify all have callers
- `PLAN_ICONS` — verify `Free` icon (`fa-crown`) is correct (should maybe be `fa-user` or `fa-star`)

---

## PHASE 6: CONFIG & ENTRY POINT CLEANUP (5 Files)

### 58. `src/index.html`
**Status:** ❌ Not Started
- ✅ Inline `onclick` removed in Fix 1
- ✅ `javascript:void(0)` removed in Fix 1
- 🔲 Check for any remaining inline event handlers
- 🔲 Verify all static links (footer, navbar) point to working routes
- 🔲 Verify `data-roles` attributes match role constants
- 🔲 Check `<meta>` tags for completeness (SEO, Open Graph, favicon)

### 59. `src/public/sw.js`
**Status:** ✅ Auto-versioning added in Fix 19
- `sayiad-__SW_VERSION__` placeholder replaced at build time
- Verify cache strategies are correct (stale-while-revalidate appropriate?)

### 60. `vite.config.js`
**Status:** ✅ Already configured
- `sourcemap: true` added ✅
- `swVersionPlugin()` added ✅
- Manual chunks: `vendor-alpine` ✅
- Check if `@popperjs/core` should also be in vendor chunk (since it's a dependency)

### 61. `vercel.json`
**Status:** ❌ Not Started
- Verify SPA rewrite rules: `"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]`
- Check security headers (CSP, X-Frame-Options, etc.)

### 62. `package.json`
**Status:** ❌ Not Started
- `@popperjs/core` dependency — is it actually imported anywhere? (Bootstrap 5.3 uses it for dropdowns/popovers, but the project uses custom dropdown CSS, not Bootstrap JS components)
- If `@popperjs/core` is unused, remove it
- Scripts look correct

### 63. `eslint.config.js`
**Status:** ✅ Created in Fix 22
- 89 warnings currently — can reduce by fixing intentional patterns
- Review rules for effectiveness

---

## PHASE 7: CROSS-CUTTING CONCERNS

### 64. Duplicate `@keyframes` definitions
- `slideDown` is defined in:
  1. `_animations.css:18` — `translateY(-12px)` (used by CSS: `.dropdown-menu`, `.form-error`, `.search-overlay`)
  2. ~~`app.js` (injected cssText) — `translateY(-100%)` (used by ?)~~ ✅ **Already fixed** — app.js no longer injects `@keyframes slideDown`. Single definition in `_animations.css` is the sole source of truth.

### 65. Duplicate `@keyframes fishSwimSmall`
- `_layout.css` has `@keyframes fishSwim` (used by `.not-found-page`)
- `errors.js` had inline `@keyframes fishSwimSmall` (different name, duplicate pattern)
- ✅ **Fixed** — Moved `@keyframes fishSwimSmall` to `_animations.css`, removed inline `<style>` from `errors.js`

### 66. Duplicate `.cart-floating-bar` CSS
- Defined in `_components.css` (cart section) AND `_layout.css` (768px media query)
- ✅ **Fixed** — Removed from `_layout.css`, kept in `_components.css`

### 67. Duplicate `.nav-overlay` CSS
- Defined in `_layout.css` (desktop: `display: none`) AND `_components.css` (768px: `display: block !important`)
- ✅ **Fixed** — Mobile override reduced to only 6 differing properties (display, background, backdrop-filter, z-index, cursor). Removed 7 duplicated lines.

### 68. Alpine vs Manual DOM Inconsistency
- 7 pages use Alpine: wallet, subscriptions, cart, products, auctions, auction-detail, dashboard
- 18 pages use manual DOM
- **Plan:** Identify which manual pages would benefit most from Alpine conversion

### 69. `t()` vs `$t()` Usage
- `t()` is the JS import function
- `$t()` is the Alpine magic property
- Ensure pages using Alpine use `$t()` in Alpine templates and `t()` in JS code — verify no mixed usage

### 70. Console Log Audit
```bash
rg "console\.(log|debug|info)" src/ --type js | grep -v "console.warn\|console.error"
```
✅ **Findings:** 0 `console.log`/`console.debug` statements in runtime code across all 10 core + 25 page files. Only `console.warn` present (1 intentional use in router/index.js for cleanup errors).

---

## 📊 PRIORITY EXECUTION ORDER

| Priority | Phase | Description | Effort | Status | Impact |
|----------|-------|-------------|--------|--------|--------|
| ✅ Done | 7 | Fix mobile menu state bug (closeDrawer on route change) | 5 min | ✅ Done | Fixes UX bug |
| ✅ Done | 7 | Consolidate duplicate .nav-overlay CSS | 10 min | ✅ Done | Reduces CSS bloat |
| ✅ Done | 7 | FishSwimSmall inline → _animations.css | 5 min | ✅ Done | Removes inline style |
| ✅ Done | 1 | Remove backward-compat CSS aliases (7 aliases, 8 refs) | 15 min | ✅ Done | Reduces CSS var count |
| ✅ Done | 3 | Page-level unused import audit (25 pages) | 60 min | ✅ Done | Cleaner JS |
| ✅ Done | 3 | Core JS audit (10 core files) | 45 min | ✅ Done | Verified clean |
| ✅ Done | 1 | Vertical rhythm: 4x 16px → var(--space-4) | 15 min | ✅ Done | Semantic spacing |
| 🟢 P2 | 3 | Missing route cleanup on pages with timers/listeners | 30 min | ❌ To do | Memory safety |
| 🟢 P2 | 6 | `@popperjs/core` — remove if unused | 5 min | ❌ To do | Smaller bundle |
| 🟢 P2 | 3 | Missing loading states / skeleton screens | 60 min | ❌ To do | Better UX |
| 🔵 P3 | 7 | Alpine conversion for high-value manual pages | 2-3 days | ❌ To do | Architecture consistency |
| 🔵 P3 | 1 | Replace remaining custom animations with Animate.css | 30 min | ❌ To do | Animation consistency |
| 🟩 ✅ | 1 | Consolidate `--ease-enter` → `--ease-out` | 10 min | ✅ Done | Cleaner design tokens |
| 🟩 ✅ | 7 | Fix duplicate `@keyframes slideDown` | 30 min | ✅ Done | Animation consistency |
| 🟩 ✅ | 2 | Remove `console.log` debug statements | 15 min | ✅ Done (0 artifacts) | Production cleanliness |
| 🟩 ✅ | 7 | Consolidate duplicate .cart-floating-bar CSS | 5 min | ✅ Done | Reduces CSS bloat |
| 🟩 ✅ | 1 | Remove empty .badge section header | 2 min | ✅ Done | Cleaner CSS |
| 🟩 ✅ | 2 | Remove @supports not (backdrop-filter) fallbacks | 10 min | ✅ Done | Reduces CSS bloat |
| 🟩 ✅ | 1 | Fix .bid-list max-height (responsive) | 2 min | ✅ Done | Better mobile UX |

---

## 📈 METRICS & SUCCESS CRITERIA

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| CSS file size (combined) | ~120KB | ~100KB | `wc -c src/css/*.css` |
| JS bundle size (dist) | ? | -10% | `npm run build` → check dist |
| CSS custom properties | ~82 | ~75 | Count in `_variables.css` (7 aliases removed) |
| `console.log` statements | 0 (runtime) | 0 | `rg "console\.log" src/` |
| Unused imports per page | 0 | 0 | Manual review per page (✅ confirmed) |
| Route cleanup missing | TBD | 0 pages | Check each page for cleanup |
| ESLint warnings | 89 | <30 | `npm run lint` |
| Prefers-reduced-motion respect | Partial | Full | Audit all animations |

---

*Keep this checklist updated as you work through files!*
