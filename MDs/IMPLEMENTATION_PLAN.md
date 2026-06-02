# SAYIAD — COMPLETE IMPLEMENTATION PLAN
### For: DeepSeek V4 Flash · Prepared by: Claude Audit System
### Covers: All 33 issues · Frontend + Backend

---

## ⚠️ RULES — READ THESE FIRST. FOLLOW THEM ON EVERY SINGLE TASK.

```
RULE 1 → Work on EXACTLY ONE task at a time. Finish it fully. Then move to the next.
RULE 2 → Never change anything in a file that the task does NOT explicitly say to change.
RULE 3 → Use Ctrl+F / "Find in File" to locate text. Do NOT guess line numbers.
RULE 4 → If a task says FIND "some text" and you cannot find it → STOP. Report which task.
RULE 5 → After every task: SAVE the file. After every phase: GIT COMMIT using the message shown.
RULE 6 → Never DELETE existing code unless the task explicitly says the word DELETE.
RULE 7 → In JSON files: every key-value pair except the last one in an object needs a comma after it.
RULE 8 → For backend tasks: run `dotnet build` before committing. Fix any compiler errors first.
RULE 9 → Do NOT skip the TEST step at the end of each task.
RULE 10 → The function name getUser() used in this plan must match your auth.js. If it's named
           differently (getCurrentUser, AuthService.getUser, etc.), use that name instead.
```

---

## 👤 ACTIONS THE HUMAN MUST DO BEFORE DEEPSEEK STARTS

Before DeepSeek begins, ask the user for these. Mark each as done before the task that needs it.

| ID | What You Need | Needed By |
|----|--------------|-----------|
| USER-A1 | Facebook page URL for Sayiad | TASK-H3 |
| USER-A1 | Instagram handle/URL for Sayiad | TASK-H3 |
| USER-A1 | WhatsApp Business number (e.g. +201012345678) | TASK-H3, TASK-L1 |
| USER-A2 | An `apple-touch-icon.png` file (180×180px, Sayiad logo) placed in repo root | TASK-H9 |
| USER-A3 | Confirm exact wallet API endpoint paths: balance? deposit? transactions? | TASK-C1, TASK-B4 |

---

---

# PHASE 1 — CRITICAL FIXES
### Do these five tasks first. In order. Before anything else.

---

## TASK-C1 — Create the Missing Wallet Page

**Repos:** Saiyad_UI (frontend)
**Files touched:** `pages/wallet.js` (CREATE NEW), `index.html` (MODIFY)

---

### Step 1 of 2 — CREATE the file `pages/wallet.js`

Create a brand-new file at path `pages/wallet.js`. Paste this entire content into it.
Before saving, check [USER-A3]: if your deposit endpoint is not `/api/wallet/deposit`,
update the 3 lines marked `// ← CONFIRM ENDPOINT`.

