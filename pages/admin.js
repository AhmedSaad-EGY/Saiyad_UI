async function renderAdmin(container) {
  const user = getUser();
  if (!user || !hasAnyRole("Admin")) {
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

  let _productsPage = 1;
  const _productsPageSize = 20;
  const productModerationStatuses = ["Available", "Draft", "Sold", "Rejected", "Suspended"];

  async function loadAdminProducts() {
    const panel = document.getElementById("productsPanel");
    if (!panel) return;
    panel.innerHTML = `<div style="padding:24px;text-align:center">
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
          <table>
            <thead><tr>
              <th>${t("product.title")}</th>
              <th>${t("product.seller")}</th>
              <th>${t("product.category")}</th>
              <th>${t("cart.price")}</th>
              <th>${t("product.status")}</th>
              <th></th>
            </tr></thead>
            <tbody>
              ${products.map((p) => `
                <tr>
                  <td>${escapeHtml(p.title || "-")}</td>
                  <td>${escapeHtml(p.sellerName || `#${p.sellerId || "-"}`)}</td>
                  <td>${escapeHtml(p.categoryName || "-")}</td>
                  <td style="font-weight:600">${formatPrice(p.price || 0)}</td>
                  <td>
                    <select class="form-select product-status-select" data-product-id="${p.id}" style="min-width:130px">
                      ${productModerationStatuses.map((status) => `
                        <option value="${status}" ${p.status === status ? "selected" : ""}>${tStatus(status, "product")}</option>
                      `).join("")}
                    </select>
                  </td>
                  <td style="display:flex;gap:6px;flex-wrap:wrap">
                    <button class="btn btn-primary btn-sm save-product-status" data-product-id="${p.id}">${t("common.save")}</button>
                    <a href="#/product-detail?id=${p.id}" class="btn btn-outline btn-sm">${t("common.view")}</a>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:16px">
          <button class="btn btn-sm btn-ghost" id="productsPrevBtn" ${_productsPage <= 1 ? "disabled" : ""}>
            <i class="fas fa-chevron-left"></i>
          </button>
          <span style="font-size:0.88rem;color:var(--text-muted)">
            ${t("common.page")} ${_productsPage} / ${pages || 1}
          </span>
          <button class="btn btn-sm btn-ghost" id="productsNextBtn" ${_productsPage >= pages ? "disabled" : ""}>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>`;

      panel.querySelector("#productsPrevBtn")?.addEventListener("click", () => {
        if (_productsPage > 1) { _productsPage--; loadAdminProducts(); }
      });
      panel.querySelector("#productsNextBtn")?.addEventListener("click", () => {
        if (_productsPage < pages) { _productsPage++; loadAdminProducts(); }
      });
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

  function showFormModal(title, html, onSave) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay show";
    overlay.innerHTML = `
      <div class="modal" onclick="event.stopPropagation()" style="max-width:500px">
        <div class="modal-header"><h3>${escapeHtml(title)}</h3></div>
        <div class="modal-body" style="padding:16px">${html}</div>
        <div class="modal-actions" style="padding:12px 16px;display:flex;gap:8px;justify-content:flex-end;border-top:1px solid var(--border)">
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
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
          <div class="card card-sm" style="padding:16px;text-align:center">
            <small style="color:var(--text-muted)">${t("admin.platformBalance")}</small>
            <div style="font-size:1.5rem;font-weight:700">${formatPrice(wallet.balance || 0)}</div>
          </div>
          <div class="card card-sm" style="padding:16px;text-align:center">
            <small style="color:var(--text-muted)">${t("wallet.held")}</small>
            <div style="font-size:1.5rem;font-weight:700">${formatPrice(wallet.heldBalance || 0)}</div>
          </div>
          <div class="card card-sm" style="padding:16px;text-align:center">
            <small style="color:var(--text-muted)">${t("wallet.available")}</small>
            <div style="font-size:1.5rem;font-weight:700">${formatPrice(wallet.availableBalance || 0)}</div>
          </div>
          <div class="card card-sm" style="padding:16px;text-align:center;border-left:3px solid var(--primary)">
            <small style="color:var(--text-muted)">${t("admin.totalFees")}</small>
            <div style="font-size:1.5rem;font-weight:700;color:var(--primary)">${formatPrice(totalFees)}</div>
          </div>
        </div>
        <h3 style="margin-bottom:12px">${t("admin.feeIncome")}</h3>
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>${t("admin.id")}</th>
              <th>${t("wallet.type")}</th>
              <th>${t("wallet.amount")}</th>
              <th>Reference</th>
              <th>${t("wallet.description")}</th>
              <th>${t("dash.date")}</th>
            </tr></thead>
            <tbody>
              ${feeTxns.length ? feeTxns.map(t => `
                <tr>
                  <td>${t.id}</td>
                  <td><span class="status ${t.type === "PlatformFee" ? "status-available" : "status-pending"}">${t.type}</span></td>
                  <td style="font-weight:600">${formatPrice(t.amount)}</td>
                  <td>${t.referenceType || "-"} #${t.referenceId || "-"}</td>
                  <td>${escapeHtml(t.description || "-")}</td>
                  <td>${formatDate(t.createdAt)}</td>
                </tr>
              `              ).join("") : `<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">No fee transactions yet</td></tr>`}
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
    panel.innerHTML = `<div style="padding:24px;text-align:center"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;

    try {
      const plans = await api.get("/subscriptionplans");

      panel.innerHTML = `
        <div style="margin-bottom:16px">
          <button class="btn btn-primary" id="addPlanBtn"><i class="fas fa-plus"></i> ${t("admin.addPlan") || "Add Plan"}</button>
        </div>
        <div class="table-responsive"><table>
          <thead><tr>
            <th>${t("common.name") || "Name"}</th><th>${t("common.tier") || "Tier"}</th><th>Price</th>
            <th>Auctions</th><th>Bids</th><th>Requests</th>
            <th>${t("common.status") || "Status"}</th><th>${t("common.actions") || "Actions"}</th>
          </tr></thead>
          <tbody>${(plans || []).map(p => `
            <tr>
              <td>${escapeHtml(p.name)}</td>
              <td>${p.tier}</td>
              <td>$${Number(p.price).toFixed(2)}</td>
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
            { key: "price", label: "Price (USD)", value: String(p.price), type: "number" },
            { key: "maxAuctionsPerMonth", label: "Max Auctions/Month", value: String(p.maxAuctionsPerMonth), type: "number" },
            { key: "maxBidsPerMonth", label: "Max Bids/Month", value: String(p.maxBidsPerMonth), type: "number" },
            { key: "maxAuctionRequestsPerMonth", label: "Max Requests/Month", value: String(p.maxAuctionRequestsPerMonth), type: "number" },
            { key: "sortOrder", label: "Sort Order", value: String(p.sortOrder), type: "number" },
            { key: "isActive", label: "Active", value: String(p.isActive), type: "checkbox" },
          ];
          var formHtml = fields.map(f =>
            f.type === "checkbox"
              ? '<label style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><input type="checkbox" id="ef-' + f.key + '" ' + (f.value === "true" ? "checked" : "") + '> ' + f.label + '</label>'
              : '<div style="margin-bottom:8px"><label style="display:block;font-size:0.85rem;margin-bottom:2px">' + f.label + '</label><input type="' + f.type + '" id="ef-' + f.key + '" class="form-control" value="' + escapeHtml(f.value) + '"></div>'
          ).join("");

          showFormModal("Edit Plan", formHtml, async function() {
            var body = {};
            fields.forEach(function(f) {
              if (f.key === "isActive") body[f.key] = document.getElementById("ef-" + f.key).checked;
              else if (f.type === "number") body[f.key] = parseFloat(document.getElementById("ef-" + f.key).value) || 0;
              else body[f.key] = document.getElementById("ef-" + f.key).value;
            });
            try {
              await api.put("/subscriptionplans/" + p.id, body);
              showToast("Plan updated", "success");
              loadPlans();
            } catch (err) { showToast(err.message, "error"); }
          });
        });
      });

      panel.querySelectorAll(".delete-plan-btn").forEach(btn => {
        btn.addEventListener("click", async function() {
          var ok = await showConfirm("Delete plan?", "Delete \"" + btn.dataset.name + "\"? This cannot be undone.", { type: "danger", confirmText: "Delete" });
          if (!ok) return;
          try {
            await api.delete("/subscriptionplans/" + btn.dataset.id);
            showToast("Plan deleted", "success");
            loadPlans();
          } catch (err) { showToast(err.message, "error"); }
        });
      });

      document.getElementById("addPlanBtn")?.addEventListener("click", function() {
        var tierOptions = ["Free", "Basic", "Pro", "Enterprise"].map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join("");
        var formHtml =
          '<div style="margin-bottom:8px"><label>Tier</label><select id="af-tier" class="form-control">' + tierOptions + '</select></div>' +
          '<div style="margin-bottom:8px"><label>Name</label><input id="af-name" class="form-control"></div>' +
          '<div style="margin-bottom:8px"><label>Description</label><input id="af-desc" class="form-control"></div>' +
          '<div style="margin-bottom:8px"><label>Price (USD)</label><input id="af-price" class="form-control" type="number" value="0"></div>' +
          '<div style="margin-bottom:8px"><label>Max Auctions/Month</label><input id="af-auctions" class="form-control" type="number" value="3"></div>' +
          '<div style="margin-bottom:8px"><label>Max Bids/Month</label><input id="af-bids" class="form-control" type="number" value="3"></div>' +
          '<div style="margin-bottom:8px"><label>Max Requests/Month</label><input id="af-requests" class="form-control" type="number" value="3"></div>' +
          '<div style="margin-bottom:8px"><label>Sort Order</label><input id="af-sort" class="form-control" type="number" value="1"></div>';

        showFormModal("Add Subscription Plan", formHtml, async function() {
          try {
            await api.post("/subscriptionplans", {
              tier: document.getElementById("af-tier").value,
              name: document.getElementById("af-name").value,
              description: document.getElementById("af-desc").value,
              price: parseFloat(document.getElementById("af-price").value) || 0,
              currency: "USD",
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
