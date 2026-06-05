import { t } from "../core/i18n/index.js";
import { navigate, registerRouteCleanup } from "../core/router/index.js";
import { showLoading } from "../core/utils/dom.js";
import { getPasswordStrength } from "../core/utils/validation.js";
import { api } from "../core/api/client.js";
import Alpine from "alpinejs";

Alpine.data("resetPwForm", () => ({
  email: "",
  password: "",
  confirmPassword: "",
  showPassword: false,
  showConfirmPw: false,
  loading: false,
  error: "",
  success: false,
  strengthCls: "strength-empty",
  strengthLabel: "",

  computeStrength() {
    if (!this.password) {
      this.strengthCls = "strength-empty";
      this.strengthLabel = "";
      return;
    }
    const result = getPasswordStrength(this.password);
    this.strengthCls = result.cls;
    this.strengthLabel = result.label;
  },

  async submit() {
    this.loading = true;
    this.error = "";

    if (
      !this.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())
    ) {
      this.error = t("auth.invalidEmail");
      this.loading = false;
      return;
    }
    if (!this.password || this.password.length < 8) {
      this.error = t("auth.passwordMinLength");
      this.loading = false;
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = t("auth.passwordsDoNotMatch");
      this.loading = false;
      return;
    }

    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const token = params.get("token");

    try {
      await api.post("/auth/reset-password", {
        email: this.email.trim(),
        token,
        newPassword: this.password,
        confirmPassword: this.confirmPassword,
      });
      this.success = true;
      const timer = setTimeout(() => navigate("login"), 3000);
      try {
        registerRouteCleanup(() => clearTimeout(timer));
      } catch {}
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },
}));

export default function renderResetPassword(container) {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const token = params.get("token");

  if (!token) {
    navigate("login");
    return;
  }

  showLoading(container, "form");

  const renderTimer = setTimeout(() => {
    const renderContent = () => {
      container.innerHTML = `
      <div x-data="resetPwForm" class="auth-page animate__animated animate__fadeIn">
        <div class="card">
          <div class="card-header">
            <h2><i class="fas fa-key" aria-hidden="true"></i> ${t("auth.resetPassword")}</h2>
          </div>
          <div class="card-body">
          <div x-show="error" class="alert alert-error" x-text="error" x-cloak></div>
          <div x-show="success" class="alert alert-success" x-cloak>
            <i class="fas fa-check-circle" aria-hidden="true"></i> ${t("auth.passwordResetSuccess")}
          </div>
          <form @submit.prevent="submit()" x-show="!success" novalidate>
            <div class="form-group">
              <label class="form-label" for="resetEmail">${t("auth.email")} *</label>
              <input type="email" class="form-input form-control" id="resetEmail" name="email" x-model="email" placeholder="${t('auth.emailPlaceholder')}" required autocomplete="email" inputmode="email">
            </div>
            <div class="form-group">
              <label class="form-label" for="resetPassword">${t("auth.newPassword")}</label>
              <div class="password-wrapper">
                <input :type="showPassword ? 'text' : 'password'" class="form-input form-control" id="resetPassword" name="password" x-model="password" @input="computeStrength()" required minlength="8">
                <button type="button" class="toggle-password" @click="showPassword = !showPassword" :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"><i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
              </div>
              <div class="password-strength"><div class="password-strength-bar" :class="'password-strength-bar ' + strengthCls"></div></div>
              <div class="password-strength-text" x-text="strengthLabel"></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="resetConfirmPw">${t("auth.confirmNewPassword")}</label>
              <div class="password-wrapper">
                <input :type="showConfirmPw ? 'text' : 'password'" class="form-input form-control" id="resetConfirmPw" name="confirmPassword" x-model="confirmPassword" required minlength="8">
                <button type="button" class="toggle-password" @click="showConfirmPw = !showConfirmPw" :aria-label="showConfirmPw ? $t('auth.hidePassword') : $t('auth.showPassword')"><i :class="showConfirmPw ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary w-100 btn-lg" :disabled="loading">
              <i class="fas fa-spinner spinner" x-show="loading" x-cloak></i>
              <span x-text="loading ? $t('auth.updatingPassword') : $t('auth.resetPassword')"></span>
            </button>
          </form>
          </div>
        </div>
      </div>`;
      if (typeof Alpine.discoverUninitializedComponents === "function") {
        Alpine.discoverUninitializedComponents(container);
      } else if (typeof Alpine.initTree === "function") {
        Alpine.initTree(container);
      }
    };

    renderContent();
  }, 300);
  registerRouteCleanup(() => clearTimeout(renderTimer));
}
