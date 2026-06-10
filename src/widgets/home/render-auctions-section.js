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

    <template x-if="recentlyViewed.length">
      <div>
        <div class="section-header section-header-offset animate-on-scroll">
          <h2><i class="fas fa-history"></i> ${t('common.recentlyViewed')}</h2>
        </div>
        <div class="recently-viewed-strip">
          <template x-for="v in recentlyViewed" :key="v.id">
            <a :href="v.href" class="recently-viewed-item" :title="v.title">
              <template x-if="v.image">
                <img :src="v.image" :alt="v.title" loading="lazy">
              </template>
              <template x-if="!v.image">
                <div class="recently-viewed-img-fallback"><i class="fas fa-image"></i></div>
              </template>
              <div class="recently-viewed-info">
                <span class="recently-viewed-title" x-text="v.title"></span>
                <span x-show="v.price != null" class="recently-viewed-price" x-text="formatPrice(v.price)"></span>
                <span class="recently-viewed-type text-muted text-uppercase">
                  <i :class="'fas ' + v.icon"></i> <span x-text="v.typeLabel"></span>
                </span>
              </div>
            </a>
          </template>
        </div>
      </div>
    </template>`;
}
