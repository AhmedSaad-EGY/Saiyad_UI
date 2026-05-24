import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { showLoading, renderEmptyState, escapeHtml, observeAnimations, manageFocus } from '../core/utils/dom.js';
import { renderProductCards, debounce } from '../core/utils/ui.js';

export default async function renderProducts(_container, _fullPath, params) {
  _container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-store"></i> ${t('products.title')}</h2></div>
    <div class="search-bar">
      <input type="text" class="form-input" id="productSearch" placeholder="${t('products.search')}" />
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
    <div id="productList" class="product-grid"></div>
    <div id="productPagination" style="display:flex;justify-content:center;gap:8px;margin-top:24px"></div>
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
}


