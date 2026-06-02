import Alpine from 'alpinejs';
import { t, getCurrentLang } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth, getUser } from '../core/auth/index.js';
import { registerRouteCleanup, navigate } from '../core/router/index.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../core/utils/format.js';
import { escapeHtml, observeAnimations, animate, safeSetHTML } from '../core/utils/dom.js';
import { triggerConfetti, trackRecentlyViewed } from '../core/utils/ui.js';
import { createScopedBus } from '../core/events/bus.js';
import { joinAuctionGroup, leaveAuctionGroup } from '../core/realtime/index.js';

Alpine.data('auctionDetailPage', () => ({
  // --- Reactive state ---
  auction: null,
  bids: [],
  endTime: null,
  isActive: true,
  loading: true,
  error: null,

  // Countdown
  remaining: 0,
  urgent: false,
  ended: false,

  // Bid display (count-up animation)
  currentBidValue: 0,
  bidCount: 0,

  // Bid form
  bidAmount: '',
  minBid: 0,
  maxBid: 1000,
  autoBidEnabled: false,
  autoBidMax: '',
  bidAlert: '',
  bidAlertType: '',
  placingBid: false,

  // Winner
  winnerName: '',

  // Internal (not reactive for template, but stored for cleanup)
  _auctionId: null,
  _bus: null,
  _user: null,
  _countdownInterval: null,
  _refreshInterval: null,


  // --- Lifecycle ---
  async init() {
    this._auctionId = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
    if (!this._auctionId) {
      this.error = 'Auction ID is required.';
      this.loading = false;
      return;
    }

    this._user = getUser();
    this._bus = createScopedBus();

    try {
      const detail = await api.get(`/auctions/${this._auctionId}`);
      const a = detail.auction || detail;
      this.auction = a;
      this.bids = (detail.bids || []).sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
      this.endTime = new Date(a.endTime);
      this.isActive = a.status === 'Active';
      this.currentBidValue = a.currentHighestBid || a.startingPrice;
      this.bidCount = this.bids.length;
      this.loading = false;

      if (this.isActive) {
        const minBidVal = a.currentHighestBid
          ? a.currentHighestBid + a.minimumIncrement
          : a.startingPrice;
        const maxBidVal = a.reservePrice && a.reservePrice > minBidVal
          ? a.reservePrice * 1.5
          : minBidVal * 5;
        this.minBid = minBidVal;
        this.maxBid = maxBidVal;
        this.bidAmount = minBidVal.toFixed(2);
      }

      // Track recently viewed
      trackRecentlyViewed(
        a.id,
        a.productTitle || 'Auction Item',
        a.productImageUrl,
        a.currentHighestBid || a.startingPrice,
        "auction",
      );

      // Join SignalR group
      joinAuctionGroup(parseInt(this._auctionId));

      // Winner confetti on initial load
      if (this._user && a.winnerUserId &&
          (this._user.id === a.winnerUserId || this._user.userId === a.winnerUserId)) {
        this.$nextTick(() => setTimeout(triggerConfetti, 300));
      }

      // Start timers if active
      if (this.isActive) {
        this.startCountdown();
        this.startAutoRefresh();
      }

      // Listen for SignalR events via bus
      this._bus.on('realtime:bid-placed', ({ bid }) => {
        const baId = bid.auctionId || bid.auction_id;
        if (baId && parseInt(baId) !== parseInt(this._auctionId)) return;
        this.onBidPlaced(bid);
      });

      this._bus.on('realtime:auction-ended', ({ auction: endedAuction }) => {
        const eaId = endedAuction.id || endedAuction.auctionId;
        if (eaId && parseInt(eaId) !== parseInt(this._auctionId)) return;
        this.onAuctionEnded(endedAuction);
      });

    } catch (e) {
      this.error = e.message || t('common.loadFailed');
      this.loading = false;
    }

    registerRouteCleanup(() => this.cleanup());
    this.$nextTick(() => {
      observeAnimations();
      const infoEl = this.$el?.querySelector('.detail-info');
      if (infoEl) animate(infoEl, 'fadeInUp', { duration: '0.5s' });
    });
  },

  // --- Countdown ---
  startCountdown() {
    this._countdownInterval = setInterval(() => {
      const diff = Math.max(0, Math.floor((this.endTime - new Date()) / 1000));
      if (diff <= 0) {
        clearInterval(this._countdownInterval);
        this._countdownInterval = null;
        this.ended = true;
        this.isActive = false;
        return;
      }
      this.remaining = diff;
      this.urgent = diff <= 3600;
    }, 1000);
  },

  startAutoRefresh() {
    this._refreshInterval = setInterval(async () => {
      try {
        const freshData = await api.get(`/auctions/${this._auctionId}`);
        const fresh = freshData.auction || freshData;
        this.endTime = new Date(fresh.endTime);
        this.isActive = fresh.status === 'Active';

        const newVal = fresh.currentHighestBid || fresh.startingPrice;
        if (newVal > this.currentBidValue) {
          this.animateBidCountUp(this.currentBidValue, newVal);
        } else {
          this.currentBidValue = newVal;
        }

        if (fresh.bids) this.bidCount = fresh.bids.length;

        if (!this.isActive) {
          if (this._refreshInterval) clearInterval(this._refreshInterval);
          if (this._countdownInterval) clearInterval(this._countdownInterval);
          this._refreshInterval = null;
          this._countdownInterval = null;
        }
      } catch { /* silently fail */ }
    }, 10000);
  },

  animateBidCountUp(start, end) {
    const duration = 600;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.currentBidValue = start + (end - start) * eased;
      if (progress < 1) requestAnimationFrame(tick);
      else this.currentBidValue = end;
    };
    requestAnimationFrame(tick);
  },

  // --- SignalR event handlers ---
  onBidPlaced(bid) {
    const newVal = parseFloat(bid.amount || bid.currentHighestBid);
    if (newVal && newVal > this.currentBidValue) {
      this.animateBidCountUp(this.currentBidValue, newVal);
    }
    // Animate the current-bid element with bounceIn
    const bidEl = this.$el?.querySelector('.current-bid');
    if (bidEl) animate(bidEl, 'bounceIn', { duration: '0.6s' });

    const bidEntry = {
      userName: bid.userName || bid.bidderName || bid.fullName || (bid.bidderId ? `User #${bid.bidderId}` : 'User'),
      createdAt: bid.createdAt || bid.created_at || new Date().toISOString(),
      amount: newVal || 0,
      isAutoBid: bid.isAutoBid || false,
    };
    this.bids = [bidEntry, ...this.bids].sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
    this.bidCount = this.bids.length;
  },

  onAuctionEnded(endedAuction) {
    this.ended = true;
    this.isActive = false;
    this.winnerName = endedAuction.winnerName || '';

    if (this._user && endedAuction.winnerUserId &&
        (this._user.id === endedAuction.winnerUserId || this._user.userId === endedAuction.winnerUserId)) {
      this.$nextTick(() => triggerConfetti());
    }
  },

  // --- Bid actions ---
  async placeBid() {
    if (!await requireAuth()) return;
    const amount = parseFloat(this.bidAmount);
    if (!amount || amount <= 0) {
      this.bidAlert = t('auction.invalidBid');
      this.bidAlertType = 'error';
      return;
    }

    this.placingBid = true;
    this.bidAlert = '';
    this.bidAlertType = '';

    try {
      const body = { amount };
      if (this.autoBidEnabled) {
        const maxBid = parseFloat(this.autoBidMax);
        if (!maxBid || maxBid <= amount) {
          this.bidAlert = t("auction.autoBidMaxRequired");
          this.bidAlertType = 'error';
          this.placingBid = false;
          return;
        }
        body.maxAutoBidAmount = maxBid;
      }
      await api.post(`/auctions/${this._auctionId}/bids`, body);
      this.bidAlert = t('auction.bidPlaced');
      this.bidAlertType = 'success';
      setTimeout(() => this.refreshAuction(), 1000);
    } catch (e) {
      this.bidAlert = escapeHtml(e.message);
      this.bidAlertType = 'error';
    } finally {
      this.placingBid = false;
    }
  },

  async refreshAuction() {
    try {
      const detail = await api.get(`/auctions/${this._auctionId}`);
      const a = detail.auction || detail;
      this.auction = a;
      this.bids = (detail.bids || []).sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
      this.currentBidValue = a.currentHighestBid || a.startingPrice;
      this.bidCount = this.bids.length;
      this.bidAlert = '';
      this.bidAlertType = '';
    } catch { /* ignore */ }
  },

  quickBidAdd() {
    this.bidAmount = (this.minBid + this.auction.minimumIncrement).toFixed(2);
  },

  quickBidPct(pct) {
    this.bidAmount = (this.minBid * (1 + pct / 100)).toFixed(2);
  },

  // --- Template helpers ---
  countdown() {
    if (this.ended || !this.isActive) return null;
    const days = Math.floor(this.remaining / 86400);
    const hours = Math.floor((this.remaining % 86400) / 3600);
    const mins = Math.floor((this.remaining % 3600) / 60);
    const secs = this.remaining % 60;
    const critical = this.remaining > 0 && this.remaining <= 600; // < 10 min
    return {
      days,
      hours: String(hours).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
      urgent: this.urgent,
      critical,
      showDays: days > 0,
    };
  },

  formatPrice(n) { return formatPrice(n); },
  formatDate(d) { return formatDate(d); },
  statusClass(s) { return statusClass(s); },
  tStatus(s) { return tStatus(s, 'auction'); },
  t(key) { return t(key); },
  getCurrentLang() { return getCurrentLang(); },
  isCustomer() { return this._user?.role === 'Customer'; },
  isLoggedIn() { return !!this._user; },
  retry() { navigate(''); },

  // --- Cleanup ---
  cleanup() {
    leaveAuctionGroup(parseInt(this._auctionId));
    if (this._bus) this._bus.cleanup();
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  },
}));

