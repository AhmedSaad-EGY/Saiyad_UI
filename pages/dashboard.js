async function renderDashboard(container, route, params) {
  if (!(await requireAuth())) return;

  const tab = params.tab || "overview";
  const user = getUser();

  const tabs = [
    { id: "overview", icon: "fa-tachometer-alt", label: t("dash.overview") },
    { id: "orders", icon: "fa-box", label: t("dash.orders") },
    ...(hasAnyRole("Fisherman", "BaitSeller", "Auctioneer") ? [{ id: "products", icon: "fa-tag", label: t("dash.products") }] : []),
    { id: "wishlist", icon: "fa-heart", label: t("dash.wishlist") },
    { id: "notifications", icon: "fa-bell", label: t("dash.notifications") },
    { id: "profile", icon: "fa-user", label: t("dash.profile") },
    { id: "password", icon: "fa-key", label: t("dash.changePassword") },
  ];

  container.innerHTML = `
    <div class="dashboard-layout">
      <div class="dashboard-sidebar">
        ${tabs.map(tabItem => `<a href="#/dashboard${tabItem.id === "overview" ? "" : `?tab=${tabItem.id}`}" class="dash-link ${tab === tabItem.id ? "active" : ""}" data-tab="${tabItem.id}"><i class="fas ${tabItem.icon}"></i> ${tabItem.label}</a>`).join("")}
      </div>
      <div class="dash-mobile-tabs">
        <select id="dashMobileSelect" class="form-select" aria-label="Dashboard tabs">
          ${tabs.map(tabItem => `<option value="${tabItem.id}" ${tab === tabItem.id ? "selected" : ""}>${tabItem.label}</option>`).join("")}
        </select>
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

  document.getElementById("dashMobileSelect")?.addEventListener("change", (e) => {
    navigate(`dashboard?tab=${e.target.value}`);
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
      .catch(() => null);
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
                <td><span class="status ${statusClass(o.status)}">${tStatus(o.status)}</span></td>
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
        <div class="form-group"><label class="form-label">${t("product.description")} *</label><textarea class="form-textarea" id="prodDesc" required></textarea></div>
        <div class="form-group"><label class="form-label">Brand *</label><input type="text" class="form-input" id="prodBrand" required></div>
        <div class="form-group"><label class="form-label">${t("product.price")} *</label><input type="number" class="form-input" id="prodPrice" min="0" step="0.01" required></div>
        <div class="form-group"><label class="form-label">Stock Quantity *</label><input type="number" class="form-input" id="prodStock" min="0" value="1" required></div>
        <div class="form-group"><label class="form-label">Location *</label><input type="text" class="form-input" id="prodLocation" required></div>
        <div class="form-group"><label class="form-label">Category *</label><select class="form-select" id="prodCategory"><option value="">Loading...</option></select></div>
        <div class="form-group"><label class="form-label">${t("product.condition")}</label><select class="form-select" id="prodCondition"><option value="0">${t("product.new")}</option><option value="1">${t("product.used")}</option></select></div>
          <div class="form-group">
            <label class="form-label">${t("product.images")}</label>
            <input type="file" class="form-input" id="prodImageInput" accept="image/jpeg,image/png,image/webp" style="padding:8px">
            <img id="prodImagePreview" class="hidden" style="width:120px;height:120px;object-fit:cover;border-radius:var(--radius-md);margin-top:8px;border:1px solid var(--border)">
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

  document.getElementById("prodImageInput")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("prodImagePreview");
    if (file && preview) {
      const reader = new FileReader();
      reader.onload = (ev) => { preview.src = ev.target.result; preview.classList.remove("hidden"); };
      reader.readAsDataURL(file);
    }
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
          brand: document.getElementById("prodBrand").value.trim(),
          price: parseFloat(document.getElementById("prodPrice").value),
          condition: document.getElementById("prodCondition").value,
          stockQuantity: parseInt(document.getElementById("prodStock").value) || 1,
          location: document.getElementById("prodLocation").value.trim(),
          categoryId: parseInt(document.getElementById("prodCategory").value),
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

  // Load categories for the product form
  (async () => {
    const sel = document.getElementById("prodCategory");
    if (sel) {
      try {
        const cats = await api.get("/categories");
        const list = Array.isArray(cats) ? cats : cats.items || cats.data || [];
        sel.innerHTML = list.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
      } catch { sel.innerHTML = '<option value="">Failed to load</option>'; }
    }
  })();

  try {
    const data = await api.get("/products/my", { pageSize: 50 });
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
              <td><span class="status ${statusClass(p.status)}">${tStatus(p.status, "product")}</span></td>
              <td>${p.stockQuantity ?? "-"}</td>
              <td style="display:flex;gap:4px;flex-wrap:nowrap">
                <a href="#/product-detail?id=${p.id}" class="btn btn-outline btn-sm">${t("dash.view")}</a>
                ${!p.isAuctioned && hasAnyRole("Auctioneer","Fisherman","BaitSeller") ? `<button class="btn btn-primary btn-sm start-auction-btn" data-product-id="${p.id}" data-product-title="${escapeHtml(p.title)}" aria-label="${t("auction.startAuction")}"><i class="fas fa-gavel"></i></button>` : ""}
              </td>
            </tr>
          `,
            )
            .join("")}</tbody>
        </table>
      </div>
    `;
    observeAnimations();

    // Delegate Start Auction button clicks
    const listEl = document.getElementById("myProductsList");
    listEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".start-auction-btn");
      if (!btn) return;
      const productId = parseInt(btn.dataset.productId);
      const productTitle = btn.dataset.productTitle;
      showAuctionModal(productId, productTitle);
    });
  } catch (e) {
    document.getElementById("myProductsList").innerHTML =
      `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}

