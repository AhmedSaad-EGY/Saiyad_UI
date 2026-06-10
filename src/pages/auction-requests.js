import { t } from '../shared/utils/i18n.js';
import '../features/auctions/requests.js';

export default async function renderAuctionRequests(container) {
  container.innerHTML = `<div x-data="auctionRequestsPage">
    <template x-if="loading && view === 'list'">
      <div class="text-center p-4"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
    </template>

    <template x-if="!loading && error && view === 'list'">
      <div class="empty-state"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i><h3>${t("common.error")}</h3><p x-text="error"></p></div>
    </template>

    <div x-show="view === 'list' && !loading && !error">
      <div class="section-header">
        <h2><i class="fas fa-gavel" aria-hidden="true"></i> ${t("auctionRequests.title")}</h2>
        <button class="btn btn-primary" @click="showForm(null)"><i class="fas fa-plus" aria-hidden="true"></i> ${t("auctionRequests.requestAuction")}</button>
      </div>

      <template x-if="items.length === 0">
        <div class="empty-state"><i class="fas fa-gavel" aria-hidden="true"></i><h3>${t("auctionRequests.noRequests")}</h3><p>${t("auctionRequests.noRequestsDesc")}</p><button class="btn btn-primary" @click="showForm(null)"><i class="fas fa-plus" aria-hidden="true"></i> ${t("auctionRequests.requestAuction")}</button></div>
      </template>

      <template x-if="items.length > 0">
        <div class="table-wrapper"><table class="table"><thead><tr><th>${t("auctionRequests.productTitle")}</th><th>${t("auctionRequests.fishType")}</th><th>${t("auctionRequests.quantityKg")}</th><th>${t("auctionRequests.estimatedValue")}</th><th>${t("auctionRequests.status")}</th><th>${t("auctionRequests.createdAt")}</th><th x-show="true">${t("auctionRequests.rejectionReason") || ''}</th></tr></thead>
          <tbody><template x-for="r in items" :key="r.id"><tr>
            <td x-text="r.productTitle"></td><td x-text="r.fishType"></td><td x-text="r.quantityKg"></td><td x-text="r.estimatedValue"></td>
            <td><span :class="'status status-' + r.status.toLowerCase()" x-text="r.status"></span></td>
            <td x-text="formatDate(r.createdAt)"></td>
            <td x-text="r.status === 'Rejected' ? (r.rejectionReason || '-') : '-'"></td>
          </tr></template></tbody>
        </table></div>
      </template>
    </div>

    <div x-show="view === 'form'" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
      <div class="card" style="max-width:600px;margin-top:16px">
        <div class="card-header"><h3 class="mb-0">${t("auctionRequests.submit")}</h3></div>
        <div class="card-body">
          <form id="auctionReqForm" @submit="submitRequest" novalidate>
            <div class="form-group"><label class="form-label" for="arProductTitle">${t("auctionRequests.productTitle")} *</label><input type="text" class="form-input form-control" id="arProductTitle" :value="existing?.productTitle || ''" required></div>
            <div class="form-group"><label class="form-label" for="arFishType">${t("auctionRequests.fishType")} *</label><input type="text" class="form-input form-control" id="arFishType" :value="existing?.fishType || ''" required></div>
            <div class="form-group"><label class="form-label" for="arQuantityKg">${t("auctionRequests.quantityKg")} *</label><input type="number" step="0.01" min="0.01" class="form-input form-control" id="arQuantityKg" :value="existing?.quantityKg || ''" required></div>
            <div class="form-group"><label class="form-label" for="arEstimatedValue">${t("auctionRequests.estimatedValue")} *</label><input type="number" step="0.01" min="0.01" class="form-input form-control" id="arEstimatedValue" :value="existing?.estimatedValue || ''" required></div>
            <div class="form-group"><label class="form-label" for="arDescription">${t("auctionRequests.productDescription")}</label><textarea class="form-textarea form-control" id="arDescription"></textarea></div>
            <div class="form-group"><label class="form-label" for="arCatchLocation">${t("auctionRequests.catchLocation")}</label><input type="text" class="form-input form-control" id="arCatchLocation" :value="existing?.catchLocation || ''"></div>
            <div class="form-group"><label class="form-label" for="arCatchDate">${t("auctionRequests.catchDate")}</label><input type="date" class="form-input form-control" id="arCatchDate" :value="existing?.catchDate ? existing.catchDate.split('T')[0] : ''"></div>
            <div class="form-group"><label class="form-label" for="arImageUrl">${t("auctionRequests.imageUrl")}</label><input type="url" class="form-input form-control" id="arImageUrl" :value="existing?.imageUrl || ''" placeholder="${t("auctionRequests.imageUrlHelp")}"></div>
            <p style="font-size:0.85rem;color:var(--text-muted)">${t("auctionRequests.imageUrlHelp")}</p>
            <div class="d-flex gap-2 mt-3">
              <button type="submit" class="btn btn-primary" id="arSubmit">${t("auctionRequests.submit")}</button>
              <button type="button" class="btn btn-ghost" @click="cancelForm()">${t("common.cancel")}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}
