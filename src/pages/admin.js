import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { getUser, hasAnyRole } from '../core/auth/index.js';
import { ROLES } from '../shared/constants/roles.js';
import { showLoading, showError, renderEmptyState, escapeHtml } from '../core/utils/dom.js';
import { manualPaginationHtml, wirePagination } from '../shared/components/pagination.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../core/utils/format.js';
import { showConfirm, showToast } from '../core/utils/ui.js';

export default async function renderAdmin(container) {
  const user = getUser();
  if (!user || !hasAnyRole(ROLES.ADMIN)) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-shield-alt"></i><h3>${t("admin.noAccess")}</h3></div>`;
    return;
  }

  const tabs = [
    { id: "users", icon: "fa-users", label: t("admin.users") },
    { id: "reports", icon: "fa-flag", label: t("admin.reports") },
    { id: "products", icon: "fa-store", label: t("admin.products") },
    { id: "orders", icon: "fa-box", label: t("admin.orders") },
    { id: "categories", icon: "fa-tags", label: t("admin.categories") },
    { id: "plans", icon: "fa-crown", label: t("admin.plans") },
    { id: "revenue", icon: "fa-chart-line", label: t("admin.revenue") },
  ];

  let activeTab = "users";

  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-shield-alt"></i> ${t("admin.title")}</h2></div>
    <div class="tabs nav nav-tabs" id="adminTabs">${tabs.map((t) => `<button class="tab ${t.id === activeTab ? "active" : ""}" data-tab="${t.id}"><i class="fas ${t.icon}"></i> ${t.label}</button>`).join("")}</div>
    <div id="adminContent"></div>`;

  const content = document.getElementById("adminContent");

  document.getElementById("adminTabs").addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".tab");
    if (!tabBtn) return;
    activeTab = tabBtn.dataset.tab;
    document
      .querySelectorAll("#adminTabs .tab")
      .forEach((t) => t.classList.remove("active"));
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
    } else if (activeTab === "orders") {
      content.innerHTML = `<div id="ordersPanel"></div>`;
      loadAdminOrders();
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
      <i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;
    try {
      const data = await api.get("/users", { page: _usersPage, pageSize: _usersPageSize });
      const users = data.items || data.data || [];
      const total = data.totalCount || data.total || users.length;
      const pages = Math.ceil(total / _usersPageSize);

      if (!users.length) {
        renderEmptyState(panel, {
          icon: "fa-users",
          title: t("admin.noUsers") || "No users found",
        });
        return;
      }

      panel.innerHTML = `
        <div class="table-wrapper">
          <table class="table">
            <caption class="text-muted mt-2" style="caption-side:bottom;font-size:0.78rem">${t("admin.users")}</caption>
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
          title: t("admin.noReports") || "No reports found",
        });
        return;
      }

      content.innerHTML = `
        <div class="table-wrapper"><table class="table">
          <caption class="text-muted mt-2" style="caption-side:bottom;font-size:0.78rem">${t("admin.reports")}</caption>
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

  async function loadAdminProducts() {
    const panel = document.getElementById("productsPanel");
    if (!panel) return;
    panel.innerHTML = `<div class="p-4 text-center">
      <i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;
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
            <caption class="text-muted mt-2" style="caption-side:bottom;font-size:0.78rem">${t("admin.products")}</caption>
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
          btn.innerHTML = `<i class="fas fa-spinner spinner"></i>`;
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

  let _ordersPage = 1;
  const _ordersPageSize = 20;

  async function loadAdminOrders() {
    const panel = document.getElementById("ordersPanel");
    if (!panel) return;
    panel.innerHTML = `<div class="p-4 text-center">
      <i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;
    try {
      const data = await api.get("/orders", { page: _ordersPage, pageSize: _ordersPageSize });
      const orders = data.items || data.data || [];
      const total = data.totalCount || data.total || orders.length;
      const pages = Math.ceil(total / _ordersPageSize);

      if (!orders.length) {
        renderEmptyState(panel, {
          icon: "fa-box",
          title: t("dash.noOrders") || "No orders found",
        });
        return;
      }

      panel.innerHTML = `
        <div class="table-wrapper">
          <table class="table">
            <caption class="text-muted mt-2" style="caption-side:bottom;font-size:0.78rem">${t("admin.orders")}</caption>
            <thead><tr>
              <th scope="col">#</th>
              <th scope="col">${t("order.buyer")}</th>
              <th scope="col">${t("cart.total")}</th>
              <th scope="col">${t("product.status")}</th>
              <th scope="col">${t("dash.date")}</th>
              <th scope="col"></th>
            </tr></thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td>#${escapeHtml(String(o.id))}</td>
                  <td>${escapeHtml(o.buyerName || "-")}</td>
                  <td class="fw-semibold">${formatPrice(o.totalPrice)}</td>
                  <td><span class="status ${statusClass(o.status)}">${tStatus(o.status)}</span></td>
                  <td>${formatDate(o.createdAt || o.orderDate)}</td>
                  <td><a href="#/order-detail?id=${o.id}" class="btn btn-outline btn-sm">
                    ${t("dash.view")}
                  </a></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ${manualPaginationHtml({ page: _ordersPage, totalPages: pages, prefix: 'admOrders' })}`;

      wirePagination({ container: panel, prefix: 'admOrders', onPrev() { if (_ordersPage > 1) { _ordersPage--; loadAdminOrders(); } }, onNext() { if (_ordersPage < pages) { _ordersPage++; loadAdminOrders(); } } });
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
          <div class="mb-3"><button class="btn btn-primary btn-sm" id="showAddCat"><i class="fas fa-plus"></i> ${t("admin.addCategory")}</button></div>
        <div id="addCatForm" class="d-none card card-sm mb-3" style="max-width:400px">
          <form id="catForm" novalidate>
              <div class="form-group"><label class="form-label">${t("admin.categoryName")}</label><input type="text" class="form-input form-control" id="catName" required></div>
              <div class="form-group"><label class="form-label">${t("admin.categoryDesc")}</label><input type="text" class="form-input form-control" id="catDesc"></div>
              <button type="submit" class="btn btn-primary btn-sm">${t("admin.addCategory")}</button>
            </form>
          </div>
          <div class="empty-state mt-2">
            <div class="empty-state-visual"><i class="fas fa-tags text-muted" style="font-size:2rem"></i></div>
            <h3>${t("admin.noCategories") || "No categories found"}</h3>
            <p class="text-muted">${t("admin.createFirstCategory") || "Create your first category to organize products."}</p>
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
        <div class="mb-3"><button class="btn btn-primary btn-sm" id="showAddCat"><i class="fas fa-plus"></i> ${t("admin.addCategory")}</button></div>
        <div id="addCatForm" class="d-none card card-sm mb-3" style="max-width:400px">
          <form id="catForm" novalidate>
            <div class="form-group"><label class="form-label">${t("admin.categoryName")}</label><input type="text" class="form-input form-control" id="catName" required></div>
            <div class="form-group"><label class="form-label">${t("admin.categoryDesc")}</label><input type="text" class="form-input form-control" id="catDesc"></div>
            <button type="submit" class="btn btn-primary btn-sm">${t("admin.addCategory")}</button>
          </form>
        </div>
        <div class="table-wrapper"><table class="table">
          <caption class="text-muted mt-2" style="caption-side:bottom;font-size:0.78rem">${t("admin.categories")}</caption>
          <thead><tr><th scope="col">${t("admin.id")}</th><th scope="col">${t("admin.name")}</th><th scope="col">${t("admin.categoryDesc")}</th><th scope="col"></th></tr></thead>
          <tbody>${cats
            .map(
              (c) => `
            <tr><td>${c.id}</td><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.description || "-")}</td>
            <td><button class="btn btn-sm btn-danger delete-cat" data-id="${c.id}" aria-label="${t("admin.categoryDeleted")}"><i class="fas fa-trash"></i></button></td></tr>`,
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
            t("admin.confirmDeleteCategoryDesc") || "This action cannot be undone.",
            { type: "danger", confirmText: t("common.delete") || "Delete" }
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

  function showFormModal(title, html, onSave) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay show";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", escapeHtml(title));
    overlay.innerHTML = `
      <div class="modal" onclick="event.stopPropagation()" style="max-width:500px">
        <div class="modal-header"><h3>${escapeHtml(title)}</h3></div>
        <div class="modal-body p-3">${html}</div>
        <div class="modal-actions d-flex gap-2 justify-content-end p-3 pt-2" style="border-top:1px solid var(--border)">
          <button class="btn btn-ghost" id="fmCancel">${t("common.cancel") || "Cancel"}</button>
          <button class="btn btn-primary" id="fmSave">${t("common.save") || "Save"}</button>
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
      const feeTxns = items.filter(t => t.type === "PlatformFee" || t.type === "SubscriptionPayment");
      const totalFees = feeTxns.reduce((sum, t) => sum + Math.abs(t.amount), 0);

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
            <caption class="text-muted mt-2" style="caption-side:bottom;font-size:0.78rem">${t("admin.feeIncome")}</caption>
            <thead><tr>
              <th scope="col">${t("admin.id")}</th>
              <th scope="col">${t("wallet.type")}</th>
              <th scope="col">${t("wallet.amount")}</th>
              <th scope="col">Reference</th>
              <th scope="col">${t("wallet.description")}</th>
              <th scope="col">${t("dash.date")}</th>
            </tr></thead>
            <tbody>
              ${feeTxns.length ? feeTxns.map(t => `
                <tr>
                  <td>${t.id}</td>
                  <td><span class="status ${t.type === "PlatformFee" ? "status-available" : "status-pending"}">${t.type}</span></td>
                  <td class="fw-semibold">${formatPrice(t.amount)}</td>
                  <td>${t.referenceType || "-"} #${t.referenceId || "-"}</td>
                  <td>${escapeHtml(t.description || "-")}</td>
                  <td>${formatDate(t.createdAt)}</td>
                </tr>
              `              ).join("") : `<tr><td colspan="6" class="text-center p-4 text-muted">
                <div class="empty-state-inline">
                  <i class="fas fa-chart-line mb-2 opacity-50" style="font-size:2rem"></i>
                  <p class="mb-0">${t("admin.noFees") || "No fee transactions yet"}</p>
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
    panel.innerHTML = `<div class="p-4 text-center"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;

    try {
      const plans = await api.get("/subscriptionplans");

      if (!plans || !plans.length) {
        renderEmptyState(panel, {
          icon: "fa-crown",
          title: t("subscriptions.noPlans") || "No plans found",
        });
        return;
      }

      panel.innerHTML = `
        <div class="mb-3">
          <button class="btn btn-primary" id="addPlanBtn"><i class="fas fa-plus"></i> ${t("admin.addPlan") || "Add Plan"}</button>
        </div>
        <div class="table-responsive"><table class="table">
          <caption class="text-muted mt-2" style="caption-side:bottom;font-size:0.78rem">${t("admin.plans")}</caption>
          <thead><tr>
            <th scope="col">${t("common.name") || "Name"}</th><th scope="col">${t("common.tier") || "Tier"}</th><th scope="col">Price</th>
            <th scope="col">Auctions</th><th scope="col">Bids</th><th scope="col">Requests</th>
            <th scope="col">${t("common.status") || "Status"}</th><th scope="col">${t("common.actions") || "Actions"}</th>
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
                <button class="btn btn-sm btn-outline edit-plan-btn" data-id="${p.id}" data-plan='${escapeHtml(JSON.stringify(p))}'><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-plan-btn" data-id="${p.id}" data-name="${escapeHtml(p.name)}"><i class="fas fa-trash"></i></button>
              </td>
            </tr>`).join("")}
          </tbody>
        </table></div>`;

      panel.querySelectorAll(".edit-plan-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const p = JSON.parse(btn.dataset.plan);
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
              showToast("Plan updated", "success");
              loadPlans();
            } catch (err) { showToast(err.message, "error"); }
          });
        });
      });

      panel.querySelectorAll(".delete-plan-btn").forEach(btn => {
        btn.addEventListener("click", async function() {
          const ok = await showConfirm("Delete plan?", `Delete "${  btn.dataset.name  }"? This cannot be undone.`, { type: "danger", confirmText: "Delete" });
          if (!ok) return;
          try {
            await api.delete(`/subscriptionplans/${  btn.dataset.id}`);
            showToast("Plan deleted", "success");
            loadPlans();
          } catch (err) { showToast(err.message, "error"); }
        });
      });

      document.getElementById("addPlanBtn")?.addEventListener("click", function() {
        const tierOptions = ["Free", "Basic", "Pro", "Enterprise"].map(function(t) { return `<option value="${  t  }">${  t  }</option>`; }).join("");
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
            showToast("Plan created", "success");
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
