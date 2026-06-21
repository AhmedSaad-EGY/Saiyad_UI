import { t } from '../../shared/utils/i18n.js';
import { escapeHtml, renderEmptyState, safeSetHTML } from '../../shared/utils/dom.js';
import { formatPrice } from '../../shared/utils/format.js';
import { showToast } from '../ui/toast.js';
import { showConfirm } from '../ui/modal.js';

export function showFormModal(title, html, onSave, options = {}) {
  const confirmText = options.confirmText || t("common.save");
  const confirmClass = options.confirmClass || "btn-primary";
  const previousFocus = document.activeElement;
  const modalId = `adminFormModal-${Date.now()}`;
  const overlay = document.createElement("div");
  const inertSiblings = [];

  function setBackgroundInert() {
    [...document.body.children].forEach((child) => {
      if (child === overlay || child.hasAttribute("inert")) return;
      child.setAttribute("inert", "");
      inertSiblings.push(child);
    });
  }

  function restoreBackgroundInert() {
    inertSiblings.forEach((child) => child.removeAttribute("inert"));
  }

  overlay.className = "modal-overlay show";
  document.body.classList.add("modal-open");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", `${modalId}-title`);
  safeSetHTML(overlay, `
    <div class="modal mw-xl">
      <div class="modal-header"><h3 id="${modalId}-title">${escapeHtml(title)}</h3></div>
      <div class="modal-body p-3">${html}</div>
      <div class="modal-actions d-flex gap-2 justify-content-end p-3 pt-2 border-divider-top">
        <button class="btn btn-ghost" id="${modalId}-cancel">${escapeHtml(t("common.cancel"))}</button>
        <button class="btn ${confirmClass}" id="${modalId}-save">${escapeHtml(confirmText)}</button>
      </div>
    </div>`);
  document.body.appendChild(overlay);
  setBackgroundInert();
  const cancelBtn = overlay.querySelector(`#${modalId}-cancel`);
  const saveBtn = overlay.querySelector(`#${modalId}-save`);

  function getFocusable() {
    return [...overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.disabled && el.offsetParent !== null);
  }

  function close() {
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onKey);
    restoreBackgroundInert();
    overlay.remove();
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  cancelBtn.addEventListener("click", close);
  saveBtn.addEventListener("click", () => { onSave(); close(); });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", onKey);
  setTimeout(() => {
    const firstField = overlay.querySelector('input, select, textarea, button');
    firstField?.focus();
  }, 50);
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
          <th scope="col">${t("common.name")}</th><th scope="col">${t("common.tier")}</th><th scope="col">${t("admin.planPrice")}</th>
          <th scope="col">${t("admin.planAuctions")}</th><th scope="col">${t("admin.planBids")}</th><th scope="col">${t("admin.planRequests")}</th>
          <th scope="col">${t("common.status")}</th><th scope="col">${t("common.actions")}</th>
        </tr></thead>
        <tbody>${(plans || []).map(p => `
          <tr>
            <td>${escapeHtml(p.name)}</td>
            <td>${escapeHtml(p.tier)}</td>
            <td>${formatPrice(p.price)}</td>
            <td>${p.maxAuctionsPerMonth}</td>
            <td>${p.maxBidsPerMonth}</td>
            <td>${p.maxAuctionRequestsPerMonth}</td>
            <td>${p.isActive ? `<span class="badge badge-success">${t("admin.active")}</span>` : `<span class="badge badge-danger">${t("admin.inactive")}</span>`}</td>
            <td>
              <button class="btn btn-sm btn-outline edit-plan-btn" aria-label="${t("common.edit")}" data-id="${escapeHtml(p.id)}" data-plan='${encodeURIComponent(JSON.stringify(p))}'><i class="fas fa-edit" aria-hidden="true"></i></button>
              <button class="btn btn-sm btn-danger delete-plan-btn" aria-label="${t("common.delete")}" data-id="${escapeHtml(p.id)}" data-name="${escapeHtml(p.name)}"><i class="fas fa-trash" aria-hidden="true"></i></button>
            </td>
          </tr>`).join("")}
        </tbody>
      </table></div>`;

    panel.querySelectorAll(".edit-plan-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const p = JSON.parse(decodeURIComponent(btn.dataset.plan));
        const fields = [
          { key: "name", label: t("common.name"), value: p.name, type: "text" },
          { key: "description", label: t("admin.planDescription"), value: p.description || "", type: "text" },
          { key: "price", label: t("admin.planPriceEgp"), value: String(p.price), type: "number" },
          { key: "maxAuctionsPerMonth", label: t("admin.planMaxAuctions"), value: String(p.maxAuctionsPerMonth), type: "number" },
          { key: "maxBidsPerMonth", label: t("admin.planMaxBids"), value: String(p.maxBidsPerMonth), type: "number" },
          { key: "maxAuctionRequestsPerMonth", label: t("admin.planMaxRequests"), value: String(p.maxAuctionRequestsPerMonth), type: "number" },
          { key: "sortOrder", label: t("admin.planSortOrder"), value: String(p.sortOrder), type: "number" },
          { key: "isActive", label: t("admin.active"), value: String(p.isActive), type: "checkbox" },
        ];
        const formHtml = fields.map(f =>
          f.type === "checkbox"
            ? `<label class="d-flex align-items-center gap-2 mb-2"><input type="checkbox" id="ef-${f.key}" ${f.value === "true" ? "checked" : ""}> ${escapeHtml(f.label)}</label>`
            : `<div class="mb-2"><label class="d-block small mb-0">${escapeHtml(f.label)}</label><input type="${f.type}" id="ef-${f.key}" class="form-control" value="${escapeHtml(f.value)}"></div>`
        ).join("");

        showFormModal(t("admin.editPlan"), formHtml, async function() {
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
        `<div class="mb-2"><label>${t("common.tier")}</label><select id="af-tier" class="form-control">${tierOptions}</select></div>` +
        `<div class="mb-2"><label>${t("common.name")}</label><input id="af-name" class="form-control"></div>` +
        `<div class="mb-2"><label>${t("admin.planDescription")}</label><input id="af-desc" class="form-control"></div>` +
        `<div class="mb-2"><label>${t("admin.planPriceEgp")}</label><input id="af-price" class="form-control" type="number" value="0"></div>` +
        `<div class="mb-2"><label>${t("admin.planMaxAuctions")}</label><input id="af-auctions" class="form-control" type="number" value="3"></div>` +
        `<div class="mb-2"><label>${t("admin.planMaxBids")}</label><input id="af-bids" class="form-control" type="number" value="3"></div>` +
        `<div class="mb-2"><label>${t("admin.planMaxRequests")}</label><input id="af-requests" class="form-control" type="number" value="3"></div>` +
        `<div class="mb-2"><label>${t("admin.planSortOrder")}</label><input id="af-sort" class="form-control" type="number" value="1"></div>`;

      showFormModal(t("admin.addSubscriptionPlan"), formHtml, async function() {
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
