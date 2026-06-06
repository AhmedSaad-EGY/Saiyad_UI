import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { isAuthenticated, getUser } from '../core/auth/index.js';
import { ROLES, SELLER_ROLES, ECOMMERCE_ROLES } from '../shared/constants/roles.js';
import { hasAnyRole, hasRole } from '../core/auth/index.js';
import { navigate } from '../core/router/index.js';
import { escapeHtml, observeAnimations } from '../core/utils/dom.js';
import { showToast } from '../core/utils/ui.js';
import { setPageMeta } from '../core/utils/seo.js';
import Alpine from 'alpinejs';

Alpine.data('profilePage', () => ({
  stats: { orders: 0, wishlist: 0, notifs: 0, auctions: 0, pendingRequests: 0 },
  init() {
    setPageMeta(t('profile.title'), undefined, true);
    const promises = [];
    if (hasAnyRole(ECOMMERCE_ROLES)) {
      promises.push(api.get('/orders', { page: 1, pageSize: 1 }));
      promises.push(api.get('/wishlist', { page: 1, pageSize: 1 }));
    }
    promises.push(api.get('/notifications/unread-count'));
    if (hasRole(ROLES.AUCTIONEER)) {
      promises.push(api.get('/auctions/dashboard'));
    }
    Promise.allSettled(promises).then((results) => {
      const hasEcom = hasAnyRole(ECOMMERCE_ROLES);
      const isAuctioneer = hasRole(ROLES.AUCTIONEER);
      let offset = 0;
      if (hasEcom) offset = 2;
      const orders = results[0];
      const wishlist = results[1];
      const notifs = results[offset];
      const auctionData = results[offset + 1];
      if (orders?.status === 'fulfilled') this.animateValue('orders', parseInt(orders.value?.totalCount ?? 0, 10));
      if (wishlist?.status === 'fulfilled') this.animateValue('wishlist', parseInt(wishlist.value?.totalCount ?? 0, 10));
      if (notifs?.status === 'fulfilled') this.animateValue('notifs', parseInt(notifs.value?.count ?? 0, 10));
      if (auctionData?.status === 'fulfilled') {
        this.animateValue('auctions', parseInt(auctionData.value?.activeAuctions ?? 0, 10));
        this.animateValue('pendingRequests', parseInt(auctionData.value?.pendingRequests ?? 0, 10));
      }
    });
    this.$nextTick(() => {
      // Trigger profile fill anim transition
      const fillEl = document.querySelector('.profile-completion-fill');
      if (fillEl) void fillEl.offsetHeight; // Trigger reflow/paint
      observeAnimations();
    });
  },

  animateValue(prop, endVal) {
    if (endVal <= 0) {
      this.stats[prop] = 0;
      return;
    }
    let start = 0;
    const duration = 800;
    const stepTime = Math.max(10, Math.floor(duration / endVal));
    const stepAmount = Math.max(1, Math.ceil(endVal / (duration / stepTime)));
    const timer = setInterval(() => {
      start += stepAmount;
      if (start >= endVal) {
        this.stats[prop] = endVal;
        clearInterval(timer);
      } else {
        this.stats[prop] = start;
      }
    }, stepTime);
  },

  triggerUpload() {
    document.getElementById('profileAvatarInput')?.click();
  },

  async handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      showToast(t('profile.imageTooLarge'), 'error');
      e.target.value = '';
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const upload = await api.upload('/upload', formData);
      const imageUrl = upload?.url || upload?.data?.url;
      if (!imageUrl) throw new Error(t('profile.uploadNoUrl'));
      const u = getUser();
      await api.put('/users/profile', { fullName: u?.fullName || '', phone: u?.phone || '', profileImage: imageUrl });
      const updated = { ...u, profileImageUrl: imageUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      const avatar = document.getElementById('profileAvatar');
      if (avatar) {
        avatar.innerHTML = `<span class="avatar-overlay"><i class="fas fa-camera" aria-hidden="true"></i></span><img src="${  imageUrl  }" alt="" loading="lazy">`;
      }
      showToast(t('profile.photoUpdated'), 'success');
    } catch (err) {
      console.error('[Profile] Upload error:', err);
      showToast(err.message, 'error');
    }
  },

  isECommerce() { return hasAnyRole(ECOMMERCE_ROLES); },
  isAuctioneer() { return hasRole(ROLES.AUCTIONEER); },
}));

