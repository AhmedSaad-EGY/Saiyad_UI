import { t } from '../../shared/utils/i18n.js';
import { showLoading, renderEmptyState, escapeHtml } from '../../shared/utils/dom.js';
import { showToast } from '../ui/toast.js';

export async function renderReports(container, { fetchData, onResolve } = {}) {
  showLoading(container);
  try {
    const data = await fetchData();
    const reports = data.items || data.data || data || [];
    if (!reports.length) {
      renderEmptyState(container, { icon: "fa-flag", title: t("admin.noReports") });
      return;
    }

    container.innerHTML = `
      <div class="table-wrapper"><table class="table">
        <caption class="text-muted mt-2 caption-meta">${t("admin.reports")}</caption>
        <thead><tr><th scope="col">${t("admin.id")}</th><th scope="col">${t("cart.product")}</th><th scope="col">${t("admin.reportReason")}</th><th scope="col">${t("admin.reportStatus")}</th><th scope="col"></th></tr></thead>
        <tbody>${reports
          .map(
            (r) => `
          <tr>
            <td>${r.id}</td>
            <td>#${r.productId}</td>
            <td>${escapeHtml(r.reason || "-")}</td>
            <td><span class="status ${r.status === "Resolved" ? "status-available" : "status-draft"}">${r.status || "Open"}</span></td>
            <td>${r.status !== "Resolved" ? `<button class="btn btn-sm btn-success resolve-report" data-id="${r.id}">${t("admin.resolve")}</button>` : "-"}</td>
          </tr>`,
          )
          .join("")}
        </tbody>
      </table></div>`;
    container.querySelectorAll(".resolve-report").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await onResolve(btn.dataset.id);
          showToast(t("admin.reportResolved"), "success");
          renderReports(container, { fetchData, onResolve });
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}
