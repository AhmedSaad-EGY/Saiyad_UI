import { api } from '../api/client.js';
import { on, emit } from '../events/bus.js';
import { extractClaim } from '../../shared/helpers/index.js';
import { ECOMMERCE_ROLES } from '../../shared/constants/roles.js';
import { clearCsrfToken } from '../utils/csrf.js';
import { animate } from '../utils/dom.js';
import { showToast } from '../utils/ui.js';
import { t } from '../i18n/index.js';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem("accessToken");
}

export function getRoleFromToken() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return extractClaim(payload.role)
      || extractClaim(payload.roles)
      || extractClaim(payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'])
      || extractClaim(payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/roles'])
      || extractClaim(payload.Role)
      || null;
  } catch {
    return null;
  }
}

export function hasRole(role) {
  const tokenRole = getRoleFromToken();
  if (tokenRole && tokenRole === role) return true;
  const user = getUser();
  return user && user.role === role;
}

export function hasAnyRole(...roles) {
  const roleList = Array.isArray(roles[0]) ? roles[0] : roles;
  const tokenRole = getRoleFromToken();
  if (tokenRole && roleList.includes(tokenRole)) return true;
  const user = getUser();
  return !!user && roleList.includes(user.role);
}

let notifPollInterval = null;

export function updateNavbar() {
  const authed = isAuthenticated();
  const user = getUser();
  document.getElementById("loginBtn").classList.toggle("d-none", authed);
  document.getElementById("registerBtn").classList.toggle("d-none", authed);
  document.getElementById("userMenu").classList.toggle("d-none", !authed);
  if (user)
    document.getElementById("userName").textContent =
      user.fullName || user.email || "User";
  document.getElementById("notifBell")?.classList.toggle("d-none", !authed);
  document
    .getElementById("userDropdown")
    ?.setAttribute("aria-haspopup", "true");
  document
    .getElementById("userDropdown")
    ?.setAttribute("aria-expanded", "false");

  document
    .querySelectorAll("#dropdownMenu .dropdown-item[data-roles]")
    .forEach((item) => {
      const allowed = item.dataset.roles;
      if (allowed === "all") {
        item.classList.toggle("d-none", !authed);
      } else {
        const roles = allowed.split(",");
        item.classList.toggle("d-none", !authed || !roles.includes(user?.role));
      }
    });

  updateCartBadge(false);
  // Show/hide bottom nav account vs login link
  const bnAccount = document.getElementById("bnAccount");
  const bnLogin = document.getElementById("bnLogin");
  const bnCart = document.querySelector("#bnCart");
  const isEcom = authed && hasAnyRole(ECOMMERCE_ROLES);
  if (bnAccount) bnAccount.classList.toggle("d-none", !authed);
  if (bnLogin) bnLogin.classList.toggle("d-none", authed);
  if (bnCart) bnCart.classList.toggle("d-none", !isEcom);
  // Hide desktop cart link for non-ecommerce roles
  const cartLink = document.querySelector(".cart-nav-link");
  if (cartLink) cartLink.classList.toggle("d-none", !isEcom);
  // Hide footer shipping link for non-ecommerce roles
  const footerShipping = document.querySelector('.footer-link[href="#/shipping"]');
  if (footerShipping) footerShipping.classList.toggle("d-none", !isEcom);
  if (authed) startNotifPolling();
  else stopNotifPolling();
}

let _cartCount = null;

export function invalidateCartCache() {
  _cartCount = null;
}

export function setCachedCartCount(n) {
  _cartCount = n;
}

export function getCartItemCount(items = []) {
  return items.reduce((sum, i) => sum + (parseInt(i.quantity, 10) || 1), 0);
}

