## 📌 QUICK LINKS

| Resource                 | URL                                          |
| ------------------------ | -------------------------------------------- |
| **Live Site**            | https://saiyad-eg.vercel.app                 |
| **API Base**             | https://sayiad.runasp.net/api                |
| **Swagger**              | https://sayiad.runasp.net/swagger/index.html |
| **SignalR Hub**          | https://sayiad.runasp.net/hubs/auction       |
| **Vercel Dashboard**     | https://vercel.com/saiyad-eg/                |
| **Git Repo**             | (main branch)                                |
| **GitHub Repo Frontend** | https://github.com/AhmedSaad-EGY/Saiyad_UI   |
| **GitHub Repo Backend**  | https://github.com/AhmedSaad-EGY/Saiyad      |

---

## 🔑 TEST ACCOUNTS (All 5 Roles)

| Role           | Email                         | Password     |
| -------------- | ----------------------------- | ------------ |
| **Admin**      | `sayiadapp@gmail.com`         | `Sayiad@123` |
| **Customer**   | `ahmedsaad20169711@gmail.com` | `Ahmed@123`  |
| **Fisherman**  | `ahmedback.net@gmail.com`     | `Ahmed@123`  |
| **BaitSeller** | `ahmedsaad20169755@gmail.com` | `Ahmed@123`  |
| **Auctioneer** | `ahmedsaad20169799@gmail.com` | `Ahmed@123`  |

---

## ⚠️ RULES — READ BEFORE TOUCHING ANY FILE

```
RULE 1  One task at a time. Complete it fully. Run the TEST. Then move on.
RULE 2  Only modify what the task explicitly says. Nothing else.
RULE 3  Use Ctrl+F to find text. Do not guess line numbers.
RULE 4  FIND text not found → STOP and report the task ID. Do not guess.
RULE 5  Save every file after editing. Commit after each phase.
RULE 6  Never delete existing code unless the task says DELETE.
RULE 7  Alpine.js expressions use x-bind, x-on, x-model — do not convert them to vanilla JS.
RULE 8  Backend changes require `dotnet build` to pass before committing.
```

---

## PHASE 1 — CRITICAL (bugs that break functionality right now)

---

### TASK-C1 — Fix `validateForm` Signature Mismatch in Register Page

**File:** `src/core/utils/validation.js`
**Problem:** `register.js` calls `validateForm(HTMLElement, Array)` but `validation.js` expects
`validateForm(stringId, Object)`. Because `document.getElementById(htmlElement)` returns null,
the function immediately returns `true` — skipping ALL field validation. Users can register with
empty names, invalid emails, and short passwords.

**Action: MODIFY `src/core/utils/validation.js`**

Find this EXACT text:

```javascript
export function validateForm(formId, rules) {
  const form = document.getElementById(formId);
  if (!form) return true;
```

Replace with:

```javascript
export function validateForm(formIdOrEl, rules) {
  // Accept either a string ID or a DOM element
  const form = (typeof formIdOrEl === 'string')
    ? document.getElementById(formIdOrEl)
    : formIdOrEl;
  if (!form) return true;
```

Then find this EXACT text (still in the same function):

```javascript
for (const [fieldId, checks] of Object.entries(rules)) {
  const field = document.getElementById(fieldId);
  if (!field) continue;
  const value = (field.value || "").trim();
  for (const check of checks) {
    if (check.required && !value) {
      showFieldError(field, check.message || t("validation.required"));
      valid = false;
      break;
    }
    if (check.minLength != null && value.length < check.minLength) {
      showFieldError(field, check.message || t("validation.minLength"));
      valid = false;
      break;
    }
    if (check.pattern && !check.pattern.test(value)) {
      showFieldError(field, check.message || t("validation.invalid"));
      valid = false;
      break;
    }
    if (check.custom && !check.custom(value, form)) {
      showFieldError(field, check.message || t("validation.invalid"));
      valid = false;
      break;
    }
  }
}
```

Replace ONLY the first line of that block (the `for...of Object.entries(rules)` line) with:

