import { t } from "../core/i18n/index.js";
import { isAuthenticated } from "../core/auth/index.js";
import { navigate, registerRouteCleanup } from "../core/router/index.js";
import { showLoading } from "../core/utils/dom.js";
import { api } from "../core/api/client.js";
import { showToast, showConfirm } from "../core/utils/ui.js";
import Alpine from "alpinejs";

Alpine.data("forgotPwPage", () => ({
  step: "email",
  email: "",
  code: "",
  newPassword: "",
  confirmPassword: "",
  loading: false,
  error: "",
  savedEmail: "",
  savedCode: "",
  resendSeconds: 0,
  countdownInterval: null,
  redirectTimer: null,

  get resendLabel() {
    const base = t("auth.resendCode");
    return this.resendSeconds > 0 ? `${base} (${this.resendSeconds}s)` : base;
  },

  get isValidEmail() {
    return (
      this.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())
    );
  },

  startResendCountdown() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.resendSeconds = 60;
    this.countdownInterval = setInterval(() => {
      this.resendSeconds--;
      if (this.resendSeconds <= 0) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.resendSeconds = 0;
      }
    }, 1000);
  },

  async handleResend() {
    if (this.resendSeconds > 0) return;
    try {
      await api.post("/auth/forgot-password", { email: this.savedEmail });
      showToast(t("auth.resetLinkSent"), "success");
      this.startResendCountdown();
    } catch (err) {
      showToast(err.message, "error");
    }
  },

  async step1() {
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

    this.savedEmail = this.email.trim();
    try {
      await api.post("/auth/forgot-password", { email: this.savedEmail });
      this.step = "code";
      this.startResendCountdown();
    } catch (err) {
      if (err.message?.toLowerCase().includes("not found")) {
        const confirmed = await showConfirm(
          t("auth.emailNotFound"),
          t("auth.emailNotFoundRegister"),
          {
            confirmText: t("auth.register"),
            cancelText: t("common.cancel"),
            type: "primary",
          },
        );
        if (confirmed) navigate("register");
      } else {
        this.error = err.message;
      }
    } finally {
      this.loading = false;
    }
  },

  async step2() {
    this.loading = true;
    this.error = "";

    if (!this.code.trim()) {
      this.error = t("auth.fieldRequired");
      this.loading = false;
      return;
    }

    this.savedCode = this.code.trim();
    try {
      await api.post("/auth/verify-reset-code", {
        email: this.savedEmail,
        token: this.savedCode,
      });
      this.step = "password";
    } catch (err) {
      if (err.message?.includes("404")) {
        this.step = "password";
      } else {
        this.error = err.message;
      }
    } finally {
      this.loading = false;
    }
  },

  async step3() {
    this.loading = true;
    this.error = "";

    if (!this.newPassword || this.newPassword.length < 8) {
      this.error = t("auth.passwordMinLength");
      this.loading = false;
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = t("auth.passwordsDoNotMatch");
      this.loading = false;
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        email: this.savedEmail,
        token: this.savedCode,
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword,
      });
      this.step = "done";
      this.redirectTimer = setTimeout(() => navigate("login"), 2500);
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },

  backToEmail() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = null;
    this.resendSeconds = 0;
    this.step = "email";
  },

  backToCode() {
    this.step = "code";
  },
}));

