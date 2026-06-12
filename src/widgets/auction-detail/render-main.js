import { t, getCurrentLang } from '../../shared/utils/i18n.js';

export function renderDetailMain() {
  const dir = getCurrentLang() === "ar" ? "left" : "right";
  return `
      <div>
      <nav class="breadcrumb" aria-label="${t('common.breadcrumb')}">
        <a href="#/">${t("nav.home")}</a>
        <i class="fas fa-chevron-${dir}"></i>
        <a href="#/auctions">${t("nav.auctions")}</a>
        <i class="fas fa-chevron-${dir}"></i>
        <span x-text="auction.productTitle || $t('auction.item')"></span>
      </nav>

      <div class="row g-5">
        <div class="col-lg-6">
          <div class="detail-image">
            <template x-if="auction.productImageUrl">
              <img :src="auction.productImageUrl" :alt="auction.productTitle || $t('auction.item')" loading="lazy" style="width:100%;height:100%;object-fit:cover">
            </template>
            <template x-if="!auction.productImageUrl">
              <i class="fas fa-gavel"></i>
            </template>
          </div>
        </div>

        <div class="col-lg-6">
        <div class="detail-info">
          <h1 x-text="auction.productTitle || $t('auction.item')"></h1>
          <div class="current-bid">
            <span x-text="$t('auction.currentBid') + ': ' + formatPrice(currentBidValue)"></span>
          </div>

          <div class="my-2">
            <span class="status" :class="statusClass(auction.status)" x-text="tStatus(auction.status)"></span>

            <div x-show="!ended && isActive" class="d-flex gap-2 flex-wrap mt-2">
              <template x-if="countdown()">
                <div class="d-flex gap-2 flex-wrap">
                  <template x-if="countdown().showDays">
                    <div class="countdown-unit">
                      <span class="countdown-num" x-text="countdown().days"></span>
                      <span class="countdown-lbl">${t('common.days')}</span>
                    </div>
                  </template>
                  <div class="countdown-unit" :class="countdown().critical ? 'critical' : countdown().urgent ? 'urgent' : ''">
                    <span class="countdown-num" x-text="countdown().hours"></span>
                    <span class="countdown-lbl">${t('common.hours')}</span>
                  </div>
                  <div class="countdown-unit" :class="countdown().critical ? 'critical' : countdown().urgent ? 'urgent' : ''">
                    <span class="countdown-num" x-text="countdown().mins"></span>
                    <span class="countdown-lbl">${t('common.minutes')}</span>
                  </div>
                  <div class="countdown-unit" :class="countdown().critical ? 'critical' : countdown().urgent ? 'urgent' : ''">
                    <span class="countdown-num" x-text="countdown().secs"></span>
                    <span class="countdown-lbl">${t('common.seconds')}</span>
                  </div>
                  <template x-if="countdown().urgent">
                    <span class="ending-soon-badge">${t('auction.endingSoon')}</span>
                  </template>
                </div>
              </template>
            </div>

            <div x-show="ended || (!isActive && !ended)" class="mt-2">
              <span class="text-danger fw-semibold">
                <i class="fas fa-times-circle"></i> ${t('auction.ended')}
              </span>
            </div>
          </div>

          <div class="detail-meta">
            <div class="detail-meta-item">
              <strong x-text="$t('auction.startingPrice') + ':'"></strong>
              <span x-text="formatPrice(auction.startingPrice)"></span>
            </div>
            <div class="detail-meta-item">
              <strong x-text="$t('auction.reservePrice') + ':'"></strong>
              <span x-text="auction.reservePrice ? formatPrice(auction.reservePrice) : t('common.N/A')"></span>
            </div>
            <div class="detail-meta-item">
              <strong x-text="$t('auction.minIncrement') + ':'"></strong>
              <span x-text="formatPrice(auction.minimumIncrement)"></span>
            </div>
            <div class="detail-meta-item">
              <strong x-text="$t('auction.totalBids') + ':'"></strong>
              <span x-text="bidCount"></span>
            </div>
            <div class="detail-meta-item">
              <strong x-text="$t('auction.start') + ':'"></strong>
              <span x-text="formatDate(auction.startTime)"></span>
            </div>
            <div class="detail-meta-item">
              <strong x-text="$t('auction.end') + ':'"></strong>
              <span x-text="formatDate(auction.endTime)"></span>
            </div>
          </div>

          <template x-if="auction.sellerName || auction.auctioneerName">
            <a :href="'#/seller-profile?sellerId=' + (auction.sellerId || auction.auctioneerId || '')" class="seller-info-card" style="text-decoration:none;color:inherit">
              <div class="seller-avatar" x-text="(auction.sellerName || auction.auctioneerName || $t('common.unknown')).charAt(0).toUpperCase()"></div>
              <div class="seller-info-details">
                <div class="seller-info-name" x-text="auction.sellerName || auction.auctioneerName"></div>
                <div class="seller-info-meta"><i class="fas fa-store"></i> ${t('common.viewProfile')}</div>
              </div>
              <i class="fas fa-chevron-${dir} text-muted"></i>
            </a>
          </template>

          <template x-if="auction.winnerUserId">
            <div class="alert alert-success">
              <i class="fas fa-trophy"></i>
              <span x-text="$t('auction.winner') + ': ' + (auction.winnerName || $t('auction.userNumber') + auction.winnerUserId)"></span>
            </div>
          </template>

          <template x-if="isActive && isCustomer()">
            <div>
              <div class="d-flex gap-3 flex-wrap mt-3">
                <div style="flex:1;min-width:140px">
                  <div class="bid-input-group">
                    <input type="number" class="form-input form-control" x-model="bidAmount" step="0.01"
                           :placeholder="t('auction.placeBid') + ' (' + formatPrice(minBid) + ')'" />
                    <button class="btn btn-primary" @click="placeBid()" :disabled="placingBid">
                      <i class="fas fa-gavel" x-show="!placingBid"></i>
                      <i class="fas fa-spinner spinner" x-show="placingBid"></i>
                      <span x-show="!placingBid" x-text="$t('auction.placeBid')"></span>
                      <span x-show="placingBid">${t('auction.placingBid')}</span>
                    </button>
                  </div>

                  <div class="bid-slider-wrap">
                    <input type="range" class="bid-slider" x-model="bidAmount"
                           :min="minBid" :max="maxBid" step="0.01"
                           aria-label="${t('auction.placeBid')}" />
                    <div class="bid-slider-labels">
                      <span x-text="formatPrice(minBid)"></span>
                      <span x-text="formatPrice(maxBid)"></span>
                    </div>
                  </div>

                  <div class="d-flex gap-2 mt-2">
                    <button class="btn btn-outline btn-sm" @click="quickBidAdd()">
                      +<span x-text="formatPrice(auction.minimumIncrement)"></span>
                    </button>
                    <button class="btn btn-outline btn-sm" @click="quickBidPct(5)">+5%</button>
                    <button class="btn btn-outline btn-sm" @click="quickBidPct(10)">+10%</button>
                  </div>

                  <div class="d-flex align-items-center gap-2 mt-2">
                    <label class="d-flex align-items-center gap-2" style="font-size:var(--text-sm);cursor:pointer">
                      <input type="checkbox" x-model="autoBidEnabled" :aria-label="t('auction.autoBid')" />
                      <i class="fas fa-robot"></i>
                      <span x-text="$t('auction.autoBid')"></span>
                    </label>
                    <div x-show="autoBidEnabled" class="flex-fill">
                      <input type="number" class="form-input form-control" x-model="autoBidMax" step="0.01" min="0"
                             :placeholder="t('auction.autoBidMaxPlaceholder')"
                             style="padding:6px 10px;font-size:var(--text-sm)" />
                    </div>
                  </div>
                </div>
              </div>

              <div x-show="bidAlert" class="mt-2">
                <div :class="'alert alert-' + bidAlertType" x-text="bidAlert"></div>
              </div>
            </div>
          </template>

          <template x-if="isActive && !isCustomer()">
            <div class="alert alert-info mt-3">
              <i class="fas fa-info-circle"></i>
              <template x-if="isLoggedIn()">
                <span x-text="$t('auction.bidCustomerOnly')"></span>
              </template>
              <template x-if="!isLoggedIn()">
                <a href="#/login" class="text-reset text-decoration-underline">
                  <span x-text="$t('auction.loginToBid')"></span>
                </a>
              </template>
            </div>
          </template>

          <div class="mt-4">
            <h3><span x-text="$t('auction.bidHistory') + ' (' + bidCount + ')'"></span></h3>
            <div class="bid-list" aria-live="polite" aria-atomic="true" aria-relevant="additions text">
              <template x-if="bids.length">
                <div>
                  <template x-for="(b, i) in bids" :key="b.createdAt + '-' + i">
                    <div class="bid-item" :style="i === 0 && !loading ? 'background:var(--success-bg);transition:background 1s ease' : ''">
                      <span>
                        <strong x-text="b.userName"></strong>
                        <small x-text="formatDate(b.createdAt)"></small>
                      </span>
                      <span class="fw-bold text-success">
                        <span x-text="formatPrice(b.amount)"></span>
                        <template x-if="b.isAutoBid">
                          <i class="fas fa-robot" :title="t('auction.autoBid')"></i>
                        </template>
                      </span>
                    </div>
                  </template>
                </div>
              </template>
              <template x-if="!bids.length">
                <div class="empty-state">
                  <i class="fas fa-gavel"></i>
                  <h3 x-text="$t('auction.noBids')"></h3>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <template x-if="isActive && isCustomer()">
        <div class="mobile-sticky-bar">
          <div class="current-bid-mini">
            <small x-text="$t('auction.currentBid')"></small>
            <span x-text="formatPrice(currentBidValue)"></span>
          </div>
          <button class="btn btn-primary" @click="placeBid()" :disabled="placingBid">
            <i class="fas" :class="placingBid ? 'fa-spinner spinner' : 'fa-gavel'"></i>
            <span x-text="$t('auction.placeBid')"></span>
          </button>
        </div>
      </template>
    </div></template>`;
}
