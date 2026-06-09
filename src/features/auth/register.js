import { api, setAccessToken } from '../../shared/api/client.js';
import { ensureCsrfToken } from '../../shared/utils/csrf.js';
import { getPasswordStrengthResult, calculateAge, validateForm, clearAllFieldErrors } from '../../shared/utils/validation.js';
import { showToast } from '../../shared/utils/ui.js';
import { t } from '../../app/i18n.js';
import { emit } from '../../app/events.js';
import { syncVipAttribute } from './login.js';
import { registerRouteCleanup } from '../../app/events.js';
import Alpine from 'alpinejs';

Alpine.data('registerForm', () => ({
  fullName: '', email: '', phone: '', birthdate: '', password: '',
  confirmPassword: '', role: 'Customer', terms: false, showPassword: false,
  loading: false, ageDisplay: '', ageColor: 'var(--text-secondary)',
  strengthCls: '', strengthLabel: '', licenseNumber: '',
  get needsLicense() { return ['Fisherman', 'BaitSeller'].includes(this.role); },
  computeAge() {
    if (!this.birthdate) { this.ageDisplay = ''; return; }
    const age = calculateAge(this.birthdate);
    this.ageDisplay = `${age} ${t('common.yearsOld')}`;
    this.ageColor = age < 18 ? 'var(--danger)' : 'var(--success)';
  },
  computeStrength() {
    const r = getPasswordStrengthResult(this.password);
    this.strengthCls = r.cls; this.strengthLabel = r.label;
  },
  togglePw() { this.showPassword = !this.showPassword; },
  async submit() {
    this.loading = true;
    const rules = [
      { element: this.$refs.fullName, required: true, messages: { required: t('validation.required') } },
      { element: this.$refs.email, required: true, email: true, messages: { required: t('validation.required'), email: t('validation.invalidEmail') } },
      { element: this.$refs.phone, required: true, phone: true, messages: { required: t('validation.required'), phone: t('validation.invalidPhone') } },
      { element: this.$refs.birthdate, required: true, minAge: 18, messages: { required: t('validation.required'), minAge: t('validation.minAge', { age: 18 }) } },
      { element: this.$refs.password, required: true, minLength: 8, messages: { required: t('validation.required'), minLength: t('validation.minLength', { n: 8 }) } },
      { element: this.$refs.confirmPassword, required: true, matches: 'password', messages: { required: t('validation.required'), matches: t('validation.passwordsNotMatch') } },
    ];
    clearAllFieldErrors(this.$el);
    const errors = validateForm(this.$el.id, rules);
    if (errors) { this.loading = false; return; }
    await ensureCsrfToken();
    try {
      const data = await api.post('/auth/register', {
        fullName: this.fullName, email: this.email, phone: this.phone,
        birthdate: this.birthdate, password: this.password,
        confirmPassword: this.confirmPassword, role: this.role,
        licenseNumber: this.needsLicense ? this.licenseNumber : undefined,
      });
      setAccessToken(data.accessToken);
      if (data.refreshToken) localStorage.setItem('sayiad_refreshToken', data.refreshToken);
      if (data.user) localStorage.setItem('sayiad_user', JSON.stringify(data.user));
      if (data.accessToken) showVerificationOverlay(this.email, this.password);
      else { emit('auth:changed'); window.location.hash = '#/'; }
    } catch (err) { showToast(err.message || t('auth.registerError'), 'error'); }
    finally { this.loading = false; }
  },
}));

function showVerificationOverlay(email, password) {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="verify-overlay"><div class="verify-card"><div class="verify-spinner"></div><h3>${t('auth.checkEmail')}</h3><p>${t('auth.verificationSent')}</p></div></div>`;
  let attempts = 0;
  const maxAttempts = 30;
  const timer = setInterval(async () => {
    attempts++;
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data.accessToken) {
        clearInterval(timer);
        setAccessToken(data.accessToken);
        if (data.user) localStorage.setItem('sayiad_user', JSON.stringify(data.user));
        emit('auth:changed');
        syncVipAttribute().catch(() => {});
        window.location.hash = '#/';
      }
    } catch { if (attempts >= maxAttempts) { clearInterval(timer); window.location.hash = '#/login'; } }
  }, 2000);
  registerRouteCleanup(() => clearInterval(timer));
}
