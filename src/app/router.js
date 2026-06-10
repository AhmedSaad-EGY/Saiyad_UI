import { isAuthenticated } from '../features/auth/login.js';
import { updateNavbar } from './navbar.js';
import { closeDrawer } from '../widgets/layout/navbar.js';
import { t } from "../shared/utils/i18n.js";
import { showLoading, observeAnimations } from '../shared/utils/dom.js';
import { showErrorFallback } from '../shared/utils/errors.js';
import { runRouteCleanups, registerRouteCleanup } from "../shared/utils/events.js";
import { routes } from "./route-map.js";
import {
  routeGuards,
  routeTitleKeys,
} from "../shared/constants/routes.js";

// Re-export for backward compat — pages import registerRouteCleanup from router
export { registerRouteCleanup };

let currentRouteKey = null;
let currentParams = {};
const _routeHistory = [];
const MAX_HISTORY = 50;
let _initialLoad = true;

let _navTimer = null;

export function navigate(path) {
  window.location.hash = `#/${path}`;
}

export function pushRouteHistory(route) {
  if (_initialLoad) {
    _initialLoad = false;
    _routeHistory.push(route || "");
    return;
  }
  const last = _routeHistory[_routeHistory.length - 1];
  if (last === route) return;
  _routeHistory.push(route || "");
  if (_routeHistory.length > MAX_HISTORY) _routeHistory.shift();
}

export function goBack() {
  if (_routeHistory.length < 2) {
    navigate("");
    return;
  }
  _routeHistory.pop(); // remove current
  const prev = _routeHistory.pop(); // get previous
  navigate(prev != null ? prev : "");
}

function getRoute() {
  const hash = window.location.hash.replace("#/", "");
  const parts = hash.split("?");
  const route = parts[0];
  const params = Object.fromEntries(new URLSearchParams(parts[1] || ""));
  return { route: route || "", params };
}

