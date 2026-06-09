import { t } from '../../app/i18n.js';
import { escapeHtml, renderEmptyState } from '../../shared/utils/dom.js';
import { manualPaginationHtml, wirePagination } from '../ui/pagination.js';
import { showToast } from '../ui/toast.js';

let _page = 1;
const PAGE_SIZE = 20;

export async function renderUsers(container, { fetchUsers, onToggleUser } = {}) {
  container.innerHTML = `<div id="usersPanel">
    <div class="p-4 text-center"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
  </div>`;
  const panel = document.getElementById("usersPanel");
  try {
    const data = await fetchUsers(_page, PAGE_SIZE);
    const users = data.items || data.data || [];
    const total = data.totalCount || data.total || users.length;
    const pages = Math.ceil(total / PAGE_SIZE);

    if (!users.length) {
      renderEmptyState(panel, { icon: "fa-users", title: t("admin.noUsers") });
      return;
    }

    panel.innerHTML = `
      <div class="table-wrapper">
        <table class="table">
          <caption class="text-muted mt-2 caption-meta">${t("admin.users")}</caption>
          <thead><tr>
            <th scope="col">${t("auth.fullName")}</th>
            <th scope="col">${t("auth.email")}</th>
            <th scope="col">${t("auth.role")}</th>
            <th scope="col">${t("product.status")}</th>
            <th scope="col"></th>
          </tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${escapeHtml(u.fullName || u.name || "-")}</td>
                <td>${escapeHtml(u.email || "-")}</td>
                <td><span class="category-tag">${escapeHtml(u.role || "-")}</span></td>
                <td><span class="status ${u.isActive !== false ? "status-available" : "status-draft"}">
                  ${u.isActive !== false ? t("admin.active") : t("admin.suspended")}
                </span></td>
                <td>
                  <button class="btn btn-outline btn-sm toggle-user-btn"
                    data-user-id="${escapeHtml(String(u.id))}"
                    data-active="${u.isActive !== false}">
                    ${u.isActive !== false ? t("admin.suspend") : t("admin.activate")}
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      ${manualPaginationHtml({ page: _page, totalPages: pages, prefix: 'users' })}`;

    wirePagination({ container: panel, prefix: 'users', onPrev() { if (_page > 1) { _page--; renderUsers(container, { fetchUsers, onToggleUser }); } }, onNext() { if (_page < pages) { _page++; renderUsers(container, { fetchUsers, onToggleUser }); } } });

    panel.querySelectorAll(".toggle-user-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
          await onToggleUser(btn.dataset.userId);
          showToast(t("admin.userToggled"), "success");
          renderUsers(container, { fetchUsers, onToggleUser });
        } catch (e) {
          showToast(e.message, "error");
          btn.disabled = false;
        }
      });
    });
  } catch (e) {
    panel.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}
