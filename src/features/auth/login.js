import { api, setAccessToken, clearTokens } from '../../shared/api/client.js';
import { emit } from '../../shared/utils/events.js';
import { clearCsrfToken } from '../../shared/utils/csrf.js';
import { showToast } from '../../shared/utils/ui.js';
import { t } from '../../shared/utils/i18n.js';
import { isAuthenticated } from '../../shared/utils/auth-state.js';
import { routes } from '../../app/route-map.js';
import { KEYS } from '../../shared/constants/storage-keys.js';
import Alpine from 'alpinejs';
export { getUser, isAuthenticated, getRoleFromToken, hasRole, hasAnyRole } from '../../shared/utils/auth-state.js';

export async function requireAuth() {
  if (isAuthenticated()) return true;
  window.location.hash = '#/login';
  return false;
}

export async function logout() {
  try { await api.post('/auth/logout'); } catch { /* silent */ }
  clearTokens();
  clearCsrfToken();
  emit('notifications:stop-polling');
  emit('auth:changed');
  document.documentElement.removeAttribute('data-user-role');
  document.documentElement.removeAttribute('data-vip');
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
      if (data.user) localStorage.setItem(KEYS.USER, JSON.stringify(data.user));
      emit('auth:changed');
      syncVipAttribute().catch(() => {});
      const redirect = new URLSearchParams(window.location.hash.split('?')[1] || '').get('redirect') || '';
      const redirectPath = redirect.split('?')[0].replace(/^\//, '');
      window.location.hash = redirectPath && routes[redirectPath]
        ? `#/${redirect}`
        : '#/';
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
