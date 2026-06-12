import Alpine from 'alpinejs';
import { t } from '../../shared/utils/i18n.js';
import { setPageMeta } from '../../shared/utils/seo.js';
import { showToast } from '../../shared/utils/ui.js';

Alpine.data('dashboardPage', () => ({
  activeTab: 'overview',
  tourStep: 0,
  showTour: false,

  init() {
    setPageMeta(t('dash.title'), undefined, true);
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    this.activeTab = params.get('tab') || 'overview';
    this.$nextTick(() => {
      window.dispatchEvent(new CustomEvent('dashboard-tab-changed', { detail: { tabId: this.activeTab, firstLoad: true } }));
      this.checkFirstVisitTour();
    });
    if (window.innerWidth < 768) document.body.classList.add('has-bottom-bar');
  },

  checkFirstVisitTour() {
    if (!localStorage.getItem('sayiad_tour_completed')) {
      setTimeout(() => {
        this.showTour = true;
        this.tourStep = 0;
        this.highlightTourStep();
      }, 1500);
    }
  },

  highlightTourStep() {
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    const steps = this.getTourSteps();
    const currentStep = steps[this.tourStep];
    if (!currentStep) return;
    const targetEl = document.querySelector(currentStep.target);
    if (targetEl) {
      targetEl.classList.add('tour-highlight');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  getTourSteps() {
    const isMobile = window.innerWidth < 768;
    return [
      { target: isMobile ? '.dash-mobile-tabs' : '.dashboard-sidebar', title: t('tour.navTitle'), desc: t('tour.navDesc') },
      { target: '#dashOrders', title: t('tour.ordersTitle'), desc: t('tour.ordersDesc') },
      { target: '#dashProducts', title: t('tour.productsTitle'), desc: t('tour.productsDesc') },
    ];
  },

  nextTourStep() {
    const steps = this.getTourSteps();
    if (this.tourStep < steps.length - 1) {
      this.tourStep++;
      this.highlightTourStep();
    } else {
      this.endTour();
    }
  },

  prevTourStep() {
    if (this.tourStep > 0) {
      this.tourStep--;
      this.highlightTourStep();
    }
  },

  endTour() {
    this.showTour = false;
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    localStorage.setItem('sayiad_tour_completed', 'true');
    showToast(t('tour.welcomeToSayiad'), 'success');
  },

  switchTab(tabId) {
    if (tabId === this.activeTab) return;
    this.activeTab = tabId;
    const qp = new URLSearchParams(location.hash.split('?')[1] || '');
    if (tabId === 'overview') qp.delete('tab');
    else qp.set('tab', tabId);
    const qs = qp.toString();
    history.replaceState(null, '', qs ? `#/dashboard?${qs}` : '#/dashboard');
    window.dispatchEvent(new CustomEvent('dashboard-tab-changed', { detail: { tabId } }));
  },
}));

export { loadDashboardTab } from './tabs.js';
export { createProduct } from '../products/create.js';
export { fetchMyProducts, fetchCategories, updateProduct, deleteProduct, uploadFile, addProductImage, validateImage, DRAFT_KEY, DRAFT_FIELDS, loadProductDraft, saveProductDraft, clearProductDraft } from '../products/edit.js';
export { fetchMySellerProfile } from '../seller-profile/index.js';
export { fetchOrders, cancelOrder } from '../orders/index.js';
export { fetchUnauctionedProducts, createAuction } from '../auctions/create.js';
export { fetchWishlist, removeFromWishlist } from '../wishlist/index.js';
export { addToCart } from '../cart/add.js';
export { fetchNotifications, normalizeNotifications, countUnreadNotifications, markNotificationRead, markAllNotificationsRead } from '../notifications/index.js';
export { fetchProfileStats, updateUserProfile, cacheUserProfile } from '../profile/index.js';
export { changePassword } from '../auth/password.js';
export { fetchPendingReviews, fetchAdminUsers } from '../admin/index.js';
