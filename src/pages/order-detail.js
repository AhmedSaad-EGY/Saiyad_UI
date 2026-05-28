import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth } from '../core/auth/index.js';
import { navigate } from '../core/router/index.js';
import { showLoading, escapeHtml } from '../core/utils/dom.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../core/utils/format.js';
import { showConfirm } from '../core/utils/ui.js';

export default async function renderOrderDetail(container) {
  if (!await requireAuth()) return;

  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const orderId = params.get('id');
  if (!orderId) { navigate('dashboard?tab=orders'); return; }

  showLoading(container);

  try {
    const order = await api.get(`/orders/${orderId}`);
    container.innerHTML = `
      <div class="section-header">
        <h2><i class="fas fa-file-invoice"></i> ${t('order.title')} #${order.id}</h2>
        <a href="#/dashboard?tab=orders" class="btn btn-ghost btn-sm"><i class="fas fa-arrow-left"></i> ${t('order.backToOrders')}</a>
      </div>
      <div class="card mb-3">
        <div class="card-body">
        <div class="d-flex flex-wrap gap-4 mb-3">
          <div><strong>${t('order.status')}:</strong> <span class="status ${statusClass(order.status)}">${tStatus(order.status)}</span></div>
          <div><strong>${t('order.date')}:</strong> ${formatDate(order.createdAt)}</div>
          <div><strong>${t('order.buyer')}:</strong> ${escapeHtml(order.buyerName || 'N/A')}</div>
          <div><strong>${t('order.total')}:</strong> ${formatPrice(order.totalPrice)}</div>
        </div>
        ${order.status === "Pending" || order.status === "Confirmed" ? `
          <div class="mt-3 pt-3" style="border-top:1px solid var(--border)">
            <button class="btn btn-outline-danger" id="cancelOrderBtn"><i class="fas fa-times"></i> ${t('order.cancel')}</button>
          </div>
        ` : ""}
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3 class="mb-0">${t('order.items')}</h3>
        </div>
        <div class="card-body">
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>${t('cart.product')}</th><th>${t('order.seller')}</th><th>${t('order.quantity')}</th><th>${t('order.price')}</th><th>${t('order.subtotal')}</th></tr></thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td><a href="#/product-detail?id=${item.productId}" class="text-reset text-decoration-none fw-medium">${escapeHtml(item.productTitle || 'Product')}</a></td>
                  <td>${item.sellerName ? `<a href="#/seller-profile?userId=${item.sellerId}" class="text-primary">${escapeHtml(item.sellerName)}</a>` : '-'}</td>
                  <td>${item.quantity}</td>
                  <td>${formatPrice(item.unitPrice)}</td>
                  <td class="fw-semibold">${formatPrice(item.subtotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        </div>
      </div>
      <div id="cancelOrderResult"></div>`;
      const cancelBtn = document.getElementById("cancelOrderBtn");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", async () => {
          const ok = await showConfirm(
            t("order.cancel"),
            t("order.cancelConfirm"),
            { type: "danger", confirmText: t("order.cancel") }
          );
          if (!ok) return;
          cancelBtn.disabled = true;
          cancelBtn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("order.cancelling")}`;
          try {
            await api.put(`/orders/${orderId}/cancel`);
            document.getElementById("cancelOrderResult").innerHTML = `<div class="alert alert-success">${t("order.cancelled")}</div>`;
            setTimeout(() => navigate(`order-detail?id=${orderId}`), 1500);
          } catch (err) {
            document.getElementById("cancelOrderResult").innerHTML = `<div class="alert alert-error">${err.message || t("order.cancelError")}</div>`;
            cancelBtn.disabled = false;
            cancelBtn.innerHTML = `<i class="fas fa-times"></i> ${t("order.cancel")}`;
          }
        });
      }
  } catch {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-file-invoice"></i><h3>${t('order.notFound')}</h3><a href="#/dashboard?tab=orders" class="btn btn-primary mt-3">${t('order.backToOrders')}</a></div>`;
  }
}
