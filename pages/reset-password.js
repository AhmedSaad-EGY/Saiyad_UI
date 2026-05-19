function renderResetPassword(container, fullPath, params) {
  const token = params.token;
  const email = params.email || "";

  if (!token) {
    navigate("login");
    return;
  }

  showLoading(container, "auth");

  setTimeout(() => {
    container.innerHTML = `
      <div class="auth-page">
        <div class="card">
          <h2><i class="fas fa-key"></i> ${t("auth.resetPassword")}</h2>
          <div id="resetAlert"></div>
          <form id="resetForm" novalidate>
            <div class="form-group"${email ? ' style="display:none"' : ""}>
              <label class="form-label" for="resetEmail">${t("auth.email")} *</label>
              <input type="email" class="form-input" id="resetEmail" name="email" placeholder="your@email.com" value="${escapeHtml(email)}" required autocomplete="email" inputmode="email">
            </div>
            <div class="form-group">
              <label class="form-label" for="resetPassword">${t("auth.newPassword")}</label>
              <div class="password-wrapper">
                <input type="password" class="form-input" id="resetPassword" name="password" required minlength="6">
                <button type="button" class="toggle-password" id="resetTogglePw" aria-label="${t("auth.showPassword")}"><i class="fas fa-eye"></i></button>
              </div>
              <div class="password-strength" id="resetStrength"><div class="password-strength-bar" id="resetStrengthBar"></div></div>
              <div class="password-strength-text" id="resetStrengthText"></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="resetConfirmPw">${t("auth.confirmNewPassword")}</label>
              <div class="password-wrapper">
                <input type="password" class="form-input" id="resetConfirmPw" name="confirmPassword" required minlength="6">
                <button type="button" class="toggle-password" id="resetToggleConfirmPw" aria-label="${t("auth.showPassword")}"><i class="fas fa-eye"></i></button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="resetSubmit">${t("auth.resetPassword")}</button>
          </form>
        </div>
      </div>
    `;

    const resetForm = document.getElementById("resetForm");
    const resetEmail = document.getElementById("resetEmail");
    const resetPassword = document.getElementById("resetPassword");
    const resetConfirmPw = document.getElementById("resetConfirmPw");
    const resetSubmit = document.getElementById("resetSubmit");
    const alertDiv = document.getElementById("resetAlert");
    const strengthBar = document.getElementById("resetStrengthBar");
    const strengthText = document.getElementById("resetStrengthText");
    const resetTogglePw = document.getElementById("resetTogglePw");
    const resetToggleConfirmPw = document.getElementById("resetToggleConfirmPw");

    resetTogglePw.addEventListener("click", () => {
      const isPw = resetPassword.type === "password";
      resetPassword.type = isPw ? "text" : "password";
      resetTogglePw.innerHTML = isPw
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
      resetTogglePw.setAttribute("aria-label", isPw ? t("auth.hidePassword") : t("auth.showPassword"));
    });

    resetToggleConfirmPw.addEventListener("click", () => {
      const isPw = resetConfirmPw.type === "password";
      resetConfirmPw.type = isPw ? "text" : "password";
      resetToggleConfirmPw.innerHTML = isPw
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
      resetToggleConfirmPw.setAttribute("aria-label", isPw ? t("auth.hidePassword") : t("auth.showPassword"));
    });

    resetPassword.addEventListener("input", () => {
      clearFieldError(resetPassword);
      const pw = resetPassword.value;
      if (!pw) {
        strengthBar.className = "password-strength-bar strength-empty";
        strengthText.textContent = "";
        return;
      }
      const result = getPasswordStrength(pw);
      strengthBar.className = "password-strength-bar " + result.cls;
      strengthText.textContent = result.label;
      strengthText.style.color = getComputedStyle(strengthBar).backgroundColor;
      if (resetConfirmPw.value) {
        if (pw !== resetConfirmPw.value) {
          showFieldError(resetConfirmPw, t("auth.passwordsDoNotMatch"));
        } else {
          clearFieldError(resetConfirmPw);
        }
      }
    });

    resetConfirmPw.addEventListener("input", () => {
      clearFieldError(resetConfirmPw);
      if (resetConfirmPw.value && resetConfirmPw.value !== resetPassword.value) {
        showFieldError(resetConfirmPw, t("auth.passwordsDoNotMatch"));
      }
    });

    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAllFieldErrors(resetForm);
      alertDiv.innerHTML = "";

      let valid = true;
      valid = validateForm(resetForm, [
        {
          element: resetEmail,
          required: true,
          email: true,
          messages: { required: t("auth.fieldRequired"), email: t("auth.invalidEmail") },
        },
        {
          element: resetPassword,
          required: true,
          minLength: 6,
          hasSpecialChar: true,
          messages: {
            minLength: t("auth.password") + " must be at least 6 characters.",
          },
        },
        {
          element: resetConfirmPw,
          required: true,
          matches: { element: resetPassword },
          messages: { matches: t("auth.passwordsDoNotMatch") },
        },
      ]);

      if (!valid) return;

      resetSubmit.disabled = true;
      resetSubmit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.updatingPassword")}`;

      try {
        await api.post("/auth/reset-password", {
          email: resetEmail.value.trim(),
          token: token,
          newPassword: resetPassword.value,
          confirmPassword: resetConfirmPw.value,
        });

        alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t("auth.passwordResetSuccess")}</div>`;
        resetForm.style.display = "none";

        setTimeout(() => navigate("login"), 3000);
      } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      } finally {
        if (resetSubmit) {
          resetSubmit.disabled = false;
          resetSubmit.textContent = t("auth.resetPassword");
        }
      }
    });
  }, 300);
}
