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
            <input type="email" class="form-input" id="forgotEmail" name="email" placeholder="your@email.com" required autocomplete="email" inputmode="email">
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotSubmit">${t("auth.sendResetLink")}</button>
        </form>
        <div class="auth-footer"><a href="#/login">${t("auth.login")}</a></div>
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
        await api.post("/auth/forgot-password", {
          email: forgotEmail.value.trim(),
        });

        // Hide form and show success with countdown
        forgotForm.style.display = "none";
        let seconds = 60;

        const renderSuccess = () => {
          alertDiv.innerHTML = `
            <div class="alert alert-success">
              <p><i class="fas fa-check-circle"></i> ${t("auth.resetLinkSent")}</p>
              <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                <button id="resendBtn" class="btn btn-primary btn-block" ${seconds > 0 ? "disabled" : ""}>
                  <i class="fas fa-redo"></i> ${t("auth.resendLink")} ${seconds > 0 ? `(${seconds}s)` : ""}
                </button>
                <button id="changeEmailBtn" class="btn btn-ghost btn-block">
                  <i class="fas fa-envelope"></i> ${t("auth.email")}
                </button>
              </div>
            </div>
          `;

          document.getElementById("resendBtn").onclick = () => {
            forgotForm.style.display = "block";
            forgotSubmit.click();
          };
          document.getElementById("changeEmailBtn").onclick = () => {
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
        alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        forgotSubmit.disabled = false;
        forgotSubmit.textContent = t("auth.sendResetLink");
      }
    });
  }, 300);
}