```javascript
// pages/wallet.js — Sayiad Wallet Page

function initWalletPage() {
  const app = document.getElementById('app');

  // ── Role guard: must be logged in ──────────────────────────────────────────
  const user = getUser();
  if (!user) { window.location.hash = '#/login'; return; }

  setPageMeta('My Wallet', 'Manage your Sayiad wallet balance and transactions.');

  app.innerHTML = `
    <section class="wallet-page" aria-label="Wallet">
      <div class="container">

        <header class="wallet-header">
          <h1 data-i18n="wallet_title">My Wallet</h1>
        </header>

        <div class="wallet-balance-card" id="walletBalanceCard">
          <div class="wallet-balance-label" data-i18n="wallet_balance">Available Balance</div>
          <div class="wallet-balance-amount" id="walletBalanceAmount" aria-live="polite">
            <span aria-busy="true" data-i18n="loading">Loading…</span>
          </div>
          <div class="wallet-balance-currency">EGP</div>
          <button class="btn btn-primary" id="topUpBtn" data-i18n="wallet_topup">
            <i class="fas fa-plus-circle" aria-hidden="true"></i> Top Up
          </button>
        </div>

        <section class="wallet-transactions-section" aria-labelledby="txHeading">
          <h2 id="txHeading" data-i18n="wallet_history">Transaction History</h2>
          <div id="walletTransactionsContainer" aria-live="polite" aria-busy="true">
            <div class="loading-spinner" role="status" aria-label="Loading transactions">
              <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
            </div>
          </div>
        </section>

      </div>
    </section>

    <!-- ── Top-Up Modal ──────────────────────────────────────────────────── -->
    <div class="modal-overlay hidden" id="topUpModalOverlay"
         role="dialog" aria-modal="true" aria-labelledby="topUpModalTitle">
      <div class="modal-box">
        <div class="modal-header">
          <h2 id="topUpModalTitle" data-i18n="wallet_topup_title">Top Up Wallet</h2>
          <button class="modal-close-btn" id="topUpCloseBtn" aria-label="Close top up modal">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="topUpAmount" data-i18n="wallet_amount_label">Amount (EGP)</label>
            <input type="number" id="topUpAmount" min="10" max="50000"
                   placeholder="Minimum EGP 10" class="form-control"
                   aria-describedby="topUpAmountError" />
            <span class="field-error hidden" id="topUpAmountError" role="alert"></span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="topUpCancelBtn" data-i18n="cancel">Cancel</button>
          <button class="btn btn-primary"   id="topUpConfirmBtn" data-i18n="wallet_confirm_topup">
            Confirm Top Up
          </button>
        </div>
      </div>
    </div>`;

  // ── Wire events ─────────────────────────────────────────────────────────────
  document.getElementById('topUpBtn').addEventListener('click', openTopUpModal);
  document.getElementById('topUpCloseBtn').addEventListener('click', closeTopUpModal);
  document.getElementById('topUpCancelBtn').addEventListener('click', closeTopUpModal);
  document.getElementById('topUpConfirmBtn').addEventListener('click', handleTopUp);
  document.getElementById('topUpModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('topUpModalOverlay')) closeTopUpModal();
  });

  // ── Load data ────────────────────────────────────────────────────────────────
  loadWalletBalance();
  loadWalletTransactions();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function openTopUpModal() {
  const overlay = document.getElementById('topUpModalOverlay');
  overlay.classList.remove('hidden');
  document.getElementById('topUpAmount').focus();

  // Close on Escape
  function onEsc(e) {
    if (e.key === 'Escape') { closeTopUpModal(); document.removeEventListener('keydown', onEsc); }
  }
  document.addEventListener('keydown', onEsc);
}

function closeTopUpModal() {
  document.getElementById('topUpModalOverlay').classList.add('hidden');
  document.getElementById('topUpAmount').value = '';
  const errEl = document.getElementById('topUpAmountError');
  if (errEl) { errEl.classList.add('hidden'); errEl.textContent = ''; }
  const btn = document.getElementById('topUpConfirmBtn');
  if (btn) { btn.disabled = false; btn.innerHTML = 'Confirm Top Up'; }
}

async function loadWalletBalance() {
  try {
    const res = await apiRequest('GET', '/api/wallet/balance'); // ← CONFIRM ENDPOINT
    const amount = res?.balance ?? res?.amount ?? res?.data?.balance ?? 0;
    document.getElementById('walletBalanceAmount').textContent =
      Number(amount).toLocaleString('ar-EG', { minimumFractionDigits: 2 });
  } catch {
    document.getElementById('walletBalanceAmount').textContent = '—';
    showToast('Failed to load balance. Please refresh.', 'error');
  }
}

async function loadWalletTransactions() {
  const container = document.getElementById('walletTransactionsContainer');
  try {
    const res = await apiRequest('GET', '/api/wallet/transactions'); // ← CONFIRM ENDPOINT
    const txs = Array.isArray(res) ? res : (res?.data ?? res?.transactions ?? []);

    if (!txs.length) {
      container.setAttribute('aria-busy', 'false');
      container.innerHTML = `
        <div class="empty-state" role="status">
          <div class="empty-state__icon" aria-hidden="true"><i class="fas fa-receipt"></i></div>
          <h3 class="empty-state__title" data-i18n="wallet_no_transactions">No transactions yet</h3>
          <p class="empty-state__desc" data-i18n="wallet_no_transactions_desc">
            Your transaction history will appear here.
          </p>
        </div>`;
      return;
    }

    container.setAttribute('aria-busy', 'false');
    container.innerHTML = `
      <div class="table-responsive" role="region" aria-label="Transaction history" tabindex="0">
        <table class="data-table">
          <caption class="sr-only">Wallet transaction history</caption>
          <thead>
            <tr>
              <th scope="col" data-i18n="wallet_col_date">Date</th>
              <th scope="col" data-i18n="wallet_col_type">Type</th>
              <th scope="col" data-i18n="wallet_col_desc">Description</th>
              <th scope="col" data-i18n="wallet_col_amount">Amount (EGP)</th>
              <th scope="col" data-i18n="wallet_col_status">Status</th>
            </tr>
          </thead>
          <tbody>
            ${txs.map(tx => `
              <tr>
                <td>${new Date(tx.date ?? tx.createdAt ?? tx.created_at).toLocaleDateString('en-EG')}</td>
                <td><span class="tx-type tx-type-${(tx.type ?? 'other').toLowerCase()}">${escapeHTML(tx.type ?? '—')}</span></td>
                <td>${escapeHTML(tx.description ?? tx.desc ?? '—')}</td>
                <td class="${(tx.amount ?? 0) >= 0 ? 'tx-positive' : 'tx-negative'}">
                  ${(tx.amount ?? 0) >= 0 ? '+' : ''}${Number(tx.amount ?? 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                </td>
                <td><span class="status-badge status-${(tx.status ?? 'pending').toLowerCase()}">${escapeHTML(tx.status ?? 'Pending')}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch {
    container.innerHTML = `
      <div class="error-state" role="alert">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        <p data-i18n="wallet_load_error">Failed to load transactions. Please try again.</p>
        <button class="btn btn-secondary" onclick="loadWalletTransactions()" data-i18n="retry">Retry</button>
      </div>`;
  }
}

async function handleTopUp() {
  const input  = document.getElementById('topUpAmount');
  const errEl  = document.getElementById('topUpAmountError');
  const btn    = document.getElementById('topUpConfirmBtn');
  const amount = parseFloat(input.value);

  errEl.classList.add('hidden');
  errEl.textContent = '';

  if (!amount || isNaN(amount) || amount < 10) {
    errEl.textContent = 'Please enter a valid amount (minimum EGP 10)';
    errEl.classList.remove('hidden');
    input.focus();
    return;
  }
  if (amount > 50000) {
    errEl.textContent = 'Maximum top-up is EGP 50,000';
    errEl.classList.remove('hidden');
    input.focus();
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Processing…';

  try {
    await apiRequest('POST', '/api/wallet/deposit', { amount }); // ← CONFIRM ENDPOINT
    closeTopUpModal();
    showToast('Wallet topped up successfully!', 'success');
    loadWalletBalance();
    loadWalletTransactions();
  } catch (err) {
    errEl.textContent = err?.message ?? 'Top up failed. Please try again.';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = 'Confirm Top Up';
  }
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
```

---

### Step 2 of 2 — Register the script in `index.html`

Open `index.html`.
Find this EXACT line:
```
<script defer src="pages/subscriptions.js?v=20260517"></script>
```
On the line DIRECTLY AFTER IT, insert:
```html
<script defer src="pages/wallet.js?v=20260517"></script>
```

---

### CSS for wallet — add at the END of `css/style.css`

```css
/* ===================== WALLET PAGE ===================== */
.wallet-page { padding: 2rem 1.5rem; max-width: 900px; margin: 0 auto; }
.wallet-header { margin-bottom: 1.5rem; }
.wallet-header h1 { font-size: 1.75rem; font-weight: 700; }
.wallet-balance-card {
  background: var(--card-bg, #1a2a4a);
  border-radius: 16px; padding: 2rem;
  display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem;
  margin-bottom: 2rem; box-shadow: 0 4px 24px rgba(0,0,0,.12);
}
.wallet-balance-label { font-size: .875rem; opacity: .7; }
.wallet-balance-amount { font-size: 2.5rem; font-weight: 700; letter-spacing: -.5px; }
.wallet-balance-currency { font-size: .875rem; opacity: .7; margin-top: -.5rem; }
.wallet-transactions-section h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; }
.tx-type { text-transform: capitalize; font-size: .8125rem; font-weight: 500;
           padding: 2px 8px; border-radius: 4px; }
.tx-positive { color: #22c55e; font-weight: 600; }
.tx-negative { color: #ef4444; font-weight: 600; }
.table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.data-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
.data-table th { text-align: start; padding: .75rem 1rem; font-weight: 500; opacity: .7;
                 border-bottom: 1px solid var(--border-color, #2a3a5a); }
.data-table td { padding: .875rem 1rem; border-bottom: 1px solid var(--border-color, #1e2d4a); }
```

---

✅ **TEST:** Login with any account → Open user dropdown → Click **Wallet** →
The page must render with a balance card and a transaction table (or empty state).
It must NOT be a blank page.

---

## TASK-C2 — Fix Arabic RTL: Update `lang` + `dir` on Language Switch

**Repos:** Saiyad_UI (frontend)
**File:** `js/app.js` (or whichever file contains the `langToggle` click handler)

### Step 1 — Find the toggle handler

Open `js/app.js`.
Press Ctrl+F and search for: `langToggle`
You will find a `addEventListener('click', ...)` block.
Inside that block find the line where the new language value is determined
(the variable that becomes `'ar'` or `'en'`). Call that variable `currentLang` in your head.

### Step 2 — Add the two lines

Immediately AFTER the line that saves the language to localStorage
(it will look like `localStorage.setItem('lang', something)`),
ADD these two lines. Replace `currentLang` with whatever your variable is actually named:

```javascript
document.documentElement.setAttribute('lang', currentLang === 'ar' ? 'ar' : 'en');
document.documentElement.setAttribute('dir',  currentLang === 'ar' ? 'rtl' : 'ltr');
```

### Step 3 — Also apply on page load

In the same file (`js/app.js`), find the page-load initialization block
(look for `DOMContentLoaded` or the first function that runs on startup).
Find where the saved language is READ from localStorage
(something like `const lang = localStorage.getItem('lang')`).
AFTER that read, ADD these same two lines:

```javascript
document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
document.documentElement.setAttribute('dir',  lang === 'ar' ? 'rtl' : 'ltr');
```

### Step 4 — Add RTL CSS overrides at END of `css/style.css`

```css
/* ===================== RTL SUPPORT ===================== */
[dir="rtl"] .nav-links        { flex-direction: row-reverse; }
[dir="rtl"] .dropdown-menu    { left: auto; right: 0; }
[dir="rtl"] .breadcrumb       { flex-direction: row-reverse; }
[dir="rtl"] .card-meta        { flex-direction: row-reverse; }
[dir="rtl"] .form-group label { text-align: right; }
[dir="rtl"] .modal-header     { flex-direction: row-reverse; }
[dir="rtl"] .toast            { left: 1rem; right: auto; }
[dir="rtl"] .back-btn i       { transform: scaleX(-1); }
```

---

✅ **TEST:** Click the language toggle (EN → AR).
The page layout must FLIP — navigation right-aligned, text flows right-to-left.
Open DevTools → Elements → `<html>` tag must show `lang="ar" dir="rtl"`.
Toggle back (AR → EN): `lang="en" dir="ltr"` returns.

---

## TASK-C3 — Add Security Headers to `vercel.json`

**Repos:** Saiyad_UI (frontend)
**File:** `vercel.json` (MODIFY — file already exists)

Open `vercel.json`.

**CASE A — If the file already has a `"headers"` key:**
Find the `"headers"` array and ADD this object to it (add a comma after the last existing item):
```json
{
  "source": "/(.*)",
  "headers": [
    { "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' fonts.googleapis.com 'unsafe-inline'; font-src 'self' fonts.gstatic.com cdnjs.cloudflare.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://sayiad.runasp.net wss://sayiad.runasp.net; frame-ancestors 'none'; object-src 'none';" },
    { "key": "X-Frame-Options",             "value": "DENY" },
    { "key": "X-Content-Type-Options",      "value": "nosniff" },
    { "key": "Referrer-Policy",             "value": "strict-origin-when-cross-origin" },
    { "key": "Permissions-Policy",          "value": "camera=(), microphone=(), geolocation=()" },
    { "key": "Strict-Transport-Security",   "value": "max-age=31536000; includeSubDomains" }
  ]
}
```

**CASE B — If the file does NOT have a `"headers"` key:**
Add the following block as a top-level key in the JSON object:
```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      { "key": "Content-Security-Policy",
        "value": "default-src 'self'; script-src 'self' cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' fonts.googleapis.com 'unsafe-inline'; font-src 'self' fonts.gstatic.com cdnjs.cloudflare.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://sayiad.runasp.net wss://sayiad.runasp.net; frame-ancestors 'none'; object-src 'none';" },
      { "key": "X-Frame-Options",             "value": "DENY" },
      { "key": "X-Content-Type-Options",      "value": "nosniff" },
      { "key": "Referrer-Policy",             "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy",          "value": "camera=(), microphone=(), geolocation=()" },
      { "key": "Strict-Transport-Security",   "value": "max-age=31536000; includeSubDomains" }
    ]
  }
]
```
Remember the comma rule: add a comma after the key before this if there is one.

---

✅ **TEST:** Push to Vercel → DevTools → Network → Click main page request →
Headers tab → You must see `content-security-policy`, `x-frame-options`,
and `x-content-type-options` in the response headers.

---

## TASK-C4 — Add Loading Skeleton + Global API Error State

**Repos:** Saiyad_UI (frontend)
**Files:** `index.html`, `css/style.css`, `js/router.js`

### Step 1 — Replace `<main id="app">` in `index.html`

Find this EXACT text:
```html
<main id="app"></main>
```
Replace it with:
```html
<main id="app">
  <div id="globalSkeleton" class="global-skeleton" aria-busy="true"
       aria-label="Loading page content" role="status">
    <div class="gsk-bar gsk-bar--w60"></div>
    <div class="gsk-bar gsk-bar--w40"></div>
    <div class="gsk-cards">
      <div class="gsk-card"></div>
      <div class="gsk-card"></div>
      <div class="gsk-card"></div>
    </div>
  </div>
  <div id="globalError" class="global-error hidden" role="alert" aria-live="assertive">
    <i class="fas fa-satellite-dish" aria-hidden="true"></i>
    <h2 data-i18n="error_service_unavailable">Service Temporarily Unavailable</h2>
    <p data-i18n="error_service_unavailable_desc">
      We're having trouble connecting. Check your connection and try again.
    </p>
    <button class="btn btn-primary" onclick="window.location.reload()" data-i18n="retry">
      Retry
    </button>
  </div>
</main>
```

### Step 2 — Add CSS at END of `css/style.css`

```css
/* ===================== GLOBAL SKELETON ===================== */
.global-skeleton { padding: 2rem 1.5rem; max-width: 1200px; margin: 0 auto; }
.gsk-bar {
  height: 16px; border-radius: 8px; margin-bottom: 12px;
  background: linear-gradient(90deg,
    var(--border-color, #e0e0e0) 25%,
    var(--card-bg,    #f5f5f5)   50%,
    var(--border-color, #e0e0e0) 75%);
  background-size: 200% 100%;
  animation: skShimmer 1.5s infinite;
}
.gsk-bar--w60 { width: 60%; }
.gsk-bar--w40 { width: 40%; }
.gsk-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px,1fr));
             gap: 1rem; margin-top: 1.5rem; }
.gsk-card {
  height: 200px; border-radius: 12px;
  background: linear-gradient(90deg,
    var(--border-color, #e0e0e0) 25%,
    var(--card-bg,    #f5f5f5)   50%,
    var(--border-color, #e0e0e0) 75%);
  background-size: 200% 100%;
  animation: skShimmer 1.5s infinite;
}
@keyframes skShimmer {
  0%   { background-position:  200% 0; }
  100% { background-position: -200% 0; }
}
/* ===================== GLOBAL ERROR ===================== */
.global-error {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center;
  min-height: 60vh; gap: 1rem; padding: 2rem;
}
.global-error > i { font-size: 3rem; opacity: .4; }
```

### Step 3 — Hide skeleton on route change in `js/router.js`

Open `js/router.js`.
Find the route-handler function (search for `hashchange` or `handleRoute` or `navigate`).
At the VERY FIRST LINE inside that function body, ADD:

```javascript
const _sk = document.getElementById('globalSkeleton');
const _ge = document.getElementById('globalError');
if (_sk) _sk.classList.add('hidden');
if (_ge) _ge.classList.add('hidden');
```

---

✅ **TEST:** Throttle network to "Slow 3G" in DevTools → Reload the page →
You should see shimmer skeleton cards for 1–3 seconds before content appears.

---

## TASK-C5 — Add Role Guards to All Protected Pages

**Repos:** Saiyad_UI (frontend)
**Files:** `pages/admin.js`, `pages/auction-requests.js`,
           `pages/auction-requests-review.js`, `pages/auctioneer-analytics.js`

For EACH of the four files below, open the file, find the main init function
(search for `function init`), and ADD the guard block as the VERY FIRST lines
inside that function — before any other code.

**`pages/admin.js`** — ADD at start of init function:
```javascript
const _u = getUser();
if (!_u || _u.role !== 'Admin') { window.location.hash = '#/'; return; }
```

**`pages/auction-requests.js`** — ADD at start of init function:
```javascript
const _u = getUser();
if (!_u || !['Auctioneer','Admin'].includes(_u.role)) { window.location.hash = '#/'; return; }
```

**`pages/auction-requests-review.js`** — ADD at start of init function:
```javascript
const _u = getUser();
if (!_u || !['Auctioneer','Admin'].includes(_u.role)) { window.location.hash = '#/'; return; }
```

**`pages/auctioneer-analytics.js`** — ADD at start of init function:
```javascript
const _u = getUser();
if (!_u || !['Auctioneer','Admin'].includes(_u.role)) { window.location.hash = '#/'; return; }
```

⚠️ Check what `getUser()` returns for the `role` field.
Open `js/auth.js`, find where the user object is stored (usually `JSON.parse(localStorage.getItem(...))`).
Check if the role is stored as `role`, `Role`, `userRole`, or inside a `claims` object.
Use the exact same field name in the guards above.

---

✅ **TEST:**
1. Log in as Customer account
2. Manually type this in the browser address bar: `https://saiyad-eg.vercel.app/#/admin`
3. You must be immediately redirected to home page (`#/`)
4. You must NOT see any admin panel content

---

### 🔖 GIT COMMIT — PHASE 1 COMPLETE
```
git add -A
git commit -m "fix(critical): wallet page, RTL dir+lang, CSP headers, loading skeleton, role guards"
git push
```

---

---

# PHASE 2 — HIGH PRIORITY FIXES

---

## TASK-H1 — Code Splitting: Load Page Scripts On Demand

**Repos:** Saiyad_UI (frontend)
**Files:** `index.html`, `js/router.js`, `js/utils.js`

### Step 1 — Remove page scripts from `index.html`

Open `index.html`.
DELETE all lines that match this pattern (there are 24 of them):
```
<script defer src="pages/ANYTHING.js?v=..."></script>
```
Do NOT delete lines that say `src="js/ANYTHING.js"` — keep all the core JS files.
After deleting, you should have ZERO `pages/` script tags remaining.

### Step 2 — Add `showPageError()` to `js/utils.js`

Open `js/utils.js`. Go to the END of the file. ADD:

```javascript
function showPageError() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="global-error" role="alert">
      <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
      <h2>Page failed to load</h2>
      <p>Please check your connection and try again.</p>
      <button class="btn btn-primary" onclick="window.location.reload()">Reload</button>
    </div>`;
}
```

### Step 3 — Rewrite router to use dynamic imports

Open `js/router.js`.
Find the route-dispatch logic. It will look like a `switch` statement or `if/else` chain.
Each branch calls a function like `initHomePage()`, `initProductsPage()`, etc.

For EVERY such call, replace:
```javascript
initXxxPage();
```
with:
```javascript
import('./pages/xxx.js?v=20260517')
  .then(() => { if (typeof initXxxPage === 'function') initXxxPage(); })
  .catch(() => showPageError());
```

Use the table below to match function names to file names:

| Function name           | File name                      |
|-------------------------|--------------------------------|
| initHomePage            | pages/home.js                  |
| initLoginPage           | pages/login.js                 |
| initRegisterPage        | pages/register.js              |
| initForgotPasswordPage  | pages/forgot-password.js       |
| initResetPasswordPage   | pages/reset-password.js        |
| initProductsPage        | pages/products.js              |
| initProductDetailPage   | pages/product-detail.js        |
| initAuctionsPage        | pages/auctions.js              |
| initAuctionDetailPage   | pages/auction-detail.js        |
| initCartPage            | pages/cart.js                  |
| initDashboardPage       | pages/dashboard.js             |
| initVerifyEmailPage     | pages/verify-email.js          |
| initShippingPage        | pages/shipping.js              |
| initCheckoutPage        | pages/checkout.js              |
| initSellerProfilePage   | pages/seller-profile.js        |
| initProfilePage         | pages/profile.js               |
| initOrderDetailPage     | pages/order-detail.js          |
| initAdminPage           | pages/admin.js                 |
| initTermsPage           | pages/terms.js                 |
| initPrivacyPage         | pages/privacy.js               |
| initAuctionRequestsPage | pages/auction-requests.js      |
| initAuctionRequestsReviewPage | pages/auction-requests-review.js |
| initAuctioneerAnalyticsPage   | pages/auctioneer-analytics.js    |
| initSubscriptionsPage   | pages/subscriptions.js         |
| initWalletPage          | pages/wallet.js                |

If the function names in your router are different, use the ones that actually exist.

---

✅ **TEST:** DevTools → Network → Filter "JS" → Load home page.
You must see ONLY core scripts (config, api, auth, utils, translations, etc.) — NOT admin.js or products.js.
Now navigate to Products → ONLY `products.js` must appear as a new network request.

---

## TASK-H2 — SEO: Meta Tags + `setPageMeta()` Helper

**Files:** `index.html`, `js/utils.js`, `pages/home.js`, `pages/products.js`, `pages/auctions.js`

### Step 1 — Add meta tags to `index.html` `<head>`

Open `index.html`. Find:
```html
<title>Sayiad - Fishing Marketplace & Auctions</title>
```
After that line, ADD:
```html
<meta name="description"         content="Sayiad — Egypt's premier fishing marketplace. Buy fresh fish, seafood, and fishing equipment. Join live fish auctions online.">
<meta property="og:site_name"    content="Sayiad">
<meta property="og:type"         content="website">
<meta property="og:title"        content="Sayiad - Fishing Marketplace &amp; Auctions">
<meta property="og:description"  content="Egypt's premier fishing marketplace. Buy fresh fish, seafood, and equipment. Join live auctions.">
<meta property="og:image"        content="https://saiyad-eg.vercel.app/logo.png">
<meta property="og:url"          content="https://saiyad-eg.vercel.app">
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="Sayiad - Fishing Marketplace &amp; Auctions">
<meta name="twitter:description" content="Egypt's premier fishing marketplace. Buy fresh fish and seafood or join live auctions.">
<meta name="twitter:image"       content="https://saiyad-eg.vercel.app/logo.png">
<link rel="canonical"            href="https://saiyad-eg.vercel.app">
```

### Step 2 — Add `setPageMeta()` to `js/utils.js`

Open `js/utils.js`. END of file. ADD:
```javascript
function setPageMeta(title, description) {
  document.title = title
    ? title + ' — Sayiad'
    : 'Sayiad - Fishing Marketplace & Auctions';

  const desc = description || "Egypt's premier fishing marketplace.";
  const set = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };
  set('meta[name="description"]',         'content', desc);
  set('meta[property="og:title"]',        'content', document.title);
  set('meta[property="og:description"]',  'content', desc);
  set('link[rel="canonical"]',            'href',    window.location.href.split('#')[0]);
}
```

### Step 3 — Call `setPageMeta()` in 3 pages

- **`pages/home.js`** — at top of init function ADD:
  `setPageMeta('Home', "Egypt's premier fishing marketplace.");`
- **`pages/products.js`** — at top of init function ADD:
  `setPageMeta('Fish & Seafood Products', 'Browse fresh fish and seafood on Sayiad marketplace.');`
- **`pages/auctions.js`** — at top of init function ADD:
  `setPageMeta('Live Fish Auctions', 'Join live fish auctions on Sayiad. Bid on fresh catches.');`

---

✅ **TEST:** Open site → Right-click → View Page Source → Find `<meta name="description">`.
It must NOT be empty. Navigate to Products → Title bar must say "Fish & Seafood Products — Sayiad".

---

## TASK-H3 — Fix Dead Social Links in Footer

**⚠️ WAIT for [USER-A1] before starting this task.**

Open `index.html`. Search for `href="#"` inside the `<footer>` element.
You will find 3 links (Facebook, Instagram, WhatsApp).

Replace each `href="#"` with the values provided by the user:

```html
<!-- Facebook -->
href="https://facebook.com/[FB_PAGE_NAME]" target="_blank" rel="noopener noreferrer"

