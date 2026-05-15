async function renderDashboard(container, route, params) {
  if (!(await requireAuth())) return;

  const tab = params.tab || "overview";
  const user = getUser();

  container.innerHTML = `
    <div class="dashboard-layout">
      <div class="dashboard-sidebar">
        <a href="#/dashboard" class="dash-link ${tab === "overview" ? "active" : ""}" data-tab="overview"><i class="fas fa-tachometer-alt"></i> ${t("dash.overview")}</a>
        <a href="#/dashboard?tab=orders" class="dash-link ${tab === "orders" ? "active" : ""}" data-tab="orders"><i class="fas fa-box"></i> ${t("dash.orders")}</a>
        ${hasAnyRole("Fisherman", "BaitSeller", "Auctioneer") ? `<a href="#/dashboard?tab=products" class="dash-link ${tab === "products" ? "active" : ""}" data-tab="products"><i class="fas fa-tag"></i> ${t("dash.products")}</a>` : ""}
        <a href="#/dashboard?tab=wishlist" class="dash-link ${tab === "wishlist" ? "active" : ""}" data-tab="wishlist"><i class="fas fa-heart"></i> ${t("dash.wishlist")}</a>
        <a href="#/dashboard?tab=notifications" class="dash-link ${tab === "notifications" ? "active" : ""}" data-tab="notifications"><i class="fas fa-bell"></i> ${t("dash.notifications")}</a>
        <a href="#/dashboard?tab=profile" class="dash-link ${tab === "profile" ? "active" : ""}" data-tab="profile"><i class="fas fa-user"></i> ${t("dash.profile")}</a>
        <a href="#/dashboard?tab=password" class="dash-link ${tab === "password" ? "active" : ""}" data-tab="password"><i class="fas fa-key"></i> ${t("dash.changePassword")}</a>
      </div>
      <div class="dashboard-content" id="dashContent"></div>
    </div>
  `;

  $$(".dash-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const t = a.dataset.tab;
      navigate(`dashboard?tab=${t}`);
    });
  });

  const content = document.getElementById("dashContent");

  switch (tab) {
    case "orders":
      renderOrders(content);
      break;
    case "products":
      renderMyProducts(content);
      break;
    case "wishlist":
      renderWishlist(content);
      break;
    case "notifications":
      renderNotifications(content);
      break;
    case "profile":
      renderProfile(content, user);
      break;
    case "password":
      renderChangePassword(content);
      break;
    default:
      renderOverview(content, user);
      break;
  }
}

async function renderOverview(content, user) {
  content.innerHTML = `
    <div class="card animate-on-scroll">
      <h3><i class="fas fa-tachometer-alt"></i> ${t("dash.overview")}</h3>
      <p style="color:var(--text-muted);margin-top:6px">${t("dash.welcome")}, <strong>${escapeHtml(user?.fullName || "User")}</strong>!</p>
      <p style="color:var(--text-muted)">${t("dash.role")}: <span class="category-tag">${user?.role || t("common.N/A")}</span></p>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card animate-on-scroll stagger-1" id="dashOrders"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>
      <div class="card animate-on-scroll stagger-2" id="dashProducts"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>
    </div>
  `;
  observeAnimations();

  try {
    const orders = await api.get("/orders", { pageSize: 1 });
    document.getElementById("dashOrders").innerHTML =
      `<h3><i class="fas fa-box"></i> ${t("dash.orders")}</h3><p style="font-size:2rem;font-weight:700;color:var(--primary)">${orders.totalCount || orders.total || 0}</p><p style="color:var(--text-muted)">${t("dash.totalOrders")}</p>`;
  } catch {
    document.getElementById("dashOrders").innerHTML =
      `<div class="alert alert-info">${t("common.error")}</div>`;
  }

  try {
    const products = await api
      .get("/products/my", { pageSize: 1 })
      .catch(() => api.get("/products/seller", { pageSize: 1 }));
    document.getElementById("dashProducts").innerHTML =
      `<h3><i class="fas fa-tag"></i> ${t("dash.products")}</h3><p style="font-size:2rem;font-weight:700;color:var(--primary)">${products.totalCount || products.total || 0}</p><p style="color:var(--text-muted)">${t("dash.yourProducts")}</p>`;
  } catch {
    document.getElementById("dashProducts").innerHTML =
      `<div class="alert alert-info">${t("common.error")}</div>`;
  }
}

