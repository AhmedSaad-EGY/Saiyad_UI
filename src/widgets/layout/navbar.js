import { emit } from '../../shared/utils/events.js';
import { createSwipeGesture } from '../../shared/utils/swipe.js';
import { syncCartBadgeCount, syncNotifBadgeCount } from '../../shared/utils/ui.js';
import { getUser } from '../../shared/utils/auth-state.js';
import { ROLES } from '../../shared/constants/roles.js';

let _drawerSwipe = null;
let _fetchCartCount = async () => 0;
let _fetchUnreadCount = async () => 0;
const _focusableSel = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
export const NAV_DRAWER_BREAKPOINT = 1024;

function _isMobileDrawerViewport() {
  return window.innerWidth < NAV_DRAWER_BREAKPOINT;
}

function _syncDrawerA11y(drawer, isOpen = drawer?.classList.contains("open")) {
  if (!drawer) return;
  const accessible = _isMobileDrawerViewport() && isOpen;
  drawer.setAttribute("aria-hidden", accessible ? "false" : "true");
  if (accessible) drawer.removeAttribute("inert");
  else drawer.setAttribute("inert", "");
}

function _setBackgroundInert(inert) {
  document.querySelectorAll('[data-drawer-background]').forEach((element) => {
    if (inert) {
      if (!element.hasAttribute('inert')) {
        element.setAttribute('inert', '');
        element.dataset.drawerInerted = 'true';
      }
      return;
    }
    if (element.dataset.drawerInerted === 'true') {
      element.removeAttribute('inert');
      delete element.dataset.drawerInerted;
    }
  });
}

export function syncDrawerA11y() {
  const drawer = document.getElementById("navDrawer");
  if (!_isMobileDrawerViewport() && (
    drawer?.classList.contains('open') || document.body.classList.contains('nav-open')
  )) {
    closeDrawer({ restoreTriggerFocus: false });
    return;
  }
  _syncDrawerA11y(drawer);
}

export function setNavbarDeps(deps) {
  if (deps.fetchCartCount) _fetchCartCount = deps.fetchCartCount;
  if (deps.fetchUnreadCount) _fetchUnreadCount = deps.fetchUnreadCount;
}

function _getFocusable(el) {
  return [...el.querySelectorAll(_focusableSel)].filter(f => f.offsetParent !== null && !f.disabled);
}

function _trapFocus(e) {
  const drawer = document.getElementById("navDrawer");
  if (!drawer?.classList.contains("open") || e.key !== "Tab") return;
  const focusable = _getFocusable(drawer);
  if (!focusable.length) { e.preventDefault(); return; }
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function _initDrawerSwipe() {
  if (_drawerSwipe) _drawerSwipe.destroy();
  const drawer = document.getElementById("navDrawer");
  if (!drawer) return;
  _drawerSwipe = createSwipeGesture({
    el: drawer, threshold: 10,
    onSwipeMove({ distance }) {
      if (!drawer.classList.contains("open")) return;
      const isRtl = document.dir === "rtl";
      const closing = isRtl ? distance > 0 : distance < 0;
      if (!closing) return;
      const clamped = Math.min(Math.abs(distance), drawer.offsetWidth * 0.5);
      drawer.style.transition = "none";
      drawer.style.transform = `translateX(${isRtl ? clamped : -clamped}px)`;
    },
    onSwipeEnd({ distance }) {
      if (!drawer.classList.contains("open")) return;
      drawer.style.transition = "";
      const isRtl = document.dir === "rtl";
      if (!(isRtl ? distance > 0 : distance < 0)) { drawer.style.transform = ""; return; }
      drawer.style.transform = "";
      if (Math.abs(distance) >= 80) closeDrawer();
    },
  });
}

export function openDrawer() {
  if (!_isMobileDrawerViewport()) return;
  const drawer = document.getElementById("navDrawer");
  const navOverlay = document.getElementById("navOverlay");
  const drawerBody = document.querySelector(".nav-drawer__body");
  if (!drawer) return;
  drawer.offsetHeight;
  drawer.classList.add("open");
  _syncDrawerA11y(drawer, true);
  drawerBody?.scrollTo({ top: 0 });
  if (navOverlay) {
    navOverlay.classList.add("open");
    navOverlay.removeAttribute("inert");
    navOverlay.setAttribute("aria-hidden", "false");
  }
  document.body.classList.add("nav-open");
  _setBackgroundInert(true);
  const btn = document.getElementById("hamburger");
  if (btn) btn.setAttribute("aria-expanded", "true");
  const initialFocus = drawer.querySelector("#drawerCloseBtn") || drawer.querySelector(_focusableSel);
  initialFocus?.focus();
  document.addEventListener("keydown", _trapFocus);
  _initDrawerSwipe();
}

export function closeDrawer(options = {}) {
  const { restoreTriggerFocus = true } = options;
  const drawer = document.getElementById("navDrawer");
  const navOverlay = document.getElementById("navOverlay");
  const wasOpen = drawer?.classList.contains("open") ?? false;
  if (drawer) {
    drawer.style.transition = ""; drawer.style.transform = "";
    drawer.classList.remove("open");
    _syncDrawerA11y(drawer, false);
  }
  if (navOverlay) {
    navOverlay.classList.remove("open");
    navOverlay.setAttribute("inert", "");
    navOverlay.setAttribute("aria-hidden", "true");
  }
  document.body.classList.remove("nav-open");
  _setBackgroundInert(false);
  document.removeEventListener("keydown", _trapFocus);
  if (_drawerSwipe) { _drawerSwipe.destroy(); _drawerSwipe = null; }
  const btn = document.getElementById("hamburger");
  if (btn) btn.setAttribute("aria-expanded", "false");
  if (wasOpen && restoreTriggerFocus && _isMobileDrawerViewport()) btn?.focus();
}

const _cartCache = { count: 0 };

export function invalidateCartCache() { _cartCache.count = 0; }
export function setCachedCartCount(n) { _cartCache.count = n; }
export async function updateCartBadge(forceRefresh) {
  if (!document.querySelector('[data-cart-badge]')) return;
  const user = getUser();
  const userId = user?.id ?? null;
  if (user?.role === ROLES.ADMIN) { syncCartBadgeCount(0); _cartCache.count = 0; return; }
  if (!forceRefresh && _cartCache.count > 0) { syncCartBadgeCount(_cartCache.count); return; }
  const count = await _fetchCartCount();
  const latestUser = getUser();
  if ((latestUser?.id ?? null) !== userId || latestUser?.role === ROLES.ADMIN) return;
  setCachedCartCount(count);
  syncCartBadgeCount(count);
}

export async function updateNotifBadge() {
  const count = await _fetchUnreadCount();
  syncNotifBadgeCount(count);
  emit('notifications:updated', { count });
}

let notifPollInterval = null;

export function startNotifPolling() {
  if (notifPollInterval) return;
  updateNotifBadge();
  notifPollInterval = setInterval(updateNotifBadge, 60000);
}

export function stopNotifPolling() {
  if (notifPollInterval) { clearInterval(notifPollInterval); notifPollInterval = null; }
  syncNotifBadgeCount(0);
}

syncDrawerA11y();
