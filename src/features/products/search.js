import { api } from '../../shared/api/client.js';
import { t } from '../../shared/utils/i18n.js';
import { escapeHtml, observeAnimations, initPullToRefresh, initInfiniteScroll } from '../../shared/utils/dom.js';
import { formatPrice } from '../../shared/utils/format.js';
import Alpine from '@alpinejs/csp';

Alpine.data('productsPage', () => ({
  search: '',
  categoryId: '',
  condition: '',
  sort: '',
  minPrice: '',
  maxPrice: '',
  inStock: false,

  products: [],
  categories: [],
  page: 1,
  totalPages: 1,
  pageSize: 12,
  loading: true,
  error: null,

  filterSheetOpen: false,
  searchOverlayOpen: false,
  mobileSearch: '',

  isListView: false,
  totalItems: 0,

  async init() {
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

    this.$nextTick(() => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && this.totalPages > 1) {
        this._scrollCleanup = initInfiniteScroll({
          sentinelId: 'productSentinel',
          onLoadMore: () => this.loadMore(),
        });
      }
    });

    this._ptrCleanup = initPullToRefresh({ onRefresh: () => { this.page = 1; this.loadProducts(); } });
  },

  destroy() {
    if (this._ptrCleanup) this._ptrCleanup();
    if (this._scrollCleanup) this._scrollCleanup();
  },

  async loadCategories() {
    try {
      const res = await api.get('/categories', { pageSize: 100 });
      this.categories = res.items || res.data || res || [];
    } catch { /* categories stay empty */ }
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
      this.totalItems = data.totalCount || data.total || this.products.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
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

  clearFiltersAndClose() {
    this.resetFilters();
    this.filterSheetOpen = false;
  },

  hasActiveFilters() {
    return this.search || this.categoryId || this.condition || this.minPrice || this.maxPrice || this.inStock;
  },

  removeFilter(field) {
    if (field === 'search') { this.search = ''; this.mobileSearch = ''; }
    else if (field === 'categoryId') this.categoryId = '';
    else if (field === 'condition') this.condition = '';
    else if (field === 'minPrice') this.minPrice = '';
    else if (field === 'maxPrice') this.maxPrice = '';
    else if (field === 'inStock') this.inStock = false;
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
