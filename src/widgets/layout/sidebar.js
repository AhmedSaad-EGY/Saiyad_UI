import { t } from '../../app/i18n.js';
import { hasAnyRole, getUser } from '../../features/auth/login.js';
import { SELLER_ROLES, MODERATOR_ROLES } from '../../shared/constants/roles.js';

export function renderDashboardSidebar(activeTab) {
  const user = getUser();
  const isSeller = user && SELLER_ROLES.includes(user.role);
  const isModerator = user && MODERATOR_ROLES.includes(user.role);
  const isAdmin = user?.role === 'Admin';

  const tabs = [
    { key: 'overview', icon: 'fa-chart-pie', label: t('dashboard.overview') },
    { key: 'orders', icon: 'fa-shopping-bag', label: t('dashboard.orders') },
  ];
  if (isSeller) {
    tabs.push({ key: 'products', icon: 'fa-store', label: t('dashboard.products') });
    tabs.push({ key: 'auctions', icon: 'fa-gavel', label: t('dashboard.auctions') });
  }
  if (isModerator) {
    tabs.push({ key: 'auction-requests', icon: 'fa-paper-plane', label: t('dashboard.auctionRequests') });
    tabs.push({ key: 'auction-requests-review', icon: 'fa-clipboard-check', label: t('dashboard.reviewRequests') });
    tabs.push({ key: 'auctioneer-analytics', icon: 'fa-chart-line', label: t('dashboard.analytics') });
  }
  tabs.push(
    { key: 'wishlist', icon: 'fa-heart', label: t('dashboard.wishlist') },
    { key: 'notifications', icon: 'fa-bell', label: t('dashboard.notifications') },
    { key: 'profile', icon: 'fa-user', label: t('dashboard.profile') },
    { key: 'password', icon: 'fa-key', label: t('dashboard.changePassword') },
  );
  if (isAdmin) tabs.push({ key: 'admin', icon: 'fa-shield-alt', label: t('dashboard.admin') });

  return tabs.map(t => `
    <button class="dash-link${t.key === activeTab ? ' active' : ''}" data-tab="${t.key}">
      <i class="fas ${t.icon}"></i> ${t.label}
    </button>`).join('');
}
