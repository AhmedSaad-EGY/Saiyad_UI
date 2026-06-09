import { t } from '../shared/utils/i18n.js';
import { requireAuth } from '../features/auth/login.js';
import { fetchOrder, cancelOrder, calculateSubtotal } from '../features/orders/index.js';
import { navigate, registerRouteCleanup } from '../app/router.js';
import { showLoading, observeAnimations, escapeHtml } from '../shared/utils/dom.js';
import { showToast } from '../widgets/ui/toast.js'; import { showConfirm } from '../widgets/ui/modal.js';
import { setPageMeta } from '../shared/utils/seo.js';

import {
  renderOrderTimeline,
  renderOrderItems,
  renderShippingInfo,
  renderPaymentInfo,
  renderOrderSummary,
  renderQuickActions,
  renderOrderNotFound,
} from '../widgets/order-detail/index.js';

export default async function renderOrderDetail(container) {
  if (!await requireAuth()) return;

  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const orderId = params.get('id');
  if (!orderId) { navigate('dashboard?tab=orders'); return; }
  setPageMeta(t('order.title'), undefined, true);

  showLoading(container);

  try {
    const order = await fetchOrder(orderId);
    const items = order.items || [];
    const subtotal = calculateSubtotal(items);

    container.innerHTML = `
      <div class="section-header">
        <h2><i class="fas fa-file-invoice" aria-hidden="true"></i> ${t('order.title')} #${order.id}</h2>
        <a href="#/dashboard?tab=orders" class="btn btn-ghost btn-sm"><i class="fas fa-arrow-left" aria-hidden="true"></i> ${t('order.backToOrders')}</a>
      </div>

      ${renderOrderTimeline(order.status)}

      <div class="row g-4">
        <div class="col-lg-8">
          ${renderOrderItems(order, items)}
          <div class="row g-4">
            <div class="col-md-6">${renderShippingInfo(order)}</div>
            <div class="col-md-6">${renderPaymentInfo(order)}</div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="checkout-sidebar">
            ${renderOrderSummary(order, subtotal)}
            ${renderQuickActions(order)}
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
        cancelBtn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("order.cancelling")}`;
        try {
          await cancelOrder(orderId);
          showToast(t("order.cancelled"), "success");
          const timer = setTimeout(() => navigate(`order-detail?id=${orderId}`), 1500);
          registerRouteCleanup(() => clearTimeout(timer));
        } catch (err) {
          document.getElementById("cancelOrderResult").innerHTML = `<div class="alert alert-error">${escapeHtml(err.message) || t("order.cancelError")}</div>`;
          cancelBtn.disabled = false;
          cancelBtn.innerHTML = `<i class="fas fa-times" aria-hidden="true"></i> ${t("order.cancel")}`;
        }
      });
    }
  } catch {
    container.innerHTML = renderOrderNotFound();
  }
}