function showAuctionModal(productId, productTitle) {
  const existing = document.querySelector(".modal-overlay.show");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay show";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Start Auction");

  const prevFocus = document.activeElement;
  const minEnd = new Date(Date.now() + 3600000).toISOString().slice(0, 16); // min 1hr from now

  overlay.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()" style="max-width:460px">
      <h3><i class="fas fa-gavel"></i> ${t("auctions.title")} — ${escapeHtml(productTitle)}</h3>
      <div id="auctionModalAlert"></div>
      <form id="auctionModalForm" novalidate>
        <div class="form-group">
          <label class="form-label">${t("auction.end")} *</label>
          <input type="datetime-local" class="form-input" id="auctionEndTime" min="${minEnd}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t("auction.startingPrice")} *</label>
          <input type="number" class="form-input" id="auctionStartPrice" min="0.01" step="0.01" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t("auction.reservePrice")}</label>
          <input type="number" class="form-input" id="auctionReservePrice" min="0" step="0.01" value="0">
        </div>
        <div class="form-group">
          <label class="form-label">${t("auction.minIncrement")} *</label>
          <input type="number" class="form-input" id="auctionMinIncrement" min="0.01" step="0.01" value="1" required>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="auctionModalCancel">${t("common.retry") || "Cancel"}</button>
          <button type="submit" class="btn btn-primary" id="auctionModalSubmit"><i class="fas fa-gavel"></i> ${t("auctions.title")}</button>
        </div>
      </form>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.body.appendChild(overlay);

  function close() {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
  }
  function onKey(e) { if (e.key === "Escape") close(); }
  document.addEventListener("keydown", onKey);

  document.getElementById("auctionModalCancel").addEventListener("click", close);

  document.getElementById("auctionModalForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submit = document.getElementById("auctionModalSubmit");
    const alertDiv = document.getElementById("auctionModalAlert");
    alertDiv.innerHTML = "";
    submit.disabled = true;
    submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auction.placingBid")}`;

    try {
      await api.post("/auctions", {
        productId,
        endTime: new Date(document.getElementById("auctionEndTime").value).toISOString(),
        startingPrice: parseFloat(document.getElementById("auctionStartPrice").value),
        reservePrice: parseFloat(document.getElementById("auctionReservePrice").value) || 0,
        minimumIncrement: parseFloat(document.getElementById("auctionMinIncrement").value) || 1,
      });
      showToast(t("auctions.title") + " started!", "success");
      close();
      // Refresh the products list
      const content = document.getElementById("dashContent");
      if (content) renderMyProducts(content);
    } catch (err) {
      alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    } finally {
      submit.disabled = false;
      submit.textContent = t("auctions.title");
    }
  });
}

