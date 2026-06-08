import { api } from '../../shared/api/client.js';

export async function addToCart(productId, quantity = 1) {
  await api.post('/cart/items', { productId, quantity });
  document.dispatchEvent(new CustomEvent('cart-updated'));
}
