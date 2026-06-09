import { api } from '../../shared/api/client.js';
import { t } from '../../shared/utils/i18n.js';
import { ROLES } from '../../shared/constants/roles.js';
import { fetchWalletBalance } from '../wallet/wallet.js';

export { getPlanIcon, isPopularPlan } from '../../shared/utils/plans.js';

export function getRoleSubscriptionInfo(role) {
  const map = {
    [ROLES.FISHERMAN]: { heading: t('subscriptions.fishermanHeading'), desc: t('subscriptions.fishermanDesc') },
    [ROLES.BAIT_SELLER]: { heading: t('subscriptions.baitSellerHeading'), desc: t('subscriptions.baitSellerDesc') },
    [ROLES.AUCTIONEER]: { heading: t('subscriptions.auctioneerHeading'), desc: t('subscriptions.auctioneerDesc') },
  };
  return map[role] || { heading: '', desc: '' };
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

export async function fetchSubscriptionsPageData() {
  const [plans, mySub, walletData] = await Promise.all([
    fetchPlans(),
    fetchMySubscription(),
    fetchWalletBalance(),
  ]);
  return {
    plans: plans || [],
    mySubscription: mySub || null,
    walletBalance: walletData?.availableBalance ?? null,
  };
}
