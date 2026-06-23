import { ROLES, SELLER_ROLES, ECOMMERCE_ROLES, MODERATOR_ROLES } from './roles.js';
import { getRolesFromToken } from '../utils/auth-state.js';
import {
  canAccessAdmin,
  canAccessAuctioneerAnalytics,
  canAccessDashboard,
  canAccessOrders,
  canAccessProfile,
  canAccessShipping,
  canAccessSubscriptions,
  canCheckout,
  canCreateAuctionRequest,
  canReviewAuctionRequests,
  canUseCart,
  canUseWallet,
} from '../utils/capabilities.js';
import { routes } from '../../app/route-map.js';

export { ROLES, SELLER_ROLES, ECOMMERCE_ROLES, MODERATOR_ROLES };

export const routeGuards = {
  'admin': () => canAccessAdmin(getRolesFromToken()),
  'cart': () => canUseCart(getRolesFromToken()),
  'checkout': () => canCheckout(getRolesFromToken()),
  'dashboard': () => canAccessDashboard(getRolesFromToken()),
  'shipping': () => canAccessShipping(getRolesFromToken()),
  'order-detail': () => canAccessOrders(getRolesFromToken()),
  'profile': () => canAccessProfile(getRolesFromToken()),
  'auction-requests': () => canCreateAuctionRequest(getRolesFromToken()),
  'auction-requests-review': () => canReviewAuctionRequests(getRolesFromToken()),
  'auctioneer-analytics': () => canAccessAuctioneerAnalytics(getRolesFromToken()),
  'subscriptions': () => canAccessSubscriptions(getRolesFromToken()),
  'wallet': () => canUseWallet(getRolesFromToken()),
};

export const routeTitleKeys = {
  "": "home.welcome",
  login: "nav.login",
  register: "nav.register",
  "forgot-password": "auth.forgotPassword",
  "reset-password": "auth.resetPassword",
  products: "products.title",
  "product-detail": "products.title",
  auctions: "auctions.title",
  "auction-detail": "auctions.title",
  cart: "nav.cart",
  checkout: "cart.title",
  dashboard: "nav.dashboard",
  "verify-email": "verify.title",
  "verify-waiting": "verify.waitingTitle",
  shipping: "shipping.title",
  "seller-profile": "seller.title",
  "order-detail": "order.title",
  admin: "admin.title",
  terms: "auth.termsAndConditions",
  privacy: "auth.privacyPolicy",
  profile: "dash.profile",
  "auction-requests": "auctionRequests.title",
  "auction-requests-review": "auctionRequestsReview.title",
  "auctioneer-analytics": "analytics.title",
  subscriptions: "subscriptions.title",
  wallet: "wallet.title",
};

if (import.meta.env.DEV) {
  const activeRouteKeys = new Set(Object.keys(routes));
  Object.keys(routeGuards).forEach(key => {
    if (!activeRouteKeys.has(key)) console.warn(`routeGuards definition error: unknown path "${key}"`);
  });
  Object.keys(routeTitleKeys).forEach(key => {
    if (!activeRouteKeys.has(key)) console.warn(`routeTitleKeys definition error: unknown path "${key}"`);
  });
}
