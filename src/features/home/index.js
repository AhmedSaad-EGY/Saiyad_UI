import Alpine from 'alpinejs';
import { t } from '../../app/i18n.js';
import { api } from '../../shared/api/client.js';
import { isAuthenticated, hasAnyRole, hasRole } from '../auth/login.js';
import { ROLES, SELLER_ROLES } from '../../shared/constants/roles.js';
import { escapeHtml, observeAnimations, initPullToRefresh } from '../../shared/utils/dom.js';
import { formatPrice, statusClass, tStatus } from '../../shared/utils/format.js';
import { getRecentlyViewed } from '../../shared/utils/recently-viewed.js';
export { trackRecentlyViewed, getRecentlyViewed } from '../../shared/utils/recently-viewed.js';

function buildRecentlyViewedHtml() {
  const viewed = getRecentlyViewed();
  if (!viewed.length) return '';

  const items = viewed
    .map((v) => {
      const href = v.type === 'auction' ? `#/auction-detail?id=${v.id}` : `#/product-detail?id=${v.id}`;
      const icon = v.type === 'auction' ? 'fa-gavel' : 'fa-tag';
      const typeLabel = v.type === 'auction' ? t('nav.auctions') : t('nav.products');
      const thumb = v.image
        ? `<img src="${v.image}" alt="${escapeHtml(v.title)}" loading="lazy">`
        : `<div class="recently-viewed-img-fallback"><i class="fas fa-image" aria-hidden="true"></i></div>`;

      return `
      <a href="${href}" class="recently-viewed-item" title="${escapeHtml(v.title)}">
        ${thumb}
        <div class="recently-viewed-info">
          <span class="recently-viewed-title">${escapeHtml(v.title)}</span>
          ${v.price != null ? `<span class="recently-viewed-price">${formatPrice(v.price)}</span>` : ''}
          <span class="recently-viewed-type text-muted text-uppercase">
            <i class="fas ${icon}" aria-hidden="true"></i> ${typeLabel}
          </span>
        </div>
      </a>`;
    })
    .join('');

  return `
    <div class="section-header section-header-offset animate-on-scroll">
      <h2><i class="fas fa-history" aria-hidden="true"></i> ${t('common.recentlyViewed')}</h2>
    </div>
    <div class="recently-viewed-strip">${items}</div>`;
}

Alpine.data('homePage', () => ({
  loading: true,
  error: null,
  products: [],
  auctions: [],
  roleLinks: [],
  isAuth: false,
  recentlyViewedHtml: '',

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
        api.get('/products', { PageSize: 4 }),
        api.get('/auctions', { PageSize: 4 }),
      ]);

      this.products = productsRes?.items ?? productsRes?.data ?? [];
      this.auctions = auctionsRes?.items ?? auctionsRes?.data ?? [];
    } catch (err) {
      this.error = err.message || t('common.error');
    } finally {
      this.loading = false;
      this.recentlyViewedHtml = buildRecentlyViewedHtml();
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
