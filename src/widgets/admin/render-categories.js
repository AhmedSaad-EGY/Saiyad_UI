import { t } from '../../app/i18n.js';
import { showLoading, showError, renderEmptyState, escapeHtml } from '../../shared/utils/dom.js';
import { showToast } from '../ui/toast.js';
import { showConfirm } from '../ui/modal.js';
import { fetchCategories, createCategory, deleteCategory } from '../../features/admin/index.js';

export async function renderCategories(container) {
  showLoading(container);
  try {
    const data = await fetchCategories();
    const cats = data.items || data.data || data || [];

    if (!cats.length) {
      container.innerHTML = `
        <div class="mb-3"><button class="btn btn-primary btn-sm" id="showAddCat"><i class="fas fa-plus" aria-hidden="true"></i> ${t("admin.addCategory")}</button></div>
        <div id="addCatForm" class="d-none card card-sm mb-3 mw-xs">
          <form id="catForm" novalidate>
            <div class="form-group"><label class="form-label">${t("admin.categoryName")}</label><input type="text" class="form-input form-control" id="catName" required></div>
            <div class="form-group"><label class="form-label">${t("admin.categoryDesc")}</label><input type="text" class="form-input form-control" id="catDesc"></div>
            <button type="submit" class="btn btn-primary btn-sm">${t("admin.addCategory")}</button>
          </form>
        </div>
        <div class="empty-state mt-2">
          <div class="empty-state-visual"><i class="fas fa-tags text-muted" style="font-size:2rem" aria-hidden="true"></i></div>
          <h3>${t("admin.noCategories")}</h3>
          <p class="text-muted">${t("admin.createFirstCategory")}</p>
        </div>`;
      setupCategoryForm(container);
      return;
    }

    container.innerHTML = `
      <div class="mb-3"><button class="btn btn-primary btn-sm" id="showAddCat"><i class="fas fa-plus" aria-hidden="true"></i> ${t("admin.addCategory")}</button></div>
      <div id="addCatForm" class="d-none card card-sm mb-3 mw-xs">
        <form id="catForm" novalidate>
          <div class="form-group"><label class="form-label">${t("admin.categoryName")}</label><input type="text" class="form-input form-control" id="catName" required></div>
          <div class="form-group"><label class="form-label">${t("admin.categoryDesc")}</label><input type="text" class="form-input form-control" id="catDesc"></div>
          <button type="submit" class="btn btn-primary btn-sm">${t("admin.addCategory")}</button>
        </form>
      </div>
      <div class="table-wrapper"><table class="table">
        <caption class="text-muted mt-2 caption-meta">${t("admin.categories")}</caption>
        <thead><tr><th scope="col">${t("admin.id")}</th><th scope="col">${t("admin.name")}</th><th scope="col">${t("admin.categoryDesc")}</th><th scope="col"></th></tr></thead>
        <tbody>${cats
          .map(
            (c) => `
          <tr><td>${c.id}</td><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.description || "-")}</td>
          <td><button class="btn btn-sm btn-danger delete-cat" data-id="${c.id}" aria-label="${t("admin.categoryDeleted")}"><i class="fas fa-trash" aria-hidden="true"></i></button></td></tr>`,
          )
          .join("")}
        </tbody>
      </table></div>`;

    setupCategoryForm(container);

    container.querySelectorAll(".delete-cat").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const ok = await showConfirm(t("admin.confirmDeleteCategory"), t("admin.confirmDeleteCategoryDesc"), { type: "danger", confirmText: t("common.delete") });
        if (!ok) return;
        try {
          await deleteCategory(btn.dataset.id);
          showToast(t("admin.categoryDeleted"), "success");
          renderCategories(container);
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
  } catch (err) {
    showError(container, err.message);
  }
}

function setupCategoryForm(container) {
  document.getElementById("showAddCat")?.addEventListener("click", () =>
    document.getElementById("addCatForm").classList.toggle("d-none")
  );
  document.getElementById("catForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await createCategory(
        document.getElementById("catName").value.trim(),
        document.getElementById("catDesc").value.trim(),
      );
      showToast(t("admin.categoryAdded"), "success");
      renderCategories(container);
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}
