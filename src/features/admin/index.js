import { api } from '../../shared/api/client.js';
import { normalizeMediaUrls } from '../../shared/utils/media-url.js';

export async function fetchAdminUsers(page, pageSize) {
  return api.get('/users', { page, pageSize });
}

export async function toggleUserStatus(userId) {
  return api.patch(`/users/${userId}/toggle-status`);
}

export async function fetchReports(page = 1, pageSize = 20) {
  return api.get('/reports', { page, pageSize });
}

export async function resolveReport(reportId, body) {
  return api.patch(`/reports/${reportId}/resolve`, body || { newStatus: 'Resolved' });
}

export async function fetchAdminOrders(page, pageSize) {
  return normalizeMediaUrls(await api.get('/orders/admin', { page, pageSize }));
}

export async function fetchAdminProducts(page, pageSize) {
  return normalizeMediaUrls(await api.get('/products/admin', { page, pageSize }));
}

export async function updateProductStatus(productId, status) {
  return api.patch(`/products/${productId}/status`, { status });
}

export async function fetchPendingReviews(page, pageSize) {
  return normalizeMediaUrls(await api.get('/products/pending-review', { page, pageSize }));
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

export async function fetchSystemWalletTransactions(page, pageSize) {
  return api.get('/admin/system-wallet/transactions', { page, pageSize });
}

export async function fetchSubscriptionPlans() {
  return api.get('/subscriptionplans/admin');
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

export async function approveRoleRequest(userId) {
  return api.patch(`/users/${userId}/approve-role-request`);
}

export async function rejectRoleRequest(userId, reason) {
  return api.patch(`/users/${userId}/reject-role-request`, { reason: reason || null });
}

export async function fetchProductReviews(productId) {
  return api.get(`/reviews/product/${productId}`);
}

export async function adminDeleteReview(reviewId, reason) {
  return api.delete(`/reviews/${reviewId}/admin`, { reason: reason || null });
}

export async function fetchDashboardStats() {
  return api.get('/admin/dashboard');
}

export function computeFeeTotals(txns) {
  const items = Array.isArray(txns) ? txns : (txns?.items || txns?.data || []);
  const feeTypes = new Set([
    "PlatformFee",
    "PlatformFeeCredit",
    "PlatformFeeRefunded",
    "SubscriptionPayment",
    "SubscriptionRevenueCredit",
    "AuctioneerFeeCredit",
  ]);
  const feeTxns = items.filter((txn) => feeTypes.has(txn.type));
  const totalFees = feeTxns.reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
  return { feeTxns, totalFees };
}
