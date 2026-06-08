import { t } from '../../app/i18n.js';
import { escapeHtml, renderEmptyState, observeAnimations } from '../../shared/utils/dom.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../../shared/utils/format.js';
import { manualPaginationHtml, wirePagination } from '../ui/pagination.js';
import { showToast } from '../ui/toast.js';
import { showConfirm } from '../ui/modal.js';
import { fetchOrders, cancelOrder } from '../../features/dashboard/index.js';

export async function renderOrders(content) {
  content.innerHTML = `<div class="card"><div class="card-header"><h3><i class="fas fa-box" aria-hidden="true"></i> ${t("dash.orders")}</h3></div><div class="card-body"><div id="ordersList"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div></div></div>`;

  let page = 1;
  const pageSize = 10;

  async function loadOrders() {
    const list = document.getElementById("ordersList");
    list.innerHTML = `
      <div class="p-2">
        <div class="skeleton-row w-100 mb-2"></div>
        <div class="skeleton-row w-100 mb-2"></div>
        <div class="skeleton-row w-100 mb-2"></div>
        <div class="skeleton-row w-100 mb-2"></div>
      </div>
    `;
    try {
      const data = await fetchOrders(page, pageSize);
      const orders = data.items || data.data || [];
      if (!orders.length) {
        renderEmptyState(list, {
          icon: "fa-box",
          title: t("dash.noOrders"),
          actionText: t("cart.browseProducts"),
          actionHref: "#/products",
        });
        return;
      }
      const total = data.totalCount || data.total || orders.length;
      const pages = Math.ceil(total / pageSize);
      list.innerHTML = `
        <div class="table-wrapper animate-on-scroll">
          <table class="table">
            <caption class="mt-2 text-muted small caption-meta">${t("dash.orders")}</caption>
            <thead><tr><th scope="col">${t("dash.orderNum")}</th><th scope="col">${t("cart.total")}</th><th scope="col">${t("product.status")}</th><th scope="col">${t("dash.date")}</th><th scope="col"></th></tr></thead>
            <tbody>${orders
              .map(
                (o) => `
              <tr>
                <td>#${o.id}</td>
                <td class="fw-semibold">${formatPrice(o.totalPrice)}</td>
                <td><span class="status ${statusClass(o.status)}">${tStatus(o.status)}</span></td>
                <td>${formatDate(o.createdAt || o.orderDate)}</td>
                <td>
                  <a href="#/order-detail?id=${o.id}" class="btn btn-outline btn-sm">${t("dash.view")}</a>
                  ${o.status === "Pending" || o.status === "Confirmed" ? `<button class="btn btn-outline-danger btn-sm cancel-order-btn ms-1" data-order-id="${o.id}">${t("order.cancel")}</button>` : ""}
                </td>
              </tr>
            `,
              )
              .join("")}</tbody>
          </table>
        </div>
        ${manualPaginationHtml({ page, totalPages: pages, prefix: 'dashOrders' })}
      `;
      wirePagination({ container: list, prefix: 'dashOrders', onPrev() { if (page > 1) { page--; loadOrders(); } }, onNext() { if (page < pages) { page++; loadOrders(); } } });
      observeAnimations();

      list.querySelectorAll(".cancel-order-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const orderId = btn.dataset.orderId;
          const ok = await showConfirm(
            t("order.cancel"),
            t("order.cancelConfirm"),
            { type: "danger", confirmText: t("order.cancel") }
          );
          if (!ok) return;
          btn.disabled = true;
          btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("order.cancelling")}`;
          try {
            await cancelOrder(orderId);
            showToast(t("order.cancelled"), "success");
            loadOrders();
          } catch (err) {
            showToast(err.message || t("order.cancelError"), "error");
            btn.disabled = false;
            btn.textContent = t("order.cancel");
          }
        });
      });
    } catch (e) {
      list.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(e.message)}</div>`;
    }
  }

  await loadOrders();
}
