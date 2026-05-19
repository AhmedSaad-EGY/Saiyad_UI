function renderForgotPassword(container) {
  if (isAuthenticated()) {
    navigate("");
    return;
  }

  showLoading(container, "auth");

  setTimeout(() => {
    const handleSubmit = async () => {
      const alertDiv = document.getElementById("forgotAlert");
      const emailInput = document.getElementById("forgotEmail");
      clearAllFieldErrors(document.getElementById("forgotForm"));
      if (alertDiv) alertDiv.innerHTML = "";

      if (!emailInput.value.trim() || !emailInput.validity.valid) {
        showFieldError(emailInput, t("auth.invalidEmail"));
        return;
      }

      const submitBtn = document.getElementById("forgotSubmit");
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.sendingResetLink")}`;

      try {
        await api.post("/auth/forgot-password", { email: emailInput.value.trim() });
        navigate(`verify-code?email=${encodeURIComponent(emailInput.value.trim())}`);
      } catch (err) {
        if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t("auth.sendResetLink");
      }
    };

    container.innerHTML = `
      <div class="auth-page">
        <div class="card">
          <h2><i class="fas fa-unlock"></i> ${t("auth.forgotPassword")}</h2>
          <div id="forgotAlert"></div>
          <form id="forgotForm" novalidate>
            <div class="form-group">
              <label class="form-label" for="forgotEmail">${t("auth.email")}</label>
              <input type="email" class="form-input" id="forgotEmail" name="email" placeholder="your@email.com" required autocomplete="email" inputmode="email">
              <div class="form-hint">${t("auth.resetLinkSent")}</div>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotSubmit">${t("auth.sendResetLink")}</button>
          </form>
          <div class="auth-footer"><a href="#/login">${t("auth.login")}</a></div>
        </div>
      </div>
    `;

    const emailInput = document.getElementById("forgotEmail");
    emailInput.addEventListener("input", () => clearFieldError(emailInput));
    emailInput.focus();

    document.getElementById("forgotSubmit").addEventListener("click", (e) => {
      e.preventDefault();
      handleSubmit();
    });
    emailInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
    });
  }, 300);
}
