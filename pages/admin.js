async function renderAdmin(container) {
  const user = getUser();
  if (!user || !hasAnyRole("Admin")) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-shield-alt"></i><h3>${t("admin.noAccess")}</h3></div>`;
    return;
  }

  const tabs = [
    { id: "users", icon: "fa-users", label: t("admin.users") },
    { id: "reports", icon: "fa-flag", label: t("admin.reports") },
    { id: "orders", icon: "fa-box", label: t("admin.orders") },
    { id: "categories", icon: "fa-tags", label: t("admin.categories") },
  ];

  let activeTab = "users";

  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-shield-alt"></i> ${t("admin.title")}</h2></div>
    <div class="tabs" id="adminTabs">${tabs.map((t) => `<button class="tab ${t.id === activeTab ? "active" : ""}" data-tab="${t.id}"><i class="fas ${t.icon}"></i> ${t.label}</button>`).join("")}</div>
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
    } else if (activeTab === "orders") {
      content.innerHTML = `<div id="ordersPanel"></div>`;
      loadAdminOrders();
    } else if (activeTab === "categories") {
      loadCategories();
    }
  }

  let _usersPage = 1;
  const _usersPageSize = 20;

  async function loadUsers() {
    const panel = document.getElementById("usersPanel");
    if (!panel) return;
    panel.innerHTML = `<div style="padding:24px;text-align:center">
      <i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;
    try {
      const data = await api.get("/users", { page: _usersPage, pageSize: _usersPageSize });
      const users = data.items || data.data || [];
      const total = data.totalCount || data.total || users.length;
      const pages = Math.ceil(total / _usersPageSize);

      panel.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>${t("auth.fullName")}</th>
              <th>${t("auth.email")}</th>
              <th>${t("auth.role")}</th>
              <th>${t("product.status")}</th>
              <th></th>
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
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:16px">
          <button class="btn btn-sm btn-ghost" id="usersPrevBtn"
            ${_usersPage <= 1 ? "disabled" : ""}>
            <i class="fas fa-chevron-left"></i>
          </button>
          <span style="font-size:0.88rem;color:var(--text-muted)">
            ${t("common.page") || "Page"} ${_usersPage} / ${pages || 1}
          </span>
          <button class="btn btn-sm btn-ghost" id="usersNextBtn"
            ${_usersPage >= pages ? "disabled" : ""}>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>`;

      panel.querySelector("#usersPrevBtn")?.addEventListener("click", () => {
        if (_usersPage > 1) { _usersPage--; loadUsers(); }
      });
      panel.querySelector("#usersNextBtn")?.addEventListener("click", () => {
        if (_usersPage < pages) { _usersPage++; loadUsers(); }
      });

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
      content.innerHTML = `
        <div class="table-wrapper"><table>
          <thead><tr><th>${t("admin.id")}</th><th>${t("cart.product")}</th><th>${t("admin.reportReason")}</th><th>${t("admin.reportStatus")}</th><th></th></tr></thead>
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

  let _ordersPage = 1;
  const _ordersPageSize = 20;

  async function loadAdminOrders() {
    const panel = document.getElementById("ordersPanel");
    if (!panel) return;
    panel.innerHTML = `<div style="padding:24px;text-align:center">
      <i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;
    try {
      const data = await api.get("/orders", { page: _ordersPage, pageSize: _ordersPageSize });
      const orders = data.items || data.data || [];
      const total = data.totalCount || data.total || orders.length;
      const pages = Math.ceil(total / _ordersPageSize);

      panel.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>#</th>
              <th>${t("order.buyer")}</th>
              <th>${t("cart.total")}</th>
              <th>${t("product.status")}</th>
              <th>${t("dash.date")}</th>
              <th></th>
            </tr></thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td>#${escapeHtml(String(o.id))}</td>
                  <td>${escapeHtml(o.buyerName || "-")}</td>
                  <td style="font-weight:600">${formatPrice(o.totalPrice)}</td>
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
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:16px">
          <button class="btn btn-sm btn-ghost" id="adminOrdersPrevBtn"
            ${_ordersPage <= 1 ? "disabled" : ""}>
            <i class="fas fa-chevron-left"></i>
          </button>
          <span style="font-size:0.88rem;color:var(--text-muted)">
            ${t("common.page") || "Page"} ${_ordersPage} / ${pages || 1}
          </span>
          <button class="btn btn-sm btn-ghost" id="adminOrdersNextBtn"
            ${_ordersPage >= pages ? "disabled" : ""}>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>`;

      panel.querySelector("#adminOrdersPrevBtn")?.addEventListener("click", () => {
        if (_ordersPage > 1) { _ordersPage--; loadAdminOrders(); }
      });
      panel.querySelector("#adminOrdersNextBtn")?.addEventListener("click", () => {
        if (_ordersPage < pages) { _ordersPage++; loadAdminOrders(); }
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
      content.innerHTML = `
        <div style="margin-bottom:16px"><button class="btn btn-primary btn-sm" id="showAddCat"><i class="fas fa-plus"></i> ${t("admin.addCategory")}</button></div>
        <div id="addCatForm" class="hidden card card-sm" style="max-width:400px;margin-bottom:16px">
          <form id="catForm" novalidate>
            <div class="form-group"><label class="form-label">${t("admin.categoryName")}</label><input type="text" class="form-input" id="catName" required></div>
            <div class="form-group"><label class="form-label">${t("admin.categoryDesc")}</label><input type="text" class="form-input" id="catDesc"></div>
            <button type="submit" class="btn btn-primary btn-sm">${t("admin.addCategory")}</button>
          </form>
        </div>
        <div class="table-wrapper"><table>
          <thead><tr><th>${t("admin.id")}</th><th>${t("admin.name")}</th><th>${t("admin.categoryDesc")}</th><th></th></tr></thead>
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
          document.getElementById("addCatForm").classList.toggle("hidden"),
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

  loadTab();
}