<!-- Instagram -->
href="https://instagram.com/[INSTA_HANDLE]" target="_blank" rel="noopener noreferrer"

<!-- WhatsApp -->
href="https://wa.me/[PHONE_NUMBER_NO_SPACES_NO_PLUS]" target="_blank" rel="noopener noreferrer"
```

Example WhatsApp: if number is +20 101 234 5678 → use `href="https://wa.me/201012345678"`

---

✅ **TEST:** Click each social link → each must open in a new tab at the correct social page.

---

## TASK-H4 — Add DOMPurify + `safeSetHTML()` to Prevent XSS

**Files:** `index.html`, `js/utils.js`, `pages/product-detail.js`, `pages/auction-detail.js`

### Step 1 — Add DOMPurify CDN to `index.html`

Open `index.html`. Find:
```html
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.0/signalr.min.js"></script>
```
On the line BEFORE it, ADD (without `defer` — must load synchronously):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.5/purify.min.js"></script>
```

### Step 2 — Add `safeSetHTML()` to `js/utils.js`

Open `js/utils.js`. END of file. ADD:
```javascript
/**
 * ALWAYS use safeSetHTML() instead of element.innerHTML = userContent
 * for any content received from the API or typed by a user.
 */
function safeSetHTML(element, htmlString) {
  if (!element) return;
  if (typeof DOMPurify !== 'undefined') {
    element.innerHTML = DOMPurify.sanitize(htmlString, {
      ALLOWED_TAGS: ['b','i','em','strong','a','br','p','span','ul','ol','li'],
      ALLOWED_ATTR: ['href','target','rel','class']
    });
  } else {
    const d = document.createElement('div');
    d.textContent = typeof htmlString === 'string' ? htmlString : '';
    element.textContent = d.textContent;
  }
}
```

