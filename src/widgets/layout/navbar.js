import { emit } from '../../shared/utils/events.js';
import { createSwipeGesture } from '../../shared/utils/swipe.js';
import { syncCartBadgeCount } from '../../shared/utils/ui.js';

let _drawerSwipe = null;
let _fetchCartCount = async () => 0;
let _fetchUnreadCount = async () => 0;
const _focusableSel = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
      const closing = isRtl ? distance < 0 : distance > 0;
      if (!closing) return;
      const clamped = Math.min(Math.abs(distance), drawer.offsetWidth * 0.5);
      drawer.style.transition = "none";
      drawer.style.transform = `translateX(${clamped}px)`;
    },
    onSwipeEnd({ distance }) {
      if (!drawer.classList.contains("open")) return;
      drawer.style.transition = "";
      const isRtl = document.dir === "rtl";
      if (!(isRtl ? distance < 0 : distance > 0)) { drawer.style.transform = ""; return; }
      drawer.style.transform = "";
      if (Math.abs(distance) >= 80) closeDrawer();
    },
  });
}

export function openDrawer() {
  const drawer = document.getElementById("navDrawer");
  const navOverlay = document.getElementById("navOverlay");
  if (!drawer) return;
  drawer.offsetHeight;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  if (navOverlay) { navOverlay.classList.add("open"); navOverlay.removeAttribute("inert"); }
  document.body.classList.add("nav-open");
  const btn = document.getElementById("hamburger");
  if (btn) btn.setAttribute("aria-expanded", "true");
  const firstFocusable = drawer.querySelector(_focusableSel);
  firstFocusable?.focus();
  document.addEventListener("keydown", _trapFocus);
  _initDrawerSwipe();
}

export function closeDrawer() {
  const drawer = document.getElementById("navDrawer");
  const navOverlay = document.getElementById("navOverlay");
  if (drawer) {
    drawer.style.transition = ""; drawer.style.transform = "";
    drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
  }
  if (navOverlay) { navOverlay.classList.remove("open"); navOverlay.setAttribute("inert", ""); }
  document.body.classList.remove("nav-open");
  document.removeEventListener("keydown", _trapFocus);
  if (_drawerSwipe) { _drawerSwipe.destroy(); _drawerSwipe = null; }
  const btn = document.getElementById("hamburger");
  if (btn) btn.setAttribute("aria-expanded", "false");
  btn?.focus();
}

const _navIconMap = {
  '': 'fa-home', dashboard: 'fa-chart-bar', products: 'fa-store',
  'product-detail': 'fa-box-open', auctions: 'fa-gavel', 'auction-detail': 'fa-gavel',
  cart: 'fa-shopping-cart', checkout: 'fa-credit-card', profile: 'fa-user',
  'seller-profile': 'fa-store-alt', wallet: 'fa-wallet', subscriptions: 'fa-crown',
  'order-detail': 'fa-receipt', shipping: 'fa-truck', admin: 'fa-shield-alt',
  login: 'fa-sign-in-alt', register: 'fa-user-plus', 'forgot-password': 'fa-key',
  'reset-password': 'fa-key', 'verify-email': 'fa-envelope', terms: 'fa-file-contract',
  privacy: 'fa-shield-alt', 'auction-requests': 'fa-paper-plane',
  'auction-requests-review': 'fa-clipboard-check', 'auctioneer-analytics': 'fa-chart-line',
};

let _cartCount = 0;

export function invalidateCartCache() { _cartCount = 0; }
export function setCachedCartCount(n) { _cartCount = n; }
export async function updateCartBadge(forceRefresh) {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  if (!forceRefresh && _cartCount > 0) { syncCartBadgeCount(_cartCount); return; }
  const count = await _fetchCartCount();
  _cartCount = count;
  syncCartBadgeCount(count);
}

export async function updateNotifBadge() {
  const count = await _fetchUnreadCount();
  syncNotifBadgeCount(count);
  emit('notifications:updated', { count });
}

export function syncNotifBadgeCount(count) {
  const badge = document.getElementById("notifBadge");
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
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
