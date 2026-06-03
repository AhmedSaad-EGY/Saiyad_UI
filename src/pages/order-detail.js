import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth } from '../core/auth/index.js';
import { navigate, registerRouteCleanup } from '../core/router/index.js';
import { showLoading, escapeHtml, observeAnimations } from '../core/utils/dom.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../core/utils/format.js';
import { showConfirm, showToast } from '../core/utils/ui.js';
import { setPageMeta } from '../core/utils/seo.js';

function getTimelineSteps(status) {
  const steps = [
    { key: 'Confirmed', icon: 'fa-check', label: t('order.confirmed') || 'Confirmed' },
    { key: 'Processing', icon: 'fa-cog', label: t('order.processing') || 'Processing' },
    { key: 'Shipped', icon: 'fa-truck', label: t('order.shipped') || 'Shipped' },
    { key: 'Delivered', icon: 'fa-box-open', label: t('order.delivered') || 'Delivered' },
  ];
  const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentIdx = statusOrder.indexOf(status);
  const cancelled = status === 'Cancelled';

  return steps.map((step, i) => {
    const stepIdx = statusOrder.indexOf(step.key);
    let cls = '';
    if (cancelled) cls = '';
    else if (stepIdx < currentIdx) cls = 'completed';
    else if (stepIdx === currentIdx) cls = 'active';
    return { ...step, cls };
  });
}

export default async function renderOrderDetail(container) {
  if (!await requireAuth()) return;

  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const orderId = params.get('id');
  if (!orderId) { navigate('dashboard?tab=orders'); return; }
  setPageMeta("Order Details", undefined, true);

  showLoading(container);

  try {
    const order = await api.get(`/orders/${orderId}`);
    const timelineSteps = getTimelineSteps(order.status);
    const items = order.items || [];
    const subtotal = items.reduce((s, i) => s + (i.subtotal || (i.unitPrice * i.quantity)), 0);

    container.innerHTML = `
      <div class="section-header">
        <h2><i class="fas fa-file-invoice"></i> ${t('order.title')} #${order.id}</h2>
        <a href="#/dashboard?tab=orders" class="btn btn-ghost btn-sm"><i class="fas fa-arrow-left"></i> ${t('order.backToOrders')}</a>
      </div>

      <!-- Order Timeline -->
      ${order.status !== 'Cancelled' ? `
      <div class="card mb-4 animate-on-scroll">
        <div class="card-body">
          <div class="order-timeline" role="list" aria-label="${t('order.status')}">
            ${timelineSteps.map(step => `
              <div class="order-timeline-step ${step.cls}" role="listitem">
                <div class="order-timeline-icon">
                  <i class="fas ${step.cls === 'completed' ? 'fa-check' : step.icon}"></i>
                </div>
                <span class="order-timeline-label">${step.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      ` : `
      <div class="alert alert-error mb-4"><i class="fas fa-times-circle"></i> ${t('order.cancelled') || 'This order has been cancelled.'}</div>
      `}

      <div class="row g-4">
        <!-- Main content column -->
        <div class="col-lg-8">
          <!-- Order Items -->
          <div class="card mb-4 animate-on-scroll">
            <div class="card-header">
              <h3 class="mb-0"><i class="fas fa-box"></i> ${t('order.items')} (${items.length})</h3>
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
                              : `<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:var(--body-bg);border-radius:var(--radius);color:var(--text-muted)"><i class="fas fa-image"></i></div>`
                            }
                            <a href="#/product-detail?id=${item.productId}" class="text-reset text-decoration-none fw-medium">${escapeHtml(item.productTitle || 'Product')}</a>
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
          </div>

          <!-- Shipping & Payment Info -->
          <div class="row g-4">
            <div class="col-md-6">
              <div class="card animate-on-scroll stagger-1">
                <div class="card-header"><h3 class="mb-0"><i class="fas fa-truck"></i> ${t('order.shippingInfo') || 'Shipping'}</h3></div>
                <div class="card-body">
                  <p class="mb-1"><strong>${escapeHtml(order.shippingAddress?.fullName || order.buyerName || 'N/A')}</strong></p>
                  <p class="text-muted small mb-1">${escapeHtml(order.shippingAddress?.addressLine || order.address || '-')}</p>
                  <p class="text-muted small mb-1">${escapeHtml(order.shippingAddress?.city || '')}${order.shippingAddress?.postalCode ? ', ' + escapeHtml(order.shippingAddress.postalCode) : ''}</p>
                  <p class="text-muted small">${escapeHtml(order.shippingAddress?.phone || '')}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card animate-on-scroll stagger-2">
                <div class="card-header"><h3 class="mb-0"><i class="fas fa-credit-card"></i> ${t('order.paymentInfo') || 'Payment'}</h3></div>
                <div class="card-body">
                  <p class="mb-1"><strong>${t('order.method') || 'Method'}:</strong> ${escapeHtml(order.paymentMethod || 'Wallet')}</p>
                  <p class="mb-1"><strong>${t('order.date')}:</strong> ${formatDate(order.createdAt)}</p>
                  <p class="mb-0"><strong>${t('order.status')}:</strong> <span class="status ${statusClass(order.status)}">${tStatus(order.status)}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: Order Summary + Actions -->
        <div class="col-lg-4">
          <div class="checkout-sidebar">
            <div class="card mb-4 animate-on-scroll">
              <div class="card-header"><h3 class="mb-0"><i class="fas fa-receipt"></i> ${t('order.summary') || 'Summary'}</h3></div>
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">${t('cart.subtotal') || 'Subtotal'}</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">${t('order.shipping') || 'Shipping'}</span>
                  <span>${formatPrice(order.shippingCost || 0)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">${t('order.tax') || 'Tax'}</span>
                  <span>${formatPrice(order.tax || 0)}</span>
                </div>
                <hr style="border-color:var(--border);margin:12px 0">
                <div class="d-flex justify-content-between">
                  <strong>${t('cart.total')}</strong>
                  <strong class="text-primary fs-5">${formatPrice(order.totalPrice)}</strong>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="d-flex flex-column gap-2 animate-on-scroll stagger-3">
              ${order.status === 'Pending' || order.status === 'Confirmed' ? `
                <button class="btn btn-outline-danger w-100" id="cancelOrderBtn"><i class="fas fa-times"></i> ${t('order.cancel')}</button>
              ` : ''}
              <a href="#/products" class="btn btn-primary w-100"><i class="fas fa-redo"></i> ${t('order.reorder') || 'Shop Again'}</a>
            </div>
            <div id="cancelOrderResult" class="mt-3"></div>
          </div>
        </div>
      </div>`;

    observeAnimations();

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
          showToast(t("order.cancelled"), "success");
          const timer = setTimeout(() => navigate(`order-detail?id=${orderId}`), 1500);
          registerRouteCleanup(() => clearTimeout(timer));
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
