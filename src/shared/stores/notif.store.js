import Alpine from 'alpinejs';
import { api } from '../api/client.js';
import { on } from '../../app/events.js';

Alpine.store('notif', {
  count: 0,
  init() {
    on('notifications:updated', (e) => { this.count = e.detail.count; });
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
