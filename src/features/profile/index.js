import { t } from '../../app/i18n.js';
import { api } from '../../shared/api/client.js';
import { getUser, hasAnyRole, hasRole } from '../auth/login.js';
import { ROLES, ECOMMERCE_ROLES } from '../../shared/constants/roles.js';
import { showToast } from '../../widgets/ui/toast.js';
import { showConfirm } from '../../widgets/ui/modal.js';
import { observeAnimations } from '../../shared/utils/dom.js';
import { setPageMeta } from '../../shared/utils/seo.js';
import Alpine from 'alpinejs';

export async function fetchProfileStats() {
  const s = {
    orders: 0, wishlist: 0, notifs: 0, auctions: 0,
    pendingRequests: 0, pendingReviews: 0, totalUsers: 0,
  };

  await Promise.allSettled([
    ...(hasAnyRole(ECOMMERCE_ROLES)
      ? [
          api.get('/orders', { page: 1, pageSize: 1 }).then((r) => { s.orders = r?.totalCount ?? 0; }).catch(() => {}),
          api.get('/wishlist', { page: 1, pageSize: 1 }).then((r) => { s.wishlist = r?.totalCount ?? 0; }).catch(() => {}),
        ]
      : []),
    api.get('/notifications/unread-count').then((r) => { s.notifs = r?.count ?? r ?? 0; }).catch(() => {}),
    ...(hasRole(ROLES.AUCTIONEER)
      ? [api.get('/auctions/dashboard').then((r) => { s.auctions = r?.activeAuctions ?? 0; s.pendingRequests = r?.pendingRequests ?? 0; }).catch(() => {})]
      : []),
    ...(hasRole(ROLES.ADMIN)
      ? [
          api.get('/products/pending-review').then((r) => { s.pendingReviews = r?.totalCount ?? 0; }).catch(() => {}),
          api.get('/users', { page: 1, pageSize: 1 }).then((r) => { s.totalUsers = r?.totalCount ?? 0; }).catch(() => {}),
        ]
      : []),
  ]);

  for (const k of Object.keys(s)) {
    s[k] = Math.max(0, parseInt(s[k], 10) || 0);
  }
  return s;
}

export async function updateUserProfile(data) {
  return api.put('/users/profile', data);
}

export function cacheUserProfile(profileData) {
  try {
    const existing = JSON.parse(localStorage.getItem('user') || '{}');
    Object.assign(existing, profileData);
    localStorage.setItem('user', JSON.stringify(existing));
  } catch { /* ignore storage errors */ }
}

Alpine.data('profilePage', () => {
  const user = getUser();

  return {
    user,
    avatarUrl: user?.profileImage ?? null,
    avatarLoading: false,
    statsLoading: true,
    stats: { orders: 0, wishlist: 0, notifs: 0, auctions: 0, pendingRequests: 0, pendingReviews: 0, totalUsers: 0 },

    get completionPercent() {
      return (
        (this.user?.fullName ? 25 : 0) +
        (this.user?.email ? 25 : 0) +
        (this.user?.phone ? 25 : 0) +
        (this.avatarUrl ? 25 : 0)
      );
    },

    async init() {
      setPageMeta(t('profile.title'), undefined, true);
      this.$nextTick(() => observeAnimations());

      const raw = await fetchProfileStats();
      this.statsLoading = false;
      for (const [key, target] of Object.entries(raw)) {
        this._countUp(key, target);
      }
    },

    _countUp(key, target) {
      if (target <= 0) return;
      const DURATION = 800;
      const steps = Math.min(target, 60);
      const step = Math.ceil(target / steps);
      const delay = Math.round(DURATION / steps);
      let current = 0;
      const id = setInterval(() => {
        current = Math.min(current + step, target);
        this.stats[key] = current;
        if (current >= target) clearInterval(id);
      }, delay);
    },

    triggerUpload() {
      document.getElementById('profileAvatarInput')?.click();
    },

    async handleFile(e) {
      const file = e.target.files?.[0];
      e.target.value = '';

      if (!file) return;
      if (file.size > 5_000_000) {
        showToast(t('profile.imageTooLarge'), 'error');
        return;
      }

      this.avatarLoading = true;
      try {
        const form = new FormData();
        form.append('file', file);

        const upload = await api.upload('/upload', form);
        const imageUrl = upload?.url ?? upload?.data?.url;
        if (!imageUrl) throw new Error(t('profile.uploadNoUrl'));

        const u = getUser();
        await api.put('/users/profile', {
          fullName: u?.fullName ?? '',
          phone: u?.phone ?? '',
          profileImage: imageUrl,
        });

        this.avatarUrl = imageUrl;
        localStorage.setItem('user', JSON.stringify({ ...u, profileImage: imageUrl }));
        showToast(t('profile.photoUpdated'), 'success');
      } catch (err) {
        showToast(err.message || t('common.error'), 'error');
      } finally {
        this.avatarLoading = false;
      }
    },

    async deleteImage() {
      const ok = await showConfirm(t('profile.confirmDeleteTitle'), t('profile.confirmDeletePhoto'), { type: 'danger' });
      if (!ok) return;

      this.avatarLoading = true;
      try {
        await api.delete('/users/profile/image');
        this.avatarUrl = null;
        const u = getUser();
        localStorage.setItem('user', JSON.stringify({ ...u, profileImage: null }));
        showToast(t('profile.photoRemoved'), 'success');
      } catch (err) {
        showToast(err.message || t('common.error'), 'error');
      } finally {
        this.avatarLoading = false;
      }
    },
  };
});
