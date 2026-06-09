import { t } from '../../shared/utils/i18n.js';

export function renderCheckoutForm() {
  return `
    <div>
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
                <div class="d-flex justify-content-between py-2 border-divider-bottom">
                <span><span x-text="item.productTitle || ('Product #' + item.productId)"></span> <small class="text-muted" x-text="' x' + (item.quantity || 1)"></small></span>
                <span class="fw-semibold" x-text="formatPrice((item.product?.price || item.unitPrice || item.price || 0) * (item.quantity || 1))"></span>
              </div>
            </template>
            <div class="d-flex justify-content-between py-3 fw-bold" style="font-size:1.1rem">
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
                      <div class="address-card" :class="selectedAddressId === a.id ? 'selected' : ''" @click="selectAddress(a.id)">
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
                    <div class="address-card d-flex flex-column align-items-center justify-content-center h-100 text-center" :class="useNewAddress ? 'selected' : ''" @click="selectAddress('new')" style="border-style:dashed;min-height:120px">
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
              <div class="mb-3 d-flex align-items-center gap-3 p-3 rounded-3" style="border:1px solid var(--border)">
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
                <div style="max-height: 250px; overflow-y: auto; padding-right: 10px; margin-bottom: 20px" class="terms-content">
                  <template x-for="item in items" :key="item.productId">
                    <div class="d-flex justify-content-between mb-3">
                      <div class="d-flex gap-2">
                        <div style="width:40px;height:40px;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border)">
                          <div style="position:relative;width:100%;height:100%">
                            <img :src="item.product?.primaryImageUrl || item.productImageUrl || item.imageUrl || ''" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';var n=this.parentElement.querySelector('.fa-image');if(n)n.style.display='block'">
                            <i class="fas fa-image" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.2rem;color:var(--text-muted)"></i>
                          </div>
                        </div>
                        <div>
                          <div style="font-size:0.85rem;line-height:1.2;margin-bottom:4px" x-text="item.productTitle || ($t('common.product') + ' #' + item.productId)"></div>
                          <small class="text-muted" x-text="$t('common.qty') + ': ' + (item.quantity || 1)"></small>
                        </div>
                      </div>
                      <span class="fw-semibold ms-2" x-text="formatPrice((item.product?.price || item.unitPrice || item.price || 0) * (item.quantity || 1))"></span>
                    </div>
                  </template>
                </div>
                <hr>
                <div class="d-flex justify-content-between py-2">
                  <span class="text-muted">${t('cart.subtotal')}</span>
                  <span x-text="formatPrice(total)"></span>
                </div>
                <div class="d-flex justify-content-between py-2">
                  <span class="text-muted">${t('order.shipping')}</span>
                  <span class="text-success">${t('common.free')}</span>
                </div>
                <div class="d-flex justify-content-between py-3 mt-2 fw-bold" style="border-top:2px dashed var(--border);font-size:1.2rem">
                  <span>${t('cart.total')}</span>
                  <span class="text-primary" x-text="formatPrice(total)"></span>
                </div>

                <div x-html="alert" x-show="alert" x-cloak></div>
                <button class="btn btn-primary w-100 btn-lg mt-3" @click="placeOrder()" :disabled="placing">
                  <i class="fas fa-lock" x-show="!placing"></i>
                  <i class="fas fa-spinner spinner" x-show="placing" x-cloak></i>
                  <span x-text="placing ? $t('cart.placingOrder') : $t('cart.placeOrder')"></span>
                </button>

                <div class="trust-badges mt-4">
                  <div class="trust-badge"><i class="fas fa-shield-alt"></i> ${t('common.secureCheckout')}</div>
                  <div class="trust-badge"><i class="fas fa-undo"></i> ${t('common.easyReturns')}</div>
                </div>

                <a href="#/cart" class="btn btn-outline w-100 mt-2 border-0"><i class="fas fa-arrow-left"></i> ${t('cart.backToCart')}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}
