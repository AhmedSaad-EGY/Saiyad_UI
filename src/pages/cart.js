import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth, updateCartBadge } from '../core/auth/index.js';
import { navigate } from '../core/router/index.js';
import { registerRouteCleanup } from '../core/router/index.js';
import { formatPrice } from '../core/utils/format.js';
import { showConfirm, showToast } from '../core/utils/ui.js';
import Alpine from 'alpinejs';

Alpine.data('cartPage', () => ({
  items: [],
  total: 0,
  loading: true,
  empty: false,
  error: '',

  t,
  formatPrice,

  async init() {
    try {
      const cart = await api.get('/cart');
      this.items = cart.items || [];
      this.empty = this.items.length === 0;
      this.computeTotal();
    } catch (e) {
      if (e.status === 401) { navigate('login'); return; }
      this.error = e.message || t('common.error');
    } finally {
      this.loading = false;
    }
  },

  computeTotal() {
    this.total = this.items.reduce((s, i) => {
      const price = i.unitPrice || i.price || 0;
      const qty = i.quantity || 1;
      return s + price * qty;
    }, 0);
  },

  async removeItem(productId) {
    const ok = await showConfirm(t('cart.removeItemTitle'), t('cart.removeItemConfirm'), { type: 'danger', confirmText: t('common.remove') });
    if (!ok) return;
    try {
      await api.delete(`/cart/items/${productId}`);
      await this.refresh();
      updateCartBadge();
    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  async updateQty(productId, qty) {
    try {
      await api.put(`/cart/items/${productId}`, { quantity: parseInt(qty) || 1 });
      await this.refresh();
    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  async clearCart() {
    const ok = await showConfirm(t('cart.clear'), t('cart.clearConfirm'), { type: 'danger' });
    if (!ok) return;
    try {
      await api.delete('/cart');
      await this.refresh();
      updateCartBadge();
      showToast(t('cart.cleared'), 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  async refresh() {
    try {
      const cart = await api.get('/cart');
      this.items = cart.items || [];
      this.empty = this.items.length === 0;
      this.computeTotal();
    } catch { /* ignore */ }
  },
}));

export default async function renderCart(container) {
  if (!(await requireAuth())) return;

  registerRouteCleanup(() => document.body.classList.remove('has-floating-bar'));
  document.body.classList.add('has-floating-bar');

  container.innerHTML = `
    <div x-data="cartPage">
      <template x-if="loading">
        <div><i class="fas fa-spinner spinner"></i> ${t('common.loading')}</div>
      </template>
      <template x-if="!loading && empty">
        <div>
          <div class="section-header"><h2><i class="fas fa-shopping-cart"></i> ${t('cart.title')}</h2></div>
          <div class="empty-state">
            <i class="fas fa-shopping-cart" style="font-size:3rem;color:var(--text-muted);margin-bottom:16px"></i>
            <h3>${t('cart.empty')}</h3>
            <p style="color:var(--text-muted);margin-bottom:20px">${t('cart.emptyDesc')}</p>
            <a href="#/products" class="btn btn-primary"><i class="fas fa-store"></i> ${t('cart.browseProducts')}</a>
          </div>
        </div>
      </template>
      <template x-if="!loading && error">
        <div>
          <div class="section-header"><h2><i class="fas fa-shopping-cart"></i> ${t('cart.title')}</h2></div>
          <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3 x-text="error"></h3>
            <button class="btn btn-primary" @click="init()">${t('common.retry')}</button>
          </div>
        </div>
      </template>
      <template x-if="!loading && !empty && !error">
        <div>
          <div class="section-header">
            <h2><i class="fas fa-shopping-cart"></i> ${t('cart.title')}</h2>
            <button class="btn btn-danger btn-sm" @click="clearCart()"><i class="fas fa-trash-alt"></i> ${t('cart.clear')}</button>
          </div>
          <div class="cart-table-wrapper">
            <table class="cart-table">
              <thead>
                <tr>
                  <th>${t('cart.product')}</th>
                  <th>${t('cart.price')}</th>
                  <th>${t('cart.quantity')}</th>
                  <th>${t('cart.subtotal')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <template x-for="item in items" :key="item.productId">
                  <tr>
                    <td class="cart-product-cell">
                      <a :href="'#/product-detail?id=' + item.productId"
                         style="display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text-primary)">
                        <template x-if="item.productImageUrl || item.imageUrl">
                          <img :src="item.productImageUrl || item.imageUrl"
                               :alt="item.productTitle || ''"
                               style="width:48px;height:48px;object-fit:cover;border-radius:6px;flex-shrink:0;border:1px solid var(--border)"
                               loading="lazy">
                        </template>
                        <template x-if="!(item.productImageUrl || item.imageUrl)">
                          <div style="width:48px;height:48px;border-radius:6px;background:var(--background-secondary);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border)">
                            <i class="fas fa-image" style="color:var(--text-muted);font-size:1.2rem"></i>
                          </div>
                        </template>
                        <span x-text="item.productTitle || ('Product #' + item.productId)"></span>
                      </a>
                    </td>
                    <td class="cart-price-cell" x-text="formatPrice(item.unitPrice || item.price || 0)"></td>
                    <td class="cart-qty-cell">
                      <input type="number" class="form-input cart-qty-input"
                             :value="item.quantity || 1" min="1"
                             @change="updateQty(item.productId, $event.target.value)">
                    </td>
                    <td class="cart-subtotal-cell" x-text="formatPrice((item.unitPrice || item.price || 0) * (item.quantity || 1))"></td>
                    <td class="cart-remove-cell">
                      <button class="btn btn-ghost btn-icon remove-item text-danger" @click="removeItem(item.productId)" :aria-label="t('common.remove')">
                        <i class="fas fa-times"></i>
                      </button>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="cart-footer">
            <div class="cart-total">${t('cart.total')}: <span class="cart-total-amount" x-text="formatPrice(total)"></span></div>
            <a href="#/checkout" class="btn btn-primary btn-lg"><i class="fas fa-credit-card"></i> ${t('cart.checkout')}</a>
          </div>
          <div class="cart-floating-bar" id="cartFloatingBar" aria-hidden="true">
            <div class="cart-total">${t('cart.total')}: <span class="cart-total-amount" x-text="formatPrice(total)"></span></div>
            <a href="#/checkout" class="btn btn-primary"><i class="fas fa-credit-card"></i> ${t('cart.checkout')}</a>
          </div>
        </div>
      </template>
    </div>`;
}
