import { t } from '../../core/i18n/index.js';
import Alpine from 'alpinejs';

Alpine.data('pagination', ({ page, totalPages, onPageChange } = {}) => ({
  currentPage: page || 1,
  totalPages: totalPages || 1,
  get pages() {
    const pages = [];
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('...');
    if (end < total) pages.push(total);
    return pages;
  },
  goTo(n) {
    if (n < 1 || n > this.totalPages || n === this.currentPage) return;
    this.currentPage = n;
    onPageChange?.(n);
  },
}));

/**
 * Generate HTML for an Alpine-powered pagination bar.
 * Usage: place inside an Alpine component that has `page` and `totalPages` state and a `goToPage(n)` method.
 */
export function alpinePaginationHtml() {
  return `
    <div class="d-flex align-items-center justify-content-center gap-2 mt-4"
         x-data="pagination({ page, totalPages, onPageChange: goToPage })">
      <template x-for="p in pages" :key="p">
        <span>
          <button x-show="p !== '...'"
                  x-text="p"
                  :class="'btn btn-sm ' + (p === currentPage ? 'btn-primary' : 'btn-ghost')"
                  @click="goTo(p)"></button>
          <span x-show="p === '...'" class="px-1 text-muted">&hellip;</span>
        </span>
      </template>
    </div>
  `;
}

/**
 * Generate HTML for a manual (non-Alpine) pagination bar with prev/next buttons.
 * @param {{ page: number, totalPages: number, prefix?: string }} opts
 * @returns {string} HTML string
 */
export function manualPaginationHtml({ page, totalPages, prefix = 'pag' }) {
  const isRtl = document.documentElement.dir === 'rtl';
  const leftChevron = isRtl ? 'fa-chevron-right' : 'fa-chevron-left';
  const rightChevron = isRtl ? 'fa-chevron-left' : 'fa-chevron-right';

  return `
    <div class="pagination-bar d-flex justify-content-center align-items-center gap-2 mt-3">
      <button class="btn btn-sm btn-ghost" id="${prefix}PrevBtn" ${page <= 1 ? 'disabled' : ''}>
        <i class="fas ${leftChevron}"></i>
      </button>
      <span class="text-muted" style="font-size:0.88rem">
        ${t("common.page") || 'Page'} ${page} / ${Math.max(totalPages, 1)}
      </span>
      <button class="btn btn-sm btn-ghost" id="${prefix}NextBtn" ${page >= totalPages ? 'disabled' : ''}>
        <i class="fas ${rightChevron}"></i>
      </button>
    </div>`;
}

/**
 * Wire up prev/next event listeners for a manual pagination bar.
 * @param {{ container: HTMLElement, prefix?: string, onPrev: () => void, onNext: () => void }} opts
 */
export function wirePagination({ container, prefix = 'pag', onPrev, onNext }) {
  container.querySelector(`#${prefix}PrevBtn`)?.addEventListener('click', onPrev);
  container.querySelector(`#${prefix}NextBtn`)?.addEventListener('click', onNext);
}
