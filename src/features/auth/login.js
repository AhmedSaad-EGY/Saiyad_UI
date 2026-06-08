import { api, setAccessToken, clearTokens } from '../../shared/api/client.js';
import { emit } from '../../app/events.js';
import { clearCsrfToken } from '../../shared/utils/csrf.js';
import { animate } from '../../shared/utils/dom.js';
import { showToast } from '../../widgets/ui/toast.js';
import { t } from '../../app/i18n.js';
import { updateNavbar, startNotifPolling, stopNotifPolling } from '../../widgets/layout/navbar.js';
import Alpine from 'alpinejs';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('sayiad_user'));
  } catch { return null; }
}

export function isAuthenticated() {
  return !!localStorage.getItem('sayiad_accessToken');
}

export function getRoleFromToken() {
  const token = localStorage.getItem('sayiad_accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      || payload.role || payload.roles;
    return Array.isArray(role) ? role[0] : role;
  } catch { return null; }
}

export function hasRole(role) {
  const user = getUser();
  return (user && user.role === role) || getRoleFromToken() === role;
}

export function hasAnyRole(...roles) {
  return roles.some(r => hasRole(r));
}

export async function requireAuth() {
  if (isAuthenticated()) return true;
  window.location.hash = '#/login';
  return false;
}

export async function logout() {
  try { await api.post('/auth/logout'); } catch { /* silent */ }
  clearTokens();
  clearCsrfToken();
  stopNotifPolling();
  updateNavbar();
  document.documentElement.removeAttribute('data-user-role');
  document.documentElement.removeAttribute('data-vip');
  emit('auth:logged-out');
  window.location.hash = '#/';
}

export async function syncVipAttribute() {
  try {
    const data = await api.get('/subscriptions/my').catch(() => null);
    if (data && (data.isActive || data.status === 'Active')) {
      document.documentElement.setAttribute('data-vip', 'true');
    } else {
      document.documentElement.removeAttribute('data-vip');
    }
  } catch { document.documentElement.removeAttribute('data-vip'); }
}

Alpine.data('loginForm', () => ({
  email: '',
  password: '',
  loading: false,
  error: '',
  showPassword: false,
  unverifiedEmail: '',
  togglePw() { this.showPassword = !this.showPassword; },
  clearError() { this.error = ''; },
  async submit() {
    this.loading = true; this.error = '';
    try {
      const data = await api.post('/auth/login', { email: this.email, password: this.password });
      setAccessToken(data.accessToken);
      if (data.refreshToken) localStorage.setItem('sayiad_refreshToken', data.refreshToken);
      if (data.user) localStorage.setItem('sayiad_user', JSON.stringify(data.user));
      updateNavbar();
      syncVipAttribute().catch(() => {});
      const redirect = new URLSearchParams(window.location.hash.split('?')[1] || '').get('redirect') || '';
      window.location.hash = redirect ? `#/${redirect}` : '#/';
    } catch (err) {
      if (err.message && err.message.includes('verify')) {
        this.unverifiedEmail = this.email;
      }
      this.error = err.message || t('auth.loginError');
    } finally { this.loading = false; }
  },
  async resendVerification() {
    if (!this.unverifiedEmail) return;
    try {
      await api.post('/auth/resend-verification', { email: this.unverifiedEmail });
      showToast(t('auth.verificationSent'), 'success');
      this.unverifiedEmail = '';
    } catch (err) { showToast(err.message, 'error'); }
  },
}));
