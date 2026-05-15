async function renderProducts(_container, _fullPath, params) {
  _container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-store"></i> ${t('products.title')}</h2></div>
    <div class="search-bar">
      <input type="text" class="form-input" id="productSearch" placeholder="${t('products.search')}" />
      <select class="form-select" id="productCategory"><option value="">${t('products.allCategories')}</option></select>
      <select class="form-select" id="productSort">
        <option value="">${t('products.sort')}</option>
        <option value="price_asc">${t('products.priceLowHigh')}</option>
        <option value="price_desc">${t('products.priceHighLow')}</option>
        <option value="newest">${t('products.newest')}</option>
      </select>
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
    const so = document.getElementById('productSort')?.value || '';
    const qp = new URLSearchParams();
    if (s) qp.set('search', s);
    if (c) qp.set('categoryId', c);
    if (so) qp.set('sort', so);
    if (page > 1) qp.set('page', page);
    const qs = qp.toString();
    history.replaceState(null, '', qs ? `#/products?${qs}` : '#/products');
  }

  async function loadProducts() {
    const list = document.getElementById('productList');
    showLoading(list, 'card');
    const search = document.getElementById('productSearch')?.value || '';
    const categoryId = document.getElementById('productCategory')?.value || '';
    const sort = document.getElementById('productSort')?.value || '';

    try {
      const apiParams = { page, pageSize };
      if (search) apiParams.searchTerm = search;
      if (categoryId) apiParams.categoryId = categoryId;
      const data = await api.get('/products', apiParams);
      const items = data.items || data.data || [];
      if (sort === 'price_asc') items.sort((a, b) => (a.price || 0) - (b.price || 0));
      if (sort === 'price_desc') items.sort((a, b) => (b.price || 0) - (a.price || 0));
      if (sort === 'newest') items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      if (!items.length) {
        renderEmptyState(list, { icon: 'fa-box-open', title: t('products.noProducts'), desc: t('common.clearFilters'), actionText: t('common.clearFilters'), actionHref: '#/products' });
      } else {
        renderProductCards(list, items);
        observeAnimations();
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
  const sortSelect = document.getElementById('productSort');
  if (params.search) searchInput.value = params.search;
  if (params.categoryId) categorySelect.value = params.categoryId;
  if (params.sort) sortSelect.value = params.sort;

  await loadProducts();

  function reloadFromFilters() { page = 1; syncUrl(); loadProducts(); }
  searchInput.addEventListener('input', debounce(reloadFromFilters, 400));
  categorySelect.addEventListener('change', reloadFromFilters);
  sortSelect.addEventListener('change', reloadFromFilters);
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