export default async function renderProfile(container) {
  if (!isAuthenticated()) {
    navigate('login');
    return;
  }

  const user = getUser();
  let completionPercent = 0;
  if (user?.fullName) completionPercent += 25;
  if (user?.email) completionPercent += 25;
  if (user?.phone) completionPercent += 25;
  if (user?.profileImageUrl) completionPercent += 25;

  container.innerHTML = `
    <div x-data="profilePage" class="profile-page">
      <div class="profile-hero card animate-on-scroll">
        <div class="card-body d-flex align-items-center gap-4 flex-wrap">
        <div class="profile-avatar" id="profileAvatar" @click="triggerUpload()" :title="$t('profile.uploadPhoto')">
          <span class="avatar-overlay"><i class="fas fa-camera" aria-hidden="true"></i></span>
          ${user?.profileImageUrl ? `<img src="${user.profileImageUrl}" alt="" loading="lazy">` : '<i class="fas fa-user" aria-hidden="true"></i>'}
        </div>
        <input type="file" id="profileAvatarInput" accept="image/jpeg,image/png,image/webp" @change="handleFile($event)" class="d-none">
        <div class="profile-hero-info">
          <h1 class="profile-name">${escapeHtml(user?.fullName || t('dash.profile'))}</h1>
          <p class="profile-email"><i class="fas fa-envelope" aria-hidden="true"></i> ${escapeHtml(user?.email || '')}</p>
          ${user?.phone ? `<p class="profile-phone"><i class="fas fa-phone" aria-hidden="true"></i> ${  escapeHtml(user.phone)  }</p>` : ''}
          <span class="profile-role-badge">${escapeHtml(user?.role ?? '')}</span>
        </div>
        <div class="profile-hero-actions">
          <a href="#/dashboard?tab=profile" class="btn btn-outline btn-sm"><i class="fas fa-edit" aria-hidden="true"></i> ${t('dash.updateProfile')}</a>
          <a href="#/dashboard?tab=password" class="btn btn-ghost btn-sm"><i class="fas fa-lock" aria-hidden="true"></i> ${t('dash.changePassword')}</a>
        </div>
      </div>

      <!-- Profile Completion Tracker -->
      <div class="profile-completion animate__animated animate__fadeIn mt-4 mb-3">
        <div class="profile-completion-header">
          <span><i class="fas fa-id-card" aria-hidden="true"></i> ${t('profile.completion')}</span>
          <span class="fw-bold text-primary">${completionPercent}%</span>
        </div>
        <div class="profile-completion-bar">
          <div class="profile-completion-fill" style="width: ${completionPercent}%"></div>
        </div>
      </div>

      <div class="row g-3 animate-on-scroll stagger-1" id="profileStats">
        <div class="col-sm" x-show="isECommerce()">
          <div class="profile-stat-card">
            <i class="fas fa-box" aria-hidden="true"></i>
            <div class="profile-stat-num" x-text="stats.orders">—</div>
            <div class="profile-stat-label">${t('dash.orders')}</div>
          </div>
        </div>
        <div class="col-sm" x-show="isECommerce()">
          <div class="profile-stat-card">
            <i class="fas fa-heart" aria-hidden="true"></i>
            <div class="profile-stat-num" x-text="stats.wishlist">—</div>
            <div class="profile-stat-label">${t('dash.wishlist')}</div>
          </div>
        </div>
        <div class="col-sm" x-show="isAuctioneer()">
          <div class="profile-stat-card">
            <i class="fas fa-gavel" aria-hidden="true"></i>
            <div class="profile-stat-num" x-text="stats.auctions">—</div>
            <div class="profile-stat-label">${t('home.activeAuctions')}</div>
          </div>
        </div>
        <div class="col-sm" x-show="isAuctioneer()">
          <div class="profile-stat-card">
            <i class="fas fa-file-export" aria-hidden="true"></i>
            <div class="profile-stat-num" x-text="stats.pendingRequests">—</div>
            <div class="profile-stat-label">${t('auctionRequests.title')}</div>
          </div>
        </div>
        <div class="col-sm">
          <div class="profile-stat-card">
            <i class="fas fa-bell" aria-hidden="true"></i>
            <div class="profile-stat-num" x-text="stats.notifs">—</div>
            <div class="profile-stat-label">${t('dash.notifications')}</div>
          </div>
        </div>
      </div>

      <div class="profile-quick-links card animate-on-scroll stagger-2">
        <div class="card-header border-bottom-0">
          <h3>${t('common.quickLinks')}</h3>
        </div>
        <div class="card-body">
        <div class="profile-link-grid mt-3">
          ${ECOMMERCE_ROLES.includes(user?.role) ? `
            <a href="#/dashboard?tab=orders" class="profile-link-card"><i class="fas fa-shopping-bag" aria-hidden="true"></i><span>${t('dash.orders')}</span></a>
            <a href="#/dashboard?tab=wishlist" class="profile-link-card"><i class="fas fa-heart" aria-hidden="true"></i><span>${t('dash.wishlist')}</span></a>
            <a href="#/shipping" class="profile-link-card"><i class="fas fa-map-marker-alt" aria-hidden="true"></i><span>${t('dash.addresses')}</span></a>
          ` : ''}
          ${user?.role === ROLES.AUCTIONEER ? `
            <a href="#/dashboard?tab=auctions" class="profile-link-card"><i class="fas fa-gavel" aria-hidden="true"></i><span>${t('dash.auctions')}</span></a>
            <a href="#/dashboard?tab=auctioneer-analytics" class="profile-link-card"><i class="fas fa-chart-bar" aria-hidden="true"></i><span>${t('analytics.title')}</span></a>
          ` : ''}
          <a href="#/dashboard?tab=notifications" class="profile-link-card"><i class="fas fa-bell" aria-hidden="true"></i><span>${t('dash.notifications')}</span></a>
          ${SELLER_ROLES.includes(user?.role) ? `
            <a href="#/dashboard?tab=products" class="profile-link-card"><i class="fas fa-store" aria-hidden="true"></i><span>${t('dash.myProducts')}</span></a>
            <a href="#/dashboard?tab=overview" class="profile-link-card"><i class="fas fa-chart-line" aria-hidden="true"></i><span>${t('dash.sellerDashboard')}</span></a>
          ` : ''}
        </div>
        </div>
      </div>
    </div>`;
}