```javascript
// Support both formats:
// Format A (object): { fieldId: [checks] }    ← used by standalone calls
// Format B (array):  [{ element, required, messages }]  ← used by register.js
const ruleEntries = Array.isArray(rules)
  ? rules.map((r) => [r.element?.id || "", [r]])
  : Object.entries(rules);

for (const [fieldId, checks] of ruleEntries) {
  const field =
    typeof fieldId === "string" && fieldId
      ? form.querySelector(`#${fieldId}`) || document.getElementById(fieldId)
      : null;
  // For array format, the element is already in the check object
  const resolvedField =
    field || (Array.isArray(rules) ? checks[0]?.element : null);
  if (!resolvedField) continue;
  const value = (resolvedField.value || "").trim();
  for (const check of checks) {
    if (check.required && !value) {
      const msg =
        check.message || check.messages?.required || t("validation.required");
      showFieldError(resolvedField, msg);
      valid = false;
      break;
    }
    if (check.minLength != null && value.length < check.minLength) {
      const msg =
        check.message || check.messages?.minLength || t("validation.minLength");
      showFieldError(resolvedField, msg);
      valid = false;
      break;
    }
    if (check.pattern && !check.pattern.test(value)) {
      const msg =
        check.message || check.messages?.pattern || t("validation.invalid");
      showFieldError(resolvedField, msg);
      valid = false;
      break;
    }
    if (check.matches && check.matches.element) {
      const matchVal = (check.matches.element.value || "").trim();
      if (value !== matchVal) {
        const msg = check.messages?.matches || t("validation.invalid");
        showFieldError(resolvedField, msg);
        valid = false;
        break;
      }
    }
    if (check.minAge != null) {
      const age = calculateAge(value);
      if (isNaN(age) || age < check.minAge) {
        const msg =
          check.messages?.minAge ||
          `Must be at least ${check.minAge} years old`;
        showFieldError(resolvedField, msg);
        valid = false;
        break;
      }
    }
    if (check.phone && value && !/^[\+\d][\d\s\-\(\)]{6,}$/.test(value)) {
      const msg = check.messages?.phone || t("validation.invalid");
      showFieldError(resolvedField, msg);
      valid = false;
      break;
    }
    if (check.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      const msg = check.messages?.email || t("auth.invalidEmail");
      showFieldError(resolvedField, msg);
      valid = false;
      break;
    }
    if (check.custom && !check.custom(value, form)) {
      const msg =
        check.message || check.messages?.custom || t("validation.invalid");
      showFieldError(resolvedField, msg);
      valid = false;
      break;
    }
  }
}
```

✅ **TEST:**

1. Go to Register page.
2. Click Submit without filling anything.
3. Red error messages must appear under each empty field.
4. Fix: Fill all fields correctly → Submit → Registration proceeds normally.

---

### TASK-C2 — Add Bid Confirmation Before Placing a Bid

**File:** `src/pages/auction-detail.js`
**Problem:** `placeBid()` fires immediately on button tap. On mobile, an accidental tap places an
irreversible bid. There is no confirmation step.

**Action: MODIFY `src/pages/auction-detail.js`**

Find this EXACT text at the top of `placeBid()`:

```javascript
  async placeBid() {
    if (!await requireAuth()) return;
    const amount = parseFloat(this.bidAmount);
    if (!amount || amount <= 0) {
      this.bidAlert = t('auction.invalidBid');
      this.bidAlertType = 'error';
      return;
    }

    this.placingBid = true;
```

Replace it with:

```javascript
  async placeBid() {
    if (!await requireAuth()) return;
    const amount = parseFloat(this.bidAmount);
    if (!amount || amount <= 0) {
      this.bidAlert = t('auction.invalidBid');
      this.bidAlertType = 'error';
      return;
    }

    // Confirm before placing irreversible bid
    const confirmed = await showConfirm(
      t('auction.confirmBidTitle') || 'Confirm Your Bid',
      `${t('auction.confirmBidMsg') || 'Place a bid of'} ${formatPrice(amount)}? ${t('auction.bidIrreversible') || 'This cannot be undone.'}`,
      { type: 'warning', confirmText: t('auction.placeBid') || 'Place Bid' }
    );
    if (!confirmed) return;

    this.placingBid = true;
```

Now find the imports at the very top of `auction-detail.js` and verify `showConfirm` is imported.
Search for: `import { showConfirm` or `showConfirm` in the import lines.

If `showConfirm` is NOT already imported, find the existing import from `../core/utils/ui.js`
(it will look like `import { showToast ... } from '../core/utils/ui.js'`) and ADD `showConfirm` to it.

Also verify `formatPrice` is imported. It should be. If not, add it from `'../core/utils/format.js'`.

✅ **TEST:**

1. Log in as Customer.
2. Open an active auction.
3. Enter a bid amount.
4. Click "Place Bid".
5. A confirmation dialog must appear showing the bid amount.
6. Click Cancel → Bid is NOT placed.
7. Click Confirm → Bid is placed normally.

---

### TASK-C3 — Remove Source Maps from Production Build

**File:** `vite.config.js`
**Problem:** `sourcemap: true` makes your full un-minified source code accessible to anyone via
browser DevTools → Sources tab. For a production platform handling financial data, this exposes
your business logic, API patterns, and data models.

**Action: MODIFY `vite.config.js`**

Find this EXACT text:

```javascript
    sourcemap: true,
```

Replace with:

```javascript
    sourcemap: false,
```

✅ **TEST:**

1. Run `npm run build`.
2. Open `dist/assets/` directory.
3. There must be NO `.map` files.
4. Open the deployed site in DevTools → Sources tab → the code should be minified, not readable.

---

### TASK-C4 — Add `loading="lazy"` and Dimensions to Product Detail Main Image

**File:** `src/pages/product-detail.js`
**Problem:** The main product image on the detail page loads eagerly at full resolution with no
`loading` attribute, no explicit dimensions, and no `decoding="async"`. This blocks rendering
and causes layout shift.

**Action: MODIFY `src/pages/product-detail.js`**

Find this EXACT text (it's in the template literal inside the `container.innerHTML` assignment):

```javascript
${p.primaryImageUrl ? `<img src="${escapeHtml(p.primaryImageUrl)}" id="mainImg" alt="${escapeHtml(p.title)}" style="width:100%;height:100%;object-fit:cover"><div class="magnifier-lens" id="magLens"></div>` : '<i class="fas fa-image"></i>'}
```

Replace with:

```javascript
${p.primaryImageUrl ? `<img src="${escapeHtml(p.primaryImageUrl)}" id="mainImg" alt="${escapeHtml(p.title)}" style="width:100%;height:100%;object-fit:cover" loading="lazy" decoding="async" fetchpriority="high"><div class="magnifier-lens" id="magLens"></div>` : '<i class="fas fa-image"></i>'}
```

✅ **TEST:**

1. Open a product detail page.
2. DevTools → Network → Images.
3. The main product image must show `loading: lazy` in its request headers.
4. No layout shift should occur while the image loads.

---

**🔖 COMMIT — PHASE 1:**
✅ **Done** — commit `27380f3`

```
git add -A
git commit -m "fix(critical): validateForm signature, bid confirmation, no sourcemaps, product img lazy"
git push
```

---

## PHASE 2 — HIGH PRIORITY (production-quality gaps)

---

### TASK-H1 — Add `hreflang` Tags for AR/EN

**File:** `src/index.html`
**Problem:** The app serves Arabic and English but has no `hreflang` metadata. Search engines
don't know both language versions exist at the same URL.

**Action: MODIFY `src/index.html`**

Find this EXACT text:

```html
<link rel="canonical" href="https://saiyad-eg.vercel.app" />
```

After that line, ADD:

```html
<link rel="alternate" hreflang="ar" href="https://saiyad-eg.vercel.app" />
<link rel="alternate" hreflang="en" href="https://saiyad-eg.vercel.app" />
<link
  rel="alternate"
  hreflang="x-default"
  href="https://saiyad-eg.vercel.app"
/>
```

✅ **TEST:** View page source → should contain all 3 `hreflang` link tags.

---

### TASK-H2 — Add `noindex` Meta to Private Pages

**File:** `src/core/utils/seo.js`
**Problem:** Cart, Checkout, Dashboard, Wallet, Profile, and Admin pages should not be indexed
by search engines. Currently `setPageMeta` has no way to mark pages as private.

**Action: MODIFY `src/core/utils/seo.js`**

Find this EXACT text:

```javascript
function setPageMeta(title, description) {
```

Replace the ENTIRE `setPageMeta` function with:

```javascript
/**
 * @param {string} title
 * @param {string} [description]
 * @param {boolean} [noIndex=false] - Set true for auth-required / private pages
 */
function setPageMeta(title, description, noIndex = false) {
  document.title = title
    ? title + " — Sayiad"
    : "Sayiad - Fishing Marketplace & Auctions";

  const desc = description || "Egypt's premier fishing marketplace.";
  const set = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };
  set('meta[name="description"]', "content", desc);
  set('meta[property="og:title"]', "content", document.title);
  set('meta[property="og:description"]', "content", desc);
  set('link[rel="canonical"]', "href", window.location.href.split("#")[0]);

  // noindex for private/auth-required pages
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement("meta");
    robotsMeta.name = "robots";
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.content = noIndex ? "noindex,nofollow" : "index,follow";
}
```

Then update the call in each private page to pass `true` as the third argument:

**`src/pages/cart.js`** — find `setPageMeta(` call, change to:

```javascript
setPageMeta("My Cart", undefined, true);
```

**`src/pages/checkout.js`** — find `setPageMeta(` call, change to:

```javascript
setPageMeta("Checkout", undefined, true);
```

**`src/pages/dashboard.js`** — find `setPageMeta(` call, change to:

```javascript
setPageMeta("Dashboard", undefined, true);
```

**`src/pages/profile.js`** — find `setPageMeta(` call, change to:

```javascript
setPageMeta("My Profile", undefined, true);
```

**`src/pages/wallet.js`** — find the existing call and change to:

```javascript
setPageMeta(
  "My Wallet",
  "Manage your Sayiad wallet balance and transactions.",
  true,
);
```

**`src/pages/admin.js`** — find `setPageMeta(` call, change to:

```javascript
setPageMeta("Admin Panel", undefined, true);
```

**`src/pages/shipping.js`** — find `setPageMeta(` call, change to:

```javascript
setPageMeta("My Addresses", undefined, true);
```

**`src/pages/order-detail.js`** — find `setPageMeta(` call, change to:

```javascript
setPageMeta("Order Details", undefined, true);
```

✅ **TEST:**

1. Open the Cart page (`#/cart`).
2. View Page Source or DevTools → Elements → `<meta name="robots">`.
3. Must show `content="noindex,nofollow"`.
4. Open the Products page (`#/products`).
5. Must show `content="index,follow"`.

---

### TASK-H3 — Style the Service Worker Offline Page

**File:** `src/public/sw.js`
**Problem:** When offline, the service worker returns a raw unstyled HTML string —
`<h1 style='font-family:sans-serif;text-align:center;padding:40px'>You are offline</h1>`.
This looks broken and unprofessional.

**Action: MODIFY `src/public/sw.js`**

Find this EXACT text:

```javascript
              cached ||\r\n              new Response(\r\n                "<h1 style='font-family:sans-serif;text-align:center;padding:40px'>You are offline</h1>",\r\n                { headers: { "Content-Type": "text/html" }, status: 503 }\r\n              )
```

If the file uses CRLF line endings and this looks different in your editor, find the string:

```javascript
"<h1 style='font-family:sans-serif;text-align:center;padding:40px'>You are offline</h1>";
```

Replace ONLY that string (keep the surrounding `new Response(...)` code) with:

```javascript
`<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Sayiad — Offline</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
         background:#0b1120;color:#e2e8f0;display:flex;align-items:center;
         justify-content:center;min-height:100vh;text-align:center;padding:1.5rem}
    .card{background:#1a2744;border-radius:1.25rem;padding:2.5rem 2rem;max-width:400px;width:100%}
    .icon{font-size:3.5rem;margin-bottom:1rem;opacity:.6}
    h1{font-size:1.5rem;font-weight:700;margin-bottom:.75rem}
    p{font-size:.9rem;opacity:.65;line-height:1.6;margin-bottom:1.5rem}
    a{display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;
      padding:.625rem 1.5rem;border-radius:.75rem;font-weight:600;font-size:.875rem}
    a:hover{background:#0284c7}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎣</div>
    <h1>You are offline</h1>
    <p>No internet connection. Check your network and try again.</p>
    <a href="/" onclick="location.reload();return false;">Retry</a>
  </div>
</body>
</html>`;
```

✅ **TEST:**

1. Open the site normally.
2. DevTools → Network → check "Offline" checkbox.
3. Navigate to any new page or refresh.
4. You should see the styled offline page, not a raw `<h1>` tag.

---

### TASK-H4 — Disable Hero 3D Tilt on Touch/Mobile Devices

**File:** `src/pages/home.js`
**Problem:** The hero section uses `@mousemove` to apply 3D CSS transforms. On touch devices
there is no `mousemove` event, so the feature is silently inactive. However, `@mouseleave` also
never fires, which means the hero can get stuck in a transformed state if a user quickly scrolls
past it. Additionally, the 3D perspective effect should be explicitly prevented on touch devices
to avoid wasted CPU cycles.

**Action: MODIFY `src/pages/home.js`**

Find this EXACT text:

```javascript
  handleHeroMouseMove(e) {
    const hero = e.currentTarget;
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Smooth 3D tilt calculation (max 8 degrees)
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;

    // Smooth parallax shifting
    const transX = ((x - centerX) / centerX) * 12;
    const transY = ((y - centerY) / centerY) * 12;

    this.heroContentStyle = `transform: perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${transX}px, ${transY}px, 15px); transition: transform 0.05s ease-out;`;
  },
```

Replace with:

```javascript
  handleHeroMouseMove(e) {
    // Skip on touch devices or reduced-motion preference
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const hero = e.currentTarget;
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;
    const transX = ((x - centerX) / centerX) * 12;
    const transY = ((y - centerY) / centerY) * 12;
    this.heroContentStyle = `transform: perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${transX}px, ${transY}px, 15px); transition: transform 0.05s ease-out;`;
  },
```

Also find this text:

```javascript
  handleHeroMouseLeave() {
    this.heroContentStyle = 'transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);';
  },
```

Replace with:

```javascript
  handleHeroMouseLeave() {
    this.heroContentStyle = 'transform: none; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);';
  },
```

✅ **TEST:**

1. On desktop: hover over the hero → 3D tilt works.
2. Simulate mobile in DevTools (toggle device toolbar) → no tilt effect, no jank.
3. On a real phone → hero loads normally with no transform states.

---

### TASK-H5 — Fix Product Grid on 320px Screens (1 column)

**File:** `src/pages/products.js`
**Problem:** Products use Bootstrap's `row-cols-2` which forces 2 columns at ALL small screen
sizes including 320px. At 320px, each product card is only ~140px wide — too narrow for
images, titles, prices, and buttons to be readable.

**Action: MODIFY `src/pages/products.js`**

Search for the Skeleton loading section AND the actual product grid.
They will both use `row-cols-2`. Find these two occurrences:

**Occurrence 1 (skeleton):**

```javascript
      <div x-show="loading" class="row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 skeleton-shimmer">
```

Replace with:

```javascript
      <div x-show="loading" class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 skeleton-shimmer">
```

**Occurrence 2 (actual product grid)** — find the non-skeleton product grid with similar Bootstrap
row-cols classes. It will look like:

```javascript
row-cols-2 row-cols-md-
```

Replace any `row-cols-2` (without an explicit breakpoint prefix like `row-cols-sm-2`) with
`row-cols-1 row-cols-sm-2`.

✅ **TEST:**

1. DevTools → set viewport to 320px width.
2. Open the Products page.
3. Products must show in a single column — one product per row, full width.
4. At 576px+, 2 columns appear. At 992px+, 3 columns. At 1280px+, 4 columns.

---

### TASK-H6 — Add Bottom Mobile Navigation Bar

**Files:** `src/index.html`, `src/css/style.css`
**Problem:** On mobile, all navigation requires opening the hamburger drawer. This is a major
UX regression vs industry standard (Careem, Noon, Jumia all use bottom nav). Users cannot
quickly jump between Home, Products, Auctions, and Cart with one thumb tap.

**Action: MODIFY `src/index.html`**

Find this EXACT text:

```html
<button
  id="backToTop"
  class="btn btn-primary back-to-top hidden"
  aria-label="Back to top"
>
  <i class="fas fa-arrow-up"></i>
</button>
```

After that line (on the next line), ADD:

```html
<!-- Mobile Bottom Navigation Bar — hidden on tablet/desktop via CSS -->
<nav class="bottom-nav" id="bottomNav" aria-label="Mobile navigation">
  <a href="#/" class="bottom-nav-item" id="bnHome">
    <i class="fas fa-home" aria-hidden="true"></i>
    <span data-i18n="nav.home">Home</span>
  </a>
  <a href="#/products" class="bottom-nav-item" id="bnProducts">
    <i class="fas fa-store" aria-hidden="true"></i>
    <span data-i18n="nav.products">Products</span>
  </a>
  <a href="#/auctions" class="bottom-nav-item" id="bnAuctions">
    <i class="fas fa-gavel" aria-hidden="true"></i>
    <span data-i18n="nav.auctions">Auctions</span>
  </a>
  <a href="#/cart" class="bottom-nav-item" id="bnCart">
    <i class="fas fa-shopping-cart" aria-hidden="true"></i>
    <span data-i18n="nav.cart">Cart</span>
    <span class="bottom-nav-badge d-none" id="bnCartBadge"></span>
  </a>
  <a
    href="#/dashboard"
    class="bottom-nav-item bottom-nav-account d-none"
    id="bnAccount"
  >
    <i class="fas fa-user" aria-hidden="true"></i>
    <span data-i18n="nav.dashboard">Account</span>
  </a>
  <a href="#/login" class="bottom-nav-item" id="bnLogin">
    <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
    <span data-i18n="nav.login">Login</span>
  </a>
</nav>
```

**Action: ADD to END of `src/css/style.css`:**

```css
/* ===================== BOTTOM MOBILE NAV ===================== */
.bottom-nav {
  display: none; /* hidden on desktop */
}
@media (max-width: 991px) {
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(56px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--nav-bg, rgba(255, 255, 255, 0.95));
    border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
    z-index: 1000;
    backdrop-filter: saturate(180%) blur(12px);
    -webkit-backdrop-filter: saturate(180%) blur(12px);
    box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.08);
  }
  [data-theme="dark"] .bottom-nav {
    background: rgba(11, 17, 32, 0.95);
    border-top-color: rgba(255, 255, 255, 0.08);
  }
  .bottom-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    text-decoration: none;
    color: var(--text-muted, #6b7280);
    font-size: 10px;
    font-weight: 500;
    padding: 6px 4px 0;
    position: relative;
    transition: color 0.15s;
    min-height: 44px;
    min-width: 44px;
  }
  .bottom-nav-item i {
    font-size: 1.1rem;
    transition: transform 0.15s;
  }
  .bottom-nav-item.active,
  .bottom-nav-item[aria-current="page"] {
    color: var(--primary, #0ea5e9);
  }
  .bottom-nav-item.active i {
    transform: scale(1.15);
  }
  .bottom-nav-badge {
    position: absolute;
    top: 6px;
    right: 18%;
    background: var(--danger, #ef4444);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }
  /* Push main content up so bottom nav doesn't cover it */
  .main-content {
    padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  }
}
@media (min-width: 992px) {
  .bottom-nav {
    display: none !important;
  }
}
```

**Action: MODIFY `src/core/app.js`**

Find the section that handles route changes and nav link active states. It will contain the
`aria-current="page"` logic inside the router. After updating `aria-current` on nav links, ADD:

```javascript
// Sync bottom nav active state
document.querySelectorAll(".bottom-nav-item").forEach((link) => {
  const href = link.getAttribute("href");
  const isMatch =
    href === `#/${cleanPath}` || (cleanPath === "" && href === "#/");
  link.setAttribute("aria-current", isMatch ? "page" : "false");
  link.classList.toggle("active", isMatch);
});
```

Also in `updateNavbar()` inside `src/core/auth/index.js`, find where user menu is toggled
and ADD after it:

```javascript
// Show/hide bottom nav account vs login link
const bnAccount = document.getElementById("bnAccount");
const bnLogin = document.getElementById("bnLogin");
const bnCart = document.querySelector("#bnCart");
if (bnAccount) bnAccount.classList.toggle("d-none", !authed);
if (bnLogin) bnLogin.classList.toggle("d-none", authed);
if (bnCart) bnCart.classList.toggle("d-none", !authed);
```

Also sync the cart badge to the bottom nav. Find `syncCartBadgeCount` in auth/index.js and ADD:

```javascript
const bnBadge = document.getElementById("bnCartBadge");
if (bnBadge) {
  bnBadge.textContent = _cartCount;
  bnBadge.classList.toggle("d-none", _cartCount === 0 || !isAuthenticated());
}
```

✅ **TEST:**

1. Open the site on a mobile screen (≤991px) or resize browser.
2. Bottom navigation bar appears with: Home, Products, Auctions, Cart (if logged in), Login (if not).
3. Tap Products → Products page loads AND the Products icon is highlighted.
4. Cart badge shows item count matching the top nav cart badge.
5. On desktop (≥992px), bottom nav is NOT visible.

---

### TASK-H7 — Add Register Page Rate Limiting

**File:** `src/pages/register.js`
**Problem:** Login has frontend rate limiting after 5 failures. Register has none. A single
IP can flood account creation.

**Action: MODIFY `src/pages/register.js`**

Find the registration error handler inside the `submit()` method. It will be in a `catch (err)`
block. Add rate limiting INSIDE the catch block, after the error is displayed:

```javascript
    } catch (err) {
      // EXISTING error display code stays here unchanged

      // ADD THIS BLOCK after existing error display:
      let regFails = parseInt(sessionStorage.getItem('sayiadRegFails') || '0') + 1;
      sessionStorage.setItem('sayiadRegFails', regFails);
      if (regFails >= 3) {
        const submitBtn = document.getElementById('registerSubmitBtn')
          || document.querySelector('#registerForm button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        let secs = 60;
        const lockMsg = document.getElementById('registerLockMsg');
        if (lockMsg) lockMsg.classList.remove('hidden');
        const timer = setInterval(() => {
          secs--;
          if (lockMsg) lockMsg.textContent = `Too many attempts. Wait ${secs}s before trying again.`;
          if (secs <= 0) {
            clearInterval(timer);
            sessionStorage.removeItem('sayiadRegFails');
            if (submitBtn) submitBtn.disabled = false;
            if (lockMsg) lockMsg.classList.add('hidden');
          }
        }, 1000);
      }
```

Now find the HTML template inside register.js where the submit button is. Add this element
BEFORE the submit button:

```html
<div
  id="registerLockMsg"
  class="field-error hidden"
  role="alert"
  aria-live="assertive"
  style="margin-bottom:8px"
></div>
```

Also on SUCCESSFUL registration, clear the counter. Find the success handler (after
`navigate(...)` or `showToast(... 'success')`) and ADD:

```javascript
sessionStorage.removeItem("sayiadRegFails");
```

✅ **TEST:**

1. Go to Register.
2. Submit with invalid email 3 times.
3. After the 3rd failure, the submit button disables and a 60-second countdown appears.
4. After 60s, button re-enables.

---

**🔖 COMMIT — PHASE 2:**
✅ **Done** — commit `c88f53b`

```
git add -A
git commit -m "fix(high): hreflang, noindex private pages, offline page, hero mobile, product grid 320px, bottom nav, register rate limit"
git push
```

---

## PHASE 3 — MEDIUM PRIORITY (UX polish and mobile quality)

---

### TASK-M1 — Anonymize Bidder IDs in Auction History

**File:** `src/pages/auction-detail.js`
**Problem:** When a bid is received via SignalR and the full name is unavailable, the code
falls back to `User #${bid.bidderId}` — exposing the numeric database user ID publicly. This
leaks internal user IDs.

**Action: MODIFY `src/pages/auction-detail.js`**

Find this EXACT text:

```javascript
      userName: bid.userName || bid.bidderName || bid.fullName || (bid.bidderId ? `User #${bid.bidderId}` : 'User'),
```

Replace with:

```javascript
      userName: bid.userName || bid.bidderName || bid.fullName || t('auction.anonymousBidder') || 'Bidder',
```

✅ **TEST:**

1. On an active auction, have a bid come in from a user with no name.
2. The bid history must show "Bidder" (or Arabic equivalent), never "User #123".

---

### TASK-M2 — Add Auction Countdown Responsive Wrapping at 320px

**File:** `src/css/style.css`
**Problem:** The auction countdown shows days/hours/minutes/seconds as horizontal flex items.
At 320px, 4 countdown units (each with a large number and label) may overflow or get clipped.

**Action: ADD to END of `src/css/style.css`:**

```css
/* ===================== AUCTION COUNTDOWN — MOBILE ===================== */
.countdown-timer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}
.countdown-unit {
  min-width: 52px;
  text-align: center;
}
@media (max-width: 375px) {
  .countdown-unit {
    min-width: 44px;
  }
  .countdown-num {
    font-size: 1.5rem !important;
  }
  .countdown-lbl {
    font-size: 0.625rem !important;
  }
}
@media (max-width: 320px) {
  .countdown-timer {
    gap: 0.25rem;
  }
  .countdown-unit {
    min-width: 36px;
  }
  .countdown-num {
    font-size: 1.25rem !important;
  }
}
```

✅ **TEST:**

1. DevTools → set viewport to 320px.
2. Open an active auction with a countdown.
3. All 4 units (days/hours/minutes/seconds) must be visible without overflow.

---

### TASK-M3 — Add Mobile Swipe to Product Detail Thumbnail Gallery

**File:** `src/pages/product-detail.js`
**Problem:** Product detail has a thumbnail gallery for multiple images. On mobile, users
expect to swipe left/right through images. Currently only thumbnail clicks work.

**Action: MODIFY `src/pages/product-detail.js`**

Find the function that initializes the image gallery (look for `mainImg`, `thumbnail`, or
`gallery` logic). After the gallery HTML is rendered and the `mainImg` element exists, ADD
this code in the initialization section:

```javascript
// Mobile swipe support for image gallery
(function initGallerySwipe() {
  const wrap = document.getElementById("mainImageWrap");
  if (!wrap) return;
  let startX = 0,
    startY = 0;
  wrap.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    },
    { passive: true },
  );
  wrap.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
      const thumbs = document.querySelectorAll(".thumb-img");
      if (!thumbs.length) return;
      const active = Array.from(thumbs).findIndex((t) =>
        t.classList.contains("active"),
      );
      const next =
        dx < 0
          ? Math.min(active + 1, thumbs.length - 1)
          : Math.max(active - 1, 0);
      if (next !== active) thumbs[next].click();
    },
    { passive: true },
  );
})();
```

Where `.thumb-img` should be replaced with the actual CSS class of the thumbnail images in
the product detail gallery. Find what class the thumbnails use by searching for `thumbnail`
or `thumb` in product-detail.js and use that class name.

✅ **TEST:**

1. Open a product with multiple images on a mobile device (or DevTools touch emulation).
2. Swipe left → next image appears.
3. Swipe right → previous image appears.
4. Desktop clicking thumbnails still works.

---

### TASK-M4 — Add Wallet Payment Gateway Notice

**File:** `src/pages/wallet.js`
**Problem:** The wallet top-up button accepts any amount and posts to `/wallet/deposit` without
a real payment gateway. Users can see a "Top Up" button suggesting real money can be added, but
this is not connected to Fawry, InstaPay, or any payment provider. Until a real payment is
integrated, the UI must set clear expectations.

**Action: MODIFY `src/pages/wallet.js`**

Find the `handleTopUp` function. Find this text (near the end of the try block):

```javascript
await apiRequest("POST", "/wallet/deposit", { amount }); // ← CONFIRM ENDPOINT
closeTopUpModal();
showToast("Wallet topped up successfully!", "success");
```

Wait — the actual code uses `api.post`. Find:

```javascript
await api.post("/wallet/deposit", { amount });
closeTopUpModal();
showToast("Wallet topped up successfully!", "success");
```

Before that `api.post` line, ADD a check/notice:

```javascript
// PAYMENT GATEWAY NOTE: Until Fawry/InstaPay is integrated,
// top-up is handled as a manual/admin-credited operation.
// The button will show a pending confirmation instead of instant credit.
```

Also find the Top Up button HTML in the template and change the button text to include
a note. Find:

```html
<button class="btn btn-primary" id="topUpBtn" data-i18n="wallet_topup">
  <i class="fas fa-plus-circle" aria-hidden="true"></i> Top Up
</button>
```

Replace with:

```html
<button class="btn btn-primary" id="topUpBtn" data-i18n="wallet_topup">
  <i class="fas fa-plus-circle" aria-hidden="true"></i> Top Up
</button>
<p
  class="wallet-payment-note"
  style="font-size:0.75rem;opacity:0.55;margin-top:0.5rem"
>
  <i class="fas fa-info-circle" aria-hidden="true"></i>
  <span data-i18n="wallet_payment_note"
    >Top-up requests are processed manually within 24 hours.</span
  >
</p>
```

✅ **TEST:**

1. Go to Wallet page.
2. Below the Top Up button, a small note must be visible about processing time.

---

### TASK-M5 — Vite Build: Add Page-Level Code Splitting

**File:** `vite.config.js`
**Problem:** The current Vite config only has one manual chunk (`vendor-alpine`). All 25+ page
modules are bundled into `index-*.js` (currently 209KB). Adding route-level chunks dramatically
improves initial load and cache efficiency.

**Action: MODIFY `vite.config.js`**

Find this EXACT text:

```javascript
        manualChunks: {
          'vendor-alpine': ['alpinejs'],
        },
```

Replace with:

```javascript
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules/alpinejs')) return 'vendor-alpine';
          if (id.includes('node_modules/bootstrap')) return 'vendor-bootstrap';

          // Core app chunks (loaded on every page)
          if (id.includes('/src/core/i18n/')) return 'core-i18n';
          if (id.includes('/src/core/api/') || id.includes('/src/core/auth/') ||
              id.includes('/src/core/router/') || id.includes('/src/core/events/')) {
            return 'core-app';
          }

          // Page chunks (loaded only when route is visited)
          const pageMatch = id.match(/\/src\/pages\/([^/]+)\.js$/);
          if (pageMatch) return `page-${pageMatch[1]}`;
        },
```

✅ **TEST:**

1. Run `npm run build`.
2. Open `dist/assets/`. You should see files like:
   - `core-i18n-*.js`
   - `core-app-*.js`
   - `vendor-alpine-*.js`
   - `page-home-*.js`
   - `page-products-*.js`
   - `page-dashboard-*.js`
   - etc.
3. The main `index-*.js` should be significantly smaller (target: <50KB gzipped).

---

### TASK-M6 — Add `fetchpriority` and `preload` for LCP on Home Page

**File:** `src/index.html`
**Problem:** There is no `<link rel="preload">` for the critical fonts or the hero background.
Google PageSpeed will report a missing LCP preload.

**Action: MODIFY `src/index.html`**

Find this EXACT text:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

After both those lines, ADD:

```html
<link
  rel="preload"
  href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Cairo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
  <link
    href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Cairo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
  />
</noscript>
```

Then find the existing Google Fonts stylesheet `<link>`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Cairo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

DELETE this `<link>` tag (the preload above handles it now).

✅ **TEST:**

1. Run `npm run build && npm run preview`.
2. PageSpeed Insights or Lighthouse → Performance.
3. "Eliminate render-blocking resources" warning for Google Fonts must be resolved.

---

**🔖 COMMIT — PHASE 3:**

```
git add -A
git commit -m "fix(medium): anonymize bidder IDs, countdown 320px, gallery swipe, wallet notice, vite chunks, font preload"
git push
```

---

## PHASE 4 — MOBILE POLISH (final UX layer)

---

### TASK-P1 — Sync Bottom Nav Active State on Route Change

This is an extension of TASK-H6. After implementing the bottom nav in `src/core/app.js`,
verify the active state updates on every `hashchange` event.

Open `src/core/router/index.js`.
Find this block (it already exists):

```javascript
document.querySelectorAll(".nav-link").forEach((link) => {
  const href = link.getAttribute("href");
  const isMatch =
    href === `#/${cleanPath}` || (cleanPath === "" && href === "#/");
  link.setAttribute("aria-current", isMatch ? "page" : "false");
});
```

Immediately AFTER that block, ADD:

```javascript
// Sync bottom nav
document.querySelectorAll(".bottom-nav-item").forEach((link) => {
  const href = link.getAttribute("href");
  const isMatch =
    href === `#/${cleanPath}` || (cleanPath === "" && href === "#/");
  link.setAttribute("aria-current", isMatch ? "page" : "false");
  link.classList.toggle("active", isMatch);
});
```

✅ **TEST:**

1. On mobile, tap Products in bottom nav → Products icon turns highlighted (primary color).
2. Tap Auctions → Auctions icon highlighted, Products icon returns to default.
3. Use browser back button → correct tab is highlighted for the current route.

---

### TASK-P2 — Focus Trap in Custom Modals (Wallet + Bid)

**Files:** `src/pages/wallet.js`, `src/core/utils/ui.js`
**Problem:** The wallet top-up modal and other custom modals don't trap keyboard focus. A user
pressing Tab while the modal is open can navigate to content behind the modal — this is a
WCAG 2.1.2 failure and makes the modal unusable with keyboard navigation.

**Action: ADD to END of `src/css/style.css`:**

```css
/* ===================== MODAL FOCUS TRAP INDICATOR ===================== */
.modal-overlay:not(.hidden) {
  /* Prevent background scroll when modal open */
  overflow: hidden;
}
```

**Action: MODIFY `src/pages/wallet.js`**

Find the `openTopUpModal()` function and ADD after `document.getElementById('topUpAmount').focus()`:

```javascript
// Trap focus inside modal
const modal = document.querySelector(".modal-box");
if (modal) {
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  function trapFocus(e) {
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  modal._trapFocus = trapFocus;
  modal.addEventListener("keydown", trapFocus);
}
document.body.style.overflow = "hidden";
```

Find the `closeTopUpModal()` function and ADD at the start:

```javascript
const modal = document.querySelector(".modal-box");
if (modal && modal._trapFocus) {
  modal.removeEventListener("keydown", modal._trapFocus);
  delete modal._trapFocus;
}
document.body.style.overflow = "";
```

✅ **TEST:**

1. Open Wallet page → click Top Up.
2. When modal opens, press Tab repeatedly — focus must NEVER leave the modal.
3. Press Shift+Tab — focus moves backward but stays inside the modal.
4. Press Escape or Cancel — modal closes and focus returns to the page.

---

### TASK-P3 — Add `aria-label` to All Icon-Only Buttons

**File:** `src/index.html`
**Problem:** Several icon-only buttons in the nav (theme toggle, language toggle) have
`title` attributes which are not consistently read by screen readers. The `aria-label`
attribute is the correct approach, and both toggle buttons need review.

**Action: MODIFY `src/index.html`**

Find:

```html
<button
  class="toggle-btn"
  id="themeToggle"
  title="Toggle theme"
  aria-label="Toggle dark mode"
>
  <i class="fas fa-moon"></i>
</button>
<button
  class="toggle-btn"
  id="langToggle"
  title="Switch language"
  aria-label="Switch language"
>
  EN
</button>
```

Replace with:

```html
<button
  class="toggle-btn"
  id="themeToggle"
  aria-label="Toggle dark mode"
  aria-pressed="false"
>
  <i class="fas fa-moon" aria-hidden="true"></i>
</button>
<button
  class="toggle-btn"
  id="langToggle"
  aria-label="Switch to Arabic"
  aria-pressed="false"
>
  EN
</button>
```

Now open `src/core/app.js`. Find where the theme toggle is updated on click.
After toggling the theme, ADD:

```javascript
const isDark = document.documentElement.getAttribute("data-theme") === "dark";
document
  .getElementById("themeToggle")
  ?.setAttribute("aria-pressed", isDark ? "true" : "false");
document
  .getElementById("themeToggle")
  ?.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Toggle dark mode",
  );
```

And in the `applyLanguage(lang)` function, after setting the button text, ADD:

```javascript
langToggle.setAttribute(
  "aria-label",
  lang === "ar" ? "Switch to English" : "Switch to Arabic",
);
```

✅ **TEST:**

1. Use a screen reader (NVDA/VoiceOver) or inspect in DevTools.
2. Focus the theme toggle → screen reader announces "Toggle dark mode, button".
3. After clicking → announces "Switch to light mode, button".
4. Language toggle → announces "Switch to Arabic, button".

---

**🔖 COMMIT — PHASE 4:**

```
git add -A
git commit -m "fix(mobile polish): bottom nav active sync, modal focus trap, icon button aria-labels"
git push
```

---

## PHASE 5 — BACKEND (ASP.NET Core — Saiyad repo)

---

### TASK-B1 — Enforce Role Authorization on All Controllers

**Problem:** The frontend has comprehensive route guards AND server-side enforcement is essential.
The app stores JWTs in localStorage, meaning the token is accessible to JS. Server-side
enforcement is the only true security layer.

**Action:** Open every controller. For EACH action method that is role-sensitive,
ADD the `[Authorize(Roles = "...")]` attribute on the line ABOVE it.

| Controller         | Action          | Add This Attribute                                                |
| ------------------ | --------------- | ----------------------------------------------------------------- |
| AdminController    | ALL actions     | `[Authorize(Roles = "Admin")]`                                    |
| ProductsController | GET list/detail | _(none — public)_                                                 |
| ProductsController | POST/PUT        | `[Authorize(Roles = "Fisherman,BaitSeller")]`                     |
| ProductsController | DELETE          | `[Authorize(Roles = "Fisherman,BaitSeller,Admin")]`               |
| AuctionsController | GET             | _(none — public)_                                                 |
| AuctionsController | POST create     | `[Authorize(Roles = "Auctioneer")]`                               |
| AuctionsController | PUT/DELETE      | `[Authorize(Roles = "Auctioneer,Admin")]`                         |
| BidsController     | POST            | `[Authorize(Roles = "Customer,Fisherman,BaitSeller,Auctioneer")]` |
| WalletController   | ALL             | `[Authorize]`                                                     |
| OrdersController   | GET own         | `[Authorize]`                                                     |
| OrdersController   | GET all         | `[Authorize(Roles = "Admin")]`                                    |

Example:

```csharp
[HttpPost]
[Authorize(Roles = "Fisherman,BaitSeller")]  // ← ADD
public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
{
    // existing code unchanged
}
```

**Verify `Program.cs`** has both in this exact order:

```csharp
app.UseAuthentication();
app.UseAuthorization();
```

✅ **TEST:** Using Postman:

1. Login as Customer → copy JWT.
2. `POST /api/products` with that JWT → must return `403 Forbidden`.
3. Login as Fisherman → `POST /api/products` → must succeed.

---

### TASK-B2 — Add Rate Limiting to Login and Register Endpoints

**Files:** terminal, `Program.cs`, `appsettings.json`

**Step 1:** Run in terminal (inside Saiyad backend folder):

```
dotnet add package AspNetCoreRateLimit
```

**Step 2:** Open `Program.cs`. ADD to the services section:

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

ADD to pipeline BEFORE `app.UseRouting()`:

```csharp
app.UseIpRateLimiting();
```

**Step 3:** Open `appsettings.json`. ADD this top-level JSON section:

```json
"IpRateLimiting": {
  "EnableEndpointRateLimiting": true,
  "StackBlockedRequests": false,
  "HttpStatusCode": 429,
  "RealIpHeader": "X-Real-IP",
  "GeneralRules": [
    { "Endpoint": "POST:/api/auth/login",    "Period": "15m", "Limit": 10 },
    { "Endpoint": "POST:/api/auth/register", "Period": "1h",  "Limit": 5 }
  ]
}
```

✅ **TEST:** Send 11 POST requests to `/api/auth/login` within 15 minutes.
The 11th must return `429 Too Many Requests`.

---

### TASK-B3 — Lock Down CORS to Sayiad Domain Only

**File:** `Program.cs`

Find `builder.Services.AddCors`. Replace/update the allowed origins:

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

In the pipeline, ensure order is:

```csharp
app.UseCors("AllowFrontend");   // BEFORE Authentication
app.UseAuthentication();
app.UseAuthorization();
```

✅ **TEST:** From browser console on google.com:
`fetch('https://sayiad.runasp.net/api/products').catch(e => console.log('CORS blocked:', e.name))`
Must log "CORS blocked: TypeError".

---

**🔖 COMMIT — PHASE 5:**

```
git add -A
git commit -m "fix(backend): role authorization, rate limiting, CORS restriction"
git push
```

---

## COMPLETE TASK CHECKLIST

```
PHASE 1 — CRITICAL
[x] TASK-C1  validateForm accepts both HTMLElement and string ID + array and object formats
[x] TASK-C2  Bid confirmation modal before placeBid() fires
[x] TASK-C3  sourcemap: false in vite.config.js
[x] TASK-C4  loading="lazy" + decoding="async" + fetchpriority="high" on product detail main img

PHASE 2 — HIGH PRIORITY
[x] TASK-H1  hreflang ar/en/x-default tags in index.html
[x] TASK-H2  noindex meta on cart, checkout, dashboard, profile, wallet, admin, shipping, orders
[x] TASK-H3  Styled offline page in sw.js
[x] TASK-H4  Hero 3D tilt disabled on touch/hover:none devices
[x] TASK-H5  Product grid: row-cols-1 on <576px, row-cols-sm-2 at 576px+
[x] TASK-H6  Bottom mobile navigation bar (≤991px only)
[x] TASK-H7  Register page rate limiting after 3 failures

PHASE 3 — MEDIUM
[ ] TASK-M1  Bidder IDs anonymized in auction history
[ ] TASK-M2  Countdown timer wraps correctly at 320px and 375px
[ ] TASK-M3  Touch swipe gesture for product detail image gallery
[ ] TASK-M4  Wallet top-up "pending" notice until payment gateway is live
[ ] TASK-M5  Vite manualChunks splits i18n, core, and all pages into separate chunks
[ ] TASK-M6  Google Fonts loaded via preload + noscript instead of render-blocking stylesheet

PHASE 4 — MOBILE POLISH
[ ] TASK-P1  Bottom nav active state synced in router.js on every hashchange
[ ] TASK-P2  Focus trap inside wallet modal (and all custom modals)
[ ] TASK-P3  aria-label + aria-pressed on theme and language toggle buttons

PHASE 5 — BACKEND
[ ] TASK-B1  [Authorize(Roles=...)] on all role-sensitive endpoints
[ ] TASK-B2  Rate limiting: 10/15min on login, 5/hour on register
[ ] TASK-B3  CORS restricted to saiyad-eg.vercel.app only
```

---

## WHAT WAS ALREADY CORRECTLY IMPLEMENTED

_(Do NOT re-implement these — they are done and working)_

| Feature                                  | Where                                                    |
| ---------------------------------------- | -------------------------------------------------------- |
| RTL/LTR toggle (dir + lang)              | `src/core/app.js` → `applyLanguage()`                    |
| RTL CSS overrides                        | `src/css/_rtl.css`                                       |
| Code splitting (dynamic imports)         | `src/shared/constants/routes.js`                         |
| Route guards (all 12 protected routes)   | `src/shared/constants/routes.js` → `routeGuards`         |
| SEO meta tags (OG, Twitter, canonical)   | `src/index.html`                                         |
| `setPageMeta()` helper                   | `src/core/utils/seo.js`                                  |
| Loading skeleton                         | `src/index.html` + `src/css/style.css`                   |
| Global error fallback                    | `src/index.html` + `src/shared/helpers/errors.js`        |
| Security headers (CSP, HSTS, X-Frame)    | `vercel.json`                                            |
| DOMPurify loaded                         | `src/index.html`                                         |
| SignalR auto-reconnect + banner          | `src/core/realtime/index.js`                             |
| CSRF token utility                       | `src/core/utils/csrf.js`                                 |
| JWT refresh token flow                   | `src/core/api/client.js`                                 |
| Password strength meter                  | `src/pages/register.js` + `src/core/utils/validation.js` |
| Login rate limiting (5 attempts)         | `src/pages/login.js`                                     |
| Font-display: swap                       | Google Fonts URL has `&display=swap`                     |
| Empty states (CSS + patterns)            | `src/css/style.css`                                      |
| Dynamic copyright year                   | `src/index.html` + `src/core/app.js`                     |
| Back-to-top (hidden by default)          | `src/index.html`                                         |
| Autocomplete on all form fields          | All page files                                           |
| Pull-to-refresh on home                  | `src/pages/home.js`                                      |
| Infinite scroll on products              | `src/pages/products.js`                                  |
| Filter drawer (mobile)                   | `src/pages/products.js`                                  |
| PWA manifest + service worker            | `src/public/manifest.json`, `src/public/sw.js`           |
| Apple touch icon meta                    | `src/index.html`                                         |
| robots.txt                               | `src/public/robots.txt`                                  |
| Wallet page (balance + top-up + history) | `src/pages/wallet.js`                                    |
| Social links with real URLs              | `src/index.html` footer                                  |
| Touch target 44px on buttons             | `src/css/_components.css`                                |
| viewport-fit=cover                       | `src/index.html`                                         |
| Skip link                                | `src/index.html`                                         |
| aria-live region                         | `src/index.html`                                         |
| Global error handler                     | `src/shared/helpers/errors.js`                           |
| Deduplication of parallel API calls      | `src/core/api/client.js`                                 |
