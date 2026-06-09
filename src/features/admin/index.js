import { api } from '../../shared/api/client.js';

export async function fetchAdminUsers(page, pageSize) {
  return api.get('/users', { page, pageSize });
}

export async function toggleUserStatus(userId) {
  return api.patch(`/users/${userId}/toggle-status`);
}

export async function fetchReports() {
  return api.get('/reports');
}

export async function resolveReport(reportId) {
  return api.put(`/reports/${reportId}/resolve`, { status: 'Resolved' });
}

export async function fetchAdminProducts(page, pageSize) {
  return api.get('/products', { page, pageSize });
}

export async function updateProductStatus(productId, status) {
  return api.patch(`/products/${productId}/status`, { status });
}

export async function fetchPendingReviews(page, pageSize) {
  return api.get('/products/pending-review', { page, pageSize });
}

export async function approveProduct(productId) {
  return api.patch(`/products/${productId}/approve`);
}

export async function rejectProduct(productId, reason) {
  return api.patch(`/products/${productId}/reject`, { reason });
}

export async function fetchCategories() {
  return api.get('/categories');
}

export async function createCategory(name, description) {
  return api.post('/categories', { name, description });
}

export async function deleteCategory(categoryId) {
  return api.delete(`/categories/${categoryId}`);
}

export async function fetchWallet() {
  return api.get('/wallet');
}

export async function fetchWalletTransactions(page, pageSize) {
  return api.get('/wallet/transactions', { page, pageSize });
}

export async function fetchSubscriptionPlans() {
  return api.get('/subscriptionplans');
}

export async function updateSubscriptionPlan(planId, body) {
  return api.put(`/subscriptionplans/${planId}`, body);
}

export async function deleteSubscriptionPlan(planId) {
  return api.delete(`/subscriptionplans/${planId}`);
}

export async function createSubscriptionPlan(body) {
  return api.post('/subscriptionplans', body);
}

export function computeFeeTotals(txns) {
  const feeTxns = (txns.items || txns.data || txns || []).filter(
    txn => txn.type === "PlatformFee" || txn.type === "SubscriptionPayment"
  );
  const totalFees = feeTxns.reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
  return { feeTxns, totalFees };
}
