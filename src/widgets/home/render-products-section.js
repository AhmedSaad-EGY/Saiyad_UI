import { t } from '../../shared/utils/i18n.js';
import { skeletonCard, SKELETON_ROW_CLASSES, CARD_ROW_CLASSES } from './render-skeleton.js';

export function renderProductsSection() {
  const skeletons = skeletonCard().repeat(4);
  return `
    <div class="section-header animate-on-scroll">
      <h2>${t("home.latestProducts")}</h2>
      <a href="#/products" class="btn btn-outline btn-sm">${t("home.viewAll")}</a>
    </div>

    <div x-show="loading" class="${SKELETON_ROW_CLASSES}">${skeletons}</div>

    <div x-show="!loading && error" class="empty-state">
      <div class="empty-state-visual"><i class="fas fa-exclamation-triangle text-muted fs-hero"></i></div>
      <h3>${t("home.loadError")}</h3>
      <p x-text="error"></p>
      <button class="btn btn-primary mt-3" @click="loadData()"><i class="fas fa-sync-alt me-1"></i>${t("common.retry")}</button>
    </div>

    <div x-show="!loading && !error && products.length" class="${CARD_ROW_CLASSES}">
      <template x-for="(p, i) in products" :key="p.id">
        <div class="col">
          <a :href="'#/product-detail?id=' + p.id"
             class="product-card card animate-on-scroll"
             :class="'stagger-' + Math.min(i + 1, 8)"
             :aria-label="escapeHtml(p.title || $t('common.product')) + ' — ' + formatPrice(p.price)">
            <div class="product-card-img">
              <img :src="p.primaryImageUrl || p.imageUrl || ''" :alt="escapeHtml(p.title || $t('common.product'))" loading="lazy">
            </div>
            <div class="product-card-body">
              <div class="product-card-title" x-text="p.title || $t('common.product')"></div>
              <div class="product-card-price" x-text="formatPrice(p.price)"></div>
              <div class="product-card-meta">
                <span x-show="p.categoryName" class="product-card-category">
                  <i class="fas fa-tag"></i><span x-text="p.categoryName"></span>
                </span>
              </div>
            </div>
          </a>
        </div>
      </template>
    </div>

    <div x-show="!loading && !error && !products.length" class="empty-state">
      <div class="empty-state-visual"><i class="fas fa-box-open text-muted fs-hero"></i></div>
      <h3>${t("home.noProducts")}</h3>
    </div>`;
}