export async function router(force = false) {
  // Hide global skeleton and error on any route change
  const _sk = document.getElementById("globalSkeleton");
  const _ge = document.getElementById("globalError");
  if (_sk) _sk.classList.add("hidden");
  if (_ge) _ge.classList.add("hidden");

  const { route, params } = getRoute();
  const app = document.getElementById("app");

  const routeKey = route.includes("/") ? route.split("/")[0] : route;

  // Enforce route guards
  const guard = routeGuards[routeKey];
  if (guard) {
    if (!guard()) {
      window.location.hash = isAuthenticated() ? "#/" : "#/login";
      return;
    }
  }

  const dynamicImport = routes[routeKey];
  if (!dynamicImport) {
    app.style.opacity = "1";
    app.style.transform = "translateY(0)";
    app.style.transition = "";

    const page = document.createElement("div");
    page.className = "not-found-page animate-on-scroll";

    const fish = document.createElement("div");
    fish.className = "not-found-fish";
    const fishI = document.createElement("i");
    fishI.className = "fas fa-fish fs-1 text-muted opacity-50";
    fish.appendChild(fishI);
    page.appendChild(fish);

    const h1 = document.createElement("h1");
    h1.textContent = "404";
    page.appendChild(h1);

    const h2 = document.createElement("h2");
    h2.textContent = t("common.pageNotFound");
    page.appendChild(h2);

    const p = document.createElement("p");
    p.textContent = t("common.pageNotFoundDesc");
    page.appendChild(p);

    const searchBar = document.createElement("div");
    searchBar.className = "search-bar mx-auto mt-4 justify-content-center";
    searchBar.style.maxWidth = "380px";

    const si = document.createElement("input");
    si.type = "text";
    si.id = "notFoundSearch";
    si.className = "form-input";
    si.placeholder = t("products.search");
    si.style.maxWidth = "240px";
    searchBar.appendChild(si);

    const sb = document.createElement("button");
    sb.id = "notFoundSearchBtn";
    sb.className = "btn btn-primary";
    const sbIcon = document.createElement("i");
    sbIcon.className = "fas fa-search";
    sb.appendChild(sbIcon);
    sb.appendChild(document.createTextNode(` ${t("common.search")}`));
    searchBar.appendChild(sb);
    page.appendChild(searchBar);

    const links = document.createElement("div");
    links.className = "d-flex gap-2 justify-content-center flex-wrap mt-2";

    const homeLink = document.createElement("a");
    homeLink.href = "#/";
    homeLink.className = "btn btn-primary btn-lg";
    const homeIcon = document.createElement("i");
    homeIcon.className = "fas fa-home";
    homeLink.appendChild(homeIcon);
    homeLink.appendChild(document.createTextNode(` ${t("common.goHome")}`));
    links.appendChild(homeLink);

    const prodLink = document.createElement("a");
    prodLink.href = "#/products";
    prodLink.className = "btn btn-outline btn-lg";
    const prodIcon = document.createElement("i");
    prodIcon.className = "fas fa-store";
    prodLink.appendChild(prodIcon);
    prodLink.appendChild(document.createTextNode(` ${t("nav.products")}`));
    links.appendChild(prodLink);

    const auctLink = document.createElement("a");
    auctLink.href = "#/auctions";
    auctLink.className = "btn btn-outline btn-lg";
    const auctIcon = document.createElement("i");
    auctIcon.className = "fas fa-gavel";
    auctLink.appendChild(auctIcon);
    auctLink.appendChild(document.createTextNode(` ${t("nav.auctions")}`));
    links.appendChild(auctLink);

    page.appendChild(links);

    app.textContent = "";
    app.appendChild(page);
    observeAnimations();
    if (si && sb) {
        const go = () => {
          const q = si.value.trim();
          if (q)
            window.location.hash = `#/products?search=${encodeURIComponent(q)}`;
        };
        sb.addEventListener("click", go);
        si.addEventListener("keydown", (e) => {
          if (e.key === "Enter") go();
        });
      }
    return;
  }

  // Close mobile drawer
  closeDrawer();

  // Move focus to main content immediately (override hamburger focus from closeDrawer)
  app.setAttribute("tabindex", "-1");
  app.focus({ preventScroll: true });
  app.removeAttribute("tabindex");

  // Cleanup previous route resources
  runRouteCleanups();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

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

  // Set aria-current="page" on nav links
  const cleanPath = route.split("?")[0];
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    const isMatch =
      href === `#/${cleanPath}` || (cleanPath === "" && href === "#/");
    link.setAttribute("aria-current", isMatch ? "page" : "false");
  });
  // Sync bottom nav
  document.querySelectorAll(".bottom-nav-item").forEach((link) => {
    const href = link.getAttribute("href");
    const isMatch =
      href === `#/${cleanPath}` || (cleanPath === "" && href === "#/");
    link.setAttribute("aria-current", isMatch ? "page" : "false");
    link.classList.toggle("active", isMatch);
  });
  if (_navTimer) clearTimeout(_navTimer);
  _navTimer = setTimeout(async () => {
    try {
      _navTimer = null;
      const { route: curRoute } = getRoute();
      if (
        routeKey !== (curRoute.includes("/") ? curRoute.split("/")[0] : curRoute)
      )
        return;
      const fullPath = route;
      const pageModule = await dynamicImport();
      await pageModule.default(app, fullPath, params);
    } catch (err) {
      showErrorFallback(app, err.message);
      return;
    }
    updateNavbar();

    const titleKey = routeTitleKeys[routeKey];
    document.title = `${titleKey ? t(titleKey) : "Sayiad"} — Sayiad`;

    app.setAttribute("tabindex", "-1");
    app.focus({ preventScroll: true });
    app.removeAttribute("tabindex");

    const live = document.getElementById("ariaLive");
    if (live) live.textContent = `Navigated to ${document.title}`;

    requestAnimationFrame(() => {
      app.style.transition =
        "opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
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

window.addEventListener("hashchange", () => { router().catch(() => {}); });
router().catch(() => {});
