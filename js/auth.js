function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}

function hasRole(role) {
  const user = getUser();
  return user && user.role === role;
}

function hasAnyRole(...roles) {
  const user = getUser();
  return user && roles.includes(user.role);
}

let notifPollInterval = null;

function updateNavbar() {
  const authed = isAuthenticated();
  const user = getUser();
  document.getElementById('loginBtn').classList.toggle('hidden', authed);
  document.getElementById('registerBtn').classList.toggle('hidden', authed);
  document.getElementById('userMenu').classList.toggle('hidden', !authed);
  if (user) document.getElementById('userName').textContent = user.fullName || user.email || 'User';
  document.getElementById('notifBell')?.classList.toggle('hidden', !authed);
  if (authed) startNotifPolling();
  else stopNotifPolling();
}

async function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if (!isAuthenticated()) { badge?.classList.add('hidden'); return; }
  try {
    const data = await api.get('/notifications/unread-count');
    const count = data.unreadCount ?? data.count ?? 0;
    if (count > 0) { badge.textContent = count; badge.classList.remove('hidden'); }
    else badge?.classList.add('hidden');
  } catch { badge?.classList.add('hidden'); }
}

function startNotifPolling() {
  stopNotifPolling();
  updateNotifBadge();
  notifPollInterval = setInterval(updateNotifBadge, 60000);
}

function stopNotifPolling() {
  if (notifPollInterval) { clearInterval(notifPollInterval); notifPollInterval = null; }
  const badge = document.getElementById('notifBadge');
  if (badge) badge.classList.add('hidden');
}

async function logout() {
  stopNotifPolling();
  try { await api.post('/auth/logout', {}); } catch { /* proceed with local logout */ }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  updateNavbar();
  navigate('');
}

async function requireAuth() {
  if (!isAuthenticated()) {
    navigate('login');
    return false;
  }
  return true;
}