### Step 3 — Replace unsafe innerHTML in product & auction detail pages

Open `pages/product-detail.js`.
Press Ctrl+F, search for `innerHTML`.
For EVERY line where `innerHTML` is being set with API data (description, name, bio, etc.),
replace:
```javascript
someElement.innerHTML = someApiData;
```
with:
```javascript
safeSetHTML(someElement, someApiData);
```

Repeat for `pages/auction-detail.js`.

---

✅ **TEST:** Create a product with this exact description text: `<script>alert('xss')</script>`
View the product detail page. No alert dialog must appear.
The description area must show nothing (or the escaped text), NOT execute the script.

---

## TASK-H5 — SignalR Reconnection with Status Banner

**File:** `js/signalr.js`

Open `js/signalr.js`.

### Step 1 — Update the connection builder

Find the line containing `HubConnectionBuilder`.
Replace the ENTIRE builder chain (from `new signalR.HubConnectionBuilder()` to `.build()`) with:
```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://sayiad.runasp.net/hubs/auction", {
    accessTokenFactory: () => getToken()
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000, 20000, 30000])
  .configureLogging(signalR.LogLevel.Warning)
  .build();
```

### Step 2 — Replace the `.start()` call

Find `.start()` and replace the entire `.start()` block with:
```javascript
connection.start()
  .then(() => { hideSignalRBanner(); })
  .catch(() => { showSignalRBanner(); });

connection.onreconnecting(() => showSignalRBanner());
connection.onreconnected(()  => hideSignalRBanner());
connection.onclose(()        => showSignalRBanner());
```