export function syncCartBadgeCount(count) {
  const badge = document.getElementById("cartBadge");
  _cartCount = Math.max(0, parseInt(count, 10) || 0);
  if (!badge) return;
  badge.textContent = _cartCount;
  badge.classList.toggle("d-none", _cartCount === 0 || !isAuthenticated());
  if (_cartCount > 0) animate(badge, 'bounceIn', { duration: '0.35s' });
  const bnBadge = document.getElementById("bnCartBadge");
  if (bnBadge) {
    bnBadge.textContent = _cartCount;
    bnBadge.classList.toggle("d-none", _cartCount === 0 || !isAuthenticated());
  }
}

export async function updateCartBadge(forceRefresh = true) {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  if (!isAuthenticated()) {
    badge.classList.add("d-none");
    _cartCount = null;
    return;
  }
  if (!forceRefresh && _cartCount !== null) {
    badge.textContent = _cartCount;
    badge.classList.toggle("d-none", _cartCount === 0);
    return;
  }
  if (!hasAnyRole(ECOMMERCE_ROLES)) { badge.classList.add("d-none"); _cartCount = null; return; }
  try {
    const cart = await api.get("/cart");
    syncCartBadgeCount(getCartItemCount(cart.items || []));
  } catch {
    badge.classList.add("d-none");
  }
}

document.addEventListener("cart-updated", () => {
  invalidateCartCache();
  updateCartBadge(true);
});

export async function updateNotifBadge() {
  const badge = document.getElementById("notifBadge");
  if (!isAuthenticated()) {
    stopNotifPolling();
    return;
  }
  try {
    const data = await api.get("/Notifications/unread-count");
    const count = getUnreadNotificationCount(data);
    if (count > 0) {
  badge.textContent = count;
  badge.classList.remove("d-none");
  if (count > 0) animate(badge, 'bounceIn', { duration: '0.35s' });
} else    badge?.classList.add("d-none");
  } catch {
    if (!isAuthenticated()) stopNotifPolling();
    else    badge?.classList.add("d-none");
  }
}

export function getUnreadNotificationCount(data) {
  if (typeof data === "number") return data;
  return data?.unreadCount ?? data?.count ?? data?.data?.unreadCount ?? data?.data?.count ?? 0;
}

export function syncNotifBadgeCount(count) {
  const badge = document.getElementById("notifBadge");
  const safeCount = Math.max(0, parseInt(count, 10) || 0);
  if (!badge || !isAuthenticated()) return;
  badge.textContent = safeCount;
  badge.classList.toggle("d-none", safeCount === 0);
}

export function startNotifPolling() {
  stopNotifPolling();
  updateNotifBadge();
  notifPollInterval = setInterval(updateNotifBadge, 60000);
}

export function stopNotifPolling() {
  if (notifPollInterval) {
    clearInterval(notifPollInterval);
    notifPollInterval = null;
  }
  const badge = document.getElementById("notifBadge");
  if (badge) badge.classList.add("d-none");
}

export async function logout() {
  stopNotifPolling();
  try {
    await api.post("/auth/logout", {});
  } catch {
    /* proceed with local logout */
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  clearCsrfToken();
  updateNavbar();
  showToast(t("auth.loggedOut"), "success");
  document.documentElement.removeAttribute('data-vip');
  emit('auth:logged-out');
}

export async function syncVipAttribute() {
  if (!isAuthenticated()) {
    document.documentElement.removeAttribute('data-vip');
    return;
  }
  const data = await api.get('/subscriptions/my').catch(() => null);
  const sub = data?.data ?? data;
  if (sub?.isActive && (sub.tier === 'Premium' || sub.tier === 'Professional')) {
    document.documentElement.setAttribute('data-vip', '');
  } else {
    document.documentElement.removeAttribute('data-vip');
  }
}

export async function requireAuth() {
  if (!isAuthenticated()) {
    navigateToLogin();
    return false;
  }
  return true;
}

function navigateToLogin() {
  window.location.hash = '#/login';
}

// Listen for session expired events from api/client
on('auth:session-expired', () => {
  updateNavbar();
  document.documentElement.removeAttribute('data-vip');
  navigateToLogin();
});
