import { ROLES, SELLER_ROLES, ECOMMERCE_ROLES, MODERATOR_ROLES } from './roles.js';
import { getRoleFromToken, isAuthenticated } from '../utils/auth-state.js';
import { routes } from '../../app/route-map.js';

if (import.meta.env.DEV) {
  const activeRouteKeys = new Set(Object.keys(routes));
  Object.keys(routeGuards).forEach(key => {
    if (!activeRouteKeys.has(key)) console.warn(`routeGuards definition error: unknown path "${key}"`);
  });
  Object.keys(routeTitleKeys).forEach(key => {
    if (!activeRouteKeys.has(key)) console.warn(`routeTitleKeys definition error: unknown path "${key}"`);
  });
}

export { ROLES, SELLER_ROLES, ECOMMERCE_ROLES, MODERATOR_ROLES };

export const routeGuards = {
  'admin': () => getRoleFromToken() === ROLES.ADMIN,
  'cart': () => ECOMMERCE_ROLES.includes(getRoleFromToken()),
  'checkout': () => ECOMMERCE_ROLES.includes(getRoleFromToken()),
  'dashboard': () => isAuthenticated(),
  'shipping': () => ECOMMERCE_ROLES.includes(getRoleFromToken()),
  'order-detail': () => ECOMMERCE_ROLES.includes(getRoleFromToken()),
  'profile': () => isAuthenticated(),
  'auction-requests': () => getRoleFromToken() === ROLES.FISHERMAN,
  'auction-requests-review': () => MODERATOR_ROLES.includes(getRoleFromToken()),
  'auctioneer-analytics': () => MODERATOR_ROLES.includes(getRoleFromToken()),
  'subscriptions': () => [...ECOMMERCE_ROLES, ROLES.AUCTIONEER].includes(getRoleFromToken()),
  'wallet': () => isAuthenticated(),
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
