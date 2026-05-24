import { getUser, updateNavbar } from '../auth/index.js';
import { t } from '../i18n/index.js';
import { showLoading, observeAnimations } from '../utils/dom.js';
import { showErrorFallback } from '../../shared/helpers/errors.js';
import { routeGuards, routes, routeTitleKeys } from '../../shared/constants/routes.js';

let currentRouteKey = null;
let currentParams = {};
let _routeCleanups = [];

export function registerRouteCleanup(fn) {
  _routeCleanups.push(fn);
}

function runRouteCleanups() {
  _routeCleanups.forEach(fn => { try { fn(); } catch(e) { console.warn('Cleanup error:', e); } });
  _routeCleanups = [];
}

let _navTimer = null;

export function navigate(path) {
  window.location.hash = `#/${path}`;
}

function getRoute() {
  const hash = window.location.hash.replace("#/", "");
  const parts = hash.split("?");
  const route = parts[0];
  const params = Object.fromEntries(new URLSearchParams(parts[1] || ""));
  return { route: route || "", params };
}

export async function router(force = false) {
  const { route, params } = getRoute();
  const app = document.getElementById("app");

  const routeKey = route.includes("/") ? route.split("/")[0] : route;

  // Enforce route guards
  const guard = routeGuards[routeKey];
  if (guard) {
    const user = getUser();
    if (!guard(user)) {
      window.location.hash = user ? '#/' : '#/login';
      return;
    }
  }

  const dynamicImport = routes[routeKey];
  if (!dynamicImport) {
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

  // Cleanup previous route resources
  runRouteCleanups();

  // Allow re-render when route key is same but params changed
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

  const btt = document.getElementById("backToTop");
  if (btt) btt.classList.remove("visible");

  app.style.opacity = "0";
  app.style.transform = "translateY(8px)";
  app.style.transition = "opacity 0.15s ease, transform 0.15s ease";

  showLoading(app, "page");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (_navTimer) clearTimeout(_navTimer);
  _navTimer = setTimeout(async () => {
    _navTimer = null;
    const { route: curRoute } = getRoute();
    if (routeKey !== (curRoute.includes("/") ? curRoute.split("/")[0] : curRoute)) return;
    const fullPath = route;
    try {
      const pageModule = await dynamicImport();
      await pageModule.default(app, fullPath, params);
    } catch (err) {
      showErrorFallback(app, err.message);
      return;
    }
    updateNavbar();

    const titleKey = routeTitleKeys[routeKey];
    document.title = (titleKey ? t(titleKey) : "Sayiad") + " — Sayiad";

    app.setAttribute("tabindex", "-1");
    app.focus({ preventScroll: true });
    app.removeAttribute("tabindex");

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

window.addEventListener("hashchange", () => router());
router();
