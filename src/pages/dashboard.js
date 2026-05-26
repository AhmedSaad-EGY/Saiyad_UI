import Alpine from 'alpinejs';
import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth, getUser, hasAnyRole, hasRole, updateNavbar, updateCartBadge, updateNotifBadge } from '../core/auth/index.js';
import { navigate, registerRouteCleanup } from '../core/router/index.js';
import { $$, showLoading, renderEmptyState, escapeHtml, observeAnimations } from '../core/utils/dom.js';
import { validateForm, getPasswordStrength, clearFieldError } from '../core/utils/validation.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../core/utils/format.js';
import { showConfirm, showToast } from '../core/utils/ui.js';
import { ROLES, SELLER_ROLES, ECOMMERCE_ROLES, MODERATOR_ROLES } from '../shared/constants/routes.js';
import renderAuctionRequests from './auction-requests.js';
import renderAuctionRequestsReview from './auction-requests-review.js';
import renderAuctioneerAnalytics from './auctioneer-analytics.js';

Alpine.data('dashboardPage', () => ({
  activeTab: 'overview',
  loadedTabs: new Set(),

  init() {
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    this.activeTab = params.get('tab') || 'overview';
    this.$nextTick(() => this.ensureTabLoaded(this.activeTab));
    if (window.innerWidth < 768) document.body.classList.add('has-bottom-bar');
  },

  switchTab(tabId) {
    if (tabId === this.activeTab) return;
    this.activeTab = tabId;
    const qp = new URLSearchParams(location.hash.split('?')[1] || '');
    if (tabId === 'overview') qp.delete('tab');
    else qp.set('tab', tabId);
    const qs = qp.toString();
    history.replaceState(null, '', qs ? `#/dashboard?${qs}` : '#/dashboard');
    this.ensureTabLoaded(tabId);
  },

  ensureTabLoaded(tabId) {
    if (this.loadedTabs.has(tabId)) return;
    this.loadedTabs.add(tabId);
    const content = document.getElementById('dashTab_' + tabId);
    if (!content) return;
    const user = getUser();
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    const route = { path: '/dashboard' };

    const skeletonType = tabId === 'orders' ? 'table' : tabId === 'products' || tabId === 'profile' || tabId === 'password' ? 'form' : 'page';
    showLoading(content, skeletonType);

    switch (tabId) {
      case 'orders': renderOrders(content); break;
      case 'products': renderMyProducts(content); break;
      case 'auctions': renderDashAuctions(content); break;
      case 'auction-requests': if (typeof renderAuctionRequests === 'function') renderAuctionRequests(content, route, params); break;
      case 'auction-requests-review': if (typeof renderAuctionRequestsReview === 'function') renderAuctionRequestsReview(content, route, params); break;
      case 'auctioneer-analytics': if (typeof renderAuctioneerAnalytics === 'function') renderAuctioneerAnalytics(content, route, params); break;
      case 'wishlist': renderWishlist(content); break;
      case 'notifications': renderNotifications(content); break;
      case 'profile': renderProfile(content, user); break;
      case 'password': renderChangePassword(content); break;
      default: renderOverview(content, user); break;
    }
  },
}));

