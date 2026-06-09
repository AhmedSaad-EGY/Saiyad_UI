import { t } from '../../shared/utils/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../../shared/utils/format.js';

export function renderOrderItems(order, items) {
  return `
    <div class="card mb-4 animate-on-scroll">
      <div class="card-header">
        <h3 class="mb-0"><i class="fas fa-box" aria-hidden="true"></i> ${t('order.items')} (${items.length})</h3>
      </div>
      <div class="card-body">
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>${t('cart.product')}</th><th>${t('order.seller')}</th><th>${t('order.quantity')}</th><th>${t('order.price')}</th><th>${t('order.subtotal')}</th></tr></thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-3">
                      ${item.productImageUrl || item.imageUrl
                        ? `<img src="${item.productImageUrl || item.imageUrl}" alt="${escapeHtml(item.productTitle || '')}" style="width:48px;height:48px;object-fit:cover;border-radius:var(--radius);border:1px solid var(--border)" loading="lazy">`
                        : `<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:var(--body-bg);border-radius:var(--radius);color:var(--text-muted)"><i class="fas fa-image" aria-hidden="true"></i></div>`
                      }
                      <a href="#/product-detail?id=${item.productId}" class="text-reset text-decoration-none fw-medium">${escapeHtml(item.productTitle || t('common.product'))}</a>
                    </div>
                  </td>
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
    </div>`;
}

export function renderShippingInfo(order) {
  return `
    <div class="card animate-on-scroll stagger-1">
      <div class="card-header"><h3 class="mb-0"><i class="fas fa-truck" aria-hidden="true"></i> ${t('order.shippingInfo')}</h3></div>
      <div class="card-body">
        <p class="mb-1"><strong>${escapeHtml(order.shippingAddress?.fullName || order.buyerName || 'N/A')}</strong></p>
        <p class="text-muted small mb-1">${escapeHtml(order.shippingAddress?.addressLine || order.address || '-')}</p>
        <p class="text-muted small mb-1">${escapeHtml(order.shippingAddress?.city || '')}${order.shippingAddress?.postalCode ? `, ${escapeHtml(order.shippingAddress.postalCode)}` : ''}</p>
        <p class="text-muted small">${escapeHtml(order.shippingAddress?.phone || '')}</p>
      </div>
    </div>`;
}

export function renderPaymentInfo(order) {
  return `
    <div class="card animate-on-scroll stagger-2">
      <div class="card-header"><h3 class="mb-0"><i class="fas fa-credit-card" aria-hidden="true"></i> ${t('order.paymentInfo')}</h3></div>
      <div class="card-body">
        <p class="mb-1"><strong>${t('order.method')}:</strong> ${escapeHtml(order.paymentMethod ?? '')}</p>
        <p class="mb-1"><strong>${t('order.date')}:</strong> ${formatDate(order.createdAt)}</p>
        <p class="mb-0"><strong>${t('order.status')}:</strong> <span class="status ${statusClass(order.status)}">${tStatus(order.status)}</span></p>
      </div>
    </div>`;
}

export function renderOrderSummary(order, subtotal) {
  return `
    <div class="card mb-4 animate-on-scroll">
      <div class="card-header"><h3 class="mb-0"><i class="fas fa-receipt" aria-hidden="true"></i> ${t('order.summary')}</h3></div>
      <div class="card-body">
        <div class="d-flex justify-content-between mb-2">
          <span class="text-muted">${t('cart.subtotal')}</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span class="text-muted">${t('order.shipping')}</span>
          <span>${formatPrice(order.shippingCost || 0)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span class="text-muted">${t('order.tax')}</span>
          <span>${formatPrice(order.tax || 0)}</span>
        </div>
        <hr style="border-color:var(--border);margin:12px 0">
        <div class="d-flex justify-content-between">
          <strong>${t('cart.total')}</strong>
          <strong class="text-primary fs-5">${formatPrice(order.totalPrice)}</strong>
        </div>
      </div>
    </div>`;
}

export function renderQuickActions(order) {
  const cancelBtn = order.status === 'Pending' || order.status === 'Confirmed'
    ? `<button class="btn btn-outline-danger w-100" id="cancelOrderBtn"><i class="fas fa-times" aria-hidden="true"></i> ${t('order.cancel')}</button>`
    : '';
  return `
    <div class="d-flex flex-column gap-2 animate-on-scroll stagger-3">
      ${cancelBtn}
      <a href="#/products" class="btn btn-primary w-100"><i class="fas fa-redo" aria-hidden="true"></i> ${t('order.reorder')}</a>
    </div>
    <div id="cancelOrderResult" class="mt-3"></div>`;
}

export function renderOrderNotFound() {
  return `<div class="empty-state"><i class="fas fa-file-invoice" aria-hidden="true"></i><h3>${t('order.notFound')}</h3><a href="#/dashboard?tab=orders" class="btn btn-primary mt-3">${t('order.backToOrders')}</a></div>`;
}
