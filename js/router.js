const ROLES = Object.freeze({
  ADMIN:       'Admin',
  CUSTOMER:    'Customer',
  FISHERMAN:   'Fisherman',
  BAIT_SELLER: 'BaitSeller',
  AUCTIONEER:  'Auctioneer',
});

const SELLER_ROLES = [ROLES.FISHERMAN, ROLES.BAIT_SELLER];

const routeGuards = {
  'admin':                   (user) => !!user && user.role === ROLES.ADMIN,
  'cart':                    (user) => !!user && hasAnyRole(ROLES.CUSTOMER, ROLES.FISHERMAN, ROLES.BAIT_SELLER),
  'checkout':                (user) => !!user && hasAnyRole(ROLES.CUSTOMER, ROLES.FISHERMAN, ROLES.BAIT_SELLER),
  'dashboard':               (user) => !!user,
  'shipping':                (user) => !!user && hasAnyRole(ROLES.CUSTOMER, ROLES.FISHERMAN, ROLES.BAIT_SELLER),
  'order-detail':            (user) => !!user && hasAnyRole(ROLES.CUSTOMER, ROLES.FISHERMAN, ROLES.BAIT_SELLER),
  'profile':                 (user) => !!user,
  'auction-requests':        (user) => !!user && user.role === ROLES.FISHERMAN,
  'auction-requests-review': (user) => !!user && hasAnyRole(ROLES.AUCTIONEER, ROLES.ADMIN),
  'auctioneer-analytics':    (user) => !!user && hasAnyRole(ROLES.AUCTIONEER, ROLES.ADMIN),
  'subscriptions':           (user) => !!user && hasAnyRole(ROLES.CUSTOMER, ROLES.FISHERMAN, ROLES.BAIT_SELLER, ROLES.AUCTIONEER),
  'wallet':                  (user) => !!user,
};

const routeMap = {
  "": "renderHome",
  login: "renderLogin",
  register: "renderRegister",
  "forgot-password": "renderForgotPassword",
  "reset-password": "renderResetPassword",
  products: "renderProducts",
  "product-detail": "renderProductDetail",
  auctions: "renderAuctions",
  "auction-detail": "renderAuctionDetail",
  cart: "renderCart",
  checkout: "renderCheckout",
  dashboard: "renderDashboard",
  "verify-email": "renderVerifyEmail",
  shipping: "renderShipping",
  "seller-profile": "renderSellerProfile",
  "order-detail": "renderOrderDetail",
  admin: "renderAdmin",
  terms: "renderTerms",
  privacy: "renderPrivacy",
  profile: "renderUserProfile",
  "auction-requests": "renderAuctionRequests",
  "auction-requests-review": "renderAuctionRequestsReview",
  "auctioneer-analytics": "renderAuctioneerAnalytics",
  subscriptions: "renderSubscriptions",
  wallet: "renderWallet",
};

const routeTitleKeys = {
  "": "home.welcome",
  login: "nav.login",
  register: "nav.register",
  "forgot-password": "auth.forgotPassword",
  "reset-password": "auth.resetPassword",
  products: "products.title",
  "product-detail": "products.title",
  auctions: "auctions.title",
  "auction-detail": "auctions.title",
  cart: "nav.cart",
  checkout: "cart.title",
  dashboard: "nav.dashboard",
  "verify-email": "verify.title",
  shipping: "shipping.title",
  "seller-profile": "seller.title",
  "order-detail": "order.title",
  admin: "admin.title",
  terms: "auth.termsAndConditions",
  privacy: "auth.privacyPolicy",
  profile: "dash.profile",
  "auction-requests": "auctionRequests.title",
  "auction-requests-review": "auctionRequestsReview.title",
  "auctioneer-analytics": "analytics.title",
  subscriptions: "subscriptions.title",
  wallet: "wallet.title",
};

