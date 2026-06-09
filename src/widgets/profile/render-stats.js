import { t } from '../../shared/utils/i18n.js';

function statCard(icon, key, label, iconClass = "") {
  return `
    <div class="profile-stat-card animate-on-scroll">
      <i class="fas fa-${icon}${iconClass ? ` ${iconClass}` : ""}"></i>
      <div class="profile-stat-num">
        <span x-show="statsLoading"
              class="skeleton"
              style="width:2.25rem;height:1.25rem;border-radius:4px;display:inline-block"></span>
        <span x-show="!statsLoading" x-text="stats.${key}">0</span>
      </div>
      <div class="profile-stat-label">${label}</div>
    </div>`;
}

export function buildStatsHtml(o) {
  const cards = [
    ...(o.isEcommerce
      ? [statCard("box", "orders", t("dash.orders")),
         statCard("heart", "wishlist", t("dash.wishlist"))]
      : []),
    statCard("bell", "notifs", t("dash.notifications")),
    ...(o.isAuct
      ? [statCard("gavel", "auctions", t("home.activeAuctions")),
         statCard("file-export", "pendingRequests", t("auctionRequests.title"))]
      : []),
    ...(o.isAdm
      ? [statCard("clipboard-check", "pendingReviews", t("dash.pendingReviews"), "text-warning"),
         statCard("users", "totalUsers", t("dash.totalUsers"), "text-primary")]
      : []),
  ];
  return cards.join("");
}
