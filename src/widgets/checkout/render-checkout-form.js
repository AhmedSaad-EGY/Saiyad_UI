import { t } from '../../shared/utils/i18n.js';

export function renderCheckoutForm() {
  return `
    <div class="checkout-layout">
      <div class="section-header text-center d-block border-0 pb-0">
        <h2 class="mb-4"><i class="fas fa-lock text-muted fs-4"></i> ${t('cart.checkout')}</h2>
        <div class="checkout-progress">
          <div class="checkout-progress-step completed"><div class="checkout-progress-num"><i class="fas fa-check"></i></div> <span>${t('nav.cart')}</span></div>
          <div class="checkout-progress-divider"></div>
          <div class="checkout-progress-step active"><div class="checkout-progress-num">2</div> <span>${t('cart.shippingAddress')}</span></div>
          <div class="checkout-progress-divider"></div>
          <div class="checkout-progress-step"><div class="checkout-progress-num">3</div> <span>${t('cart.paymentMethod')}</span></div>
        </div>
      </div>

      <div class="row g-5">
        <div class="col-lg-7 col-xl-8">
          <div class="card">
            <div class="card-header">
              <h3 class="mb-0">${t('cart.title')}</h3>
            </div>
            <div class="card-body">
            <template x-for="item in items" :key="item.productId">
                <div class="checkout-line-item border-divider-bottom">
                <span class="checkout-line-item__meta"><span x-text="item.productTitle || ($t('common.product') + ' #' + item.productId)"></span> <small class="text-muted" x-text="'x' + (item.quantity || 1)"></small></span>
                <span class="fw-semibold" x-text="formatPrice((item.product?.price || item.unitPrice || item.price || 0) * (item.quantity || 1))"></span>
              </div>
            </template>
            <div class="checkout-order-total-row">
              <span>${t('cart.total')}</span>
              <span class="text-primary" x-text="formatPrice(total)"></span>
            </div>
            <hr class="my-3">
            <h3 class="mb-3">${t('cart.shippingAddress')}</h3>

            <template x-if="addresses.length > 0">
              <div class="mb-4">
                <label class="fw-semibold d-block mb-3">${t('shipping.savedAddresses')}</label>
                <div class="row g-3">
                  <template x-for="(a, i) in addresses" :key="a.id">
                    <div class="col-sm-6">
                      <div class="address-card"
                           :class="selectedAddressId === a.id ? 'selected' : ''"
                           role="button"
                           :tabindex="placing ? '-1' : '0'"
                           :aria-pressed="selectedAddressId === a.id ? 'true' : 'false'"
                           @click="selectAddress(a.id)"
                           @keydown.enter.prevent="selectAddress(a.id)"
                           @keydown.space.prevent="selectAddress(a.id)">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <strong x-text="a.fullName || a.name || ''"></strong>
                          <div class="address-card-check"><i class="fas fa-check" x-show="selectedAddressId === a.id"></i></div>
                        </div>
                        <div class="text-secondary-sm">
                          <div x-text="(a.addressLine || '')"></div>
                          <div x-text="(a.city || '') + (a.postalCode ? ', ' + a.postalCode : '')"></div>
                          <div class="mt-1" x-text="a.phone || ''"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <div class="col-sm-6">
                    <div class="address-card address-card--new d-flex flex-column align-items-center justify-content-center h-100 text-center"
                         :class="useNewAddress ? 'selected' : ''"
                         role="button"
                         :tabindex="placing ? '-1' : '0'"
                         :aria-pressed="useNewAddress ? 'true' : 'false'"
                         @click="selectAddress('new')"
                         @keydown.enter.prevent="selectAddress('new')"
                         @keydown.space.prevent="selectAddress('new')">
                      <i class="fas fa-plus mb-2 fs-4" :class="useNewAddress ? 'text-primary' : 'text-muted'"></i>
                      <strong :class="useNewAddress ? 'text-primary' : 'text-muted'">${t('shipping.addNew')}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <form id="addressForm" x-show="useNewAddress || addresses.length === 0" x-transition>
              <h4 class="mb-3 fs-5">${t('shipping.addNew')}</h4>
              <div id="addressFields" class="row g-3">
                <div class="col-sm-6">
                  <div class="form-group">
                    <label class="form-label" for="addrFullName">${t('auth.fullName')} *</label>
                    <input type="text" class="form-input form-control" id="addrFullName" name="fullName" x-model="addrFullName" @input="validateField('addrFullName')" autocomplete="name" required>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="form-group">
                    <label class="form-label" for="addrPhone">${t('auth.phone')} *</label>
                    <input type="tel" class="form-input form-control" id="addrPhone" name="phone" x-model="addrPhone" @input="validateField('addrPhone')" autocomplete="tel" required>
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label" for="addrAddressLine">${t('cart.addressLine')} *</label>
                    <input type="text" class="form-input form-control" id="addrAddressLine" name="addressLine" x-model="addrAddressLine" @input="validateField('addrAddressLine')" autocomplete="street-address" required>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="form-group">
                    <label class="form-label" for="addrCity">${t('cart.city')} *</label>
                    <input type="text" class="form-input form-control" id="addrCity" name="city" x-model="addrCity" @input="validateField('addrCity')" autocomplete="address-level2" required>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="form-group">
                    <label class="form-label" for="addrPost">${t('shipping.postalCode')}</label>
                    <input type="text" class="form-input form-control" id="addrPost" name="postalCode" x-model="addrPost" @input="validateField('addrPost')" autocomplete="postal-code">
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

          <div class="card mt-4 mb-4">
            <div class="card-header">
              <h3 class="mb-0">${t('cart.paymentMethod')}</h3>
            </div>
            <div class="card-body">
              <div class="alert alert-info mb-3">
                <i class="fas fa-info-circle" aria-hidden="true"></i>
                <span>${t('cart.demoPaymentNotice')}</span>
              </div>
              <div class="checkout-wallet-panel mb-3">
                <i class="fas fa-wallet fs-5 text-primary"></i>
                <div>
                  <small class="text-muted">${t('wallet.available')}</small>
                  <div class="fw-bold fs-6" x-text="availableBalance !== null ? formatPrice(availableBalance) : '—'"></div>
                </div>
                <a href="#/wallet" class="btn btn-sm btn-outline ms-auto"><i class="fas fa-plus"></i> ${t('wallet.deposit')}</a>
              </div>
              <select class="form-select" id="paymentMethod" x-model="paymentMethod">
                <option value="CreditCard">${t('cart.creditCard')}</option>
                <option value="CashOnDelivery">${t('cart.cashOnDelivery')}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="col-lg-5 col-xl-4">
          <div class="checkout-sidebar">
            <div class="card">
              <div class="card-header">
                <h3 class="mb-0"><i class="fas fa-receipt"></i> ${t('order.summary')}</h3>
              </div>
              <div class="card-body">
                <div class="terms-content checkout-summary-items">
                  <template x-for="item in items" :key="item.productId">
                    <div class="checkout-summary-item">
                      <div class="checkout-summary-item__content">
                        <div class="checkout-summary-thumb">
                          <div class="checkout-summary-thumb__frame">
                            <img :src="item.imageUrl || ''" class="checkout-summary-thumb__img" @error="imgError">
                            <i class="fas fa-image checkout-summary-thumb__fallback"></i>
                          </div>
                        </div>
                        <div class="checkout-summary-meta">
                          <div class="checkout-summary-title" x-text="item.productTitle || ($t('common.product') + ' #' + item.productId)"></div>
                          <small class="text-muted" x-text="$t('common.qty') + ': ' + (item.quantity || 1)"></small>
                        </div>
                      </div>
                      <span class="checkout-summary-price" x-text="formatPrice((item.product?.price || item.unitPrice || item.price || 0) * (item.quantity || 1))"></span>
                    </div>
                  </template>
                </div>
                <hr>
                <div class="checkout-total-row">
                  <span class="text-muted">${t('cart.subtotal')}</span>
                  <span x-text="formatPrice(total)"></span>
                </div>
                <div class="checkout-total-row">
                  <span class="text-muted">${t('order.shipping')}</span>
                  <span class="text-success">${t('common.free')}</span>
                </div>
                <div class="checkout-total-row checkout-total-row--grand">
                  <span>${t('cart.total')}</span>
                  <span class="text-primary" x-text="formatPrice(total)"></span>
                </div>

                <div x-show="alertMessage" x-cloak>
                  <div class="alert" :class="'alert-' + alertType">
                    <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
                    <span x-text="alertMessage"></span>
                    <template x-if="showDepositLink">
                      <a href="#/wallet" style="color:inherit;text-decoration:underline">
                        <i class="fas fa-plus small" aria-hidden="true"></i> ${t('wallet.deposit')}
                      </a>
                    </template>
                  </div>
                </div>
                <button type="button" class="btn btn-primary w-100 btn-lg mt-3 checkout-submit-btn" @click="placeOrder()" :disabled="placing" :aria-busy="placing ? 'true' : null" :aria-disabled="placing ? 'true' : null">
                  <i class="fas fa-lock" x-show="!placing"></i>
                  <i class="fas fa-spinner spinner" x-show="placing" x-cloak></i>
                  <span x-text="placing ? $t('cart.placingOrder') : $t('cart.placeOrder')"></span>
                </button>

                <div class="trust-badges mt-4">
                  <div class="trust-badge"><i class="fas fa-shield-alt"></i> ${t('common.secureCheckout')}</div>
                  <div class="trust-badge"><i class="fas fa-undo"></i> ${t('common.easyReturns')}</div>
                </div>

                <a href="#/cart" class="btn btn-outline w-100 mt-2 border-0 checkout-back-link"><i class="fas fa-arrow-left"></i> ${t('cart.backToCart')}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}
