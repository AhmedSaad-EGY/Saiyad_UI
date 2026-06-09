import { t } from '../../shared/utils/i18n.js';
import { skeletonCard, SKELETON_ROW_CLASSES, CARD_ROW_CLASSES } from './render-skeleton.js';

export function renderAuctionsSection() {
  const skeletons = skeletonCard().repeat(4);
  return `
    <div class="section-header section-header-offset animate-on-scroll">
      <h2>${t("home.activeAuctions")}</h2>
      <a href="#/auctions" class="btn btn-outline btn-sm">${t("home.viewAll")}</a>
    </div>

    <div x-show="loading" class="${SKELETON_ROW_CLASSES}">${skeletons}</div>

    <div x-show="!loading && !error && auctions.length" class="${CARD_ROW_CLASSES}">
      <template x-for="(a, i) in auctions" :key="a.id">
        <div class="col">
          <a :href="'#/auction-detail?id=' + a.id"
             class="product-card card animate-on-scroll"
             :class="'stagger-' + Math.min(i + 1, 8)"
             :aria-label="(a.productTitle || $t('auction.item')) + ' — ' + formatPrice(a.currentHighestBid || a.startingPrice)">
            <div class="product-card-img">
              <img :src="a.productImageUrl || ''" :alt="a.productTitle || $t('auction.item')" loading="lazy">
              <span class="product-card-badge" :class="statusClass(a.status)" x-text="tStatus(a.status)"></span>
            </div>
            <div class="product-card-body">
              <div class="product-card-title" x-text="a.productTitle || $t('auction.item')"></div>
              <div class="current-bid" x-text="formatPrice(a.currentHighestBid || a.startingPrice)"></div>
              <div class="product-card-meta">
                <span><i class="fas fa-hourglass-half"></i><span x-text="timeLeft(a.endTime).timeStr"></span>
                <span x-show="timeLeft(a.endTime).urgent" class="ending-soon-badge">${t("auction.endingSoon")}</span></span>
              </div>
            </div>
            <div class="product-card-footer">
              <small>${t("common.start")}: <span x-text="formatPrice(a.startingPrice)"></span></small>
              <small><span x-text="a.bidCount || 0"></span> ${t("common.bids")}</small>
            </div>
          </a>
        </div>
      </template>
    </div>

    <div x-show="!loading && !error && !auctions.length" class="empty-state">
      <div class="empty-state-visual"><i class="fas fa-gavel text-muted fs-hero"></i></div>
      <h3>${t("home.noAuctions")}</h3>
    </div>

    <div x-show="!loading && recentlyViewedHtml" x-html="recentlyViewedHtml"></div>`;
}
