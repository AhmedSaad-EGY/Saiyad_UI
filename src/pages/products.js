import Alpine from 'alpinejs';
import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { escapeHtml, observeAnimations, initPullToRefresh, initInfiniteScroll } from '../core/utils/dom.js';
import { formatPrice } from '../core/utils/format.js';
Alpine.data('productsPage', () => ({
  // Filter state
  search: '',
  categoryId: '',
  condition: '',
  sort: '',
  minPrice: '',
  maxPrice: '',
  inStock: false,

  // Data state
  products: [],
  categories: [],
  page: 1,
  totalPages: 1,
  pageSize: 12,
  loading: true,
  error: null,

  // Mobile overlays
  filterSheetOpen: false,
  searchOverlayOpen: false,
  mobileSearch: '',

  // Init
  async init() {
    // Hydrate from URL params
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    this.search = params.get('search') || '';
    this.categoryId = params.get('categoryId') || '';
    this.condition = params.get('condition') || '';
    this.sort = params.get('sort') || '';
    this.minPrice = params.get('minPrice') || '';
    this.maxPrice = params.get('maxPrice') || '';
    this.inStock = params.get('inStock') === '1';
    this.page = parseInt(params.get('page'), 10) || 1;
    this.mobileSearch = this.search;

    await this.loadCategories();
    await this.loadProducts();

    // Infinite scroll (mobile)
    this.$nextTick(() => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && this.totalPages > 1) {
        initInfiniteScroll({
          sentinelId: 'productSentinel',
          onLoadMore: () => this.loadMore(),
        });
      }
    });

    initPullToRefresh({ onRefresh: () => { this.page = 1; this.loadProducts(); } });
  },

  async loadCategories() {
    try {
      const res = await api.get('/categories', { pageSize: 100 });
      this.categories = res.items || res.data || res || [];
    } catch { /* ignore */ }
  },

  syncUrl() {
    const qp = new URLSearchParams();
    if (this.search) qp.set('search', this.search);
    if (this.categoryId) qp.set('categoryId', this.categoryId);
    if (this.condition) qp.set('condition', this.condition);
    if (this.sort) qp.set('sort', this.sort);
    if (this.minPrice) qp.set('minPrice', this.minPrice);
    if (this.maxPrice) qp.set('maxPrice', this.maxPrice);
    if (this.inStock) qp.set('inStock', '1');
    if (this.page > 1) qp.set('page', this.page);
    const qs = qp.toString();
    history.replaceState(null, '', qs ? `#/products?${qs}` : '#/products');
  },

  async loadProducts() {
    this.loading = true;
    this.error = null;
    this.syncUrl();

    try {
      const apiParams = { page: this.page, pageSize: this.pageSize };
      if (this.search) apiParams.searchTerm = this.search;
      if (this.categoryId) apiParams.categoryId = this.categoryId;
      if (this.condition) apiParams.condition = this.condition;
      if (this.minPrice) apiParams.minPrice = this.minPrice;
      if (this.maxPrice) apiParams.maxPrice = this.maxPrice;
      if (this.inStock) apiParams.inStock = true;
      if (this.sort === 'newest') apiParams.sortBy = 'createdAt';
      if (this.sort === 'price-asc') { apiParams.sortBy = 'price'; apiParams.sortDirection = 'asc'; }
      if (this.sort === 'price-desc') { apiParams.sortBy = 'price'; apiParams.sortDirection = 'desc'; }

      const data = await api.get('/products', apiParams);
      this.products = data.items || data.data || [];
      const total = data.totalCount || data.total || this.products.length;
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
      if (this.search) apiParams.searchTerm = this.search;
      if (this.categoryId) apiParams.categoryId = this.categoryId;
      if (this.condition) apiParams.condition = this.condition;
      if (this.minPrice) apiParams.minPrice = this.minPrice;
      if (this.maxPrice) apiParams.maxPrice = this.maxPrice;
      if (this.inStock) apiParams.inStock = true;
      if (this.sort === 'newest') apiParams.sortBy = 'createdAt';
      if (this.sort === 'price-asc') { apiParams.sortBy = 'price'; apiParams.sortDirection = 'asc'; }
      if (this.sort === 'price-desc') { apiParams.sortBy = 'price'; apiParams.sortDirection = 'desc'; }

      const data = await api.get('/products', apiParams);
      const items = data.items || data.data || [];
      this.products = [...this.products, ...items];
      const total = data.totalCount || data.total || 0;
      this.totalPages = Math.ceil(total / this.pageSize);
    } catch { /* silently fail for infinite scroll */ }
    this.loading = false;
    this.$nextTick(() => observeAnimations());
  },

  goToPage(n) {
    if (n < 1 || n > this.totalPages || n === this.page) return;
    this.page = n;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  reload() {
    this.page = 1;
    this.loadProducts();
  },

  resetFilters() {
    this.search = '';
    this.categoryId = '';
    this.condition = '';
    this.sort = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.inStock = false;
    this.mobileSearch = '';
    this.reload();
  },

  applyMobileFilters() {
    this.filterSheetOpen = false;
    this.reload();
  },

  openSearchOverlay() {
    this.mobileSearch = this.search;
    this.searchOverlayOpen = true;
    this.$nextTick(() => {
      const el = document.getElementById('productMobileSearchInput');
      if (el) setTimeout(() => el.focus(), 50);
    });
  },

  closeSearchOverlay() {
    this.searchOverlayOpen = false;
  },

  applyMobileSearch() {
    this.search = this.mobileSearch;
    this.closeSearchOverlay();
    this.reload();
  },

  formatPrice(n) {
    return formatPrice(n);
  },

  escapeHtml(str) {
    return escapeHtml(str);
  },

}));

