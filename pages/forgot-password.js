function renderForgotPassword(container) {
  if (isAuthenticated()) {
    navigate("");
    return;
  }

  showLoading(container, "form");

  setTimeout(() => {
    // ===== State =====
    let currentStep = 1;
    let forgotEmail = "";
    let forgotToken = "";
    let countdownInterval = null;
    let resendSeconds = 0;

    const renderStep = () => {
      const card = container.querySelector(".card");
      if (!card) return;

      const stepsHtml = `
        <div class="forgot-steps">
          <span class="forgot-step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "done" : ""}">${t("auth.email")}</span>
          <span class="forgot-step-line ${currentStep >= 2 ? "active" : ""}"></span>
          <span class="forgot-step ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "done" : ""}">${t("auth.verificationCode")}</span>
          <span class="forgot-step-line ${currentStep >= 3 ? "active" : ""}"></span>
          <span class="forgot-step ${currentStep >= 3 ? "active" : ""}">${t("auth.resetPassword")}</span>
        </div>
      `;

      const alertDiv = document.getElementById("forgotAlert");
      const form = document.getElementById("forgotForm");

      if (currentStep === 1) {
        card.querySelector("h2").innerHTML = `<i class="fas fa-unlock"></i> ${t("auth.forgotPassword")}`;
        if (alertDiv) alertDiv.innerHTML = "";
        if (form) form.style.display = "block";
        document.getElementById("stepContent").innerHTML = `
          <div class="form-group">
            <label class="form-label" for="forgotEmail">${t("auth.email")}</label>
            <input type="email" class="form-input" id="forgotEmail" name="email" placeholder="your@email.com" value="${escapeHtml(forgotEmail)}" required autocomplete="email" inputmode="email">
            <div class="form-hint">${t("auth.resetLinkSent")}</div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotSubmit">${t("auth.sendResetLink")}</button>
        `;
        const emailInput = document.getElementById("forgotEmail");
        emailInput.addEventListener("input", () => clearFieldError(emailInput));
        emailInput.focus();
        document.getElementById("forgotSubmit").addEventListener("click", (e) => {
          e.preventDefault();
          handleStep1();
        });
        // Also submit on enter
        emailInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); handleStep1(); }
        });
      } else if (currentStep === 2) {
        card.querySelector("h2").innerHTML = `<i class="fas fa-key"></i> ${t("auth.verificationCode")}`;
        if (form) form.style.display = "block";
        document.getElementById("stepContent").innerHTML = `
          <div class="form-group">
            <label class="form-label" for="forgotToken">${t("auth.verificationCode")}</label>
            <input type="text" class="form-input" id="forgotToken" name="token" placeholder="${t("auth.tokenPlaceholder")}" value="${escapeHtml(forgotToken)}" required autocomplete="off" inputmode="text">
            <div class="form-hint">${t("auth.tokenHint")}</div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotVerifyBtn">${t("auth.verifyCode")}</button>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            <button id="resendCodeBtn" class="btn btn-ghost btn-block" disabled>${t("auth.resendCode")}</button>
            <button id="backToEmailBtn" class="btn btn-ghost btn-block"><i class="fas fa-arrow-left"></i> ${t("auth.email")}</button>
          </div>
        `;
        const tokenInput = document.getElementById("forgotToken");
        tokenInput.addEventListener("input", () => {
          clearFieldError(tokenInput);
          // Auto-extract token from pasted URL
          const val = tokenInput.value.trim();
          const match = val.match(/[?&]token=([^&\s]+)/);
          if (match) {
            tokenInput.value = decodeURIComponent(match[1]);
          }
        });
        tokenInput.focus();

        // Start or continue resend countdown
        startResendCountdown();

        document.getElementById("forgotVerifyBtn").addEventListener("click", (e) => {
          e.preventDefault();
          handleStep2();
        });
        tokenInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); handleStep2(); }
        });
        document.getElementById("resendCodeBtn").addEventListener("click", handleResend);
        document.getElementById("backToEmailBtn").addEventListener("click", () => {
          cleanup();
          currentStep = 1;
          renderStep();
        });
      } else if (currentStep === 3) {
        card.querySelector("h2").innerHTML = `<i class="fas fa-key"></i> ${t("auth.resetPassword")}`;
        if (form) form.style.display = "block";
        document.getElementById("stepContent").innerHTML = `
          <div class="form-group">
            <label class="form-label" for="forgotNewPw">${t("auth.newPassword")}</label>
            <div class="password-wrapper">
              <input type="password" class="form-input" id="forgotNewPw" name="newPassword" placeholder="${t("auth.newPassword")}" required autocomplete="new-password" minlength="8">
              <button type="button" class="toggle-password" id="forgotTogglePw" aria-label="${t("auth.showPassword")}"><i class="fas fa-eye"></i></button>
            </div>
            <div class="password-strength" id="forgotStrength"><div class="password-strength-bar" id="forgotStrengthBar"></div></div>
            <div class="password-strength-text" id="forgotStrengthText"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="forgotConfirmPw">${t("auth.confirmNewPassword")}</label>
            <div class="password-wrapper">
              <input type="password" class="form-input" id="forgotConfirmPw" name="confirmPassword" placeholder="${t("auth.confirmNewPassword")}" required autocomplete="new-password" minlength="8">
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotResetBtn">${t("auth.resetPassword")}</button>
        `;
        const newPw = document.getElementById("forgotNewPw");
        const confirmPw = document.getElementById("forgotConfirmPw");
        const strengthBar = document.getElementById("forgotStrengthBar");
        const strengthText = document.getElementById("forgotStrengthText");
        const toggleBtn = document.getElementById("forgotTogglePw");

        toggleBtn.addEventListener("click", () => {
          const isPw = newPw.type === "password";
          newPw.type = isPw ? "text" : "password";
          toggleBtn.innerHTML = isPw ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });

        newPw.addEventListener("input", () => {
          clearFieldError(newPw);
          const pw = newPw.value;
          if (!pw) {
            strengthBar.className = "password-strength-bar strength-empty";
            strengthText.textContent = "";
            return;
          }
          const result = getPasswordStrength(pw);
          strengthBar.className = "password-strength-bar " + result.cls;
          strengthText.textContent = result.label;
          strengthText.style.color = getComputedStyle(strengthBar).backgroundColor;
          if (confirmPw.value && pw !== confirmPw.value) {
            showFieldError(confirmPw, t("auth.passwordsDoNotMatch"));
          } else {
            clearFieldError(confirmPw);
          }
        });
        confirmPw.addEventListener("input", () => {
          clearFieldError(confirmPw);
          if (confirmPw.value && confirmPw.value !== newPw.value) {
            showFieldError(confirmPw, t("auth.passwordsDoNotMatch"));
          }
        });
        newPw.focus();

        document.getElementById("forgotResetBtn").addEventListener("click", (e) => {
          e.preventDefault();
          handleStep3();
        });
        confirmPw.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); handleStep3(); }
        });
      }
    };

    const startResendCountdown = () => {
      if (countdownInterval) clearInterval(countdownInterval);
      resendSeconds = 60;
      const updateBtn = () => {
        const btn = document.getElementById("resendCodeBtn");
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
        currentStep = 2;
        renderStep();
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
      clearAllFieldErrors(document.getElementById("forgotForm"));
      if (alertDiv) alertDiv.innerHTML = "";

      if (!tokenInput.value.trim()) {
        showFieldError(tokenInput, t("auth.fieldRequired"));
        return;
      }

      forgotToken = tokenInput.value.trim();
      const verifyBtn = document.getElementById("forgotVerifyBtn");
      verifyBtn.disabled = true;
      verifyBtn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.verifying") || "Verifying..."}`;

      try {
        await api.post("/auth/reset-password", { email: forgotEmail, token: forgotToken, newPassword: "Temp_Pass1", confirmPassword: "Temp_Pass1" });
        if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(t("auth.invalidToken") || "Invalid or expired token. Please request a new one.")}</div>`;
        verifyBtn.disabled = false;
        verifyBtn.textContent = t("auth.verifyCode");
      } catch (err) {
        const msg = (err.message || "").toLowerCase();
        if (msg.includes("new password") || msg.includes("password") || msg.includes("weak") || msg.includes("strength") || msg.includes("format")) {
          currentStep = 3;
          renderStep();
        } else {
          if (alertDiv) alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message || t("auth.invalidToken"))}</div>`;
          verifyBtn.disabled = false;
          verifyBtn.textContent = t("auth.verifyCode");
        }
      }
    };

    const handleStep3 = async () => {
      const alertDiv = document.getElementById("forgotAlert");
      const newPw = document.getElementById("forgotNewPw");
      const confirmPw = document.getElementById("forgotConfirmPw");
      clearAllFieldErrors(document.getElementById("forgotForm"));
      if (alertDiv) alertDiv.innerHTML = "";

      const rules = [
        {
          element: newPw, required: true, minLength: 8,
          hasUppercase: true, hasLowercase: true, hasDigit: true,
          messages: { minLength: t("auth.passwordMinLength") },
        },
        {
          element: confirmPw, required: true,
          matches: { element: newPw },
          messages: { matches: t("auth.passwordsDoNotMatch") },
        },
      ];
      if (!validateForm(document.getElementById("forgotForm"), rules)) return;

      const resetBtn = document.getElementById("forgotResetBtn");
      resetBtn.disabled = true;
      resetBtn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.updatingPassword")}`;

      try {
        await api.post("/auth/reset-password", { email: forgotEmail, token: forgotToken, newPassword: newPw.value, confirmPassword: confirmPw.value });
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

    // Render initial HTML
    container.innerHTML = `
      <div class="auth-page">
        <div class="card">
          <h2><i class="fas fa-unlock"></i> ${t("auth.forgotPassword")}</h2>
          <div class="forgot-steps">
            <span class="forgot-step active">${t("auth.email")}</span>
            <span class="forgot-step-line"></span>
            <span class="forgot-step">${t("auth.verificationCode")}</span>
            <span class="forgot-step-line"></span>
            <span class="forgot-step">${t("auth.resetPassword")}</span>
          </div>
          <div id="forgotAlert"></div>
          <form id="forgotForm" novalidate>
            <div id="stepContent"></div>
          </form>
          <div class="auth-footer"><a href="#/login">${t("auth.login")}</a></div>
        </div>
      </div>
    `;

    renderStep();
  }, 300);
}
