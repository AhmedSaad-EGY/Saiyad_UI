import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { getUser } from '../core/auth/index.js';
import { ROLES } from '../shared/constants/roles.js';
import { showLoading, showError, renderEmptyState, escapeHtml } from '../core/utils/dom.js';
import { manualPaginationHtml, wirePagination } from '../shared/components/pagination.js';
import { formatPrice, formatDate, tStatus } from '../core/utils/format.js';
import { showConfirm, showToast } from '../core/utils/ui.js';
import { setPageMeta } from '../core/utils/seo.js';

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
    document
      .querySelectorAll("#adminTabs .tab")
      .forEach((tab) => tab.classList.remove("active"));
    tabBtn.classList.add("active");
    loadTab();
  });

  function loadTab() {
    if (activeTab === "users") {
      content.innerHTML = `<div id="usersPanel"></div>`;
      loadUsers();
    } else if (activeTab === "reports") {
      loadReports();
    } else if (activeTab === "products") {
      content.innerHTML = `<div id="productsPanel"></div>`;
      loadAdminProducts();
    } else if (activeTab === "review") {
      content.innerHTML = `<div id="reviewPanel"></div>`;
      loadPendingReviews();
    } else if (activeTab === "categories") {
      loadCategories();
    } else if (activeTab === "plans") {
      content.innerHTML = `<div id="plansPanel"></div>`;
      loadPlans();
    } else if (activeTab === "revenue") {
      loadRevenue();
    }
  }

  let _usersPage = 1;
  const _usersPageSize = 20;

  async function loadUsers() {
    const panel = document.getElementById("usersPanel");
    if (!panel) return;
    panel.innerHTML = `<div class="p-4 text-center">
      <i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>`;
    try {
      const data = await api.get("/users", { page: _usersPage, pageSize: _usersPageSize });
      const users = data.items || data.data || [];
      const total = data.totalCount || data.total || users.length;
      const pages = Math.ceil(total / _usersPageSize);

      if (!users.length) {
        renderEmptyState(panel, {
          icon: "fa-users",
          title: t("admin.noUsers"),
        });
        return;
      }

      panel.innerHTML = `
        <div class="table-wrapper">
          <table class="table">
            <caption class="text-muted mt-2 caption-meta">${t("admin.users")}</caption>
            <thead><tr>
              <th scope="col">${t("auth.fullName")}</th>
              <th scope="col">${t("auth.email")}</th>
              <th scope="col">${t("auth.role")}</th>
              <th scope="col">${t("product.status")}</th>
              <th scope="col"></th>
            </tr></thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>${escapeHtml(u.fullName || u.name || "-")}</td>
                  <td>${escapeHtml(u.email || "-")}</td>
                  <td><span class="category-tag">${escapeHtml(u.role || "-")}</span></td>
                  <td><span class="status ${u.isActive !== false ? "status-available" : "status-draft"}">
                    ${u.isActive !== false ? t("admin.active") : t("admin.suspended")}
                  </span></td>
                  <td>
                    <button class="btn btn-outline btn-sm toggle-user-btn"
                      data-user-id="${escapeHtml(String(u.id))}"
                      data-active="${u.isActive !== false}">
                      ${u.isActive !== false ? t("admin.suspend") : t("admin.activate")}
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ${manualPaginationHtml({ page: _usersPage, totalPages: pages, prefix: 'users' })}`;

      wirePagination({ container: panel, prefix: 'users', onPrev() { if (_usersPage > 1) { _usersPage--; loadUsers(); } }, onNext() { if (_usersPage < pages) { _usersPage++; loadUsers(); } } });

      panel.querySelectorAll(".toggle-user-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          try {
            await api.patch(`/users/${btn.dataset.userId}/toggle-status`);
            showToast(t("admin.userToggled"), "success");
            loadUsers();
          } catch (e) {
            showToast(e.message, "error");
            btn.disabled = false;
          }
        });
      });
    } catch (e) {
      panel.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
    }
  }

  async function loadReports() {
    showLoading(content);
    try {
      const data = await api.get("/reports");
      const reports = data.items || data.data || data || [];
      if (!reports.length) {
        renderEmptyState(content, {
          icon: "fa-flag",
          title: t("admin.noReports"),
        });
        return;
      }

      content.innerHTML = `
        <div class="table-wrapper"><table class="table">
          <caption class="text-muted mt-2 caption-meta">${t("admin.reports")}</caption>
          <thead><tr><th scope="col">${t("admin.id")}</th><th scope="col">${t("cart.product")}</th><th scope="col">${t("admin.reportReason")}</th><th scope="col">${t("admin.reportStatus")}</th><th scope="col"></th></tr></thead>
          <tbody>${reports
            .map(
              (r) => `
            <tr>
              <td>${r.id}</td>
              <td>#${r.productId}</td>
              <td>${escapeHtml(r.reason || "-")}</td>
              <td><span class="status ${r.status === "Resolved" ? "status-available" : "status-draft"}">${r.status || "Open"}</span></td>
              <td>${r.status !== "Resolved" ? `<button class="btn btn-sm btn-success resolve-report" data-id="${r.id}">${t("admin.resolve")}</button>` : "-"}</td>
            </tr>`,
            )
            .join("")}
          </tbody>
        </table></div>`;
      content.querySelectorAll(".resolve-report").forEach((btn) => {
        btn.addEventListener("click", async () => {
          try {
            await api.put(`/reports/${btn.dataset.id}/resolve`, {
              status: "Resolved",
            });
            showToast(t("admin.reportResolved"), "success");
            loadReports();
          } catch (err) {
            showToast(err.message, "error");
          }
        });
      });
    } catch (err) {
      showError(content, err.message);
    }
  }

  let _productsPage = 1;
  const _productsPageSize = 20;
  const productModerationStatuses = ["Available", "Draft", "Sold", "Rejected", "Suspended"];
  let _reviewsPage = 1;
  const _reviewsPageSize = 20;

  async function loadAdminProducts() {
    const panel = document.getElementById("productsPanel");
    if (!panel) return;
    panel.innerHTML = `<div class="p-4 text-center">
      <i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>`;
    try {
      const data = await api.get("/products", { page: _productsPage, pageSize: _productsPageSize });
      const products = data.items || data.data || [];
      const total = data.totalCount || data.total || products.length;
      const pages = Math.ceil(total / _productsPageSize);

      if (!products.length) {
        renderEmptyState(panel, {
          icon: "fa-box-open",
          title: t("products.noProducts"),
        });
        return;
      }

      panel.innerHTML = `
        <div class="table-wrapper">
          <table class="table">
            <caption class="text-muted mt-2 caption-meta">${t("admin.products")}</caption>
            <thead><tr>
              <th scope="col">${t("product.title")}</th>
              <th scope="col">${t("product.seller")}</th>
              <th scope="col">${t("product.category")}</th>
              <th scope="col">${t("cart.price")}</th>
              <th scope="col">${t("product.status")}</th>
              <th scope="col"></th>
            </tr></thead>
            <tbody>
              ${products.map((p) => `
                <tr>
                  <td>${escapeHtml(p.title || "-")}</td>
                  <td>${escapeHtml(p.sellerName || `#${p.sellerId || "-"}`)}</td>
                  <td>${escapeHtml(p.categoryName || "-")}</td>
                  <td class="fw-semibold">${formatPrice(p.price || 0)}</td>
                  <td>
                    <select class="form-select product-status-select" data-product-id="${p.id}" class="w-auto" style="min-width:130px">
                      ${productModerationStatuses.map((status) => `
                        <option value="${status}" ${p.status === status ? "selected" : ""}>${tStatus(status, "product")}</option>
                      `).join("")}
                    </select>
                  </td>
                  <td class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-primary btn-sm save-product-status" data-product-id="${p.id}">${t("common.save")}</button>
                    <a href="#/product-detail?id=${p.id}" class="btn btn-outline btn-sm">${t("common.view")}</a>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ${manualPaginationHtml({ page: _productsPage, totalPages: pages, prefix: 'admProducts' })}`;

      wirePagination({ container: panel, prefix: 'admProducts', onPrev() { if (_productsPage > 1) { _productsPage--; loadAdminProducts(); } }, onNext() { if (_productsPage < pages) { _productsPage++; loadAdminProducts(); } } });
      panel.querySelectorAll(".save-product-status").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const select = panel.querySelector(`.product-status-select[data-product-id="${btn.dataset.productId}"]`);
          if (!select) return;
          btn.disabled = true;
          const oldText = btn.textContent;
          btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i>`;
          try {
            await api.patch(`/products/${btn.dataset.productId}/status`, {
              status: select.value,
            });
            showToast(t("admin.productStatusUpdated"), "success");
            loadAdminProducts();
          } catch (err) {
            showToast(err.message, "error");
            btn.disabled = false;
            btn.textContent = oldText;
          }
        });
      });
    } catch (e) {
      panel.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
    }
  }

  async function loadPendingReviews() {
    const panel = document.getElementById("reviewPanel");
    if (!panel) return;
    panel.innerHTML = `<div class="p-4 text-center">
      <i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>`;
    try {
      const data = await api.get("/products/pending-review", { page: _reviewsPage, pageSize: _reviewsPageSize });
      const products = data.items || data.data || [];
      const total = data.totalCount || data.total || products.length;
      const pages = Math.ceil(total / _reviewsPageSize);

      if (!products.length) {
        renderEmptyState(panel, {
          icon: "fa-clipboard-check",
          title: t("admin.noPendingReviews"),
          desc: t("admin.productsAwaiting"),
        });
        return;
      }

      panel.innerHTML = `
        <div class="table-wrapper">
          <table class="table">
            <caption class="text-muted mt-2 caption-meta">${t("admin.review")}</caption>
            <thead><tr>
              <th scope="col" style="width:50px"></th>
              <th scope="col">${t("product.title")}</th>
              <th scope="col">${t("product.seller")}</th>
              <th scope="col">${t("cart.price")}</th>
              <th scope="col">${t("dash.date")}</th>
              <th scope="col"></th>
            </tr></thead>
            <tbody>
              ${products.map((p) => `
                <tr>
                  <td class="product-thumb-cell">${p.primaryImageUrl ? `<img src="${p.primaryImageUrl}" alt="" class="product-thumb" loading="lazy">` : `<div class="product-thumb-placeholder"><i class="fas fa-image" aria-hidden="true"></i></div>`}</td>
                  <td><a href="#/product-detail?id=${p.id}" class="text-decoration-none text-reset fw-medium">${escapeHtml(p.title)}</a></td>
                  <td>${escapeHtml(p.sellerName || `#${p.sellerId || "-"}`)}</td>
                  <td class="fw-semibold">${formatPrice(p.price || 0)}</td>
                  <td>${formatDate(p.createdAt)}</td>
                  <td>
                    <div class="d-flex gap-1 flex-nowrap" style="white-space:nowrap">
                      <button class="btn btn-sm btn-success approve-review-btn" data-product-id="${p.id}"><i class="fas fa-check" aria-hidden="true"></i> ${t("admin.approve")}</button>
                      <button class="btn btn-sm btn-danger reject-review-btn" data-product-id="${p.id}"><i class="fas fa-times" aria-hidden="true"></i> ${t("admin.reject")}</button>
                      <a href="#/product-detail?id=${p.id}" class="btn btn-outline btn-sm">${t("dash.view")}</a>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ${manualPaginationHtml({ page: _reviewsPage, totalPages: pages, prefix: 'review' })}`;

      wirePagination({ container: panel, prefix: 'review', onPrev() { if (_reviewsPage > 1) { _reviewsPage--; loadPendingReviews(); } }, onNext() { if (_reviewsPage < pages) { _reviewsPage++; loadPendingReviews(); } } });

      panel.querySelectorAll(".approve-review-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          const ok = await showConfirm(t("admin.confirmApprove"), t("admin.confirmApproveDesc"), { type: "success", confirmText: t("admin.approve") });
          if (!ok) { btn.disabled = false; return; }
          try {
            await api.patch(`/products/${btn.dataset.productId}/approve`);
            showToast(t("admin.productApproved"), "success");
            loadPendingReviews();
          } catch (err) {
            showToast(err.message, "error");
            btn.disabled = false;
          }
        });
      });

      panel.querySelectorAll(".reject-review-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          showFormModal(t("admin.reject"), `
            <div class="form-group">
              <label class="form-label">${t("admin.rejectionReason")}</label>
              <textarea class="form-textarea form-control" id="rejectionReasonInput" rows="3" required></textarea>
            </div>
          `, async function onReject() {
            const reasonText = document.getElementById("rejectionReasonInput")?.value?.trim();
            if (!reasonText) { showToast(`${t("admin.rejectionReason")} ${t("common.required")}`, "error"); return; }
            btn.disabled = true;
            try {
              await api.patch(`/products/${btn.dataset.productId}/reject`, { reason: reasonText });
              showToast(t("admin.productRejected"), "success");
              loadPendingReviews();
            } catch (err) {
              showToast(err.message, "error");
              btn.disabled = false;
            }
          }, { confirmText: t("admin.reject"), confirmClass: "btn-danger" });
        });
      });
    } catch (e) {
      panel.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
    }
  }

  async function loadCategories() {
    showLoading(content);
    try {
      const data = await api.get("/categories");
      const cats = data.items || data.data || data || [];

      if (!cats.length) {
        content.innerHTML = `
          <div class="mb-3"><button class="btn btn-primary btn-sm" id="showAddCat"><i class="fas fa-plus" aria-hidden="true"></i> ${t("admin.addCategory")}</button></div>
        <div id="addCatForm" class="d-none card card-sm mb-3 mw-xs">
          <form id="catForm" novalidate>
              <div class="form-group"><label class="form-label">${t("admin.categoryName")}</label><input type="text" class="form-input form-control" id="catName" required></div>
              <div class="form-group"><label class="form-label">${t("admin.categoryDesc")}</label><input type="text" class="form-input form-control" id="catDesc"></div>
              <button type="submit" class="btn btn-primary btn-sm">${t("admin.addCategory")}</button>
            </form>
          </div>
          <div class="empty-state mt-2">
            <div class="empty-state-visual"><i class="fas fa-tags text-muted" style="font-size:2rem" aria-hidden="true"></i></div>
            <h3>${t("admin.noCategories")}</h3>
            <p class="text-muted">${t("admin.createFirstCategory")}</p>
          </div>`;
        document.getElementById("showAddCat")?.addEventListener("click", () =>
          document.getElementById("addCatForm").classList.toggle("d-none")
        );
        document.getElementById("catForm")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          try {
            await api.post("/categories", {
              name: document.getElementById("catName").value.trim(),
              description: document.getElementById("catDesc").value.trim(),
            });
            showToast(t("admin.categoryAdded"), "success");
            loadCategories();
          } catch (err) {
            showToast(err.message, "error");
          }
        });
        return;
      }

      content.innerHTML = `
        <div class="mb-3"><button class="btn btn-primary btn-sm" id="showAddCat"><i class="fas fa-plus" aria-hidden="true"></i> ${t("admin.addCategory")}</button></div>
        <div id="addCatForm" class="d-none card card-sm mb-3 mw-xs">
          <form id="catForm" novalidate>
            <div class="form-group"><label class="form-label">${t("admin.categoryName")}</label><input type="text" class="form-input form-control" id="catName" required></div>
            <div class="form-group"><label class="form-label">${t("admin.categoryDesc")}</label><input type="text" class="form-input form-control" id="catDesc"></div>
            <button type="submit" class="btn btn-primary btn-sm">${t("admin.addCategory")}</button>
          </form>
        </div>
        <div class="table-wrapper"><table class="table">
          <caption class="text-muted mt-2 caption-meta">${t("admin.categories")}</caption>
          <thead><tr><th scope="col">${t("admin.id")}</th><th scope="col">${t("admin.name")}</th><th scope="col">${t("admin.categoryDesc")}</th><th scope="col"></th></tr></thead>
          <tbody>${cats
            .map(
              (c) => `
            <tr><td>${c.id}</td><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.description || "-")}</td>
            <td><button class="btn btn-sm btn-danger delete-cat" data-id="${c.id}" aria-label="${t("admin.categoryDeleted")}"><i class="fas fa-trash" aria-hidden="true"></i></button></td></tr>`,
            )
            .join("")}
          </tbody>
        </table></div>`;

      document
        .getElementById("showAddCat")
        ?.addEventListener("click", () =>
          document.getElementById("addCatForm").classList.toggle("d-none"),
        );
      document
        .getElementById("catForm")
        ?.addEventListener("submit", async (e) => {
          e.preventDefault();
          try {
            await api.post("/categories", {
              name: document.getElementById("catName").value.trim(),
              description: document.getElementById("catDesc").value.trim(),
            });
            showToast(t("admin.categoryAdded"), "success");
            loadCategories();
          } catch (err) {
            showToast(err.message, "error");
          }
        });
      content.querySelectorAll(".delete-cat").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const ok = await showConfirm(
            t("admin.confirmDeleteCategory"),
            t("admin.confirmDeleteCategoryDesc"),
            { type: "danger", confirmText: t("common.delete") }
          );
          if (!ok) return;
          try {
            await api.delete(`/categories/${btn.dataset.id}`);
            showToast(t("admin.categoryDeleted"), "success");
            loadCategories();
          } catch (err) {
            showToast(err.message, "error");
          }
        });
      });
    } catch (err) {
      showError(content, err.message);
    }
  }

  function showFormModal(title, html, onSave, options = {}) {
    const confirmText = options.confirmText || t("common.save");
    const confirmClass = options.confirmClass || "btn-primary";
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay show";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", escapeHtml(title));
    overlay.innerHTML = `
      <div class="modal mw-xl" onclick="event.stopPropagation()">
        <div class="modal-header"><h3>${escapeHtml(title)}</h3></div>
        <div class="modal-body p-3">${html}</div>
        <div class="modal-actions d-flex gap-2 justify-content-end p-3 pt-2 border-divider-top">
          <button class="btn btn-ghost" id="fmCancel">${t("common.cancel")}</button>
          <button class="btn ${confirmClass}" id="fmSave">${confirmText}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("#fmCancel").addEventListener("click", () => overlay.remove());
    overlay.querySelector("#fmSave").addEventListener("click", () => { onSave(); overlay.remove(); });
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
    setTimeout(() => overlay.querySelector("#fmSave")?.focus(), 100);
    return overlay;
  }

  async function loadRevenue() {
    showLoading(content);
    try {
      const [wallet, txns] = await Promise.all([
        api.get("/wallet"),
        api.get("/wallet/transactions", { page: 1, pageSize: 100 }),
      ]);

      const items = txns.items || txns.data || [];
      const feeTxns = items.filter(txn => txn.type === "PlatformFee" || txn.type === "SubscriptionPayment");
      const totalFees = feeTxns.reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

      content.innerHTML = `
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card card-sm text-center">
              <small class="text-muted">${t("admin.platformBalance")}</small>
              <div class="fs-4 fw-bold">${formatPrice(wallet.balance || 0)}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card card-sm text-center">
              <small class="text-muted">${t("wallet.held")}</small>
              <div class="fs-4 fw-bold">${formatPrice(wallet.heldBalance || 0)}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card card-sm text-center">
              <small class="text-muted">${t("wallet.available")}</small>
              <div class="fs-4 fw-bold">${formatPrice(wallet.availableBalance || 0)}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card card-sm text-center" class="border-start border-3 border-primary">
              <small class="text-muted">${t("admin.totalFees")}</small>
              <div class="fs-4 fw-bold text-primary">${formatPrice(totalFees)}</div>
            </div>
          </div>
        </div>
        <h3 class="mb-2">${t("admin.feeIncome")}</h3>
        <div class="table-wrapper">
          <table class="table">
            <caption class="text-muted mt-2 caption-meta">${t("admin.feeIncome")}</caption>
            <thead><tr>
              <th scope="col">${t("admin.id")}</th>
              <th scope="col">${t("wallet.type")}</th>
              <th scope="col">${t("wallet.amount")}</th>
              <th scope="col">Reference</th>
              <th scope="col">${t("wallet.description")}</th>
              <th scope="col">${t("dash.date")}</th>
            </tr></thead>
            <tbody>
              ${feeTxns.length ? feeTxns.map(txn => `
                <tr>
                  <td>${txn.id}</td>
                  <td><span class="status ${txn.type === "PlatformFee" ? "status-available" : "status-pending"}">${txn.type}</span></td>
                  <td class="fw-semibold">${formatPrice(txn.amount)}</td>
                  <td>${t.referenceType || "-"} #${t.referenceId || "-"}</td>
                  <td>${escapeHtml(t.description || "-")}</td>
                  <td>${formatDate(t.createdAt)}</td>
                </tr>
              `              ).join("") : `<tr><td colspan="6" class="text-center p-4 text-muted">
                <div class="empty-state-inline">
                  <i class="fas fa-chart-line mb-2 opacity-50" style="font-size:2rem" aria-hidden="true"></i>
                  <p class="mb-0">${t("admin.noFees")}</p>
                </div>
              </td></tr>`}
            </tbody>
          </table>
        </div>`;
    } catch (err) {
      showError(content, err.message);
    }
  }

  async function loadPlans() {
    const panel = document.getElementById("plansPanel");
    if (!panel) return;
    panel.innerHTML = `<div class="p-4 text-center"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>`;

    try {
      const plans = await api.get("/subscriptionplans");

      if (!plans || !plans.length) {
        renderEmptyState(panel, {
          icon: "fa-crown",
          title: t("subscriptions.noPlans"),
        });
        return;
      }

      panel.innerHTML = `
        <div class="mb-3">
          <button class="btn btn-primary" id="addPlanBtn"><i class="fas fa-plus" aria-hidden="true"></i> ${t("admin.addPlan")}</button>
        </div>
        <div class="table-wrapper"><table class="table">
          <caption class="text-muted mt-2 caption-meta">${t("admin.plans")}</caption>
          <thead><tr>
            <th scope="col">${t("common.name")}</th><th scope="col">${t("common.tier")}</th><th scope="col">Price</th>
            <th scope="col">Auctions</th><th scope="col">Bids</th><th scope="col">Requests</th>
            <th scope="col">${t("common.status")}</th><th scope="col">${t("common.actions")}</th>
          </tr></thead>
          <tbody>${(plans || []).map(p => `
            <tr>
              <td>${escapeHtml(p.name)}</td>
              <td>${p.tier}</td>
              <td>${formatPrice(p.price)}</td>
              <td>${p.maxAuctionsPerMonth}</td>
              <td>${p.maxBidsPerMonth}</td>
              <td>${p.maxAuctionRequestsPerMonth}</td>
              <td>${p.isActive ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'}</td>
              <td>
                <button class="btn btn-sm btn-outline edit-plan-btn" aria-label="${t('common.edit')}" data-id="${p.id}" data-plan='${encodeURIComponent(JSON.stringify(p))}'><i class="fas fa-edit" aria-hidden="true"></i></button>
                <button class="btn btn-sm btn-danger delete-plan-btn" aria-label="${t('common.delete')}" data-id="${p.id}" data-name="${escapeHtml(p.name)}"><i class="fas fa-trash" aria-hidden="true"></i></button>
              </td>
            </tr>`).join("")}
          </tbody>
        </table></div>`;

      panel.querySelectorAll(".edit-plan-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const p = JSON.parse(decodeURIComponent(btn.dataset.plan));
          const fields = [
            { key: "name", label: "Name", value: p.name, type: "text" },
            { key: "description", label: "Description", value: p.description || "", type: "text" },
            { key: "price", label: "Price (EGP)", value: String(p.price), type: "number" },
            { key: "maxAuctionsPerMonth", label: "Max Auctions/Month", value: String(p.maxAuctionsPerMonth), type: "number" },
            { key: "maxBidsPerMonth", label: "Max Bids/Month", value: String(p.maxBidsPerMonth), type: "number" },
            { key: "maxAuctionRequestsPerMonth", label: "Max Requests/Month", value: String(p.maxAuctionRequestsPerMonth), type: "number" },
            { key: "sortOrder", label: "Sort Order", value: String(p.sortOrder), type: "number" },
            { key: "isActive", label: "Active", value: String(p.isActive), type: "checkbox" },
          ];
          const formHtml = fields.map(f =>
            f.type === "checkbox"
              ? `<label class="d-flex align-items-center gap-2 mb-2"><input type="checkbox" id="ef-${  f.key  }" ${  f.value === "true" ? "checked" : ""  }> ${  f.label  }</label>`
              : `<div class="mb-2"><label class="d-block small mb-0">${  f.label  }</label><input type="${  f.type  }" id="ef-${  f.key  }" class="form-control" value="${  escapeHtml(f.value)  }"></div>`
          ).join("");

          showFormModal("Edit Plan", formHtml, async function() {
            const body = {};
            fields.forEach(function(f) {
              if (f.key === "isActive") body[f.key] = document.getElementById(`ef-${  f.key}`).checked;
              else if (f.type === "number") body[f.key] = parseFloat(document.getElementById(`ef-${  f.key}`).value) || 0;
              else body[f.key] = document.getElementById(`ef-${  f.key}`).value;
            });
            try {
              await api.put(`/subscriptionplans/${  p.id}`, body);
              showToast(t("admin.planUpdated"), "success");
              loadPlans();
            } catch (err) { showToast(err.message, "error"); }
          });
        });
      });

      panel.querySelectorAll(".delete-plan-btn").forEach(btn => {
        btn.addEventListener("click", async function() {
          const ok = await showConfirm(t("admin.confirmDeletePlan"), `${t('common.delete')} "${  btn.dataset.name  }"? ${t('admin.confirmDeletePlanDesc')}`, { type: "danger", confirmText: t("common.delete") });
          if (!ok) return;
          try {
            await api.delete(`/subscriptionplans/${  btn.dataset.id}`);
            showToast(t("admin.planDeleted"), "success");
            loadPlans();
          } catch (err) { showToast(err.message, "error"); }
        });
      });

      document.getElementById("addPlanBtn")?.addEventListener("click", function() {
        const tierOptions = ["Free", "Basic", "Pro", "Enterprise"].map(function(tier) { return `<option value="${  tier  }">${  tier  }</option>`; }).join("");
        const formHtml =
          `<div class="mb-2"><label>Tier</label><select id="af-tier" class="form-control">${  tierOptions  }</select></div>` +
          `<div class="mb-2"><label>Name</label><input id="af-name" class="form-control"></div>` +
          `<div class="mb-2"><label>Description</label><input id="af-desc" class="form-control"></div>` +
          `<div class="mb-2"><label>Price (EGP)</label><input id="af-price" class="form-control" type="number" value="0"></div>` +
          `<div class="mb-2"><label>Max Auctions/Month</label><input id="af-auctions" class="form-control" type="number" value="3"></div>` +
          `<div class="mb-2"><label>Max Bids/Month</label><input id="af-bids" class="form-control" type="number" value="3"></div>` +
          `<div class="mb-2"><label>Max Requests/Month</label><input id="af-requests" class="form-control" type="number" value="3"></div>` +
          `<div class="mb-2"><label>Sort Order</label><input id="af-sort" class="form-control" type="number" value="1"></div>`;

        showFormModal("Add Subscription Plan", formHtml, async function() {
          try {
            await api.post("/subscriptionplans", {
              tier: document.getElementById("af-tier").value,
              name: document.getElementById("af-name").value,
              description: document.getElementById("af-desc").value,
              price: parseFloat(document.getElementById("af-price").value) || 0,
              currency: "EGP",
              billingCycle: "Monthly",
              maxAuctionsPerMonth: parseInt(document.getElementById("af-auctions").value) || 3,
              maxBidsPerMonth: parseInt(document.getElementById("af-bids").value) || 3,
              maxAuctionRequestsPerMonth: parseInt(document.getElementById("af-requests").value) || 3,
              features: [],
              sortOrder: parseInt(document.getElementById("af-sort").value) || 1,
            });
            showToast(t("admin.planCreated"), "success");
            loadPlans();
          } catch (err) { showToast(err.message, "error"); }
        });
      });
    } catch (err) {
      showError(panel, err.message);
    }
  }

  loadTab();
}
