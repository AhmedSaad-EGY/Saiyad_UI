function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function isAuthenticated() {
  return !!localStorage.getItem("accessToken");
}

function _extractClaim(val) {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && val.length > 0) return String(val[0]);
  return null;
}

function getRoleFromToken() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return _extractClaim(payload.role)
      || _extractClaim(payload.roles)
      || _extractClaim(payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'])
      || _extractClaim(payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/roles'])
      || _extractClaim(payload.Role)
      || null;
  } catch {
    return null;
  }
}

function hasRole(role) {
  const tokenRole = getRoleFromToken();
  if (tokenRole && tokenRole === role) return true;
  const user = getUser();
  return user && user.role === role;
}

function hasAnyRole(...roles) {
  const roleList = Array.isArray(roles[0]) ? roles[0] : roles;
  const tokenRole = getRoleFromToken();
  if (tokenRole && roleList.includes(tokenRole)) return true;
  const user = getUser();
  return !!user && roleList.includes(user.role);
}

let notifPollInterval = null;

function updateNavbar() {
  const authed = isAuthenticated();
  const user = getUser();
  document.getElementById("loginBtn").classList.toggle("hidden", authed);
  document.getElementById("registerBtn").classList.toggle("hidden", authed);
  document.getElementById("userMenu").classList.toggle("hidden", !authed);
  if (user)
    document.getElementById("userName").textContent =
      user.fullName || user.email || "User";
  document.getElementById("notifBell")?.classList.toggle("hidden", !authed);
  document
    .getElementById("userDropdown")
    ?.setAttribute("aria-haspopup", "true");
  document
    .getElementById("userDropdown")
    ?.setAttribute("aria-expanded", "false");

  // Role-based dropdown filtering
  document
    .querySelectorAll("#dropdownMenu .dropdown-item[data-roles]")
    .forEach((item) => {
      const allowed = item.dataset.roles;
      if (allowed === "all") {
        item.classList.toggle("hidden", !authed);
      } else {
        const roles = allowed.split(",");
        item.classList.toggle("hidden", !authed || !roles.includes(user?.role));
      }
    });

  updateCartBadge(false);
  if (authed) startNotifPolling();
  else stopNotifPolling();
}

let _cartCount = null;

function invalidateCartCache() {
  _cartCount = null;
}

function setCachedCartCount(n) {
  _cartCount = n;
}

async function updateCartBadge(forceRefresh = false) {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  if (!isAuthenticated()) {
    badge.classList.add("hidden");
    _cartCount = null;
    return;
  }
  if (!forceRefresh && _cartCount !== null) {
    badge.textContent = _cartCount;
    badge.classList.toggle("hidden", _cartCount === 0);
    return;
  }
  try {
    const cart = await api.get("/cart");
    const items = cart.items || [];
    const count = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    _cartCount = count;
    badge.textContent = count;
    badge.classList.toggle("hidden", count === 0);
  } catch {
    badge.classList.add("hidden");
  }
}
document.addEventListener("cart-updated", () => {
  invalidateCartCache();
  updateCartBadge(true);
});

async function updateNotifBadge() {
  const badge = document.getElementById("notifBadge");
  if (!isAuthenticated()) {
    badge?.classList.add("hidden");
    return;
  }
  try {
    const data = await api.get("/notifications/unread-count");
    const count = data.unreadCount ?? data.count ?? 0;
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove("hidden");
    } else badge?.classList.add("hidden");
  } catch {
    badge?.classList.add("hidden");
  }
}

function startNotifPolling() {
  stopNotifPolling();
  updateNotifBadge();
  notifPollInterval = setInterval(updateNotifBadge, 60000);
}

function stopNotifPolling() {
  if (notifPollInterval) {
    clearInterval(notifPollInterval);
    notifPollInterval = null;
  }
  const badge = document.getElementById("notifBadge");
  if (badge) badge.classList.add("hidden");
}

async function logout() {
  stopNotifPolling();
  try {
    await api.post("/auth/logout", {});
  } catch {
    /* proceed with local logout */
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  updateNavbar();
  navigate("");
}

async function requireAuth() {
  if (!isAuthenticated()) {
    navigate("login");
    return false;
  }
  return true;
}
