import { t } from '../../app/i18n.js';

export function renderProductsSection() {
  return `
    <div class="section-header">
      <h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("seller.listings")}</h3>
    </div>
    <div class="product-card-grid product-card-grid-dense" id="sellerProductGrid"></div>`;
}
