import { t } from '../../shared/utils/i18n.js';

export function renderMobileOverlays() {
  return `
    <div x-show="searchOverlayOpen" class="search-overlay open" @click.outside="closeSearchOverlay()">
      <div class="search-overlay-header">
        <input type="text" x-model="mobileSearch" id="productMobileSearchInput" class="form-input form-control" placeholder="${t('products.search')}" @keydown.enter="applyMobileSearch()">
        <button class="btn btn-ghost btn-icon" @click="closeSearchOverlay()" aria-label="${t('common.close')}"><i class="fas fa-times fa-lg"></i></button>
      </div>
      <button class="btn btn-primary mt-3 align-self-center" @click="applyMobileSearch()"><i class="fas fa-search"></i> ${t('common.search')}</button>
    </div>

    <div x-show="filterSheetOpen" x-transition:enter.duration.300ms.opacity class="filter-sheet-overlay show" @click.self="filterSheetOpen = false">
      <div class="filter-sheet">
        <div class="filter-sheet-header">
          <h3>${t('products.filters')}</h3>
          <button class="btn btn-ghost btn-icon" @click="filterSheetOpen = false" aria-label="${t('common.close')}"><i class="fas fa-times"></i></button>
        </div>
        <div class="filter-sheet-body">
          <div class="form-group">
            <label>${t('products.category')}</label>
            <select class="form-select" x-model="categoryId">
              <option value="">${t('products.allCategories')}</option>
              <template x-for="cat in categories" :key="cat.id">
                <option :value="cat.id" x-text="cat.name"></option>
              </template>
            </select>
          </div>
          <div class="form-group">
            <label>${t('products.condition')}</label>
            <select class="form-select" x-model="condition">
              <option value="">${t('products.allConditions')}</option>
              <option value="New">${t('product.new')}</option>
              <option value="Used">${t('product.used')}</option>
            </select>
          </div>
          <div class="form-group">
            <label>${t('products.sort')}</label>
            <select class="form-select" x-model="sort">
              <option value="">${t('products.sort')}</option>
              <option value="newest">${t('products.newest')}</option>
              <option value="price-asc">${t('products.priceLowHigh')}</option>
              <option value="price-desc">${t('products.priceHighLow')}</option>
            </select>
          </div>
          <div class="form-group">
            <label>${t('products.minPrice')}</label>
            <input type="number" class="form-input form-control" x-model.number="minPrice" min="0" step="1" placeholder="${t('products.minPrice')}" />
          </div>
          <div class="form-group">
            <label>${t('products.maxPrice')}</label>
            <input type="number" class="form-input form-control" x-model.number="maxPrice" min="0" step="1" placeholder="${t('products.maxPrice')}" />
          </div>
          <label class="filter-check mt-1">
            <input type="checkbox" x-model="inStock" />
            <span>${t('products.inStockOnly')}</span>
          </label>
        </div>
        <div class="filter-sheet-footer">
          <button class="btn btn-ghost" @click="clearFiltersAndClose()">${t('common.clearFilters')}</button>
          <button class="btn btn-primary" @click="applyMobileFilters()"><i class="fas fa-check"></i> ${t('common.showResults')}</button>
        </div>
      </div>
    </div>`;
}
