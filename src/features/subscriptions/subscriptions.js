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
    return await api.get('/subscriptionplans') || [];
  } catch { return []; }
}

export async function fetchMySubscription() {
  try {
    return await api.get('/subscriptions/my').catch(() => null);
  } catch { return null; }
}

const BACKEND_TIER_MAP = {
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export function resolveBackendSubscriptionTier(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  return BACKEND_TIER_MAP[raw.toLowerCase()] || null;
}

export function getSubscriptionUpgradeErrorMessage(err) {
  const fieldErrors = err?.data?.errors && Object.values(err.data.errors).flat().filter(Boolean);
  if (fieldErrors?.length) return String(fieldErrors[0]);
  if (err?.data?.message) return String(err.data.message);
  if (err?.data?.title) return String(err.data.title);
  if (err?.data?.detail) return String(err.data.detail);
  if (err?.message) return String(err.message);
  return t('subscriptions.upgradeError');
}

export async function upgradeSubscription(tier, paymentReference) {
  const backendTier = resolveBackendSubscriptionTier(tier);
  if (!backendTier) throw new Error(t('subscriptions.invalidTier'));
  return api.post('/subscriptions/upgrade', { tier: backendTier, paymentReference });
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
