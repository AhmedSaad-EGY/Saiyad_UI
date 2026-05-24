import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { showLoading, renderEmptyState, escapeHtml, observeAnimations, manageFocus, fadeInContent, initPullToRefresh } from '../core/utils/dom.js';
import { renderProductCards, debounce } from '../core/utils/ui.js';

export default async function renderProducts(_container, _fullPath, params) {
  _container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-store"></i> ${t('products.title')}</h2></div>
    <div class="search-bar">
      <input type="text" class="form-input" id="productSearch" placeholder="${t('products.search')}" />
      <div class="desktop-filters">
        <select class="form-select" id="productCategory"><option value="">${t('products.allCategories')}</option></select>
        <select class="form-select" id="productCondition">
          <option value="">${t('products.allConditions')}</option>
          <option value="New">${t('product.new')}</option>
          <option value="Used">${t('product.used')}</option>
        </select>
        <select class="form-select" id="productSort">
          <option value="">${t('products.sort')}</option>
          <option value="newest">${t('products.newest')}</option>
          <option value="price-asc">${t('products.priceLowHigh')}</option>
          <option value="price-desc">${t('products.priceHighLow')}</option>
        </select>
        <input type="number" class="form-input" id="productMinPrice" min="0" step="1" placeholder="${t('products.minPrice')}" />
        <input type="number" class="form-input" id="productMaxPrice" min="0" step="1" placeholder="${t('products.maxPrice')}" />
        <label class="filter-check">
          <input type="checkbox" id="productInStock" />
          <span>${t('products.inStockOnly')}</span>
        </label>
        <a href="#/products" class="btn btn-ghost btn-sm" id="clearProductFilters">${t('common.clearFilters')}</a>
      </div>
      <button class="btn btn-outline filter-toggle-btn" id="filterToggleBtn"><i class="fas fa-sliders-h"></i> ${t('products.filters')}</button>
      <button class="btn btn-outline search-toggle-btn" id="searchToggleBtn" aria-label="${t('common.search')}"><i class="fas fa-search"></i></button>
    </div>
    <div id="productList" class="product-grid"></div>
    <div id="productPagination" style="display:flex;justify-content:center;gap:8px;margin-top:24px"></div>

    <!-- Mobile full-screen search overlay -->
    <div class="search-overlay" id="searchOverlay">
      <div class="search-overlay-header">
        <input type="text" id="mobileSearchInput" class="form-input" placeholder="${t('products.search')}" autofocus>
        <button class="btn btn-ghost btn-icon" id="searchOverlayClose" aria-label="${t('common.close')}"><i class="fas fa-times fa-lg"></i></button>
      </div>
      <div style="color:var(--text-muted);font-size:var(--text-sm);text-align:center;margin-top:12px">${t('products.searchHint') || 'Type to search products'}</div>
    </div>

    <!-- Mobile filter bottom sheet -->
    <div class="filter-sheet-overlay" id="filterOverlay">
      <div class="filter-sheet" id="filterSheet">
        <div class="filter-sheet-header">
          <h3>${t('products.filters')}</h3>
          <button class="btn btn-ghost btn-icon" id="filterCloseBtn" aria-label="${t('common.close')}"><i class="fas fa-times"></i></button>
        </div>
        <div class="filter-sheet-body">
          <div class="form-group">
            <label for="mfCategory">${t('products.category')}</label>
            <select class="form-select" id="mfCategory"></select>
          </div>
          <div class="form-group">
            <label for="mfCondition">${t('products.condition') || 'Condition'}</label>
            <select class="form-select" id="mfCondition">
              <option value="">${t('products.allConditions')}</option>
              <option value="New">${t('product.new')}</option>
              <option value="Used">${t('product.used')}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="mfSort">${t('products.sort')}</label>
            <select class="form-select" id="mfSort">
              <option value="">${t('products.sort')}</option>
              <option value="newest">${t('products.newest')}</option>
              <option value="price-asc">${t('products.priceLowHigh')}</option>
              <option value="price-desc">${t('products.priceHighLow')}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="mfMinPrice">${t('products.minPrice')}</label>
            <input type="number" class="form-input" id="mfMinPrice" min="0" step="1" placeholder="${t('products.minPrice')}" />
          </div>
          <div class="form-group">
            <label for="mfMaxPrice">${t('products.maxPrice')}</label>
            <input type="number" class="form-input" id="mfMaxPrice" min="0" step="1" placeholder="${t('products.maxPrice')}" />
          </div>
          <label class="filter-check" style="margin-top:4px">
            <input type="checkbox" id="mfInStock" />
            <span>${t('products.inStockOnly')}</span>
          </label>
        </div>
        <div class="filter-sheet-footer">
          <button class="btn btn-ghost" id="filterClearBtn">${t('common.clearFilters')}</button>
          <button class="btn btn-primary" id="filterApplyBtn"><i class="fas fa-check"></i> ${t('common.showResults') || 'Show Results'}</button>
        </div>
      </div>
    </div>
  `;

  let page = parseInt(params.page, 10) || 1;
  const pageSize = 12;

  async function loadCategories() {
    try {
      const res = await api.get('/categories', { pageSize: 100 });
      const sel = document.getElementById('productCategory');
      const cats = res.items || res.data || res || [];
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        sel.appendChild(opt);
      });
    } catch {}
  }

  function syncUrl() {
    const s = document.getElementById('productSearch')?.value || '';
    const c = document.getElementById('productCategory')?.value || '';
    const condition = document.getElementById('productCondition')?.value || '';
    const sort = document.getElementById('productSort')?.value || '';
    const minPrice = document.getElementById('productMinPrice')?.value || '';
    const maxPrice = document.getElementById('productMaxPrice')?.value || '';
    const inStock = document.getElementById('productInStock')?.checked || false;
    const qp = new URLSearchParams();
    if (s) qp.set('search', s);
    if (c) qp.set('categoryId', c);
    if (condition) qp.set('condition', condition);
    if (sort) qp.set('sort', sort);
    if (minPrice) qp.set('minPrice', minPrice);
    if (maxPrice) qp.set('maxPrice', maxPrice);
    if (inStock) qp.set('inStock', '1');
    if (page > 1) qp.set('page', page);
    const qs = qp.toString();
    history.replaceState(null, '', qs ? `#/products?${qs}` : '#/products');
  }

  async function loadProducts() {
    const list = document.getElementById('productList');
    showLoading(list, 'card');
    const search = document.getElementById('productSearch')?.value || '';
    const categoryId = document.getElementById('productCategory')?.value || '';
    const condition = document.getElementById('productCondition')?.value || '';
    const sort = document.getElementById('productSort')?.value || '';
    const minPrice = document.getElementById('productMinPrice')?.value || '';
    const maxPrice = document.getElementById('productMaxPrice')?.value || '';
    const inStock = document.getElementById('productInStock')?.checked || false;

    try {
      const apiParams = { page, pageSize };
      if (search) apiParams.searchTerm = search;
      if (categoryId) apiParams.categoryId = categoryId;
      if (condition) apiParams.condition = condition;
      if (minPrice) apiParams.minPrice = minPrice;
      if (maxPrice) apiParams.maxPrice = maxPrice;
      if (inStock) apiParams.inStock = true;
      if (sort === 'newest') apiParams.sortBy = 'createdAt';
      if (sort === 'price-asc') { apiParams.sortBy = 'price'; apiParams.sortDirection = 'asc'; }
      if (sort === 'price-desc') { apiParams.sortBy = 'price'; apiParams.sortDirection = 'desc'; }
      const data = await api.get('/products', apiParams);
      let items = data.items || data.data || [];
      if (!items.length) {
        renderEmptyState(list, { icon: 'fa-box-open', title: t('products.noProducts'), desc: t('common.clearFilters'), actionText: t('common.clearFilters'), actionHref: '#/products' });
        manageFocus(list);
      } else {
        renderProductCards(list, items);
        fadeInContent(list);
        observeAnimations();
        manageFocus(list);
      }

      const total = data.totalCount || data.total || items.length;
      const pages = Math.ceil(total / pageSize);
      const pagination = document.getElementById('productPagination');
      pagination.innerHTML = '';
      for (let i = 1; i <= pages && i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm ${i === page ? 'btn-primary' : 'btn-ghost'}`;
        btn.textContent = i;
        btn.onclick = () => { page = i; syncUrl(); loadProducts(); };
        pagination.appendChild(btn);
      }
    } catch (e) {
      renderEmptyState(list, { icon: 'fa-exclamation-triangle', title: t('products.loadError'), desc: escapeHtml(e.message), actionText: t('common.retry'), actionFn: () => loadProducts() });
    }
  }

  await loadCategories();

  const searchInput = document.getElementById('productSearch');
  const categorySelect = document.getElementById('productCategory');
  const conditionSelect = document.getElementById('productCondition');
  const sortSelect = document.getElementById('productSort');
  const minPriceInput = document.getElementById('productMinPrice');
  const maxPriceInput = document.getElementById('productMaxPrice');
  const inStockInput = document.getElementById('productInStock');
  if (params.search) searchInput.value = params.search;
  if (params.categoryId) categorySelect.value = params.categoryId;
  if (params.condition) conditionSelect.value = params.condition;
  if (params.sort) sortSelect.value = params.sort;
  if (params.minPrice) minPriceInput.value = params.minPrice;
  if (params.maxPrice) maxPriceInput.value = params.maxPrice;
  if (params.inStock === '1') inStockInput.checked = true;

  await loadProducts();

  function reloadFromFilters() { page = 1; syncUrl(); loadProducts(); }
  searchInput.addEventListener('input', debounce(reloadFromFilters, 400));
  categorySelect.addEventListener('change', reloadFromFilters);
  conditionSelect.addEventListener('change', reloadFromFilters);
  sortSelect.addEventListener('change', reloadFromFilters);
  minPriceInput.addEventListener('input', debounce(reloadFromFilters, 500));
  maxPriceInput.addEventListener('input', debounce(reloadFromFilters, 500));
  inStockInput.addEventListener('change', reloadFromFilters);

  // Mobile filter bottom sheet
  const filterOverlay = document.getElementById('filterOverlay');
  const filterSheet = document.getElementById('filterSheet');
  const filterToggle = document.getElementById('filterToggleBtn');
  const filterClose = document.getElementById('filterCloseBtn');
  const filterApply = document.getElementById('filterApplyBtn');
  const filterClear = document.getElementById('filterClearBtn');
  const mfCategory = document.getElementById('mfCategory');
  const mfCondition = document.getElementById('mfCondition');
  const mfSort = document.getElementById('mfSort');
  const mfMinPrice = document.getElementById('mfMinPrice');
  const mfMaxPrice = document.getElementById('mfMaxPrice');
  const mfInStock = document.getElementById('mfInStock');

  function openSheet() {
    mfCategory.value = categorySelect.value;
    mfCondition.value = conditionSelect.value;
    mfSort.value = sortSelect.value;
    mfMinPrice.value = minPriceInput.value;
    mfMaxPrice.value = maxPriceInput.value;
    mfInStock.checked = inStockInput.checked;
    filterOverlay.classList.add('show');
  }

  function closeSheet() {
    filterOverlay.classList.remove('show');
  }

  function syncFromSheet() {
    categorySelect.value = mfCategory.value;
    conditionSelect.value = mfCondition.value;
    sortSelect.value = mfSort.value;
    minPriceInput.value = mfMinPrice.value;
    maxPriceInput.value = mfMaxPrice.value;
    inStockInput.checked = mfInStock.checked;
  }

  filterToggle?.addEventListener('click', openSheet);
  filterClose?.addEventListener('click', closeSheet);
  filterOverlay?.addEventListener('click', (e) => { if (e.target === filterOverlay) closeSheet(); });
  filterApply?.addEventListener('click', () => {
    syncFromSheet();
    closeSheet();
    reloadFromFilters();
  });
  filterClear?.addEventListener('click', () => {
    mfCategory.value = '';
    mfCondition.value = '';
    mfSort.value = '';
    mfMinPrice.value = '';
    mfMaxPrice.value = '';
    mfInStock.checked = false;
  });
  // Keep sheet categories in sync with the desktop select
  const mfObserver = new MutationObserver(() => {
    mfCategory.innerHTML = categorySelect.innerHTML;
  });
  mfObserver.observe(categorySelect, { childList: true, subtree: true });

  initPullToRefresh({ onRefresh: () => { page = 1; syncUrl(); loadProducts(); } });

  // Mobile search overlay
  const searchOverlay = document.getElementById('searchOverlay');
  const searchToggle = document.getElementById('searchToggleBtn');
  const searchOverlayClose = document.getElementById('searchOverlayClose');
  const mobileSearch = document.getElementById('mobileSearchInput');
  let searchDebounceTimer;

  function openSearch() {
    searchOverlay.classList.add('open');
    mobileSearch.value = searchInput.value;
    setTimeout(() => mobileSearch.focus(), 100);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
  }

  searchToggle?.addEventListener('click', openSearch);
  searchOverlayClose?.addEventListener('click', closeSearch);
  searchOverlay?.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
  mobileSearch?.addEventListener('input', () => {
    searchInput.value = mobileSearch.value;
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(reloadFromFilters, 300);
  });
  mobileSearch?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { closeSearch(); reloadFromFilters(); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });
}


