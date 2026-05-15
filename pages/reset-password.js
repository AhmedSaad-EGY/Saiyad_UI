function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score < 2)
    return { cls: "strength-weak", label: t("auth.passwordStrength.weak") };
  if (score < 3)
    return { cls: "strength-fair", label: t("auth.passwordStrength.fair") };
  if (score < 4)
    return { cls: "strength-good", label: t("auth.passwordStrength.good") };
  return { cls: "strength-strong", label: t("auth.passwordStrength.strong") };
}

function renderResetPassword(container) {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const token = params.get("token");

  if (!token) {
    navigate("login");
    return;
  }

  showLoading(container, "form");

  setTimeout(() => {
    container.innerHTML = `
      <div class="auth-page">
        <div class="card">
          <h2><i class="fas fa-key"></i> ${t("auth.resetPassword")}</h2>
          <div id="resetAlert"></div>
          <form id="resetForm" novalidate>
            <div class="form-group">
              <label class="form-label" for="resetPassword">${t("auth.newPassword")}</label>
              <div class="password-wrapper">
                <input type="password" class="form-input" id="resetPassword" name="password" required minlength="6">
                <button type="button" class="toggle-password" id="resetTogglePw" aria-label="${t("auth.showPassword")}" tabindex="-1"><i class="fas fa-eye"></i></button>
              </div>
              <div class="password-strength" id="resetStrength"><div class="password-strength-bar" id="resetStrengthBar"></div></div>
              <div class="password-strength-text" id="resetStrengthText"></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="resetConfirmPw">${t("auth.confirmNewPassword")}</label>
              <div class="password-wrapper">
                <input type="password" class="form-input" id="resetConfirmPw" name="confirmPassword" required minlength="6">
                <button type="button" class="toggle-password" id="resetToggleConfirmPw" aria-label="${t("auth.showPassword")}" tabindex="-1"><i class="fas fa-eye"></i></button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="resetSubmit">${t("auth.resetPassword")}</button>
          </form>
        </div>
      </div>
    `;

    const resetForm = document.getElementById("resetForm");
    const resetPassword = document.getElementById("resetPassword");
    const resetConfirmPw = document.getElementById("resetConfirmPw");
    const resetSubmit = document.getElementById("resetSubmit");
    const alertDiv = document.getElementById("resetAlert");
    const strengthBar = document.getElementById("resetStrengthBar");
    const strengthText = document.getElementById("resetStrengthText");
    const resetTogglePw = document.getElementById("resetTogglePw");
    const resetToggleConfirmPw = document.getElementById(
      "resetToggleConfirmPw",
    );

    resetTogglePw.addEventListener("click", () => {
      const isPw = resetPassword.type === "password";
      resetPassword.type = isPw ? "text" : "password";
      resetTogglePw.innerHTML = isPw
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
      resetTogglePw.setAttribute(
        "aria-label",
        isPw ? t("auth.hidePassword") : t("auth.showPassword"),
      );
    });

    resetToggleConfirmPw.addEventListener("click", () => {
      const isPw = resetConfirmPw.type === "password";
      resetConfirmPw.type = isPw ? "text" : "password";
      resetToggleConfirmPw.innerHTML = isPw
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
      resetToggleConfirmPw.setAttribute(
        "aria-label",
        isPw ? t("auth.hidePassword") : t("auth.showPassword"),
      );
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
      if (
        resetConfirmPw.value &&
        resetConfirmPw.value !== resetPassword.value
      ) {
        showFieldError(resetConfirmPw, t("auth.passwordsDoNotMatch"));
      }
    });

    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAllFieldErrors(resetForm);
      alertDiv.innerHTML = "";

      let valid = true;
      if (resetPassword.value.length < 6) {
        showFieldError(
          resetPassword,
          t("auth.password") + " must be at least 6 characters.",
        );
        valid = false;
      }
      if (resetPassword.value !== resetConfirmPw.value) {
        showFieldError(resetConfirmPw, t("auth.passwordsDoNotMatch"));
        valid = false;
      }

      if (!valid) return;

      resetSubmit.disabled = true;
      resetSubmit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auth.updatingPassword")}`;

      try {
        await api.post("/auth/reset-password", {
          token: token,
          newPassword: resetPassword.value,
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