### Step 3 — Add banner helpers at END of `js/signalr.js`

```javascript
function showSignalRBanner() {
  let b = document.getElementById('signalrBanner');
  if (!b) {
    b = document.createElement('div');
    b.id = 'signalrBanner';
    b.setAttribute('role', 'status');
    b.setAttribute('aria-live', 'polite');
    b.style.cssText = [
      'position:fixed','bottom:1rem','left:50%','transform:translateX(-50%)',
      'background:#f59e0b','color:#000','padding:.5rem 1.25rem',
      'border-radius:2rem','font-size:.875rem','font-weight:500',
      'z-index:9999','display:flex','align-items:center','gap:.5rem',
      'box-shadow:0 4px 12px rgba(0,0,0,.25)'
    ].join(';');
    b.innerHTML = '<i class="fas fa-wifi" aria-hidden="true"></i>'
                + '<span data-i18n="reconnecting">Reconnecting to auction…</span>';
    document.body.appendChild(b);
  }
  b.style.display = 'flex';
}

function hideSignalRBanner() {
  const b = document.getElementById('signalrBanner');
  if (b) b.style.display = 'none';
}
```

---

✅ **TEST:** Open an auction detail page → DevTools → Network → set to Offline →
A yellow "Reconnecting to auction…" banner must appear at the bottom.
Set back to Online → Banner disappears.

---

## TASK-H6 — Login Rate Limiting (Frontend)

**File:** `pages/login.js`

Open `pages/login.js`.
Find the form submission / login button handler.
Find the section that handles a FAILED login response (the `.catch()` block or error branch).

### Step 1 — ADD this block inside the error handler (after showing the error message)

```javascript
// Track failed attempts
let failCount = parseInt(sessionStorage.getItem('sayiadLoginFails') || '0') + 1;
sessionStorage.setItem('sayiadLoginFails', failCount);

if (failCount >= 5) {
  const submitBtn = document.querySelector('#loginForm button[type="submit"], #loginSubmitBtn');
  const lockMsg   = document.getElementById('loginLockMsg');
  if (submitBtn) submitBtn.disabled = true;
  let secs = 30;
  if (lockMsg) {
    lockMsg.classList.remove('hidden');
    lockMsg.textContent = `Too many failed attempts. Wait ${secs} seconds.`;
  }
  const timer = setInterval(() => {
    secs--;
    if (lockMsg) lockMsg.textContent = `Too many failed attempts. Wait ${secs} seconds.`;
    if (secs <= 0) {
      clearInterval(timer);
      sessionStorage.removeItem('sayiadLoginFails');
      if (submitBtn) submitBtn.disabled = false;
      if (lockMsg) lockMsg.classList.add('hidden');
    }
  }, 1000);
}
```

### Step 2 — Add `id="loginLockMsg"` element to the login form HTML

In the same file, find the HTML template string for the login form.
Find the submit button. BEFORE the submit button, ADD:
```html
<div id="loginLockMsg" class="field-error hidden" role="alert" aria-live="assertive"></div>
```

### Step 3 — Clear counter on success

Find the successful login handler (after a successful API response).
ADD this line:
```javascript
sessionStorage.removeItem('sayiadLoginFails');
```

---

✅ **TEST:** Enter wrong password 5 times → Login button must become disabled and a countdown timer
must show (30 → 29 → … → 0) before re-enabling.

---

## TASK-H7 — `font-display: swap` for Google Fonts

**File:** `index.html`

Open `index.html`. Find the Google Fonts `<link>` tag with the long URL.
At the END of the URL string, before the closing quote `"`, ADD: `&display=swap`

Example — if current URL ends with `...&family=Inter:wght@400;500;600`,
change it to `...&family=Inter:wght@400;500;600&display=swap`

---

✅ **TEST:** DevTools → Network → Reload → Font requests must show in the waterfall.
No "invisible text" flash during font loading.

---

## TASK-H8 — Fix `viewport-fit=cover` + Apple Touch Icon

**⚠️ WAIT for [USER-A2] before adding the apple-touch-icon line.**

Open `index.html`. Find:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
Replace with:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

Then find:
```html
<link rel="icon" href="logo.png">
```
Replace with:
```html
<link rel="icon"             href="/logo.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

Also find ALL `src="logo.png"` occurrences (the `<img>` tags for the logo).
Replace each with `src="/logo.png"`.

---

✅ **TEST:** On iPhone Safari, open the site → Share → Add to Home Screen →
Sayiad logo must appear as the icon (not the globe/screenshot).

---

## TASK-H9 — Fix "Sell on Sayiad" Footer Link for Logged-In Sellers

**Files:** `index.html`, `js/app.js`

**Step 1 — Add ID to the footer link in `index.html`:**
Find the footer "Sell on Sayiad" link:
```html
<a href="#/register">Sell on Sayiad</a>
```
Replace with:
```html
<a href="#/register" id="footerSellLink">Sell on Sayiad</a>
```

**Step 2 — Update the link in `js/app.js` after auth state loads:**
Find the section that runs after the user's login state is determined.
ADD:
```javascript
const _sellLink = document.getElementById('footerSellLink');
if (_sellLink) {
  const _seller = getUser();
  if (_seller && ['Fisherman', 'BaitSeller'].includes(_seller.role)) {
    _sellLink.href = '#/dashboard';
    _sellLink.setAttribute('aria-label', 'Go to your seller dashboard');
  }
}
```

---

✅ **TEST:** Log in as Fisherman → Scroll to footer → Click "Sell on Sayiad" →
Must navigate to `#/dashboard`, NOT the register page.

---

### 🔖 GIT COMMIT — PHASE 2 COMPLETE
```
git add -A
git commit -m "fix(high): code splitting, SEO meta, social links, DOMPurify, SignalR reconnect, rate limiting, font swap, viewport"
git push
```

---

---

# PHASE 3 — MEDIUM PRIORITY FIXES

---

## TASK-M1 — PWA: Create `manifest.json` + Link It

**Files:** `manifest.json` (CREATE), `index.html` (MODIFY)

### Step 1 — CREATE `manifest.json` in repo root

```json
{
  "name": "Sayiad - Fishing Marketplace",
  "short_name": "Sayiad",
  "description": "Egypt's premier fishing marketplace and live auction platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b1120",
  "theme_color": "#0b1120",
  "orientation": "portrait-primary",
  "lang": "ar",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "categories": ["shopping", "food"],
  "shortcuts": [
    {
      "name": "Products",
      "url": "/#/products",
      "icons": [{ "src": "/logo.png", "sizes": "192x192" }]
    },
    {
      "name": "Auctions",
      "url": "/#/auctions",
      "icons": [{ "src": "/logo.png", "sizes": "192x192" }]
    }
  ]
}
```

### Step 2 — Link in `index.html`

Find `<link rel="icon" href="/logo.png">`. After it, ADD:
```html
<link rel="manifest" href="/manifest.json">
<meta name="mobile-web-app-capable"            content="yes">
<meta name="apple-mobile-web-app-capable"      content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title"        content="Sayiad">
```

---

✅ **TEST:** DevTools → Application → Manifest → Must show app name, icons, and no errors.

---

## TASK-M2 — Fix Cart + Notification Badges (Remove "0" Default)

**File:** `index.html`

Find:
```html
<span id="cartBadge" class="badge hidden">0</span>
```
Replace with:
```html
<span id="cartBadge" class="badge hidden" aria-label="Cart items count"></span>
```

Find:
```html
<span id="notifBadge" class="badge hidden">0</span>
```
Replace with:
```html
<span id="notifBadge" class="badge hidden" aria-label="Unread notifications count"></span>
```

---

✅ **TEST:** Open site → Neither the cart icon nor the bell icon must show any number badge until
JavaScript has loaded and fetched the actual counts.

---

## TASK-M3 — Add Empty States System

**Files:** `js/utils.js`, `css/style.css`, `pages/products.js`, `pages/auctions.js`, `pages/dashboard.js`

