import { t } from '../../shared/utils/i18n.js';

export function renderMobileOverlays() {
  return `
    <div
      x-show="searchOverlayOpen"
      x-cloak
      x-effect="if (searchOverlayOpen) $nextTick(() => document.getElementById('productMobileSearchInput')?.focus())"
      class="search-overlay open"
      id="productsSearchOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="productsSearchOverlayTitle"
      :aria-hidden="(!searchOverlayOpen).toString()"
      :inert="!searchOverlayOpen"
      @click.outside="closeSearchOverlay()">
      <h2 id="productsSearchOverlayTitle" class="sr-only">${t('products.search')}</h2>
      <div class="search-overlay-header">
        <input type="text" x-model="mobileSearch" id="productMobileSearchInput" class="form-input form-control" placeholder="${t('products.search')}" aria-label="${t('products.search')}" @keydown.enter="applyMobileSearch()">
        <button type="button" class="btn btn-ghost btn-icon" @click="closeSearchOverlay()" aria-label="${t('common.close')}"><i class="fas fa-times fa-lg" aria-hidden="true"></i></button>
      </div>
      <button type="button" class="btn btn-primary mt-3 align-self-center" @click="applyMobileSearch()"><i class="fas fa-search" aria-hidden="true"></i> ${t('common.search')}</button>
    </div>

    <div
      x-show="filterSheetOpen"
      x-cloak
      x-effect="if (filterSheetOpen) $nextTick(() => document.getElementById('productsFilterCloseBtn')?.focus())"
      x-transition:enter.duration.300ms.opacity
      class="filter-sheet-overlay show products-filter-sheet-overlay"
      id="productsFilterSheetOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="productsFilterSheetTitle"
      :aria-hidden="(!filterSheetOpen).toString()"
      :inert="!filterSheetOpen"
      @click.self="filterSheetOpen = false">
      <div class="filter-sheet products-filter-sheet">
        <div class="filter-sheet-header">
          <h3 id="productsFilterSheetTitle">${t('products.filters')}</h3>
          <button type="button" class="btn btn-ghost btn-icon" id="productsFilterCloseBtn" @click="filterSheetOpen = false" aria-label="${t('common.close')}"><i class="fas fa-times" aria-hidden="true"></i></button>
        </div>
        <div class="filter-sheet-body">
          <div class="form-group">
            <label for="productMobileCategory">${t('products.category')}</label>
            <select class="form-select" x-model="categoryId" id="productMobileCategory">
              <option value="">${t('products.allCategories')}</option>
              <template x-for="cat in categories" :key="cat.id">
                <option :value="cat.id" x-text="cat.name"></option>
              </template>
            </select>
          </div>
          <div class="form-group">
            <label for="productMobileCondition">${t('products.condition')}</label>
            <select class="form-select" x-model="condition" id="productMobileCondition">
              <option value="">${t('products.allConditions')}</option>
              <option value="New">${t('product.new')}</option>
              <option value="Used">${t('product.used')}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="productMobileSort">${t('products.sort')}</label>
            <select class="form-select" x-model="sort" id="productMobileSort">
              <option value="">${t('products.sort')}</option>
              <option value="newest">${t('products.newest')}</option>
              <option value="price-asc">${t('products.priceLowHigh')}</option>
              <option value="price-desc">${t('products.priceHighLow')}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="productMobileMinPrice">${t('products.minPrice')}</label>
            <input type="number" class="form-input form-control" x-model.number="minPrice" min="0" step="1" placeholder="${t('products.minPrice')}" id="productMobileMinPrice" />
          </div>
          <div class="form-group">
            <label for="productMobileMaxPrice">${t('products.maxPrice')}</label>
            <input type="number" class="form-input form-control" x-model.number="maxPrice" min="0" step="1" placeholder="${t('products.maxPrice')}" id="productMobileMaxPrice" />
          </div>
          <label class="filter-check mt-1" for="productMobileInStock">
            <input type="checkbox" x-model="inStock" id="productMobileInStock" />
            <span>${t('products.inStockOnly')}</span>
          </label>
        </div>
        <div class="filter-sheet-footer">
          <button type="button" class="btn btn-ghost" @click="clearFiltersAndClose()">${t('common.clearFilters')}</button>
          <button type="button" class="btn btn-primary" @click="applyMobileFilters()"><i class="fas fa-check" aria-hidden="true"></i> ${t('common.showResults')}</button>
        </div>
      </div>
    </div>`;
}
