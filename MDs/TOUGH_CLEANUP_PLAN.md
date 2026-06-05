# TOUGH CLEANUP PLAN --- Saiyad Frontend

> **Last Updated**: June 5, 2026  
> **Scope**: CSS dead code, undefined CSS variables, duplicate rules, empty sections, PWA manifest, vendor prefix, whitespace  
> **Status**: Phases 1-2 done — Phase 3 ready  
> **Execution Order**: Phase 1 -> 2 -> 3 -> 4 -> 5 (build + verify after each phase)

---

## Phase 1 --- P0: Undefined CSS Variables (bugfixes)

Define missing CSS variables in src/css/_variables.css or fix references to use existing tokens.

| # | File:Line | Issue | Fix | Status |
|---|-----------|-------|-----|--------|
| 1 | _components.css:1534 | var(--background) undefined, no fallback | Defined --background: var(--card-bg) in _variables.css:root | ✅ |
| 2 | _components.css:3174 | var(--shadow-xl) undefined, no fallback | Defined --shadow-xl in _variables.css (:root + [data-theme=dark]) | ✅ |
| 3 | _components.css:4208 | var(--primary-bg) undefined, no fallback | Defined --primary-bg in _variables.css (:root + [data-theme=dark]) | ✅ |
| 4 | _layout.css:15,901 + _components.css:2799 | var(--navbar-height) undefined (uses fallback 60px) | Defined --navbar-height: 60px in _variables.css:root | ✅ |
| 5 | _animations.css:32 | var(--skeleton-bg) undefined (uses fallback var(--border)) | Defined --skeleton-bg: var(--border) in _variables.css:root | ✅ |

**Build check**: ✅ npm run build --- 0 errors, 114 modules

## Phase 2 --- P1: Dead CSS Selectors + Duplicates + Dead Vars

### 2A --- Remove Truly Dead CSS Selectors (no JS/HTML reference)

| # | File | Lines | Selector(s) | Reason | Status |
|---|------|-------|-------------|--------|--------|
| 6 | _animations.css | 104 | .content-fade | Never used in any JS/HTML | ✅ |
| 7 | _components.css | 491-503 | .wishlist-active, .fa-heart.wishlist-active, .thumb-img, .thumb-active | No JS references | ✅ |
| 8 | _components.css | 834-845 | .auction-urgent | No JS references | ✅ |
| 9 | _components.css | 2710-2719 | .page-fade-enter, .page-fade-enter-active | Uses .op-0/.op-100 instead | ✅ |
| 10 | _components.css | 2786-2790 | .cart-item in @media (max-width: 640px) | Base class never defined, not used in JS | ✅ |
| 11 | _components.css | 3142-3144 | .section-anchor | No JS references | ✅ |
| 12 | _components.css | 3147-3149 | tr.bid-highlight | No JS references | ✅ |
| 13 | _components.css | 3223-3225 | .autocomplete-item:hover | Base class never defined | ✅ |
| 14 | _components.css | 3697 | .is-swiping | No JS references | ✅ |
| 15 | _layout.css | 605 | .badge:not(.d-none) { } | Empty rule -- does nothing | ✅ |

### 2B --- Remove Duplicate CSS Rules

| # | File | Lines | Selector(s) | Reason | Status |
|---|------|-------|-------------|--------|--------|
| 16 | style.css | 198-205 | .empty-state-visual | Duplicate of _components.css:2090 | ✅ |
| 17 | style.css | 325-331 | [dir=rtl] rules (7 selectors) | Duplicates of _rtl.css | ✅ |

### 2C --- Remove Dead CSS Variables

| # | File | Lines | Variables | Reason | Status |
|---|------|-------|-----------|--------|--------|
| 18 | _variables.css | 215-216 | --start, --end | Defined but never consumed via var(). Logical properties used instead. | ✅ |

**Build check**: ✅ npm run build --- 0 errors, CSS 340.50 kB -> 339.36 kB

## Phase 3 --- P2: Empty Section Comments + Dead Media Block + Vendor Prefix

### 3A --- Remove Empty Section Comments

| # | File | Lines | Section Header |
|---|------|-------|----------------|
| 19 | _layout.css | 826-831 | PING ANIMATION (notification dot) + blank between headers |
| 20 | _components.css | 1015-1018 | DETAIL PAGE --- layout handled by Bootstrap .row.g-5 |
| 21 | _components.css | 1806-1809 | FEATURES GRID --- migrated to Bootstrap |
| 22 | _components.css | 1890-1892 | DASHBOARD --- layout handled by Bootstrap .row.g-3 |
| 23 | _components.css | 2632-2634 | .profile-links-grid migrated to Bootstrap |
| 24 | _components.css | 2777-2781 | MOBILE NAVBAR (768px and below) --- moved to _layout.css |
| 25 | _bootstrap-overrides.css | 143-144 | Card hover --- Bootstrap doesn't provide card hover |

### 3B --- Remove Dead Countdown Media Queries from style.css

| # | File | Lines | Details |
|---|------|-------|---------|
| 26 | style.css | 296-315 | Entire AUCTION COUNTDOWN section --- .countdown-timer never used in JS. Mobile overrides already in _components.css:867-894. |

### 3C --- Remove Unnecessary Vendor Prefix

| # | File | Line | Details |
|---|------|------|---------|
| 27 | _components.css | 3697 | -webkit-user-select: none --- user-select has full support since 2020. Keep standard property only. |

**Build check**: npm run build --- expect 0 errors

## Phase 4 --- P3: PWA Manifest Fixes

| # | File | Issue | Fix |
|---|------|-------|-----|
| 29 | public/manifest.json | References /apple-touch-icon.png (512x512) --- file doesn't exist | Remove the entry or create the icon asset |
| 30 | public/manifest.json | Hardcodes /logo.png but Vite hashes source assets --- icons won't resolve in production | Move logo.png to public/ so it's copied verbatim to dist root |

**Build check**: npm run build --- verify dist/manifest.json paths

---

## Phase 5 --- P3: Optional Polish

| # | File | Lines | Issue |
|---|------|-------|-------|
| 31 | style.css | 320 | body.modal-open { overflow: hidden; } --- Bootstrap JS already applies this |
| 32 | _components.css | 263-265, 2954-2955 | Triple blank lines -> single blank line |
| 33 | _components.css | 568 | Trailing whitespace after } |

**Build check**: npm run build --- expect 0 errors

---

## Appendix: Files NOT Modified (Verified Clean)

| Area | Status |
|------|--------|
| JS dead exports | All exported symbols across 40+ JS files are imported/used |
| NPM dependencies | All 6 packages actively used |
| Orphaned source files | All 40+ files reachable via import chain |
| Route registration | All 25 pages registered with corresponding routes |
| CSS image references | No external image assets referenced (all inline gradients) |
| Animation keyframes | Zero custom @keyframes (all migrated to Animate.css) |
| Service worker paths | No stale file references |
| Glass motion toggle | Already removed in prior session |

## Execution Notes

- Always run npm run build after each phase to verify no errors introduced
- Keep this file updated --- mark items [x] as they're completed
- When all phases done, update MASTER-REFERENCE.md TODO section with completion note
