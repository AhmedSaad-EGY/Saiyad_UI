import { t } from '../../app/i18n.js';

export function renderAuctionSearch() {
  return `
    <div class="section-header animate__animated animate__fadeInUp"><h2><i class="fas fa-gavel"></i> ${t("auctions.title")}</h2></div>
    <div class="search-bar">
      <input type="text" class="form-input form-control" x-model="search" @input.debounce.400ms="reload()" placeholder="${t("auctions.search")}" />
      <div class="desktop-filters">
        <select class="form-select" x-model="status" @change="reload()">
          <option value="Active">${t("auctions.active")}</option>
          <option value="">${t("auctions.allStatus")}</option>
          <option value="Finished">${t("auctions.finished")}</option>
          <option value="Cancelled">${t("auctions.cancelled")}</option>
        </select>
        <label class="filter-check">
          <input type="checkbox" x-model="endingSoonOnly" @change="reload()" />
          <span>${t("auction.endingSoon")}</span>
        </label>
      </div>
      <button class="btn btn-outline filter-toggle-btn" @click="filterSheetOpen = true" aria-label="${t('products.filters')}"><i class="fas fa-sliders-h"></i></button>
    </div>`;
}
