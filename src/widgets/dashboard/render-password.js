import { t } from '../../app/i18n.js';
import { observeAnimations } from '../../shared/utils/dom.js';
import { validateForm, getPasswordStrengthResult, clearFieldError } from '../../shared/utils/validation.js';
import { showToast } from '../ui/toast.js';
import { changePassword } from '../../features/dashboard/index.js';

export function renderChangePassword(content) {
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
          <div class="pw-strength" id="dashStrength"><div class="pw-strength__track"><div class="pw-strength__fill" id="dashStrengthBar"></div></div></div>
          <span class="pw-strength__label" id="dashStrengthText"></span>
        </div>
        <div id="passwordAlert"></div>      <button type="submit" class="btn btn-primary" id="passwordSubmit">${t("dash.changePwBtn")}</button>
    </form>
    </div>
    </div>
  `;
  observeAnimations();

  const oldInput = document.getElementById("oldPassword");
  const newInput = document.getElementById("newPassword");

  [oldInput, newInput].forEach((el) => {
    el?.addEventListener("input", () => clearFieldError(el));
  });

  newInput.addEventListener("input", () => {
    const pw = newInput.value;
    const bar = document.getElementById("dashStrengthBar");
    const txt = document.getElementById("dashStrengthText");
    if (!pw) {
      bar.className = "pw-strength__fill";
      txt.textContent = "";
      return;
    }
    const result = getPasswordStrengthResult(pw);
    bar.className = `pw-strength__fill`;
    txt.textContent = t(result.label);
    txt.style.color = getComputedStyle(bar).backgroundColor;
  });

  document
    .getElementById("passwordForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const submit = document.getElementById("passwordSubmit");
      const alertDiv = document.getElementById("passwordAlert");

      const valid = validateForm(form, [
        { element: oldInput, required: true },
        {
          element: newInput,
          required: true,
          minLength: 6,
          messages: {
            minLength: t("auth.passwordMinLength"),
          },
        },
      ]);

      if (!valid) return;

      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("dash.changing")}`;
      alertDiv.innerHTML = "";

      try {
        await changePassword(oldInput.value, newInput.value);
        showToast(t("dash.passwordChanged"), "success");
        document.getElementById("passwordForm").reset();
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        submit.disabled = false;
        submit.textContent = t("dash.changePwBtn");
      }
    });
}
