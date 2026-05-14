function $(sel, parent = document) { return parent.querySelector(sel); }
function $$(sel, parent = document) { return [...parent.querySelectorAll(sel)]; }

function showLoading(container, type = 'page') {
  const skeletons = {
    page: `
      <div style="padding:20px 0">
        <div class="skeleton skeleton-title" style="width:40%"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>`,
    card: `
      <div class="skeleton-grid">
        <div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:30%"></div><div class="skeleton skeleton-text short"></div></div></div>
        <div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:30%"></div><div class="skeleton skeleton-text short"></div></div></div>
        <div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:30%"></div><div class="skeleton skeleton-text short"></div></div></div>
      </div>`,
    detail: `
      <div class="skeleton-detail">
        <div class="skeleton skeleton-image" style="height:380px"></div>
        <div style="padding:16px 0">
          <div class="skeleton skeleton-title" style="width:60%"></div>
          <div class="skeleton skeleton-text" style="width:20%;height:32px"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      </div>`,
    table: `
      <div style="padding:12px 0">
        <div class="skeleton skeleton-row-header"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
      </div>`,
    form: `
      <div class="skeleton-form" style="padding:16px 0">
        <div class="skeleton skeleton-text" style="width:30%"></div>
        <div class="skeleton skeleton-input"></div>
        <div class="skeleton skeleton-text" style="width:30%"></div>
        <div class="skeleton skeleton-input"></div>
        <div class="skeleton skeleton-text" style="width:30%"></div>
        <div class="skeleton skeleton-input"></div>
      </div>`,
  };
  container.innerHTML = skeletons[type] || skeletons.page;
}

function showError(container, msg) {
  container.innerHTML = `<div class="alert alert-error">${escapeHtml(msg || t('common.error'))}</div>`;
}

