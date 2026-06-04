import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth } from '../core/auth/index.js';
import { navigate } from '../core/router/index.js';
import { escapeHtml } from '../core/utils/dom.js';
import { showFieldError, clearFieldError, clearAllFieldErrors } from '../core/utils/validation.js';
import { formatPrice } from '../core/utils/format.js';
import { triggerConfetti } from '../core/utils/ui.js';
import { setPageMeta } from '../core/utils/seo.js';
import Alpine from 'alpinejs';

Alpine.data('checkoutPage', () => ({
  items: [],
  total: 0,
  availableBalance: null,
  addresses: [],
  selectedAddressId: null,
  useNewAddress: false,
  paymentMethod: 'CreditCard',
  loading: true,
  placing: false,
  alert: '',
  addrFullName: '',
  addrPhone: '',
  addrAddressLine: '',
  addrCity: '',
  addrPost: '',
  orderSuccess: null,

  formatPrice,
  clearFieldError,

  async init() {
    setPageMeta("Checkout", undefined, true);
    try {
      const [cart, savedAddresses, walletData] = await Promise.all([
        api.get('/cart'),
        api.get('/shippingaddresses').catch(() => []),
        api.get('/wallet').catch(() => null),
      ]);
      this.items = cart.items || [];
      this.addresses = Array.isArray(savedAddresses) ? savedAddresses : [];
      this.availableBalance = walletData?.availableBalance ?? null;

      if (this.items.length === 0) return;

      this.total = this.items.reduce((s, i) => {
        return s + (i.product?.price || i.unitPrice || i.price || 0) * (i.quantity || 1);
      }, 0);

      if (this.addresses.length > 0) {
        this.selectedAddressId = this.addresses[0].id;
        this.useNewAddress = false;
      } else {
        this.selectedAddressId = null;
        this.useNewAddress = true;
      }
    } catch {
      // handled by loading state
    } finally {
      this.loading = false;
    }
  },

  selectAddress(id) {
    if (id === 'new') {
      this.useNewAddress = true;
      this.selectedAddressId = null;
    } else {
      this.useNewAddress = false;
      this.selectedAddressId = Number(id);
    }
  },

  async placeOrder() {
    this.placing = true;
    this.alert = '';

    if (this.availableBalance !== null && this.availableBalance < this.total) {
      this.alert = `<div class="alert alert-error"><i class="fas fa-exclamation-circle" aria-hidden="true"></i> ${t('cart.insufficientWallet')} — <a href="#/wallet" style="color:inherit;text-decoration:underline"><i class="fas fa-plus small" aria-hidden="true"></i> ${t('wallet.deposit')}</a></div>`;
      this.placing = false;
      return;
    }

    let addr_id;

    if (this.selectedAddressId) {
      addr_id = this.selectedAddressId;
    } else {
      clearAllFieldErrors(document.getElementById('addressForm'));
      const fields = [
        { id: 'addrFullName', el: document.getElementById('addrFullName') },
        { id: 'addrPhone', el: document.getElementById('addrPhone') },
        { id: 'addrAddressLine', el: document.getElementById('addrAddressLine') },
        { id: 'addrCity', el: document.getElementById('addrCity') },
      ];
      let valid = true;
      for (const f of fields) {
        if (!f.el.value.trim()) {
          showFieldError(f.el, t('validation.required'));
          valid = false;
        }
      }
      if (!valid) {
        this.placing = false;
        return;
      }

      try {
        const addr = await api.post('/shippingaddresses', {
          fullName: this.addrFullName.trim(),
          phone: this.addrPhone.trim(),
          city: this.addrCity.trim(),
          addressLine: this.addrAddressLine.trim(),
          postalCode: this.addrPost.trim() || undefined,
        });
        addr_id = addr.id;
      } catch (err) {
        this.alert = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
        this.placing = false;
        return;
      }
    }

    try {
      const order = await api.post('/orders', { shippingAddressId: addr_id });
      const payment = await api.post('/payments/initiate', {
        orderId: order.id,
        paymentMethod: this.paymentMethod,
      });
      if (payment?.id) {
        await api.post(`/payments/${payment.id}/confirm`);
      }
      document.dispatchEvent(new CustomEvent('cart-updated'));
      triggerConfetti();
      this.orderSuccess = order.id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      this.alert = `<div class="alert alert-error">${escapeHtml(err.message || t('cart.orderError'))}</div>`;
    } finally {
      this.placing = false;
    }
  },
  
  // Real-time validation
  validateField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim() && id !== 'addrPost') {
      showFieldError(el, t('validation.required'));
    } else {
      clearFieldError(el);
    }
  }
}));

