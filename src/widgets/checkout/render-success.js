import { t } from '../../app/i18n.js';

export function renderCheckoutSuccess() {
  return `
    <div class="order-success animate__animated animate__fadeIn">
      <div class="order-success-icon animate__animated animate__bounceIn"><i class="fas fa-check"></i></div>
      <h2>${t('cart.orderSuccess')}</h2>
      <p>${t('cart.orderSuccessDesc')}</p>
      <div class="d-flex justify-content-center gap-3 mt-5">
        <a :href="'#/order-detail?id=' + orderSuccess" class="btn btn-primary"><i class="fas fa-file-invoice"></i> ${t('order.track')}</a>
        <a href="#/products" class="btn btn-outline"><i class="fas fa-shopping-bag"></i> ${t('cart.continueShopping')}</a>
      </div>
    </div>`;
}
