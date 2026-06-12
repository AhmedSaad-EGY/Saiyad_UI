import { t } from '../../shared/utils/i18n.js';
import { ROLES, SELLER_ROLES } from '../../shared/constants/roles.js';
import { escapeHtml, observeAnimations } from '../../shared/utils/dom.js';

export function renderOverview(content, user, stats) {
  const isAdmin = user?.role === ROLES.ADMIN;
  const sellerRoles = user && SELLER_ROLES.includes(user.role);

  content.innerHTML = `
    <div class="card animate-on-scroll mb-4">
      <div class="card-header">
        <h3><i class="fas fa-tachometer-alt" aria-hidden="true"></i> ${t("dash.overview")}</h3>
      </div>
      <div class="card-body">
        <p class="text-muted mt-1">${t("dash.welcome")}, <strong>${escapeHtml(user?.fullName || "User")}</strong>!</p>
        <p class="text-muted">${t("dash.role")}: <span class="category-tag">${user?.role || t("common.N/A")}</span></p>
      </div>
    </div>
    <div class="row g-3 mt-3">
      <div class="col-sm-6 d-flex">
        <div class="card animate-on-scroll stagger-1 flex-fill">
          ${isAdmin ? `
            <h3><i class="fas fa-clipboard-check text-warning" aria-hidden="true"></i> ${t("dash.pendingReviews")}</h3>
            <p class="fs-2 fw-bold text-warning">${stats?.pendingReviewsCount ?? 0}</p>
            <p class="text-muted">${t("dash.productsAwaitingReview")}</p>
            <a href="#/admin" class="btn btn-outline btn-sm mt-1">${t("dash.viewAdminPanel")}</a>
          ` : `
            <h3><i class="fas fa-box" aria-hidden="true"></i> ${t("dash.orders")}</h3>
            <p class="fs-2 fw-bold text-primary">${stats?.ordersCount ?? 0}</p>
            <p class="text-muted">${t("dash.totalOrders")}</p>
          `}
        </div>
      </div>
      <div class="col-sm-6 d-flex">
        <div class="card animate-on-scroll stagger-2 flex-fill">
          ${isAdmin ? `
            <h3><i class="fas fa-users text-primary" aria-hidden="true"></i> ${t("dash.totalUsers")}</h3>
            <p class="fs-2 fw-bold text-primary">${stats?.usersCount ?? 0}</p>
            <p class="text-muted">${t("dash.registeredUsers")}</p>
            <a href="#/admin" class="btn btn-outline btn-sm mt-1">${t("dash.viewAdminPanel")}</a>
          ` : sellerRoles ? `
            <h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3>
            <p class="fs-2 fw-bold text-primary">${stats?.productsCount ?? 0}</p>
            <p class="text-muted">${t("dash.yourProducts")}</p>
          ` : `
            <h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3>
            <p class="text-muted mt-2">${t("dash.productsNotAvailable")}</p>
          `}
        </div>
      </div>
    </div>
  `;

  if (!isAdmin && sellerRoles && stats?.sellerProfile404) {
    const banner = document.createElement("div");
    banner.id = "sellerOnboardBanner";
    banner.className = "alert alert-info animate-on-scroll d-flex align-items-center gap-3 flex-wrap mb-3";
    banner.setAttribute("role", "status");
    banner.innerHTML = `
      <i class="fas fa-store fs-5 flex-shrink-0" aria-hidden="true"></i>
      <span class="flex-fill">
        <strong>${t("seller.setupRequired")}</strong> —
        ${t("seller.setupDesc")}
        <a href="#/seller-profile" class="btn btn-sm btn-outline-primary ms-2">
          ${t("seller.create")} <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </a>
      </span>`;
    content.prepend(banner);
  }

  observeAnimations();
}
