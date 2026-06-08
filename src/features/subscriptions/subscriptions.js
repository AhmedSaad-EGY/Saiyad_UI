import { api } from '../../shared/api/client.js';
import { t } from '../../app/i18n.js';
import { ROLES } from '../../shared/constants/roles.js';

export function getPlanIcon(tier) {
  const icons = { 1: 'fa-fish', 2: 'fa-water', 3: 'fa-ship', 4: 'fa-crown' };
  return icons[tier] || 'fa-fish';
}

export function getRoleSubscriptionInfo(role) {
  const map = {
    [ROLES.FISHERMAN]: { heading: t('subscriptions.fishermanHeading'), desc: t('subscriptions.fishermanDesc') },
    [ROLES.BAIT_SELLER]: { heading: t('subscriptions.baitSellerHeading'), desc: t('subscriptions.baitSellerDesc') },
    [ROLES.AUCTIONEER]: { heading: t('subscriptions.auctioneerHeading'), desc: t('subscriptions.auctioneerDesc') },
  };
  return map[role] || { heading: '', desc: '' };
}

export function isPopularPlan(sortOrder) {
  return sortOrder === 3;
}

export async function fetchPlans() {
  try {
    return await api.get('/SubscriptionPlans') || [];
  } catch { return []; }
}

export async function fetchMySubscription() {
  try {
    return await api.get('/subscriptions/my').catch(() => null);
  } catch { return null; }
}

export async function upgradeSubscription(tier, paymentReference) {
  return api.post('/subscriptions/upgrade', { tier, paymentReference });
}
