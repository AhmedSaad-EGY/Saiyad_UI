import { t } from '../../app/i18n.js';

function quickLink(href, icon, label) {
  return `
    <a href="${href}" class="profile-link-card">
      <i class="fas fa-${icon}"></i>
      <span>${label}</span>
    </a>`;
}

export function buildLinksHtml(o) {
  const links = [
    ...(o.isEcommerce
      ? [quickLink("#/dashboard?tab=orders", "shopping-bag", t("dash.orders")),
         quickLink("#/dashboard?tab=wishlist", "heart", t("dash.wishlist")),
         quickLink("#/shipping", "map-marker-alt", t("dash.addresses"))]
      : []),
    ...(o.isSeller
      ? [quickLink("#/dashboard?tab=products", "store", t("dash.myProducts")),
         quickLink("#/dashboard?tab=overview", "chart-line", t("dash.sellerDashboard"))]
      : []),
    ...(o.isAuct
      ? [quickLink("#/dashboard?tab=auctions", "gavel", t("dash.auctions")),
         quickLink("#/dashboard?tab=auctioneer-analytics", "chart-bar", t("analytics.title")),
         quickLink("#/auction-requests-review", "file-export", t("auctionRequestsReview.title"))]
      : []),
    ...(o.isAdm
      ? [quickLink("#/admin", "shield-alt", t("admin.title")),
         quickLink("#/admin", "clipboard-check", t("admin.review")),
         quickLink("#/admin", "users", t("admin.users")),
         quickLink("#/admin", "flag", t("admin.reports"))]
      : []),
    quickLink("#/dashboard?tab=notifications", "bell", t("dash.notifications")),
    quickLink("#/wallet", "wallet", t("wallet.title")),
  ];
  return links.join("");
}