// --- Page render function ---
export default async function renderAuctionDetail(container, _route, params) {
  container.innerHTML = `
    <div x-data="auctionDetailPage" x-init="init()">
      <!-- Loading skeleton -->
      <div x-show="loading" class="skeleton-detail skeleton-shimmer" role="status" aria-label="${t('common.loading')}">
        <div class="skeleton skeleton-image" style="height:380px"></div>
        <div class="py-4">
          <div class="skeleton skeleton-title" style="width:60%"></div>
          <div class="skeleton skeleton-text" style="width:20%;height:32px"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      </div>

      <!-- Error state -->
      <div x-show="!loading && error" class="empty-state">
        <div class="empty-state-visual"><i class="fas fa-gavel text-muted" style="font-size:3.5rem"></i></div>
        <h3 x-text="$t('common.loadFailed')"></h3>
        <p x-text="error"></p>
        <button class="btn btn-primary mt-3" @click="retry()">${t('common.retry')}</button>
      </div>

      <!-- Content -->
      <div x-show="!loading && !error && auction">
        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="#/">${t("nav.home")}</a>
          <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i>
          <a href="#/auctions">${t("nav.auctions")}</a>
          <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i>
          <span x-text="auction.productTitle || 'Auction Item'"></span>
        </nav>

        <div class="row g-5">
          <!-- Image -->
          <div class="col-lg-6">
            <div class="detail-image">
              <template x-if="auction.productImageUrl">
                <img :src="auction.productImageUrl" :alt="auction.productTitle || 'Auction Item'" loading="lazy" style="width:100%;height:100%;object-fit:cover">
              </template>
              <template x-if="!auction.productImageUrl">
                <i class="fas fa-gavel"></i>
              </template>
            </div>
          </div>

          <!-- Info -->
          <div class="col-lg-6">
          <div class="detail-info">
            <h1 x-text="auction.productTitle || 'Auction Item'"></h1>

            <!-- Current bid with price flash -->
            <div class="current-bid">
              <span x-text="$t('auction.currentBid') + ': ' + formatPrice(currentBidValue)"></span>
            </div>

            <!-- Status + countdown -->
            <div class="my-2">
              <span class="status" :class="statusClass(auction.status)" x-text="tStatus(auction.status)"></span>

              <!-- Active countdown -->
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

              <!-- Ended display -->
              <div x-show="ended || (!isActive && !ended)" class="mt-2">
                <span class="text-danger fw-semibold">
                  <i class="fas fa-times-circle"></i> ${t('auction.ended')}
                </span>
              </div>
            </div>

            <!-- Meta info -->
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

            <!-- Seller info card -->
            <template x-if="auction.sellerName || auction.auctioneerName">
              <a :href="'#/seller-profile?userId=' + (auction.sellerId || auction.auctioneerId || '')" class="seller-info-card" style="text-decoration:none;color:inherit">
                <div class="seller-avatar" x-text="(auction.sellerName || auction.auctioneerName || '?').charAt(0).toUpperCase()"></div>
                <div class="seller-info-details">
                  <div class="seller-info-name" x-text="auction.sellerName || auction.auctioneerName"></div>
                  <div class="seller-info-meta"><i class="fas fa-store" aria-hidden="true"></i> ${t('common.viewProfile') || 'View Profile'}</div>
                </div>
                <i class="fas fa-chevron-${getCurrentLang() === 'ar' ? 'left' : 'right'} text-muted"></i>
              </a>
            </template>

            <!-- Winner announcement -->
            <template x-if="auction.winnerUserId">
              <div class="alert alert-success">
                <i class="fas fa-trophy"></i>
                <span x-text="$t('auction.winner') + ': ' + (auction.winnerName || 'User #' + auction.winnerUserId)"></span>
              </div>
            </template>

            <!-- Bid section (customer only, active auction) -->
            <template x-if="isActive && isCustomer()">
              <div>
                <div class="d-flex gap-3 flex-wrap mt-3">
                  <div style="flex:1;min-width:200px">
                    <!-- Bid input + button -->
                    <div class="bid-input-group">
                      <input type="number" class="form-input form-control" x-model="bidAmount" step="0.01"
                             :placeholder="t('auction.placeBid') + ' (' + formatPrice(minBid) + ')'" />
                      <button class="btn btn-primary" @click="placeBid()" :disabled="placingBid">
                        <i class="fas fa-gavel" x-show="!placingBid"></i>
                        <i class="fas fa-spinner spinner" x-show="placingBid" aria-hidden="true"></i>
                        <span x-show="!placingBid" x-text="$t('auction.placeBid')"></span>
                        <span x-show="placingBid">${t('auction.placingBid')}</span>
                      </button>
                    </div>

                    <!-- Bid slider -->
                    <div class="bid-slider-wrap">
                      <input type="range" class="bid-slider" x-model="bidAmount"
                             :min="minBid" :max="maxBid" step="0.01"
                             aria-label="${t('auction.placeBid')}" />
                      <div class="bid-slider-labels">
                        <span x-text="formatPrice(minBid)"></span>
                        <span x-text="formatPrice(maxBid)"></span>
                      </div>
                    </div>

                    <!-- Quick-bid buttons -->
                    <div class="d-flex gap-2 mt-2">
                      <button class="btn btn-outline btn-sm" @click="quickBidAdd()">
                        +<span x-text="formatPrice(auction.minimumIncrement)"></span>
                      </button>
                      <button class="btn btn-outline btn-sm" @click="quickBidPct(5)">+5%</button>
                      <button class="btn btn-outline btn-sm" @click="quickBidPct(10)">+10%</button>
                    </div>

                    <!-- Auto-bid toggle -->
                    <div class="d-flex align-items-center gap-2 mt-2">
                      <label class="d-flex align-items-center gap-2" style="font-size:var(--text-sm);cursor:pointer">
                        <input type="checkbox" x-model="autoBidEnabled" :aria-label="t('auction.autoBid')" />
                        <i class="fas fa-robot" aria-hidden="true"></i>
                        <span x-text="$t('auction.autoBid')"></span>
                      </label>
                      <div x-show="autoBidEnabled" class="flex-fill">
                        <input type="number" class="form-input form-control" x-model="autoBidMax" step="0.01" min="0"
                               :placeholder="t('auction.autoBidMaxPlaceholder') || 'Max bid amount'"
                               style="padding:6px 10px;font-size:var(--text-sm)" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bid alert -->
                <div x-show="bidAlert" class="mt-2">
                  <div :class="'alert alert-' + bidAlertType" x-html="bidAlert"></div>
                </div>
              </div>
            </template>

            <!-- Non-customer message (active auction) -->
            <template x-if="isActive && !isCustomer()">
              <div class="alert alert-info mt-3">
                <i class="fas fa-info-circle"></i>
                <template x-if="isLoggedIn()">
                  <span x-text="$t('auction.bidCustomerOnly') || 'Only customers can place bids.'"></span>
                </template>
                <template x-if="!isLoggedIn()">
                  <a href="#/login" class="text-reset text-decoration-underline">
                    <span x-text="$t('auction.loginToBid') || 'Login as a customer to place bids.'"></span>
                  </a>
                </template>
              </div>
            </template>

            <!-- Bid history -->
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

        <!-- Mobile sticky bid bar -->
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
      </div>
    </div>
  `;
}
