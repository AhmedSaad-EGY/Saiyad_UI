/**
 * Alpine.js — Standard Build (eval-reliant)
 *
 * CSP note: vercel.json includes "'unsafe-eval'" in script-src.
 * This is NOT optional with the current Alpine build.
 *
 * ───── Rationale ─────
 *
 * The standard `alpinejs` npm package (v3.15.12) compiles every x-*
 * template directive (x-text, x-show, @click, :class, x-model, etc.)
 * via new Function(code) internally.  Without "'unsafe-eval'" in the
 * Content-Security-Policy, the browser blocks this call and ALL Alpine
 * expressions silently fail — the entire interactive UI (product grids,
 * cart, checkout, auctions, dashboard, filters, search, wallet, auth
 * forms, modals, pagination, notifications) renders as inert static HTML.
 *
 * An audit of the codebase identified ~174 inline expressions across
 * ~20 render-template files that depend on the standard evaluator.
 *
 * ───── Long-term plan (Phase B — pre-launch) ─────
 *
 * Migrate to @alpinejs/csp (the CSP-compliant build):
 *   1. npm install @alpinejs/csp
 *   2. Change all 24 `import Alpine from 'alpinejs'` →
 *      `import Alpine from '@alpinejs/csp'`
 *   3. Refactor the ~174 inline expressions to registered methods
 *      on Alpine.data() objects (e.g. @click="openFilterSheet()"
 *      instead of @click="filterSheetOpen = true")
 *   4. Remove "'unsafe-eval'" from script-src in vercel.json
 *   5. Full manual QA pass on every page
 *
 * Estimated effort: 4-8 hours across ~44 files.
 *
 * Do NOT remove "'unsafe-eval'" from the CSP until this migration
 * is complete.  Doing so will INSTANTLY break every page that
 * uses Alpine reactivity.
 */
import Alpine from '@alpinejs/csp';
import '../shared/stores/cart.store.js';
import '../shared/stores/ui.store.js';
import '../shared/stores/wallet.store.js';
import '../shared/stores/notif.store.js';
import '../shared/stores/auth.store.js';
import '../shared/stores/magic.js';
import '../widgets/ui/modal.js';
import '../widgets/ui/pagination.js';

Alpine.start();
