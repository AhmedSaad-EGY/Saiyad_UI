import Alpine from 'alpinejs';
import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { observeAnimations, initPullToRefresh, initInfiniteScroll } from '../core/utils/dom.js';
import { formatPrice, statusClass, tStatus } from '../core/utils/format.js';

Alpine.data('auctionsPage', () => ({
  search: '',
  status: 'Active',

  auctions: [],
  page: 1,
  totalPages: 1,
  pageSize: 12,
  loading: true,
  error: null,

  filterSheetOpen: false,

  async init() {
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    this.search = params.get('search') || '';
    this.status = params.get('status') || 'Active';
    this.page = parseInt(params.get('page'), 10) || 1;

    await this.load();

    this.$nextTick(() => {
      if (window.innerWidth < 768 && this.totalPages > 1) {
        initInfiniteScroll({
          sentinelId: 'auctionSentinel',
          onLoadMore: () => this.loadMore(),
        });
      }
    });

    initPullToRefresh({ onRefresh: () => { this.page = 1; this.load(); } });
  },

  syncUrl() {
    const qp = new URLSearchParams();
    if (this.search) qp.set('search', this.search);
    if (this.status) qp.set('status', this.status);
    if (this.page > 1) qp.set('page', this.page);
    const qs = qp.toString();
    history.replaceState(null, '', qs ? `#/auctions?${qs}` : '#/auctions');
  },

  async load() {
    this.loading = true;
    this.error = null;
    this.syncUrl();

    try {
      const apiParams = { page: this.page, pageSize: this.pageSize };
      if (this.search) apiParams.SearchTerm = this.search;
      if (this.status) apiParams.status = this.status;

      const data = await api.get('/auctions', apiParams);
      this.auctions = data.items || data.data || [];
      const total = data.totalCount || data.total || this.auctions.length;
      this.totalPages = Math.ceil(total / this.pageSize);
    } catch (e) {
      this.error = e.message || t('common.error');
    } finally {
      this.loading = false;
      this.$nextTick(() => observeAnimations());
    }
  },

  async loadMore() {
    if (this.loading || this.page >= this.totalPages) return;
    this.page++;
    this.loading = true;
    try {
      const apiParams = { page: this.page, pageSize: this.pageSize };
      if (this.search) apiParams.SearchTerm = this.search;
      if (this.status) apiParams.status = this.status;
      const data = await api.get('/auctions', apiParams);
      const items = data.items || data.data || [];
      this.auctions = [...this.auctions, ...items];
      const total = data.totalCount || data.total || 0;
      this.totalPages = Math.ceil(total / this.pageSize);
    } catch { /* silently fail */ }
    this.loading = false;
    this.$nextTick(() => observeAnimations());
  },

  goToPage(n) {
    if (n < 1 || n > this.totalPages || n === this.page) return;
    this.page = n;
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  reload() {
    this.page = 1;
    this.load();
  },

  applyMobileFilters() {
    this.filterSheetOpen = false;
    this.reload();
  },

  resetFilters() {
    this.search = '';
    this.status = 'Active';
    this.reload();
  },

  formatPrice(n) { return formatPrice(n); },
  statusClass(s) { return statusClass(s); },
  tStatus(s) { return tStatus(s, 'auction'); },

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
}));

export default async function renderAuctions(_container, _fullPath, params) {
  _container.innerHTML = `
    <div x-data="auctionsPage" @keydown.escape.window="filterSheetOpen = false">
      <div class="section-header"><h2><i class="fas fa-gavel"></i> ${t("auctions.title")}</h2></div>
      <div class="search-bar">
        <input type="text" class="form-input form-control" x-model="search" @input.debounce.400ms="reload()" placeholder="${t("auctions.search")}" />
        <div class="desktop-filters">
          <select class="form-select" x-model="status" @change="reload()">
            <option value="Active">${t("auctions.active")}</option>
            <option value="">${t("auctions.allStatus")}</option>
            <option value="Finished">${t("auctions.finished")}</option>
            <option value="Cancelled">${t("auctions.cancelled")}</option>
          </select>
        </div>
        <button class="btn btn-outline filter-toggle-btn" @click="filterSheetOpen = true"><i class="fas fa-sliders-h"></i> ${t('products.filters')}</button>
      </div>

      <!-- Skeleton -->
      <div x-show="loading" class="row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 skeleton-shimmer">
        <template x-for="i in 6" :key="i">
          <div class="product-card card pe-none">
            <div class="product-card-img skeleton-image-shim"></div>
            <div class="product-card-body p-3">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text" style="width:30%"></div>
            </div>
          </div>
        </template>
      </div>

      <!-- Error -->
      <div x-show="!loading && error" class="empty-state">
        <div class="empty-state-visual"><i class="fas fa-exclamation-triangle text-muted" style="font-size:3.5rem"></i></div>
        <h3>${t("auctions.loadError")}</h3>
        <p x-text="error"></p>
        <button class="btn btn-primary mt-3" @click="reload()">${t('common.retry')}</button>
      </div>

      <!-- Auction grid -->
      <div x-show="!loading && !error && auctions.length" class="row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
        <template x-for="(a, i) in auctions" :key="a.id">
          <a :href="'#/auction-detail?id='+a.id" class="product-card card animate-on-scroll" :class="'stagger-' + Math.min(i + 1, 8)" :aria-label="(a.productTitle || 'Auction') + ' — ' + formatPrice(a.currentHighestBid || a.startingPrice)">
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
                  <span x-show="timeLeft(a.endTime).urgent" class="ending-soon-badge">${t("auction.endingSoon")}</span>
                </span>
                <span class="status" :class="statusClass(a.status)" x-text="tStatus(a.status)"></span>
              </div>
            </div>
            <div class="product-card-footer">
              <small>${t("common.start")}: <span x-text="formatPrice(a.startingPrice)"></span></small>
              <small><span x-text="a.bidCount || 0"></span> ${t("common.bids")}</small>
            </div>
          </a>
        </template>
      </div>

      <!-- Empty -->
      <div x-show="!loading && !error && !auctions.length" class="empty-state">
        <div class="empty-state-visual"><i class="fas fa-gavel text-muted" style="font-size:3.5rem"></i></div>
        <h3>${t("home.noAuctions")}</h3>
        <p>${t("auctions.noAuctionsDesc")}</p>
        <button class="btn btn-primary mt-3" @click="resetFilters()">${t('common.clearFilters')}</button>
      </div>

      <!-- Pagination -->
      <div x-show="!loading && auctions.length" x-data="pagination({ page, totalPages, onPageChange: goToPage })">
        <div class="d-flex align-items-center justify-content-center gap-2 mt-4">
          <template x-for="p in pages" :key="p">
            <span>
              <button x-show="p !== '...'" x-text="p" :class="'btn btn-sm ' + (p === currentPage ? 'btn-primary' : 'btn-ghost')" @click="goTo(p)"></button>
              <span x-show="p === '...'" class="px-1 text-muted">&hellip;</span>
            </span>
          </template>
        </div>
      </div>

      <!-- Infinite scroll sentinel -->
      <div id="auctionSentinel" x-show="!loading && auctions.length && totalPages > 1" style="height:1px;width:100%"></div>

      <!-- Mobile filter bottom sheet -->
      <div x-show="filterSheetOpen" class="filter-sheet-overlay show" @click.self="filterSheetOpen = false">
        <div class="filter-sheet">
          <div class="filter-sheet-header">
            <h3>${t('products.filters')}</h3>
            <button class="btn btn-ghost btn-icon" @click="filterSheetOpen = false" aria-label="${t('common.close')}"><i class="fas fa-times"></i></button>
          </div>
          <div class="filter-sheet-body">
            <div class="form-group">
              <label>${t("auctions.status")}</label>
              <select class="form-select" x-model="status">
                <option value="Active">${t("auctions.active")}</option>
                <option value="">${t("auctions.allStatus")}</option>
                <option value="Finished">${t("auctions.finished")}</option>
                <option value="Cancelled">${t("auctions.cancelled")}</option>
              </select>
            </div>
          </div>
          <div class="filter-sheet-footer">
            <button class="btn btn-ghost" @click="resetFilters(); filterSheetOpen = false">${t('common.clearFilters')}</button>
            <button class="btn btn-primary" @click="applyMobileFilters()"><i class="fas fa-check"></i> ${t('common.showResults') || 'Show Results'}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