export default function renderForgotPassword(container) {
  if (isAuthenticated()) {
    navigate("");
    return;
  }

  showLoading(container, "auth");

  const renderTimer = setTimeout(() => {
    if (!container.isConnected) return;

    const renderContent = () => {
      container.innerHTML = `
      <div x-data="forgotPwPage" class="auth-page">
        <div class="card">
          <div class="card-header">
          <h2>
            <span x-show="step === 'email'" x-cloak><i class="fas fa-unlock"></i> ${t("auth.forgotPassword")}</span>
            <span x-show="step === 'code'" x-cloak><i class="fas fa-shield-alt"></i> ${t("auth.verificationCode")}</span>
            <span x-show="step === 'password'" x-cloak><i class="fas fa-key"></i> ${t("auth.newPassword")}</span>
            <span x-show="step === 'done'" x-cloak><i class="fas fa-check-circle"></i> ${t("auth.passwordResetSuccess")}</span>
          </h2>
          </div>
          <div class="card-body">
          <div x-show="error" class="alert alert-error" x-text="error" x-cloak></div>

          <template x-if="step === 'email'">
            <form @submit.prevent="step1()" novalidate>
              <div class="form-group">
                <label class="form-label" for="forgotEmail">${t("auth.email")}</label>
                <input type="email" class="form-input form-control" id="forgotEmail" name="email" x-model="email" placeholder="your@email.com" required autocomplete="email" inputmode="email">
              </div>
              <button type="submit" class="btn btn-primary w-100 btn-lg" :disabled="loading || !isValidEmail">
                <i class="fas fa-spinner spinner" x-show="loading" x-cloak></i>
                <span x-text="loading ? $t('auth.sendingResetLink') : $t('auth.sendResetLink')"></span>
              </button>
            </form>
          </template>

          <template x-if="step === 'code'">
            <form @submit.prevent="step2()" novalidate>
              <div class="alert alert-success mb-3">
                <i class="fas fa-envelope"></i> ${t("auth.resetLinkSent")}
              </div>
              <div class="form-group">
                <label class="form-label" for="forgotCode">${t("auth.verificationCode")}</label>
                <input type="text" class="form-input form-control" id="forgotCode" name="code" x-model="code" placeholder="${t("auth.tokenPlaceholder") || "Enter the 6-digit code"}" required autocomplete="off" inputmode="numeric" maxlength="6" style="text-align:center;font-size:1.5rem;letter-spacing:8px">
              </div>
              <button type="submit" class="btn btn-primary w-100 btn-lg" :disabled="loading">
                <i class="fas fa-spinner spinner" x-show="loading" x-cloak></i>
                <span x-text="loading ? ($t('auth.verifying') || 'Verifying...') : $t('auth.verifyCode')"></span>
              </button>
              <div style="margin-top:12px">
                <button type="button" class="btn btn-ghost w-100" @click="handleResend()" :disabled="resendSeconds > 0" x-text="resendLabel"></button>
                <button type="button" class="btn btn-ghost w-100 mt-1" @click="backToEmail()"><i class="fas fa-arrow-left"></i> ${t("common.back")}</button>
              </div>
            </form>
          </template>

          <template x-if="step === 'password'">
            <form @submit.prevent="step3()" novalidate>
              <div class="form-group">
                <label class="form-label" for="forgotNewPw">${t("auth.newPassword")}</label>
                <div class="password-wrapper">
                  <input type="password" class="form-input form-control" id="forgotNewPw" name="newPassword" x-model="newPassword" placeholder="${t("auth.newPassword")}" required autocomplete="new-password" minlength="8">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="forgotConfirmPw">${t("auth.confirmNewPassword")}</label>
                <div class="password-wrapper">
                  <input type="password" class="form-input form-control" id="forgotConfirmPw" name="confirmPassword" x-model="confirmPassword" placeholder="${t("auth.confirmNewPassword")}" required autocomplete="new-password" minlength="8">
                </div>
              </div>
              <button type="submit" class="btn btn-primary w-100 btn-lg" :disabled="loading">
                <i class="fas fa-spinner spinner" x-show="loading" x-cloak></i>
                <span x-text="loading ? $t('auth.updatingPassword') : $t('auth.resetPassword')"></span>
              </button>
              <div style="margin-top:12px">
                <button type="button" class="btn btn-ghost w-100" @click="backToCode()"><i class="fas fa-arrow-left"></i> ${t("common.back")}</button>
              </div>
            </form>
          </template>

          <template x-if="step === 'done'">
            <div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t("auth.passwordResetSuccess")}</div>
          </template>

          </div>
          <div class="card-footer">
            <div class="auth-footer"><a href="#/login">${t("auth.login")}</a></div>
          </div>
        </div>
      </div>`;
      Alpine.initTree?.(container);
    };

    renderContent();
  }, 300);

  registerRouteCleanup(() => clearTimeout(renderTimer));
  registerRouteCleanup(() => {
    const alpineEl =
      container.querySelector('[x-data="forgotPwPage"]') ||
      container.querySelector("[x-data]");
    if (alpineEl) {
      const cmp = alpineEl._x_dataStack?.[0];
      if (cmp?.countdownInterval) clearInterval(cmp.countdownInterval);
      if (cmp?.redirectTimer) clearTimeout(cmp.redirectTimer);
    }
  });
}