export default async function renderProducts(_container, _fullPath, params) {
  _container.innerHTML = `
    <div x-data="productsPage" class="products-page-alpine" @keydown.escape.window="closeSearchOverlay(); filterSheetOpen = false">
      <div class="section-header"><h2><i class="fas fa-store"></i> ${t('products.title')}</h2></div>
      <div class="search-bar">
        <input type="text" class="form-input form-control" x-model="search" @input.debounce.400ms="reload()" placeholder="${t('products.search')}" />
        <div class="desktop-filters">
          <select class="form-select" x-model="categoryId" @change="reload()">
            <option value="">${t('products.allCategories')}</option>
            <template x-for="cat in categories" :key="cat.id">
              <option :value="cat.id" x-text="cat.name"></option>
            </template>
          </select>
          <select class="form-select" x-model="condition" @change="reload()">
            <option value="">${t('products.allConditions')}</option>
            <option value="New">${t('product.new')}</option>
            <option value="Used">${t('product.used')}</option>
          </select>
          <select class="form-select" x-model="sort" @change="reload()">
            <option value="">${t('products.sort')}</option>
            <option value="newest">${t('products.newest')}</option>
            <option value="price-asc">${t('products.priceLowHigh')}</option>
            <option value="price-desc">${t('products.priceHighLow')}</option>
          </select>
          <input type="number" class="form-input form-control" x-model.number="minPrice" @input.debounce.500ms="reload()" min="0" step="1" placeholder="${t('products.minPrice')}" />
          <input type="number" class="form-input form-control" x-model.number="maxPrice" @input.debounce.500ms="reload()" min="0" step="1" placeholder="${t('products.maxPrice')}" />
          <label class="filter-check">
            <input type="checkbox" x-model="inStock" @change="reload()" />
            <span>${t('products.inStockOnly')}</span>
          </label>
          <a href="#/products" class="btn btn-ghost btn-sm" @click.prevent="resetFilters()">${t('common.clearFilters')}</a>
        </div>
        <button class="btn btn-outline filter-toggle-btn" @click="filterSheetOpen = true"><i class="fas fa-sliders-h"></i> ${t('products.filters')}</button>
        <button class="btn btn-outline search-toggle-btn" @click="openSearchOverlay()" aria-label="${t('common.search')}"><i class="fas fa-search"></i></button>
      </div>

      <!-- Skeleton loading -->
      <div x-show="loading" class="product-grid skeleton-shimmer">
        <template x-for="i in 6" :key="i">
          <div class="product-card card" style="pointer-events:none">
            <div class="product-card-img skeleton-image-shim"></div>
            <div class="product-card-body" style="padding:12px">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text" style="width:30%"></div>
            </div>
          </div>
        </template>
      </div>

      <!-- Error state -->
      <div x-show="!loading && error" class="empty-state">
        <div class="empty-state-visual"><i class="fas fa-exclamation-triangle" style="font-size:3.5rem;color:var(--text-muted)"></i></div>
        <h3>${t('products.loadError')}</h3>
        <p x-text="error"></p>
        <button class="btn btn-primary" @click="reload()" style="margin-top:16px">${t('common.retry')}</button>
      </div>

      <!-- Product grid -->
      <div x-show="!loading && !error && products.length" class="product-grid" id="productGrid">
        <template x-for="(p, i) in products" :key="p.id">
          <a :href="'#/product-detail?id='+p.id" class="product-card card" :class="'animate-on-scroll stagger-' + Math.min(i + 1, 8)" :aria-label="escapeHtml(p.title || 'Product') + ' — ' + formatPrice(p.price)">
            <div class="product-card-img">
              <img :src="p.primaryImageUrl || p.imageUrl || ''" :alt="escapeHtml(p.title || 'Product')" loading="lazy">
              <span x-show="p.status != null" class="product-card-badge" :class="'status-' + (p.status === 0 || p.status === 'Available' ? 'available' : 'draft')" x-text="p.status === 0 || p.status === 'Available' ? '${t('product.statusAvailable')}' : '${t('product.statusSold')}'"></span>
            </div>
            <div class="product-card-body">
              <div class="product-card-title" x-text="p.title || 'Product'"></div>
              <div class="product-card-price" x-text="formatPrice(p.price)"></div>
              <div class="product-card-meta">
                <span x-show="p.categoryName" class="product-card-category"><i class="fas fa-tag"></i><span x-text="p.categoryName"></span></span>
                <span x-show="p.stockQuantity != null" class="product-card-stock" x-text="p.stockQuantity + ' ${t('products.inStock')}'"></span>
              </div>
            </div>
          </a>
        </template>
      </div>

      <!-- Empty state -->
      <div x-show="!loading && !error && !products.length" class="empty-state">
        <div class="empty-state-visual"><i class="fas fa-box-open" style="font-size:3.5rem;color:var(--text-muted)"></i></div>
        <h3>${t('products.noProducts')}</h3>
        <p>${t('common.clearFilters')}</p>
        <button class="btn btn-primary" @click="resetFilters()" style="margin-top:16px">${t('common.clearFilters')}</button>
      </div>

      <!-- Alpine pagination -->
      <div x-show="!loading && products.length" x-data="pagination({ page, totalPages, onPageChange: goToPage })">
        <div class="d-flex align-items-center gap-2" style="justify-content:center;margin-top:24px">
          <template x-for="p in pages" :key="p">
            <span>
              <button x-show="p !== '...'" x-text="p" :class="'btn btn-sm ' + (p === currentPage ? 'btn-primary' : 'btn-ghost')" @click="goTo(p)"></button>
              <span x-show="p === '...'" class="px-1" style="color:var(--text-muted)">&hellip;</span>
            </span>
          </template>
        </div>
      </div>

      <!-- Infinite scroll sentinel (mobile only) -->
      <div id="productSentinel" x-show="!loading && products.length && totalPages > 1" style="height:1px;width:100%"></div>

      <!-- Mobile full-screen search overlay -->
      <div x-show="searchOverlayOpen" class="search-overlay open" @click.outside="closeSearchOverlay()">
        <div class="search-overlay-header">
          <input type="text" x-model="mobileSearch" id="productMobileSearchInput" class="form-input form-control" placeholder="${t('products.search')}" @keydown.enter="applyMobileSearch()">
          <button class="btn btn-ghost btn-icon" @click="closeSearchOverlay()" aria-label="${t('common.close')}"><i class="fas fa-times fa-lg"></i></button>
        </div>
        <button class="btn btn-primary" @click="applyMobileSearch()" style="align-self:center;margin-top:12px"><i class="fas fa-search"></i> ${t('common.search')}</button>
      </div>

      <!-- Mobile filter bottom sheet -->
      <div x-show="filterSheetOpen" class="filter-sheet-overlay show" @click.self="filterSheetOpen = false">
        <div class="filter-sheet">
          <div class="filter-sheet-header">
            <h3>${t('products.filters')}</h3>
            <button class="btn btn-ghost btn-icon" @click="filterSheetOpen = false" aria-label="${t('common.close')}"><i class="fas fa-times"></i></button>
          </div>
          <div class="filter-sheet-body">
            <div class="form-group">
              <label>${t('products.category')}</label>
              <select class="form-select" x-model="categoryId">
                <option value="">${t('products.allCategories')}</option>
                <template x-for="cat in categories" :key="cat.id">
                  <option :value="cat.id" x-text="cat.name"></option>
                </template>
              </select>
            </div>
            <div class="form-group">
              <label>${t('products.condition') || 'Condition'}</label>
              <select class="form-select" x-model="condition">
                <option value="">${t('products.allConditions')}</option>
                <option value="New">${t('product.new')}</option>
                <option value="Used">${t('product.used')}</option>
              </select>
            </div>
            <div class="form-group">
              <label>${t('products.sort')}</label>
              <select class="form-select" x-model="sort">
                <option value="">${t('products.sort')}</option>
                <option value="newest">${t('products.newest')}</option>
                <option value="price-asc">${t('products.priceLowHigh')}</option>
                <option value="price-desc">${t('products.priceHighLow')}</option>
              </select>
            </div>
            <div class="form-group">
              <label>${t('products.minPrice')}</label>
              <input type="number" class="form-input form-control" x-model.number="minPrice" min="0" step="1" placeholder="${t('products.minPrice')}" />
            </div>
            <div class="form-group">
              <label>${t('products.maxPrice')}</label>
              <input type="number" class="form-input form-control" x-model.number="maxPrice" min="0" step="1" placeholder="${t('products.maxPrice')}" />
            </div>
            <label class="filter-check" style="margin-top:4px">
              <input type="checkbox" x-model="inStock" />
              <span>${t('products.inStockOnly')}</span>
            </label>
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

