import Alpine from 'alpinejs';
import { api } from '../api/client.js';
import { on } from '../../app/events.js';

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
