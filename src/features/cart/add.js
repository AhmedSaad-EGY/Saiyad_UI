import { api } from '../../shared/api/client.js';
import { emit } from '../../shared/utils/events.js';

export async function addToCart(productId, quantity = 1) {
  await api.post('/cart/items', { productId, quantity });
  emit('cart:updated');
}
