import Alpine from '@alpinejs/csp';
import { api } from '../api/client.js';
import { on } from '../utils/events.js';

Alpine.store('wallet', {
  balance: 0,
  available: 0,
  loading: false,
  _refreshPromise: null,
  init() {
    on('wallet:updated', () => this.refresh());
  },
  async refresh() {
    if (this._refreshPromise) return this._refreshPromise;
    this.loading = true;
    this._refreshPromise = (async () => {
      try {
        const data = await api.get('/wallet');
        if (data) {
          this.balance = data.totalBalance || 0;
          this.available = data.availableBalance || 0;
        }
      } catch {
        // keep previous values on error
      } finally {
        this.loading = false;
      }
    })();
    try { return await this._refreshPromise; } finally { this._refreshPromise = null; }
  },
});