function showErrorWithRetry(container, msg, retryFn) {
  const id = 'retry_' + Math.random().toString(36).slice(2, 8);
  container.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>${t('common.error')}</h3>
      <p>${escapeHtml(msg || t('common.error'))}</p>
      <button id="${id}" class="btn btn-primary" style="margin-top:16px">${t('common.retry') || 'Retry'}</button>
    </div>
  `;
  document.getElementById(id)?.addEventListener('click', retryFn);
}

function renderEmptyState(container, { icon, title, desc, actionText, actionHref, actionFn, actionClass = 'btn btn-primary' } = {}) {
  const id = 'es_' + Math.random().toString(36).slice(2, 8);
  const cta = actionHref
    ? `<a href="${actionHref}" class="${actionClass}" style="margin-top:16px">${actionText}</a>`
    : actionFn
      ? `<button id="${id}" class="${actionClass}" style="margin-top:16px">${actionText}</button>`
      : '';
  const illType = icon?.replace('fa-', '') || 'products';
  const illMap = { 'fa-shopping-cart': 'cart', 'fa-box-open': 'products', 'fa-gavel': 'auctions', 'fa-bell': 'bell', 'fa-box': 'orders', 'fa-search': 'search', 'fa-heart': 'heart', 'fa-exclamation-triangle': 'search' };
  const svgType = illMap[icon] || illType;
  container.innerHTML = `
    <div class="empty-state">
      <div style="margin-bottom:12px">${emptyIllustration(svgType)}</div>
      ${title ? `<h3>${title}</h3>` : ''}
      ${desc ? `<p>${desc}</p>` : ''}
      ${cta}
    </div>`;
  if (actionFn) document.getElementById(id)?.addEventListener('click', actionFn);
}

function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function getLocale() {
  return getCurrentLang() === 'ar' ? 'ar-EG' : 'en-US';
}

function getCurrency() {
  return 'EGP';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString(getLocale(), {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr; }
}

function formatPrice(n) {
  try {
    return new Intl.NumberFormat(getLocale(), { style: 'currency', currency: getCurrency() }).format(n || 0);
  } catch {
    return `$${Number(n || 0).toFixed(2)}`;
  }
}

function statusClass(status) {
  const map = {
    'Available': 'available', 'Sold': 'sold', 'Draft': 'draft',
    'Active': 'active', 'Finished': 'finished', 'Cancelled': 'draft',
    'Pending': 'pending', 'Paid': 'paid', 'Shipped': 'shipped', 'Delivered': 'available',
    'Valid': 'active', 'Rejected': 'draft', 'Winning': 'available',
  };
  return `status-${map[status] || 'draft'}`;
}

function renderStars(rating) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

/* ===== Skeleton-to-content morph transition ===== */
function transitionContent(container, realHTML) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = realHTML;
  wrapper.style.cssText = 'opacity:0;transition:opacity 0.25s ease';
  container.appendChild(wrapper);
  const skeleton = container.querySelector('.skeleton, .skeleton-grid, .skeleton-detail, .skeleton-form, .skeleton-row, .skeleton-row-header');
  if (skeleton) {
    skeleton.style.transition = 'opacity 0.2s ease';
    skeleton.style.opacity = '0';
    setTimeout(() => skeleton.remove(), 220);
  }
  requestAnimationFrame(() => { wrapper.style.opacity = '1'; });
  setTimeout(() => {
    container.innerHTML = realHTML;
  }, 300);
}

/* ===== Progressive image loading (blur-up) ===== */
function progressiveImg(src, alt = '', className = '') {
  if (!src) return `<div class="${className}" style="background:var(--body-bg);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:2rem"><i class="fas fa-image"></i></div>`;
  const id = 'pi_' + Math.random().toString(36).slice(2, 8);
  return `
    <div class="${className} progressive-wrap" style="position:relative;overflow:hidden;background:var(--body-bg)">
      <div id="${id}-placeholder" style="position:absolute;inset:0;background:var(--border);filter:blur(20px);transform:scale(1.1);opacity:1;transition:opacity 0.4s ease"></div>
      <img id="${id}-img" src="${src}" alt="${escapeHtml(alt)}" style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.4s ease" loading="lazy" onload="document.getElementById('${id}-placeholder').style.opacity='0';this.style.opacity='1'">
    </div>`;
}

/* ===== Recently viewed ===== */
function trackRecentlyViewed(id, title, image, price) {
  let viewed = JSON.parse(localStorage.getItem('sayiad_recent') || '[]');
  viewed = viewed.filter(v => v.id !== id);
  viewed.unshift({ id, title, image, price, time: Date.now() });
  if (viewed.length > 12) viewed = viewed.slice(0, 12);
  localStorage.setItem('sayiad_recent', JSON.stringify(viewed));
}

function renderRecentlyViewed(container) {
  const viewed = JSON.parse(localStorage.getItem('sayiad_recent') || '[]');
  if (!viewed.length) return;
  container.innerHTML = `
    <div class="section-header animate-on-scroll">
      <h2><i class="fas fa-history"></i> ${t('common.recentlyViewed')}</h2>
    </div>
    <div class="recently-viewed-strip">
      ${viewed.map(v => `
        <a href="${v.price != null && !v.isProduct ? '#/auction-detail?id=' : '#/product-detail?id='}${v.id}" class="recently-viewed-item" title="${escapeHtml(v.title)}">
          ${v.image ? `<img src="${v.image}" alt="${escapeHtml(v.title)}" loading="lazy">` : '<div style="width:60px;height:60px;background:var(--body-bg);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><i class="fas fa-image"></i></div>'}
          <div class="recently-viewed-info">
            <span class="recently-viewed-title">${escapeHtml(v.title)}</span>
            ${v.price != null ? `<span class="recently-viewed-price">${formatPrice(v.price)}</span>` : ''}
          </div>
        </a>
      `).join('')}
    </div>
  `;
  observeAnimations();
}

/* ===== Empty state SVG illustrations ===== */
function emptyIllustration(type) {
  const svgs = {
    cart: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M35 40h50l-5 30H40l-5-30z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><circle cx="45" cy="75" r="4" fill="var(--text-muted)"/><circle cx="65" cy="75" r="4" fill="var(--text-muted)"/><path d="M55 50l-5-8M65 50l5-8" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    products: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M40 45h40v30H40V45z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><path d="M50 55h20M50 62h14" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/><path d="M60 38v-6M60 76v6" stroke="var(--text-muted)" stroke-width="1.5"/></svg>`,
    auctions: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M55 35l25 25-8 8-25-25 8-8z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><path d="M72 52l8 8M50 70l-8 8" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"/><path d="M42 78l5-5" stroke="var(--text-muted)" stroke-width="2"/></svg>`,
    bell: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M60 32c-8 0-14 6-14 14v4c0 5-3 12-7 16l-2 2h46l-2-2c-4-4-7-11-7-16v-4c0-8-6-14-14-14z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><path d="M52 68c0 4 4 8 8 8s8-4 8-8" stroke="var(--text-muted)" stroke-width="2"/></svg>`,
    orders: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M40 38h40l4 8v36H36V46l4-8z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><path d="M48 55h24M48 63h16M48 71h20" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    search: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><circle cx="50" cy="50" r="14" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><path d="M60 60l12 12" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"/></svg>`,
    heart: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M60 40c-4-6-12-8-18-4s-8 12-4 18c3 4 22 22 22 22s19-18 22-22c4-6 2-14-4-18s-14-2-18 4z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/></svg>`,
  };
  return svgs[type] || svgs.products;
}

function openQuickView(product) {
  const existing = document.querySelector('.modal-overlay.show');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay show';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Quick view');

  const title = product.title || product.product?.title || 'Product';
  const price = formatPrice(product.price || product.currentHighestBid || product.startingPrice);
  const image = product.primaryImageUrl || product.product?.primaryImageUrl || '';
  const desc = product.description || product.product?.description || '';
  const id = product.id || product.productId;
  const link = product.currentHighestBid != null ? `#/auction-detail?id=${id}` : `#/product-detail?id=${id}`;

  overlay.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()">
      <div style="display:flex;gap:20px;flex-wrap:wrap">
        ${image ? `<img src="${image}" alt="${escapeHtml(title)}" style="width:180px;height:180px;object-fit:cover;border-radius:var(--radius-md);flex-shrink:0">` : ''}
        <div style="flex:1;min-width:200px">
          <h3>${escapeHtml(title)}</h3>
          <div style="font-size:1.4rem;font-weight:700;color:var(--primary);margin:8px 0">${price}</div>
          <p style="color:var(--text-secondary);font-size:0.88rem;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${escapeHtml(desc) || t('product.noDescription')}</p>
          <div class="modal-actions" style="margin-top:20px">
            <a href="${link}" class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-eye"></i> ${t('common.page')}</a>
            <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">${t('common.retry') || 'Close'}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}

/* ===== Lightbox ===== */
function openLightbox(images, startIndex = 0) {
  const existing = document.querySelector('.lightbox');
  if (existing) existing.remove();

  let current = startIndex;
  const lb = document.createElement('div');
  lb.className = 'lightbox show';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', 'Image gallery');

  const render = () => {
    const total = images.length;
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="Close"><i class="fas fa-times"></i></button>
      ${total > 1 ? `<button class="lightbox-nav lightbox-prev" aria-label="Previous"><i class="fas fa-chevron-${getCurrentLang() === 'ar' ? 'right' : 'left'}"></i></button>` : ''}
      <img class="lightbox-img" src="${images[current]}" alt="">
      ${total > 1 ? `<button class="lightbox-nav lightbox-next" aria-label="Next"><i class="fas fa-chevron-${getCurrentLang() === 'ar' ? 'left' : 'right'}"></i></button>` : ''}
      ${total > 1 ? `<div class="lightbox-counter">${current + 1} / ${total}</div>` : ''}
    `;

    lb.querySelector('.lightbox-close')?.addEventListener('click', close);
    lb.querySelector('.lightbox-prev')?.addEventListener('click', () => { current = (current - 1 + total) % total; render(); });
    lb.querySelector('.lightbox-next')?.addEventListener('click', () => { current = (current + 1) % total; render(); });
  };

  function close() { lb.remove(); document.removeEventListener('keydown', onKey); }
  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') { current = getCurrentLang() === 'ar' ? (current + 1) % images.length : (current - 1 + images.length) % images.length; render(); }
    if (e.key === 'ArrowRight') { current = getCurrentLang() === 'ar' ? (current - 1 + images.length) % images.length : (current + 1) % images.length; render(); }
  }

  render();
  document.body.appendChild(lb);
  document.addEventListener('keydown', onKey);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
}

/* ===== Form validation helpers ===== */
function showFieldError(el, msg) {
  el.classList.add('error');
  el.closest('.form-group')?.classList.add('has-error');
  let err = el.parentNode.querySelector('.form-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'form-error';
    el.parentNode.appendChild(err);
  }
  err.textContent = msg;
}

function clearFieldError(el) {
  el.classList.remove('error');
  el.closest('.form-group')?.classList.remove('has-error');
  const err = el.parentNode.querySelector('.form-error');
  if (err) err.remove();
}

function clearAllFieldErrors(formEl) {
  formEl.querySelectorAll('.form-input.error, .form-select.error, .form-textarea.error').forEach(clearFieldError);
}
