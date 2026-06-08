import { api } from '../../shared/api/client.js';

export async function fetchProductRating(productId) {
  try {
    return await api.get(`/reviews/product/${productId}/rating`);
  } catch { return null; }
}

export async function fetchProductReviews(productId) {
  try {
    return await api.get(`/reviews/product/${productId}`);
  } catch { return null; }
}

export async function submitReview(productId, rating, comment) {
  return api.post('/reviews', { productId, rating, comment });
}
