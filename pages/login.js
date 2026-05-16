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
              <button type="button" class="toggle-password" id="loginTogglePw" aria-label="${t("auth.showPassword")}" <i class="fas fa-eye"></i></button>
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
        alertDiv.innerHTML = `
          <div class="alert alert-warning">
            <i class="fas fa-envelope"></i>
            <strong>Email not verified.</strong>
            Please check your inbox and click the verification link.
            <br><small style="opacity:0.8">Didn't get it? Check your spam folder.</small>
          </div>
        `;
      } else {
        alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      }
    } finally {
      submit.disabled = false;
      submit.textContent = t("auth.signIn");
    }
  });
}
