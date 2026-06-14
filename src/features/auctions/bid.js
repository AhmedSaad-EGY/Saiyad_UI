import Alpine from 'alpinejs';
import { t, getCurrentLang } from '../../shared/utils/i18n.js';
import { api } from '../../shared/api/client.js';
import { requireAuth, getUser, hasRole } from '../auth/login.js';
import { ROLES } from '../../shared/constants/roles.js';
import { registerRouteCleanup, navigate } from '../../app/router.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../../shared/utils/format.js';
import { observeAnimations, animate, initPullToRefresh, initInfiniteScroll } from '../../shared/utils/dom.js';
import { triggerConfetti, showConfirm } from '../../shared/utils/ui.js';
import { trackRecentlyViewed } from '../../shared/utils/recently-viewed.js';
import { createScopedBus } from '../../shared/utils/events.js';
import { joinAuctionGroup, leaveAuctionGroup, isSignalRConnected } from '../../app/realtime.js';

Alpine.data('auctionDetailPage', () => ({
  auction: null,
  bids: [],
  endTime: null,
  isActive: true,
  loading: true,
  error: null,
  remaining: 0,
  urgent: false,
  ended: false,
  currentBidValue: 0,
  bidCount: 0,
  bidAmount: '',
  minBid: 0,
  maxBid: 1000,
  autoBidEnabled: false,
  autoBidMax: '',
  bidAlert: '',
  bidAlertType: '',
  placingBid: false,
  winnerName: '',
  _auctionId: null,
  _bus: null,
  _user: null,
  _countdownInterval: null,
  _refreshInterval: null,
  _rafId: null,

  async init() {
    this._auctionId = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
    if (!this._auctionId) {
      this.error = t('auction.idRequired');
      this.loading = false;
      return;
    }

    this._user = getUser();
    this._bus = createScopedBus();

    try {
      const detail = await api.get(`/auctions/${this._auctionId}`);
      const a = detail.auction || detail;
      this.auction = a;
      this.bids = (detail.bids || []).sort((x, y) => new Date(y.createdAt || y.created_at) - new Date(x.createdAt || x.created_at));
      this.endTime = new Date(a.endTime);
      this.isActive = a.status === 'Active';
      this.currentBidValue = a.currentHighestBid || a.startingPrice;
      this.bidCount = this.bids.length;
      this.loading = false;

      if (this.isActive) {
        const minBidVal = a.currentHighestBid
          ? a.currentHighestBid + a.bidIncrement
          : a.startingPrice;
        const maxBidVal = minBidVal * 1000;
        this.minBid = minBidVal;
        this.maxBid = maxBidVal;
        this.bidAmount = minBidVal.toFixed(2);
      }

      trackRecentlyViewed(
        a.id,
        a.productTitle || t('auction.item'),
        a.productImageUrl,
        a.currentHighestBid || a.startingPrice,
        "auction",
      );

      joinAuctionGroup(parseInt(this._auctionId));

      if (this._user && a.winnerUserId &&
          (this._user.id === a.winnerUserId || this._user.userId === a.winnerUserId)) {
        this.$nextTick(() => setTimeout(triggerConfetti, 300));
      }

      if (this.isActive) {
        this.startCountdown();
        this.startFallbackRefresh();
      }

      this._bus.on('realtime:bid-placed', ({ bid }) => {
        const baId = bid.auctionId;
        if (baId && parseInt(baId) !== parseInt(this._auctionId)) return;
        this.onBidPlaced(bid);
      });

      this._bus.on('realtime:auction-ended', ({ auction: endedAuction }) => {
        const eaId = endedAuction.id;
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

  startFallbackRefresh() {
    // 60-second fallback poll for when SignalR connection drops.
    // SignalR handles real-time updates when connected.
    this._refreshInterval = setInterval(async () => {
      if (isSignalRConnected()) return;
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
    }, 60000);
  },

  animateBidCountUp(start, end) {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    const duration = 600;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.currentBidValue = start + (end - start) * eased;
      if (progress < 1) this._rafId = requestAnimationFrame(tick);
      else this.currentBidValue = end;
    };
    this._rafId = requestAnimationFrame(tick);
  },

  onBidPlaced(bid) {
    const newVal = parseFloat(bid.amount || bid.currentHighestBid);
    if (newVal && newVal > this.currentBidValue) {
      this.animateBidCountUp(this.currentBidValue, newVal);
    }
    const bidEl = this.$el?.querySelector('.current-bid');
    if (bidEl) animate(bidEl, 'bounceIn', { duration: '0.6s' });

    const bidEntry = {
      userName: bid.userName || bid.bidderName || bid.fullName || t('auction.anonymousBidder'),
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

  async placeBid() {
    if (this.placingBid) return;
    this.placingBid = true;
    this.bidAlert = '';
    this.bidAlertType = '';
    try {
      if (!await requireAuth()) return;
      const amount = parseFloat(this.bidAmount);
      if (!amount || amount <= 0) {
        this.bidAlert = t('auction.invalidBid');
        this.bidAlertType = 'error';
        return;
      }

      const confirmed = await showConfirm(
        t('auction.confirmBidTitle'),
        `${t('auction.confirmBidMsg')} ${formatPrice(amount)}? ${t('auction.bidIrreversible')}`,
        { type: 'warning', confirmText: t('auction.placeBid') }
      );
      if (!confirmed) return;

      const body = { amount };
      if (this.autoBidEnabled) {
        const maxBid = parseFloat(this.autoBidMax);
        if (!maxBid || maxBid <= amount) {
          this.bidAlert = t("auction.autoBidMaxRequired");
          this.bidAlertType = 'error';
          return;
        }
        body.maxAutoBidAmount = maxBid;
      }
      await api.post(`/auctions/${this._auctionId}/bids`, body);
      this.bidAlert = t('auction.bidPlaced');
      this.bidAlertType = 'success';
      setTimeout(() => this.refreshAuction(), 1000);
    } catch (e) {
      this.bidAlert = e.message;
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
      this.bids = (detail.bids || []).sort((x, y) => new Date(y.createdAt || y.created_at) - new Date(x.createdAt || x.created_at));
      this.currentBidValue = a.currentHighestBid || a.startingPrice;
      this.bidCount = this.bids.length;
      this.bidAlert = '';
      this.bidAlertType = '';
    } catch { /* previous bid state preserved */ }
  },

  quickBidAdd() {
    this.bidAmount = (this.minBid + this.auction.bidIncrement).toFixed(2);
  },

  quickBidPct(pct) {
    this.bidAmount = (this.minBid * (1 + pct / 100)).toFixed(2);
  },

  countdown() {
    if (this.ended || !this.isActive) return null;
    const days = Math.floor(this.remaining / 86400);
    const hours = Math.floor((this.remaining % 86400) / 3600);
    const mins = Math.floor((this.remaining % 3600) / 60);
    const secs = this.remaining % 60;
    const critical = this.remaining > 0 && this.remaining <= 600;
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
  isCustomer() { return hasRole(ROLES.CUSTOMER); },
  isLoggedIn() { return !!this._user; },
  retry() { navigate(''); },

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
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  },

  destroy() {
    this.cleanup();
  },
}));

Alpine.data('auctionsPage', () => ({
  search: '',
  status: 'Active',
  auctions: [],
  page: 1,
  totalPages: 0,
  pageSize: 12,
  loading: true,
  error: null,
  filterSheetOpen: false,
  nowTime: Date.now(),
  countdownTimer: null,
  endingSoonOnly: false,

  async init() {
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    this.search = params.get('search') || '';
    this.status = params.get('status') || 'Active';
    this.page = parseInt(params.get('page'), 10) || 1;

    await this.load();

    this.countdownTimer = setInterval(() => {
      this.nowTime = Date.now();
    }, 10000);

    this.$nextTick(() => {
      if (window.innerWidth < 768 && this.totalPages > 1) {
        this._scrollCleanup = initInfiniteScroll({
          sentinelId: 'auctionSentinel',
          onLoadMore: () => this.loadMore(),
        });
      }
    });

    this._ptrCleanup = initPullToRefresh({ onRefresh: () => { this.page = 1; this.load(); } });
  },

  destroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this._ptrCleanup) this._ptrCleanup();
    if (this._scrollCleanup) this._scrollCleanup();
  },

  syncUrl() {
    const qp = new URLSearchParams();
    if (this.search) qp.set('search', this.search);
    if (this.status) qp.set('status', this.status);
    if (this.endingSoonOnly) qp.set('endingSoon', '1');
    if (this.page > 1) qp.set('page', this.page);
    const qs = qp.toString();
    history.replaceState(null, '', qs ? `#/auctions?${qs}` : '#/auctions');
  },

  async load() {
    this.loading = true;
    this.error = null;
    this.syncUrl();

    try {
      const apiParams = { page: this.page, pageSize: this.pageSize };
      if (this.search) apiParams.searchTerm = this.search;
      if (this.status) apiParams.status = this.status;
      if (this.endingSoonOnly) {
        apiParams.endingSoon = true;
      }

      const data = await api.get('/auctions', apiParams);
      let items = data.items || data.data || [];
      if (this.endingSoonOnly) {
        items = items.filter(a => {
          const remaining = (new Date(a.endTime) - new Date()) / 1000;
          return remaining > 0 && remaining <= 86400;
        });
      }
      this.auctions = items;
      const total = data.totalCount || data.total || this.auctions.length;
      this.totalPages = Math.ceil(total / this.pageSize);
    } catch (e) {
      this.error = e.message || t('common.error');
    } finally {
      this.loading = false;
      this.$nextTick(() => observeAnimations());
    }
  },

  async loadMore() {
    if (this.loading || this.page >= this.totalPages) return;
    this.page++;
    this.loading = true;
    try {
      const apiParams = { page: this.page, pageSize: this.pageSize };
      if (this.search) apiParams.searchTerm = this.search;
      if (this.status) apiParams.status = this.status;
      const data = await api.get('/auctions', apiParams);
      const items = data.items || data.data || [];
      this.auctions = [...this.auctions, ...items];
      const total = data.totalCount || data.total || 0;
      this.totalPages = Math.ceil(total / this.pageSize);
    } catch { /* UI shows previously loaded auctions */ }
    this.loading = false;
    this.$nextTick(() => observeAnimations());
  },

  goToPage(n) {
    if (this.totalPages === 0 || n < 1 || n > this.totalPages || n === this.page) return;
    this.page = n;
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  reload() {
    this.page = 1;
    this.load();
  },

  applyMobileFilters() {
    this.filterSheetOpen = false;
    this.reload();
  },

  resetFilters() {
    this.search = '';
    this.status = 'Active';
    this.endingSoonOnly = false;
    this.reload();
  },

  clearFiltersAndClose() {
    this.resetFilters();
    this.filterSheetOpen = false;
  },

  formatPrice(n) { return formatPrice(n); },
  statusClass(s) { return statusClass(s); },
  tStatus(s) { return tStatus(s, 'auction'); },

  timeLeft(endTime) {
    const end = new Date(endTime);
    const remaining = Math.max(0, Math.floor((end - this.nowTime) / 1000));
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    const urgent = remaining > 0 && remaining <= 3600;
    const timeStr = days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`;
    return { timeStr, urgent, finished: remaining === 0 };
  },
}));