### Step 1 — Add `renderEmptyState()` to `js/utils.js`

```javascript
function renderEmptyState(container, opts) {
  const { icon='fa-inbox', title='Nothing here yet', desc='', ctaText='', ctaHref='' } = opts || {};
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state" role="status">
      <div class="empty-state__icon" aria-hidden="true"><i class="fas ${escapeHTML(icon)}"></i></div>
      <h3 class="empty-state__title">${escapeHTML(title)}</h3>
      ${desc     ? `<p class="empty-state__desc">${escapeHTML(desc)}</p>` : ''}
      ${ctaText && ctaHref
        ? `<a href="${escapeHTML(ctaHref)}" class="btn btn-primary empty-state__cta">${escapeHTML(ctaText)}</a>`
        : ''}
    </div>`;
}
```

### Step 2 — Add empty state CSS to `css/style.css`

```css
/* ===================== EMPTY STATES ===================== */
.empty-state { display:flex; flex-direction:column; align-items:center;
               text-align:center; padding:4rem 2rem; gap:.75rem; }
.empty-state__icon { width:72px; height:72px; border-radius:50%;
                     background:var(--card-bg,rgba(255,255,255,.05));
                     display:flex; align-items:center; justify-content:center; margin-bottom:.5rem; }
.empty-state__icon i  { font-size:1.75rem; opacity:.5; }
.empty-state__title   { font-size:1.125rem; font-weight:600; }
.empty-state__desc    { font-size:.875rem; opacity:.6; max-width:320px; line-height:1.6; }
.empty-state__cta     { margin-top:.5rem; }
```

### Step 3 — Use it in 3 pages

For each page below, find where it handles an empty API response (array length 0 / no data) and REPLACE the existing empty handling with the call below:

**`pages/products.js`** (empty products):
```javascript
renderEmptyState(productsContainer, {
  icon: 'fa-fish', title: 'No products yet',
  desc: 'Be the first to list fresh catch on Sayiad.',
  ctaText: 'Browse Auctions', ctaHref: '#/auctions'
});
```

**`pages/auctions.js`** (no auctions):
```javascript
renderEmptyState(auctionsContainer, {
  icon: 'fa-gavel', title: 'No live auctions right now',
  desc: 'New fish auctions are posted daily. Check back soon.',
  ctaText: 'Browse Products', ctaHref: '#/products'
});
```

**`pages/dashboard.js`** (no orders tab):
```javascript
renderEmptyState(ordersContainer, {
  icon: 'fa-box-open', title: 'No orders yet',
  desc: 'Your orders will appear here after your first purchase.',
  ctaText: 'Shop Now', ctaHref: '#/products'
});
```

---

✅ **TEST:** Log in with a fresh account that has no orders → Go to Dashboard → Orders tab →
Must show the box icon, "No orders yet", and "Shop Now" button — not a blank white area.

---

## TASK-M4 — Add Search Bar to Navigation

**Files:** `index.html`, `css/style.css`, `js/app.js`, `pages/products.js`

### Step 1 — Add HTML to `index.html`

Inside the `<nav>`, find the `<ul>` with Home/Products/Auctions links.
AFTER that closing `</ul>`, INSERT:
```html
<form class="nav-search" id="navSearchForm" role="search" aria-label="Search Sayiad">
  <input type="search" id="navSearchInput"
         class="nav-search__input"
         placeholder="Search fish, gear, auctions…"
         aria-label="Search fish, gear, auctions"
         autocomplete="off" maxlength="100" />
  <button type="submit" class="nav-search__btn" aria-label="Search">
    <i class="fas fa-search" aria-hidden="true"></i>
  </button>
</form>
```

### Step 2 — Add CSS to `css/style.css`

```css
/* ===================== NAV SEARCH ===================== */
.nav-search {
  display:flex; align-items:center; max-width:280px; width:100%;
  background:var(--input-bg,rgba(255,255,255,.07));
  border:1px solid var(--border-color,rgba(255,255,255,.1));
  border-radius:2rem; overflow:hidden; transition:border-color .2s;
}
.nav-search:focus-within { border-color:var(--primary-color,#3b82f6); }
.nav-search__input {
  background:transparent; border:none; outline:none; color:inherit;
  padding:.4rem .875rem; font-size:.875rem; width:100%; min-width:0;
}
.nav-search__input::placeholder { opacity:.5; }
.nav-search__btn {
  background:transparent; border:none; padding:.4rem .75rem;
  cursor:pointer; color:inherit; opacity:.6; flex-shrink:0;
  transition:opacity .15s;
}
.nav-search__btn:hover { opacity:1; }
@media (max-width:768px) { .nav-search { display:none; } }
```

### Step 3 — Handle submission in `js/app.js`

In the initialization block, ADD:
```javascript
const _nsf = document.getElementById('navSearchForm');
if (_nsf) {
  _nsf.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('navSearchInput').value.trim();
    if (q.length < 2) return;
    window.location.hash = '#/products?search=' + encodeURIComponent(q);
    document.getElementById('navSearchInput').value = '';
  });
}
```

### Step 4 — Read `?search=` in `pages/products.js`

Open `pages/products.js`. Find the API call that loads products.
BEFORE the API call, ADD:
```javascript
const _hash  = window.location.hash || '';
const _qs    = _hash.includes('?') ? _hash.split('?')[1] : '';
const _sp    = new URLSearchParams(_qs);
const _query = _sp.get('search') || '';
```

Then modify the API request URL. Change:
```javascript
'/api/products'
```
to:
```javascript
_query ? '/api/products?search=' + encodeURIComponent(_query) : '/api/products'
```

---

✅ **TEST:** Type "bass" in the nav search bar → Press Enter →
URL changes to `#/products?search=bass` → Products page shows filtered results.

---

## TASK-M5 — Password Strength Meter on Register

**Files:** `pages/register.js`, `css/style.css`

### Step 1 — Add HTML inside the register form template

In `pages/register.js`, find the HTML template string for the registration form.
Find the `<input>` for password. AFTER that input, INSERT:
```html
<div class="pw-strength" id="pwStrengthBar" aria-live="polite">
  <div class="pw-strength__track"><div class="pw-strength__fill" id="pwFill"></div></div>
  <span class="pw-strength__label" id="pwLabel"></span>
</div>
<ul class="pw-reqs" id="pwReqs" aria-label="Password requirements">
  <li id="req-len"    ><i class="fas fa-circle" aria-hidden="true"></i> 8+ characters</li>
  <li id="req-upper"  ><i class="fas fa-circle" aria-hidden="true"></i> Uppercase letter</li>
  <li id="req-lower"  ><i class="fas fa-circle" aria-hidden="true"></i> Lowercase letter</li>
  <li id="req-num"    ><i class="fas fa-circle" aria-hidden="true"></i> Number</li>
  <li id="req-special"><i class="fas fa-circle" aria-hidden="true"></i> Special character</li>
</ul>
```

### Step 2 — Add the live-update logic AFTER `innerHTML` is set

After the form is injected into the DOM, ADD:
```javascript
const _pwInput = document.getElementById('registerPassword'); // ← adjust ID if different
if (_pwInput) _pwInput.addEventListener('input', () => _checkPwStrength(_pwInput.value));

function _checkPwStrength(pw) {
  const checks = {
    len:     pw.length >= 8,
    upper:   /[A-Z]/.test(pw),
    lower:   /[a-z]/.test(pw),
    num:     /[0-9]/.test(pw),
    special: /[@$!%*?&#^()_+\-={}|;<>?]/.test(pw)
  };
  const score  = Object.values(checks).filter(Boolean).length;
  const colors = ['','#ef4444','#f97316','#eab308','#22c55e','#16a34a'];
  const labels = ['','Very Weak','Weak','Fair','Strong','Very Strong'];

  Object.entries(checks).forEach(([k,v]) => {
    const li = document.getElementById('req-' + k);
    if (!li) return;
    li.style.color = v ? '#22c55e' : '';
    li.querySelector('i').className = v ? 'fas fa-check-circle' : 'fas fa-circle';
  });

  const fill  = document.getElementById('pwFill');
  const label = document.getElementById('pwLabel');
  if (fill)  { fill.style.width = (score*20)+'%'; fill.style.background = colors[score]; }
  if (label) { label.textContent = labels[score]; label.style.color = colors[score]; }
}
```

