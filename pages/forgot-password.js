function renderForgotPassword(container) {
  if (isAuthenticated()) {
    navigate("");
    return;
  }

  showLoading(container, "form");

  setTimeout(() => {
    let currentStep = 1;
    let savedEmail = "";
    let savedToken = "";
    let countdownInterval = null;

    const stepIndicator = (active) => `
      <div class="forgot-steps">
        <div class="forgot-step ${active >= 1 ? "active" : ""} ${active > 1 ? "complete" : ""}">
          ${active > 1 ? '<i class="fas fa-check"></i>' : "1"}
        </div>
        <div class="forgot-step-line ${active > 1 ? "active" : ""}"></div>
        <div class="forgot-step ${active >= 2 ? "active" : ""} ${active > 2 ? "complete" : ""}">
          ${active > 2 ? '<i class="fas fa-check"></i>' : "2"}
        </div>
        <div class="forgot-step-line ${active > 2 ? "active" : ""}"></div>
        <div class="forgot-step ${active >= 3 ? "active" : ""}">
          3
        </div>
      </div>
    `;

    function renderStep1() {
      currentStep = 1;
      container.innerHTML = `
        ${stepIndicator(1)}
        <div class="auth-page">
          <div class="card">
            <h2><i class="fas fa-unlock"></i> ${t("auth.forgotPassword")}</h2>
            <div id="forgotAlert"></div>
            <form id="forgotForm" novalidate>
              <div class="form-group">
                <label class="form-label" for="forgotEmail">${t("auth.email")}</label>
                <input type="email" class="form-input" id="forgotEmail" name="email" placeholder="your@email.com" required autocomplete="email" inputmode="email" value="${escapeHtml(savedEmail)}">
              </div>
              <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotSubmit">${t("auth.sendResetLink")}</button>
            </form>
            <div class="auth-footer"><a href="#/login">${t("auth.login")}</a></div>
          </div>
        </div>
      `;
      attachStep1Handlers();
    }

    function renderStep2() {
      currentStep = 2;
      container.innerHTML = `
        ${stepIndicator(2)}
        <div class="auth-page">
          <div class="card">
            <h2><i class="fas fa-key"></i> ${t("auth.verificationCode")}</h2>
            <div id="forgotAlert"></div>
            <form id="forgotTokenForm" novalidate>
              <div class="form-group">
                <label class="form-label" for="forgotToken">${t("auth.verificationCode")}</label>
                <input type="text" class="form-input" id="forgotToken" name="token" placeholder="${t("auth.tokenPlaceholder")}" required autocomplete="off">
                <div class="form-hint">${t("auth.enterToken")}</div>
              </div>
              <button type="submit" class="btn btn-primary btn-block btn-lg">${t("auth.verifyCode")}</button>
            </form>
            <div class="auth-footer" style="display:flex;flex-direction:column;gap:8px">
              <button id="resendTokenBtn" class="btn btn-ghost btn-block">
                <i class="fas fa-redo"></i> ${t("auth.didntGetCode")} ${t("auth.resendCode")}
              </button>
              <a href="#/forgot-password" class="btn btn-ghost btn-block" style="text-decoration:none">
                <i class="fas fa-envelope"></i> ${t("auth.email")}
              </a>
            </div>
          </div>
        </div>
      `;
      attachStep2Handlers();
    }

    function renderStep3() {
      currentStep = 3;
      container.innerHTML = `
        ${stepIndicator(3)}
        <div class="auth-page">
          <div class="card">
            <h2><i class="fas fa-key"></i> ${t("auth.resetPassword")}</h2>
            <div id="forgotAlert"></div>
            <form id="forgotResetForm" novalidate>
              <div class="form-group">
                <label class="form-label" for="forgotNewPw">${t("auth.newPassword")}</label>
                <div class="password-wrapper">
                  <input type="password" class="form-input" id="forgotNewPw" name="password" required minlength="8" autocomplete="new-password">
                  <button type="button" class="toggle-password" id="forgotTogglePw" aria-label="${t("auth.showPassword")}"><i class="fas fa-eye"></i></button>
                </div>
                <div class="password-strength" id="forgotStrength"><div class="password-strength-bar" id="forgotStrengthBar"></div></div>
                <div class="password-strength-text" id="forgotStrengthText"></div>
              </div>
              <div class="form-group">
                <label class="form-label" for="forgotConfirmPw">${t("auth.confirmNewPassword")}</label>
                <div class="password-wrapper">
                  <input type="password" class="form-input" id="forgotConfirmPw" name="confirmPassword" required minlength="8" autocomplete="new-password">
                  <button type="button" class="toggle-password" id="forgotToggleConfirmPw" aria-label="${t("auth.showPassword")}"><i class="fas fa-eye"></i></button>
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-block btn-lg" id="forgotResetSubmit">${t("auth.resetPassword")}</button>
            </form>
            <div class="auth-footer"><a href="#/login">${t("auth.login")}</a></div>
          </div>
        </div>
      `;
      attachStep3Handlers();
    }

    function attachStep1Handlers() {
      const emailInput = document.getElementById("forgotEmail");
      const form = document.getElementById("forgotForm");
      const submit = document.getElementById("forgotSubmit");
      const alertDiv = document.getElementById("forgotAlert");

      emailInput.addEventListener("input", () => clearFieldError(emailInput));

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (countdownInterval) clearInterval(countdownInterval);
        clearAllFieldErrors(form);
        alertDiv.innerHTML = "";

        if (!emailInput.value.trim() || !emailInput.validity.valid) {
          showFieldError(emailInput, t("auth.invalidEmail"));
          return;
        }

        submit.disabled = true;
        submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.sendingResetLink")}`;

        try {
          savedEmail = emailInput.value.trim();
          await api.post("/auth/forgot-password", { email: savedEmail });
          renderStep2();
        } catch (err) {
          alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
        } finally {
          submit.disabled = false;
          submit.textContent = t("auth.sendResetLink");
        }
      });
    }

    function attachStep2Handlers() {
      const tokenInput = document.getElementById("forgotToken");
      const form = document.getElementById("forgotTokenForm");
      const alertDiv = document.getElementById("forgotAlert");
      const resendBtn = document.getElementById("resendTokenBtn");

      tokenInput.addEventListener("input", () => clearFieldError(tokenInput));

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        clearAllFieldErrors(form);
        alertDiv.innerHTML = "";

        const raw = tokenInput.value.trim();
        if (!raw) {
          showFieldError(tokenInput, t("auth.fieldRequired"));
          return;
        }

        const match = raw.match(/[?&]token=([^&]+)/);
        savedToken = match ? decodeURIComponent(match[1]) : raw;

        renderStep3();
      });

      resendBtn.addEventListener("click", async () => {
        if (resendBtn.disabled) return;
        resendBtn.disabled = true;

        try {
          await api.post("/auth/forgot-password", { email: savedEmail });
          alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t("auth.resetLinkSent")}</div>`;
          let sec = 60;
          countdownInterval = setInterval(() => {
            sec--;
            resendBtn.innerHTML = `<i class="fas fa-redo"></i> ${t("auth.resendCode")} (${sec}s)`;
            if (sec <= 0) {
              clearInterval(countdownInterval);
              resendBtn.disabled = false;
              resendBtn.innerHTML = `<i class="fas fa-redo"></i> ${t("auth.didntGetCode")} ${t("auth.resendCode")}`;
            }
          }, 1000);
        } catch {
          resendBtn.disabled = false;
        }
      });
    }

    function attachStep3Handlers() {
      const newPw = document.getElementById("forgotNewPw");
      const confirmPw = document.getElementById("forgotConfirmPw");
      const form = document.getElementById("forgotResetForm");
      const submit = document.getElementById("forgotResetSubmit");
      const alertDiv = document.getElementById("forgotAlert");
      const strengthBar = document.getElementById("forgotStrengthBar");
      const strengthText = document.getElementById("forgotStrengthText");

      document.getElementById("forgotTogglePw").addEventListener("click", () => {
        const isPw = newPw.type === "password";
        newPw.type = isPw ? "text" : "password";
        document.getElementById("forgotTogglePw").innerHTML = isPw
          ? '<i class="fas fa-eye-slash"></i>'
          : '<i class="fas fa-eye"></i>';
      });

      document.getElementById("forgotToggleConfirmPw").addEventListener("click", () => {
        const isPw = confirmPw.type === "password";
        confirmPw.type = isPw ? "text" : "password";
        document.getElementById("forgotToggleConfirmPw").innerHTML = isPw
          ? '<i class="fas fa-eye-slash"></i>'
          : '<i class="fas fa-eye"></i>';
      });

      newPw.addEventListener("input", () => {
        clearFieldError(newPw);
        if (!newPw.value) {
          strengthBar.className = "password-strength-bar strength-empty";
          strengthText.textContent = "";
          return;
        }
        const result = getPasswordStrength(newPw.value);
        strengthBar.className = "password-strength-bar " + result.cls;
        strengthText.textContent = result.label;
        strengthText.style.color = getComputedStyle(strengthBar).backgroundColor;
        if (confirmPw.value && newPw.value !== confirmPw.value) {
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

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearAllFieldErrors(form);
        alertDiv.innerHTML = "";

        const valid = validateForm(form, [
          {
            element: newPw,
            required: true,
            minLength: 8,
            hasUppercase: true,
            hasLowercase: true,
            hasDigit: true,
            messages: { minLength: t("auth.passwordMinLength") },
          },
          {
            element: confirmPw,
            required: true,
            matches: { element: newPw },
            messages: { matches: t("auth.passwordsDoNotMatch") },
          },
        ]);

        if (!valid) return;

        submit.disabled = true;
        submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.updatingPassword")}`;

        try {
          await api.post("/auth/reset-password", {
            token: savedToken,
            newPassword: newPw.value,
          });
          alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t("auth.passwordResetSuccess")}</div>`;
          form.style.display = "none";
          setTimeout(() => navigate("login"), 3000);
        } catch (err) {
          alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
          const backBtn = document.createElement("button");
          backBtn.className = "btn btn-ghost btn-block";
          backBtn.style.marginTop = "12px";
          backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> ${t("auth.verifyCode")}`;
          backBtn.onclick = () => renderStep2();
          alertDiv.appendChild(backBtn);
        } finally {
          submit.disabled = false;
          submit.textContent = t("auth.resetPassword");
        }
      });
    }

    renderStep1();

    window.onRouteCleanup = () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, 300);
}
