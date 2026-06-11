import { t } from '../../shared/utils/i18n.js';

export function renderSearchBar() {
  return `
    <div class="section-header animate__animated animate__fadeInUp"><h2><i class="fas fa-store"></i> ${t('products.title')}</h2></div>
    <div class="search-bar">
      <input type="text" class="form-input form-control" x-model="search" @input.debounce.400ms="reload()" placeholder="${t('products.search')}" />
      <div class="desktop-filters">
        <select class="form-select" x-model="categoryId" @change="reload()">
          <option value="">${t('products.allCategories')}</option>
          <template x-for="cat in categories" :key="cat.id">
            <option :value="cat.id" x-text="cat.name"></option>
          </template>
        </select>
        <select class="form-select" x-model="condition" @change="reload()">
          <option value="">${t('products.allConditions')}</option>
          <option value="New">${t('product.new')}</option>
          <option value="Used">${t('product.used')}</option>
        </select>
        <select class="form-select" x-model="sort" @change="reload()">
          <option value="">${t('products.sort')}</option>
          <option value="newest">${t('products.newest')}</option>
          <option value="price-asc">${t('products.priceLowHigh')}</option>
          <option value="price-desc">${t('products.priceHighLow')}</option>
        </select>
        <input type="number" class="form-input form-control" x-model.number="minPrice" @input.debounce.500ms="reload()" min="0" step="1" placeholder="${t('products.minPrice')}" />
        <input type="number" class="form-input form-control" x-model.number="maxPrice" @input.debounce.500ms="reload()" min="0" step="1" placeholder="${t('products.maxPrice')}" />
        <label class="filter-check">
          <input type="checkbox" x-model="inStock" @change="reload()" />
          <span>${t('products.inStockOnly')}</span>
        </label>
        <a href="#/products" class="btn btn-ghost btn-sm" @click.prevent="resetFilters()">${t('common.clearFilters')}</a>
      </div>
      <div class="d-flex gap-2 align-items-center">
        <button class="btn btn-outline btn-icon search-toggle-btn" @click="openSearchOverlay()" aria-label="${t('common.search')}"><i class="fas fa-search"></i></button>
        <button class="btn btn-outline btn-icon filter-toggle-btn" @click="filterSheetOpen = true" aria-label="${t('products.filters')}"><i class="fas fa-sliders-h"></i></button>
        <div class="d-none d-md-flex btn-group rounded-pill overflow-hidden border">
          <button class="btn btn-sm px-3" :class="!isListView ? 'btn-primary' : 'btn-ghost'" @click="isListView = false" aria-label="${t('products.gridView')}" title="${t('products.gridView')}"><i class="fas fa-th-large"></i></button>
          <button class="btn btn-sm px-3" :class="isListView ? 'btn-primary' : 'btn-ghost'" @click="isListView = true" aria-label="${t('products.listView')}" title="${t('products.listView')}"><i class="fas fa-list"></i></button>
        </div>
      </div>
    </div>

    <div x-show="hasActiveFilters()" class="filter-chips animate__animated animate__fadeIn" x-cloak>
      <template x-if="search">
        <span class="filter-chip" @click="removeFilter('search')">
          <i class="fas fa-search"></i> <span x-text="'&quot;' + search + '&quot;'"></span> <i class="fas fa-times"></i>
        </span>
      </template>
      <template x-if="categoryId">
        <span class="filter-chip" @click="removeFilter('categoryId')">
          <i class="fas fa-tag"></i> <span x-text="categories.find(c => str(c.id) === str(categoryId))?.name || $t('common.category')"></span> <i class="fas fa-times"></i>
        </span>
      </template>
      <template x-if="condition">
        <span class="filter-chip" @click="removeFilter('condition')">
          <i class="fas fa-info-circle"></i> <span x-text="condition"></span> <i class="fas fa-times"></i>
        </span>
      </template>
      <template x-if="minPrice">
        <span class="filter-chip" @click="removeFilter('minPrice')">
          <span x-text="'>= ' + formatPrice(minPrice)"></span> <i class="fas fa-times"></i>
        </span>
      </template>
      <template x-if="maxPrice">
        <span class="filter-chip" @click="removeFilter('maxPrice')">
          <span x-text="'<= ' + formatPrice(maxPrice)"></span> <i class="fas fa-times"></i>
        </span>
      </template>
      <template x-if="inStock">
        <span class="filter-chip" @click="removeFilter('inStock')">
          <i class="fas fa-check-circle"></i> ${t('products.inStockOnly')} <i class="fas fa-times"></i>
        </span>
      </template>
      <button class="btn btn-ghost btn-sm text-primary py-0" @click="resetFilters()">${t('common.clearFilters')}</button>
    </div>

    <div x-show="!loading && products.length" class="mb-3 d-flex justify-content-between align-items-center" x-cloak>
      <span class="text-muted small" x-text="$t('products.showingCount', { count: products.length, total: totalItems })"></span>
    </div>`;
}
