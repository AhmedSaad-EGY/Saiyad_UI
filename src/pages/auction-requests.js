import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth, hasAnyRole } from '../core/auth/index.js';
import { ROLES } from '../shared/constants/roles.js';
import { escapeHtml } from '../core/utils/dom.js';
import { statusClass } from '../core/utils/format.js';
import { showToast } from '../core/utils/ui.js';

export default async function renderAuctionRequests(container) {
  if (!(await requireAuth())) return;
  if (!hasAnyRole(ROLES.FISHERMAN)) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-gavel"></i><h3>${t("common.pageNotFound")}</h3></div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-header">
      <h2><i class="fas fa-gavel"></i> ${t("auctionRequests.title")}</h2>
      <button class="btn btn-primary" id="newRequestBtn"><i class="fas fa-plus"></i> ${t("auctionRequests.requestAuction")}</button>
    </div>
    <div id="auctionAlert"></div>
    <div id="auctionReqContent"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;

  document.getElementById("newRequestBtn").addEventListener("click", () => {
    showForm(null);
  });

  await loadRequests();

  async function loadRequests() {
    const content = document.getElementById("auctionReqContent");
    try {
      const res = await api.get("/auctions/requests/my", { page: 1, pageSize: 50 });
      const items = res?.items || res?.data || [];
      if (!items || items.length === 0) {
        content.innerHTML = `<div class="empty-state"><i class="fas fa-gavel"></i><h3>${t("auctionRequests.noRequests")}</h3><p>${t("auctionRequests.noRequestsDesc")}</p><button class="btn btn-primary" id="emptyRequestBtn"><i class="fas fa-plus"></i> ${t("auctionRequests.requestAuction")}</button></div>`;
        document.getElementById("emptyRequestBtn")?.addEventListener("click", () => showForm(null));
        return;
      }
      content.innerHTML = `<div class="table-responsive"><table class="table"><thead><tr><th>${t("auctionRequests.productTitle")}</th><th>${t("auctionRequests.fishType")}</th><th>${t("auctionRequests.quantityKg")}</th><th>${t("auctionRequests.estimatedValue")}</th><th>${t("auctionRequests.status")}</th><th>${t("auctionRequests.createdAt")}</th>${t("auctionRequests.rejectionReason") ? '<th>' + t("auctionRequests.rejectionReason") + '</th>' : ''}</tr></thead><tbody>${items.map(r => `<tr><td>${escapeHtml(r.productTitle)}</td><td>${escapeHtml(r.fishType)}</td><td>${r.quantityKg}</td><td>${r.estimatedValue}</td><td><span class="${statusClass(r.status)}">${t('auctionRequests.' + r.status.toLowerCase())}</span></td><td>${new Date(r.createdAt).toLocaleDateString()}</td><td>${r.status === 'Rejected' ? escapeHtml(r.rejectionReason || '-') : '-'}</td></tr>`).join("")}</tbody></table></div>`;
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>${t("common.error")}</h3><p>${escapeHtml(err.message)}</p></div>`;
    }
  }

  function showForm(existing) {
    const content = document.getElementById("auctionReqContent");
    content.innerHTML = `
      <div class="card" style="max-width:600px;margin-top:16px">
        <h3>${existing ? t("auctionRequests.submit") : t("auctionRequests.submit")}</h3>
        <form id="auctionReqForm" novalidate>
          <div class="form-group"><label class="form-label">${t("auctionRequests.productTitle")} *</label><input type="text" class="form-input" id="arProductTitle" value="${escapeHtml(existing?.productTitle || '')}" required></div>
          <div class="form-group"><label class="form-label">${t("auctionRequests.fishType")} *</label><input type="text" class="form-input" id="arFishType" value="${escapeHtml(existing?.fishType || '')}" required></div>
          <div class="form-group"><label class="form-label">${t("auctionRequests.quantityKg")} *</label><input type="number" step="0.01" min="0" class="form-input" id="arQuantityKg" value="${existing?.quantityKg || ''}" required></div>
          <div class="form-group"><label class="form-label">${t("auctionRequests.estimatedValue")} *</label><input type="number" step="0.01" min="0" class="form-input" id="arEstimatedValue" value="${existing?.estimatedValue || ''}" required></div>
          <div class="form-group"><label class="form-label">${t("auctionRequests.productDescription")}</label><textarea class="form-textarea" id="arDescription">${escapeHtml(existing?.productDescription || '')}</textarea></div>
          <div class="form-group"><label class="form-label">${t("auctionRequests.catchLocation")}</label><input type="text" class="form-input" id="arCatchLocation" value="${escapeHtml(existing?.catchLocation || '')}"></div>
          <div class="form-group"><label class="form-label">${t("auctionRequests.catchDate")}</label><input type="date" class="form-input" id="arCatchDate" value="${existing?.catchDate ? existing.catchDate.split('T')[0] : ''}"></div>
          <div class="form-group"><label class="form-label">${t("auctionRequests.imageUrl")}</label><input type="url" class="form-input" id="arImageUrl" value="${escapeHtml(existing?.imageUrl || '')}" placeholder="${t("auctionRequests.imageUrlHelp")}"></div>
          <p style="font-size:0.85rem;color:var(--text-muted)">${t("auctionRequests.imageUrlHelp")}</p>
          <div style="display:flex;gap:8px;margin-top:16px">
            <button type="submit" class="btn btn-primary" id="arSubmit">${t("auctionRequests.submit")}</button>
            <button type="button" class="btn btn-ghost" id="arCancel">${t("common.cancel")}</button>
          </div>
        </form>
      </div>`;

    document.getElementById("arCancel").addEventListener("click", () => loadRequests());
    document.getElementById("auctionReqForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const submit = document.getElementById("arSubmit");
      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auctionRequests.submitting")}`;
      const body = {
        productTitle: document.getElementById("arProductTitle").value.trim(),
        productDescription: document.getElementById("arDescription").value.trim(),
        estimatedValue: parseFloat(document.getElementById("arEstimatedValue").value),
        quantityKg: parseFloat(document.getElementById("arQuantityKg").value),
        fishType: document.getElementById("arFishType").value.trim(),
        catchLocation: document.getElementById("arCatchLocation").value.trim(),
        catchDate: document.getElementById("arCatchDate").value || null,
        productImageUrl: document.getElementById("arImageUrl").value.trim() || null,
      };
      try {
        await api.post("/auctions/requests", body);
        showToast(t("auctionRequests.submitted"), "success");
        loadRequests();
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        submit.disabled = false;
        submit.textContent = t("auctionRequests.submit");
      }
    });
  }
}
