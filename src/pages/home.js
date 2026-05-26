import Alpine from 'alpinejs';
import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { isAuthenticated, getUser, hasAnyRole, hasRole } from '../core/auth/index.js';
import { ROLES, SELLER_ROLES } from '../shared/constants/roles.js';
import { escapeHtml, renderEmptyState, progressiveImg, observeAnimations, initPullToRefresh, activateProgressiveImages } from '../core/utils/dom.js';
import { formatPrice, statusClass, tStatus } from '../core/utils/format.js';
import { renderRecentlyViewed } from '../core/utils/ui.js';

Alpine.data('homePage', () => ({
  loading: true,
  error: null,
  products: [],
  auctions: [],
  roleLinks: [],
  isAuth: false,

  async init() {
    this.isAuth = isAuthenticated();
    await this.loadData();
    initPullToRefresh({ onRefresh: () => this.loadData() });
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
    const timeStr = days > 0 ? days + 'd ' + hours + 'h' : hours + 'h ' + mins + 'm';
    return { timeStr, urgent };
  },

  recentlyViewedHtml() {
    const viewed = JSON.parse(localStorage.getItem('sayiad_recent') || '[]');
    if (!viewed.length) return '';
    return `
      <div class="section-header animate-on-scroll">
        <h2><i class="fas fa-history"></i> ${t('common.recentlyViewed')}</h2>
      </div>
      <div class="recently-viewed-strip">
        ${viewed.map(v => `
          <a href="${v.type === 'auction' ? '#/auction-detail?id=' : '#/product-detail?id='}${v.id}" class="recently-viewed-item" title="${escapeHtml(v.title)}">
            ${v.image ? `<img src="${v.image}" alt="${escapeHtml(v.title)}" loading="lazy">` : '<div style="width:60px;height:60px;background:var(--body-bg);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><i class="fas fa-image"></i></div>'}
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
  container.innerHTML = `
    <div x-data="homePage" x-init="init()">
      <section class="hero">
        <div class="hero-content">
          <h1>${t('home.welcome')}</h1>
          <p>${t('home.subtitle')}</p>
          <div class="hero-actions">
            <a href="#/products" class="btn btn-primary btn-lg"><i class="fas fa-store"></i> ${t('home.browseProducts')}</a>
            <a href="#/auctions" class="btn btn-outline btn-lg"><i class="fas fa-gavel"></i> ${t('home.viewAuctions')}</a>
          </div>
        </div>
      </section>

      <div class="features-grid">
        <div class="feature-card animate-on-scroll stagger-1"><i class="fas fa-fish"></i><h3>${t('home.qualityGear')}</h3><p>${t('home.qualityGearDesc')}</p></div>
        <div class="feature-card animate-on-scroll stagger-2"><i class="fas fa-gavel"></i><h3>${t('home.liveAuctions')}</h3><p>${t('home.liveAuctionsDesc')}</p></div>
        <div class="feature-card animate-on-scroll stagger-3"><i class="fas fa-truck"></i><h3>${t('home.fastShipping')}</h3><p>${t('home.fastShippingDesc')}</p></div>
        <div class="feature-card animate-on-scroll stagger-4"><i class="fas fa-shield-alt"></i><h3>${t('home.securePayments')}</h3><p>${t('home.securePaymentsDesc')}</p></div>
      </div>

      <!-- Role quick links -->
      <div x-show="roleLinks.length" class="section-header animate-on-scroll">
        <h2><i class="fas fa-user"></i> ${t('common.quickLinks')}</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <template x-for="link in roleLinks" :key="link.label">
            <a :href="link.href" class="btn btn-outline btn-sm"><i :class="'fas ' + link.icon"></i> <span x-text="link.label"></span></a>
          </template>
        </div>
      </div>

      <!-- Products section -->
      <div class="section-header animate-on-scroll"><h2>${t('home.latestProducts')}</h2><a href="#/products" class="btn btn-outline btn-sm">${t('home.viewAll')}</a></div>

      <!-- Product skeleton -->
      <div x-show="loading" class="product-grid skeleton-shimmer">
        <template x-for="i in 4" :key="i">
          <div class="product-card" style="pointer-events:none">
            <div class="product-card-img skeleton-image-shim"></div>
            <div class="product-card-body" style="padding:12px">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text" style="width:30%"></div>
            </div>
          </div>
        </template>
      </div>

      <!-- Product error -->
      <div x-show="!loading && error" class="empty-state">
        <div class="empty-state-visual"><i class="fas fa-exclamation-triangle" style="font-size:3.5rem;color:var(--text-muted)"></i></div>
        <h3>${t('home.loadError')}</h3>
        <p x-text="error"></p>
        <button class="btn btn-primary" @click="loadData()" style="margin-top:16px">${t('common.retry')}</button>
      </div>

      <!-- Product grid -->
      <div x-show="!loading && !error" class="product-grid">
        <template x-for="(p, i) in products" :key="p.id">
          <a :href="'#/product-detail?id='+p.id" class="product-card animate-on-scroll" :class="'stagger-' + Math.min(i + 1, 8)" :aria-label="escapeHtml(p.title || 'Product') + ' — ' + formatPrice(p.price)">
            <div class="product-card-img">
              <img :src="p.primaryImageUrl || p.imageUrl || ''" :alt="escapeHtml(p.title || 'Product')" loading="lazy">
            </div>
            <div class="product-card-body">
              <div class="product-card-title" x-text="p.title || 'Product'"></div>
              <div class="product-card-price" x-text="formatPrice(p.price)"></div>
              <div class="product-card-meta">
                <span x-show="p.categoryName" class="product-card-category"><i class="fas fa-tag"></i><span x-text="p.categoryName"></span></span>
              </div>
            </div>
          </a>
        </template>
      </div>

      <!-- Auctions section -->
      <div class="section-header section-header-offset animate-on-scroll"><h2>${t('home.activeAuctions')}</h2><a href="#/auctions" class="btn btn-outline btn-sm">${t('home.viewAll')}</a></div>

      <!-- Auction grid (no separate skeleton — reuses same loading state) -->
      <div x-show="!loading && !error" class="product-grid animate-on-scroll">
        <template x-for="(a, i) in auctions" :key="a.id">
          <a :href="'#/auction-detail?id='+a.id" class="product-card" :class="'animate-on-scroll stagger-' + Math.min(i + 1, 8)" :aria-label="(a.productTitle || 'Auction') + ' — ' + formatPrice(a.currentHighestBid || a.startingPrice)">
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
        <div class="empty-state-visual"><i class="fas fa-box-open" style="font-size:3.5rem;color:var(--text-muted)"></i></div>
        <h3>${t('home.noProducts')}</h3>
      </div>

      <div x-show="!loading && !error && !auctions.length" class="empty-state">
        <div class="empty-state-visual"><i class="fas fa-gavel" style="font-size:3.5rem;color:var(--text-muted)"></i></div>
        <h3>${t('home.noAuctions')}</h3>
      </div>

      <!-- Recently viewed -->
      <div x-show="!loading" x-html="recentlyViewedHtml()" id="recentlyViewed"></div>
    </div>
  `;
}
export function renderAuctionCards(container, auctions) {
  if (!auctions?.length) {
    renderEmptyState(container, {
      icon: "fa-gavel",
      title: t("home.noAuctions"),
    });
    return;
  }
  container.innerHTML = auctions
    .map((a, i) => {
      const now = new Date();
      const end = new Date(a.endTime);
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const mins = Math.floor((remaining % 3600) / 60);
      const urgent = remaining > 0 && remaining <= 3600;
      const timeStr = days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`;
      const title = a.productTitle || "Auction Item";
      const price = formatPrice(a.currentHighestBid || a.startingPrice);
      const label = `${title} - ${price}`;
      return `
      <a href="#/auction-detail?id=${a.id}" class="product-card animate-on-scroll stagger-${Math.min(i + 1, 8)}${urgent ? " auction-urgent" : ""}" aria-label="${escapeHtml(label)}">
        <div class="product-card-img">
          ${a.productImageUrl ? progressiveImg(a.productImageUrl, a.productTitle || "Auction", "") : '<i class="fas fa-gavel" aria-hidden="true"></i>'}
          <button class="btn btn-sm btn-primary quick-view-btn" data-quickview-id="${a.id}" data-quickview-title="${escapeHtml(a.productTitle || "Auction Item")}" data-quickview-price="${a.currentHighestBid || a.startingPrice}" data-quickview-image="${a.productImageUrl || ""}" data-quickview-desc=""><i class="fas fa-eye"></i> Quick View</button>
        </div>
        <div class="product-card-body">
          <div class="product-card-title">${escapeHtml(title)}</div>
          <div class="current-bid">${price}</div>
          <div class="product-card-meta">
            <span><i class="fas fa-hourglass-half" aria-hidden="true"></i> ${timeStr} ${t("common.endsIn")} ${urgent ? `<span class="ending-soon-badge">${t("auction.endingSoon")}</span>` : ""}</span>
            <span class="status ${statusClass(a.status)}">${tStatus(a.status, "auction")}</span>
          </div>
        </div>
        <div class="product-card-footer">
          <small>${t("common.start")}: ${formatPrice(a.startingPrice)}</small>
          <small>${a.bidCount || 0} ${t("common.bids")}</small>
        </div>
      </a>
    `;
    })
    .join("");
  activateProgressiveImages(container);
}
