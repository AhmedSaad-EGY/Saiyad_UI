import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { getCartItemCount, requireAuth, syncCartBadgeCount } from '../core/auth/index.js';
import { navigate, registerRouteCleanup } from '../core/router/index.js';
import { formatPrice } from '../core/utils/format.js';
import { showConfirm, showToast } from '../core/utils/ui.js';
import { animate } from '../core/utils/dom.js';
import { createSwipeReveal } from '../core/utils/swipe.js';
import Alpine from 'alpinejs';

let _cartSwipeCleanup = null;

Alpine.data('cartPage', () => ({
  items: [],
  total: 0,
  loading: true,
  empty: false,
  error: '',

  formatPrice,

  async init() {
    try {
      const cart = await api.get('/cart');
      this.items = cart.items || [];
      this.empty = this.items.length === 0;
      this.computeTotal();
      syncCartBadgeCount(getCartItemCount(this.items));
    } catch (e) {
      if (e.status === 401) { navigate('login'); return; }
      this.error = e.message || t('common.error');
    } finally {
      this.loading = false;
      this.$nextTick(() => this.initSwipe());
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
    const prevTotal = this.total;
    const prevItems = [...this.items];
    this.items = this.items.filter(i => i.productId !== productId);
    this.empty = this.items.length === 0;
    this.computeTotal();
    animateCartTotal(prevTotal, this.total);
    syncCartBadgeCount(getCartItemCount(this.items));
    try {
      await api.delete(`/cart/items/${productId}`);
      this.refresh();
    } catch (e) {
      this.items = prevItems;
      this.empty = this.items.length === 0;
      this.computeTotal();
      syncCartBadgeCount(getCartItemCount(this.items));
      showToast(e.message, 'error');
    }
  },

  async updateQty(productId, qty) {
    const prevTotal = this.total;
    const prevItems = this.items.map(i => ({ ...i }));
    const item = this.items.find(i => i.productId === productId);
    if (!item) return;
    const prevQty = item.quantity;
    item.quantity = parseInt(qty) || 1;
    this.computeTotal();
    animateCartTotal(prevTotal, this.total);
    syncCartBadgeCount(getCartItemCount(this.items));
    try {
      await api.put(`/cart/items/${productId}`, { quantity: parseInt(qty) || 1 });
      this.refresh();
    } catch (e) {
      const restored = prevItems.find(i => i.productId === productId);
      if (restored) restored.quantity = prevQty;
      this.items = prevItems;
      this.computeTotal();
      syncCartBadgeCount(getCartItemCount(this.items));
      showToast(e.message, 'error');
    }
  },

  async clearCart() {
    const ok = await showConfirm(t('cart.clear'), t('cart.clearConfirm'), { type: 'danger' });
    if (!ok) return;
    const prevTotal = this.total;
    const prevItems = [...this.items];
    this.items = [];
    this.empty = true;
    this.total = 0;
    animateCartTotal(prevTotal, 0);
    syncCartBadgeCount(0);
    try {
      await api.delete('/cart');
      showToast(t('cart.cleared'), 'success');
      this.refresh();
    } catch (e) {
      this.items = prevItems;
      this.empty = this.items.length === 0;
      this.computeTotal();
      syncCartBadgeCount(getCartItemCount(this.items));
      showToast(e.message, 'error');
    }
  },

  async refresh() {
    try {
      const cart = await api.get('/cart');
      this.items = cart.items || [];
      this.empty = this.items.length === 0;
      this.computeTotal();
      syncCartBadgeCount(getCartItemCount(this.items));
    } catch { /* ignore */ }
  },

  initSwipe() {
    const isMobile = window.innerWidth < 768;
    const table = document.querySelector('.cart-table');
    if (!isMobile || !table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Clean up previous instance if any
    if (this._swipeReveal) {
      this._swipeReveal.destroy();
      this._swipeReveal = null;
    }

    const component = this;

    this._swipeReveal = createSwipeReveal({
      container: tbody,
      itemSelector: 'tr',
      revealWidth: 80,
      autoActivate: 150,
      getActionEl(row) {
        let deleteEl = row.querySelector('.cart-swipe-delete');
        if (!deleteEl) {
          deleteEl = document.createElement('div');
          deleteEl.className = 'cart-swipe-delete';
          deleteEl.innerHTML = '<i class="fas fa-trash-alt"></i>';
          row.appendChild(deleteEl);
          row.style.position = 'relative';
          row.style.overflow = 'hidden';
        }
        return deleteEl;
      },
      onAction(row) {
        // Get productId from Alpine x-for scope
        const alpineScope = row.__x?.$data || row.closest('[x-data]')?.__x?.$data;
        let pid = null;
        if (alpineScope?.item?.productId) {
          pid = alpineScope.item.productId;
        } else if (alpineScope?.items) {
          // Fallback: scan items by row index
          const idx = Array.from(row.parentNode.children).indexOf(row);
          pid = alpineScope.items[idx]?.productId;
        } else {
          // Last resort: parse from the product link href
          const link = row.querySelector('a[href*="product-detail"]');
          if (link) {
            const m = link.getAttribute('href').match(/id=(\d+)/);
            if (m) pid = parseInt(m[1]);
          }
        }
        if (pid) component.removeItem(pid);
      },
    });

    _cartSwipeCleanup = () => {
      if (component._swipeReveal) {
        component._swipeReveal.destroy();
        component._swipeReveal = null;
      }
    };
  }
}));

export default async function renderCart(container) {
  if (!(await requireAuth())) return;

  registerRouteCleanup(() => {
    document.body.classList.remove('has-floating-bar');
    if (_cartSwipeCleanup) {
      _cartSwipeCleanup();
      _cartSwipeCleanup = null;
    }
  });
  document.body.classList.add('has-floating-bar');

  container.innerHTML = `
    <div x-data="cartPage">
      <template x-if="loading">
        <div><i class="fas fa-spinner spinner"></i> ${t('common.loading')}</div>
      </template>
      <div x-show="!loading && empty" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div>
          <div class="section-header"><h2><i class="fas fa-shopping-cart"></i> ${t('cart.title')}</h2></div>
          <div class="empty-state">
            <i class="fas fa-shopping-cart mb-3 text-muted" style="font-size:3.5rem"></i>
            <h3>${t('cart.empty')}</h3>
            <p class="text-muted mb-4">${t('cart.emptyDesc')}</p>
            <a href="#/products" class="btn btn-primary"><i class="fas fa-store"></i> ${t('cart.browseProducts')}</a>
          </div>
        </div>
      </div>
      <div x-show="!loading && error" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div>
          <div class="section-header"><h2><i class="fas fa-shopping-cart"></i> ${t('cart.title')}</h2></div>
          <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3 x-text="error"></h3>
            <button class="btn btn-primary" @click="init()">${t('common.retry')}</button>
          </div>
        </div>
      </div>
      <div x-show="!loading && !empty && !error" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        <div>
          <div class="section-header">
            <h2><i class="fas fa-shopping-cart"></i> ${t('cart.title')}</h2>
            <button class="btn btn-danger btn-sm" @click="clearCart()"><i class="fas fa-trash-alt"></i> ${t('cart.clear')}</button>
          </div>
          <div class="cart-table-wrapper">
            <table class="cart-table table">
              <caption class="text-muted" style="caption-side:bottom;margin-top:8px;font-size:0.78rem">${t('cart.title')}</caption>
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
                        <template x-if="item.productImageUrl || item.imageUrl">
                          <img :src="item.productImageUrl || item.imageUrl"
                               :alt="item.productTitle || ''"
                               class="flex-shrink-0 rounded-2" style="width:48px;height:48px;object-fit:cover;border:1px solid var(--border)"
                               loading="lazy">
                        </template>
                        <template x-if="!(item.productImageUrl || item.imageUrl)">
                          <div class="d-flex align-items-center justify-content-center flex-shrink-0 rounded-2" style="width:48px;height:48px;background:var(--body-bg);border:1px solid var(--border)">
                            <i class="fas fa-image text-muted fs-6"></i>
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
                      <button class="btn btn-ghost btn-icon remove-item text-danger" @click="removeItem(item.productId)" :aria-label="$t('common.remove')">
                        <i class="fas fa-times"></i>
                      </button>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="cart-footer">
            <div class="cart-total">${t('cart.total')}: <span class="cart-total-amount" id="cartTotalDisplay" x-text="formatPrice(total)"></span></div>
            <a href="#/checkout" class="btn btn-primary btn-lg"><i class="fas fa-credit-card"></i> ${t('cart.checkout')}</a>
          </div>
          <div class="cart-floating-bar" id="cartFloatingBar" aria-hidden="true">
            <div class="cart-total">${t('cart.total')}: <span class="cart-total-amount" id="cartTotalFloating" x-text="formatPrice(total)"></span></div>
            <a href="#/checkout" class="btn btn-primary"><i class="fas fa-credit-card"></i> ${t('cart.checkout')}</a>
          </div>
        </div>
      </div>
    </div>`;
}

// Expose for cart total animation
export function animateCartTotal(prev, current) {
  const el = document.getElementById('cartTotalDisplay');
  if (!el) return;
  const diff = current - prev;
  el.style.color = diff > 0 ? 'var(--danger)' : 'var(--success)';
  animate(el, 'bounceIn', { duration: '0.4s' });
  setTimeout(() => {
    el.style.color = '';
  }, 400);
}
