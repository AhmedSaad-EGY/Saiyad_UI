import Alpine from 'alpinejs';
import { t } from '../../shared/utils/i18n.js';
import { api } from '../../shared/api/client.js';
import { getCartItemCount, syncCartBadgeCount } from '../../shared/utils/ui.js';
import { navigate } from '../../app/router.js';
import { formatPrice } from '../../shared/utils/format.js';
import { showToast, showConfirm } from '../../shared/utils/ui.js';
import { animate } from '../../shared/utils/dom.js';
import { createSwipeReveal } from '../../shared/utils/swipe.js';
import { setPageMeta } from '../../shared/utils/seo.js';

let _cartSwipeCleanup = null;
export function getCartSwipeCleanup() { return _cartSwipeCleanup; }

export async function fetchCartCount() {
  try {
    const data = await api.get('/cart');
    const items = data?.items || data?.cartItems || data || [];
    return Array.isArray(items) ? items.reduce((s, i) => s + (i.quantity || 0), 0) : 0;
  } catch { return 0; }
}

function animateCartTotal(prev, current) {
  const el = document.getElementById('cartTotalDisplay');
  if (!el) return;
  const diff = current - prev;
  el.style.color = diff > 0 ? 'var(--danger)' : 'var(--success)';
  animate(el, 'bounceIn', { duration: '0.4s' });
  setTimeout(() => {
    el.style.color = '';
  }, 400);
}

Alpine.data('cartPage', () => ({
  items: [],
  total: 0,
  loading: true,
  empty: false,
  error: '',

  formatPrice,

  async init() {
    setPageMeta(t('cart.title'), undefined, true);
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
      showToast(t('cart.itemRemoved'), 'success');
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
      const msg = e.status === 400 ? t('cart.insufficientStock', { stock: item.stockQuantity || 0 }) : e.message;
      showToast(msg, 'error');
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
    } catch { /* cart stays empty on error */ }
  },

  initSwipe() {
    const isMobile = window.innerWidth < 768;
    const table = document.querySelector('.cart-table');
    if (!isMobile || !table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

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
          deleteEl.innerHTML = '<i class="fas fa-trash-alt" aria-hidden="true"></i>';
          row.appendChild(deleteEl);
          row.style.position = 'relative';
          row.style.overflow = 'hidden';
        }
        return deleteEl;
      },
      onAction(row) {
        const alpineScope = row.__x?.$data || row.closest('[x-data]')?.__x?.$data;
        let pid = null;
        if (alpineScope?.item?.productId) {
          pid = alpineScope.item.productId;
        } else if (alpineScope?.items) {
          const idx = Array.from(row.parentNode.children).indexOf(row);
          pid = alpineScope.items[idx]?.productId;
        } else {
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