export default async function renderCheckout(container) {
  if (!(await requireAuth())) return;

  container.innerHTML = `
    <div x-data="checkoutPage">
      <template x-if="loading">
        <div class="skeleton-shimmer py-4" style="padding-top:0;padding-bottom:0">
          <div class="skeleton skeleton-title" style="width:30%"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width:60%"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width:40%"></div>
        </div>
      </template>
      <div x-show="!loading && items.length === 0" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div>
          <div class="section-header animate__animated animate__fadeInUp"><h2><i class="fas fa-credit-card" aria-hidden="true"></i> ${t('cart.checkout')}</h2></div>
          <div class="empty-state">
            <i class="fas fa-shopping-cart text-muted mb-4" style="font-size:3.5rem" aria-hidden="true"></i>
            <h3>${t('cart.empty')}</h3>
            <p class="text-muted mb-4">${t('cart.emptyDesc')}</p>
            <a href="#/products" class="btn btn-primary"><i class="fas fa-store" aria-hidden="true"></i> ${t('cart.browseProducts')}</a>
          </div>
        </div>
      </div>
      </div>
      <div x-show="!loading && items.length > 0 && !orderSuccess" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div>
          <div class="section-header text-center d-block border-0 pb-0">
            <h2 class="mb-4"><i class="fas fa-lock text-muted fs-4" aria-hidden="true"></i> ${t('cart.checkout') || 'Secure Checkout'}</h2>
            <!-- Progress Indicator -->
            <div class="checkout-progress">
              <div class="checkout-progress-step completed"><div class="checkout-progress-num"><i class="fas fa-check" aria-hidden="true"></i></div> <span>${t('nav.cart') || 'Cart'}</span></div>
              <div class="checkout-progress-divider"></div>
              <div class="checkout-progress-step active"><div class="checkout-progress-num">2</div> <span>${t('cart.shippingAddress') || 'Shipping'}</span></div>
              <div class="checkout-progress-divider"></div>
              <div class="checkout-progress-step"><div class="checkout-progress-num">3</div> <span>${t('cart.paymentMethod') || 'Payment'}</span></div>
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
                  <div class="d-flex justify-content-between" class="py-2" style="border-bottom:1px solid var(--border)">
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
                    <label class="fw-semibold d-block mb-3">${t('shipping.savedAddresses') || 'Select a Saved Address'}</label>
                    <div class="row g-3">
                      <template x-for="(a, i) in addresses" :key="a.id">
                        <div class="col-sm-6">
                          <div class="address-card" :class="selectedAddressId === a.id ? 'selected' : ''" @click="selectAddress(a.id)">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                              <strong x-text="a.fullName || a.name || ''"></strong>
                              <div class="address-card-check"><i class="fas fa-check" x-show="selectedAddressId === a.id" aria-hidden="true"></i></div>
                            </div>
                            <div style="font-size:0.85rem;color:var(--text-secondary)">
                              <div x-text="(a.addressLine || '')"></div>
                              <div x-text="(a.city || '') + (a.postalCode ? ', ' + a.postalCode : '')"></div>
                              <div class="mt-1" x-text="a.phone || ''"></div>
                            </div>
                          </div>
                        </div>
                      </template>
                      <div class="col-sm-6">
                        <div class="address-card d-flex flex-column align-items-center justify-content-center h-100 text-center" :class="useNewAddress ? 'selected' : ''" @click="selectAddress('new')" style="border-style:dashed;min-height:120px">
                          <i class="fas fa-plus mb-2 fs-4" :class="useNewAddress ? 'text-primary' : 'text-muted'" aria-hidden="true"></i>
                          <strong :class="useNewAddress ? 'text-primary' : 'text-muted'">${t('shipping.addNew')}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <form id="addressForm" x-show="useNewAddress || addresses.length === 0" x-transition>
                  <h4 class="mb-3 fs-5">${t('shipping.addNew') || 'New Address'}</h4>
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
            </div>
              </div>
              
              <div class="card mt-4 mb-4">
                <div class="card-header">
                  <h3 class="mb-0">${t('cart.paymentMethod')}</h3>
                </div>
                <div class="card-body">
                  <div class="mb-3 d-flex align-items-center gap-3 p-3 rounded-3" style="border:1px solid var(--border)">
                    <i class="fas fa-wallet fs-5 text-primary" aria-hidden="true"></i>
                    <div>
                      <small class="text-muted">${t('wallet.available')}</small>
                      <div class="fw-bold fs-6" x-text="availableBalance !== null ? formatPrice(availableBalance) : '—'"></div>
                    </div>
                    <a href="#/wallet" class="btn btn-sm btn-outline ms-auto"><i class="fas fa-plus" aria-hidden="true"></i> ${t('wallet.deposit')}</a>
                  </div>
                  <select class="form-select" id="paymentMethod" x-model="paymentMethod">
                    <option value="CreditCard">${t('cart.creditCard')}</option>
                    <option value="CashOnDelivery">${t('cart.cashOnDelivery')}</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Sticky Sidebar: Order Summary -->
            <div class="col-lg-5 col-xl-4">
              <div class="checkout-sidebar">
                <div class="card">
                  <div class="card-header">
                    <h3 class="mb-0"><i class="fas fa-receipt" aria-hidden="true"></i> ${t('order.summary') || 'Order Summary'}</h3>
                  </div>
                  <div class="card-body">
                    <div style="max-height: 250px; overflow-y: auto; padding-right: 10px; margin-bottom: 20px" class="terms-content">
                      <template x-for="item in items" :key="item.productId">
                        <div class="d-flex justify-content-between mb-3">
                          <div class="d-flex gap-2">
                            <div style="width:40px;height:40px;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border)">
                              <img :src="item.product?.primaryImageUrl || item.productImageUrl || item.imageUrl || ''" style="width:100%;height:100%;object-fit:cover" onerror="this.src='';this.className='fas fa-image'">
                            </div>
                            <div>
                              <div style="font-size:0.85rem;line-height:1.2;margin-bottom:4px" x-text="item.productTitle || ('Product #' + item.productId)"></div>
                              <small class="text-muted" x-text="'Qty: ' + (item.quantity || 1)"></small>
                            </div>
                          </div>
                          <span class="fw-semibold ms-2" x-text="formatPrice((item.product?.price || item.unitPrice || item.price || 0) * (item.quantity || 1))"></span>
                        </div>
                      </template>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between py-2">
                      <span class="text-muted">${t('cart.subtotal') || 'Subtotal'}</span>
                      <span x-text="formatPrice(total)"></span>
                    </div>
                    <div class="d-flex justify-content-between py-2">
                      <span class="text-muted">${t('order.shipping') || 'Shipping'}</span>
                      <span class="text-success">${t('common.free') || 'Free'}</span>
                    </div>
                    <div class="d-flex justify-content-between py-3 mt-2 fw-bold" style="border-top:2px dashed var(--border);font-size:1.2rem">
                      <span>${t('cart.total')}</span>
                      <span class="text-primary" x-text="formatPrice(total)"></span>
                    </div>
                    
                    <div x-html="alert" x-show="alert" x-cloak></div>
                    <button class="btn btn-primary w-100 btn-lg mt-3" @click="placeOrder()" :disabled="placing">
                      <i class="fas fa-lock" x-show="!placing" aria-hidden="true"></i>
                      <i class="fas fa-spinner spinner" x-show="placing" x-cloak></i>
                      <span x-text="placing ? $t('cart.placingOrder') : $t('cart.placeOrder')"></span>
                    </button>
                    
                    <!-- Trust Badges -->
                    <div class="trust-badges mt-4">
                      <div class="trust-badge"><i class="fas fa-shield-alt" aria-hidden="true"></i> ${t('common.secureCheckout') || 'Secure Checkout'}</div>
                      <div class="trust-badge"><i class="fas fa-undo" aria-hidden="true"></i> ${t('common.easyReturns') || 'Easy Returns'}</div>
                    </div>
                    
                    <a href="#/cart" class="btn btn-outline w-100 mt-2 border-0"><i class="fas fa-arrow-left" aria-hidden="true"></i> ${t('cart.backToCart')}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Success View -->
      <div x-show="orderSuccess" style="display:none" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div class="order-success animate__animated animate__fadeIn">
          <div class="order-success-icon animate__animated animate__bounceIn"><i class="fas fa-check" aria-hidden="true"></i></div>
          <h2>${t('cart.orderSuccess') || 'Order Placed Successfully!'}</h2>
          <p>${t('cart.orderSuccessDesc') || 'Thank you for your purchase. Your order has been received and is being processed.'}</p>
          <div class="d-flex justify-content-center gap-3 mt-5">
            <a :href="'#/order-detail?id=' + orderSuccess" class="btn btn-primary"><i class="fas fa-file-invoice" aria-hidden="true"></i> ${t('order.track') || 'View Order Details'}</a>
            <a href="#/products" class="btn btn-outline"><i class="fas fa-shopping-bag" aria-hidden="true"></i> ${t('cart.continueShopping') || 'Continue Shopping'}</a>
          </div>
        </div>
      </div>
    </div>`;
  // Ensure Alpine initializes the newly injected markup
  if (typeof Alpine.discoverUninitializedComponents === 'function') {
    Alpine.discoverUninitializedComponents(container);
  } else if (typeof Alpine.initTree === 'function') {
    Alpine.initTree(container);
  }
}
