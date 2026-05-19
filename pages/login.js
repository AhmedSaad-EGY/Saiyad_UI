function renderLogin(container) {
  if (isAuthenticated()) {
    navigate("");
    return;
  }
  container.innerHTML = `
    <div class="auth-page">
      <div class="card">
        <h2><i class="fas fa-sign-in-alt"></i> ${t("auth.login")}</h2>
        <div id="loginAlert"></div>
        <form id="loginForm" novalidate>
          <div class="form-group">
            <label class="form-label" for="loginEmail">${t("auth.email")}</label>
            <input type="email" class="form-input" id="loginEmail" name="email" placeholder="your@email.com" required autocomplete="email" inputmode="email">
          </div>
          <div class="form-group">
            <label class="form-label" for="loginPassword">${t("auth.password")}</label>
            <div class="password-wrapper">
              <input type="password" class="form-input" id="loginPassword" name="password" placeholder="${t("auth.password")}" required autocomplete="current-password" minlength="6">
              <button type="button" class="toggle-password" id="loginTogglePw" aria-label="${t("auth.showPassword")}"><i class="fas fa-eye"></i></button>
            </div>
            <div style="text-align: right; margin-top: 4px;">
              <a href="#/forgot-password" style="font-size: var(--text-xs); color: var(--primary); text-decoration: none;">${t("auth.forgotPassword")}</a>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="loginSubmit">${t("auth.signIn")}</button>
        </form>
        <div class="auth-footer">${t("auth.noAccount")} <a href="#/register">${t("auth.register")}</a></div>
      </div>
    </div>
  `;

  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginTogglePw = document.getElementById("loginTogglePw");

  function clearLoginErrors() {
    clearAllFieldErrors(loginForm);
    document.getElementById("loginAlert").innerHTML = "";
  }

  loginEmail.addEventListener("input", () => clearFieldError(loginEmail));
  loginEmail.addEventListener("blur", () => {
    if (loginEmail.value.trim() && !loginEmail.validity.valid) {
      showFieldError(loginEmail, t("auth.invalidEmail"));
    }
  });
  loginPassword.addEventListener("input", () => clearFieldError(loginPassword));

  loginTogglePw.addEventListener("click", () => {
    const isPw = loginPassword.type === "password";
    loginPassword.type = isPw ? "text" : "password";
    loginTogglePw.innerHTML = isPw
      ? '<i class="fas fa-eye-slash"></i>'
      : '<i class="fas fa-eye"></i>';
    loginTogglePw.setAttribute(
      "aria-label",
      isPw ? t("auth.hidePassword") : t("auth.showPassword"),
    );
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearLoginErrors();
    const submit = document.getElementById("loginSubmit");
    const alertDiv = document.getElementById("loginAlert");
    let valid = true;

    valid = validateForm(loginForm, [
      {
        element: loginEmail,
        required: true,
        email: true,
        messages: { required: t("auth.invalidEmail") },
      },
      {
        element: loginPassword,
        required: true,
        minLength: 6,
        messages: {
          minLength: t("auth.passwordMinLength"),
        },
      },
    ]);

    if (!valid) {
      return;
    }

    submit.disabled = true;
    submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.signingIn")}`;

    try {
      const data = await api.post("/auth/login", {
        email: loginEmail.value.trim(),
        password: loginPassword.value,
      });
      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      updateNavbar();
      navigate("");
    } catch (err) {
      if (err.message?.toLowerCase().includes("verify your email")) {
        const email = loginEmail.value.trim();
        alertDiv.innerHTML = `
          <div class="alert alert-warning" role="alert" style="text-align:center">
            <i class="fas fa-envelope" style="font-size:2rem;display:block;margin-bottom:8px"></i>
            <strong>${t("auth.emailNotVerified") || "Email not verified."}</strong>
            <p style="margin:8px 0;font-size:var(--text-sm)">${t("auth.checkInbox") || "Please check your inbox and click the verification link."}</p>
            <button class="btn btn-primary btn-sm" id="resendVerificationBtn" style="margin-top:4px">
              <i class="fas fa-paper-plane"></i> ${t("auth.resendVerification") || "Resend Verification"}
            </button>
            <p style="margin:8px 0 0;font-size:var(--text-xs);opacity:0.7"><i class="fas fa-clock"></i> ${t("auth.checkSpam") || "Didn't get it? Check your spam folder."}</p>
          </div>
        `;
        const resendBtn = document.getElementById("resendVerificationBtn");
        resendBtn.addEventListener("click", async () => {
          resendBtn.disabled = true;
          resendBtn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.sending") || "Sending..."}`;
          try {
            await api.post("/auth/resend-verification", { email });
            showToast(t("auth.verificationSent") || "Verification email sent!", "success");
            resendBtn.innerHTML = `<i class="fas fa-check"></i> ${t("auth.sent") || "Sent!"}`;
          } catch (e) {
            showToast(e.message, "error");
            resendBtn.disabled = false;
            resendBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${t("auth.resendVerification") || "Resend Verification"}`;
          }
        });
      } else {
        alertDiv.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(err.message)}</div>`;
      }
    } finally {
      submit.disabled = false;
      submit.textContent = t("auth.signIn");
    }
  });
}
