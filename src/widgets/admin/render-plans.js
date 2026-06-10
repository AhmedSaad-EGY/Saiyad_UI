import { t } from '../../shared/utils/i18n.js';
import { escapeHtml, renderEmptyState } from '../../shared/utils/dom.js';
import { formatPrice } from '../../shared/utils/format.js';
import { showToast } from '../ui/toast.js';
import { showConfirm } from '../ui/modal.js';

export function showFormModal(title, html, onSave, options = {}) {
  const confirmText = options.confirmText || t("common.save");
  const confirmClass = options.confirmClass || "btn-primary";
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay show";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", title);
  overlay.innerHTML = `
    <div class="modal mw-xl">
      <div class="modal-header"><h3>${title}</h3></div>
      <div class="modal-body p-3">${html}</div>
      <div class="modal-actions d-flex gap-2 justify-content-end p-3 pt-2 border-divider-top">
        <button class="btn btn-ghost" id="fmCancel">${t("common.cancel")}</button>
        <button class="btn ${confirmClass}" id="fmSave">${confirmText}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector("#fmCancel").addEventListener("click", () => overlay.remove());
  overlay.querySelector("#fmSave").addEventListener("click", () => { onSave(); overlay.remove(); });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  setTimeout(() => overlay.querySelector("#fmSave")?.focus(), 100);
  return overlay;
}

export async function renderPlans(container, { fetchData, onUpdate, onDelete, onAdd } = {}) {
  container.innerHTML = `<div id="plansPanel">
    <div class="p-4 text-center"><i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}</div>
  </div>`;
  const panel = document.getElementById("plansPanel");
  try {
    const plans = await fetchData();

    if (!plans || !plans.length) {
      renderEmptyState(panel, { icon: "fa-crown", title: t("subscriptions.noPlans") });
      return;
    }

    panel.innerHTML = `
      <div class="mb-3">
        <button class="btn btn-primary" id="addPlanBtn"><i class="fas fa-plus" aria-hidden="true"></i> ${t("admin.addPlan")}</button>
      </div>
      <div class="table-wrapper"><table class="table">
        <caption class="text-muted mt-2 caption-meta">${t("admin.plans")}</caption>
        <thead><tr>
          <th scope="col">${t("common.name")}</th><th scope="col">${t("common.tier")}</th><th scope="col">Price</th>
          <th scope="col">Auctions</th><th scope="col">Bids</th><th scope="col">Requests</th>
          <th scope="col">${t("common.status")}</th><th scope="col">${t("common.actions")}</th>
        </tr></thead>
        <tbody>${(plans || []).map(p => `
          <tr>
            <td>${escapeHtml(p.name)}</td>
            <td>${p.tier}</td>
            <td>${formatPrice(p.price)}</td>
            <td>${p.maxAuctionsPerMonth}</td>
            <td>${p.maxBidsPerMonth}</td>
            <td>${p.maxAuctionRequestsPerMonth}</td>
            <td>${p.isActive ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'}</td>
            <td>
              <button class="btn btn-sm btn-outline edit-plan-btn" aria-label="${t("common.edit")}" data-id="${p.id}" data-plan='${encodeURIComponent(JSON.stringify(p))}'><i class="fas fa-edit" aria-hidden="true"></i></button>
              <button class="btn btn-sm btn-danger delete-plan-btn" aria-label="${t("common.delete")}" data-id="${p.id}" data-name="${escapeHtml(p.name)}"><i class="fas fa-trash" aria-hidden="true"></i></button>
            </td>
          </tr>`).join("")}
        </tbody>
      </table></div>`;

    panel.querySelectorAll(".edit-plan-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const p = JSON.parse(decodeURIComponent(btn.dataset.plan));
        const fields = [
          { key: "name", label: "Name", value: p.name, type: "text" },
          { key: "description", label: "Description", value: p.description || "", type: "text" },
          { key: "price", label: "Price (EGP)", value: String(p.price), type: "number" },
          { key: "maxAuctionsPerMonth", label: "Max Auctions/Month", value: String(p.maxAuctionsPerMonth), type: "number" },
          { key: "maxBidsPerMonth", label: "Max Bids/Month", value: String(p.maxBidsPerMonth), type: "number" },
          { key: "maxAuctionRequestsPerMonth", label: "Max Requests/Month", value: String(p.maxAuctionRequestsPerMonth), type: "number" },
          { key: "sortOrder", label: "Sort Order", value: String(p.sortOrder), type: "number" },
          { key: "isActive", label: "Active", value: String(p.isActive), type: "checkbox" },
        ];
        const formHtml = fields.map(f =>
          f.type === "checkbox"
            ? `<label class="d-flex align-items-center gap-2 mb-2"><input type="checkbox" id="ef-${f.key}" ${f.value === "true" ? "checked" : ""}> ${f.label}</label>`
            : `<div class="mb-2"><label class="d-block small mb-0">${f.label}</label><input type="${f.type}" id="ef-${f.key}" class="form-control" value="${escapeHtml(f.value)}"></div>`
        ).join("");

        showFormModal("Edit Plan", formHtml, async function() {
          const body = {};
          fields.forEach(f => {
            if (f.key === "isActive") body[f.key] = document.getElementById(`ef-${f.key}`).checked;
            else if (f.type === "number") body[f.key] = parseFloat(document.getElementById(`ef-${f.key}`).value) || 0;
            else body[f.key] = document.getElementById(`ef-${f.key}`).value;
          });
          try {
            await onUpdate(p.id, body);
            showToast(t("admin.planUpdated"), "success");
            renderPlans(container, { fetchData, onUpdate, onDelete, onAdd });
          } catch (err) { showToast(err.message, "error"); }
        });
      });
    });

    panel.querySelectorAll(".delete-plan-btn").forEach(btn => {
      btn.addEventListener("click", async function() {
        const ok = await showConfirm(t("admin.confirmDeletePlan"), `${t("common.delete")} "${btn.dataset.name}"? ${t("admin.confirmDeletePlanDesc")}`, { type: "danger", confirmText: t("common.delete") });
        if (!ok) return;
        try {
          await onDelete(btn.dataset.id);
          showToast(t("admin.planDeleted"), "success");
          renderPlans(container, { fetchData, onUpdate, onDelete, onAdd });
        } catch (err) { showToast(err.message, "error"); }
      });
    });

    document.getElementById("addPlanBtn")?.addEventListener("click", function() {
      const tierOptions = ["Free", "Basic", "Pro", "Enterprise"].map(tier => `<option value="${tier}">${tier}</option>`).join("");
      const formHtml =
        `<div class="mb-2"><label>Tier</label><select id="af-tier" class="form-control">${tierOptions}</select></div>` +
        `<div class="mb-2"><label>Name</label><input id="af-name" class="form-control"></div>` +
        `<div class="mb-2"><label>Description</label><input id="af-desc" class="form-control"></div>` +
        `<div class="mb-2"><label>Price (EGP)</label><input id="af-price" class="form-control" type="number" value="0"></div>` +
        `<div class="mb-2"><label>Max Auctions/Month</label><input id="af-auctions" class="form-control" type="number" value="3"></div>` +
        `<div class="mb-2"><label>Max Bids/Month</label><input id="af-bids" class="form-control" type="number" value="3"></div>` +
        `<div class="mb-2"><label>Max Requests/Month</label><input id="af-requests" class="form-control" type="number" value="3"></div>` +
        `<div class="mb-2"><label>Sort Order</label><input id="af-sort" class="form-control" type="number" value="1"></div>`;

      showFormModal("Add Subscription Plan", formHtml, async function() {
        try {
          await onAdd({
            tier: document.getElementById("af-tier").value,
            name: document.getElementById("af-name").value,
            description: document.getElementById("af-desc").value,
            price: parseFloat(document.getElementById("af-price").value) || 0,
            currency: "EGP",
            billingCycle: "Monthly",
            maxAuctionsPerMonth: parseInt(document.getElementById("af-auctions").value) || 3,
            maxBidsPerMonth: parseInt(document.getElementById("af-bids").value) || 3,
            maxAuctionRequestsPerMonth: parseInt(document.getElementById("af-requests").value) || 3,
            features: [],
            sortOrder: parseInt(document.getElementById("af-sort").value) || 1,
          });
          showToast(t("admin.planCreated"), "success");
          renderPlans(container, { fetchData, onUpdate, onDelete, onAdd });
        } catch (err) { showToast(err.message, "error"); }
      });
    });
  } catch (err) {
    panel.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}
