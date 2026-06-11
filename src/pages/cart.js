import { t } from '../shared/utils/i18n.js';
import { requireAuth } from '../features/auth/login.js';
import { registerRouteCleanup } from '../app/router.js';
import { getCartSwipeCleanup } from '../features/cart/index.js';

export default async function renderCart(container) {
  if (!(await requireAuth())) return;

  registerRouteCleanup(() => {
    document.body.classList.remove('has-floating-bar');
    const cleanup = getCartSwipeCleanup();
    if (cleanup) cleanup();
  });
  document.body.classList.add('has-floating-bar');

  container.innerHTML = `
    <div x-data="cartPage">
      <template x-if="loading">
        <div><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t('common.loading')}</div>
      </template>
      <div x-show="showEmptyCart" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div>
          <div class="section-header animate__animated animate__fadeInUp"><h2><i class="fas fa-shopping-cart" aria-hidden="true"></i> ${t('cart.title')}</h2></div>
          <div class="empty-state">
            <i class="fas fa-shopping-cart mb-3 text-muted fs-hero" aria-hidden="true"></i>
            <h3>${t('cart.empty')}</h3>
            <p class="text-muted mb-4">${t('cart.emptyDesc')}</p>
            <a href="#/products" class="btn btn-primary"><i class="fas fa-store" aria-hidden="true"></i> ${t('cart.browseProducts')}</a>
          </div>
        </div>
      </div>
      <div x-show="showErrorCart" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div>
          <div class="section-header animate__animated animate__fadeInUp"><h2><i class="fas fa-shopping-cart" aria-hidden="true"></i> ${t('cart.title')}</h2></div>
          <div class="empty-state">
            <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <h3 x-text="error"></h3>
            <button class="btn btn-primary" @click="init()">${t('common.retry')}</button>
          </div>
        </div>
      </div>
      <div x-show="showCartContent" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div>
          <div class="section-header animate__animated animate__fadeInUp">
            <h2><i class="fas fa-shopping-cart" aria-hidden="true"></i> ${t('cart.title')}</h2>
            <button class="btn btn-danger btn-sm" @click="clearCart()"><i class="fas fa-trash-alt" aria-hidden="true"></i> ${t('cart.clear')}</button>
          </div>
          <div class="cart-table-wrapper">
            <table class="cart-table table">
              <caption class="text-muted caption-meta" style="margin-top:8px">${t('cart.title')}</caption>
              <thead>
                <tr>
                  <th scope="col">${t('cart.product')}</th>
                  <th scope="col">${t('cart.price')}</th>
                  <th scope="col">${t('cart.quantity')}</th>
                  <th scope="col">${t('cart.subtotal')}</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                <template x-for="item in items" :key="item.productId">
                  <tr>
                    <td class="cart-product-cell">
                      <a :href="'#/product-detail?id=' + item.productId"
                         class="d-flex align-items-center gap-2 text-decoration-none" style="color:var(--text)">
                        <template x-if="item.imageUrl">
                          <img :src="item.imageUrl"
                               :alt="item.productTitle || ''"
                               class="flex-shrink-0 rounded-2" style="width:48px;height:48px;object-fit:cover;border:1px solid var(--border)"
                               loading="lazy">
                        </template>
                        <template x-if="!item.imageUrl">
                          <div class="d-flex align-items-center justify-content-center flex-shrink-0 rounded-2" style="width:48px;height:48px;background:var(--body-bg);border:1px solid var(--border)">
                            <i class="fas fa-image text-muted fs-6" aria-hidden="true"></i>
                          </div>
                        </template>
                        <span x-text="itemDisplayTitle(item)"></span>
                      </a>
                    </td>
                    <td class="cart-price-cell" x-text="formatPrice(itemUnitPrice(item))"></td>
                    <td class="cart-qty-cell">
                      <div class="qty-btn-group">
                        <button type="button" class="qty-btn"
                                @click="decrementQty(item)"
                                :disabled="isMinQty(item)">−</button>
                        <input type="text" class="cart-qty-input"
                               :value="itemQuantity(item)" readonly
                               aria-label="${t('cart.quantity')}">
                        <button type="button" class="qty-btn"
                                @click="incrementQty(item)"
                                :disabled="isMaxStock(item)">+</button>
                      </div>
                      <span x-show="isMaxStock(item)"
                            class="cart-max-label">${t('cart.maxReached')}</span>
                    </td>
                    <td class="cart-subtotal-cell" x-text="formatPrice(itemSubtotal(item))"></td>
                    <td class="cart-remove-cell">
                      <button class="btn btn-ghost btn-icon remove-item text-danger" @click="removeItem(item.productId)" :aria-label="$t('common.remove')">
                        <i class="fas fa-times" aria-hidden="true"></i>
                      </button>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="cart-footer mb-4">
            <div class="cart-total">${t('cart.total')}: <span class="cart-total-amount" id="cartTotalDisplay" x-text="formatPrice(total)"></span></div>
            <a href="#/checkout" class="btn btn-primary btn-lg"><i class="fas fa-credit-card" aria-hidden="true"></i> ${t('cart.checkout')}</a>
          </div>
          <div class="cart-floating-bar" id="cartFloatingBar" aria-hidden="true">
            <div class="cart-total">${t('cart.total')}: <span class="cart-total-amount" id="cartTotalFloating" x-text="formatPrice(total)"></span></div>
            <a href="#/checkout" class="btn btn-primary"><i class="fas fa-credit-card" aria-hidden="true"></i> ${t('cart.checkout')}</a>
          </div>
        </div>
      </div>
    </div>`;
}

