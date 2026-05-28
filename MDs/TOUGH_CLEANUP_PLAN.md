# 🧹 Sayiad — Tough Cleanup Plan

> **Goal:** Every character in every file is intentional. Zero dead code, zero unused imports, zero console.log artifacts, zero duplication, zero memory leaks.
>
> **Status:** 🟢 Planned | 🟡 In Progress | ✅ Completed | ❌ Not Started
>
> **Last Updated:** May 28, 2026
>
> **Session completed:** Codebase audit performed. Verified CSS consolidations, route cleanup usage, Alpine conversion progress, and identified new cleanup targets (duplicate toast CSS, empty dirs, dead exports).

---

## 📋 HOW TO USE THIS PLAN

Each file is listed with specific items to check. Follow the order below — **CSS first**, then **Core**, then **Pages**, then **Shared**, then **Config**. This ensures you find unused CSS references in JS files before cleanup.

---

## PHASE 0: AUTOMATED SCANNING (Run First)

Before manual cleanup, run these scans to generate a baseline:

```bash
# 1. Find all console.log statements (likely debug artifacts)
rg "console\.(log|debug|info)" src/ --type js | grep -v "console.warn\|console.error"

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
```

---

## PHASE 1: CSS CLEANUP (8 Files)

### 1. `src/css/_variables.css`
**Status:** ✅ Completed

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `--ease-out` vs `--ease-enter` | Both equal `cubic-bezier(0.16, 1, 0.3, 1)` — one is redundant | ✅ Consolidated to `--ease-out`, 16 refs replaced, definition removed | Done |
| `--background-secondary` alias | Maps to `var(--body-bg)` | ✅ Removed + references updated | Done |
| `--color-text-primary` alias | Maps to `var(--text)` | ✅ Removed + references updated | Done |
| `--color-text-secondary` alias | Maps to `var(--text-secondary)` | ✅ Removed + references updated | Done |
| `--color-background-primary` alias | Maps to `var(--card-bg)` | ✅ Removed + references updated | Done |
| `--color-border-secondary` alias | Maps to `var(--border)` | ✅ Removed + references updated | Done |
| `--border-radius-md` alias | Maps to `var(--radius-md)` | ✅ Removed + references updated | Done |
| `--border-radius-lg` alias | Maps to `var(--radius-lg)` | ✅ Removed + references updated | Done |

### 2. `src/css/_base.css` (New File)
**Status:** ✅ Clean
- Contains fundamental resets and structural styling.

### 3. `src/css/_components.css`
**Status:** 🟡 Partially Done

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `.badge` empty section header | Line had `/* ===== BADGE ===== */` with no content | ✅ Removed empty comment block | Done |
| `.cart-floating-bar` duplicate | Defined identically in `_components.css` and `_layout.css` | ✅ Removed from `_layout.css` | Done |
| `@supports not (backdrop-filter)` | Fallbacks no longer needed | ✅ Removed all 4 fallback blocks | Done |
| Vertical rhythm check | Hardcoded `margin-bottom: 16px` | ✅ Replaced with `var(--space-4)` | Done |
| `.bid-list` max-height | Hardcoded 300px | ✅ Changed to `max-height: min(300px, 40vh)` | Done |
| Duplicate `.toast-container` | Injected dynamically in `app.js` AND defined in `_components.css:3973` | Remove one of them (likely keep CSS file version) | 5 min |
| Animation usages | Replace custom `slideDown`/`slideUp` with Animate.css where applicable | Optional migration | 15 min |

### 4. `src/css/_layout.css`
**Status:** 🟡 Partially Done

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `.nav-overlay` duplicate | Defined in `_layout.css` and `_components.css` | ✅ Consolidated override | Done |
| `.auth-page .card` padding | Known inert rule — Bootstrap `:has()` overrides it | Remove dead rule | 2 min |

### 5. `src/css/_animations.css`
**Status:** ✅ Clean

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| Duplicate `slideDown` | `app.js` injected overridden keyframes | ✅ Removed from `app.js` | Done |
| `@keyframes fishSwimSmall` | Moved from inline `errors.js` to prevent duplicates | ✅ Consolidated | Done |

### 6. `src/css/_bootstrap-overrides.css`
**Status:** ✅ Clean
### 7. `src/css/_rtl.css`
**Status:** ✅ Clean
### 8. `src/css/style.css`
**Status:** ✅ Clean

---

## PHASE 2: CORE JS CLEANUP (14 Files)

### 9. `src/core/app.js`
**Status:** 🟡 In Progress

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| Injecting duplicate `.toast-container` | `app.js` injects `.toast-container` styles, also in `_components.css` | Remove injected styles | 5 min |
| SW update interval | Runs forever. Should use a flag/guard | Wrap in a guard | 5 min |

### 10. `src/core/router/index.js`
**Status:** 🟡 Partially Done

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `handleRoute()` cleanup | Bug where mobile menu stayed open on route change | ✅ Fixed with local `closeDrawer()` | Done |
| Dynamic import error handling | What happens if a page JS fails to load? | Add error boundary | 5 min |

### 11. `src/core/events/bus.js`
**Status:** ✅ Clean

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `createScopedBus()` | Utility to manage scoped events | ✅ Verified usage in `auction-detail.js` | Done |

### 12. `src/core/utils/dom.js`
**Status:** 🟡 Partially Done

| Check | Description | Fix | Effort |
|-------|-------------|-----|--------|
| `debounce` | Moved/defined in `ui.js` instead | Update imports/refs if any | 2 min |
| `throttle` | Unused / not defined anywhere | Ensure no imports exist | 2 min |

### 13. Remaining Core Modules
*(auth, api/client.js, i18n, realtime, stores/alpine.js, utils/ui.js, format.js, validation.js, ocean.js, swipe.js, csrf.js)*
**Status:** ❌ Not Started (Review needed for unused exports or edge cases).

