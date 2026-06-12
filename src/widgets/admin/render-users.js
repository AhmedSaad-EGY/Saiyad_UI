import { t } from '../../shared/utils/i18n.js';
import { escapeHtml, renderEmptyState } from '../../shared/utils/dom.js';
import { manualPaginationHtml, wirePagination } from '../ui/pagination.js';
import { showToast } from '../ui/toast.js';
import { approveRoleRequest, rejectRoleRequest } from '../../features/admin/index.js';
import { showFormModal } from './render-plans.js';

let _page = 1;
const PAGE_SIZE = 20;

export async function renderUsers(container, { fetchUsers, onToggleUser } = {}) {
  container.innerHTML = `<div id="usersPanel">
    <div class="p-4 text-center"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
  </div>`;
  const panel = document.getElementById("usersPanel");
  try {
    const [usersData, allUsersData] = await Promise.all([
      fetchUsers(_page, PAGE_SIZE),
      fetchUsers(1, 200).catch(() => ({ items: [], data: [] }))
    ]);
    const users = usersData.items || usersData.data || [];
    const allUsers = allUsersData.items || allUsersData.data || [];
    const pending = allUsers.filter(u => u.requestedRole);
    const total = usersData.totalCount || usersData.total || users.length;
    const pages = Math.ceil(total / PAGE_SIZE);

    let pendingHtml = '';
    if (pending.length) {
      pendingHtml = `
        <div class="card card-sm mb-4 p-3">
          <h4 class="mb-3"><i class="fas fa-clock text-warning" aria-hidden="true"></i> ${t("admin.pendingRoleRequests")}</h4>
          <div class="table-wrapper">
            <table class="table">
              <thead><tr>
                <th scope="col">${t("auth.fullName")}</th>
                <th scope="col">${t("auth.email")}</th>
                <th scope="col">${t("auth.role")}</th>
                <th scope="col"></th>
              </tr></thead>
              <tbody>
                ${pending.map(u => `
                  <tr>
                    <td>${escapeHtml(u.fullName || u.name || "-")}</td>
                    <td>${escapeHtml(u.email || "-")}</td>
                    <td><span class="category-tag">${escapeHtml(u.requestedRole || "-")}</span></td>
                    <td>
                      <div class="d-flex gap-1 flex-nowrap" style="white-space:nowrap">
                        <button class="btn btn-sm btn-success approve-role-btn" data-user-id="${escapeHtml(String(u.id))}"><i class="fas fa-check" aria-hidden="true"></i> ${t("admin.approve")}</button>
                        <button class="btn btn-sm btn-danger reject-role-btn" data-user-id="${escapeHtml(String(u.id))}"><i class="fas fa-times" aria-hidden="true"></i> ${t("admin.reject")}</button>
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    if (!users.length && !pending.length) {
      renderEmptyState(panel, { icon: "fa-users", title: t("admin.noUsers") });
      return;
    }

    panel.innerHTML = pendingHtml + `
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

    panel.querySelectorAll(".approve-role-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
          await approveRoleRequest(btn.dataset.userId);
          showToast(t("admin.roleApproved"), "success");
          renderUsers(container, { fetchUsers, onToggleUser });
        } catch (e) {
          showToast(e.message, "error");
          btn.disabled = false;
        }
      });
    });

    panel.querySelectorAll(".reject-role-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        showFormModal(t("admin.rejectRoleRequest"), `
          <div class="form-group">
            <label class="form-label">${t("admin.rejectionReason")} (${t("common.optional")})</label>
            <textarea class="form-textarea form-control" id="rejectionReasonInput" rows="3"></textarea>
          </div>
        `, async function handleReject() {
          const reasonText = document.getElementById("rejectionReasonInput")?.value?.trim() || null;
          btn.disabled = true;
          try {
            await rejectRoleRequest(btn.dataset.userId, reasonText);
            showToast(t("admin.roleRejected"), "success");
            renderUsers(container, { fetchUsers, onToggleUser });
          } catch (err) {
            showToast(err.message, "error");
            btn.disabled = false;
          }
        }, { confirmText: t("admin.reject"), confirmClass: "btn-danger" });
      });
    });
  } catch (e) {
    panel.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}
