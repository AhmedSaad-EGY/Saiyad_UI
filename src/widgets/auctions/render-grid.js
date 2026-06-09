import { t } from '../../shared/utils/i18n.js';

export function renderAuctionGrid() {
  return `
    <div x-show="loading" class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-4 g-3 skeleton-shimmer">
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
      <h3>${t("auctions.loadError")}</h3>
      <p x-text="error"></p>
      <button class="btn btn-primary mt-3" @click="reload()">${t('common.retry')}</button>
    </div>

    <div x-show="!loading && !error && auctions.length" class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-4 g-3">
      <template x-for="(a, i) in auctions" :key="a.id">
        <div class="col">
          <a :href="'#/auction-detail?id='+a.id" class="product-card card animate-on-scroll" :class="'stagger-' + Math.min(i + 1, 8)" :aria-label="(a.productTitle || $t('auction.item')) + ' — ' + formatPrice(a.currentHighestBid || a.startingPrice)" style="position:relative;overflow:hidden">
            <template x-if="a.bidCount >= 5 || timeLeft(a.endTime).urgent">
              <div class="ribbon-badge" style="position:absolute;top:10px;left:10px;background:var(--primary);color:var(--text-inverse);font-size:0.75rem;padding:2px 8px;border-radius:var(--radius-full);z-index:2;font-weight:bold;box-shadow:var(--shadow-sm)">
                <i class="fas fa-fire"></i> ${t('common.hot')}
              </div>
            </template>
            <div class="product-card-img">
              <img :src="a.productImageUrl || ''" :alt="a.productTitle || $t('common.product')" loading="lazy">
              <span class="product-card-badge" :class="statusClass(a.status)" x-text="tStatus(a.status)"></span>
            </div>
            <div class="product-card-body">
              <div class="product-card-title" x-text="a.productTitle || $t('auction.item')"></div>
              <div class="current-bid" x-text="formatPrice(a.currentHighestBid || a.startingPrice)"></div>
              <div class="product-card-meta">
                <span>
                  <i class="fas fa-hourglass-half"></i>
                  <span x-text="timeLeft(a.endTime).finished ? $t('auction.ended') : timeLeft(a.endTime).timeStr"></span>
                  <span x-show="timeLeft(a.endTime).urgent && !timeLeft(a.endTime).finished" class="ending-soon-badge animate__animated animate__pulse animate__infinite">${t("auction.endingSoon")}</span>
                </span>
                <span class="status" :class="statusClass(a.status)" x-text="tStatus(a.status)"></span>
              </div>
            </div>
            <div class="product-card-footer">
              <small>${t("common.start")}: <span x-text="formatPrice(a.startingPrice)"></span></small>
              <small><span class="badge bg-secondary" x-text="a.bidCount || 0"></span> ${t("common.bids")}</small>
            </div>
          </a>
        </div>
      </template>
    </div>

    <div x-show="!loading && !error && !auctions.length" class="empty-state">
      <div class="empty-state-visual"><i class="fas fa-gavel text-muted fs-hero"></i></div>
      <h3>${t("home.noAuctions")}</h3>
      <p>${t("auctions.noAuctionsDesc")}</p>
      <button class="btn btn-primary mt-3" @click="resetFilters()">${t('common.clearFilters')}</button>
    </div>

    <div x-show="!loading && auctions.length" x-data="pagination({ page, totalPages, onPageChange: goToPage })">
      <div class="d-flex align-items-center justify-content-center gap-2 mt-4">
        <template x-for="p in pages" :key="p">
          <span>
            <button x-show="p !== '...'" x-text="p" :class="'btn btn-sm ' + (p === currentPage ? 'btn-primary' : 'btn-ghost')" @click="goTo(p)"></button>
            <span x-show="p === '...'" class="px-1 text-muted">&hellip;</span>
          </span>
        </template>
      </div>
    </div>

    <div id="auctionSentinel" x-show="!loading && auctions.length && totalPages > 1" style="height:1px;width:100%"></div>`;
}
