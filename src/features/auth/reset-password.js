import { api } from '../../shared/api/client.js';
import { getPasswordStrengthResult } from '../../shared/utils/validation.js';
import { showConfirm } from '../../widgets/ui/modal.js';
import { showToast } from '../../widgets/ui/toast.js';
import { showLoading } from '../../widgets/ui/loader.js';
import { t } from '../../app/i18n.js';
import { registerRouteCleanup } from '../../app/events.js';
import Alpine from 'alpinejs';

Alpine.data('forgotPwPage', () => ({
  step: 1, email: '', code: '', newPassword: '', confirmPassword: '',
  loading: false, error: '', showPassword: false, success: false,
  resendTimer: 0, resendInterval: null, sendAgainCooldown: false,
  get isCodeStep() { return this.step === 2; },
  get isResetStep() { return this.step === 3; },
  init() {
    registerRouteCleanup(() => { if (this.resendInterval) clearInterval(this.resendInterval); });
  },
  async requestCode() {
    this.loading = true; this.error = '';
    try {
      await api.post('/auth/forgot-password', { email: this.email });
      this.step = 2; this.startResendTimer();
    } catch (err) { this.error = err.message || t('auth.error'); }
    finally { this.loading = false; }
  },
  startResendTimer() {
    this.sendAgainCooldown = true; this.resendTimer = 60;
    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) { clearInterval(this.resendInterval); this.sendAgainCooldown = false; }
    }, 1000);
  },
  async verifyCode() {
    this.loading = true; this.error = '';
    try {
      await api.post('/auth/verify-reset-code', { email: this.email, code: this.code });
      this.step = 3;
    } catch (err) { this.error = err.message || t('auth.invalidCode'); }
    finally { this.loading = false; }
  },
  async resetPassword() {
    if (this.newPassword !== this.confirmPassword) { this.error = t('validation.passwordsNotMatch'); return; }
    this.loading = true; this.error = '';
    try {
      await api.post('/auth/reset-password', { email: this.email, code: this.code, newPassword: this.newPassword, confirmPassword: this.confirmPassword });
      this.success = true;
      showToast(t('auth.passwordResetSuccess'), 'success');
      setTimeout(() => { window.location.hash = '#/login'; }, 2000);
    } catch (err) { this.error = err.message || t('auth.error'); }
    finally { this.loading = false; }
  },
  togglePw() { this.showPassword = !this.showPassword; },
}));

Alpine.data('resetPwForm', () => ({
  email: '', password: '', confirmPassword: '', showPassword: false,
  showConfirmPw: false, loading: false, error: '', success: false,
  strengthCls: '', strengthLabel: '',
  computeStrength() {
    const r = getPasswordStrengthResult(this.password);
    this.strengthCls = r.cls; this.strengthLabel = r.label;
  },
  togglePw() { this.showPassword = !this.showPassword; },
  toggleConfirmPw() { this.showConfirmPw = !this.showConfirmPw; },
  async submit() {
    if (this.password !== this.confirmPassword) { this.error = t('validation.passwordsNotMatch'); return; }
    this.loading = true; this.error = '';
    try {
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      await api.post('/auth/reset-password', { email: this.email || params.get('email') || '', code: params.get('code') || '', newPassword: this.password, confirmPassword: this.confirmPassword });
      this.success = true;
      showToast(t('auth.passwordResetSuccess'), 'success');
      setTimeout(() => window.location.hash = '#/login', 2000);
    } catch (err) { this.error = err.message || t('auth.error'); }
    finally { this.loading = false; }
  },
}));
