import { t, getCurrentLang } from '../../app/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';

export function renderBreadcrumb(p) {
  const dir = getCurrentLang() === "ar" ? "left" : "right";
  return `<nav class="breadcrumb" aria-label="${t('common.breadcrumb')}"><a href="#/">${t("nav.home")}</a> <i class="fas fa-chevron-${dir}"></i> <a href="#/products">${t("nav.products")}</a> <i class="fas fa-chevron-${dir}"></i> <span>${escapeHtml(p.categoryName || t('common.category'))}</span> <i class="fas fa-chevron-${dir}"></i> <span>${escapeHtml(p.title)}</span></nav>`;
}
