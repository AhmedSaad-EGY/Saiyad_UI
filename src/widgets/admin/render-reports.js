import { t } from '../../shared/utils/i18n.js';
import { showLoading, renderEmptyState, escapeHtml } from '../../shared/utils/dom.js';
import { showToast } from '../ui/toast.js';
import { showConfirm } from '../ui/modal.js';
import { formatDate } from '../../shared/utils/format.js';
import { manualPaginationHtml, wirePagination } from '../ui/pagination.js';

let _page = 1;
const PAGE_SIZE = 20;

export async function renderReports(container, { fetchData, onResolve } = {}) {
  _page = 1;
  await renderPage(container, { fetchData, onResolve });
}

async function renderPage(container, { fetchData, onResolve }) {
  showLoading(container);
  try {
    const data = await fetchData(_page, PAGE_SIZE);
    const reports = data.items || data.data || [];
    const total = data.totalCount || data.total || reports.length;
    const pages = Math.ceil(total / PAGE_SIZE);

    if (!reports.length) {
      renderEmptyState(container, { icon: "fa-flag", title: t("admin.noReports") });
      return;
    }

    container.innerHTML = `
      <div class="table-wrapper table-reports"><table class="table">
        <caption class="text-muted mt-2 caption-meta">${t("admin.reports")}</caption>
        <thead><tr>
          <th scope="col">${t("admin.id")}</th>
          <th scope="col">${t("admin.reportType")}</th>
          <th scope="col">${t("admin.reportTarget")}</th>
          <th scope="col">${t("admin.reportMessage")}</th>
          <th scope="col">${t("admin.reportStatus")}</th>
          <th scope="col">${t("dash.date")}</th>
          <th scope="col">${t("common.actions")}</th>
        </tr></thead>
        <tbody>${reports.map(r => {
          const targetInfo = r.targetType
            ? `${r.targetType}${r.targetId ? ` #${r.targetId}` : ''}`
            : '-';
          const msg = (r.message || '').substring(0, 60) + ((r.message || '').length > 60 ? '...' : '');
          return `
          <tr>
            <td data-label="${t("admin.id")}:">${r.id}</td>
            <td data-label="${t("admin.reportType")}:"><span class="badge bg-secondary">${escapeHtml(r.type || '-')}</span></td>
            <td data-label="${t("admin.reportTarget")}:">${escapeHtml(targetInfo)}</td>
            <td data-label="${t("admin.reportMessage")}:">${escapeHtml(msg)}</td>
            <td data-label="${t("admin.reportStatus")}:"><span class="status ${r.status === 'Resolved' ? 'status-available' : r.status === 'Dismissed' ? 'status-draft' : 'status-pending'}">${escapeHtml(r.status || '-')}</span></td>
            <td data-label="${t("dash.date")}:">${formatDate(r.createdAt)}</td>
            <td data-label="${t("common.actions")}:">
              ${r.status !== 'Resolved' && r.status !== 'Dismissed'
                ? `<div class="d-flex gap-1 flex-wrap"><button class="btn btn-sm btn-success resolve-report" data-id="${r.id}">${t("admin.resolve")}</button>
                   <button class="btn btn-sm btn-outline-secondary dismiss-report" data-id="${r.id}">${t("common.dismiss")}</button></div>`
                : `<button class="btn btn-sm btn-outline-info view-report" data-id="${r.id}">${t("common.view")}</button>`}
            </td>
          </tr>`;
        }).join('')}
        </tbody>
      </table></div>
      ${manualPaginationHtml({ page: _page, totalPages: pages, prefix: 'reports' })}`;

    wirePagination({
      container, prefix: 'reports',
      onPrev() { if (_page > 1) { _page--; renderPage(container, { fetchData, onResolve }); } },
      onNext() { if (_page < pages) { _page++; renderPage(container, { fetchData, onResolve }); } }
    });

    container.querySelectorAll(".resolve-report").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const adminNote = prompt(t("admin.reportAdminNote") + ':');
        try {
          await onResolve(btn.dataset.id, { newStatus: 'Resolved', adminNote: adminNote || null });
          showToast(t("admin.reportResolved"), "success");
          renderPage(container, { fetchData, onResolve });
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });

    container.querySelectorAll(".dismiss-report").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const ok = await showConfirm(t("admin.dismissReport"), t("admin.dismissReportConfirm"), { type: "warning" });
        if (!ok) return;
        try {
          await onResolve(btn.dataset.id, { newStatus: 'Dismissed' });
          showToast(t("admin.reportDismissed"), "success");
          renderPage(container, { fetchData, onResolve });
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });

    container.querySelectorAll(".view-report").forEach((btn) => {
      btn.addEventListener("click", () => {
        const report = reports.find(r => r.id == btn.dataset.id);
        if (!report) return;
        const safeId = escapeHtml(String(report.id));
        const safeTargetId = report.targetId ? escapeHtml(String(report.targetId)) : '';
        const details = `
          <div class="p-3">
            <p><strong>${t("admin.id")}:</strong> ${safeId}</p>
            <p><strong>${t("admin.reportType")}:</strong> ${escapeHtml(report.type)}</p>
            <p><strong>${t("admin.reportTarget")}:</strong> ${escapeHtml(report.targetType || '-')} ${safeTargetId ? `#${safeTargetId}` : ''}</p>
            <p><strong>${t("admin.reportMessage")}:</strong> ${escapeHtml(report.message || '-')}</p>
            <p><strong>${t("admin.reportAdminNote")}:</strong> ${escapeHtml(report.adminNote || '-')}</p>
            <p><strong>${t("admin.reportStatus")}:</strong> ${escapeHtml(report.status)}</p>
            <p><strong>${t("common.date")}:</strong> ${formatDate(report.createdAt)}</p>
            ${report.resolvedAt ? `<p><strong>${t("admin.resolvedAt")}:</strong> ${formatDate(report.resolvedAt)}</p>` : ''}
          </div>`;
        const safeTitle = report.message ? escapeHtml(report.message.substring(0, 50)) : `Report #${safeId}`;
        showConfirm(safeTitle, details, { type: "info", confirmText: t("common.close") });
      });
    });
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}