### Step 3 — Add CSS to `css/style.css`

```css
/* ===================== PASSWORD STRENGTH ===================== */
.pw-strength { margin-top:8px; }
.pw-strength__track { height:4px; background:var(--border-color,#2a3a5a); border-radius:2px; overflow:hidden; }
.pw-strength__fill  { height:100%; width:0; border-radius:2px; transition:width .3s,background .3s; }
.pw-strength__label { font-size:.75rem; font-weight:500; margin-top:4px; display:block; }
.pw-reqs { list-style:none; margin-top:8px; padding:0;
           display:grid; grid-template-columns:1fr 1fr; gap:4px; }
.pw-reqs li { font-size:.75rem; display:flex; align-items:center; gap:6px; opacity:.7; transition:color .2s,opacity .2s; }
```

---

✅ **TEST:** Go to Register → Type in the password field →
The strength bar must grow and change colour. Each requirement must show a green checkmark when met.

---

## TASK-M6 — Dynamic Copyright Year

**Files:** `index.html`, `js/app.js`

Open `index.html`. Find:
```html
&copy; 2026 Sayiad
```
Replace with:
```html
&copy; <span id="copyrightYear">2026</span> Sayiad
```

Open `js/app.js`. In the initialization block, ADD:
```javascript
const _cy = document.getElementById('copyrightYear');
if (_cy) _cy.textContent = new Date().getFullYear();
```

---

## TASK-M7 — Create `robots.txt`

Create a new file at repo root named `robots.txt`:
```
User-agent: *
Allow: /

Disallow: /#/admin
Disallow: /#/dashboard
Disallow: /#/checkout
Disallow: /#/wallet
Disallow: /#/profile
Disallow: /#/shipping
Disallow: /#/order/

Sitemap: https://saiyad-eg.vercel.app/sitemap.xml
```

---

✅ **TEST:** Visit `https://saiyad-eg.vercel.app/robots.txt` in a browser → Must show the file contents.

---

## TASK-M8 — Dropdown Chevron Rotation Animation

Open `css/style.css`. END of file. ADD:
```css
/* ===================== CHEVRON ANIMATION ===================== */
.user-dropdown-toggle .fa-chevron-down,
.dropdown-toggle       .fa-chevron-down {
  transition: transform .2s ease;
  display: inline-block;
}
.user-dropdown.open .fa-chevron-down,
.dropdown.open       .fa-chevron-down {
  transform: rotate(180deg);
}
```

---

✅ **TEST:** Click the user dropdown → Chevron must smoothly rotate 180°. Click again → Rotates back.

---

## TASK-M9 — Back-to-Top Hidden by Default

Open `index.html`. Find the back-to-top button element:
```html
<button id="backToTop">
```
Change to:
```html
<button id="backToTop" class="hidden" aria-label="Scroll back to top">
```

---

### 🔖 GIT COMMIT — PHASE 3 COMPLETE
```
git add -A
git commit -m "fix(medium): PWA manifest, empty states, nav search, password strength, robots.txt, chevron, copyright"
git push
```

---

---

# PHASE 4 — LOW PRIORITY FIXES

---

## TASK-L1 — WhatsApp Support Link

**⚠️ WAIT for [USER-A1] WhatsApp number before starting.**

Open `index.html`. Find the WhatsApp `<a>` tag in the footer.
Replace `href="#"` with:
```html
href="https://wa.me/[NUMBER]" target="_blank" rel="noopener noreferrer" aria-label="Contact Sayiad on WhatsApp"
```

---

## TASK-L2 — Add `hreflang` Tags

Open `index.html`. Find `<link rel="canonical" ...>`. After it, ADD:
```html
<link rel="alternate" hreflang="ar"       href="https://saiyad-eg.vercel.app">
<link rel="alternate" hreflang="en"       href="https://saiyad-eg.vercel.app">
<link rel="alternate" hreflang="x-default" href="https://saiyad-eg.vercel.app">
```

---

## TASK-L3 — Accessible Skip Link CSS

Open `css/style.css`. Search for `.skip-link`. If styles exist, skip this task.
If NOT found, ADD at END:
```css
/* ===================== SKIP LINK ===================== */
.skip-link {
  position:absolute; top:-100px; left:1rem;
  background:var(--primary-color,#3b82f6); color:#fff;
  padding:.5rem 1rem; border-radius:0 0 6px 6px;
  font-weight:600; z-index:10000;
  text-decoration:none; transition:top .2s;
}
.skip-link:focus { top:0; outline:2px solid #fff; }
```

---

## TASK-L4 — Unique `<title>` Per Page

Open `js/utils.js`. The `setPageMeta()` function was added in TASK-H2.
Now add a call to it in every page that doesn't have one yet.

For each file below, open it, find the init function, add at the top:

| File | setPageMeta call |
|------|-----------------|
| `pages/login.js`       | `setPageMeta('Login', 'Sign in to your Sayiad account.');` |
| `pages/register.js`    | `setPageMeta('Register', 'Create a Sayiad account to buy, sell, and bid.');` |
| `pages/cart.js`        | `setPageMeta('My Cart');` |
| `pages/checkout.js`    | `setPageMeta('Checkout');` |
| `pages/dashboard.js`   | `setPageMeta('Dashboard');` |
| `pages/profile.js`     | `setPageMeta('My Profile');` |
| `pages/wallet.js`      | Already added in TASK-C1. Skip. |
| `pages/admin.js`       | `setPageMeta('Admin Panel');` |
| `pages/terms.js`       | `setPageMeta('Terms of Service');` |
| `pages/privacy.js`     | `setPageMeta('Privacy Policy');` |

---

## TASK-L5 — Keyboard Focus Styles

Open `css/style.css`. Search for `:focus-visible`. If NOT found, ADD at END:
```css
/* ===================== FOCUS STYLES (ACCESSIBILITY) ===================== */
:focus-visible {
  outline: 2px solid var(--primary-color, #3b82f6);
  outline-offset: 3px;
  border-radius: 4px;
}
:focus:not(:focus-visible) { outline: none; }
```

---

✅ **TEST:** Tab through the home page with keyboard only → Every link and button must show a visible
blue outline ring when focused. Nothing should be invisible when navigated via keyboard.

---

### 🔖 GIT COMMIT — PHASE 4 COMPLETE
```
git add -A
git commit -m "fix(low): WhatsApp link, hreflang, skip link, page titles, focus styles"
git push
```

---

---

# PHASE 5 — BACKEND FIXES (ASP.NET Core — Saiyad Repo)

---

## TASK-B1 — Enforce Role Authorization on All Controllers

**File:** Every controller in the Saiyad backend

Open each controller file. For EVERY action method that is role-sensitive,
ADD the `[Authorize(Roles = "...")]` attribute on the line immediately above it.

**Use this role matrix:**

| Controller | Action | Required Roles |
|------------|--------|----------------|
| AdminController | ALL actions | `"Admin"` |
| ProductsController | GET (list, detail) | *(no auth)* |
| ProductsController | POST create | `"Fisherman,BaitSeller"` |
| ProductsController | PUT update | `"Fisherman,BaitSeller"` |
| ProductsController | DELETE | `"Fisherman,BaitSeller,Admin"` |
| AuctionsController | GET | *(no auth)* |
| AuctionsController | POST create | `"Auctioneer"` |
| AuctionsController | PUT/DELETE | `"Auctioneer,Admin"` |
| BidsController | POST bid | `"Customer,Fisherman,BaitSeller"` |
| OrdersController | GET (own) | `[Authorize]` *(any logged-in user)* |
| OrdersController | GET (all) | `"Admin"` |
| WalletController | ALL | `[Authorize]` *(any logged-in user)* |

**Pattern for every method:**
```csharp
[HttpPost]
[Authorize(Roles = "Fisherman,BaitSeller")]   // ← ADD THIS
public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
{
    // DO NOT change existing code
}
```

**Verify `Program.cs` has both in the pipeline:**
```csharp
app.UseAuthentication();
app.UseAuthorization();  // ← must come AFTER UseAuthentication
```

