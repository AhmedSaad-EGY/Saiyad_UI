import { ROLES, SELLER_ROLES, ECOMMERCE_ROLES, MODERATOR_ROLES } from './roles.js';

export { ROLES, SELLER_ROLES, ECOMMERCE_ROLES, MODERATOR_ROLES };

export const routeGuards = {
  'admin': (user) => !!user && user.role === ROLES.ADMIN,
  'cart': (user) => !!user && ECOMMERCE_ROLES.includes(user.role),
  'checkout': (user) => !!user && ECOMMERCE_ROLES.includes(user.role),
  'dashboard': (user) => !!user,
  'shipping': (user) => !!user && ECOMMERCE_ROLES.includes(user.role),
  'order-detail': (user) => !!user && ECOMMERCE_ROLES.includes(user.role),
  'profile': (user) => !!user,
  'auction-requests': (user) => !!user && user.role === ROLES.FISHERMAN,
  'auction-requests-review': (user) => !!user && MODERATOR_ROLES.includes(user.role),
  'auctioneer-analytics': (user) => !!user && MODERATOR_ROLES.includes(user.role),
  'subscriptions': (user) => !!user && (ECOMMERCE_ROLES.includes(user.role) || user.role === ROLES.AUCTIONEER),
  'wallet': (user) => !!user,
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
