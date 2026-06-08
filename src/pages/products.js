import { t } from '../app/i18n.js';
import { setPageMeta } from '../shared/utils/seo.js';
import '../features/products/search.js';
import { renderSearchBar } from '../widgets/products/render-search-bar.js';
import { renderProductGrid } from '../widgets/products/render-product-grid.js';
import { renderMobileOverlays } from '../widgets/products/render-mobile-overlays.js';

export default async function renderProducts(_container, _fullPath, _params) {
  setPageMeta(t('products.metaTitle'), t('products.metaDesc'));
  _container.innerHTML = `
    <div x-data="productsPage" class="products-page-alpine" @keydown.escape.window="closeSearchOverlay(); filterSheetOpen = false">
      ${renderSearchBar()}
      ${renderProductGrid()}
      ${renderMobileOverlays()}
    </div>`;
}
