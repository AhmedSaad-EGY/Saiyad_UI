import Alpine from 'alpinejs';
import { api } from '../../shared/api/client.js';
import { on } from '../../app/events.js';
import '../../widgets/ui/modal.js';
import '../../widgets/ui/pagination.js';

Alpine.store('cart', {
  count: 0,
  setCount(n) {
    this.count = n;
  },
});

Alpine.store('ui', {
  theme: localStorage.getItem('sayiad_theme') || 'light',
  lang: localStorage.getItem('sayiad_lang') || 'en',
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
  },
  toggleLang() {
    this.lang = this.lang === 'en' ? 'ar' : 'en';
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
