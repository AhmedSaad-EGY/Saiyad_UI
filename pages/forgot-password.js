function renderForgotPassword(container) {
  if (isAuthenticated()) {
    navigate("");
    return;
  }

  showLoading(container, "auth");

  setTimeout(() => {
    let forgotEmail = "";
    let countdownInterval = null;
    let resendSeconds = 0;

    const startResendCountdown = () => {
      if (countdownInterval) clearInterval(countdownInterval);
      resendSeconds = 60;
      const updateBtn = () => {
        const btn = document.getElementById("resendBtn");
        if (btn) {
          btn.disabled = resendSeconds > 0;
          btn.innerHTML = `<i class="fas fa-redo"></i> ${t("auth.resendCode")} ${resendSeconds > 0 ? `(${resendSeconds}s)` : ""}`;
        }
      };
      updateBtn();
      countdownInterval = setInterval(() => {
        resendSeconds--;
        if (resendSeconds <= 0) {
          clearInterval(countdownInterval);
          resendSeconds = 0;
        }
        updateBtn();
      }, 1000);
    };

    const handleResend = async () => {
      if (resendSeconds > 0) return;
      try {
        await api.post("/auth/forgot-password", { email: forgotEmail });
        showToast(t("auth.resetLinkSent"), "success");
        startResendCountdown();
      } catch (err) {
        showToast(err.message, "error");
      }
    };

    const handleSubmit = async () => {
      const alertDiv = document.getElementById("forgotAlert");
      const emailInput = document.getElementById("forgotEmail");
      clearAllFieldErrors(document.getElementById("forgotForm"));
      if (alertDiv) alertDiv.innerHTML = "";

      if (!emailInput.value.trim() || !emailInput.validity.valid) {
        showFieldError(emailInput, t("auth.invalidEmail"));
        return;
      }

      forgotEmail = emailInput.value.trim();
      const submitBtn = document.getElementById("forgotSubmit");
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.sendingResetLink")}`;

      try {
        await api.post("/auth/forgot-password", { email: forgotEmail });
        if (alertDiv) {
          alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t("auth.resetLinkSent")}</div>`;
        }
        document.getElementById("stepContent").innerHTML = `
          <div class="alert alert-success">
            <i class="fas fa-envelope"></i> ${t("auth.resetLinkSent")}
          </div>
          <p style="text-align:center;margin:16px 0">${t("auth.checkInbox")}</p>
          <button id="resendBtn" class="btn btn-ghost btn-block" disabled><i class="fas fa-redo"></i> ${t("auth.resendCode")}</button>
        `;
        startResendCountdown();
        document.getElementById("resendBtn").addEventListener("click", handleResend);
      } catch (err) {
        if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t("auth.sendResetLink");
      }
    };

    const cleanup = () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
    window.onRouteCleanup = cleanup;

    container.innerHTML = `
      <div class="auth-page">
        <div class="card">
          <h2><i class="fas fa-unlock"></i> ${t("auth.forgotPassword")}</h2>
          <div id="forgotAlert"></div>
          <form id="forgotForm" novalidate>
            <div id="stepContent">
              <div class="form-group">
                <label class="form-label" for="forgotEmail">${t("auth.email")}</label>
                <input type="email" class="form-input" id="forgotEmail" name="email" placeholder="your@email.com" required autocomplete="email" inputmode="email">
                <div class="form-hint">${t("auth.resetLinkSent")}</div>
              </div>
              <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotSubmit">${t("auth.sendResetLink")}</button>
            </div>
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
