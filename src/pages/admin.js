import { t } from '../app/i18n.js';
import { getUser } from '../features/auth/login.js';
import { ROLES } from '../shared/constants/roles.js';
import { setPageMeta } from '../shared/utils/seo.js';
import {
  renderUsers, renderReports, renderAdminProducts,
  renderReviews, renderCategories, renderRevenue, renderPlans
} from '../widgets/admin/index.js';

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
    if (activeTab === "users") { content.innerHTML = ''; renderUsers(content); }
    else if (activeTab === "reports") renderReports(content);
    else if (activeTab === "products") { content.innerHTML = ''; renderAdminProducts(content); }
    else if (activeTab === "review") { content.innerHTML = ''; renderReviews(content); }
    else if (activeTab === "categories") renderCategories(content);
    else if (activeTab === "plans") { content.innerHTML = ''; renderPlans(content); }
    else if (activeTab === "revenue") renderRevenue(content);
  }

  loadTab();
}