---

✅ **TEST:** Use Postman. Log in as Customer → Copy the JWT token.
Send `POST /api/products` with that Customer JWT in `Authorization: Bearer [token]`.
Response must be `403 Forbidden`.

---

## TASK-B2 — Add Rate Limiting to Login and Register

**Files:** terminal (install), `Program.cs`, `appsettings.json`

### Step 1 — Install package

In the terminal, inside the Saiyad backend folder, run:
```
dotnet add package AspNetCoreRateLimit
```

### Step 2 — `Program.cs` — ADD to services section

```csharp
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(
    builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddSingleton<IIpPolicyStore,           MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore,   MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration,  RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy,      AsyncKeyLockProcessingStrategy>();
builder.Services.AddInMemoryRateLimiting();
```

ADD to pipeline (BEFORE `app.UseRouting()`):
```csharp
app.UseIpRateLimiting();
```

### Step 3 — `appsettings.json` — ADD this section

```json
"IpRateLimiting": {
  "EnableEndpointRateLimiting": true,
  "StackBlockedRequests": false,
  "HttpStatusCode": 429,
  "RealIpHeader": "X-Real-IP",
  "ClientIdHeader": "X-ClientId",
  "GeneralRules": [
    { "Endpoint": "POST:/api/auth/login",    "Period": "15m", "Limit": 10 },
    { "Endpoint": "POST:/api/auth/register", "Period": "1h",  "Limit":  5 }
  ]
}
```

---

✅ **TEST:** Send 11 POST requests to `/api/auth/login` within 15 minutes →
The 11th must return `429 Too Many Requests`.

---

## TASK-B3 — Lock Down CORS to Known Origins

**File:** `Program.cs`

Find `builder.Services.AddCors(...)`. Replace or update it:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
          .WithOrigins(
              "https://saiyad-eg.vercel.app",
              "http://localhost:3000",
              "http://localhost:5173"
          )
          .AllowAnyMethod()
          .AllowAnyHeader()
          .AllowCredentials();
    });
});
```

In the pipeline, ensure:
```csharp
app.UseCors("AllowFrontend");   // ← BEFORE UseAuthentication
app.UseAuthentication();
app.UseAuthorization();
```

---

✅ **TEST:** From your browser console on a completely different site (e.g. google.com),
type: `fetch('https://sayiad.runasp.net/api/products').then(r => console.log(r.status))`
This must fail with a CORS error in the console.

---

## TASK-B4 — Implement Wallet Service + Controller

**⚠️ Only needed if the wallet endpoints from [USER-A3] do NOT already exist.**

### Step 1 — CREATE `Models/WalletTransaction.cs`

```csharp
namespace Saiyad.Models;

public class WalletTransaction
{
    public int     Id          { get; set; }
    public string  UserId      { get; set; } = string.Empty;
    public decimal Amount      { get; set; }
    public string  Type        { get; set; } = string.Empty; // "Deposit", "Withdrawal", "Bid", "Refund"
    public string  Description { get; set; } = string.Empty;
    public string  Status      { get; set; } = "Completed";
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
}
```

### Step 2 — CREATE `Services/IWalletService.cs`

```csharp
namespace Saiyad.Services;

public interface IWalletService
{
    Task<decimal>                    GetBalanceAsync(string userId);
    Task<IEnumerable<WalletTransaction>> GetTransactionsAsync(string userId, int page, int pageSize);
    Task<WalletTransaction>          DepositAsync(string userId, decimal amount);
}
```

### Step 3 — CREATE `Controllers/WalletController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Saiyad.Controllers;

[ApiController]
[Route("api/wallet")]
[Authorize]
public class WalletController : ControllerBase
{
    private readonly IWalletService _wallet;
    public WalletController(IWalletService wallet) => _wallet = wallet;

    private string? UserId =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst("sub")?.Value;

    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance()
    {
        if (UserId is null) return Unauthorized();
        var bal = await _wallet.GetBalanceAsync(UserId);
        return Ok(new { balance = bal });
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (UserId is null) return Unauthorized();
        var txs = await _wallet.GetTransactionsAsync(UserId, page, pageSize);
        return Ok(txs);
    }

    [HttpPost("deposit")]
    public async Task<IActionResult> Deposit([FromBody] DepositRequest req)
    {
        if (req.Amount < 10 || req.Amount > 50_000)
            return BadRequest(new { message = "Amount must be between EGP 10 and 50,000." });
        if (UserId is null) return Unauthorized();
        var result = await _wallet.DepositAsync(UserId, req.Amount);
        return Ok(result);
    }
}

public record DepositRequest(decimal Amount);
```

### Step 4 — Register service in `Program.cs`

```csharp
builder.Services.AddScoped<IWalletService, WalletService>(); // implement WalletService class
```

---

✅ **TEST:**
- `GET /api/wallet/balance` with a valid JWT → `{ "balance": 0.00 }`
- `POST /api/wallet/deposit` with `{"amount": 100}` → Success object
- `GET /api/wallet/transactions` → `[]`
- `POST /api/wallet/deposit` without a JWT → `401 Unauthorized`

---

### 🔖 GIT COMMIT — PHASE 5 COMPLETE
```
git add -A
git commit -m "fix(backend): role authorization, rate limiting, CORS, wallet controller"
git push
```

---

---

# MASTER TASK CHECKLIST

Copy this list and check off each item as it passes its TEST step.

```
PHASE 1 — CRITICAL
[ ] TASK-C1  Wallet page created + registered in index.html
[ ] TASK-C2  dir + lang attributes update on language switch + on page load
[ ] TASK-C3  Security headers added to vercel.json (CSP, X-Frame, HSTS, etc.)
[ ] TASK-C4  Loading skeleton + global error state in index.html + router.js
[ ] TASK-C5  Role guards in admin.js, auction-requests.js, auction-requests-review.js, auctioneer-analytics.js

PHASE 2 — HIGH PRIORITY
[ ] TASK-H1  All 24 page scripts removed from index.html, dynamic imports in router.js
[ ] TASK-H2  SEO meta tags in index.html, setPageMeta() helper, called in home/products/auctions
[ ] TASK-H3  Social footer links fixed (Facebook, Instagram, WhatsApp)
[ ] TASK-H4  DOMPurify loaded, safeSetHTML() added, used in product-detail.js + auction-detail.js
[ ] TASK-H5  SignalR withAutomaticReconnect + reconnecting banner
[ ] TASK-H6  Login rate limiting (5 attempts → 30s lockdown)
[ ] TASK-H7  Google Fonts &display=swap added
[ ] TASK-H8  viewport-fit=cover, apple-touch-icon
[ ] TASK-H9  "Sell on Sayiad" routes sellers to dashboard

PHASE 3 — MEDIUM PRIORITY
[ ] TASK-M1  manifest.json created and linked
[ ] TASK-M2  Cart + notification badges emptied (no "0" default)
[ ] TASK-M3  renderEmptyState() helper + used in products / auctions / dashboard
[ ] TASK-M4  Nav search bar added + products page reads ?search=
[ ] TASK-M5  Password strength meter + requirements list on register page
[ ] TASK-M6  Copyright year is dynamic
[ ] TASK-M7  robots.txt created
[ ] TASK-M8  Chevron rotation CSS
[ ] TASK-M9  Back-to-top hidden by default

PHASE 4 — LOW PRIORITY
[ ] TASK-L1  WhatsApp footer link
[ ] TASK-L2  hreflang tags
[ ] TASK-L3  Skip link CSS
[ ] TASK-L4  Unique page titles for all pages
[ ] TASK-L5  :focus-visible CSS

PHASE 5 — BACKEND
[ ] TASK-B1  [Authorize(Roles=...)] on all role-sensitive endpoints
[ ] TASK-B2  Rate limiting on login + register endpoints
[ ] TASK-B3  CORS restricted to known origins only
[ ] TASK-B4  Wallet controller + service (if not already built)
```

---

*Plan prepared by: Claude Audit System*
*Source: Deep analysis of index.html, GitHub repo structure, and Sayiad API architecture*
*Total tasks: 33 (24 frontend + 5 backend + 4 infrastructure)*