async function renderOrders(content) {
  content.innerHTML = `<div class="card"><h3><i class="fas fa-box"></i> ${t("dash.orders")}</h3><div id="ordersList"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div></div>`;

  let page = 1;
  const pageSize = 10;

  async function loadOrders() {
    const list = document.getElementById("ordersList");
    list.innerHTML = `<div class="loading" style="padding:20px"><i class="fas fa-spinner spinner"></i><p>${t("common.loading")}</p></div>`;
    try {
      const data = await api.get("/orders", { page, pageSize });
      const orders = data.items || data.data || [];
      if (!orders.length) {
        renderEmptyState(list, {
          icon: "fa-box",
          title: t("dash.noOrders"),
          actionText: t("cart.browseProducts"),
          actionHref: "#/products",
        });
        return;
      }
      const total = data.totalCount || data.total || orders.length;
      const pages = Math.ceil(total / pageSize);
      list.innerHTML = `
        <div class="table-wrapper animate-on-scroll">
          <table>
            <thead><tr><th>${t("dash.orderNum")}</th><th>${t("cart.total")}</th><th>${t("product.status")}</th><th>${t("dash.date")}</th><th></th></tr></thead>
            <tbody>${orders
              .map(
                (o) => `
              <tr>
                <td>#${o.id}</td>
                <td style="font-weight:600">${formatPrice(o.totalPrice)}</td>
                <td><span class="status ${statusClass(o.status)}">${o.status}</span></td>
                <td>${formatDate(o.createdAt || o.orderDate)}</td>
                <td><a href="#/order-detail?id=${o.id}" class="btn btn-outline btn-sm">${t("dash.view")}</a></td>
              </tr>
            `,
              )
              .join("")}</tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:20px">
          <button class="btn btn-sm btn-ghost" id="ordersPrev" ${page <= 1 ? "disabled" : ""}><i class="fas fa-chevron-${document.documentElement.dir === "rtl" ? "right" : "left"}"></i></button>
          <span style="font-size:0.88rem;color:var(--text-muted)">${t("common.page")} ${page} / ${pages}</span>
          <button class="btn btn-sm btn-ghost" id="ordersNext" ${page >= pages ? "disabled" : ""}><i class="fas fa-chevron-${document.documentElement.dir === "rtl" ? "left" : "right"}"></i></button>
        </div>
      `;
      document.getElementById("ordersPrev")?.addEventListener("click", () => {
        if (page > 1) {
          page--;
          loadOrders();
        }
      });
      document.getElementById("ordersNext")?.addEventListener("click", () => {
        if (page < pages) {
          page++;
          loadOrders();
        }
      });
      observeAnimations();
    } catch (e) {
      list.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
    }
  }

  await loadOrders();
}

