import Alpine from 'alpinejs';
import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth, getUser, hasAnyRole, hasRole, updateNavbar, updateCartBadge, syncNotifBadgeCount } from '../core/auth/index.js';
import { registerRouteCleanup } from '../core/router/index.js';
import { $$, showLoading, renderEmptyState, escapeHtml, observeAnimations } from '../core/utils/dom.js';
import { manualPaginationHtml, wirePagination } from '../shared/components/pagination.js';
import { validateForm, getPasswordStrengthResult, clearFieldError } from '../core/utils/validation.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../core/utils/format.js';
import { showConfirm, showToast } from '../core/utils/ui.js';
import { setPageMeta } from '../core/utils/seo.js';
import { ROLES, SELLER_ROLES, ECOMMERCE_ROLES, MODERATOR_ROLES } from '../shared/constants/roles.js';
import renderAuctionRequests from './auction-requests.js';
import renderAuctionRequestsReview from './auction-requests-review.js';
import renderAuctioneerAnalytics from './auctioneer-analytics.js';

Alpine.data('dashboardPage', () => ({
  activeTab: 'overview',
  loadedTabs: new Set(),
  tourStep: 0,
  showTour: false,

  init() {
    setPageMeta(t('dash.title'), undefined, true);
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    this.activeTab = params.get('tab') || 'overview';
    this.$nextTick(() => {
      this.ensureTabLoaded(this.activeTab);
      this.checkFirstVisitTour();
    });
    if (window.innerWidth < 768) document.body.classList.add('has-bottom-bar');
  },

  checkFirstVisitTour() {
    if (!localStorage.getItem('sayiad_tour_completed')) {
      setTimeout(() => {
        this.showTour = true;
        this.tourStep = 0;
        this.highlightTourStep();
      }, 1500);
    }
  },

  highlightTourStep() {
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    const steps = this.getTourSteps();
    const currentStep = steps[this.tourStep];
    if (!currentStep) return;
    const targetEl = document.querySelector(currentStep.target);
    if (targetEl) {
      targetEl.classList.add('tour-highlight');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  getTourSteps() {
    const isMobile = window.innerWidth < 768;
    return [
      {
        target: isMobile ? '.dash-mobile-tabs' : '.dashboard-sidebar',
        title: t('tour.navTitle'),
        desc: t('tour.navDesc')
      },
      {
        target: '#dashOrders',
        title: t('tour.ordersTitle'),
        desc: t('tour.ordersDesc')
      },
      {
        target: '#dashProducts',
        title: t('tour.productsTitle'),
        desc: t('tour.productsDesc')
      }
    ];
  },

  nextTourStep() {
    const steps = this.getTourSteps();
    if (this.tourStep < steps.length - 1) {
      this.tourStep++;
      this.highlightTourStep();
    } else {
      this.endTour();
    }
  },

  prevTourStep() {
    if (this.tourStep > 0) {
      this.tourStep--;
      this.highlightTourStep();
    }
  },

  endTour() {
    this.showTour = false;
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    localStorage.setItem('sayiad_tour_completed', 'true');
    showToast(t('tour.welcomeToSayiad'), 'success');
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
    const content = document.getElementById(`dashTab_${  tabId}`);
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

  const isECommerceRole = hasAnyRole(...(ECOMMERCE_ROLES));
  const isSellerRole = hasAnyRole(...(SELLER_ROLES));

  const tabs = [
    { id: 'overview', icon: 'fa-tachometer-alt', label: t('dash.overview') },
    ...(isECommerceRole ? [{ id: 'orders', icon: 'fa-box', label: t('dash.orders') }] : []),
    ...(isSellerRole ? [{ id: 'products', icon: 'fa-tag', label: t('dash.products') }] : []),
    ...(hasRole(ROLES.AUCTIONEER) ? [{ id: 'auctions', icon: 'fa-gavel', label: t('dash.auctions') }] : []),
    ...(hasAnyRole(ROLES.FISHERMAN) ? [{ id: 'auction-requests', icon: 'fa-file-export', label: t('auctionRequests.title') }] : []),
    ...(hasAnyRole(...(MODERATOR_ROLES)) ? [{ id: 'auction-requests-review', icon: 'fa-clipboard-list', label: t('auctionRequestsReview.title') }] : []),
    ...(hasAnyRole(...(MODERATOR_ROLES)) ? [{ id: 'auctioneer-analytics', icon: 'fa-chart-bar', label: t('analytics.title') }] : []),
    ...(isECommerceRole ? [{ id: 'wishlist', icon: 'fa-heart', label: t('dash.wishlist') }] : []),
    { id: 'notifications', icon: 'fa-bell', label: t('dash.notifications') },
    { id: 'profile', icon: 'fa-user', label: t('dash.profile') },
    { id: 'password', icon: 'fa-key', label: t('dash.changePassword') },
  ];

  container.innerHTML = `
    <style>
      .tour-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(5px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tour-modal {
        max-width: 420px;
        width: 90%;
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        padding: var(--space-6);
        transform: scale(1);
        transition: all 0.3s ease;
      }
      .tour-highlight {
        position: relative;
        z-index: 99998 !important;
        box-shadow: 0 0 0 6px var(--primary), 0 8px 30px rgba(0,0,0,0.45) !important;
        transform: scale(1.02);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        background: var(--card-bg) !important;
      }
    </style>
    <div x-data="dashboardPage" x-init="init()">
      <div class="row g-3">
        <div class="col-md-3">
          <div class="dashboard-sidebar">
            ${tabs.map(tabItem => `
              <a href="#/dashboard${tabItem.id === 'overview' ? '' : `?tab=${  tabItem.id}`}"
                 class="dash-link"
                 :class="{ active: activeTab === '${tabItem.id}' }"
                 @click.prevent="switchTab('${tabItem.id}')">
                <i class="fas ${tabItem.icon}" aria-hidden="true"></i> ${tabItem.label}
              </a>
            `).join('')}
          </div>
        </div>
        <div class="col-md-9">
          <div class="dash-mobile-tabs">
            <select class="form-select" aria-label="${t('dash.tabsLabel')}" x-model="activeTab" @change="switchTab(activeTab)">
              ${tabs.map(tabItem => `<option value="${tabItem.id}">${tabItem.label}</option>`).join('')}
            </select>
          </div>
          <div class="dashboard-content">
            ${tabs.map(tabItem => `
              <div id="dashTab_${tabItem.id}" x-show="activeTab === '${tabItem.id}'" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100"></div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="dash-bottom-bar">
        ${tabs.map(tabItem => `
          <a href="#/dashboard${tabItem.id === 'overview' ? '' : `?tab=${  tabItem.id}`}"
             class="dash-bottom-link"
             :class="{ active: activeTab === '${tabItem.id}' }"
             @click.prevent="switchTab('${tabItem.id}')"
             title="${tabItem.label}">
            <i class="fas ${tabItem.icon}" aria-hidden="true"></i><span>${tabItem.label}</span>
          </a>
        `).join('')}
      </div>

      <!-- Onboarding Tour Overlay -->
      <div x-show="showTour" class="tour-backdrop" x-cloak x-transition>
        <div class="tour-modal animate-on-scroll">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="m-0 text-primary" style="display:flex;align-items:center;gap:8px">
              <i class="fas fa-compass" aria-hidden="true"></i>
              <span x-text="getTourSteps()[tourStep].title"></span>
            </h4>
            <button class="btn btn-close" style="font-size:1.5rem;background:transparent;border:none;color:var(--text-muted);cursor:pointer" @click="endTour()">&times;</button>
          </div>
          <div class="tour-body">
            <p class="text-muted" style="line-height:1.6" x-text="getTourSteps()[tourStep].desc"></p>
            <div class="d-flex justify-content-between align-items-center mt-4">
              <span class="text-muted" style="font-size:0.85rem">
                ${t('common.step')} <span x-text="tourStep + 1"></span> of <span x-text="getTourSteps().length"></span>
              </span>
              <div class="d-flex gap-2">
                <button class="btn btn-outline btn-sm" @click="prevTourStep()" :disabled="tourStep === 0">${t('common.back')}</button>
                <button class="btn btn-primary btn-sm" @click="nextTourStep()" x-text="tourStep === getTourSteps().length - 1 ? '${t('common.finish')}' : '${t('common.next')}'"></button>
              </div>
            </div>
          </div>
        </div>
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
      <div class="col-sm-6">
        <div class="card animate-on-scroll stagger-1" id="dashOrders"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
      </div>
      <div class="col-sm-6">
        <div class="card animate-on-scroll stagger-2" id="dashProducts"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
      </div>
    </div>
  `;
  observeAnimations();

  try {
    const orders = await api.get("/orders", { pageSize: 1 });
    document.getElementById("dashOrders").innerHTML =
      `<h3><i class="fas fa-box" aria-hidden="true"></i> ${t("dash.orders")}</h3><p class="fs-2 fw-bold text-primary">${orders.totalCount || orders.total || 0}</p><p class="text-muted">${t("dash.totalOrders")}</p>`;
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
      const products = await api.get("/products/my", { pageSize: 1 });
      document.getElementById("dashProducts").innerHTML =
        `<h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3><p class="fs-2 fw-bold text-primary">${products.totalCount || products.total || 0}</p><p class="text-muted">${t("dash.yourProducts")}</p>`;
    } catch (e) {
      document.getElementById("dashProducts").innerHTML =
        `<div class="card text-center p-4"><h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3><p class="text-muted mt-2">${t("dash.productsNotAvailable")}</p></div>`;
    }
  } else {
    document.getElementById("dashProducts").innerHTML =
      `<div class="card text-center p-4"><h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3><p class="text-muted mt-2">${t("dash.productsNotAvailable")}</p></div>`;
  }
}

async function renderOrders(content) {
  content.innerHTML = `<div class="card"><div class="card-header"><h3><i class="fas fa-box" aria-hidden="true"></i> ${t("dash.orders")}</h3></div><div class="card-body"><div id="ordersList"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div></div></div>`;

  let page = 1;
  const pageSize = 10;

  async function loadOrders() {
    const list = document.getElementById("ordersList");
    list.innerHTML = `
      <div class="p-2">
        <div class="skeleton-text w-100 mb-2" style="height:48px"></div>
        <div class="skeleton-text w-100 mb-2" style="height:48px"></div>
        <div class="skeleton-text w-100 mb-2" style="height:48px"></div>
        <div class="skeleton-text w-100 mb-2" style="height:48px"></div>
      </div>
    `;
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
          <table class="table">
            <caption class="mt-2 text-muted small" style="caption-side:bottom">${t("dash.orders")}</caption>
            <thead><tr><th scope="col">${t("dash.orderNum")}</th><th scope="col">${t("cart.total")}</th><th scope="col">${t("product.status")}</th><th scope="col">${t("dash.date")}</th><th scope="col"></th></tr></thead>
            <tbody>${orders
              .map(
                (o) => `
              <tr>
                <td>#${o.id}</td>
                <td class="fw-semibold">${formatPrice(o.totalPrice)}</td>
                <td><span class="status ${statusClass(o.status)}">${tStatus(o.status)}</span></td>
                <td>${formatDate(o.createdAt || o.orderDate)}</td>
                <td>
                  <a href="#/order-detail?id=${o.id}" class="btn btn-outline btn-sm">${t("dash.view")}</a>
                  ${o.status === "Pending" || o.status === "Confirmed" ? `<button class="btn btn-outline-danger btn-sm cancel-order-btn ms-1" data-order-id="${o.id}">${t("order.cancel")}</button>` : ""}
                </td>
              </tr>
            `,
              )
              .join("")}</tbody>
          </table>
        </div>
        ${manualPaginationHtml({ page, totalPages: pages, prefix: 'dashOrders' })}
      `;
      wirePagination({ container: list, prefix: 'dashOrders', onPrev() { if (page > 1) { page--; loadOrders(); } }, onNext() { if (page < pages) { page++; loadOrders(); } } });
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
          btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("order.cancelling")}`;
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

let _draftIntervalId = null;
let _productListAbortController = null;

async function renderMyProducts(content) {
  const sellerRoles = hasAnyRole(...(SELLER_ROLES));
  let editingProductId = null;
  content.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3>
      <button class="btn btn-primary btn-sm" id="showProductForm"><i class="fas fa-plus" aria-hidden="true"></i> ${t("product.create")}</button>
    </div>
    <div id="productFormContainer" class="d-none card card-sm mb-3" style="max-width:500px">
      <h4 class="mb-2">${t("product.create")}</h4>
      <form id="myProductForm" novalidate>
        <div class="form-group"><label class="form-label">${t("product.title")} *</label><input type="text" class="form-input form-control" id="prodTitle" required></div>
        <div class="form-group"><label class="form-label">${t("product.description")} *</label><textarea class="form-textarea form-control" id="prodDesc" required></textarea></div>
        <div class="form-group"><label class="form-label">${t("product.brand")} *</label><input type="text" class="form-input form-control" id="prodBrand" required></div>
        <div class="form-group"><label class="form-label">${t("product.stock")} *</label><input type="number" class="form-input form-control" id="prodStock" min="0" value="1" required></div>
        <div class="form-group"><label class="form-label">${t("product.location")} *</label><input type="text" class="form-input form-control" id="prodLocation" required></div>
        <div class="form-group"><label class="form-label">${t("product.category")} *</label><select class="form-select" id="prodCategory"><option value="">${t("common.loading")}</option></select></div>
        <div class="form-group"><label class="form-label">${t("product.condition")}</label><select class="form-select" id="prodCondition"><option value="New">${t("product.new")}</option><option value="Used">${t("product.used")}</option></select></div>
          <div class="form-group">
            <label class="form-label">${t("product.images")}</label>
            <input type="file" class="form-input form-control p-2" id="prodImageInput" accept="image/jpeg,image/png,image/webp">
            <img id="prodImagePreview" class="d-none rounded border mt-2" style="width:120px;height:120px;object-fit:cover">
            <div id="uploadProgress" class="mt-1 text-muted small"></div>
          </div>
        <div id="productAlert"></div>
        <div class="d-flex gap-2 flex-wrap">
          <button type="submit" class="btn btn-primary" id="prodSubmit">${t("product.save")}</button>
          <button type="button" class="btn btn-ghost d-none" id="prodCancelEdit">${t("common.cancel")}</button>
        </div>
      </form>
    </div>
    <div id="myProductsList">
      <div class="p-2">
        <div class="skeleton-text w-100 mb-2" style="height:48px"></div>
        <div class="skeleton-text w-100 mb-2" style="height:48px"></div>
        <div class="skeleton-text w-100 mb-2" style="height:48px"></div>
      </div>
    </div>`;

  document.getElementById("showProductForm").addEventListener("click", () => {
    const form = document.getElementById("productFormContainer");
    form.classList.toggle("d-none");
    if (!form.classList.contains("d-none") && !editingProductId) {
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
      draftBanner.className = "alert alert-info d-flex justify-content-between align-items-center mb-3";
      draftBanner.innerHTML = `
        <span><i class="fas fa-history" aria-hidden="true"></i> ${t("product.draftRestored")}</span>
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
    document.getElementById("prodImagePreview")?.classList.add("d-none");
    document.getElementById("prodCancelEdit").classList.add("d-none");
    document.querySelector("#productFormContainer h4").textContent = t("product.create");
  });

  // Auto-save product form draft every 5s
  if (_draftIntervalId) clearInterval(_draftIntervalId);
  const DRAFT_KEY = "product_draft";
  const draftFields = ["prodTitle", "prodDesc", "prodBrand", "prodPrice", "prodCondition", "prodStock", "prodLocation", "prodCategory"];
  _draftIntervalId = setInterval(() => {
    const form = document.getElementById("productFormContainer");
    if (form && !form.classList.contains("d-none")) {
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
      reader.onload = (ev) => { preview.src = ev.target.result; preview.classList.remove("d-none"); };
      reader.readAsDataURL(file);
    }
  });

  document
    .getElementById("myProductForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const submit = document.getElementById("prodSubmit");
      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("product.saving")}`;
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
              t("product.invalidImageType"),
              "error"
            );
            submit.disabled = false;
            submit.textContent = t("product.save");
            return;
          }
          if (imageFile.size > 5 * 1024 * 1024) {
            showToast(
              t("product.imageTooLarge"),
              "error"
            );
            submit.disabled = false;
            submit.textContent = t("product.save");
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
        document.getElementById("productFormContainer").classList.add("d-none");
        renderMyProducts(content);
      } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(err.message)}</div>`;
      } finally {
        submit.disabled = false;
        submit.textContent = t("product.save");
      }
    });

  // Register route cleanup to stop draft autosave interval
  registerRouteCleanup(() => {
    if (_draftIntervalId) { clearInterval(_draftIntervalId); _draftIntervalId = null; }
    if (_productListAbortController) { _productListAbortController.abort(); _productListAbortController = null; }
  });

  // Load categories for the product form
  (async () => {
    const sel = document.getElementById("prodCategory");
    if (sel) {
      try {
        const cats = await api.get("/categories");
        const list = Array.isArray(cats) ? cats : cats.items || cats.data || [];
        sel.innerHTML = list.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
      } catch { sel.innerHTML = `<option value="">${t("common.loadFailed")}</option>`; }
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
      <div class="table-wrapper animate-on-scroll">          <table class="table">
            <caption class="mt-2 text-muted small" style="caption-side:bottom">${t("dash.products")}</caption>
            <thead><tr><th scope="col">${t("cart.product")}</th><th scope="col">${t("cart.price")}</th><th scope="col">${t("product.status")}</th><th scope="col">${t("product.stock")}</th><th scope="col"></th></tr></thead>
          <tbody>${products
            .map(
              (p) => `
            <tr>
              <td><a href="#/product-detail?id=${p.id}" class="text-decoration-none text-reset fw-medium">${escapeHtml(p.title)}</a></td>
              <td class="fw-semibold">${formatPrice(p.price)}</td>
              <td><span class="status ${statusClass(p.status)}">${tStatus(p.status, "product")}</span></td>
              <td>${p.stockQuantity ?? "-"}</td>
              <td class="d-flex gap-1 flex-nowrap">
                <a href="#/product-detail?id=${p.id}" class="btn btn-outline btn-sm">${t("dash.view")}</a>
                <button class="btn btn-ghost btn-sm edit-product-btn" data-product-id="${p.id}"><i class="fas fa-pen" aria-hidden="true"></i> ${t("product.edit")}</button>
                <button class="btn btn-ghost btn-sm delete-product-btn text-danger" data-product-id="${p.id}"><i class="fas fa-trash" aria-hidden="true"></i> ${t("common.delete")}</button>
                ${!p.isAuctioned && sellerRoles ? `<button class="btn btn-primary btn-sm start-auction-btn" data-product-id="${p.id}" data-product-title="${escapeHtml(p.title)}" aria-label="${t("auction.startAuction")}"><i class="fas fa-gavel" aria-hidden="true"></i></button>` : ""}
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
    if (_productListAbortController) _productListAbortController.abort();
    _productListAbortController = new AbortController();
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
        document.getElementById("productFormContainer").classList.remove("d-none");
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
        document.getElementById("prodCancelEdit").classList.remove("d-none");
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
    }, { signal: _productListAbortController.signal });
  } catch (e) {
    document.getElementById("myProductsList").innerHTML =
      `<div class="card text-center p-4"><h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3><p class="text-muted mt-2">${t("dash.productsNotAvailable")}</p></div>`;
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
      <h3><i class="fas fa-gavel" aria-hidden="true"></i> ${t("auctions.title")}${productTitle ? ` — ${escapeHtml(productTitle)}` : ""}</h3>
      <div id="auctionModalAlert"></div>
      <form id="auctionModalForm" novalidate>
        ${needsProductPicker ? `
        <div class="form-group">
          <label class="form-label">${t("admin.products")} *</label>
          <select class="form-select" id="auctionProductSelect" required>
            <option value="">${t("common.loading")}...</option>
          </select>
        </div>` : ""}
        <div class="form-group">
          <label class="form-label">${t("auction.end")} *</label>
          <input type="datetime-local" class="form-input form-control" id="auctionEndTime" min="${minEnd}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t("auction.startingPrice")} *</label>
          <input type="number" class="form-input form-control" id="auctionStartPrice" min="0.01" step="0.01" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t("auction.reservePrice")}</label>
          <input type="number" class="form-input form-control" id="auctionReservePrice" min="0" step="0.01" value="0">
        </div>
        <div class="form-group">
          <label class="form-label">${t("auction.minIncrement")} *</label>
          <input type="number" class="form-input form-control" id="auctionMinIncrement" min="0.01" step="0.01" value="1" required>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="auctionModalCancel">${t("common.cancel")}</button>
          <button type="submit" class="btn btn-primary" id="auctionModalSubmit"><i class="fas fa-gavel" aria-hidden="true"></i> ${t("auctions.title")}</button>
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
      select.innerHTML = `<option value="">-- ${  t("common.select")  } --</option>${
         items.map(p => `<option value="${  p.id  }">${  escapeHtml(p.title)  } - ${  formatPrice(p.price)  }</option>`).join("")}`;
    }).catch(() => {
      select.innerHTML = `<option value="">${  t("common.error")  }</option>`;
    });
  }

  function close() {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
  }
  function onKey(e) { if (e.key === "Escape") close(); }
  document.addEventListener("keydown", onKey);
  registerRouteCleanup(() => { document.removeEventListener("keydown", onKey); if (overlay?.isConnected) overlay.remove(); });

  document.getElementById("auctionModalCancel").addEventListener("click", close);

  document.getElementById("auctionModalForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submit = document.getElementById("auctionModalSubmit");
    const alertDiv = document.getElementById("auctionModalAlert");
    alertDiv.innerHTML = "";
    submit.disabled = true;
    submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("auction.placingBid")}`;

    try {
      const selectedId = needsProductPicker
        ? parseInt(document.getElementById("auctionProductSelect").value)
        : productId;
      if (!selectedId || isNaN(selectedId)) {
        throw new Error(t("common.required"));
      }
      await api.post("/auctions", {
        productId: selectedId,
        endTime: new Date(document.getElementById("auctionEndTime").value).toISOString(),
        startingPrice: parseFloat(document.getElementById("auctionStartPrice").value),
        reservePrice: parseFloat(document.getElementById("auctionReservePrice").value) || 0,
        minimumIncrement: parseFloat(document.getElementById("auctionMinIncrement").value) || 1,
      });
      showToast(`${t("auctions.title")  } started!`, "success");
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
    <div class="card text-center p-4">
      <h3><i class="fas fa-gavel" aria-hidden="true"></i> ${t("dash.auctions")}</h3>
      <p class="text-muted mb-3">${t("auction.startNew")}</p>
      <button class="btn btn-primary" id="createNewAuctionBtn"><i class="fas fa-plus" aria-hidden="true"></i> ${t("auctions.title")}</button>
    </div>
  `;
  document.getElementById("createNewAuctionBtn").addEventListener("click", () => showAuctionModal());
}

