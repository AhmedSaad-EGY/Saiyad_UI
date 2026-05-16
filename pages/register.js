function renderRegister(container) {
  if (isAuthenticated()) {
    navigate("");
    return;
  }
  container.innerHTML = `
    <div class="auth-page">
      <div class="card">
        <h2><i class="fas fa-user-plus"></i> ${t("auth.register")}</h2>
        <div id="registerAlert"></div>
        <form id="registerForm" novalidate>
          <div class="form-group">
            <label class="form-label" for="regName">${t("auth.fullName")}</label>
            <input type="text" class="form-input" id="regName" name="fullName" placeholder="John Doe" required autocomplete="name">
          </div>
          <div class="form-group">
            <label class="form-label" for="regEmail">${t("auth.email")}</label>
            <input type="email" class="form-input" id="regEmail" name="email" placeholder="your@email.com" required autocomplete="email" inputmode="email">
          </div>
          <div class="form-group">
            <label class="form-label" for="regPhone">${t("auth.phone")}</label>
            <input type="tel" class="form-input" id="regPhone" name="phone" placeholder="+1234567890" autocomplete="tel" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="regPassword">${t("auth.password")}</label>
            <div class="password-wrapper">
              <input type="password" class="form-input" id="regPassword" name="password" placeholder="${t("auth.password")}" required autocomplete="new-password" minlength="8">
              <button type="button" class="toggle-password" id="regTogglePw" aria-label="${t("auth.showPassword")}" <i class="fas fa-eye"></i></button>
            </div>
            <div class="password-strength" id="regStrength"><div class="password-strength-bar" id="regStrengthBar"></div></div>
            <div class="password-strength-text" id="regStrengthText"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="regConfirmPw">${t("auth.confirmPassword")}</label>
            <div class="password-wrapper">
              <input type="password" class="form-input" id="regConfirmPw" name="confirmPassword" placeholder="${t("auth.confirmPassword")}" required autocomplete="new-password" minlength="6">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="regRole">${t("auth.role")}</label>
            <select class="form-select" id="regRole" name="role">
              <option value="Customer">${t("auth.customer")}</option>
              <option value="Fisherman">${t("auth.fisherman")}</option>
              <option value="BaitSeller">${t("auth.baitSeller")}</option>
              <option value="Auctioneer">${t("auth.auctioneer")}</option>
            </select>
          </div>
          <div id="roleRequirements"></div>
          <div class="form-group">
            <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:8px">
              <input type="checkbox" id="regTerms" name="terms" style="width:18px; height:18px; cursor:pointer; margin-top:2px">
              <label for="regTerms" style="font-size:var(--text-sm); color:var(--text-secondary); cursor:pointer; line-height:1.4">
                ${t("auth.iAccept")} <a href="#/terms" class="legal-link" style="color:var(--primary); font-weight:600; text-decoration:none">${t("auth.termsAndConditions")}</a> 
                ${t("auth.and")} <a href="#/privacy" class="legal-link" style="color:var(--primary); font-weight:600; text-decoration:none">${t("auth.privacyPolicy")}</a>
              </label>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="registerSubmit">${t("auth.createAccount")}</button>
        </form>
        <div class="auth-footer">${t("auth.hasAccount")} <a href="#/login">${t("auth.login")}</a></div>
      </div>
    </div>
  `;

  const regForm = document.getElementById("registerForm");
  const regName = document.getElementById("regName");
  const regEmail = document.getElementById("regEmail");
  const regPhone = document.getElementById("regPhone");
  const regPassword = document.getElementById("regPassword");
  const regConfirmPw = document.getElementById("regConfirmPw");
  const regRole = document.getElementById("regRole");
  const regTerms = document.getElementById("regTerms");
  const regTogglePw = document.getElementById("regTogglePw");
  const strengthBar = document.getElementById("regStrengthBar");
  const strengthText = document.getElementById("regStrengthText");

  function clearRegErrors() {
    clearAllFieldErrors(regForm);
    document.getElementById("registerAlert").innerHTML = "";
  }

  function updateRoleRequirements() {
    const role = regRole.value;
    const container = document.getElementById("roleRequirements");

    if (role === "Fisherman") {
      container.innerHTML = `
        <div class="form-group animate-on-scroll slide-down" style="display: block; opacity: 1; transform: translateY(0);">
          <label class="form-label" for="regLicense">${t("auth.licenseNumber")} *</label>
          <input type="text" class="form-input" id="regLicense" name="licenseNumber" placeholder="FL-123456" required>
        </div>
      `;
      const regLicense = document.getElementById("regLicense");
      regLicense.addEventListener("input", () => clearFieldError(regLicense));
    } else {
      container.innerHTML = "";
    }
  }

  regRole.addEventListener("change", updateRoleRequirements);
  updateRoleRequirements(); // Initialize on load

  regName.addEventListener("input", () => clearFieldError(regName));
  regEmail.addEventListener("input", () => clearFieldError(regEmail));
  regEmail.addEventListener("blur", () => {
    if (regEmail.value.trim() && !regEmail.validity.valid) {
      showFieldError(regEmail, t("auth.invalidEmail"));
    }
  });
  regPhone.addEventListener("input", () => clearFieldError(regPhone));
  regTerms.addEventListener("change", () => clearFieldError(regTerms));

  regTogglePw.addEventListener("click", () => {
    const isPw = regPassword.type === "password";
    regPassword.type = isPw ? "text" : "password";
    regTogglePw.innerHTML = isPw
      ? '<i class="fas fa-eye-slash"></i>'
      : '<i class="fas fa-eye"></i>';
    regTogglePw.setAttribute(
      "aria-label",
      isPw ? t("auth.hidePassword") : t("auth.showPassword"),
    );
  });

  // Handle legal links with simulated loading state for better UX
  regForm.querySelectorAll(".legal-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("href").replace("#/", "");
      const app = document.getElementById("app");
      showLoading(app, "page");
      setTimeout(() => navigate(target), 300);
    });
  });

  regPassword.addEventListener("input", () => {
    clearFieldError(regPassword);
    const pw = regPassword.value;
    if (!pw) {
      strengthBar.className = "password-strength-bar strength-empty";
      strengthText.textContent = "";
      return;
    }
    const result = getPasswordStrength(pw);
    strengthBar.className = "password-strength-bar " + result.cls;
    strengthText.textContent = result.label;
    strengthText.style.color = getComputedStyle(strengthBar).backgroundColor;
    if (regConfirmPw.value) {
      if (pw !== regConfirmPw.value) {
        showFieldError(regConfirmPw, t("auth.passwordsDoNotMatch"));
      } else {
        clearFieldError(regConfirmPw);
      }
    }
  });

  regConfirmPw.addEventListener("input", () => {
    clearFieldError(regConfirmPw);
    if (regConfirmPw.value && regConfirmPw.value !== regPassword.value) {
      showFieldError(regConfirmPw, t("auth.passwordsDoNotMatch"));
    }
  });

  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearRegErrors();
    const submit = document.getElementById("registerSubmit");
    const alertDiv = document.getElementById("registerAlert");
    let valid = true;

    const validationFields = [
      {
        element: regName,
        required: true,
        messages: { required: t("auth.fullName") + " is required." },
      },
      {
        element: regEmail,
        required: true,
        email: true,
        messages: { required: t("auth.invalidEmail") },
      },
      {
        element: regPhone,
        required: true,
        phone: true,
        messages: { required: t("auth.fieldRequired") },
      },
      {
        element: regPassword,
        required: true,
        minLength: 8,
        hasUppercase: true,
        hasLowercase: true,
        hasDigit: true,
        messages: {
          minLength: t("auth.passwordMinLength"),
        },
      },
      {
        element: regConfirmPw,
        required: true,
        matches: { element: regPassword },
        messages: { matches: t("auth.passwordsDoNotMatch") },
      },
    ];

    if (regRole.value === "Fisherman") {
      const regLicense = document.getElementById("regLicense");
      validationFields.push({
        element: regLicense,
        required: true,
        messages: { required: t("auth.licenseRequired") },
      });
    }

    valid = validateForm(regForm, validationFields);

    if (!regTerms.checked) {
      showToast(t("auth.termsRequired"), "error");
      valid = false;
    }

    if (!valid) {
      return;
    }

    submit.disabled = true;
    submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.creatingAccount")}`;

    try {
      const savedEmail = regEmail.value.trim();
      const savedPassword = regPassword.value;

      await api.post("/auth/register", {
        fullName: regName.value.trim(),
        email: savedEmail,
        phone: regPhone.value.trim(),
        password: savedPassword,
        role: regRole.value,
      });

      regForm.reset();
      strengthBar.className = "password-strength-bar strength-empty";
      strengthText.textContent = "";

      showVerificationOverlay(savedEmail, savedPassword);
    } catch (err) {
      alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    } finally {
      submit.disabled = false;
      submit.textContent = t("auth.createAccount");
    }
  });

  function showVerificationOverlay(email, password) {
    const existing = document.getElementById("verifyOverlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "verifyOverlay";
    overlay.className = "verify-overlay";
    overlay.innerHTML = `
      <div class="verify-overlay-card">
        <div class="verify-overlay-icon" id="verifyIcon">
          <i class="fas fa-envelope"></i>
        </div>
        <h3>${t("auth.verifyOverlayTitle")}</h3>
        <p>${t("auth.verifyOverlayDesc")}<br><strong>${escapeHtml(email)}</strong></p>
        <div class="verify-overlay-dots" id="verifyDots">
          <span></span><span></span><span></span>
        </div>
        <p class="verify-overlay-hint" id="verifyHint">${t("auth.verifyOverlayWaiting")}</p>
        <div class="verify-overlay-actions" id="verifyActions">
          <button id="verifyAlreadyBtn" class="btn btn-outline btn-block">${t("auth.verifyOverlayAlready")}</button>
          <button id="verifyChangeEmailBtn" class="btn btn-ghost btn-block">${t("auth.verifyOverlayChangeEmail")}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let attempts = 0;
    const maxAttempts = 120;
    let polling = true;
    const verifyIcon = document.getElementById("verifyIcon");
    const verifyDots = document.getElementById("verifyDots");
    const verifyHint = document.getElementById("verifyHint");
    const verifyActions = document.getElementById("verifyActions");

    const poll = setInterval(async () => {
      if (!polling) return;
      attempts++;
      try {
        const data = await api.post("/auth/login", { email, password });
        clearInterval(poll);
        polling = false;
        verifyIcon.innerHTML = '<i class="fas fa-check-circle" style="color:var(--success);font-size:3rem;animation:scaleIn 0.3s ease"></i>';
        verifyIcon.style.animation = "none";
        verifyDots.style.display = "none";
        verifyHint.textContent = t("auth.verifyOverlayVerified");
        verifyActions.style.display = "none";
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        updateNavbar();
        showToast(t("auth.loginSuccess"), "success");
        setTimeout(() => {
          overlay.remove();
          navigate("");
        }, 1500);
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          verifyDots.style.display = "none";
          verifyHint.textContent = "Still not verified?";
        }
      }
    }, 3000);

    document.getElementById("verifyAlreadyBtn").addEventListener("click", async () => {
      clearInterval(poll);
      polling = false;
      try {
        const data = await api.post("/auth/login", { email, password });
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        updateNavbar();
        showToast(t("auth.loginSuccess"), "success");
        overlay.remove();
        navigate("");
      } catch {
        showToast("Please verify your email first.", "error");
        polling = true;
      }
    });

    document.getElementById("verifyChangeEmailBtn").addEventListener("click", () => {
      clearInterval(poll);
      polling = false;
      overlay.remove();
    });

    window.onRouteCleanup = () => {
      clearInterval(poll);
      polling = false;
      if (overlay.parentNode) overlay.remove();
    };
  }
}
