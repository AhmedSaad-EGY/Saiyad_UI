function renderVerifyCode(container, fullPath, params) {
  if (isAuthenticated()) {
    navigate("");
    return;
  }

  const email = params.email;
  if (!email) {
    navigate("forgot-password");
    return;
  }

  showLoading(container, "auth");

  setTimeout(() => {
    const handleSubmit = async () => {
      const alertDiv = document.getElementById("verifyAlert");
      const codeInput = document.getElementById("verifyCode");
      clearAllFieldErrors(document.getElementById("verifyForm"));
      if (alertDiv) alertDiv.innerHTML = "";

      if (!codeInput.value.trim()) {
        showFieldError(codeInput, t("auth.fieldRequired"));
        return;
      }

      navigate(`reset-password?token=${encodeURIComponent(codeInput.value.trim())}&email=${encodeURIComponent(email)}`);
    };

    const handleResend = async () => {
      try {
        await api.post("/auth/forgot-password", { email });
        showToast(t("auth.resetLinkSent"), "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    };

    container.innerHTML = `
      <div class="auth-page">
        <div class="card">
          <h2><i class="fas fa-key"></i> ${t("auth.verificationCode")}</h2>
          <div id="verifyAlert"></div>
          <form id="verifyForm" novalidate>
            <p style="text-align:center;margin:12px 0;color:var(--text-secondary)">${t("auth.checkInbox")}</p>
            <div class="form-group">
              <label class="form-label" for="verifyCode">${t("auth.verificationCode")}</label>
              <input type="text" class="form-input form-input-lg text-center" id="verifyCode" name="code" placeholder="${t("auth.tokenPlaceholder")}" required autocomplete="off" inputmode="numeric" style="font-size:1.5rem;letter-spacing:8px;text-align:center">
              <div class="form-hint">${t("auth.tokenHint")}</div>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="verifySubmit">${t("auth.verifyCode")}</button>
          </form>
          <div style="text-align:center;margin-top:16px">
            <button id="resendCodeBtn" class="btn btn-ghost">${t("auth.didntGetCode")}</button>
          </div>
          <div class="auth-footer"><a href="#/forgot-password">${t("auth.email")}</a></div>
        </div>
      </div>
    `;

    const codeInput = document.getElementById("verifyCode");
    codeInput.addEventListener("input", () => clearFieldError(codeInput));
    codeInput.focus();

    document.getElementById("verifySubmit").addEventListener("click", (e) => {
      e.preventDefault();
      handleSubmit();
    });
    codeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
    });

    document.getElementById("resendCodeBtn").addEventListener("click", (e) => {
      e.preventDefault();
      handleResend();
    });
  }, 300);
}
