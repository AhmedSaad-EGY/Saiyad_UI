import Alpine from 'alpinejs';
import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { isAuthenticated, hasAnyRole, hasRole } from '../core/auth/index.js';
import { ROLES, SELLER_ROLES } from '../shared/constants/roles.js';
import { escapeHtml, observeAnimations, initPullToRefresh } from '../core/utils/dom.js';
import { formatPrice, statusClass, tStatus } from '../core/utils/format.js';
import { renderRecentlyViewed } from '../core/utils/ui.js';
import { setPageMeta } from '../core/utils/seo.js';


Alpine.data('homePage', () => ({
  loading: true,
  error: null,
  products: [],
  auctions: [],
  roleLinks: [],
  isAuth: false,
  heroContentStyle: 'transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)',

  async init() {
    this.isAuth = isAuthenticated();
    await this.loadData();
    this._ptrCleanup = initPullToRefresh({ onRefresh: () => this.loadData() });
  },

  destroy() {
    if (this._ptrCleanup) this._ptrCleanup();
  },

  handleHeroMouseMove(e) {
    // Skip on touch devices or reduced-motion preference
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const hero = e.currentTarget;
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;
    const transX = ((x - centerX) / centerX) * 12;
    const transY = ((y - centerY) / centerY) * 12;
    this.heroContentStyle = `transform: perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${transX}px, ${transY}px, 15px); transition: transform 0.05s ease-out;`;
  },

  handleHeroMouseLeave() {
    this.heroContentStyle = 'transform: none; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);';
  },

  async loadData() {
    this.loading = true;
    this.error = null;

    try {
      // Role links
      if (this.isAuth) {
        const links = [];
        if (hasAnyRole(...(SELLER_ROLES))) {
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

      this.products = productsRes.items || productsRes.data || [];
      this.auctions = auctionsRes.items || auctionsRes.data || [];
    } catch (e) {
      this.error = e.message || t('common.error');
    } finally {
      this.loading = false;
      renderRecentlyViewed(document.getElementById('recentlyViewed'));
      this.$nextTick(() => observeAnimations());
    }
  },

  formatPrice(n) { return formatPrice(n); },
  statusClass(s) { return statusClass(s); },
  tStatus(s) { return tStatus(s, 'auction'); },
  escapeHtml(str) { return escapeHtml(str); },

  timeLeft(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const remaining = Math.max(0, Math.floor((end - now) / 1000));
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    const urgent = remaining > 0 && remaining <= 3600;
    const timeStr = days > 0 ? `${days  }d ${  hours  }h` : `${hours  }h ${  mins  }m`;
    return { timeStr, urgent };
  },

  recentlyViewedHtml() {
    const viewed = JSON.parse(localStorage.getItem('sayiad_recent') || '[]');
    if (!viewed.length) return '';
    return `
      <div class="section-header animate-on-scroll">
        <h2><i class="fas fa-history" aria-hidden="true"></i> ${t('common.recentlyViewed')}</h2>
      </div>
      <div class="recently-viewed-strip">
        ${viewed.map(v => `
          <a href="${v.type === 'auction' ? '#/auction-detail?id=' : '#/product-detail?id='}${v.id}" class="recently-viewed-item" title="${escapeHtml(v.title)}">
            ${v.image ? `<img src="${v.image}" alt="${escapeHtml(v.title)}" loading="lazy">` : '<div style="width:60px;height:60px;background:var(--body-bg);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><i class="fas fa-image" aria-hidden="true"></i></div>'}
            <div class="recently-viewed-info">
              <span class="recently-viewed-title">${escapeHtml(v.title)}</span>
              ${v.price != null ? `<span class="recently-viewed-price">${formatPrice(v.price)}</span>` : ''}
              <span class="recently-viewed-type" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted)">
                <i class="fas ${v.type === 'auction' ? 'fa-gavel' : 'fa-tag'}" aria-hidden="true"></i>
                ${v.type === 'auction' ? t('nav.auctions') : t('nav.products')}
              </span>
            </div>
          </a>
        `).join('')}
      </div>`;
  },
}));

export default async function renderHome(container) {
  setPageMeta(t('home.title'), t('home.metaDesc'));
  container.innerHTML = `
    <style>
      .hero {
        position: relative;
        overflow: hidden;
        perspective: 1000px;
      }
      .hero-content {
        transform-style: preserve-3d;
        backface-visibility: hidden;
      }
    </style>
    <div x-data="homePage" x-init="init()">
      <section class="hero" @mousemove="handleHeroMouseMove($event)" @mouseleave="handleHeroMouseLeave()">
        <div class="hero-content" :style="heroContentStyle">
          <h1>${t('home.welcome')}</h1>
          <p>${t('home.subtitle')}</p>
          <div class="hero-actions">
            <a href="#/products" class="btn btn-primary btn-lg"><i class="fas fa-store" aria-hidden="true"></i> ${t('home.browseProducts')}</a>
            <a href="#/auctions" class="btn btn-outline btn-lg"><i class="fas fa-gavel" aria-hidden="true"></i> ${t('home.viewAuctions')}</a>
          </div>
        </div>
      </section>

      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 my-5">
        <div class="feature-card animate-on-scroll stagger-1"><i class="fas fa-fish" aria-hidden="true"></i><h3>${t('home.qualityGear')}</h3><p>${t('home.qualityGearDesc')}</p></div>
        <div class="feature-card animate-on-scroll stagger-2"><i class="fas fa-gavel" aria-hidden="true"></i><h3>${t('home.liveAuctions')}</h3><p>${t('home.liveAuctionsDesc')}</p></div>
        <div class="feature-card animate-on-scroll stagger-3"><i class="fas fa-truck" aria-hidden="true"></i><h3>${t('home.fastShipping')}</h3><p>${t('home.fastShippingDesc')}</p></div>
        <div class="feature-card animate-on-scroll stagger-4"><i class="fas fa-shield-alt" aria-hidden="true"></i><h3>${t('home.securePayments')}</h3><p>${t('home.securePaymentsDesc')}</p></div>
      </div>

      <!-- Role quick links -->
      <div x-show="roleLinks.length" class="section-header animate-on-scroll">
        <h2><i class="fas fa-user" aria-hidden="true"></i> ${t('common.quickLinks')}</h2>
        <div class="d-flex gap-2 flex-wrap">
          <template x-for="link in roleLinks" :key="link.label">
            <a :href="link.href" class="btn btn-outline btn-sm"><i :class="'fas ' + link.icon"></i> <span x-text="link.label"></span></a>
          </template>
        </div>
      </div>

      <!-- Products section -->
      <div class="section-header animate-on-scroll"><h2>${t('home.latestProducts')}</h2><a href="#/products" class="btn btn-outline btn-sm">${t('home.viewAll')}</a></div>

      <!-- Product skeleton -->
      <div x-show="loading" class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 product-card-grid skeleton-shimmer">
        <template x-for="i in 4" :key="i">
          <div class="product-card card pe-none">
            <div class="product-card-img skeleton-image-shim"></div>
            <div class="product-card-body p-3">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text" style="width:30%"></div>
            </div>
          </div>
        </template>
      </div>

      <!-- Product error -->
      <div x-show="!loading && error" class="empty-state">
        <div class="empty-state-visual"><i class="fas fa-exclamation-triangle text-muted" style="font-size:3.5rem" aria-hidden="true"></i></div>
        <h3>${t('home.loadError')}</h3>
        <p x-text="error"></p>
        <button class="btn btn-primary mt-3" @click="loadData()">${t('common.retry')}</button>
      </div>

      <!-- Product grid -->
      <div x-show="!loading && !error" class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 product-card-grid">
        <template x-for="(p, i) in products" :key="p.id">
          <a :href="'#/product-detail?id='+p.id" class="product-card card animate-on-scroll" :class="'stagger-' + Math.min(i + 1, 8)" :aria-label="escapeHtml(p.title || $t('common.product')) + ' — ' + formatPrice(p.price)">
            <div class="product-card-img">
              <img :src="p.primaryImageUrl || p.imageUrl || ''" :alt="escapeHtml(p.title || 'Product')" loading="lazy">
            </div>
            <div class="product-card-body">
              <div class="product-card-title" x-text="p.title || 'Product'"></div>
              <div class="product-card-price" x-text="formatPrice(p.price)"></div>
              <div class="product-card-meta">
                <span x-show="p.categoryName" class="product-card-category"><i class="fas fa-tag" aria-hidden="true"></i><span x-text="p.categoryName"></span></span>
              </div>
            </div>
          </a>
        </template>
      </div>

      <!-- Auctions section -->
      <div class="section-header section-header-offset animate-on-scroll"><h2>${t('home.activeAuctions')}</h2><a href="#/auctions" class="btn btn-outline btn-sm">${t('home.viewAll')}</a></div>

      <!-- Auction grid (no separate skeleton — reuses same loading state) -->
      <div x-show="!loading && !error" class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 product-card-grid animate-on-scroll">
        <template x-for="(a, i) in auctions" :key="a.id">
          <a :href="'#/auction-detail?id='+a.id" class="product-card card" :class="'animate-on-scroll stagger-' + Math.min(i + 1, 8)" :aria-label="(a.productTitle || $t('auction.item')) + ' — ' + formatPrice(a.currentHighestBid || a.startingPrice)">
            <div class="product-card-img">
              <img :src="a.productImageUrl || ''" :alt="a.productTitle || 'Auction'" loading="lazy">
              <span class="product-card-badge" :class="statusClass(a.status)" x-text="tStatus(a.status)"></span>
            </div>
            <div class="product-card-body">
              <div class="product-card-title" x-text="a.productTitle || 'Auction Item'"></div>
              <div class="current-bid" x-text="formatPrice(a.currentHighestBid || a.startingPrice)"></div>
              <div class="product-card-meta">
                <span>
                  <i class="fas fa-hourglass-half" aria-hidden="true"></i>
                  <span x-text="timeLeft(a.endTime).timeStr"></span>
                  <span x-show="timeLeft(a.endTime).urgent" class="ending-soon-badge">${t('auction.endingSoon')}</span>
                </span>
                <span class="status" :class="statusClass(a.status)" x-text="tStatus(a.status)"></span>
              </div>
            </div>
            <div class="product-card-footer">
              <small>${t('common.start')}: <span x-text="formatPrice(a.startingPrice)"></span></small>
              <small><span x-text="a.bidCount || 0"></span> ${t('common.bids')}</small>
            </div>
          </a>
        </template>
      </div>

      <!-- Empty states -->
      <div x-show="!loading && !error && !products.length" class="empty-state">
        <div class="empty-state-visual"><i class="fas fa-box-open text-muted" style="font-size:3.5rem" aria-hidden="true"></i></div>
        <h3>${t('home.noProducts')}</h3>
      </div>

      <div x-show="!loading && !error && !auctions.length" class="empty-state">
        <div class="empty-state-visual"><i class="fas fa-gavel text-muted" style="font-size:3.5rem" aria-hidden="true"></i></div>
        <h3>${t('home.noAuctions')}</h3>
      </div>

      <!-- Recently viewed -->
      <div x-show="!loading" x-html="recentlyViewedHtml()" id="recentlyViewed"></div>
    </div>
  `;
}
