function renderResetPassword(container) {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const token = params.get("token");

  if (!token) {
    navigate("login");
    return;
  }

  showLoading(container, "form");

  setTimeout(() => {
    container.innerHTML = `
      <div class="auth-page">
        <div class="card">
          <h2><i class="fas fa-key"></i> ${t("auth.resetPassword")}</h2>
          <div id="resetAlert"></div>
          <form id="resetForm" novalidate>
            <div class="form-group">
              <label class="form-label" for="resetPassword">${t("auth.newPassword")}</label>
              <input type="password" class="form-input" id="resetPassword" name="password" required minlength="6">
            </div>
            <div class="form-group">
              <label class="form-label" for="resetConfirmPw">${t("auth.confirmNewPassword")}</label>
              <input type="password" class="form-input" id="resetConfirmPw" name="confirmPassword" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="resetSubmit">${t("auth.resetPassword")}</button>
          </form>
        </div>
      </div>
    `;

    const resetForm = document.getElementById("resetForm");
    const resetPassword = document.getElementById("resetPassword");
    const resetConfirmPw = document.getElementById("resetConfirmPw");
    const resetSubmit = document.getElementById("resetSubmit");
    const alertDiv = document.getElementById("resetAlert");

    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAllFieldErrors(resetForm);
      alertDiv.innerHTML = "";

      let valid = true;
      if (resetPassword.value.length < 6) {
        showFieldError(
          resetPassword,
          t("auth.password") + " must be at least 6 characters.",
        );
        valid = false;
      }
      if (resetPassword.value !== resetConfirmPw.value) {
        showFieldError(resetConfirmPw, t("auth.passwordsDoNotMatch"));
        valid = false;
      }

      if (!valid) return;

      resetSubmit.disabled = true;
      resetSubmit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.updatingPassword")}`;

      try {
        await api.post("/auth/reset-password", {
          token: token,
          newPassword: resetPassword.value,
        });

        alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t("auth.passwordResetSuccess")}</div>`;
        resetForm.style.display = "none";

        setTimeout(() => navigate("login"), 3000);
      } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        if (resetSubmit) {
          resetSubmit.disabled = false;
          resetSubmit.textContent = t("auth.resetPassword");
        }
      }
    });
  }, 300);
}
