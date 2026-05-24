import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { isAuthenticated, updateNavbar } from '../core/auth/index.js';
import { navigate } from '../core/router/index.js';
import { showToast } from '../core/utils/ui.js';
import Alpine from 'alpinejs';

Alpine.data('loginForm', () => ({
  email: '',
  password: '',
  loading: false,
  error: '',
  showPassword: false,
  unverifiedEmail: '',

  t,

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

    if (!this.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.error = t('auth.invalidEmail');
      this.loading = false;
      return;
    }
    if (!this.password || this.password.length < 6) {
      this.error = t('auth.passwordMinLength');
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
      updateNavbar();
      navigate('');
    } catch (err) {
      if (err.message?.toLowerCase().includes('verify your email')) {
        this.unverifiedEmail = this.email.trim();
      } else {
        this.error = err.message;
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
        <h2><i class="fas fa-sign-in-alt"></i> ${t('auth.login')}</h2>
        <div x-show="error" x-text="error" class="alert alert-error" role="alert" x-cloak></div>
        <div x-show="unverifiedEmail" x-cloak>
          <div class="alert alert-warning" role="alert" style="text-align:center">
            <i class="fas fa-envelope" style="font-size:2rem;display:block;margin-bottom:8px"></i>
            <strong>${t('auth.emailNotVerified') || 'Email not verified.'}</strong>
            <p style="margin:8px 0;font-size:var(--text-sm)">${t('auth.checkInbox') || 'Please check your inbox and click the verification link.'}</p>
            <button class="btn btn-primary btn-sm" x-ref="resendBtn" @click="resendVerification()" style="margin-top:4px">
              <i class="fas fa-paper-plane"></i> ${t('auth.resendVerification') || 'Resend Verification'}
            </button>
            <p style="margin:8px 0 0;font-size:var(--text-xs);opacity:0.7"><i class="fas fa-clock"></i> ${t('auth.checkSpam') || "Didn't get it? Check your spam folder."}</p>
          </div>
        </div>
        <form @submit.prevent="submit()" novalidate>
          <div class="form-group">
            <label class="form-label" for="loginEmail">${t('auth.email')}</label>
            <input type="email" class="form-input" id="loginEmail" name="email" x-model="email" @input="clearError()" placeholder="your@email.com" required autocomplete="email" inputmode="email">
          </div>
          <div class="form-group">
            <label class="form-label" for="loginPassword">${t('auth.password')}</label>
            <div class="password-wrapper">
              <input :type="showPassword ? 'text' : 'password'" class="form-input" id="loginPassword" name="password" x-model="password" @input="clearError()" placeholder="${t('auth.password')}" required autocomplete="current-password" minlength="6">
              <button type="button" class="toggle-password" @click="togglePw()" :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"><i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
            </div>
            <div style="text-align: right; margin-top: 4px;">
              <a href="#/forgot-password" style="font-size: var(--text-xs); color: var(--primary); text-decoration: none;">${t('auth.forgotPassword')}</a>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
            <i class="fas fa-spinner spinner" x-show="loading" x-cloak></i>
            <span x-text="loading ? t('auth.signingIn') : t('auth.signIn')"></span>
          </button>
        </form>
        <div class="auth-footer">${t('auth.noAccount')} <a href="#/register">${t('auth.register')}</a></div>
      </div>
    </div>`;
}
