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

    const showEmailStep = () => {
      const alertDiv = document.getElementById("forgotAlert");
      if (alertDiv) alertDiv.innerHTML = "";
      document.getElementById("forgotForm").style.display = "block";
      document.querySelector(".card h2").innerHTML = `<i class="fas fa-unlock"></i> ${t("auth.forgotPassword")}`;
      document.getElementById("stepContent").innerHTML = `
        <div class="form-group">
          <label class="form-label" for="forgotEmail">${t("auth.email")}</label>
          <input type="email" class="form-input" id="forgotEmail" name="email" placeholder="your@email.com" required autocomplete="email" inputmode="email">
          <div class="form-hint">${t("auth.resetLinkSent")}</div>
        </div>
        <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotSubmit">${t("auth.sendResetLink")}</button>
      `;
      const emailInput = document.getElementById("forgotEmail");
      emailInput.value = forgotEmail;
      emailInput.addEventListener("input", () => clearFieldError(emailInput));
      emailInput.focus();
      document.getElementById("forgotSubmit").addEventListener("click", (e) => {
        e.preventDefault();
        handleStep1();
      });
      emailInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); handleStep1(); }
      });
    };

    const showResetStep = () => {
      document.getElementById("forgotForm").style.display = "block";
      document.querySelector(".card h2").innerHTML = `<i class="fas fa-key"></i> ${t("auth.resetPassword")}`;
      document.getElementById("stepContent").innerHTML = `
        <div class="form-group">
          <label class="form-label" for="forgotToken">${t("auth.verificationCode")}</label>
          <input type="text" class="form-input" id="forgotToken" name="token" placeholder="${t("auth.tokenPlaceholder") || "Paste the code from your email"}" required autocomplete="off">
          <div class="form-hint">${t("auth.tokenHint") || "Enter the code sent to your email"}</div>
        </div>
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
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
          <button id="resendBtn" class="btn btn-ghost btn-block" disabled><i class="fas fa-redo"></i> ${t("auth.resendCode")}</button>
          <button id="backToEmailBtn" class="btn btn-ghost btn-block"><i class="fas fa-arrow-left"></i> ${t("auth.email")}</button>
        </div>
      `;
      const tokenInput = document.getElementById("forgotToken");
      tokenInput.addEventListener("input", () => {
        clearFieldError(tokenInput);
        const val = tokenInput.value.trim();
        const match = val.match(/[?&]token=([^&\s]+)/);
        if (match) {
          tokenInput.value = decodeURIComponent(match[1]);
        }
      });
      tokenInput.focus();
      startResendCountdown();
      document.getElementById("forgotResetBtn").addEventListener("click", (e) => {
        e.preventDefault();
        handleStep2();
      });
      document.getElementById("forgotConfirmPw").addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); handleStep2(); }
      });
      document.getElementById("resendBtn").addEventListener("click", handleResend);
      document.getElementById("backToEmailBtn").addEventListener("click", () => {
        if (countdownInterval) clearInterval(countdownInterval);
        showEmailStep();
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
      const submitBtn = document.getElementById("forgotSubmit");
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.sendingResetLink")}`;

      try {
        await api.post("/auth/forgot-password", { email: forgotEmail });
        if (alertDiv) {
          alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t("auth.resetLinkSent")}</div>`;
        }
        showResetStep();
      } catch (err) {
        if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t("auth.sendResetLink");
      }
    };

    const handleStep2 = async () => {
      const alertDiv = document.getElementById("forgotAlert");
      const tokenInput = document.getElementById("forgotToken");
      const newPw = document.getElementById("forgotNewPw");
      const confirmPw = document.getElementById("forgotConfirmPw");
      clearAllFieldErrors(document.getElementById("forgotForm"));
      if (alertDiv) alertDiv.innerHTML = "";

      if (!tokenInput.value.trim()) {
        showFieldError(tokenInput, t("auth.fieldRequired"));
        return;
      }

      if (!newPw.value || newPw.value.length < 8) {
        showFieldError(newPw, t("auth.passwordMinLength"));
        return;
      }

      if (newPw.value !== confirmPw.value) {
        showFieldError(confirmPw, t("auth.passwordsDoNotMatch"));
        return;
      }

      const resetBtn = document.getElementById("forgotResetBtn");
      resetBtn.disabled = true;
      resetBtn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.updatingPassword")}`;

      try {
        await api.post("/auth/reset-password", {
          email: forgotEmail,
          token: tokenInput.value.trim(),
          newPassword: newPw.value,
          confirmPassword: confirmPw.value,
        });
        if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t("auth.passwordResetSuccess")}</div>`;
        document.getElementById("forgotForm").style.display = "none";
        setTimeout(() => navigate("login"), 2500);
      } catch (err) {
        if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = t("auth.resetPassword");
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
