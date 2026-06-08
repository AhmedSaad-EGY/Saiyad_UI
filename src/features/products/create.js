import { api } from '../../shared/api/client.js';

export async function createProduct(formData) {
  return api.post('/products', formData);
}
