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
};

let currentRouteKey = null;
let currentParams = {};
window.onRouteCleanup = null;

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

async function router() {
  const { route, params } = getRoute();
  const app = document.getElementById("app");

  const routeKey = route.includes("/") ? route.split("/")[0] : route;
  const handler = getHandler(routeKey);

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
  if (typeof window.onRouteCleanup === "function") {
    window.onRouteCleanup();
    window.onRouteCleanup = null;
  }

  // Allow re-render when route key is same but params changed (e.g. dashboard tabs)
  const paramsChanged =
    JSON.stringify(currentParams) !== JSON.stringify(params);
  if (currentRouteKey === routeKey && !paramsChanged && routeKey !== "") return;
  currentRouteKey = routeKey;
  currentParams = { ...params };

  app.style.opacity = "0";
  app.style.transform = "translateY(8px)";
  app.style.transition = "opacity 0.15s ease, transform 0.15s ease";

  setTimeout(async () => {
    showLoading(app, "page");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fullPath = route;
    await handler(app, fullPath, params);
    updateNavbar();

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

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
