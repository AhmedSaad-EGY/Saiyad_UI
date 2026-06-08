import { t } from '../../app/i18n.js';
import { escapeHtml, renderEmptyState } from '../../shared/utils/dom.js';
import { formatPrice, tStatus } from '../../shared/utils/format.js';
import { manualPaginationHtml, wirePagination } from '../ui/pagination.js';
import { showToast } from '../ui/toast.js';
import { fetchAdminProducts, updateProductStatus } from '../../features/admin/index.js';

let _page = 1;
const PAGE_SIZE = 20;
const MODERATION_STATUSES = ["Available", "Draft", "Sold", "Rejected", "Suspended"];

export async function renderAdminProducts(container) {
  container.innerHTML = `<div id="productsPanel">
    <div class="p-4 text-center"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
  </div>`;
  const panel = document.getElementById("productsPanel");
  try {
    const data = await fetchAdminProducts(_page, PAGE_SIZE);
    const products = data.items || data.data || [];
    const total = data.totalCount || data.total || products.length;
    const pages = Math.ceil(total / PAGE_SIZE);

    if (!products.length) {
      renderEmptyState(panel, { icon: "fa-box-open", title: t("products.noProducts") });
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
                    ${MODERATION_STATUSES.map((status) => `
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
      ${manualPaginationHtml({ page: _page, totalPages: pages, prefix: 'admProducts' })}`;

    wirePagination({ container: panel, prefix: 'admProducts', onPrev() { if (_page > 1) { _page--; renderAdminProducts(container); } }, onNext() { if (_page < pages) { _page++; renderAdminProducts(container); } } });

    panel.querySelectorAll(".save-product-status").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const select = panel.querySelector(`.product-status-select[data-product-id="${btn.dataset.productId}"]`);
        if (!select) return;
        btn.disabled = true;
        const oldText = btn.textContent;
        btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i>`;
        try {
          await updateProductStatus(btn.dataset.productId, select.value);
          showToast(t("admin.productStatusUpdated"), "success");
          renderAdminProducts(container);
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
