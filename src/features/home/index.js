import Alpine from '@alpinejs/csp';
import { t } from '../../shared/utils/i18n.js';
import { api } from '../../shared/api/client.js';
import { isAuthenticated, hasAnyRole, hasRole } from '../auth/login.js';
import { ROLES, SELLER_ROLES } from '../../shared/constants/roles.js';
import { escapeHtml, observeAnimations, initPullToRefresh } from '../../shared/utils/dom.js';
import { formatPrice, statusClass, tStatus } from '../../shared/utils/format.js';
import { getRecentlyViewed } from '../../shared/utils/recently-viewed.js';
export { trackRecentlyViewed, getRecentlyViewed } from '../../shared/utils/recently-viewed.js';

function buildRecentlyViewedItems() {
  const viewed = getRecentlyViewed();
  if (!viewed.length) return [];
  return viewed.map((v) => ({
    id: v.id,
    title: v.title,
    image: v.image || null,
    price: v.price != null ? v.price : null,
    href: v.type === 'auction' ? `#/auction-detail?id=${v.id}` : `#/product-detail?id=${v.id}`,
    icon: v.type === 'auction' ? 'fa-gavel' : 'fa-tag',
    typeLabel: v.type === 'auction' ? t('nav.auctions') : t('nav.products'),
  }));
}

Alpine.data('homePage', () => ({
  loading: true,
  error: null,
  products: [],
  auctions: [],
  roleLinks: [],
  isAuth: false,
  recentlyViewed: [],

  async init() {
    this.isAuth = isAuthenticated();
    await this.loadData();
    this._ptrCleanup = initPullToRefresh({ onRefresh: () => this.loadData() });
  },

  destroy() {
    this._ptrCleanup?.();
  },

  async loadData() {
    this.loading = true;
    this.error = null;

    try {
      if (this.isAuth) {
        const links = [];
        if (hasAnyRole(SELLER_ROLES)) {
          links.push({ href: '#/dashboard?tab=products', icon: 'fa-tag', label: t('nav.myProducts') });
        }
        if (hasRole(ROLES.ADMIN)) {
          links.push({ href: '#/admin', icon: 'fa-shield-alt', label: t('admin.title') });
        }
        this.roleLinks = links;
      }

      const [productsRes, auctionsRes] = await Promise.all([
        api.get('/products', { pageSize: 4 }),
        api.get('/auctions', { pageSize: 4 }),
      ]);

      this.products = productsRes?.items ?? productsRes?.data ?? [];
      this.auctions = auctionsRes?.items ?? auctionsRes?.data ?? [];
    } catch (err) {
      this.error = err.message || t('common.error');
    } finally {
      this.loading = false;
      this.recentlyViewed = buildRecentlyViewedItems();
      this.$nextTick(() => observeAnimations());
    }
  },

  formatPrice(n) { return formatPrice(n); },
  statusClass(s) { return statusClass(s); },
  tStatus(s) { return tStatus(s, 'auction'); },
  escapeHtml(s) { return escapeHtml(s); },

  timeLeft(endTime) {
    const diff = Math.max(0, Math.floor((new Date(endTime) - Date.now()) / 1000));
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    return {
      timeStr: days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`,
      urgent: diff > 0 && diff <= 3600,
    };
  },
}));
