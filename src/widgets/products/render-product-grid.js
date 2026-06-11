import { t } from '../../shared/utils/i18n.js';

export function renderProductGrid() {
  return `
    <div x-show="loading" class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3 skeleton-shimmer">
      <template x-for="i in 6" :key="i">
        <div class="col">
          <div class="product-card card pe-none">
            <div class="product-card-img skeleton-image-shim"></div>
            <div class="product-card-body p-3">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text xshort"></div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div x-show="!loading && error" class="empty-state">
      <div class="empty-state-visual"><i class="fas fa-exclamation-triangle text-muted fs-hero"></i></div>
      <h3>${t('products.loadError')}</h3>
      <p x-text="error"></p>
      <button class="btn btn-primary mt-3" @click="reload()">${t('common.retry')}</button>
    </div>

    <div x-show="!loading && !error && products.length" :class="isListView ? 'product-list-view d-flex flex-column gap-3' : 'row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3'" id="productGrid">
      <template x-for="(p, i) in products" :key="p.id">
        <div :class="isListView ? 'w-100' : 'col'">
          <a :href="'#/product-detail?id='+p.id" class="product-card card" :class="'animate-on-scroll stagger-' + (i + 1 > 8 ? 8 : i + 1)" :aria-label="escapeHtml(p.title || $t('common.product')) + ' — ' + formatPrice(p.price)">
            <div class="product-card-img">
              <img :src="p.primaryImageUrl || p.imageUrl || ''" :alt="escapeHtml(p.title || $t('common.product'))" loading="lazy">
              <span x-show="p.status != null" class="product-card-badge" :class="'status-' + (p.status === 0 || p.status === 'Available' ? 'available' : 'draft')" x-text="p.status === 0 || p.status === 'Available' ? '${t('product.statusAvailable')}' : '${t('product.statusSold')}'"></span>
            </div>
            <div class="product-card-body">
              <div class="product-card-title" x-text="p.title || $t('common.product')"></div>
              <div class="product-card-price" x-text="formatPrice(p.price)"></div>
              <div class="product-card-meta">
                <span x-show="p.categoryName" class="product-card-category"><i class="fas fa-tag"></i><span x-text="p.categoryName"></span></span>
                <span x-show="p.stockQuantity != null" class="product-card-stock" x-text="p.stockQuantity + ' ${t('products.inStock')}'"></span>
              </div>
            </div>
          </a>
        </div>
      </template>
    </div>

    <div x-show="!loading && !error && !products.length" class="empty-state">
      <div class="empty-state-visual"><i class="fas fa-box-open text-muted fs-hero"></i></div>
      <h3>${t('products.noProducts')}</h3>
      <p>${t('common.clearFilters')}</p>
      <button class="btn btn-primary mt-3" @click="resetFilters()">${t('common.clearFilters')}</button>
    </div>

    <div x-show="!loading && products.length" x-data="pagination({ page: page, totalPages: totalPages, onPageChange: goToPage })">
      <div class="d-flex align-items-center justify-content-center gap-2 mt-4">
        <template x-for="p in pages" :key="p">
          <span>
            <button x-show="p !== '...'" x-text="p" :class="'btn btn-sm ' + (p === currentPage ? 'btn-primary' : 'btn-ghost')" @click="goTo(p)"></button>
            <span x-show="p === '...'" class="px-1 text-muted">&hellip;</span>
          </span>
        </template>
      </div>
    </div>

    <div id="productSentinel" x-show="!loading && products.length && totalPages > 1" style="height:1px;width:100%"></div>`;
}
