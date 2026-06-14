import Alpine from 'alpinejs';
import { t } from '../../shared/utils/i18n.js';
import { getUser } from '../auth/login.js';
import { MODERATOR_ROLES } from '../../shared/constants/roles.js';
import { setPageMeta } from '../../shared/utils/seo.js';
import { showToast } from '../../shared/utils/ui.js';
import { statusClass } from '../../shared/utils/format.js';
import { fetchPendingRequests, approveAuctionRequest, rejectAuctionRequest } from './analytics.js';

Alpine.data('auctionReviewPage', () => ({
  loading: true,
  error: '',
  items: [],
  page: 1,
  totalPages: 1,
  approveItemId: null,
  rejectItemId: null,
  detailItem: null,
  appEndTime: '',
  appStartingPrice: '',
  appReservePrice: '',
  appMinIncrement: '',
  approving: false,
  rejectReason: '',
  rejecting: false,

  init() {
    setPageMeta(t('auctionRequestsReview.title'));
    const u = getUser();
    if (!u || !MODERATOR_ROLES.includes(u.role)) { window.location.hash = '#/'; return; }
    this.loadRequests();
  },

  async loadRequests() {
    this.loading = true;
    this.error = '';
    try {
      const res = await fetchPendingRequests(this.page, 50);
      this.items = res?.items || res?.data || [];
      this.totalPages = res?.totalPages || 1;
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },

  prevPage() {
    if (this.page > 1) { this.page--; this.loadRequests(); }
  },

  nextPage() {
    if (this.page < this.totalPages) { this.page++; this.loadRequests(); }
  },

  approveRequest(id) {
    const now = new Date();
    const defaultEnd = new Date(now.getTime() + 7 * 86400000);
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    this.appEndTime = fmt(defaultEnd);
    this.appStartingPrice = '';
    this.appReservePrice = '';
    this.appMinIncrement = '';
    this.approveItemId = id;
  },

  cancelApprove() { this.approveItemId = null; },

  async submitApprove(e) {
    e.preventDefault();
    if (!this.appEndTime) { showToast(t('scheduling.startTimeRequired'), 'error'); return; }
    this.approving = true;
    try {
      const body = { endTime: new Date(this.appEndTime).toISOString(), startingPrice: parseFloat(this.appStartingPrice) };
      if (this.appReservePrice) body.reservePrice = parseFloat(this.appReservePrice);
      if (this.appMinIncrement) body.bidIncrement = parseFloat(this.appMinIncrement);
      await approveAuctionRequest(this.approveItemId, body);
      showToast(t('auctionRequestsReview.approvedSuccess'), 'success');
      this.approveItemId = null;
      this.loadRequests();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      this.approving = false;
    }
  },

  rejectRequest(id) { this.rejectReason = ''; this.rejectItemId = id; },
  cancelReject() { this.rejectItemId = null; },

  async submitReject() {
    if (!this.rejectReason.trim()) { showToast(t('auctionRequestsReview.rejectionReasonPlaceholder'), 'error'); return; }
    this.rejecting = true;
    try {
      await rejectAuctionRequest(this.rejectItemId, this.rejectReason.trim());
      showToast(t('auctionRequestsReview.rejectedSuccess'), 'success');
      this.rejectItemId = null;
      this.loadRequests();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      this.rejecting = false;
    }
  },

  showDetail(item) { this.detailItem = item; },
  closeDrawer() { this.detailItem = null; },

  detailProp(prop, def) { return this.detailItem?.[prop] ?? def; },
  detailStatus() { return (this.detailItem?.status || '').toLowerCase(); },
  detailStatusText() { return t(`auctionRequests.${this.detailStatus()}`); },
  detailDate(prop) { const d = this.detailItem?.[prop]; return d ? new Date(d).toLocaleDateString() : '-'; },
  detailImage() { return this.detailItem?.imageUrl || this.detailItem?.productImageUrl; },

  closeAndApprove() {
    const id = this.detailItem?.id;
    this.closeDrawer();
    if (id) { this.$nextTick(() => { this.approveRequest(id); }); }
  },

  closeAndReject() {
    const id = this.detailItem?.id;
    this.closeDrawer();
    if (id) { this.$nextTick(() => { this.rejectRequest(id); }); }
  },

  formatDate(dateStr) { return dateStr ? new Date(dateStr).toLocaleDateString() : '-'; },

  statusClass(s) { return statusClass(s); },
  t(key) { return t(key); },
}));
