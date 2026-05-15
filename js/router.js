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
    app.innerHTML = `<div class="empty-state" style="animation:slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)"><i class="fas fa-exclamation-triangle"></i><h3>${t("common.pageNotFound")}</h3><p>${t("common.pageNotFoundDesc")}</p><a href="#/" class="btn btn-primary" style="margin-top:16px">${t("common.goHome")}</a></div>`;
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