async function renderWishlist(content) {
  content.innerHTML = `<div class="card"><h3><i class="fas fa-heart"></i> ${t("dash.wishlist")}</h3><div id="wishlistItems"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div></div>`;
  try {
      const data = await api.get("/wishlist", { pageSize: 50 });
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
              <td style="display:flex;gap:8px">
                <a href="#/product-detail?id=${w.productId}" class="btn btn-primary btn-sm">${t("dash.view")}</a>
                <button class="btn btn-danger btn-sm remove-wishlist" data-id="${w.productId}"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          `,
            )
            .join("")}</tbody>
        </table>
      </div>
    `;

    document.querySelectorAll(".remove-wishlist").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm(t("wishlist.confirmRemove"))) return;
        try {
          await api.delete(`/wishlist/${btn.dataset.id}`);
          showToast(t("product.wishlistUpdated"), "success");
          renderWishlist(content);
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
    observeAnimations();
  } catch (e) {
    document.getElementById("wishlistItems").innerHTML =
      `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}

async function renderNotifications(content) {
  content.innerHTML = `<div class="card animate-on-scroll"><h3><i class="fas fa-bell"></i> ${t("dash.notifications")}</h3><div style="display:flex;gap:8px;margin-bottom:12px"><button class="btn btn-sm btn-ghost" id="markAllRead"><i class="fas fa-check-double"></i> ${t("notif.markAllRead")}</button></div><div id="notifList"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div></div>`;
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
          await api.put(`/notifications/${btn.dataset.id}/read`);
          btn.closest(".notif-item").classList.remove("unread");
          btn.remove();
          updateNotifBadge();
        } catch {}
      });
    });

    document.getElementById("markAllRead")?.addEventListener("click", async () => {
      try {
        await api.put("/notifications/read-all");
        document.querySelectorAll("#notifList .notif-item").forEach((el) => el.classList.remove("unread"));
        document.querySelectorAll("#notifList .mark-read").forEach((el) => el.remove());
        updateNotifBadge();
        showToast(t("notif.markedAllRead"), "success");
      } catch {}
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
          <div class="password-wrapper">
            <input type="password" class="form-input" id="newPassword" required minlength="6">
          </div>
          <div class="password-strength" id="dashStrength"><div class="password-strength-bar" id="dashStrengthBar"></div></div>
          <div class="password-strength-text" id="dashStrengthText"></div>
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

  newInput.addEventListener("input", () => {
    const pw = newInput.value;
    const bar = document.getElementById("dashStrengthBar");
    const txt = document.getElementById("dashStrengthText");
    if (!pw) {
      bar.className = "password-strength-bar strength-empty";
      txt.textContent = "";
      return;
    }
    const result = getPasswordStrength(pw);
    bar.className = "password-strength-bar " + result.cls;
    txt.textContent = result.label;
    txt.style.color = getComputedStyle(bar).backgroundColor;
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
            minLength: t("auth.passwordMinLength"),
          },
        },
      ]);

      if (!valid) return;

      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("dash.changing")}`;
      alertDiv.innerHTML = "";

      try {
        await api.post("/auth/change-password", {
          currentPassword: oldInput.value,
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
