import { getUser, updateNavbar } from '../auth/index.js';
import { t } from '../i18n/index.js';
import { showLoading, observeAnimations } from '../utils/dom.js';
import { showErrorFallback } from '../../shared/helpers/errors.js';
import { routeGuards, routes, routeTitleKeys } from '../../shared/constants/routes.js';

let currentRouteKey = null;
let currentParams = {};
let _routeCleanups = [];
const _routeHistory = [];
const MAX_HISTORY = 50;
let _initialLoad = true;

// Close mobile nav drawer when route changes
function closeDrawer() {
  const drawer = document.getElementById('navDrawer');
  const overlay = document.getElementById('navOverlay');
  if (!drawer && !overlay) return;
  drawer?.classList.remove('open');
  overlay?.classList.remove('open');
  document.body.classList.remove('nav-open');
  const btn = document.getElementById('hamburger');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
    btn.setAttribute('aria-expanded', 'false');
  }
  btn?.focus();
}

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

export function pushRouteHistory(route) {
  if (_initialLoad) {
    _initialLoad = false;
    _routeHistory.push(route || '');
    return;
  }
  const last = _routeHistory[_routeHistory.length - 1];
  if (last === route) return;
  _routeHistory.push(route || '');
  if (_routeHistory.length > MAX_HISTORY) _routeHistory.shift();
}

export function goBack() {
  if (_routeHistory.length < 2) {
    navigate('');
    return;
  }
  _routeHistory.pop(); // remove current
  const prev = _routeHistory.pop(); // get previous
  navigate(prev != null ? prev : '');
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
        <div class="not-found-fish"><i class="fas fa-fish fs-1 text-muted opacity-50"></i></div>
        <h1>404</h1>
        <h2>${t("common.pageNotFound")}</h2>
        <p>${t("common.pageNotFoundDesc")}</p>
        <div class="search-bar mx-auto mt-4" class="justify-content-center" style="max-width:380px">
          <input type="text" id="notFoundSearch" class="form-input" placeholder="${t('products.search')}" style="max-width:240px">
          <button class="btn btn-primary" id="notFoundSearchBtn"><i class="fas fa-search"></i> ${t('common.search')}</button>
        </div>
        <div class="d-flex gap-2 justify-content-center flex-wrap mt-2">
          <a href="#/" class="btn btn-primary btn-lg"><i class="fas fa-home"></i> ${t("common.goHome")}</a>
          <a href="#/products" class="btn btn-outline btn-lg"><i class="fas fa-store"></i> ${t("nav.products")}</a>
          <a href="#/auctions" class="btn btn-outline btn-lg"><i class="fas fa-gavel"></i> ${t("nav.auctions")}</a>
        </div>
      </div>`;
    observeAnimations();
    setTimeout(() => {
      const si = document.getElementById('notFoundSearch');
      const sb = document.getElementById('notFoundSearchBtn');
      if (si && sb) {
        const go = () => { const q = si.value.trim(); if (q) window.location.hash = `#/products?search=${  encodeURIComponent(q)}`; };
        sb.addEventListener('click', go);
        si.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      }
    }, 0);
    return;
  }

  // Close mobile drawer
  closeDrawer();

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
  pushRouteHistory(route);

  const btt = document.getElementById("backToTop");
  if (btt) btt.classList.remove("visible");

  app.style.opacity = "0";
  app.style.transform = "scale(0.97) translateY(10px)";
  app.style.transition = "opacity 0.25s ease, transform 0.25s ease";

  showLoading(app, "page");
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Set aria-current="page" on nav links
  const cleanPath = route.split('?')[0];
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    const isMatch = href === `#/${cleanPath}` || (cleanPath === '' && href === '#/');
    link.setAttribute('aria-current', isMatch ? 'page' : 'false');
  });

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
    document.title = `${titleKey ? t(titleKey) : "Sayiad"  } — Sayiad`;

    app.setAttribute("tabindex", "-1");
    app.focus({ preventScroll: true });
    app.removeAttribute("tabindex");

    const live = document.getElementById("ariaLive");
    if (live) live.textContent = `Navigated to ${document.title}`;

    requestAnimationFrame(() => {
      app.style.transition = "opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
      app.style.opacity = "1";
      app.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      app.style.transition = "";
      app.style.opacity = "";
      app.style.transform = "";
    }, 400);
  }, 200);
}

window.addEventListener("hashchange", () => router());
router();
