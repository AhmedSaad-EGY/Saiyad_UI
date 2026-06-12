import { t } from '../../shared/utils/i18n.js';
import { escapeHtml, renderEmptyState } from '../../shared/utils/dom.js';
import { formatPrice, formatDate } from '../../shared/utils/format.js';
import { manualPaginationHtml, wirePagination } from '../ui/pagination.js';
import { showToast } from '../ui/toast.js';
import { showConfirm } from '../ui/modal.js';
import { showFormModal } from './render-plans.js';
import { fetchProductReviews, adminDeleteReview } from '../../features/admin/index.js';

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
    } else {
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
    }

    renderUserReviewsSection(panel);
  } catch (e) {
    panel.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}

async function renderUserReviewsSection(panel) {
  const sectionId = "userReviewsSection";

  let section = document.getElementById(sectionId);
  if (!section) {
    section = document.createElement("div");
    section.id = sectionId;
    panel.appendChild(section);
  }

  section.innerHTML = `
    <hr class="my-4">
    <div class="card card-sm p-3">
      <h4 class="mb-3"><i class="fas fa-star text-warning" aria-hidden="true"></i> ${t("admin.manageUserReviews")}</h4>
      <div class="d-flex gap-2 mb-3 align-items-end flex-wrap">
        <div class="form-group flex-grow-1" style="min-width:200px">
          <label class="form-label">${t("product.productId")}</label>
          <input type="number" class="form-control" id="userReviewProductId" min="1" placeholder="${t("admin.enterProductId")}">
        </div>
        <button class="btn btn-primary" id="loadUserReviewsBtn"><i class="fas fa-search" aria-hidden="true"></i> ${t("dash.view")}</button>
      </div>
      <div id="userReviewsList"></div>
    </div>`;

  document.getElementById("loadUserReviewsBtn").addEventListener("click", loadUserReviews);
  document.getElementById("userReviewProductId").addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadUserReviews();
  });
}

async function loadUserReviews() {
  const list = document.getElementById("userReviewsList");
  const productId = document.getElementById("userReviewProductId")?.value?.trim();
  if (!productId) { showToast(t("admin.enterProductId"), "error"); return; }

  list.innerHTML = `<div class="p-3 text-center"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>`;
  try {
    const data = await fetchProductReviews(productId);
    const reviews = Array.isArray(data) ? data : [];
    if (!reviews.length) {
      renderEmptyState(list, { icon: "fa-star", title: t("admin.noUserReviews") });
      return;
    }
    list.innerHTML = `
      <div class="table-wrapper">
        <table class="table">
          <thead><tr>
            <th scope="col">${t("auth.fullName")}</th>
            <th scope="col">${t("product.rating")}</th>
            <th scope="col">${t("product.comment")}</th>
            <th scope="col">${t("dash.date")}</th>
            <th scope="col"></th>
          </tr></thead>
          <tbody>
            ${reviews.map(r => `
              <tr>
                <td>${escapeHtml(r.userName || r.userFullName || `#${r.userId}`)}</td>
                <td>${"★".repeat(r.rating || 0)}${"☆".repeat(5 - (r.rating || 0))}</td>
                <td>${escapeHtml(r.comment || r.reviewText || "-")}</td>
                <td>${formatDate(r.createdAt)}</td>
                <td>
                  <button class="btn btn-sm btn-danger remove-user-review-btn"
                    data-review-id="${r.id}"
                    data-user-name="${escapeHtml(r.userName || r.userFullName || "")}">
                    <i class="fas fa-trash" aria-hidden="true"></i> ${t("admin.remove")}
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>`;

    list.querySelectorAll(".remove-user-review-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const userName = btn.dataset.userName;
        showFormModal(t("admin.removeReview"), `
          <p>${t("admin.confirmRemoveReview", { userName })}</p>
          <div class="form-group mt-3">
            <label class="form-label">${t("admin.rejectionReason")} (${t("common.optional")})</label>
            <textarea class="form-textarea form-control" id="removeReviewReason" rows="3"></textarea>
          </div>
        `, async function handleRemove() {
          const reason = document.getElementById("removeReviewReason")?.value?.trim() || null;
          btn.disabled = true;
          try {
            await adminDeleteReview(btn.dataset.reviewId, reason);
            showToast(t("admin.reviewRemovedNotified"), "success");
            loadUserReviews();
          } catch (err) {
            showToast(err.message, "error");
            btn.disabled = false;
          }
        }, { confirmText: t("admin.remove"), confirmClass: "btn-danger" });
      });
    });
  } catch (err) {
    list.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}
