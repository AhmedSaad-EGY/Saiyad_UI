import { t } from '../app/i18n.js';
import '../features/auctions/review.js';

export default function renderAuctionRequestsReview(container) {
  container.innerHTML = `<div x-data="auctionReviewPage">
  <div class="section-header"><h2><i class="fas fa-clipboard-list" aria-hidden="true"></i> ${t("auctionRequestsReview.title")}</h2></div>

  <template x-if="loading">
    <div class="text-center py-5"><i class="fas fa-spinner spinner fa-2x" aria-hidden="true"></i><p class="text-muted mt-2">${t("common.loading")}</p></div>
  </template>

  <template x-if="!loading && error">
    <div class="empty-state"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i><h3>${t("common.error")}</h3><p x-text="error"></p></div>
  </template>

  <template x-if="!loading && !error && items.length === 0">
    <div class="empty-state"><i class="fas fa-gavel" aria-hidden="true"></i><h3>${t("auctionRequestsReview.noPending")}</h3><p>${t("auctionRequestsReview.noPendingDesc")}</p></div>
  </template>

  <div x-show="!loading && !error && items.length > 0">
    <div class="table-wrapper"><table class="table"><thead><tr><th>${t("auctionRequests.productTitle")}</th><th>${t("auctionRequestsReview.fisherman")}</th><th>${t("auctionRequests.fishType")}</th><th>${t("auctionRequests.quantityKg")}</th><th>${t("auctionRequests.estimatedValue")}</th><th>${t("auctionRequests.status")}</th><th>${t("auctionRequests.createdAt")}</th><th>${t("auctionRequestsReview.actions")}</th></tr></thead>
      <tbody><template x-for="r in items" :key="r.id"><tr>
        <td><a href="#" class="fw-semibold text-primary" @click.prevent="showDetail(r)" x-text="r.productTitle"></a></td>
        <td x-text="r.fishermanName || '-'"></td>
        <td x-text="r.fishType"></td>
        <td x-text="r.quantityKg"></td>
        <td x-text="r.estimatedValue"></td>
        <td><span :class="statusClass(r.status)" x-text="t('auctionRequests.' + (r.status || '').toLowerCase())"></span></td>
        <td x-text="new Date(r.createdAt).toLocaleDateString()"></td>
        <td>
          <button class="btn btn-sm btn-outline btn-icon" @click="showDetail(r)" aria-label="${t('common.view')}"><i class="fas fa-eye" aria-hidden="true"></i></button>
          <button class="btn btn-sm btn-success" @click="approveRequest(r.id)"><i class="fas fa-check" aria-hidden="true"></i> ${t("auctionRequestsReview.approve")}</button>
          <button class="btn btn-sm btn-danger" @click="rejectRequest(r.id)"><i class="fas fa-times" aria-hidden="true"></i> ${t("auctionRequestsReview.reject")}</button>
        </td>
      </tr></template></tbody>
    </table></div>
    <div class="pagination justify-content-center mt-3 d-flex gap-2 align-items-center" x-show="totalPages > 1">
      <button class="btn btn-sm btn-outline" :disabled="page <= 1" @click="prevPage()"><i class="fas fa-chevron-left" aria-hidden="true"></i> ${t("common.previous")}</button>
      <span class="fw-semibold">${t("common.page")} <span x-text="page"></span> ${t("common.of")} <span x-text="totalPages"></span></span>
      <button class="btn btn-sm btn-outline" :disabled="page >= totalPages" @click="nextPage()">${t("common.next")} <i class="fas fa-chevron-right" aria-hidden="true"></i></button>
    </div>
  </div>

  <div class="modal-overlay" x-effect="$el.classList.toggle('show', !!approveItemId)" @click.self="cancelApprove">
    <div class="modal-content mw-lg">
      <h3><i class="fas fa-check-circle" aria-hidden="true"></i> ${t("auctionRequestsReview.approve")}</h3>
      <form @submit.prevent="submitApprove">
        <div class="form-group"><label class="form-label">${t("scheduling.endTime")} *</label><input type="datetime-local" class="form-input" x-model="appEndTime" required></div>
        <div class="form-group"><label class="form-label">${t("analytics.startingPrice")} *</label><input type="number" class="form-input" x-model="appStartingPrice" step="0.01" min="0" required placeholder="${t('common.amountPlaceholder')}"></div>
        <div class="form-group"><label class="form-label">${t("auction.reservePrice")}</label><input type="number" class="form-input" x-model="appReservePrice" step="0.01" min="0" placeholder="${t('common.amountPlaceholder')}"></div>
        <div class="form-group"><label class="form-label">${t("auction.minimumIncrement")}</label><input type="number" class="form-input" x-model="appMinIncrement" step="0.01" min="0" placeholder="${t('common.amountPlaceholder')}"></div>
        <div class="d-flex gap-2 mt-3">
          <button type="submit" class="btn btn-primary" :disabled="approving"><template x-if="!approving"><span><i class="fas fa-check" aria-hidden="true"></i> ${t("auctionRequestsReview.approve")}</span></template><template x-if="approving"><span><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("auctionRequestsReview.approving")}</span></template></button>
          <button type="button" class="btn btn-ghost" @click="cancelApprove">${t("common.cancel")}</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modal-overlay" x-effect="$el.classList.toggle('show', !!rejectItemId)" @click.self="cancelReject">
    <div class="modal-content mw-sm">
      <h3>${t("auctionRequestsReview.reject")}</h3>
      <div class="form-group mt-2">
        <label class="form-label">${t("auctionRequestsReview.rejectionReason")} *</label>
        <textarea class="form-textarea" x-model="rejectReason" rows="3" placeholder="${t("auctionRequestsReview.rejectionReasonPlaceholder")}"></textarea>
      </div>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-danger" :disabled="rejecting" @click="submitReject"><template x-if="!rejecting"><span><i class="fas fa-times" aria-hidden="true"></i> ${t("auctionRequestsReview.reject")}</span></template><template x-if="rejecting"><span><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("auctionRequestsReview.rejecting")}</span></template></button>
        <button class="btn btn-ghost" @click="cancelReject">${t("common.cancel")}</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay drawer-overlay" x-effect="$el.classList.toggle('show', !!detailItem)" @click.self="closeDrawer">
    <div class="drawer-content" :class="{'drawer-open': !!detailItem}">
      <div class="modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
        <h3 class="mb-0 text-truncate" x-text="detailItem?.productTitle"></h3>
        <button class="btn btn-ghost btn-icon p-1" @click="closeDrawer"><i class="fas fa-times fa-lg" aria-hidden="true"></i></button>
      </div>
      <div class="modal-body p-4 flex-grow-1">
        <template x-if="detailItem?.imageUrl || detailItem?.productImageUrl">
          <div class="mb-4 text-center"><img :src="detailItem.imageUrl || detailItem.productImageUrl" :alt="detailItem.productTitle" class="img-fluid rounded border"></div>
        </template>
        <div class="table-wrapper"><table class="table table-bordered">
          <tbody>
            <tr><th scope="row">${t("auctionRequestsReview.fisherman")}</th><td x-text="detailItem?.fishermanName || '-'"></td></tr>
            <tr><th scope="row">${t("auctionRequests.fishType")}</th><td x-text="detailItem?.fishType"></td></tr>
            <tr><th scope="row">${t("auctionRequests.quantityKg")}</th><td class="fw-semibold"><span x-text="detailItem?.quantityKg"></span> ${t('common.kgUnit')}</td></tr>
            <tr><th scope="row">${t("auctionRequests.estimatedValue")}</th><td class="fw-semibold text-primary" x-text="detailItem?.estimatedValue"></td></tr>
            <tr><th scope="row">${t("auctionRequests.catchLocation")}</th><td x-text="detailItem?.catchLocation || '-'"></td></tr>
            <tr><th scope="row">${t("auctionRequests.catchDate")}</th><td x-text="detailItem?.catchDate ? new Date(detailItem.catchDate).toLocaleDateString() : '-'"></td></tr>
            <tr><th scope="row">${t("auctionRequests.status")}</th><td><span :class="statusClass(detailItem?.status)" x-text="t('auctionRequests.' + (detailItem?.status || '').toLowerCase())"></span></td></tr>
          </tbody>
        </table></div>
        <div class="mt-3">
          <h4 class="h6 fw-bold">${t("auctionRequests.productDescription")}</h4>
          <p class="text-secondary small bg-light p-3 rounded border" x-text="detailItem?.productDescription || ''"></p>
        </div>
      </div>
      <div class="modal-footer p-3 border-top d-flex gap-2 justify-content-end bg-light">
        <button class="btn btn-success btn-sm" @click="const _id = detailItem.id; closeDrawer(); $nextTick(() => approveRequest(_id))"><i class="fas fa-check" aria-hidden="true"></i> ${t("auctionRequestsReview.approve")}</button>
        <button class="btn btn-danger btn-sm" @click="const _id = detailItem.id; closeDrawer(); $nextTick(() => rejectRequest(_id))"><i class="fas fa-times" aria-hidden="true"></i> ${t("auctionRequestsReview.reject")}</button>
      </div>
    </div>
  </div>
</div>`;
}
