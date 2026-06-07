import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { getUser } from '../core/auth/index.js';
import { MODERATOR_ROLES } from '../shared/constants/roles.js';
import { escapeHtml } from '../core/utils/dom.js';
import { statusClass } from '../core/utils/format.js';
import { showToast } from '../core/utils/ui.js';
import { registerRouteCleanup } from '../core/router/index.js';
import { manualPaginationHtml, wirePagination } from '../shared/components/pagination.js';
import { setPageMeta } from '../core/utils/seo.js';

export default async function renderAuctionRequestsReview(container) {
  setPageMeta(t('auctionRequestsReview.title'));
  const _u = getUser();
  if (!_u || !MODERATOR_ROLES.includes(_u.role)) { window.location.hash = '#/'; return; }

  container.innerHTML = `
    <div class="section-header">
      <h2><i class="fas fa-clipboard-list" aria-hidden="true"></i> ${t("auctionRequestsReview.title")}</h2>
    </div>
    <div id="reviewAlert"></div>
    <div id="reviewContent"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>`;

  let page = 1, totalPages = 1;
  await loadRequests();

  async function loadRequests() {
    const content = document.getElementById("reviewContent");
    content.innerHTML = `<div class="text-center py-5"><i class="fas fa-spinner spinner fa-2x" aria-hidden="true"></i><p class="text-muted mt-2">${t("common.loading")}</p></div>`;
    try {
      const res = await api.get("/auctions/requests/pending", { page, pageSize: 50 });
      const items = res?.items || res?.data || [];
      totalPages = res?.totalPages || 1;
      if (!items || items.length === 0) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-gavel" aria-hidden="true"></i><h3>${t("auctionRequestsReview.noPending")}</h3><p>${t("auctionRequestsReview.noPendingDesc")}</p></div>`;
        return;
      }
      content.innerHTML = `<div class="table-wrapper"><table class="table"><thead><tr><th>${t("auctionRequests.productTitle")}</th><th>${t("auctionRequestsReview.fisherman")}</th><th>${t("auctionRequests.fishType")}</th><th>${t("auctionRequests.quantityKg")}</th><th>${t("auctionRequests.estimatedValue")}</th><th>${t("auctionRequests.status")}</th><th>${t("auctionRequests.createdAt")}</th><th>${t("auctionRequestsReview.actions")}</th></tr></thead><tbody>${items.map(r => `<tr><td><a href="#" class="fw-semibold text-primary view-details-link" data-id="${r.id}">${escapeHtml(r.productTitle)}</a></td><td>${escapeHtml(r.fishermanName || '-')}</td><td>${escapeHtml(r.fishType)}</td><td>${r.quantityKg}</td><td>${r.estimatedValue}</td><td><span class="${statusClass(r.status)}">${t(`auctionRequests.${  r.status.toLowerCase()}`)}</span></td><td>${new Date(r.createdAt).toLocaleDateString()}</td><td><button class="btn btn-sm btn-outline btn-icon" data-action="details" data-id="${r.id}" aria-label="${t('common.view')}" title="${t('common.view')}"><i class="fas fa-eye" aria-hidden="true"></i></button> <button class="btn btn-sm btn-success" data-action="approve" data-id="${r.id}"><i class="fas fa-check" aria-hidden="true"></i> ${t("auctionRequestsReview.approve")}</button> <button class="btn btn-sm btn-danger" data-action="reject" data-id="${r.id}"><i class="fas fa-times" aria-hidden="true"></i> ${t("auctionRequestsReview.reject")}</button></td></tr>`).join("")}</tbody></table>${manualPaginationHtml({ page, totalPages, prefix: 'arp' })}</div>`;
      attachActions(items);
      wirePagination({ container: content, prefix: 'arp', onPrev: () => { if (page > 1) { page--; loadRequests(); } }, onNext: () => { if (page < totalPages) { page++; loadRequests(); } } });
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i><h3>${t("common.error")}</h3><p>${escapeHtml(err.message)}</p></div>`;
    }
  }

  function attachActions(items) {
    document.querySelectorAll("[data-action='approve']").forEach(btn => {
      btn.addEventListener("click", () => showApproveModal(btn.dataset.id));
    });
    document.querySelectorAll("[data-action='reject']").forEach(btn => {
      btn.addEventListener("click", () => showRejectModal(btn.dataset.id));
    });
    document.querySelectorAll("[data-action='details'], .view-details-link").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const request = items.find(r => String(r.id) === String(btn.dataset.id));
        if (request) showDetailDrawer(request);
      });
    });
  }

  function showApproveModal(requestId) {
    const existing = document.getElementById("approveModal");
    if (existing) existing.remove();

    const now = new Date();
    const defaultEnd = new Date(now.getTime() + 7 * 86400000);
    const fmt = (d) => `${d.getFullYear()  }-${  String(d.getMonth()+1).padStart(2,'0')  }-${  String(d.getDate()).padStart(2,'0')  }T${  String(d.getHours()).padStart(2,'0')  }:${  String(d.getMinutes()).padStart(2,'0')}`;

    const modal = document.createElement("div");
    modal.id = "approveModal";
    modal.className = "modal-overlay";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", t("auctionRequestsReview.approve"));
    modal.innerHTML = `
      <div class="modal-content mw-lg">
        <h3><i class="fas fa-check-circle" aria-hidden="true"></i> ${t("auctionRequestsReview.approve")}</h3>
        <form id="approveForm">
          <div class="form-group"><label class="form-label">${t("scheduling.endTime")} *</label><input type="datetime-local" class="form-input" id="appEndTime" value="${fmt(defaultEnd)}" required></div>
          <div class="form-group"><label class="form-label">${t("analytics.startingPrice")} *</label><input type="number" class="form-input" id="appStartingPrice" step="0.01" min="0" required placeholder="${t('common.amountPlaceholder')}"></div>
          <div class="form-group"><label class="form-label">${t("auction.reservePrice")}</label><input type="number" class="form-input" id="appReservePrice" step="0.01" min="0" placeholder="${t('common.amountPlaceholder')}"></div>
          <div class="form-group"><label class="form-label">${t("auction.minimumIncrement")}</label><input type="number" class="form-input" id="appMinIncrement" step="0.01" min="0" placeholder="${t('common.amountPlaceholder')}"></div>
          <div class="d-flex gap-2 mt-3">
            <button type="submit" class="btn btn-primary" id="confirmApproveBtn"><i class="fas fa-check" aria-hidden="true"></i> ${t("auctionRequestsReview.approve")}</button>
            <button type="button" class="btn btn-ghost" id="cancelApproveBtn">${t("common.cancel")}</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
    registerRouteCleanup(() => { if (modal.isConnected) { modal.classList.remove("show"); setTimeout(() => modal.remove(), 300); } });
    requestAnimationFrame(() => modal.classList.add("show"));

    const close = () => { modal.classList.remove("show"); setTimeout(() => modal.remove(), 300); };
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.getElementById("cancelApproveBtn").addEventListener("click", close);

    document.getElementById("approveForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const endTime = document.getElementById("appEndTime").value;
      if (!endTime) { showToast(t("scheduling.startTimeRequired"), "error"); return; }
      const body = {
        endTime: new Date(endTime).toISOString(),
        startingPrice: parseFloat(document.getElementById("appStartingPrice").value),
      };
      const reservePrice = parseFloat(document.getElementById("appReservePrice").value);
      if (!isNaN(reservePrice)) body.reservePrice = reservePrice;
      const minInc = parseFloat(document.getElementById("appMinIncrement").value);
      if (!isNaN(minInc)) body.minimumIncrement = minInc;
      const btn = document.getElementById("confirmApproveBtn");
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("auctionRequestsReview.approving")}`;
      try {
        await api.post(`/auctions/requests/${requestId}/approve`, body);
        showToast(t("auctionRequestsReview.approvedSuccess"), "success");
        close();
        loadRequests();
      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-check" aria-hidden="true"></i> ${t("auctionRequestsReview.approve")}`;
      }
    });
  }

  function showRejectModal(requestId) {
    const existing = document.getElementById("rejectModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "rejectModal";
    modal.className = "modal-overlay";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", t("auctionRequestsReview.reject"));
    modal.innerHTML = `
      <div class="modal-content mw-sm">
        <h3>${t("auctionRequestsReview.reject")}</h3>
        <div class="form-group mt-2">
          <label class="form-label">${t("auctionRequestsReview.rejectionReason")} *</label>
          <textarea class="form-textarea" id="rejectReason" rows="3" placeholder="${t("auctionRequestsReview.rejectionReasonPlaceholder")}"></textarea>
        </div>
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-danger" id="confirmRejectBtn"><i class="fas fa-times" aria-hidden="true"></i> ${t("auctionRequestsReview.reject")}</button>
          <button class="btn btn-ghost" id="cancelRejectBtn">${t("common.cancel")}</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    registerRouteCleanup(() => { if (modal.isConnected) { modal.classList.remove("show"); setTimeout(() => modal.remove(), 300); } });
    requestAnimationFrame(() => modal.classList.add("show"));

    const close = () => { modal.classList.remove("show"); setTimeout(() => modal.remove(), 300); };
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.getElementById("cancelRejectBtn").addEventListener("click", close);

    document.getElementById("confirmRejectBtn").addEventListener("click", async () => {
      const reason = document.getElementById("rejectReason").value.trim();
      if (!reason) { showToast(t("auctionRequestsReview.rejectionReasonPlaceholder"), "error"); return; }
      const btn = document.getElementById("confirmRejectBtn");
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("auctionRequestsReview.rejecting")}`;
      try {
        await api.post(`/auctions/requests/${requestId}/reject`, { reason });
        showToast(t("auctionRequestsReview.rejectedSuccess"), "success");
        close();
        loadRequests();
      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-times" aria-hidden="true"></i> ${t("auctionRequestsReview.reject")}`;
      }
    });
  }

  function showDetailDrawer(r) {
    const existing = document.getElementById("detailDrawer");
    if (existing) existing.remove();

    const drawer = document.createElement("div");
    drawer.id = "detailDrawer";
    drawer.className = "modal-overlay drawer-overlay";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", r.productTitle);
    drawer.innerHTML = `
      <div class="drawer-content">
        <div class="modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
          <h3 class="mb-0 text-truncate">${escapeHtml(r.productTitle)}</h3>
          <button class="btn btn-ghost btn-icon p-1" id="closeDrawerBtn" aria-label="${t('common.close')}"><i class="fas fa-times fa-lg" aria-hidden="true"></i></button>
        </div>
        <div class="modal-body p-4 flex-grow-1">
          ${r.imageUrl || r.productImageUrl ? `<div class="mb-4 text-center"><img src="${r.imageUrl || r.productImageUrl}" alt="${escapeHtml(r.productTitle)}" class="img-fluid rounded border"></div>` : ''}
          <div class="table-wrapper"><table class="table table-bordered">
            <tbody>
              <tr><th scope="row">${t("auctionRequestsReview.fisherman")}</th><td>${escapeHtml(r.fishermanName || '-')}</td></tr>
              <tr><th scope="row">${t("auctionRequests.fishType")}</th><td>${escapeHtml(r.fishType)}</td></tr>
              <tr><th scope="row">${t("auctionRequests.quantityKg")}</th><td><span class="fw-semibold">${r.quantityKg} ${t('common.kgUnit')}</span></td></tr>
              <tr><th scope="row">${t("auctionRequests.estimatedValue")}</th><td><span class="fw-semibold text-primary">${r.estimatedValue}</span></td></tr>
              <tr><th scope="row">${t("auctionRequests.catchLocation")}</th><td>${escapeHtml(r.catchLocation || '-')}</td></tr>
              <tr><th scope="row">${t("auctionRequests.catchDate")}</th><td>${r.catchDate ? new Date(r.catchDate).toLocaleDateString() : '-'}</td></tr>
              <tr><th scope="row">${t("auctionRequests.status")}</th><td><span class="${statusClass(r.status)}">${t(`auctionRequests.${r.status.toLowerCase()}`)}</span></td></tr>
            </tbody>
          </table></div>
          <div class="mt-3">
            <h4 class="h6 fw-bold">${t("auctionRequests.productDescription")}</h4>
            <p class="text-secondary small bg-light p-3 rounded border">${escapeHtml(r.productDescription || t("common.noDescription"))}</p>
          </div>
        </div>
        <div class="modal-footer p-3 border-top d-flex gap-2 justify-content-end bg-light">
          <button class="btn btn-success btn-sm" id="drawerApproveBtn"><i class="fas fa-check" aria-hidden="true"></i> ${t("auctionRequestsReview.approve")}</button>
          <button class="btn btn-danger btn-sm" id="drawerRejectBtn"><i class="fas fa-times" aria-hidden="true"></i> ${t("auctionRequestsReview.reject")}</button>
        </div>
      </div>`;
    document.body.appendChild(drawer);
    registerRouteCleanup(() => { if (drawer.isConnected) { const dc = drawer.querySelector(".drawer-content"); if (dc) dc.classList.remove("drawer-open"); drawer.classList.remove("show"); setTimeout(() => drawer.remove(), 300); } });
    
    requestAnimationFrame(() => {
      drawer.classList.add("show");
      drawer.querySelector(".drawer-content").classList.add("drawer-open");
    });

    const close = () => { 
      const dc = drawer.querySelector(".drawer-content");
      dc.classList.remove("drawer-open");
      drawer.classList.remove("show"); 
      setTimeout(() => drawer.remove(), 300); 
    };
    
    drawer.addEventListener("click", (e) => { 
      if (e.target === drawer) close(); 
    });
    
    document.getElementById("closeDrawerBtn").addEventListener("click", close);
    document.getElementById("drawerApproveBtn").addEventListener("click", () => { close(); showApproveModal(r.id); });
    document.getElementById("drawerRejectBtn").addEventListener("click", () => { close(); showRejectModal(r.id); });
  }
}
