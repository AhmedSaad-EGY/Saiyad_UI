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

export async function requestReturn(orderId) {
  return api.post(`/orders/${orderId}/request-return`);
}

export async function approveReturn(orderId) {
  return api.put(`/orders/${orderId}/approve-return`);
}

export async function rejectReturn(orderId, reason) {
  return api.put(`/orders/${orderId}/reject-return`, { reason });
}

export function calculateSubtotal(items) {
  return items.reduce((s, i) => s + (i.subtotal || (i.unitPrice * i.quantity)), 0);
}