async function renderMyProducts(content) {
  content.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <h3><i class="fas fa-tag"></i> ${t("dash.products")}</h3>
      <button class="btn btn-primary btn-sm" id="showProductForm"><i class="fas fa-plus"></i> ${t("product.create")}</button>
    </div>
    <div id="productFormContainer" class="hidden card card-sm" style="max-width:500px;margin-bottom:16px">
      <h4 style="margin-bottom:12px">${t("product.create")}</h4>
      <form id="myProductForm" novalidate>
        <div class="form-group"><label class="form-label">${t("product.title")} *</label><input type="text" class="form-input" id="prodTitle" required></div>
        <div class="form-group"><label class="form-label">${t("product.description")}</label><textarea class="form-textarea" id="prodDesc"></textarea></div>
        <div class="form-group"><label class="form-label">${t("product.price")} *</label><input type="number" class="form-input" id="prodPrice" min="0" step="0.01" required></div>
        <div class="form-group"><label class="form-label">${t("product.condition")}</label><select class="form-select" id="prodCondition"><option value="New">${t("product.new")}</option><option value="Used">${t("product.used")}</option></select></div>
        <div class="form-group">
          <label class="form-label">${t("product.images")}</label>
          <input type="file" class="form-input" id="prodImageInput" accept="image/jpeg,image/png,image/webp" style="padding:8px">
          <div id="uploadProgress" style="margin-top:4px;font-size:0.82rem;color:var(--text-muted)"></div>
        </div>
        <div id="productAlert"></div>
        <button type="submit" class="btn btn-primary" id="prodSubmit">${t("product.save")}</button>
      </form>
    </div>
    <div id="myProductsList"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;

  document.getElementById("showProductForm").addEventListener("click", () => {
    document.getElementById("productFormContainer").classList.toggle("hidden");
  });

  document
    .getElementById("myProductForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const submit = document.getElementById("prodSubmit");
      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("product.saving")}`;
      const alertDiv = document.getElementById("productAlert");
      alertDiv.innerHTML = "";
      try {
        const product = await api.post("/products", {
          title: document.getElementById("prodTitle").value.trim(),
          description: document.getElementById("prodDesc").value.trim(),
          price: parseFloat(document.getElementById("prodPrice").value),
          condition: document.getElementById("prodCondition").value,
          status: "Available",
        });

        const fileInput = document.getElementById("prodImageInput");
        if (fileInput.files.length) {
          const formData = new FormData();
          formData.append("file", fileInput.files[0]);
          document.getElementById("uploadProgress").textContent =
            t("product.uploading");
          const upload = await api.upload("/upload", formData);
          if (upload.url) {
            await api.post(`/products/${product.id}/images`, {
              imageUrl: upload.url,
              isPrimary: true,
            });
          }
          document.getElementById("uploadProgress").textContent = "";
        }

        showToast(t("product.saved"), "success");
        document.getElementById("myProductForm").reset();
        document.getElementById("productFormContainer").classList.add("hidden");
        renderMyProducts(content);
      } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        submit.disabled = false;
        submit.textContent = t("product.save");
      }
    });

  try {
    const data = await api.get("/products/seller", { pageSize: 50 });
    const products = data.items || data.data || [];
    const list = document.getElementById("myProductsList");
    if (!products.length) {
      renderEmptyState(list, { icon: "fa-tag", title: t("dash.noProducts") });
      return;
    }
    list.innerHTML = `
      <div class="table-wrapper animate-on-scroll">
        <table>
          <thead><tr><th>${t("cart.product")}</th><th>${t("cart.price")}</th><th>${t("product.status")}</th><th>${t("product.stock")}</th><th></th></tr></thead>
          <tbody>${products
            .map(
              (p) => `
            <tr>
              <td><a href="#/product-detail?id=${p.id}" style="text-decoration:none;color:var(--text);font-weight:500">${escapeHtml(p.title)}</a></td>
              <td style="font-weight:600">${formatPrice(p.price)}</td>
              <td><span class="status ${statusClass(p.status)}">${p.status}</span></td>
              <td>${p.stockQuantity ?? "-"}</td>
              <td><a href="#/product-detail?id=${p.id}" class="btn btn-outline btn-sm">${t("dash.view")}</a></td>
            </tr>
          `,
            )
            .join("")}</tbody>
        </table>
      </div>
    `;
    observeAnimations();
  } catch (e) {
    document.getElementById("myProductsList").innerHTML =
      `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}

