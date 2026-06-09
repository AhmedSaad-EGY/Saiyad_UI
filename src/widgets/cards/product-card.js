import { t } from '../../shared/utils/i18n.js';
import { formatPrice, statusClass, tStatus } from '../../shared/utils/format.js';
import { escapeHtml, renderEmptyState, observeAnimations } from '../../shared/utils/dom.js';
import { createModal } from '../ui/modal.js';
import { registerRouteCleanup } from '../../shared/utils/events.js';
import { animate } from '../../shared/utils/dom.js';
import { getRecentlyViewed } from '../../shared/utils/recently-viewed.js';
import { getProductLink, getRecentLink } from '../../features/products/routing.js';

export function renderProductCards(container, products) {
  if (!products || !products.length) {
    renderEmptyState(container, {
      icon: 'fa-fish',
      title: t('products.noProducts'),
      desc: t('products.noProductsDesc'),
    });
    return;
  }
  container.innerHTML = products.map((p, i) => {
    const title = p.title || p.productTitle || t('common.product');
    const img = p.primaryImageUrl || p.imageUrl || '';
    const statusText = tStatus(p.status, "product");
    return `
      <a href="#/product-detail?id=${p.id}"
         class="product-card card animate-on-scroll stagger-${Math.min(i + 1, 8)}"
         aria-label="${escapeHtml(title)} — ${formatPrice(p.price)}">
        <div class="product-card-img">
          ${img
            ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy">`
            : `<div class="img-placeholder"><i class="fas fa-image"></i></div>`}
          ${p.status != null
            ? `<span class="product-card-badge ${statusClass(p.status)}">${escapeHtml(statusText)}</span>`
            : ''}
          <button class="quick-add-btn" data-quick-add="${p.id}" aria-label="${t('product.addToCart')}" title="${t('product.addToCart')}"><i class="fas fa-cart-plus"></i></button>
        </div>
        <div class="product-card-body">
          <div class="product-card-title">${escapeHtml(title)}</div>
          <div class="product-card-price">${formatPrice(p.price)}</div>
          <div class="product-card-meta">
            ${p.categoryName
              ? `<span class="product-card-category"><i class="fas fa-tag"></i>${escapeHtml(p.categoryName)}</span>`
              : ''}
            ${p.stockQuantity != null
              ? `<span class="product-card-stock">${p.stockQuantity} ${t('products.inStock')}</span>`
              : ''}
          </div>
        </div>
      </a>`;
  }).join('');
  observeAnimations();
}

export function openQuickView(product) {
  const existing = document.querySelector(".modal-overlay.show");
  if (existing) existing.remove();

  const title = product.title || product.product?.title || t('common.product');
  const price = formatPrice(product.price || product.currentHighestBid || product.startingPrice);
  const image = product.primaryImageUrl || product.product?.primaryImageUrl || "";
  const desc = product.description || product.product?.description || "";
  const link = getProductLink(product);

  const { close, overlay } = createModal(`
      <div class="d-flex gap-4 flex-wrap">
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" class="flex-shrink-0" style="width:180px;height:180px;object-fit:cover;border-radius:var(--radius-md)">` : ""}
        <div style="flex:1;min-width:200px">
          <h3>${escapeHtml(title)}</h3>
          <div class="fw-bold text-primary" style="font-size:1.4rem;margin:8px 0">${price}</div>
          <p class="text-secondary-sm" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${escapeHtml(desc) || t("product.noDescription")}</p>
          <div class="modal-actions mt-4">
            <a href="${link}" class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-eye"></i> ${t("common.page")}</a>
            <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">${t("common.close")}</button>
          </div>
        </div>
      </div>`, { ariaLabel: "Quick view" });

  registerRouteCleanup(() => close());
  animate(overlay, 'fadeIn', { duration: '0.2s' });
  const qvModal = overlay.querySelector('.modal');
  if (qvModal) animate(qvModal, 'zoomIn', { duration: '0.25s' });
  requestAnimationFrame(() => {
    const f = overlay.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (f) f.focus();
  });
}

export function renderRecentlyViewed(container) {
  if (!container) return;
  const viewed = getRecentlyViewed();
  if (!viewed.length) return;
  container.innerHTML = `
    <div class="section-header animate-on-scroll">
      <h2><i class="fas fa-history"></i> ${t("common.recentlyViewed")}</h2>
    </div>
    <div class="recently-viewed-strip">
      ${viewed.map((v) => `
        <a href="${getRecentLink(v)}" class="recently-viewed-item" title="${escapeHtml(v.title)}">
          ${v.image ? `<img src="${v.image}" alt="${escapeHtml(v.title)}" loading="lazy">` : '<div class="d-flex align-items-center justify-content-center text-muted" style="width:60px;height:60px;background:var(--body-bg);border-radius:var(--radius-sm)"><i class="fas fa-image"></i></div>'}
          <div class="recently-viewed-info">
            <span class="recently-viewed-title">${escapeHtml(v.title)}</span>
            ${v.price != null ? `<span class="recently-viewed-price">${formatPrice(v.price)}</span>` : ""}
            <span class="recently-viewed-type text-uppercase text-muted" style="font-size:0.7rem;letter-spacing:0.05em">
              <i class="fas ${v.type === "auction" ? "fa-gavel" : "fa-tag"}" aria-hidden="true"></i>
              ${v.type === "auction" ? t("nav.auctions") : t("nav.products")}
            </span>
        </a>`).join("")}
    </div>`;
  observeAnimations();
}
