import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth } from '../core/auth/index.js';
import { showLoading, showError, renderEmptyState, escapeHtml } from '../core/utils/dom.js';
import { showConfirm, showToast } from '../core/utils/ui.js';

export default async function renderShipping(container) {
  if (!(await requireAuth())) return;

  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-truck"></i> ${t("shipping.title")}</h2><button class="btn btn-primary btn-sm" id="showAddForm"><i class="fas fa-plus"></i> ${t("shipping.addNew")}</button></div>
    <div id="shippingAlert"></div>
    <div id="addressList"></div>
    <div id="addressForm" class="card hidden" style="max-width:480px;margin-top:16px">
      <h3 style="margin-bottom:16px">${t("shipping.addNew")}</h3>
      <form id="shipForm" novalidate>
        <div class="form-group"><label class="form-label">${t("shipping.fullName")}</label><input type="text" class="form-input" id="shipName" required></div>
        <div class="form-group"><label class="form-label">${t("shipping.phone")}</label><input type="tel" class="form-input" id="shipPhone" required></div>
        <div class="form-group"><label class="form-label">${t("shipping.city")}</label><input type="text" class="form-input" id="shipCity" required></div>
        <div class="form-group"><label class="form-label">${t("shipping.addressLine")}</label><input type="text" class="form-input" id="shipAddressLine" required></div>
        <div class="form-group"><label class="form-label">${t("shipping.postalCode")}</label><input type="text" class="form-input" id="shipPostal"></div>
        <button type="submit" class="btn btn-primary" id="shipSubmit">${t("shipping.save")}</button>
      </form>
    </div>`;

  const list = document.getElementById("addressList");
  const alertDiv = document.getElementById("shippingAlert");

  document.getElementById("showAddForm").addEventListener("click", () => {
    document.getElementById("addressForm").classList.remove("hidden");
    document.getElementById("showAddForm").disabled = true;
  });

  document.getElementById("shipForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submit = document.getElementById("shipSubmit");
    submit.disabled = true;
    submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("shipping.saving")}`;
    try {
      await api.post("/shippingaddresses", {
        fullName: document.getElementById("shipName").value.trim(),
        phone: document.getElementById("shipPhone").value.trim(),
        city: document.getElementById("shipCity").value.trim(),
        addressLine: document.getElementById("shipAddressLine").value.trim(),
        postalCode: document.getElementById("shipPostal").value.trim() || undefined,
      });
      showToast(t("shipping.saved"), "success");
      document.getElementById("shipForm").reset();
      document.getElementById("addressForm").classList.add("hidden");
      document.getElementById("showAddForm").disabled = false;
      loadAddresses();
    } catch (err) {
      showToast(err.message || t("shipping.error"), "error");
    } finally {
      submit.disabled = false;
      submit.textContent = t("shipping.save");
    }
  });

  async function loadAddresses() {
    showLoading(list);
    try {
      const data = await api.get("/shippingaddresses");
      const addresses = Array.isArray(data) ? data : [];
      if (!addresses.length) {
        renderEmptyState(list, {
          icon: "fa-truck",
          title: t("shipping.noAddresses"),
          actionText: t("shipping.addNew"),
          actionFn: () => document.getElementById("showAddForm").click(),
        });
        return;
      }
      list.innerHTML = addresses
        .map(
          (a) => `
        <div class="card card-sm" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <div>
            <strong>${escapeHtml(a.fullName)}</strong><br>
            <span style="color:var(--text-secondary);font-size:0.88rem">${escapeHtml(a.addressLine)}, ${escapeHtml(a.city)}${a.postalCode ? ", " + escapeHtml(a.postalCode) : ""}</span><br>
            <span style="color:var(--text-muted);font-size:0.82rem">${escapeHtml(a.phone)}</span>
          </div>
          <button class="btn btn-danger btn-sm delete-addr" data-id="${a.id}">${t("shipping.delete")}</button>
        </div>
      `,
        )
        .join("");

      list.querySelectorAll(".delete-addr").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const ok = await showConfirm(
            t("shipping.confirmDelete"),
            t("shipping.confirmDeleteDesc") || t("shipping.confirmDelete"),
            { type: "danger", confirmText: t("common.delete") || "Delete" }
          );
          if (!ok) return;
          try {
            await api.delete(`/shippingaddresses/${btn.dataset.id}`);
            showToast(t("shipping.deleted"), "success");
            loadAddresses();
          } catch (err) {
            showToast(err.message, "error");
          }
        });
      });
    } catch (err) {
      showError(list, err.message);
    }
  }

  loadAddresses();
}
