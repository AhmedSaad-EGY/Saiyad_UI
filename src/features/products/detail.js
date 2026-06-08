import { api } from '../../shared/api/client.js';

export async function fetchProductById(id) {
  return api.get(`/products/${id}`);
}

export async function fetchProducts(params) {
  return api.get('/products', params);
}
