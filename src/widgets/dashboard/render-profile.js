import { t } from '../../app/i18n.js';
import { escapeHtml, observeAnimations } from '../../shared/utils/dom.js';
import { validateForm, clearFieldError } from '../../shared/utils/validation.js';
import { showToast } from '../ui/toast.js';
import { updateNavbar } from '../layout/navbar.js';
import { updateUserProfile, cacheUserProfile } from '../../features/dashboard/index.js';

export function renderProfile(content, user) {
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

  const nameInput = document.getElementById("profileName");
  const emailInput = document.getElementById("profileEmail");
  const phoneInput = document.getElementById("profilePhone");

  [nameInput, emailInput, phoneInput].forEach((el) => {
    el?.addEventListener("input", () => clearFieldError(el));
  });

  document
    .getElementById("profileForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const submit = document.getElementById("profileSubmit");
      const alertDiv = document.getElementById("profileAlert");

      const valid = validateForm(form, [
        {
          element: nameInput,
          required: true,
          messages: { required: `${t("auth.fullName")} is required.` },
        },
        { element: emailInput, required: true, email: true },
        { element: phoneInput, phone: true },
      ]);

      if (!valid) return;

      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("dash.updating")}`;
      alertDiv.innerHTML = "";

      try {
        const data = await updateUserProfile({
          fullName: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
        });
        cacheUserProfile(data.user || data);
        updateNavbar();
        showToast(t("dash.profileUpdated"), "success");
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        submit.disabled = false;
        submit.textContent = t("dash.updateProfile");
      }
    });
}
