import { t } from '../../app/i18n.js';

export function renderMobileFilter() {
  return `
    <div x-show="filterSheetOpen" x-transition:enter.duration.300ms.opacity class="filter-sheet-overlay show" @click.self="filterSheetOpen = false">
      <div class="filter-sheet">
        <div class="filter-sheet-header">
          <h3>${t('products.filters')}</h3>
          <button class="btn btn-ghost btn-icon" @click="filterSheetOpen = false" aria-label="${t('common.close')}"><i class="fas fa-times"></i></button>
        </div>
        <div class="filter-sheet-body">
          <div class="form-group">
            <label>${t("auctions.status")}</label>
            <select class="form-select" x-model="status">
              <option value="Active">${t("auctions.active")}</option>
              <option value="">${t("auctions.allStatus")}</option>
              <option value="Finished">${t("auctions.finished")}</option>
              <option value="Cancelled">${t("auctions.cancelled")}</option>
            </select>
          </div>
          <label class="filter-check mt-2">
            <input type="checkbox" x-model="endingSoonOnly" />
          <span>${t("auction.endingSoon")}</span>
          </label>
        </div>
        <div class="filter-sheet-footer">
          <button class="btn btn-ghost" @click="resetFilters(); filterSheetOpen = false">${t('common.clearFilters')}</button>
          <button class="btn btn-primary" @click="applyMobileFilters()"><i class="fas fa-check"></i> ${t('common.showResults')}</button>
        </div>
      </div>
    </div>`;
}
