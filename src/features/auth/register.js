import { api, setAccessToken } from '../../shared/api/client.js';
import { ensureCsrfToken } from '../../shared/utils/csrf.js';
import { getPasswordStrengthResult, calculateAge, validateForm, clearAllFieldErrors } from '../../shared/utils/validation.js';
import { showToast } from '../../shared/utils/ui.js';
import { t } from '../../shared/utils/i18n.js';
import { emit } from '../../shared/utils/events.js';
import { KEYS } from '../../shared/constants/storage-keys.js';
import Alpine from '@alpinejs/csp';

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
  submitLabel() { return this.loading ? t('common.loading') : t('auth.createAccount'); },
  pwToggleIcon() { return this.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'; },
  togglePw() { this.showPassword = !this.showPassword; },
  async submit() {
    if (!this.terms) {
      showToast(t('auth.mustAcceptTerms'), 'error');
      return;
    }

    this.loading = true;
    const rules = [
      { element: this.$refs.fullName, required: true, messages: { required: t('validation.required') } },
      { element: this.$refs.email, required: true, email: true, messages: { required: t('validation.required'), email: t('validation.invalidEmail') } },
      { element: this.$refs.phone, required: true, phone: true, messages: { required: t('validation.required'), phone: t('validation.invalidPhone') } },
      { element: this.$refs.birthdate, required: true, minAge: 18, messages: { required: t('validation.required'), minAge: t('validation.minAge', { age: 18 }) } },
      { element: this.$refs.password, required: true, minLength: 8, messages: { required: t('validation.required'), minLength: t('validation.minLength', { n: 8 }) } },
      { element: this.$refs.confirmPassword, required: true, matches: { element: this.$refs.password }, messages: { required: t('validation.required'), matches: t('validation.passwordsNotMatch') } },
    ];
    clearAllFieldErrors(this.$el);
    const isValid = validateForm(this.$el.id, rules);
    if (!isValid) { this.loading = false; return; }
    await ensureCsrfToken();
    try {
      const data = await api.post('/auth/register', {
        fullName: this.fullName, email: this.email, phone: this.phone,
        birthdate: this.birthdate, password: this.password,
        confirmPassword: this.confirmPassword, role: this.role,
        licenseNumber: this.needsLicense ? this.licenseNumber : undefined,
      });
      if (data.accessToken) {
        window.location.hash = '#/login?registered=1';
      } else {
        setAccessToken(data.accessToken);
        if (data.refreshToken) localStorage.setItem(KEYS.REFRESH_TOKEN, data.refreshToken);
        if (data.user) localStorage.setItem(KEYS.USER, JSON.stringify(data.user));
        emit('auth:changed');
        window.location.hash = '#/';
      }
    } catch (err) { showToast(err.message || t('auth.registerError'), 'error'); }
    finally { this.loading = false; }
  },
}));


