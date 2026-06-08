import { api } from '../../shared/api/client.js';

export async function fetchWishlist(pageSize = 50) {
  return api.get('/wishlist', { pageSize });
}

export async function removeFromWishlist(productId) {
  return api.delete(`/wishlist/${productId}`);
}

export async function toggleWishlist(productId) {
  try {
    await api.post('/wishlist/toggle', { productId });
    return true;
  } catch {
    return false;
  }
}
