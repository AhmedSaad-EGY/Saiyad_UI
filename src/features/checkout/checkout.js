import { api } from '../../shared/api/client.js';
import { t } from '../../app/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';
import { showFieldError, clearFieldError, clearAllFieldErrors } from '../../shared/utils/validation.js';
import { formatPrice } from '../../shared/utils/format.js';
import { triggerConfetti } from '../../shared/utils/ui.js';
import { setPageMeta } from '../../shared/utils/seo.js';
import Alpine from 'alpinejs';

export function createPaymentReference(prefix = 'PAY') {
  return `${prefix}-${crypto.randomUUID()}`;
}

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
    setPageMeta(t('checkout.title'), undefined, true);
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

    // UX hint only — backend enforces balance atomically
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
      const result = await api.post('/orders/checkout', {
        shippingAddressId: addr_id,
        paymentMethod: this.paymentMethod,
      });
      document.dispatchEvent(new CustomEvent('cart-updated'));
      triggerConfetti();
      this.orderSuccess = result.orderId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      this.alert = `<div class="alert alert-error">${escapeHtml(err.message || t('cart.orderError'))}</div>`;
    } finally {
      this.placing = false;
    }
  },

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
