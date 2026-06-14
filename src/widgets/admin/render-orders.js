import { t } from '../../shared/utils/i18n.js';
import { escapeHtml, renderEmptyState } from '../../shared/utils/dom.js';
import { manualPaginationHtml, wirePagination } from '../ui/pagination.js';
import { showToast } from '../ui/toast.js';
import { showConfirm } from '../ui/modal.js';
import { approveReturn, rejectReturn } from '../../features/orders/index.js';

let _page = 1;
const PAGE_SIZE = 20;

export async function renderOrders(container, { fetchOrders } = {}) {
  container.innerHTML = `<div id="ordersPanel">
    <div class="p-4 text-center"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
  </div>`;
  const panel = document.getElementById("ordersPanel");
  try {
    const data = await fetchOrders(_page, PAGE_SIZE);
    const orders = data.items || data.data || [];
    const total = data.totalCount || data.total || orders.length;
    const pages = Math.ceil(total / PAGE_SIZE);

    if (!orders.length) {
      renderEmptyState(panel, { icon: "fa-box", title: t("admin.noOrders") });
      return;
    }

    panel.innerHTML = `
      <div class="table-wrapper">
        <table class="table">
          <caption class="text-muted mt-2 caption-meta">${t("admin.orders")}</caption>
          <thead><tr>
            <th scope="col">#</th>
            <th scope="col">${t("auth.fullName")}</th>
            <th scope="col">${t("order.total")}</th>
            <th scope="col">${t("product.status")}</th>
            <th scope="col">${t("common.date")}</th>
            <th scope="col">${t("common.action")}</th>
          </tr></thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>${escapeHtml(String(o.id))}</td>
                <td>${escapeHtml(o.buyerName || "-")}</td>
                <td>${o.totalPrice != null ? `${Number(o.totalPrice).toFixed(2)} EGP` : "-"}</td>
                <td><span class="status ${o.status === 0 || o.status === "Pending" ? "status-pending" : o.status === 'ReturnRequested' ? 'status-pendingreview' : "status-available"}">${escapeHtml(String(o.status))}</span></td>
                <td>${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</td>
                <td>
                  ${o.status === 'ReturnRequested'
                    ? `<div class="d-flex gap-1">
                        <button class="btn btn-sm btn-success approve-return" data-id="${o.id}"><i class="fas fa-check"></i></button>
                        <button class="btn btn-sm btn-danger reject-return" data-id="${o.id}"><i class="fas fa-times"></i></button>
                       </div>`
                    : '-'}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      ${manualPaginationHtml({ page: _page, totalPages: pages, prefix: 'orders' })}`;

    wirePagination({
      container: panel, prefix: 'orders',
      onPrev() { if (_page > 1) { _page--; renderOrders(container, { fetchOrders }); } },
      onNext() { if (_page < pages) { _page++; renderOrders(container, { fetchOrders }); } }
    });

    panel.querySelectorAll('.approve-return').forEach(btn => {
      btn.addEventListener('click', async () => {
        const orderId = btn.dataset.id;
        const ok = await showConfirm(t("order.approveReturn"), t("order.approveReturnConfirm"), { type: "success" });
        if (!ok) return;
        try {
          await approveReturn(orderId);
          showToast(t("order.returnApproved"), "success");
          renderOrders(container, { fetchOrders });
        } catch (err) {
          showToast(err.message || t("order.returnError"), "error");
        }
      });
    });

    panel.querySelectorAll('.reject-return').forEach(btn => {
      btn.addEventListener('click', async () => {
        const orderId = btn.dataset.id;
        const reason = prompt(t("order.rejectReturnReason"));
        if (!reason) return;
        const ok = await showConfirm(t("order.rejectReturn"), t("order.rejectReturnConfirm"), { type: "danger" });
        if (!ok) return;
        try {
          await rejectReturn(orderId, reason);
          showToast(t("order.returnRejected"), "success");
          renderOrders(container, { fetchOrders });
        } catch (err) {
          showToast(err.message || t("order.returnError"), "error");
        }
      });
    });
  } catch (e) {
    panel.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}
