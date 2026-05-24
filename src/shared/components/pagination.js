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