let currentRouteKey = null;
let currentParams = {};
window._routeCleanups = [];
function registerRouteCleanup(fn) {
  window._routeCleanups.push(fn);
}
function runRouteCleanups() {
  window._routeCleanups.forEach(fn => { try { fn(); } catch(e) { console.warn('Cleanup error:', e); } });
  window._routeCleanups = [];
}
let _navTimer = null;

function navigate(path) {
  window.location.hash = `#/${path}`;
}

function getRoute() {
  const hash = window.location.hash.replace("#/", "");
  const parts = hash.split("?");
  const route = parts[0];
  const params = Object.fromEntries(new URLSearchParams(parts[1] || ""));
  return { route: route || "", params };
}

function getHandler(routeKey) {
  const name = routeMap[routeKey];
  if (name && typeof window[name] === "function") return window[name];
  return null;
}

async function router(force = false) {
  const { route, params } = getRoute();
  const app = document.getElementById("app");

  const routeKey = route.includes("/") ? route.split("/")[0] : route;
  const handler = getHandler(routeKey);

  // Enforce route guards
  const guard = routeGuards[routeKey];
  if (guard) {
    const user = (typeof getUser === 'function') ? getUser() : null;
    if (!guard(user)) {
      window.location.hash = user ? '#/' : '#/login';
      return;
    }
  }

  if (!handler) {
    app.style.opacity = "1";
    app.style.transform = "translateY(0)";
    app.style.transition = "";
    app.innerHTML = `
      <div class="not-found-page animate-on-scroll">
        <div class="not-found-fish"><i class="fas fa-fish"></i></div>
        <h1>404</h1>
        <h2>${t("common.pageNotFound")}</h2>
        <p>${t("common.pageNotFoundDesc")}</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px">
          <a href="#/" class="btn btn-primary btn-lg"><i class="fas fa-home"></i> ${t("common.goHome")}</a>
          <a href="#/products" class="btn btn-outline btn-lg"><i class="fas fa-store"></i> ${t("nav.products")}</a>
        </div>
      </div>`;
    observeAnimations();
    return;
  }

  // Cleanup previous route resources (intervals, listeners)
  runRouteCleanups();

  // Allow re-render when route key is same but params changed (e.g. dashboard tabs)
  const paramsChanged =
    JSON.stringify(currentParams) !== JSON.stringify(params);
  if (
    currentRouteKey === routeKey &&
    !paramsChanged &&
    routeKey !== "" &&
    !force
  )
    return;
  currentRouteKey = routeKey;
  currentParams = { ...params };

  // Hide back-to-top on nav
  const btt = document.getElementById("backToTop");
  if (btt) btt.classList.remove("visible");

  app.style.opacity = "0";
  app.style.transform = "translateY(8px)";
  app.style.transition = "opacity 0.15s ease, transform 0.15s ease";

  // Show loading skeleton immediately
  showLoading(app, "page");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (_navTimer) clearTimeout(_navTimer);
  _navTimer = setTimeout(async () => {
    _navTimer = null;
    // Guard: if route changed during the delay, skip stale render
    const { route: curRoute } = getRoute();
    if (routeKey !== (curRoute.includes("/") ? curRoute.split("/")[0] : curRoute)) return;
    const fullPath = route;
    await handler(app, fullPath, params);
    updateNavbar();

    // Set page title
    const titleKey = routeTitleKeys[routeKey];
    document.title = (titleKey ? t(titleKey) : "Sayiad") + " — Sayiad";

    // Focus main content for keyboard users
    app.setAttribute("tabindex", "-1");
    app.focus({ preventScroll: true });
    app.removeAttribute("tabindex");

    // Announce page change to screen readers
    const live = document.getElementById("ariaLive");
    if (live) live.textContent = `Navigated to ${document.title}`;

    requestAnimationFrame(() => {
      app.style.opacity = "1";
      app.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      app.style.transition = "";
      app.style.opacity = "";
      app.style.transform = "";
    }, 250);
  }, 150);
}

window.ROLES = ROLES;
window.SELLER_ROLES = SELLER_ROLES;

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
