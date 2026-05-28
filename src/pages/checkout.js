import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth } from '../core/auth/index.js';
import { navigate } from '../core/router/index.js';
import { escapeHtml } from '../core/utils/dom.js';
import { showFieldError, clearFieldError, clearAllFieldErrors } from '../core/utils/validation.js';
import { formatPrice } from '../core/utils/format.js';
import { triggerConfetti } from '../core/utils/ui.js';
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

  formatPrice,
  clearFieldError,

  async init() {
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
      this.alert = `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${t('cart.insufficientWallet')} — <a href="#/wallet" style="color:inherit;text-decoration:underline"><i class="fas fa-plus"></i> ${t('wallet.deposit')}</a></div>`;
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
      navigate('order-detail?id=' + order.id);
    } catch (err) {
      this.alert = `<div class="alert alert-error">${escapeHtml(err.message || t('cart.orderError'))}</div>`;
    } finally {
      this.placing = false;
    }
  },
}));

export default async function renderCheckout(container) {
  if (!(await requireAuth())) return;

  container.innerHTML = `
    <div x-data="checkoutPage">
      <template x-if="loading">
        <div class="skeleton-shimmer" style="padding:20px 0">
          <div class="skeleton skeleton-title" style="width:30%"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width:60%"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width:40%"></div>
        </div>
      </template>
      <div x-show="!loading && items.length === 0" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div>
          <div class="section-header"><h2><i class="fas fa-credit-card"></i> ${t('cart.checkout')}</h2></div>
          <div class="empty-state">
            <i class="fas fa-shopping-cart" style="font-size:3rem;color:var(--text-muted);margin-bottom:16px"></i>
            <h3>${t('cart.empty')}</h3>
            <p style="color:var(--text-muted);margin-bottom:20px">${t('cart.emptyDesc')}</p>
            <a href="#/products" class="btn btn-primary"><i class="fas fa-store"></i> ${t('cart.browseProducts')}</a>
          </div>
        </div>
      </div>
      </div>
      <div x-show="!loading && items.length > 0" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div>
          <div class="section-header"><h2><i class="fas fa-credit-card"></i> ${t('cart.checkout')}</h2></div>
          <div class="row g-5">
            <div class="col-lg-6">
              <div class="card">
                <div class="card-header">
                  <h3 style="margin-bottom:0">${t('cart.title')}</h3>
                </div>
                <div class="card-body">
                <template x-for="item in items" :key="item.productId">
                  <div class="d-flex justify-content-between" style="padding:8px 0;border-bottom:1px solid var(--border)">
                    <span><span x-text="item.productTitle || ('Product #' + item.productId)"></span> <small class="text-muted" x-text="' x' + (item.quantity || 1)"></small></span>
                    <span style="font-weight:600" x-text="formatPrice((item.product?.price || item.unitPrice || item.price || 0) * (item.quantity || 1))"></span>
                  </div>
                </template>
                <div class="d-flex justify-content-between" style="padding:12px 0;font-size:1.1rem;font-weight:700">
                  <span>${t('cart.total')}</span>
                  <span style="color:var(--primary)" x-text="formatPrice(total)"></span>
                </div>
                <hr style="border-color:var(--border);margin:16px 0">
                <h3 style="margin-bottom:16px">${t('cart.shippingAddress')}</h3>

                <template x-if="addresses.length > 0">
                  <div style="margin-bottom:12px">
                    <label style="font-weight:600;display:block;margin-bottom:8px">${t('shipping.savedAddresses') || 'Saved Addresses'}</label>
                    <template x-for="(a, i) in addresses" :key="a.id">
                      <label class="radio-card d-flex align-items-start gap-2" style="padding:10px;margin-bottom:6px;border:1px solid var(--border);border-radius:8px;cursor:pointer;background:var(--card-bg)">
                        <input type="radio" name="savedAddr" :value="a.id" :checked="selectedAddressId === a.id" @change="selectAddress(a.id)" style="margin-top:3px">
                        <div>
                          <strong x-text="a.fullName || a.name || ''"></strong><br>
                          <span style="font-size:0.85rem;color:var(--text-muted)" x-text="(a.addressLine || '') + ', ' + (a.city || '') + (a.postalCode ? ' - ' + a.postalCode : '')"></span><br>
                          <span style="font-size:0.85rem;color:var(--text-muted)" x-text="a.phone || ''"></span>
                        </div>
                      </label>
                    </template>
                    <label class="radio-card d-flex align-items-center gap-2" style="padding:10px;margin-bottom:6px;border:1px dashed var(--border);border-radius:8px;cursor:pointer;background:var(--card-bg)">
                      <input type="radio" name="savedAddr" value="new" :checked="useNewAddress" @change="selectAddress('new')" style="margin:0">
                      <span><i class="fas fa-plus"></i> ${t('shipping.addNew')}</span>
                    </label>
                  </div>
                </template>

                <form id="addressForm" x-show="useNewAddress || addresses.length === 0">
                  <div id="addressFields" class="row g-3">
                    <div class="col-sm-6">
                      <div class="form-group">
                        <label class="form-label" for="addrFullName">${t('auth.fullName')} *</label>
                        <input type="text" class="form-input form-control" id="addrFullName" name="fullName" x-model="addrFullName" @input="clearFieldError($el)" autocomplete="name" required>
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="form-group">
                        <label class="form-label" for="addrPhone">${t('auth.phone')} *</label>
                        <input type="tel" class="form-input form-control" id="addrPhone" name="phone" x-model="addrPhone" @input="clearFieldError($el)" autocomplete="tel" required>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="form-group">
                        <label class="form-label" for="addrAddressLine">${t('cart.addressLine')} *</label>
                        <input type="text" class="form-input form-control" id="addrAddressLine" name="addressLine" x-model="addrAddressLine" @input="clearFieldError($el)" autocomplete="street-address" required>
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="form-group">
                        <label class="form-label" for="addrCity">${t('cart.city')} *</label>
                        <input type="text" class="form-input form-control" id="addrCity" name="city" x-model="addrCity" @input="clearFieldError($el)" autocomplete="address-level2" required>
                      </div>
                    </div>
                    <div class="col-sm-6">
                      <div class="form-group">
                        <label class="form-label" for="addrPost">${t('shipping.postalCode')}</label>
                        <input type="text" class="form-input form-control" id="addrPost" name="postalCode" x-model="addrPost" autocomplete="postal-code">
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="card">
                <div class="card-header">
                  <h3 style="margin-bottom:0">${t('cart.paymentMethod')}</h3>
                </div>
                <div class="card-body">
                <div class="mb-3 d-flex align-items-center gap-3" style="padding:12px;border:1px solid var(--border);border-radius:8px">
                  <i class="fas fa-wallet" style="font-size:1.3rem;color:var(--primary)"></i>
                  <div>
                    <small style="color:var(--text-muted)">${t('wallet.available')}</small>
                    <div style="font-weight:700;font-size:1.1rem" x-text="availableBalance !== null ? formatPrice(availableBalance) : '—'"></div>
                  </div>
                  <a href="#/wallet" class="btn btn-sm btn-outline" style="margin-left:auto"><i class="fas fa-plus"></i> ${t('wallet.deposit')}</a>
                </div>
                <select class="form-select" id="paymentMethod" x-model="paymentMethod" style="margin-bottom:20px">
                  <option value="CreditCard">${t('cart.creditCard')}</option>
                  <option value="CashOnDelivery">${t('cart.cashOnDelivery')}</option>
                </select>
                <div x-html="alert" x-show="alert" x-cloak></div>
                <button class="btn btn-primary w-100 btn-lg" @click="placeOrder()" :disabled="placing">
                  <i class="fas fa-spinner spinner" x-show="placing" x-cloak></i>
                  <span x-text="placing ? $t('cart.placingOrder') : $t('cart.placeOrder')"></span>
                </button>
                <a href="#/cart" class="btn btn-outline w-100" style="margin-top:8px"><i class="fas fa-arrow-left"></i> ${t('cart.backToCart')}</a>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}
