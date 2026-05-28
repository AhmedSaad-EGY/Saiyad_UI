import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { isAuthenticated, getUser } from '../core/auth/index.js';
import { SELLER_ROLES } from '../shared/constants/roles.js';
import { navigate } from '../core/router/index.js';
import { escapeHtml, observeAnimations } from '../core/utils/dom.js';
import { showToast } from '../core/utils/ui.js';
import Alpine from 'alpinejs';

Alpine.data('profilePage', () => ({
  stats: { orders: '—', wishlist: '—', notifs: '—' },
  init() {
    Promise.allSettled([
      api.get('/orders', { page: 1, pageSize: 1 }),
      api.get('/wishlist', { page: 1, pageSize: 1 }),
      api.get('/notifications/unread-count'),
    ]).then(([orders, wishlist, notifs]) => {
      if (orders.status === 'fulfilled') this.stats.orders = orders.value?.totalCount ?? '0';
      if (wishlist.status === 'fulfilled') this.stats.wishlist = wishlist.value?.totalCount ?? '0';
      if (notifs.status === 'fulfilled') this.stats.notifs = notifs.value?.count ?? '0';
    });
    this.$nextTick(() => observeAnimations());
  },

  triggerUpload() {
    document.getElementById('profileAvatarInput')?.click();
  },

  async handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500_000) {
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
      await api.put('/users/profile', { fullName: u?.fullName || '', phone: u?.phone || '', profileImageUrl: imageUrl });
      const updated = { ...u, profileImageUrl: imageUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      const avatar = document.getElementById('profileAvatar');
      if (avatar) {
        avatar.innerHTML = `<span class="avatar-overlay"><i class="fas fa-camera"></i></span><img src="${  imageUrl  }" alt="" loading="lazy">`;
      }
      showToast(t('profile.photoUpdated'), 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  },
}));

export default async function renderUserProfile(container) {
  if (!isAuthenticated()) {
    navigate('login');
    return;
  }

  const user = getUser();

  container.innerHTML = `
    <div x-data="profilePage" class="profile-page">
      <div class="profile-hero card animate-on-scroll">
        <div class="card-body d-flex align-items-center gap-4 flex-wrap">
        <div class="profile-avatar" id="profileAvatar" @click="triggerUpload()" title="Click to upload photo">
          <span class="avatar-overlay"><i class="fas fa-camera"></i></span>
          ${user?.profileImageUrl ? `<img src="${user.profileImageUrl}" alt="" loading="lazy">` : '<i class="fas fa-user"></i>'}
        </div>
        <input type="file" id="profileAvatarInput" accept="image/jpeg,image/png,image/webp" @change="handleFile($event)" class="d-none">
        <div class="profile-hero-info">
          <h1 class="profile-name">${escapeHtml(user?.fullName || t('dash.profile'))}</h1>
          <p class="profile-email"><i class="fas fa-envelope"></i> ${escapeHtml(user?.email || '')}</p>
          ${user?.phone ? `<p class="profile-phone"><i class="fas fa-phone"></i> ${  escapeHtml(user.phone)  }</p>` : ''}
          <span class="profile-role-badge">${escapeHtml(user?.role || 'Customer')}</span>
        </div>
        <div class="profile-hero-actions">
          <a href="#/dashboard?tab=profile" class="btn btn-outline btn-sm"><i class="fas fa-edit"></i> ${t('dash.updateProfile')}</a>
          <a href="#/dashboard?tab=password" class="btn btn-ghost btn-sm"><i class="fas fa-lock"></i> ${t('dash.changePassword')}</a>
        </div>
      </div>

      <div class="row g-3 animate-on-scroll stagger-1" id="profileStats">
        <div class="col-sm-4">
          <div class="profile-stat-card">
            <i class="fas fa-box"></i>
            <div class="profile-stat-num" x-text="stats.orders">—</div>
            <div class="profile-stat-label">${t('dash.orders')}</div>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="profile-stat-card">
            <i class="fas fa-heart"></i>
            <div class="profile-stat-num" x-text="stats.wishlist">—</div>
            <div class="profile-stat-label">${t('dash.wishlist')}</div>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="profile-stat-card">
            <i class="fas fa-bell"></i>
            <div class="profile-stat-num" x-text="stats.notifs">—</div>
            <div class="profile-stat-label">${t('dash.notifications')}</div>
          </div>
        </div>
      </div>
      </div>

      <div class="profile-quick-links card animate-on-scroll stagger-2">
        <div class="card-header border-bottom-0">
          <h3>${t('common.quickLinks')}</h3>
        </div>
        <div class="card-body">
        <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3 mt-3">
          ${user?.role !== 'Admin' ? `
            <a href="#/dashboard?tab=orders" class="profile-link-card"><i class="fas fa-shopping-bag"></i><span>${t('dash.orders')}</span></a>
            <a href="#/dashboard?tab=wishlist" class="profile-link-card"><i class="fas fa-heart"></i><span>${t('dash.wishlist')}</span></a>
            <a href="#/shipping" class="profile-link-card"><i class="fas fa-map-marker-alt"></i><span>${t('dash.addresses')}</span></a>
          ` : ''}
          <a href="#/dashboard?tab=notifications" class="profile-link-card"><i class="fas fa-bell"></i><span>${t('dash.notifications')}</span></a>
          ${SELLER_ROLES.includes(user?.role) ? `
            <a href="#/dashboard?tab=products" class="profile-link-card"><i class="fas fa-store"></i><span>${t('dash.myProducts')}</span></a>
            <a href="#/dashboard?tab=overview" class="profile-link-card"><i class="fas fa-chart-line"></i><span>${t('dash.sellerDashboard')}</span></a>
          ` : ''}
        </div>
        </div>
      </div>
    </div>`;
}
