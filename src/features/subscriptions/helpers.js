import { t } from '../../core/i18n/index.js';
import { ROLES } from '../../shared/constants/roles.js';

const PLAN_ICONS = {
  Free: "fa-crown",
  Basic: "fa-gem",
  Pro: "fa-rocket",
  Enterprise: "fa-crown",
};

export function getPlanIcon(tier) {
  return PLAN_ICONS[tier] || "fa-crown";
}

export function getRoleSubscriptionInfo(role) {
  let heading, desc;
  if (role === ROLES.CUSTOMER) {
    heading = t("subscriptions.customerHeading");
    desc = t("subscriptions.customerDesc");
  } else if (role === ROLES.AUCTIONEER) {
    heading = t("subscriptions.auctioneerHeading");
    desc = t("subscriptions.auctioneerDesc");
  } else {
    heading = t("subscriptions.sellerHeading");
    desc = t("subscriptions.sellerDesc");
  }
  return { heading, desc };
}

export function isPopularPlan(sortOrder) {
  return sortOrder === 3;
}
