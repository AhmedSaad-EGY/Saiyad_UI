import { api } from '../api/client.js';
import { on, emit } from '../events/bus.js';
import { extractClaim } from '../../shared/helpers/index.js';
import { clearCsrfToken } from '../utils/csrf.js';

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

export async function updateCartBadge(forceRefresh = false) {
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
  try {
    const cart = await api.get("/cart");
    const items = cart.items || [];
    const count = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    _cartCount = count;
    badge.textContent = count;
    badge.classList.toggle("d-none", count === 0);
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
    const data = await api.get("/notifications/unread-count");
    const count = data.unreadCount ?? data.count ?? 0;
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove("d-none");
    } else    badge?.classList.add("d-none");
  } catch {
    if (!isAuthenticated()) stopNotifPolling();
    else    badge?.classList.add("d-none");
  }
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
  emit('auth:logged-out');
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
  navigateToLogin();
});
