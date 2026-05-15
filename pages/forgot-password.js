function renderForgotPassword(container) {
  if (isAuthenticated()) {
    navigate("");
    return;
  }

  // Show skeleton while preparing content
  showLoading(container, "form");

  setTimeout(() => {
    container.innerHTML = `
    <div class="auth-page">
      <div class="card">
        <h2><i class="fas fa-unlock"></i> ${t("auth.forgotPassword")}</h2>
        <div id="forgotAlert"></div>
        <form id="forgotForm" novalidate>
          <div class="form-group">
            <label class="form-label" for="forgotEmail">${t("auth.email")}</label>
            <input type="email" class="form-input" id="forgotEmail" name="email" placeholder="example@mail.com" required autocomplete="email" inputmode="email">
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotSubmit">${t("auth.sendResetLink")}</button>
        </form>
        <div class="auth-footer"><a href="#/login"><i class="fas fa-arrow-left"></i> ${t("auth.login")}</a></div>
      </div>
    </div>
  `;

    const forgotForm = document.getElementById("forgotForm");
    const forgotEmail = document.getElementById("forgotEmail");
    const forgotSubmit = document.getElementById("forgotSubmit");
    const alertDiv = document.getElementById("forgotAlert");
    let countdownInterval = null;

    forgotEmail.addEventListener("input", () => clearFieldError(forgotEmail));

    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (countdownInterval) clearInterval(countdownInterval);

      clearAllFieldErrors(forgotForm);
      alertDiv.innerHTML = "";

      if (!forgotEmail.value.trim() || !forgotEmail.validity.valid) {
        showFieldError(forgotEmail, t("auth.invalidEmail"));
        return;
      }

      forgotSubmit.disabled = true;
      forgotSubmit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.sendingResetLink")}`;

      try {
        const emailValue = forgotEmail.value.trim();
        await api.post("/auth/forgotpassword", { email: emailValue });

        // Hide form and show success with countdown
        forgotForm.style.display = "none";
        let seconds = 60;

        // Mask email for better UI (e.g., u***@domain.com)
        const maskEmail = (email) => {
          const [name, domain] = email.split("@");
          return name[0] + "***@" + domain;
        };

        const renderSuccess = () => {
          alertDiv.innerHTML = `
            <div class="alert alert-success" style="text-align: center; padding: 24px;">
              <div class="success-icon-wrapper" style="font-size: 3rem; margin-bottom: 16px; color: var(--success);">
                <i class="fas fa-paper-plane animate-bounce"></i>
              </div>
              <p><strong>${t("auth.resetLinkSent")}</strong></p>
              <p style="font-size: var(--text-xs); margin-top: 8px; opacity: 0.8;">${maskEmail(emailValue)}</p>
              <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 10px;">
                <button id="resendBtn" class="btn btn-primary btn-block" ${seconds > 0 ? "disabled" : ""}>
                  <i class="fas fa-redo"></i> ${t("auth.resendLink")} ${seconds > 0 ? `(${seconds}s)` : ""}
                </button>
                <button id="changeEmailBtn" class="btn btn-ghost btn-block">
                  <i class="fas fa-envelope"></i> ${t("auth.email")}
                </button>
              </div>
            </div>
          `;

          const resendBtn = document.getElementById("resendBtn");
          if (resendBtn && seconds === 0) {
            resendBtn.onclick = () => {
              forgotForm.style.display = "block";
              forgotSubmit.click();
            };
          }
          document.getElementById("changeEmailBtn").onclick = () => {
            if (countdownInterval) clearInterval(countdownInterval);
            forgotForm.style.display = "block";
            alertDiv.innerHTML = "";
          };
        };

        renderSuccess();
        countdownInterval = setInterval(() => {
          seconds--;
          if (seconds <= 0) {
            clearInterval(countdownInterval);
            seconds = 0;
          }
          renderSuccess();
        }, 1000);
      } catch (err) {
        // Enhanced error handling for 404 and other codes
        let errorMessage = escapeHtml(err.message);
        if (err.status === 404) {
          errorMessage =
            "The password reset service is currently unavailable. Please contact support or try again later.";
        } else if (err.status === 500) {
          errorMessage = "Server error. Please try again in a few minutes.";
        }
        alertDiv.innerHTML = `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${errorMessage}</div>`;
      } finally {
        forgotSubmit.disabled = false;
        forgotSubmit.textContent = t("auth.sendResetLink");
      }
    });
  }, 300);
}
