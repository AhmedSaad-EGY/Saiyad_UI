import { t } from '../../shared/utils/i18n.js';

export function renderCheckoutLoading() {
  return `
    <div class="skeleton-shimmer py-4" style="padding-top:0;padding-bottom:0">
      <div class="skeleton skeleton-title" style="width:30%"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width:60%"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width:40%"></div>
    </div>`;
}

export function renderCheckoutEmpty() {
  return `
    <div>
      <div class="section-header animate__animated animate__fadeInUp"><h2><i class="fas fa-credit-card"></i> ${t('cart.checkout')}</h2></div>
      <div class="empty-state">
        <i class="fas fa-shopping-cart text-muted mb-4 fs-hero"></i>
        <h3>${t('cart.empty')}</h3>
        <p class="text-muted mb-4">${t('cart.emptyDesc')}</p>
        <a href="#/products" class="btn btn-primary"><i class="fas fa-store"></i> ${t('cart.browseProducts')}</a>
      </div>
    </div>`;
}