export default async function renderDashboard(container, route, params) {
  if (!(await requireAuth())) return;

  const user = getUser();
  const tab = params.tab || 'overview';

  const isECommerceRole = hasAnyRole(...(ECOMMERCE_ROLES));
  const isSellerRole = hasAnyRole(...(SELLER_ROLES));

  const tabs = [
    { id: 'overview', icon: 'fa-tachometer-alt', label: t('dash.overview') },
    ...(isECommerceRole ? [{ id: 'orders', icon: 'fa-box', label: t('dash.orders') }] : []),
    ...(isSellerRole ? [{ id: 'products', icon: 'fa-tag', label: t('dash.products') }] : []),
    ...(hasRole('Auctioneer') ? [{ id: 'auctions', icon: 'fa-gavel', label: t('dash.auctions') }] : []),
    ...(hasAnyRole('Fisherman') ? [{ id: 'auction-requests', icon: 'fa-file-export', label: t('auctionRequests.title') }] : []),
    ...(hasAnyRole(...(MODERATOR_ROLES)) ? [{ id: 'auction-requests-review', icon: 'fa-clipboard-list', label: t('auctionRequestsReview.title') }] : []),
    ...(hasAnyRole(...(MODERATOR_ROLES)) ? [{ id: 'auctioneer-analytics', icon: 'fa-chart-bar', label: t('analytics.title') }] : []),
    ...(isECommerceRole ? [{ id: 'wishlist', icon: 'fa-heart', label: t('dash.wishlist') }] : []),
    { id: 'notifications', icon: 'fa-bell', label: t('dash.notifications') },
    { id: 'profile', icon: 'fa-user', label: t('dash.profile') },
    { id: 'password', icon: 'fa-key', label: t('dash.changePassword') },
  ];

  container.innerHTML = `
    <div x-data="dashboardPage" class="dashboard-layout" x-init="init()">
      <div class="dashboard-sidebar">
        ${tabs.map(tabItem => `
          <a href="#/dashboard${tabItem.id === 'overview' ? '' : '?tab=' + tabItem.id}"
             class="dash-link"
             :class="{ active: activeTab === '${tabItem.id}' }"
             @click.prevent="switchTab('${tabItem.id}')">
            <i class="fas ${tabItem.icon}"></i> ${tabItem.label}
          </a>
        `).join('')}
      </div>
      <div class="dash-mobile-tabs">
        <select class="form-select" aria-label="Dashboard tabs" x-model="activeTab" @change="switchTab(activeTab)">
          ${tabs.map(tabItem => `<option value="${tabItem.id}">${tabItem.label}</option>`).join('')}
        </select>
      </div>
      <div class="dashboard-content">
        ${tabs.map(tabItem => `
          <div id="dashTab_${tabItem.id}" x-show="activeTab === '${tabItem.id}'" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100"></div>
        `).join('')}
      </div>
      <div class="dash-bottom-bar">
        ${tabs.map(tabItem => `
          <a href="#/dashboard${tabItem.id === 'overview' ? '' : '?tab=' + tabItem.id}"
             class="dash-bottom-link"
             :class="{ active: activeTab === '${tabItem.id}' }"
             @click.prevent="switchTab('${tabItem.id}')"
             title="${tabItem.label}">
            <i class="fas ${tabItem.icon}"></i><span>${tabItem.label}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  registerRouteCleanup(() => {
    document.body.classList.remove('has-bottom-bar');
    document.body.classList.remove('has-floating-bar');
  });
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
      `<div class="alert alert-info" role="alert">${t("common.error")}</div>`;
  }

  const sellerRoles = hasAnyRole(...(SELLER_ROLES));

  if (sellerRoles) {
    try {
      await api.get("/seller-profile/me");
    } catch (profileErr) {
      const is404 = profileErr?.status === 404
        || String(profileErr?.message || "").includes("404")
        || String(profileErr?.message || "").toLowerCase().includes("not found");
      if (is404 && !document.getElementById("sellerOnboardBanner")) {
        const overviewEl = document.getElementById("dashOverview") || content;
        const banner = document.createElement("div");
        banner.id = "sellerOnboardBanner";
        banner.className = "alert alert-info animate-on-scroll";
        banner.setAttribute("role", "status");
        banner.style.cssText = "margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap";
        banner.innerHTML = `
          <i class="fas fa-store" style="font-size:1.2rem;flex-shrink:0"></i>
          <span style="flex:1">
            <strong>${t("seller.setupRequired") || "Set up your seller profile"}</strong> —
            ${t("seller.setupDesc") || "Complete your seller profile before listing products."}
          </span>
          <a href="#/seller-profile" class="btn btn-primary btn-sm">
            ${t("seller.create") || "Set up profile"} <i class="fas fa-arrow-right"></i>
          </a>`;
        overviewEl.prepend(banner);
      }
    }
  }

  if (sellerRoles) {
    try {
      const products = await api.get("/products/my", { pageSize: 1 });
      document.getElementById("dashProducts").innerHTML =
        `<h3><i class="fas fa-tag"></i> ${t("dash.products")}</h3><p style="font-size:2rem;font-weight:700;color:var(--primary)">${products.totalCount || products.total || 0}</p><p style="color:var(--text-muted)">${t("dash.yourProducts")}</p>`;
    } catch (e) {
      document.getElementById("dashProducts").innerHTML =
        `<div class="card" style="text-align:center;padding:24px"><h3><i class="fas fa-tag"></i> ${t("dash.products")}</h3><p style="color:var(--text-muted);margin-top:8px">${t("dash.productsNotAvailable")}</p></div>`;
    }
  } else {
    document.getElementById("dashProducts").innerHTML =
      `<div class="card" style="text-align:center;padding:24px"><h3><i class="fas fa-tag"></i> ${t("dash.products")}</h3><p style="color:var(--text-muted);margin-top:8px">${t("dash.productsNotAvailable")}</p></div>`;
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
            <caption style="caption-side:bottom;margin-top:8px;font-size:0.78rem;color:var(--text-muted)">${t("dash.orders")}</caption>
            <thead><tr><th scope="col">${t("dash.orderNum")}</th><th scope="col">${t("cart.total")}</th><th scope="col">${t("product.status")}</th><th scope="col">${t("dash.date")}</th><th scope="col"></th></tr></thead>
            <tbody>${orders
              .map(
                (o) => `
              <tr>
                <td>#${o.id}</td>
                <td style="font-weight:600">${formatPrice(o.totalPrice)}</td>
                <td><span class="status ${statusClass(o.status)}">${tStatus(o.status)}</span></td>
                <td>${formatDate(o.createdAt || o.orderDate)}</td>
                <td>
                  <a href="#/order-detail?id=${o.id}" class="btn btn-outline btn-sm">${t("dash.view")}</a>
                  ${o.status === "Pending" || o.status === "Confirmed" ? `<button class="btn btn-outline btn-sm cancel-order-btn" data-order-id="${o.id}" style="color:var(--danger);border-color:var(--danger);margin-inline-start:4px">${t("order.cancel")}</button>` : ""}
                </td>
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

      list.querySelectorAll(".cancel-order-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const orderId = btn.dataset.orderId;
          const ok = await showConfirm(
            t("order.cancel"),
            t("order.cancelConfirm"),
            { type: "danger", confirmText: t("order.cancel") }
          );
          if (!ok) return;
          btn.disabled = true;
          btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("order.cancelling")}`;
          try {
            await api.put(`/orders/${orderId}/cancel`);
            showToast(t("order.cancelled"), "success");
            loadOrders();
          } catch (err) {
            showToast(err.message || t("order.cancelError"), "error");
            btn.disabled = false;
            btn.textContent = t("order.cancel");
          }
        });
      });
    } catch (e) {
      list.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(e.message)}</div>`;
    }
  }

  await loadOrders();
}

async function renderMyProducts(content) {
  const sellerRoles = hasAnyRole(...(SELLER_ROLES));
  let editingProductId = null;
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
        <div class="form-group"><label class="form-label">${t("product.brand") || "Brand"} *</label><input type="text" class="form-input" id="prodBrand" required></div>
        <div class="form-group"><label class="form-label">${t("product.price")} *</label><input type="number" class="form-input" id="prodPrice" min="0" step="0.01" required></div>
        <div class="form-group"><label class="form-label">${t("product.stock") || "Stock Quantity"} *</label><input type="number" class="form-input" id="prodStock" min="0" value="1" required></div>
        <div class="form-group"><label class="form-label">${t("product.location") || "Location"} *</label><input type="text" class="form-input" id="prodLocation" required></div>
        <div class="form-group"><label class="form-label">${t("product.category") || "Category"} *</label><select class="form-select" id="prodCategory"><option value="">${t("common.loading") || "Loading..."}</option></select></div>
        <div class="form-group"><label class="form-label">${t("product.condition")}</label><select class="form-select" id="prodCondition"><option value="New">${t("product.new")}</option><option value="Used">${t("product.used")}</option></select></div>
          <div class="form-group">
            <label class="form-label">${t("product.images")}</label>
            <input type="file" class="form-input" id="prodImageInput" accept="image/jpeg,image/png,image/webp" style="padding:8px">
            <img id="prodImagePreview" class="hidden" style="width:120px;height:120px;object-fit:cover;border-radius:var(--radius-md);margin-top:8px;border:1px solid var(--border)">
            <div id="uploadProgress" style="margin-top:4px;font-size:0.82rem;color:var(--text-muted)"></div>
          </div>
        <div id="productAlert"></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button type="submit" class="btn btn-primary" id="prodSubmit">${t("product.save")}</button>
          <button type="button" class="btn btn-ghost hidden" id="prodCancelEdit">${t("common.cancel")}</button>
        </div>
      </form>
    </div>
    <div id="myProductsList"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;

  document.getElementById("showProductForm").addEventListener("click", () => {
    const form = document.getElementById("productFormContainer");
    form.classList.toggle("hidden");
    if (!form.classList.contains("hidden") && !editingProductId) {
      document.querySelector("#productFormContainer h4").textContent = t("product.create");
    }
    // Restore saved draft
    const draft = JSON.parse(localStorage.getItem("product_draft") || "null");
    if (draft) {
      Object.keys(draft).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = draft[id];
      });
      const draftBanner = document.createElement("div");
      draftBanner.className = "alert alert-info";
      draftBanner.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px";
      draftBanner.innerHTML = `
        <span><i class="fas fa-history"></i> ${t("product.draftRestored")}</span>
        <button class="btn btn-ghost btn-sm" id="discardDraftBtn">${t("product.discardDraft")}</button>
      `;
      const form = document.getElementById("productFormContainer");
      form?.prepend(draftBanner);
      document.getElementById("discardDraftBtn")?.addEventListener("click", () => {
        localStorage.removeItem("product_draft");
        draftBanner.remove();
        const formEl = document.getElementById("myProductForm");
        if (formEl) formEl.reset();
      });
    }
  });

  document.getElementById("prodCancelEdit")?.addEventListener("click", () => {
    editingProductId = null;
    document.getElementById("myProductForm").reset();
    document.getElementById("prodImagePreview")?.classList.add("hidden");
    document.getElementById("prodCancelEdit").classList.add("hidden");
    document.querySelector("#productFormContainer h4").textContent = t("product.create");
  });

  // Auto-save product form draft every 5s
  const DRAFT_KEY = "product_draft";
  const draftFields = ["prodTitle", "prodDesc", "prodBrand", "prodPrice", "prodCondition", "prodStock", "prodLocation", "prodCategory"];
  const _draftInterval = setInterval(() => {
    const form = document.getElementById("productFormContainer");
    if (form && !form.classList.contains("hidden")) {
      const draft = {};
      draftFields.forEach((id) => {
        const el = document.getElementById(id);
        if (el) draft[id] = el.value;
      });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, 5000);

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
        const productPayload = {
          title: document.getElementById("prodTitle").value.trim(),
          description: document.getElementById("prodDesc").value.trim(),
          brand: document.getElementById("prodBrand").value.trim(),
          price: parseFloat(document.getElementById("prodPrice").value),
          condition: document.getElementById("prodCondition").value,
          stockQuantity: parseInt(document.getElementById("prodStock").value) || 1,
          location: document.getElementById("prodLocation").value.trim(),
          categoryId: parseInt(document.getElementById("prodCategory").value),
        };

        const product = editingProductId
          ? await api.put(`/products/${editingProductId}`, productPayload)
          : await api.post("/products", productPayload);
        const productId = product?.id || editingProductId;

        const fileInput = document.getElementById("prodImageInput");
        if (fileInput.files.length) {
          const imageFile = fileInput.files[0];
          const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
          if (!ALLOWED.includes(imageFile.type)) {
            showToast(
              t("product.invalidImageType") || "Only JPG, PNG and WebP images are allowed.",
              "error"
            );
            submit.disabled = false;
            submit.textContent = t("product.save") || "Save";
            return;
          }
          if (imageFile.size > 5 * 1024 * 1024) {
            showToast(
              t("product.imageTooLarge") || "Image must be under 5 MB.",
              "error"
            );
            submit.disabled = false;
            submit.textContent = t("product.save") || "Save";
            return;
          }
          const formData = new FormData();
          formData.append("file", fileInput.files[0]);
          document.getElementById("uploadProgress").textContent =
            t("product.uploading");
          const upload = await api.upload("/upload", formData);
          if (upload.url) {
            await api.post(`/products/${productId}/images`, {
              imageUrl: upload.url,
              isPrimary: true,
            });
          }
          document.getElementById("uploadProgress").textContent = "";
        }

        showToast(t("product.saved"), "success");
        editingProductId = null;
        localStorage.removeItem("product_draft");
        document.getElementById("myProductForm").reset();
        document.getElementById("productFormContainer").classList.add("hidden");
        renderMyProducts(content);
      } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(err.message)}</div>`;
      } finally {
        submit.disabled = false;
        submit.textContent = t("product.save");
      }
    });

  // Register route cleanup to stop draft autosave interval
  registerRouteCleanup(() => clearInterval(_draftInterval));

  // Load categories for the product form
  (async () => {
    const sel = document.getElementById("prodCategory");
    if (sel) {
      try {
        const cats = await api.get("/categories");
        const list = Array.isArray(cats) ? cats : cats.items || cats.data || [];
        sel.innerHTML = list.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
      } catch { sel.innerHTML = `<option value="">${t("common.loadFailed") || "Failed to load"}</option>`; }
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
      <div class="table-wrapper animate-on-scroll">          <table>
            <caption style="caption-side:bottom;margin-top:8px;font-size:0.78rem;color:var(--text-muted)">${t("dash.products")}</caption>
            <thead><tr><th scope="col">${t("cart.product")}</th><th scope="col">${t("cart.price")}</th><th scope="col">${t("product.status")}</th><th scope="col">${t("product.stock")}</th><th scope="col"></th></tr></thead>
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
                <button class="btn btn-ghost btn-sm edit-product-btn" data-product-id="${p.id}"><i class="fas fa-pen"></i> ${t("product.edit")}</button>
                <button class="btn btn-ghost btn-sm delete-product-btn text-danger" data-product-id="${p.id}"><i class="fas fa-trash"></i> ${t("common.delete")}</button>
                ${!p.isAuctioned && sellerRoles ? `<button class="btn btn-primary btn-sm start-auction-btn" data-product-id="${p.id}" data-product-title="${escapeHtml(p.title)}" aria-label="${t("auction.startAuction")}"><i class="fas fa-gavel"></i></button>` : ""}
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
    const productsById = new Map(products.map((p) => [String(p.id), p]));
    listEl.addEventListener("click", async (e) => {
      const btn = e.target.closest(".start-auction-btn");
      const editBtn = e.target.closest(".edit-product-btn");
      const deleteBtn = e.target.closest(".delete-product-btn");
      if (btn) {
        const productId = parseInt(btn.dataset.productId);
        const productTitle = btn.dataset.productTitle;
        showAuctionModal(productId, productTitle);
        return;
      }
      if (editBtn) {
        const p = productsById.get(editBtn.dataset.productId);
        if (!p) return;
        editingProductId = p.id;
        document.getElementById("productFormContainer").classList.remove("hidden");
        document.querySelector("#productFormContainer h4").textContent = t("product.edit");
        document.getElementById("prodTitle").value = p.title || "";
        document.getElementById("prodDesc").value = p.description || "";
        document.getElementById("prodBrand").value = p.brand || "";
        document.getElementById("prodPrice").value = p.price ?? "";
        document.getElementById("prodStock").value = p.stockQuantity ?? 1;
        document.getElementById("prodLocation").value = p.location || "";
        document.getElementById("prodCategory").value = p.categoryId || "";
        document.getElementById("prodCondition").value =
          p.condition === 0 ? "New" : p.condition === 1 ? "Used" : (p.condition || "New");
        document.getElementById("prodCancelEdit").classList.remove("hidden");
        document.getElementById("productFormContainer").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (deleteBtn) {
        const ok = await showConfirm(t("common.delete"), t("product.deleteConfirm"), {
          type: "danger",
          confirmText: t("common.delete"),
        });
        if (!ok) return;
        try {
          deleteBtn.disabled = true;
          await api.delete(`/products/${deleteBtn.dataset.productId}`);
          showToast(t("product.deleted"), "success");
          renderMyProducts(content);
        } catch (err) {
          deleteBtn.disabled = false;
          showToast(err.message, "error");
        }
      }
    });
  } catch (e) {
    document.getElementById("myProductsList").innerHTML =
      `<div class="card" style="text-align:center;padding:24px"><h3><i class="fas fa-tag"></i> ${t("dash.products")}</h3><p style="color:var(--text-muted);margin-top:8px">${t("dash.productsNotAvailable")}</p></div>`;
  }
}

function showAuctionModal(productId, productTitle) {
  const existing = document.querySelector(".modal-overlay.show");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay show";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Start Auction");

  const prevFocus = document.activeElement;
  const minEnd = new Date(Date.now() + 3600000).toISOString().slice(0, 16);

  const needsProductPicker = !productId;

  overlay.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()" style="max-width:460px">
      <h3><i class="fas fa-gavel"></i> ${t("auctions.title")}${productTitle ? ` — ${escapeHtml(productTitle)}` : ""}</h3>
      <div id="auctionModalAlert"></div>
      <form id="auctionModalForm" novalidate>
        ${needsProductPicker ? `
        <div class="form-group">
          <label class="form-label">${t("admin.products") || "Product"} *</label>
          <select class="form-select" id="auctionProductSelect" required>
            <option value="">${t("common.loading")}...</option>
          </select>
        </div>` : ""}
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
          <button type="button" class="btn btn-ghost" id="auctionModalCancel">${t("common.cancel") || "Cancel"}</button>
          <button type="submit" class="btn btn-primary" id="auctionModalSubmit"><i class="fas fa-gavel"></i> ${t("auctions.title")}</button>
        </div>
      </form>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.body.appendChild(overlay);

  if (needsProductPicker) {
    const select = document.getElementById("auctionProductSelect");
    api.get("/products", { IsAuctioned: false, PageSize: 200 }).then(data => {
      const items = data.items || data.data || [];
      select.innerHTML = '<option value="">-- ' + (t("common.select") || "Select") + ' --</option>'
        + items.map(p => '<option value="' + p.id + '">' + escapeHtml(p.title) + ' - ' + formatPrice(p.price) + '</option>').join("");
    }).catch(() => {
      select.innerHTML = '<option value="">' + (t("common.error") || "Error") + '</option>';
    });
  }

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
      const selectedId = needsProductPicker
        ? parseInt(document.getElementById("auctionProductSelect").value)
        : productId;
      if (!selectedId || isNaN(selectedId)) {
        throw new Error(t("common.required") || "Please select a product");
      }
      await api.post("/auctions", {
        productId: selectedId,
        endTime: new Date(document.getElementById("auctionEndTime").value).toISOString(),
        startingPrice: parseFloat(document.getElementById("auctionStartPrice").value),
        reservePrice: parseFloat(document.getElementById("auctionReservePrice").value) || 0,
        minimumIncrement: parseFloat(document.getElementById("auctionMinIncrement").value) || 1,
      });
      showToast(t("auctions.title") + " started!", "success");
      close();
      const content = document.getElementById("dashContent");
      if (content) renderMyProducts(content);
    } catch (err) {
      alertDiv.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(err.message)}</div>`;
    } finally {
      submit.disabled = false;
      submit.textContent = t("auctions.title");
    }
  });
}

async function renderDashAuctions(content) {
  content.innerHTML = `
    <div class="card" style="text-align:center;padding:32px">
      <h3><i class="fas fa-gavel"></i> ${t("dash.auctions")}</h3>
      <p style="color:var(--text-muted);margin-bottom:16px">${t("auction.startNew") || "Start a new auction for any product"}</p>
      <button class="btn btn-primary" id="createNewAuctionBtn"><i class="fas fa-plus"></i> ${t("auctions.title") || "Create Auction"}</button>
    </div>
  `;
  document.getElementById("createNewAuctionBtn").addEventListener("click", () => showAuctionModal());
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
      <div class="table-wrapper animate-on-scroll">          <table>
            <caption style="caption-side:bottom;margin-top:8px;font-size:0.78rem;color:var(--text-muted)">${t("dash.wishlist")}</caption>
            <thead><tr><th scope="col">${t("cart.product")}</th><th scope="col">${t("cart.price")}</th><th scope="col"></th></tr></thead>
          <tbody>${items
            .map(
              (w) => `
            <tr>
              <td><a href="#/product-detail?id=${w.productId}" style="text-decoration:none;color:var(--text);font-weight:500">${escapeHtml(w.product?.title || `Product #${w.productId}`)}</a></td>
              <td>${w.product?.price ? formatPrice(w.product.price) : "-"}</td>
              <td>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <a href="#/product-detail?id=${w.productId}"
                     class="btn btn-outline btn-sm">
                    <i class="fas fa-eye"></i> ${t("common.view") || "View"}
                  </a>
                  <button class="btn btn-primary btn-sm add-wishlist-to-cart"
                    data-product-id="${w.productId}"
                    aria-label="${t('product.addToCart')}">
                    <i class="fas fa-cart-plus"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm remove-wishlist"
                    data-id="${w.productId}" aria-label="${t('common.remove')}">
                    <i class="fas fa-trash" style="color:var(--danger)"></i>
                  </button>
                </div>
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
        const ok = await showConfirm(
          t("wishlist.confirmRemove"),
          t("wishlist.confirmRemoveDesc") || t("wishlist.confirmRemove"),
          { type: "danger", confirmText: t("common.remove") || "Remove" },
        );
        if (!ok) return;
        try {
          await api.delete(`/wishlist/${btn.dataset.id}`);
          showToast(t("product.wishlistUpdated"), "success");
          renderWishlist(content);
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });

    content.querySelectorAll(".add-wishlist-to-cart").forEach((btn) => {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner spinner"></i>`;
        try {
          await api.post("/cart/items", {
            productId: parseInt(btn.dataset.productId),
            quantity: 1,
          });
          showToast(t("product.addedToCart"), "success");
          updateCartBadge();
          btn.innerHTML = `<i class="fas fa-check"></i>`;
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-cart-plus"></i>`;
          }, 1500);
        } catch (e) {
          showToast(e.message, "error");
          btn.disabled = false;
          btn.innerHTML = `<i class="fas fa-cart-plus"></i>`;
        }
      });
    });

    observeAnimations();
  } catch (e) {
    document.getElementById("wishlistItems").innerHTML =
      `<div class="alert alert-error" role="alert">${escapeHtml(e.message)}</div>`;
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
      `<div class="alert alert-error" role="alert">${escapeHtml(e.message)}</div>`;
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
        alertDiv.innerHTML = `<div class="alert alert-success" role="alert">${t("dash.profileUpdated")}</div>`;
      } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(err.message)}</div>`;
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
        alertDiv.innerHTML = `<div class="alert alert-success" role="alert">${t("dash.passwordChanged")}</div>`;
        document.getElementById("passwordForm").reset();
      } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(err.message)}</div>`;
      } finally {
        submit.disabled = false;
        submit.textContent = t("dash.changePwBtn");
      }
    });
}
