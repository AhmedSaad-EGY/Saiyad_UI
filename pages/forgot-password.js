function renderForgotPassword(container) {
  if (isAuthenticated()) {
    navigate("");
    return;
  }

  showLoading(container, "auth");

  setTimeout(() => {
    let forgotEmail = "";
    let forgotCode = "";
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

    const showEmailStep = () => {
      const alertDiv = document.getElementById("forgotAlert");
      if (alertDiv) alertDiv.innerHTML = "";
      document.getElementById("forgotForm").style.display = "block";
      document.querySelector(".card h2").innerHTML = `<i class="fas fa-unlock"></i> ${t("auth.forgotPassword")}`;
      document.getElementById("stepContent").innerHTML = `
        <div class="form-group">
          <label class="form-label" for="forgotEmail">${t("auth.email")}</label>
          <input type="email" class="form-input" id="forgotEmail" name="email" placeholder="your@email.com" required autocomplete="email" inputmode="email">
        </div>
        <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotEmailBtn">${t("auth.sendResetLink")}</button>
      `;
      const emailInput = document.getElementById("forgotEmail");
      emailInput.focus();
      document.getElementById("forgotEmailBtn").addEventListener("click", (e) => {
        e.preventDefault();
        handleStep1();
      });
      emailInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); handleStep1(); }
      });
    };

    const showCodeStep = () => {
      const alertDiv = document.getElementById("forgotAlert");
      if (alertDiv) alertDiv.innerHTML = "";
      document.getElementById("forgotForm").style.display = "block";
      document.querySelector(".card h2").innerHTML = `<i class="fas fa-shield-alt"></i> ${t("auth.verificationCode")}`;
      document.getElementById("stepContent").innerHTML = `
        <div class="alert alert-success" style="margin-bottom:16px">
          <i class="fas fa-envelope"></i> ${t("auth.resetLinkSent")}
        </div>
        <div class="form-group">
          <label class="form-label" for="forgotCode">${t("auth.verificationCode")}</label>
          <input type="text" class="form-input" id="forgotCode" name="code" placeholder="${t("auth.tokenPlaceholder") || "Enter the 6-digit code"}" required autocomplete="off" inputmode="numeric" maxlength="6" style="text-align:center;font-size:1.5rem;letter-spacing:8px">
        </div>
        <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotCodeBtn">${t("auth.verifyCode")}</button>
        <div style="margin-top:12px">
          <button id="resendBtn" class="btn btn-ghost btn-block" disabled><i class="fas fa-redo"></i> ${t("auth.resendCode")}</button>
          <button id="backToEmailBtn" class="btn btn-ghost btn-block" style="margin-top:4px"><i class="fas fa-arrow-left"></i> ${t("common.back")}</button>
        </div>
      `;
      document.getElementById("forgotCode").focus();
      startResendCountdown();
      document.getElementById("forgotCodeBtn").addEventListener("click", (e) => {
        e.preventDefault();
        handleStep2();
      });
      document.getElementById("forgotCode").addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); handleStep2(); }
      });
      document.getElementById("resendBtn").addEventListener("click", handleResend);
      document.getElementById("backToEmailBtn").addEventListener("click", () => {
        if (countdownInterval) clearInterval(countdownInterval);
        showEmailStep();
      });
    };

    const showPasswordStep = () => {
      const alertDiv = document.getElementById("forgotAlert");
      if (alertDiv) alertDiv.innerHTML = "";
      document.getElementById("forgotForm").style.display = "block";
      document.querySelector(".card h2").innerHTML = `<i class="fas fa-key"></i> ${t("auth.newPassword")}`;
      document.getElementById("stepContent").innerHTML = `
        <div class="form-group">
          <label class="form-label" for="forgotNewPw">${t("auth.newPassword")}</label>
          <div class="password-wrapper">
            <input type="password" class="form-input" id="forgotNewPw" name="newPassword" placeholder="${t("auth.newPassword")}" required autocomplete="new-password" minlength="8">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="forgotConfirmPw">${t("auth.confirmNewPassword")}</label>
          <div class="password-wrapper">
            <input type="password" class="form-input" id="forgotConfirmPw" name="confirmPassword" placeholder="${t("auth.confirmNewPassword")}" required autocomplete="new-password" minlength="8">
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotResetBtn"><i class="fas fa-key"></i> ${t("auth.resetPassword")}</button>
        <div style="margin-top:12px">
          <button id="backToCodeBtn" class="btn btn-ghost btn-block"><i class="fas fa-arrow-left"></i> ${t("common.back")}</button>
        </div>
      `;
      document.getElementById("forgotNewPw").focus();
      document.getElementById("forgotResetBtn").addEventListener("click", (e) => {
        e.preventDefault();
        handleStep3();
      });
      document.getElementById("forgotConfirmPw").addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); handleStep3(); }
      });
      document.getElementById("backToCodeBtn").addEventListener("click", () => {
        showCodeStep();
      });
    };

    const handleStep1 = async () => {
      const alertDiv = document.getElementById("forgotAlert");
      const emailInput = document.getElementById("forgotEmail");
      clearAllFieldErrors(document.getElementById("forgotForm"));
      if (alertDiv) alertDiv.innerHTML = "";

      if (!emailInput.value.trim() || !emailInput.validity.valid) {
        showFieldError(emailInput, t("auth.invalidEmail"));
        return;
      }

      forgotEmail = emailInput.value.trim();
      const btn = document.getElementById("forgotEmailBtn");
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.sendingResetLink")}`;

      try {
        await api.post("/auth/forgot-password", { email: forgotEmail });
        showCodeStep();
      } catch (err) {
        if (err.message?.toLowerCase().includes("not found")) {
          const confirmed = await showConfirm(
            t("auth.emailNotFound"),
            t("auth.emailNotFoundRegister"),
            { confirmText: t("auth.register"), cancelText: t("common.cancel"), type: "primary" }
          );
          if (confirmed) navigate("register");
          return;
        }
        if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        btn.disabled = false;
        btn.textContent = t("auth.sendResetLink");
      }
    };

    const handleStep2 = async () => {
      const alertDiv = document.getElementById("forgotAlert");
      const codeInput = document.getElementById("forgotCode");
      clearAllFieldErrors(document.getElementById("forgotForm"));
      if (alertDiv) alertDiv.innerHTML = "";

      if (!codeInput.value.trim()) {
        showFieldError(codeInput, t("auth.fieldRequired"));
        return;
      }

      forgotCode = codeInput.value.trim();

      const btn = document.getElementById("forgotCodeBtn");
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.verifying") || "Verifying..."}`;

      try {
        await api.post("/auth/verify-reset-code", {
          email: forgotEmail,
          token: forgotCode,
        });
        showPasswordStep();
      } catch (err) {
        if (err.message?.includes("404")) {
          showPasswordStep();
          return;
        }
        if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        btn.disabled = false;
        btn.textContent = t("auth.verifyCode");
      }
    };

    const handleStep3 = async () => {
      const alertDiv = document.getElementById("forgotAlert");
      const newPw = document.getElementById("forgotNewPw");
      const confirmPw = document.getElementById("forgotConfirmPw");
      clearAllFieldErrors(document.getElementById("forgotForm"));
      if (alertDiv) alertDiv.innerHTML = "";

      if (!newPw.value || newPw.value.length < 8) {
        showFieldError(newPw, t("auth.passwordMinLength"));
        return;
      }

      if (newPw.value !== confirmPw.value) {
        showFieldError(confirmPw, t("auth.passwordsDoNotMatch"));
        return;
      }

      const btn = document.getElementById("forgotResetBtn");
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.updatingPassword")}`;

      try {
        await api.post("/auth/reset-password", {
          email: forgotEmail,
          token: forgotCode,
          newPassword: newPw.value,
          confirmPassword: confirmPw.value,
        });
        if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t("auth.passwordResetSuccess")}</div>`;
        document.getElementById("forgotForm").style.display = "none";
        document.querySelector(".card h2").innerHTML = `<i class="fas fa-check-circle"></i> ${t("auth.passwordResetSuccess")}`;
        setTimeout(() => navigate("login"), 2500);
      } catch (err) {
        if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        btn.disabled = false;
        btn.textContent = t("auth.resetPassword");
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
            <div id="stepContent"></div>
          </form>
          <div class="auth-footer"><a href="#/login">${t("auth.login")}</a></div>
        </div>
      </div>
    `;

    showEmailStep();
  }, 300);
}