async function renderWishlist(content) {
  content.innerHTML = `<div class="card"><h3><i class="fas fa-heart"></i> ${t("dash.wishlist")}</h3><div id="wishlistItems"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div></div>`;
  try {
    const data = await api.get("/wishlist");
    const items = data.items || data.data || data;
    if (!items.length) {
      renderEmptyState(document.getElementById("wishlistItems"), {
        icon: "fa-heart",
        title: t("dash.emptyWishlist"),
        actionText: t("cart.browseProducts"),
        actionHref: "#/products",
      });
      return;
    }
    document.getElementById("wishlistItems").innerHTML = `
      <div class="table-wrapper animate-on-scroll">
        <table>
          <thead><tr><th>${t("cart.product")}</th><th>${t("cart.price")}</th><th></th></tr></thead>
          <tbody>${items
            .map(
              (w) => `
            <tr>
              <td><a href="#/product-detail?id=${w.productId}" style="text-decoration:none;color:var(--text);font-weight:500">${escapeHtml(w.product?.title || `Product #${w.productId}`)}</a></td>
              <td>${w.product?.price ? formatPrice(w.product.price) : "-"}</td>
              <td><a href="#/product-detail?id=${w.productId}" class="btn btn-primary btn-sm">${t("dash.view")}</a></td>
            </tr>
          `,
            )
            .join("")}</tbody>
        </table>
      </div>
    `;
    observeAnimations();
  } catch (e) {
    document.getElementById("wishlistItems").innerHTML =
      `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}

async function renderNotifications(content) {
  content.innerHTML = `<div class="card animate-on-scroll"><h3><i class="fas fa-bell"></i> ${t("dash.notifications")}</h3><div id="notifList"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div></div>`;
  try {
    const data = await api.get("/notifications");
    const notifs = data.items || data.data || [];
    if (!notifs.length) {
      renderEmptyState(document.getElementById("notifList"), {
        icon: "fa-bell",
        title: t("dash.noNotifications"),
      });
      observeAnimations();
      return;
    }
    document.getElementById("notifList").innerHTML = notifs
      .map(
        (n) => `
      <div class="notif-item ${n.isRead ? "" : "unread"}">
        <div style="flex:1">
          <strong>${escapeHtml(n.title)}</strong>
          <p style="color:var(--text-muted);font-size:0.9rem">${escapeHtml(n.message)}</p>
          <small style="color:var(--text-muted)">${formatDate(n.createdAt)}</small>
        </div>
        ${!n.isRead ? `<button class="btn btn-sm btn-ghost mark-read" data-id="${n.id}"><i class="fas fa-check"></i></button>` : ""}
      </div>
    `,
      )
      .join("");

    $$(".mark-read").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await api.patch(`/notifications/${btn.dataset.id}/read`);
          btn.closest(".notif-item").classList.remove("unread");
          btn.remove();
          updateNotifBadge();
        } catch {}
      });
    });
    observeAnimations();
  } catch (e) {
    document.getElementById("notifList").innerHTML =
      `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}

function renderProfile(content, user) {
  content.innerHTML = `
    <div class="card animate-on-scroll">
      <h3><i class="fas fa-user"></i> ${t("dash.profile")}</h3>
      <form id="profileForm">
        <div class="form-group">
          <label class="form-label">${t("auth.fullName")}</label>
          <input type="text" class="form-input" id="profileName" value="${escapeHtml(user?.fullName || "")}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t("auth.email")}</label>
          <input type="email" class="form-input" id="profileEmail" value="${escapeHtml(user?.email || "")}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t("auth.phone")}</label>
          <input type="tel" class="form-input" id="profilePhone" value="${escapeHtml(user?.phone || "")}">
        </div>
        <div id="profileAlert"></div>
      <button type="submit" class="btn btn-primary" id="profileSubmit">${t("dash.updateProfile")}</button>
    </form>
    </div>
  `;
  observeAnimations();

  const nameInput = document.getElementById("profileName");
  const emailInput = document.getElementById("profileEmail");
  const phoneInput = document.getElementById("profilePhone");

  [nameInput, emailInput, phoneInput].forEach((el) => {
    el?.addEventListener("input", () => clearFieldError(el));
  });

  document
    .getElementById("profileForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const submit = document.getElementById("profileSubmit");
      const alertDiv = document.getElementById("profileAlert");

      const valid = validateForm(form, [
        {
          element: nameInput,
          required: true,
          messages: { required: t("auth.fullName") + " is required." },
        },
        { element: emailInput, required: true, email: true },
        { element: phoneInput, phone: true },
      ]);

      if (!valid) return;

      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("dash.updating")}`;
      alertDiv.innerHTML = "";

      try {
        const data = await api.put("/users/profile", {
          fullName: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
        });
        localStorage.setItem("user", JSON.stringify(data.user || data));
        updateNavbar();
        alertDiv.innerHTML = `<div class="alert alert-success">${t("dash.profileUpdated")}</div>`;
      } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        submit.disabled = false;
        submit.textContent = t("dash.updateProfile");
      }
    });
}

function renderChangePassword(content) {
  content.innerHTML = `
    <div class="card animate-on-scroll">
      <h3><i class="fas fa-key"></i> ${t("dash.changePassword")}</h3>
      <form id="passwordForm">
        <div class="form-group">
          <label class="form-label">${t("dash.currentPassword")}</label>
          <input type="password" class="form-input" id="oldPassword" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t("dash.newPassword")}</label>
          <input type="password" class="form-input" id="newPassword" required minlength="6">
        </div>
        <div id="passwordAlert"></div>
        <button type="submit" class="btn btn-primary" id="passwordSubmit">${t("dash.changePwBtn")}</button>
      </form>
    </div>
  `;
  observeAnimations();

  const oldInput = document.getElementById("oldPassword");
  const newInput = document.getElementById("newPassword");

  [oldInput, newInput].forEach((el) => {
    el?.addEventListener("input", () => clearFieldError(el));
  });

  document
    .getElementById("passwordForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const submit = document.getElementById("passwordSubmit");
      const alertDiv = document.getElementById("passwordAlert");

      const valid = validateForm(form, [
        { element: oldInput, required: true },
        {
          element: newInput,
          required: true,
          minLength: 6,
          messages: {
            minLength: t("auth.password") + " must be at least 6 characters.",
          },
        },
      ]);

      if (!valid) return;

      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("dash.changing")}`;
      alertDiv.innerHTML = "";

      try {
        await api.post("/auth/change-password", {
          oldPassword: oldInput.value,
          newPassword: newInput.value,
        });
        alertDiv.innerHTML = `<div class="alert alert-success">${t("dash.passwordChanged")}</div>`;
        document.getElementById("passwordForm").reset();
      } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        submit.disabled = false;
        submit.textContent = t("dash.changePwBtn");
      }
    });
}