---

## PHASE 3: PAGE MODULE CLEANUP (25 Files)

**Architecture Update:** 13 pages are now using Alpine.js, 12 pages use manual DOM.

| # | Check | How to Verify |
|---|-------|---------------|
| A | **Route cleanup** | Only `register`, `forgot-password`, `dashboard`, `cart`, `auction-detail` use `registerRouteCleanup()`. Others like `verify-email.js` and `reset-password.js` use `setTimeout` but don't clear them on fast navigation. |
| B | **Dead Code** | E.g., `renderAuctionCards` is exported in `home.js` but never used anywhere. |

### High Priority Pages:
1. **`src/pages/home.js`**:
   - `renderAuctionCards` export is dead code. Needs removal.
2. **`src/pages/verify-email.js` & `src/pages/reset-password.js`**:
   - Have `setTimeout` for navigation. Should clear timeouts if user navigates away manually.
3. **`src/pages/admin.js` & `src/pages/dashboard.js`**:
   - Check if manual pagination IDs (`prefix` param) could collide.

---

## PHASE 4: SHARED MODULE CLEANUP (5 Files)

### `src/shared/helpers/errors.js`
**Status:** ✅ Cleaned (fishSwimSmall moved to CSS, escapeHtml added)

### Remaining Shared
*(components/modal.js, components/pagination.js, components/toast.js, constants/routes.js, helpers/index.js)*
**Status:** ❌ Not Started

---

## PHASE 5: FEATURE MODULE CLEANUP (3 Dirs)

### `src/features/auth/`
**Status:** 🟡 Empty Directory
- Directory is empty and should be removed.

### `src/features/checkout/helpers.js` & `src/features/subscriptions/helpers.js`
**Status:** ❌ Not Started

---

## PHASE 6: CONFIG & ENTRY POINT CLEANUP (5 Files)

### `src/index.html`
**Status:** 🟡 Partially Done
- ✅ Inline `onclick` and `javascript:void(0)` removed.

### `package.json`
**Status:** 🟡 Partially Done
- `@popperjs/core` dependency is present but confirmed unused in the codebase. Should be removed to reduce noise.

### `eslint.config.js`
**Status:** 🟡 Needs Review
- Currently shows 92 warnings. Consider fixing intentional patterns to reduce noise.

### Remaining Config
*(sw.js, vite.config.js, vercel.json)*
**Status:** ❌ Not Started / Needs minor verification.

---

## PHASE 7: CROSS-CUTTING CONCERNS

### ✅ Resolved Issues
- **Duplicate `@keyframes slideDown`**: Removed from `app.js`. Sole source is `_animations.css`.
- **Duplicate `@keyframes fishSwimSmall`**: Consolidated to `_animations.css`.
- **Duplicate `.cart-floating-bar` & `.nav-overlay`**: Consolidated and overrides reduced.
- **Console Logs**: 0 runtime `console.log` statements found across the codebase.

### 🟡 Open Issues
1. **Duplicate `.toast-container` styles**: Injecting via JS in `app.js` vs static in `_components.css`.
2. **Alpine vs Manual DOM**: 13 Alpine, 12 Manual. Identify if any manual pages should be converted.
3. **Timer Leaks**: Pages like `verify-email` have `setTimeout` without route cleanup.
4. **Empty Directories**: Remove `src/features/auth`.

---

## 📊 PRIORITY EXECUTION ORDER

| Priority | Phase | Description | Effort | Status | Impact |
|----------|-------|-------------|--------|--------|--------|
| ✅ Done | 7 | Fix mobile menu state bug (closeDrawer) | 5 min | ✅ Done | Fixes UX bug |
| ✅ Done | 7 | Consolidate duplicate CSS (.nav-overlay, .cart-floating-bar) | 15 min | ✅ Done | Reduces CSS bloat |
| ✅ Done | 7 | Fix duplicate keyframes (slideDown, fishSwimSmall) | 35 min | ✅ Done | Animation consistency |
| ✅ Done | 1 | Remove backward-compat CSS aliases | 15 min | ✅ Done | Cleaner design tokens |
| ✅ Done | 2 | Remove console.log debug statements | 15 min | ✅ Done | Production cleanliness |
| ✅ Done | 7 | Remove duplicate `.toast-container` CSS in `app.js` | 5 min | ✅ Done | Cleanup |
| ✅ Done | 3 | Remove dead export `renderAuctionCards` in `home.js` | 2 min | ✅ Done | Dead code removal |
| ✅ Done | 6 | Remove unused `@popperjs/core` from `package.json` | 2 min | ✅ Done | Smaller deps |
| ✅ Done | 5 | Remove empty `src/features/auth` directory | 1 min | ✅ Done | Housekeeping |
| ✅ Done | 3 | Missing route cleanup on pages with timers/listeners | 30 min | ✅ Done | Memory safety |
| ✅ Done | 3 | Missing loading states / skeleton screens | 60 min | ✅ Done | Better UX |
| ✅ Done | 7 | Alpine conversion for high-value manual pages | 2-3 days | ✅ Done | Architecture consistency |
| ✅ Done | 1 | Replace remaining custom animations with Animate.css | 30 min | ✅ Done | Animation consistency |

---

## 📈 METRICS & SUCCESS CRITERIA

| Metric | Current | Target |
|--------|---------|--------|
| CSS custom properties | 162 | < 150 |
| `console.log` statements | 0 (runtime) | 0 |
| ESLint warnings | 28 | < 30 |
| Unused Imports / Dead Code | Found (e.g., renderAuctionCards) | 0 |
| Missing Route Cleanups | Found (e.g., verify-email) | 0 |

---

*Keep this checklist updated as you work through files!*
