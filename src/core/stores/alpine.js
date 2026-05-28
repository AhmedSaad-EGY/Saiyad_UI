import Alpine from 'alpinejs';
import { getUser, isAuthenticated, getRoleFromToken } from '../auth/index.js';
import { api } from '../api/client.js';
import { on } from '../events/bus.js';
import { t } from '../i18n/index.js';
import { formatPrice, formatDate } from '../utils/format.js';
import { showToast } from '../utils/ui.js';
import { escapeHtml } from '../utils/dom.js';
import '../../shared/components/modal.js';
import '../../shared/components/pagination.js';
import { registerAlpineComponents } from '../../shared/components/index.js';

registerAlpineComponents();

Alpine.magic('t', () => t);
Alpine.magic('formatPrice', () => formatPrice);
Alpine.magic('formatDate', () => formatDate);
Alpine.magic('showToast', () => showToast);
Alpine.magic('escapeHtml', () => escapeHtml);

Alpine.store('auth', {
  get user() {
    return getUser();
  },
  get isAuthenticated() {
    return isAuthenticated();
  },
  get role() {
    return getRoleFromToken();
  },
});

Alpine.store('cart', {
  count: 0,
  setCount(n) {
    this.count = n;
  },
});

Alpine.store('ui', {
  theme: localStorage.getItem('sayiad_theme') || 'light',
  lang: localStorage.getItem('sayiad_lang') || 'en',
  reducedMotion: localStorage.getItem('sayiad_reduced_motion') === 'true',
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
  },
  toggleLang() {
    this.lang = this.lang === 'en' ? 'ar' : 'en';
  },
  toggleMotion() {
    this.reducedMotion = !this.reducedMotion;
  },
});

Alpine.store('wallet', {
  balance: 0,
  available: 0,
  loading: false,
  init() {
    on('wallet:updated', () => this.refresh());
  },
  async refresh() {
    this.loading = true;
    try {
      const data = await api.get('/wallet').catch(() => null);
      if (data) {
        this.balance = data.totalBalance || 0;
        this.available = data.availableBalance || 0;
      }
    } catch {
      // silently fail
    } finally {
      this.loading = false;
    }
  },
});

Alpine.store('notif', {
  count: 0,
  init() {
    on('notif:updated', ({ count }) => { this.count = count; });
  },
  async refresh() {
    try {
      const data = await api.get('/notifications/unread-count').catch(() => null);
      if (data !== null) this.count = data.count ?? data ?? 0;
    } catch {
      // silently fail
    }
  },
});

Alpine.start();

export default Alpine;
