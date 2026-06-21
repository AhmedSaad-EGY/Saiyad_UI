import { ECOMMERCE_ROLES, MODERATOR_ROLES, ROLES, SELLER_ROLES } from '../constants/roles.js';

const CANONICAL_ROLES = new Map(Object.values(ROLES).map((role) => [
  role.toLowerCase().replace(/[\s_-]/g, ''),
  role,
]));
const KNOWN_ROLES = Object.freeze(Object.values(ROLES));

export function normalizeRole(role) {
  if (typeof role !== 'string') return null;
  return CANONICAL_ROLES.get(role.trim().toLowerCase().replace(/[\s_-]/g, '')) || null;
}

export function normalizeRoles(userOrRoles) {
  let source = userOrRoles;
  if (source && typeof source === 'object' && !Array.isArray(source)) {
    source = Array.isArray(source.roles) && source.roles.length
      ? source.roles
      : source.role;
  }
  const values = Array.isArray(source)
    ? source
    : typeof source === 'string'
      ? source.split(',')
      : [];
  return [...new Set(values.map(normalizeRole).filter(Boolean))];
}

export function hasRole(userOrRoles, role) {
  const normalized = normalizeRole(role);
  return Boolean(normalized && normalizeRoles(userOrRoles).includes(normalized));
}

export function hasAnyRole(userOrRoles, roles) {
  const expected = normalizeRoles(roles);
  return normalizeRoles(userOrRoles).some((role) => expected.includes(role));
}

export const canUseCart = (subject) => hasAnyRole(subject, ECOMMERCE_ROLES);
export const canCheckout = canUseCart;
export const canAccessOrders = canUseCart;
export const canAccessShipping = canUseCart;
export const canAccessSubscriptions = canUseCart;
export const canUseWallet = (subject) => hasAnyRole(subject, KNOWN_ROLES);
export const canTopUpWallet = canUseCart;
export const canWithdrawWallet = canUseWallet;
export const canAccessAdmin = (subject) => hasRole(subject, ROLES.ADMIN);
export const canManageProducts = (subject) => hasAnyRole(subject, SELLER_ROLES);
export const canCreateAuctionRequest = (subject) => hasRole(subject, ROLES.FISHERMAN);
export const canReviewAuctionRequests = (subject) => hasAnyRole(subject, MODERATOR_ROLES);
export const canAccessSellerDashboard = canManageProducts;
export const canAccessAuctioneerAnalytics = canReviewAuctionRequests;
export const canAccessDashboard = (subject) => hasAnyRole(subject, KNOWN_ROLES);
export const canAccessProfile = canAccessDashboard;

const CAPABILITIES = Object.freeze({
  admin: canAccessAdmin,
  cart: canUseCart,
  checkout: canCheckout,
  dashboard: canAccessDashboard,
  manageProducts: canManageProducts,
  orders: canAccessOrders,
  profile: canAccessProfile,
  reviewAuctionRequests: canReviewAuctionRequests,
  shipping: canAccessShipping,
  subscriptions: canAccessSubscriptions,
  wallet: canUseWallet,
});

export function hasCapability(subject, capability) {
  return CAPABILITIES[capability]?.(subject) ?? false;
}

export function getWalletCapabilities(subject) {
  return {
    canDeposit: canTopUpWallet(subject),
    canWithdraw: canWithdrawWallet(subject),
  };
}
