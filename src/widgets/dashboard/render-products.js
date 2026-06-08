import { t } from '../../app/i18n.js';
import { hasAnyRole } from '../../features/auth/login.js';
import { SELLER_ROLES } from '../../shared/constants/roles.js';
import { escapeHtml, renderEmptyState, observeAnimations } from '../../shared/utils/dom.js';
import { formatPrice, statusClass, tStatus, tCondition } from '../../shared/utils/format.js';
import { showToast } from '../ui/toast.js';
import { showConfirm } from '../ui/modal.js';
import { navigate } from '../../app/router.js';
import { registerRouteCleanup } from '../../app/events.js';
import { createProduct, fetchMyProducts, fetchCategories, updateProduct, deleteProduct, uploadFile, addProductImage, validateImage, fetchMySellerProfile, fetchUnauctionedProducts, createAuction, loadProductDraft, saveProductDraft, clearProductDraft } from '../../features/dashboard/index.js';

let _draftIntervalId = null;
let _productListAbortController = null;

export async function renderMyProducts(content) {
  const sellerRoles = hasAnyRole(...(SELLER_ROLES));
  let editingProductId = null;
  content.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3>
      <button class="btn btn-primary btn-sm" id="showProductForm"><i class="fas fa-plus" aria-hidden="true"></i> ${t("product.create")}</button>
    </div>
    <div id="productFilterTabs" class="d-flex gap-2 mb-3 flex-wrap">
      <button class="btn btn-sm btn-primary" data-filter="all">All</button>
      <button class="btn btn-sm btn-ghost" data-filter="PendingReview">${t("product.statusPendingReview")}</button>
      <button class="btn btn-sm btn-ghost" data-filter="Available">${t("product.statusAvailable")}</button>
      <button class="btn btn-sm btn-ghost" data-filter="Rejected">${t("product.statusRejected")}</button>
    </div>
    <div id="productFormContainer" class="d-none card card-sm mb-3 mw-xl">
      <h4 class="mb-2">${t("product.create")}</h4>
      <form id="myProductForm" novalidate>
        <div class="form-group"><label class="form-label">${t("product.title")} *</label><input type="text" class="form-input form-control" id="prodTitle" required></div>
        <div class="form-group"><label class="form-label">${t("product.description")} *</label><textarea class="form-textarea form-control" id="prodDesc" required></textarea></div>
        <div class="form-group"><label class="form-label">${t("product.brand")} *</label><input type="text" class="form-input form-control" id="prodBrand" required></div>
        <div class="form-group"><label class="form-label">${t("product.price")} *</label><input type="number" class="form-input form-control" id="prodPrice" min="0" step="0.01" required></div>
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
        <div class="skeleton-row w-100 mb-2"></div>
        <div class="skeleton-row w-100 mb-2"></div>
        <div class="skeleton-row w-100 mb-2"></div>
      </div>
    </div>`;

  document.getElementById("showProductForm").addEventListener("click", async () => {
    let hasProfile = true;
    try {
      await fetchMySellerProfile();
    } catch {
      hasProfile = false;
    }
    if (!hasProfile) {
      showToast(`${t("seller.setupRequired")} — ${t("seller.setupDesc")}`, "error");
      navigate("seller-profile");
      return;
    }
    const form = document.getElementById("productFormContainer");
    form.classList.toggle("d-none");
    if (!form.classList.contains("d-none") && !editingProductId) {
      document.querySelector("#productFormContainer h4").textContent = t("product.create");
    }
    const draft = loadProductDraft();
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
      form?.prepend(draftBanner);
      document.getElementById("discardDraftBtn")?.addEventListener("click", () => {
        clearProductDraft();
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
  _draftIntervalId = setInterval(() => {
    const form = document.getElementById("productFormContainer");
    if (form && !form.classList.contains("d-none")) {
      saveProductDraft({
        prodTitle: document.getElementById("prodTitle")?.value,
        prodDesc: document.getElementById("prodDesc")?.value,
        prodBrand: document.getElementById("prodBrand")?.value,
        prodPrice: document.getElementById("prodPrice")?.value,
        prodCondition: document.getElementById("prodCondition")?.value,
        prodStock: document.getElementById("prodStock")?.value,
        prodLocation: document.getElementById("prodLocation")?.value,
        prodCategory: document.getElementById("prodCategory")?.value,
      });
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
          ? await updateProduct(editingProductId, productPayload)
          : await createProduct(productPayload);
        const productId = product?.id || editingProductId;

        const fileInput = document.getElementById("prodImageInput");
        if (fileInput.files.length) {
          const imageFile = fileInput.files[0];
          const validationErr = validateImage(imageFile);
          if (validationErr) {
            showToast(t(validationErr), "error");
            submit.disabled = false;
            submit.textContent = t("product.save");
            return;
          }
          document.getElementById("uploadProgress").textContent = t("product.uploading");
          const imageUrl = await uploadFile(imageFile);
          if (imageUrl) {
            await addProductImage(productId, imageUrl, true);
          }
          document.getElementById("uploadProgress").textContent = "";
        }

        showToast(t("product.saved"), "success");
        editingProductId = null;
        clearProductDraft();
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
        const cats = await fetchCategories();
        const list = Array.isArray(cats) ? cats : cats.items || cats.data || [];
        sel.innerHTML = list.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
      } catch { sel.innerHTML = `<option value="">${t("common.loadFailed")}</option>`; }
    }
  })();

  try {
    const data = await fetchMyProducts(50);
    const products = data.items || data.data || data || [];
    const list = document.getElementById("myProductsList");
    if (!products.length) {
      renderEmptyState(list, { icon: "fa-tag", title: t("dash.noProducts") });
      return;
    }
    list.innerHTML = `
      <div class="table-wrapper animate-on-scroll">          <table class="table">
            <caption class="mt-2 text-muted small caption-meta">${t("dash.products")}</caption>
            <thead><tr><th scope="col" style="width:50px"></th><th scope="col">${t("cart.product")}</th><th scope="col">${t("cart.price")}</th><th scope="col">${t("product.status")}</th><th scope="col">${t("product.stock")}</th><th scope="col"></th></tr></thead>
          <tbody>${products
            .map(
              (p) => `
            <tr data-status="${p.status}">
              <td class="product-thumb-cell">${p.primaryImageUrl ? `<img src="${p.primaryImageUrl}" alt="" class="product-thumb" loading="lazy">` : `<div class="product-thumb-placeholder"><i class="fas fa-image" aria-hidden="true"></i></div>`}</td>
              <td><a href="#/product-detail?id=${p.id}" class="text-decoration-none text-reset fw-medium">${escapeHtml(p.title)}</a><span class="text-muted small d-block">${escapeHtml(p.categoryName)}${p.condition != null ? ` · ${tCondition(p.condition)}` : ""}</span></td>
              <td class="fw-semibold" data-label="${t("cart.price")}">${formatPrice(p.price)}</td>
              <td data-label="${t("product.status")}"><span class="status ${statusClass(p.status)}">${tStatus(p.status, "product")}</span></td>
              <td class="${p.stockQuantity < 5 ? 'stock-low' : ''}" data-label="${t("product.stock")}">${p.stockQuantity < 5 ? `<i class="fas fa-exclamation-triangle" aria-hidden="true"></i> ` : ""}${p.stockQuantity ?? "-"}</td>
              <td class="actions-cell">
                <div class="d-flex gap-1 flex-nowrap justify-content-end">
                  <a href="#/product-detail?id=${p.id}" class="btn btn-outline btn-sm">${t("dash.view")}</a>
                  <button class="btn btn-ghost btn-sm edit-product-btn" data-product-id="${p.id}"><i class="fas fa-pen" aria-hidden="true"></i> ${t("product.edit")}</button>
                  <button class="btn btn-ghost btn-sm delete-product-btn text-danger" data-product-id="${p.id}"><i class="fas fa-trash" aria-hidden="true"></i> ${t("common.delete")}</button>
                  ${!p.isAuctioned && sellerRoles ? `<button class="btn btn-primary btn-sm start-auction-btn" data-product-id="${p.id}" data-product-title="${escapeHtml(p.title)}" aria-label="${t("auction.startAuction")}"><i class="fas fa-gavel" aria-hidden="true"></i></button>` : ""}
                </div>
              </td>
            </tr>
          `,
            )
            .join("")}</tbody>
        </table>
      </div>
    `;
    observeAnimations();

    // Product filter tabs
    const filterTabs = document.getElementById("productFilterTabs");
    if (filterTabs) {
      filterTabs.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const filter = btn.dataset.filter;
        filterTabs.querySelectorAll("button").forEach(b => {
          b.className = b.dataset.filter === filter ? "btn btn-sm btn-primary" : "btn btn-sm btn-ghost";
        });
        document.querySelectorAll("#myProductsList tbody tr").forEach(row => {
          row.style.display = filter === "all" || row.dataset.status === filter ? "" : "none";
        });
      });
    }

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
          await deleteProduct(deleteBtn.dataset.productId);
          showToast(t("product.deleted"), "success");
          renderMyProducts(content);
        } catch (err) {
          deleteBtn.disabled = false;
          showToast(err.message, "error");
        }
      }
    }, { signal: _productListAbortController.signal });
  } catch (_e) {
    document.getElementById("myProductsList").innerHTML =
      `<div class="card text-center p-4"><h3><i class="fas fa-tag" aria-hidden="true"></i> ${t("dash.products")}</h3><p class="text-muted mt-2">${t("dash.productsNotAvailable")}</p></div>`;
  }
}

export function showAuctionModal(productId, productTitle) {
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
    <div class="modal mw-md" onclick="event.stopPropagation()">
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
    fetchUnauctionedProducts(200).then(items => {
      select.innerHTML = `<option value="">-- ${t("common.select")} --</option>${
         items.map(p => `<option value="${p.id}">${escapeHtml(p.title)} - ${formatPrice(p.price)}</option>`).join("")}`;
    }).catch(() => {
      select.innerHTML = `<option value="">${t("common.error")}</option>`;
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
      await createAuction({
        productId: selectedId,
        endTime: new Date(document.getElementById("auctionEndTime").value).toISOString(),
        startingPrice: parseFloat(document.getElementById("auctionStartPrice").value),
        reservePrice: parseFloat(document.getElementById("auctionReservePrice").value) || 0,
        minimumIncrement: parseFloat(document.getElementById("auctionMinIncrement").value) || 1,
      });
      showToast(`${t("auctions.title")} started!`, "success");
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