async function renderWishlist(content) {
  content.innerHTML = `<div class="card"><div class="card-header"><h3><i class="fas fa-heart" aria-hidden="true"></i> ${t("dash.wishlist")}</h3></div><div class="card-body"><div id="wishlistItems"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div></div></div>`;
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
      <div class="table-wrapper animate-on-scroll">          <table class="table">
            <caption class="mt-2 text-muted small" style="caption-side:bottom">${t("dash.wishlist")}</caption>
            <thead><tr><th scope="col">${t("cart.product")}</th><th scope="col">${t("cart.price")}</th><th scope="col"></th></tr></thead>
          <tbody>${items
            .map(
              (w) => `
            <tr>
              <td><a href="#/product-detail?id=${w.productId}" class="text-decoration-none text-reset fw-medium">${escapeHtml(w.product?.title || `Product #${w.productId}`)}</a></td>
              <td>${w.product?.price ? formatPrice(w.product.price) : "-"}</td>
              <td>
                <div class="d-flex gap-2 flex-wrap">
                  <a href="#/product-detail?id=${w.productId}"
                     class="btn btn-outline btn-sm">
                    <i class="fas fa-eye" aria-hidden="true"></i> ${t("common.view")}
                  </a>
                  <button class="btn btn-primary btn-sm add-wishlist-to-cart"
                    data-product-id="${w.productId}"
                    aria-label="${t('product.addToCart')}">
                    <i class="fas fa-cart-plus" aria-hidden="true"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm remove-wishlist"
                    data-id="${w.productId}" aria-label="${t('common.remove')}">
                    <i class="fas fa-trash text-danger" aria-hidden="true"></i>
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
          t("wishlist.confirmRemoveDesc"),
          { type: "danger", confirmText: t("common.remove") },
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
        btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i>`;
        try {
          await api.post("/cart/items", {
            productId: parseInt(btn.dataset.productId),
            quantity: 1,
          });
          showToast(t("product.addedToCart"), "success");
          updateCartBadge();
          btn.innerHTML = `<i class="fas fa-check" aria-hidden="true"></i>`;
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-cart-plus" aria-hidden="true"></i>`;
          }, 1500);
        } catch (e) {
          showToast(e.message, "error");
          btn.disabled = false;
          btn.innerHTML = `<i class="fas fa-cart-plus" aria-hidden="true"></i>`;
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
  content.innerHTML = `<div class="card animate-on-scroll"><div class="card-header"><h3><i class="fas fa-bell" aria-hidden="true"></i> ${t("dash.notifications")}</h3></div><div class="card-body"><div class="d-flex gap-2 mb-2"><button class="btn btn-sm btn-ghost" id="markAllRead"><i class="fas fa-check-double" aria-hidden="true"></i> ${t("notif.markAllRead")}</button></div><div id="notifList"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div></div></div>`;
  try {
    const data = await api.get("/notifications", { pageSize: 50 });
    const notifs = normalizeNotifications(data);
    syncNotifBadgeCount(countUnreadNotifications(notifs));
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
      <div class="notif-item ${n.isRead ? "" : "unread"}" data-id="${escapeHtml(n.id)}">
        <div class="flex-grow-1">
          <strong>${escapeHtml(n.title)}</strong>
          <p class="text-muted small">${escapeHtml(n.message)}</p>
          <small class="text-muted">${formatDate(n.createdAt)}</small>
        </div>
        ${!n.isRead ? `<button class="btn btn-sm btn-ghost mark-read" aria-label="${t('notif.markAsRead')}" data-id="${n.id}"><i class="fas fa-check" aria-hidden="true"></i></button>` : ""}
      </div>
    `,
      )
      .join("");

    $$(".mark-read").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await markNotificationRead(btn.dataset.id);
          btn.closest(".notif-item").classList.remove("unread");
          btn.remove();
          syncNotifBadgeCount(document.querySelectorAll("#notifList .notif-item.unread").length);
        } catch { /* notification UI unaffected */ }
      });
    });

    document.getElementById("markAllRead")?.addEventListener("click", async () => {
      try {
        await markAllNotificationsRead();
        document.querySelectorAll("#notifList .notif-item").forEach((el) => el.classList.remove("unread"));
        document.querySelectorAll("#notifList .mark-read").forEach((el) => el.remove());
        syncNotifBadgeCount(0);
        showToast(t("notif.markedAllRead"), "success");
      } catch { /* already toasted success */ }
    });
    observeAnimations();
  } catch (e) {
    document.getElementById("notifList").innerHTML =
      `<div class="alert alert-error" role="alert">${escapeHtml(e.message)}</div>`;
  }
}

function normalizeNotifications(data) {
  const source =
    Array.isArray(data) ? data
      : Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.data) ? data.data
          : Array.isArray(data?.data?.items) ? data.data.items
            : Array.isArray(data?.data?.data) ? data.data.data
              : Array.isArray(data?.notifications) ? data.notifications
                : Array.isArray(data?.results) ? data.results
                  : Array.isArray(data?.value) ? data.value
                    : [];

  return source.map((n) => {
    const id = n.id ?? n.notificationId ?? n.notificationID ?? "";
    const isRead = Boolean(n.isRead ?? n.read ?? n.readAt ?? n.readOn ?? n.dateRead);
    const title = n.title ?? n.subject ?? n.type ?? t("notif.title");
    const message = n.message ?? n.body ?? n.content ?? n.description ?? "";
    const createdAt = n.createdAt ?? n.createdOn ?? n.createdDate ?? n.dateCreated ?? n.timestamp ?? n.sentAt;
    return { id, isRead, title, message, createdAt };
  });
}

function countUnreadNotifications(notifs) {
  return notifs.filter((n) => !n.isRead).length;
}

async function markNotificationRead(id) {
  try {
    await api.put(`/notifications/${id}/read`);
  } catch {
    await api.post(`/notifications/${id}/read`, {});
  }
}

async function markAllNotificationsRead() {
  try {
    await api.put("/notifications/read-all");
  } catch {
    await api.post("/notifications/read-all", {});
  }
}

function renderProfile(content, user) {
  content.innerHTML = `
    <div class="card animate-on-scroll">
      <div class="card-header">
        <h3><i class="fas fa-user" aria-hidden="true"></i> ${t("dash.profile")}</h3>
      </div>
      <div class="card-body">
      <form id="profileForm">
        <div class="form-group">
          <label class="form-label" for="profileName">${t("auth.fullName")}</label>
          <input type="text" class="form-input form-control" id="profileName" name="name" value="${escapeHtml(user?.fullName || "")}" required autocomplete="name">
        </div>
        <div class="form-group">
          <label class="form-label" for="profileEmail">${t("auth.email")}</label>
          <input type="email" class="form-input form-control" id="profileEmail" name="email" value="${escapeHtml(user?.email || "")}" required autocomplete="email">
        </div>
        <div class="form-group">
          <label class="form-label" for="profilePhone">${t("auth.phone")}</label>
          <input type="tel" class="form-input form-control" id="profilePhone" name="phone" value="${escapeHtml(user?.phone || "")}" autocomplete="tel">
        </div>
        <div id="profileAlert"></div>
      <button type="submit" class="btn btn-primary" id="profileSubmit">${t("dash.updateProfile")}</button>
    </form>
    </div>
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
          messages: { required: `${t("auth.fullName")  } is required.` },
        },
        { element: emailInput, required: true, email: true },
        { element: phoneInput, phone: true },
      ]);

      if (!valid) return;

      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("dash.updating")}`;
      alertDiv.innerHTML = "";

      try {
        const data = await api.put("/users/profile", {
          fullName: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
        });
        localStorage.setItem("user", JSON.stringify(data.user || data));
        updateNavbar();
        showToast(t("dash.profileUpdated"), "success");
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        submit.disabled = false;
        submit.textContent = t("dash.updateProfile");
      }
    });
}

function renderChangePassword(content) {
  content.innerHTML = `
    <div class="card animate-on-scroll">
      <div class="card-header">
        <h3><i class="fas fa-key" aria-hidden="true"></i> ${t("dash.changePassword")}</h3>
      </div>
      <div class="card-body">
      <form id="passwordForm">
        <div class="form-group">
          <label class="form-label" for="oldPassword">${t("dash.currentPassword")}</label>
          <input type="password" class="form-input form-control" id="oldPassword" name="oldPassword" required autocomplete="current-password">
        </div>
        <div class="form-group">
          <label class="form-label" for="newPassword">${t("dash.newPassword")}</label>
          <div class="password-wrapper">
            <input type="password" class="form-input form-control" id="newPassword" name="newPassword" required minlength="6" autocomplete="new-password">
          </div>
          <div class="password-strength" id="dashStrength"><div class="password-strength-bar" id="dashStrengthBar"></div></div>
          <div class="password-strength-text" id="dashStrengthText"></div>
        </div>
        <div id="passwordAlert"></div>      <button type="submit" class="btn btn-primary" id="passwordSubmit">${t("dash.changePwBtn")}</button>
    </form>
    </div>
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
    const result = getPasswordStrengthResult(pw);
    bar.className = `password-strength-bar ${  result.cls}`;
    txt.textContent = t(result.label);
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
      submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("dash.changing")}`;
      alertDiv.innerHTML = "";

      try {
        await api.post("/auth/change-password", {
          currentPassword: oldInput.value,
          newPassword: newInput.value,
        });
        showToast(t("dash.passwordChanged"), "success");
        document.getElementById("passwordForm").reset();
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        submit.disabled = false;
        submit.textContent = t("dash.changePwBtn");
      }
    });
}
