import { t } from '../../app/i18n.js';
import { hasAnyRole } from '../../features/auth/login.js';
import { ROLES, SELLER_ROLES } from '../../shared/constants/roles.js';
import { escapeHtml, observeAnimations } from '../../shared/utils/dom.js';
import { fetchMySellerProfile } from '../../features/dashboard/index.js';
import { fetchOrders } from '../../features/dashboard/index.js';
import { fetchMyProducts } from '../../features/dashboard/index.js';
import { fetchPendingReviews, fetchAdminUsers } from '../../features/dashboard/index.js';

export async function renderOverview(content, user) {
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
        <div class="card animate-on-scroll stagger-1 flex-fill" id="dashOrders"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
      </div>
      <div class="col-sm-6 d-flex">
        <div class="card animate-on-scroll stagger-2 flex-fill" id="dashProducts"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
      </div>
    </div>
  `;
  observeAnimations();

  const isAdmin = user?.role === ROLES.ADMIN;

  if (isAdmin) {
    try {
      const pending = await fetchPendingReviews(1, 1);
      document.getElementById("dashOrders").innerHTML =
        `<h3><i class="fas fa-clipboard-check text-warning" aria-hidden="true"></i> ${t("dash.pendingReviews")}</h3><p class="fs-2 fw-bold text-warning">${pending.totalCount || 0}</p><p class="text-muted">${t("dash.productsAwaitingReview")}</p><a href="#/admin" class="btn btn-outline btn-sm mt-1">${t("dash.viewAdminPanel")}</a>`;
    } catch {
      document.getElementById("dashOrders").innerHTML =
        `<h3><i class="fas fa-clipboard-check" aria-hidden="true"></i> ${t("dash.pendingReviews")}</h3><p class="text-muted mt-2">${t("common.error")}</p><a href="#/admin" class="btn btn-outline btn-sm mt-1">${t("dash.viewAdminPanel")}</a>`;
    }

    try {
      const users = await fetchAdminUsers(1, 1);
      document.getElementById("dashProducts").innerHTML =
        `<h3><i class="fas fa-users text-primary" aria-hidden="true"></i> ${t("dash.totalUsers")}</h3><p class="fs-2 fw-bold text-primary">${users.totalCount || 0}</p><p class="text-muted">${t("dash.registeredUsers")}</p><a href="#/admin" class="btn btn-outline btn-sm mt-1">${t("dash.viewAdminPanel")}</a>`;
    } catch {
      document.getElementById("dashProducts").innerHTML =
        `<h3><i class="fas fa-users" aria-hidden="true"></i> ${t("dash.totalUsers")}</h3><p class="text-muted mt-2">${t("common.error")}</p><a href="#/admin" class="btn btn-outline btn-sm mt-1">${t("dash.viewAdminPanel")}</a>`;
    }
  } else {
    try {
      const orders = await fetchOrders(1, 1);
      document.getElementById("dashOrders").innerHTML =
        `<h3><i class="fas fa-box" aria-hidden="true"></i> ${t("dash.orders")}</h3><p class="fs-2 fw-bold text-primary">${orders.totalCount || orders.total || 0}</p><p class="text-muted">${t("dash.totalOrders")}</p>`;
    } catch {
      document.getElementById("dashOrders").innerHTML =
        `<div class="alert alert-info" role="alert">${t("common.error")}</div>`;
    }

    const sellerRoles = hasAnyRole(...(SELLER_ROLES));

    if (sellerRoles) {
      try {
        await fetchMySellerProfile();
      } catch (profileErr) {
        const is404 = profileErr?.status === 404
          || String(profileErr?.message || "").includes("404")
          || String(profileErr?.message || "").toLowerCase().includes("not found");
        if (is404 && !document.getElementById("sellerOnboardBanner")) {
          const overviewEl = document.getElementById("dashOverview") || content;
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
            </a>`;
          overviewEl.prepend(banner);
        }
      }
    }

    if (sellerRoles) {
      try {
        const products = await fetchMyProducts(1);
        document.getElementById("dashProducts").innerHTML =
          `<h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3><p class="fs-2 fw-bold text-primary">${products.totalCount || products.total || 0}</p><p class="text-muted">${t("dash.yourProducts")}</p>`;
      } catch (_e) {
        document.getElementById("dashProducts").innerHTML =
          `<div class="card text-center p-4"><h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3><p class="text-muted mt-2">${t("dash.productsNotAvailable")}</p></div>`;
      }
    } else {
      document.getElementById("dashProducts").innerHTML =
        `<div class="card text-center p-4"><h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3><p class="text-muted mt-2">${t("dash.productsNotAvailable")}</p></div>`;
    }
  }
}
