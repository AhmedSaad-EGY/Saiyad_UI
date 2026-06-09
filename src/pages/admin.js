import { t } from '../shared/utils/i18n.js';
import { getUser } from '../features/auth/login.js';
import { ROLES } from '../shared/constants/roles.js';
import { setPageMeta } from '../shared/utils/seo.js';
import {
  renderUsers as renderUsersWidget,
  renderReports as renderReportsWidget,
  renderAdminProducts as renderAdminProductsWidget,
  renderReviews as renderReviewsWidget,
  renderCategories as renderCategoriesWidget,
  renderRevenue as renderRevenueWidget,
  renderPlans as renderPlansWidget
} from '../widgets/admin/index.js';
import {
  fetchAdminUsers, toggleUserStatus,
  fetchReports, resolveReport,
  fetchAdminProducts, updateProductStatus,
  fetchPendingReviews, approveProduct, rejectProduct,
  fetchCategories, createCategory, deleteCategory,
  fetchWallet, fetchWalletTransactions,
  fetchSubscriptionPlans, updateSubscriptionPlan, deleteSubscriptionPlan,   createSubscriptionPlan,
  computeFeeTotals,
} from '../features/admin/index.js';

export default async function renderAdmin(container) {
  const _u = getUser();
  if (!_u || _u.role !== ROLES.ADMIN) { window.location.hash = '#/'; return; }
  setPageMeta(t('admin.title'), undefined, true);

  const tabs = [
    { id: "users", icon: "fa-users", label: t("admin.users") },
    { id: "reports", icon: "fa-flag", label: t("admin.reports") },
    { id: "products", icon: "fa-store", label: t("admin.products") },
    { id: "review", icon: "fa-clipboard-check", label: t("admin.review") },
    { id: "categories", icon: "fa-tags", label: t("admin.categories") },
    { id: "plans", icon: "fa-crown", label: t("admin.plans") },
    { id: "revenue", icon: "fa-chart-line", label: t("admin.revenue") },
  ];

  let activeTab = "users";

  container.innerHTML = `
    <div class="section-header animate__animated animate__fadeInUp"><h2><i class="fas fa-shield-alt" aria-hidden="true"></i> ${t("admin.title")}</h2></div>
    <div class="row g-3 mb-4 animate-on-scroll">
      <div class="col-sm-4">
        <div class="card card-sm text-center p-3">
          <div class="text-muted"><i class="fas fa-users text-primary" aria-hidden="true"></i> ${t("admin.totalUsers")}</div>
          <div class="fs-2 fw-bold mt-2">1,245</div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="card card-sm text-center p-3">
          <div class="text-muted"><i class="fas fa-chart-line text-success" aria-hidden="true"></i> ${t("admin.totalRevenue")}</div>
          <div class="fs-2 fw-bold mt-2">$45,230</div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="card card-sm text-center p-3">
          <div class="text-muted"><i class="fas fa-gavel text-warning" aria-hidden="true"></i> ${t("admin.activeAuctions")}</div>
          <div class="fs-2 fw-bold mt-2">112</div>
        </div>
      </div>
    </div>
    <div class="tabs nav nav-tabs mb-4" id="adminTabs">${tabs.map((tab) => `<button class="tab ${tab.id === activeTab ? "active" : ""}" data-tab="${tab.id}"><i class="fas ${tab.icon}" aria-hidden="true"></i> ${tab.label}</button>`).join("")}</div>
    <div id="adminContent"></div>`;

  const content = document.getElementById("adminContent");

  document.getElementById("adminTabs").addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".tab");
    if (!tabBtn) return;
    activeTab = tabBtn.dataset.tab;
    document.querySelectorAll("#adminTabs .tab").forEach((tab) => tab.classList.remove("active"));
    tabBtn.classList.add("active");
    loadTab();
  });

  function loadTab() {
    if (activeTab === "users") {
      content.innerHTML = '';
      renderUsersWidget(content, {
        fetchUsers: fetchAdminUsers,
        onToggleUser: async (id) => { await toggleUserStatus(id); loadTab(); }
      });
    } else if (activeTab === "reports") {
      renderReportsWidget(content, {
        fetchData: fetchReports,
        onResolve: async (id) => { await resolveReport(id); loadTab(); }
      });
    } else if (activeTab === "products") {
      content.innerHTML = '';
      renderAdminProductsWidget(content, {
        fetchProducts: fetchAdminProducts,
        onUpdateProductStatus: async (id, status) => { await updateProductStatus(id, status); loadTab(); }
      });
    } else if (activeTab === "review") {
      content.innerHTML = '';
      renderReviewsWidget(content, {
        fetchData: fetchPendingReviews,
        onApprove: async (id) => { await approveProduct(id); loadTab(); },
        onReject: async (id, reason) => { await rejectProduct(id, reason); loadTab(); }
      });
    } else if (activeTab === "categories") {
      renderCategoriesWidget(content, {
        fetchData: fetchCategories,
        onAdd: async (name, desc) => { await createCategory(name, desc); loadTab(); },
        onDelete: async (id) => { await deleteCategory(id); loadTab(); }
      });
    } else if (activeTab === "plans") {
      content.innerHTML = '';
      renderPlansWidget(content, {
        fetchData: fetchSubscriptionPlans,
        onUpdate: async (id, body) => { await updateSubscriptionPlan(id, body); loadTab(); },
        onDelete: async (id) => { await deleteSubscriptionPlan(id); loadTab(); },
        onAdd: async (data) => { await createSubscriptionPlan(data); loadTab(); }
      });
    } else if (activeTab === "revenue") {
      (async () => {
        try {
          const [wallet, txns] = await Promise.all([fetchWallet(), fetchWalletTransactions(1, 100)]);
          const { feeTxns, totalFees } = computeFeeTotals(txns);
          renderRevenueWidget(content, { wallet, feeTxns, totalFees });
        } catch (err) {
          content.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
        }
      })();
    }
  }

  loadTab();
}
