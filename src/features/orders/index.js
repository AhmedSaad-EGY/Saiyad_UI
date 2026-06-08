import { api } from '../../shared/api/client.js';

export async function fetchOrder(orderId) {
  return api.get(`/orders/${orderId}`);
}

export async function fetchOrders(page = 1, pageSize = 10) {
  return api.get('/orders', { page, pageSize });
}

export async function cancelOrder(orderId) {
  return api.put(`/orders/${orderId}/cancel`);
}
