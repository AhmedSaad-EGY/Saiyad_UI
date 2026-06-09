import { t } from '../../app/i18n.js';
import { escapeHtml, renderEmptyState } from '../../shared/utils/dom.js';
import { formatPrice, formatDate } from '../../shared/utils/format.js';
import { manualPaginationHtml, wirePagination } from '../ui/pagination.js';
import { showToast } from '../ui/toast.js';
import { showConfirm } from '../ui/modal.js';
import { showFormModal } from './render-plans.js';

let _page = 1;
const PAGE_SIZE = 20;

export async function renderReviews(container, { fetchData, onApprove, onReject } = {}) {
  container.innerHTML = `<div id="reviewPanel">
    <div class="p-4 text-center"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
  </div>`;
  const panel = document.getElementById("reviewPanel");
  try {
    const data = await fetchData(_page, PAGE_SIZE);
    const products = data.items || data.data || [];
    const total = data.totalCount || data.total || products.length;
    const pages = Math.ceil(total / PAGE_SIZE);

    if (!products.length) {
      renderEmptyState(panel, { icon: "fa-clipboard-check", title: t("admin.noPendingReviews"), desc: t("admin.productsAwaiting") });
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
      ${manualPaginationHtml({ page: _page, totalPages: pages, prefix: 'review' })}`;

    wirePagination({ container: panel, prefix: 'review', onPrev() { if (_page > 1) { _page--; renderReviews(container, { fetchData, onApprove, onReject }); } }, onNext() { if (_page < pages) { _page++; renderReviews(container, { fetchData, onApprove, onReject }); } } });

    panel.querySelectorAll(".approve-review-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        const ok = await showConfirm(t("admin.confirmApprove"), t("admin.confirmApproveDesc"), { type: "success", confirmText: t("admin.approve") });
        if (!ok) { btn.disabled = false; return; }
        try {
          await onApprove(btn.dataset.productId);
          showToast(t("admin.productApproved"), "success");
          renderReviews(container, { fetchData, onApprove, onReject });
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
        `, async function handleReject() {
          const reasonText = document.getElementById("rejectionReasonInput")?.value?.trim();
          if (!reasonText) { showToast(`${t("admin.rejectionReason")} ${t("common.required")}`, "error"); return; }
          btn.disabled = true;
          try {
            await onReject(btn.dataset.productId, reasonText);
            showToast(t("admin.productRejected"), "success");
            renderReviews(container, { fetchData, onApprove, onReject });
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
