import { t } from '../../shared/utils/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';

export function renderBreadcrumb(p) {
  return `<nav class="breadcrumb" aria-label="${t('common.breadcrumb')}"><a href="#/">${t("nav.home")}</a> <i class="fas fa-chevron-right breadcrumb-chevron" aria-hidden="true"></i> <a href="#/products">${t("nav.products")}</a> <i class="fas fa-chevron-right breadcrumb-chevron" aria-hidden="true"></i> <span>${escapeHtml(p.categoryName || t('common.category'))}</span> <i class="fas fa-chevron-right breadcrumb-chevron" aria-hidden="true"></i> <span>${escapeHtml(p.title)}</span></nav>`;
}
