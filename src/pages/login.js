import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { isAuthenticated, updateNavbar } from '../core/auth/index.js';
import { navigate } from '../core/router/index.js';
import { showToast } from '../core/utils/ui.js';
import { showFieldError, clearFieldError } from '../core/utils/validation.js';
import { ensureCsrfToken } from '../core/utils/csrf.js';
import Alpine from 'alpinejs';

Alpine.data('loginForm', () => ({
  email: '',
  password: '',
  loading: false,
  error: '',
  showPassword: false,
  unverifiedEmail: '',

  clearFieldError,

  togglePw() {
    this.showPassword = !this.showPassword;
  },

  clearError() {
    this.error = '';
  },

  async submit() {
    this.loading = true;
    this.error = '';
    this.unverifiedEmail = '';

    const emailEl = document.getElementById('loginEmail');
    const pwEl = document.getElementById('loginPassword');

    clearFieldError(emailEl);
    clearFieldError(pwEl);

    let valid = true;
    if (!this.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      showFieldError(emailEl, t('auth.invalidEmail'));
      valid = false;
    }
    if (!this.password || this.password.length < 6) {
      showFieldError(pwEl, t('auth.passwordMinLength'));
      valid = false;
    }
    if (!valid) {
      this.loading = false;
      return;
    }

    try {
      const data = await api.post('/auth/login', {
        email: this.email.trim(),
        password: this.password,
      });
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      ensureCsrfToken();
      sessionStorage.removeItem('sayiadLoginFails');
      updateNavbar();
      navigate('');
    } catch (err) {
      if (err.message?.toLowerCase().includes('verify your email')) {
        this.unverifiedEmail = this.email.trim();
      } else {
        this.error = err.message;
        // Track failed attempts
        let failCount = parseInt(sessionStorage.getItem('sayiadLoginFails') || '0') + 1;
        sessionStorage.setItem('sayiadLoginFails', failCount);

        if (failCount >= 5) {
          const submitBtn = document.querySelector('#loginForm button[type="submit"], #loginSubmitBtn');
          const lockMsg   = document.getElementById('loginLockMsg');
          if (submitBtn) submitBtn.disabled = true;
          let secs = 30;
          const lockText = () => t('auth.tooManyAttempts', { secs }) || `Too many failed attempts. Wait ${secs} seconds.`;
          if (lockMsg) {
            lockMsg.classList.remove('hidden');
            lockMsg.textContent = lockText();
          }
          const timer = setInterval(() => {
            secs--;
            if (lockMsg) lockMsg.textContent = lockText();
            if (secs <= 0) {
              clearInterval(timer);
              sessionStorage.removeItem('sayiadLoginFails');
              if (submitBtn) submitBtn.disabled = false;
              if (lockMsg) lockMsg.classList.add('hidden');
            }
          }, 1000);
        }
      }
    } finally {
      this.loading = false;
    }
  },

  async resendVerification() {
    try {
      const btn = this.$refs.resendBtn;
      if (btn) btn.disabled = true;
      await api.post('/auth/resend-verification', { email: this.unverifiedEmail });
      showToast(t('auth.verificationSent') || 'Verification email sent!', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  },
}));

export default function renderLogin(container) {
  if (isAuthenticated()) {
    navigate('');
    return;
  }

  container.innerHTML = `
    <div x-data="loginForm" class="auth-page">
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-sign-in-alt" aria-hidden="true"></i> ${t('auth.login')}</h2>
        </div>
        <div class="card-body">
          <div x-show="error" x-text="error" class="alert alert-error mb-3" role="alert" aria-live="assertive" x-cloak></div>
          <div x-show="unverifiedEmail" x-cloak>
            <div class="alert alert-warning text-center mb-3" role="alert">
              <i class="fas fa-envelope mb-2 fs-1 d-block" aria-hidden="true"></i>
              <strong>${t('auth.emailNotVerified') || 'Email not verified.'}</strong>
              <p class="my-2" style="font-size:var(--text-sm)">${t('auth.checkInbox') || 'Please check your inbox and click the verification link.'}</p>
              <button class="btn btn-primary btn-sm mt-1" x-ref="resendBtn" @click="resendVerification()">
                <i class="fas fa-paper-plane" aria-hidden="true"></i>
                ${t('auth.resendVerification') || 'Resend Verification'}
              </button>
              <p class="mt-2" style="font-size:var(--text-xs);opacity:0.7">
                <i class="fas fa-clock" aria-hidden="true"></i>
                ${t('auth.checkSpam') || "Didn't get it? Check your spam folder."}
              </p>
            </div>
          </div>
          <form id="loginForm" @submit.prevent="submit()" novalidate>
            <div class="form-group">
              <label class="form-label" for="loginEmail">${t('auth.email')}</label>
              <input type="email" class="form-input form-control" id="loginEmail" name="email"
                x-model="email" @input="clearError(); clearFieldError($el)"
                placeholder="your@email.com" required autocomplete="email" inputmode="email">
            </div>
            <div class="form-group">
              <label class="form-label" for="loginPassword">${t('auth.password')}</label>
              <div class="password-wrapper">
                <input :type="showPassword ? 'text' : 'password'" class="form-input form-control"
                  id="loginPassword" name="password" x-model="password"
                  @input="clearError(); clearFieldError($el)"
                  placeholder="${t('auth.password')}" required autocomplete="current-password" minlength="6">
                <button type="button" class="toggle-password" @click="togglePw()"
                  :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')">
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" aria-hidden="true"></i>
                </button>
              </div>
              <div class="text-end mt-1">
                <a href="#/forgot-password" class="text-primary text-decoration-none" style="font-size:var(--text-xs)">
                  ${t('auth.forgotPassword')}
                </a>
              </div>
            </div>
            <div id="loginLockMsg" class="field-error hidden" role="alert" aria-live="assertive"></div>
            <button type="submit" id="loginSubmitBtn" class="btn btn-primary w-100 btn-lg mt-1" :disabled="loading">
              <i class="fas fa-spinner spinner" x-show="loading" x-cloak aria-hidden="true"></i>
              <span x-text="loading ? $t('auth.signingIn') : $t('auth.signIn')"></span>
            </button>
          </form>
        </div>
        <div class="card-footer">
          <div class="auth-footer">
            ${t('auth.noAccount')} <a href="#/register">${t('auth.register')}</a>
          </div>
        </div>
      </div>
    </div>`;
}
