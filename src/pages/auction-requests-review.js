import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth, hasAnyRole } from '../core/auth/index.js';
import { MODERATOR_ROLES } from '../shared/constants/roles.js';
import { escapeHtml } from '../core/utils/dom.js';
import { statusClass } from '../core/utils/format.js';
import { showToast } from '../core/utils/ui.js';

export default async function renderAuctionRequestsReview(container) {
  if (!(await requireAuth())) return;
  if (!hasAnyRole(...(MODERATOR_ROLES))) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-gavel"></i><h3>${t("common.pageNotFound")}</h3></div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-header">
      <h2><i class="fas fa-clipboard-list"></i> ${t("auctionRequestsReview.title")}</h2>
    </div>
    <div id="reviewAlert"></div>
    <div id="reviewContent"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;

  await loadRequests();

  async function loadRequests() {
    const content = document.getElementById("reviewContent");
    try {
      const res = await api.get("/auctions/requests/pending", { page: 1, pageSize: 50 });
      const items = res?.items || res?.data || [];
      if (!items || items.length === 0) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-gavel"></i><h3>${t("auctionRequestsReview.noPending")}</h3><p>${t("auctionRequestsReview.noPendingDesc")}</p></div>`;
        return;
      }
      content.innerHTML = `<div class="table-responsive"><table class="table"><thead><tr><th>${t("auctionRequests.productTitle")}</th><th>${t("auctionRequestsReview.fisherman")}</th><th>${t("auctionRequests.fishType")}</th><th>${t("auctionRequests.quantityKg")}</th><th>${t("auctionRequests.estimatedValue")}</th><th>${t("auctionRequests.status")}</th><th>${t("auctionRequests.createdAt")}</th><th>${t("auctionRequestsReview.actions")}</th></tr></thead><tbody>${items.map(r => `<tr><td>${escapeHtml(r.productTitle)}</td><td>${escapeHtml(r.fishermanName || '-')}</td><td>${escapeHtml(r.fishType)}</td><td>${r.quantityKg}</td><td>${r.estimatedValue}</td><td><span class="${statusClass(r.status)}">${t(`auctionRequests.${  r.status.toLowerCase()}`)}</span></td><td>${new Date(r.createdAt).toLocaleDateString()}</td><td><button class="btn btn-sm btn-success" data-action="approve" data-id="${r.id}"><i class="fas fa-check"></i> ${t("auctionRequestsReview.approve")}</button> <button class="btn btn-sm btn-danger" data-action="reject" data-id="${r.id}"><i class="fas fa-times"></i> ${t("auctionRequestsReview.reject")}</button></td></tr>`).join("")}</tbody></table></div>`;
      attachActions();
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>${t("common.error")}</h3><p>${escapeHtml(err.message)}</p></div>`;
    }
  }

  function attachActions() {
    document.querySelectorAll("[data-action='approve']").forEach(btn => {
      btn.addEventListener("click", () => showApproveModal(btn.dataset.id));
    });
    document.querySelectorAll("[data-action='reject']").forEach(btn => {
      btn.addEventListener("click", () => showRejectModal(btn.dataset.id));
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
      <div class="modal-content" style="max-width:480px">
        <h3><i class="fas fa-check-circle"></i> ${t("auctionRequestsReview.approve")}</h3>
        <form id="approveForm" novalidate>
          <div class="form-group"><label class="form-label">${t("scheduling.endTime")} *</label><input type="datetime-local" class="form-input form-control" id="appEndTime" value="${fmt(defaultEnd)}" required></div>
          <div class="form-group"><label class="form-label">${t("analytics.startingPrice")} *</label><input type="number" class="form-input form-control" id="appStartingPrice" step="0.01" min="0" required placeholder="0.00"></div>
          <div class="form-group"><label class="form-label">${t("auction.reservePrice")}</label><input type="number" class="form-input form-control" id="appReservePrice" step="0.01" min="0" placeholder="0.00"></div>
          <div class="form-group"><label class="form-label">${t("auction.minimumIncrement")}</label><input type="number" class="form-input form-control" id="appMinIncrement" step="0.01" min="0" placeholder="0.00"></div>
          <div class="d-flex gap-2 mt-3">
            <button type="submit" class="btn btn-primary" id="confirmApproveBtn"><i class="fas fa-check"></i> ${t("auctionRequestsReview.approve")}</button>
            <button type="button" class="btn btn-ghost" id="cancelApproveBtn">${t("common.cancel")}</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
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
      btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auctionRequestsReview.approving")}`;
      try {
        await api.post(`/auctions/requests/${requestId}/approve`, body);
        showToast(t("auctionRequestsReview.approvedSuccess"), "success");
        close();
        loadRequests();
      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-check"></i> ${t("auctionRequestsReview.approve")}`;
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
      <div class="modal-content" style="max-width:420px">
        <h3>${t("auctionRequestsReview.reject")}</h3>
        <div class="form-group mt-2">
          <label class="form-label">${t("auctionRequestsReview.rejectionReason")} *</label>
          <textarea class="form-textarea form-control" id="rejectReason" rows="3" placeholder="${t("auctionRequestsReview.rejectionReasonPlaceholder")}"></textarea>
        </div>
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-danger" id="confirmRejectBtn"><i class="fas fa-times"></i> ${t("auctionRequestsReview.reject")}</button>
          <button class="btn btn-ghost" id="cancelRejectBtn">${t("common.cancel")}</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("show"));

    const close = () => { modal.classList.remove("show"); setTimeout(() => modal.remove(), 300); };
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.getElementById("cancelRejectBtn").addEventListener("click", close);

    document.getElementById("confirmRejectBtn").addEventListener("click", async () => {
      const reason = document.getElementById("rejectReason").value.trim();
      if (!reason) { showToast(t("auctionRequestsReview.rejectionReasonPlaceholder"), "error"); return; }
      const btn = document.getElementById("confirmRejectBtn");
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auctionRequestsReview.rejecting")}`;
      try {
        await api.post(`/auctions/requests/${requestId}/reject`, { reason });
        showToast(t("auctionRequestsReview.rejectedSuccess"), "success");
        close();
        loadRequests();
      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-times"></i> ${t("auctionRequestsReview.reject")}`;
      }
    });
  }
}
