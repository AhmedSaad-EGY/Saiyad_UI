import { t } from '../../app/i18n.js';
import { observeAnimations } from '../../shared/utils/dom.js';

export function renderChangePassword(content, { onSubmit } = {}) {
  content.innerHTML = `
    <div class="card animate-on-scroll">
      <div class="card-header">
        <h3><i class="fas fa-key" aria-hidden="true"></i> ${t("dash.changePassword")}</h3>
      </div>
      <div class="card-body">
      <form id="passwordForm">
        <div class="form-group">
          <label class="form-label" for="oldPassword">${t("dash.currentPassword")}</label>
          <input type="password" class="form-input form-control" id="oldPassword" name="oldPassword" required autocomplete="current-password">
        </div>
        <div class="form-group">
          <label class="form-label" for="newPassword">${t("dash.newPassword")}</label>
          <div class="password-wrapper">
            <input type="password" class="form-input form-control" id="newPassword" name="newPassword" required minlength="6" autocomplete="new-password">
          </div>
        </div>
        <div id="passwordAlert"></div>      <button type="submit" class="btn btn-primary" id="passwordSubmit">${t("dash.changePwBtn")}</button>
    </form>
    </div>
    </div>
  `;
  observeAnimations();

  document
    .getElementById("passwordForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const submit = document.getElementById("passwordSubmit");
      const oldInput = document.getElementById("oldPassword");
      const newInput = document.getElementById("newPassword");

      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("dash.changing")}`;

      try {
        if (onSubmit) {
          await onSubmit(oldInput.value, newInput.value);
        }
        document.getElementById("passwordForm").reset();
      } catch (err) {
        document.getElementById("passwordAlert").innerHTML = `<div class="alert alert-error">${err.message}</div>`;
      } finally {
        submit.disabled = false;
        submit.textContent = t("dash.changePwBtn");
      }
    });
}
