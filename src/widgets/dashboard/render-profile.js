import { t } from '../../app/i18n.js';
import { escapeHtml, observeAnimations } from '../../shared/utils/dom.js';

export function renderProfile(content, user, { onSubmit } = {}) {
  content.innerHTML = `
    <div class="card animate-on-scroll">
      <div class="card-header">
        <h3><i class="fas fa-user" aria-hidden="true"></i> ${t("dash.profile")}</h3>
      </div>
      <div class="card-body">
      <form id="profileForm">
        <div class="form-group">
          <label class="form-label" for="profileName">${t("auth.fullName")}</label>
          <input type="text" class="form-input form-control" id="profileName" name="name" value="${escapeHtml(user?.fullName || "")}" required autocomplete="name">
        </div>
        <div class="form-group">
          <label class="form-label" for="profileEmail">${t("auth.email")}</label>
          <input type="email" class="form-input form-control" id="profileEmail" name="email" value="${escapeHtml(user?.email || "")}" required autocomplete="email">
        </div>
        <div class="form-group">
          <label class="form-label" for="profilePhone">${t("auth.phone")}</label>
          <input type="tel" class="form-input form-control" id="profilePhone" name="phone" value="${escapeHtml(user?.phone || "")}" autocomplete="tel">
        </div>
        <div id="profileAlert"></div>
      <button type="submit" class="btn btn-primary" id="profileSubmit">${t("dash.updateProfile")}</button>
    </form>
    </div>
    </div>
  `;
  observeAnimations();

  document
    .getElementById("profileForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const submit = document.getElementById("profileSubmit");
      const nameInput = document.getElementById("profileName");
      const phoneInput = document.getElementById("profilePhone");

      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("dash.updating")}`;

      try {
        if (onSubmit) {
          await onSubmit({
            fullName: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
          });
        }
      } catch (err) {
        document.getElementById("profileAlert").innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        submit.disabled = false;
        submit.textContent = t("dash.updateProfile");
      }
    });
}
