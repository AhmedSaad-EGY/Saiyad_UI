import { t } from '../../shared/utils/i18n.js';
import { escapeHtml, renderEmptyState } from '../../shared/utils/dom.js';
import { manualPaginationHtml, wirePagination } from '../ui/pagination.js';

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
          </tr></thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>${escapeHtml(String(o.id))}</td>
                <td>${escapeHtml(o.buyerName || "-")}</td>
                <td>${o.totalPrice != null ? `${Number(o.totalPrice).toFixed(2)} EGP` : "-"}</td>
                <td><span class="status ${o.status === 0 || o.status === "Pending" ? "status-pending" : "status-available"}">${escapeHtml(String(o.status))}</span></td>
                <td>${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</td>
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
  } catch (e) {
    panel.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}
