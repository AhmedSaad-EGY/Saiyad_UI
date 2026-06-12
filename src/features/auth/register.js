import { api } from '../../shared/api/client.js';
import { getPasswordStrengthResult, calculateAge, validateForm, clearAllFieldErrors } from '../../shared/utils/validation.js';
import { showToast } from '../../shared/utils/ui.js';
import { t } from '../../shared/utils/i18n.js';
import { ROLES, SELLER_ROLES } from '../../shared/constants/roles.js';
import { KEYS } from '../../shared/constants/storage-keys.js';
import Alpine from 'alpinejs';

Alpine.data('registerForm', () => ({
  fullName: '', email: '', phone: '', birthdate: '', password: '',
  confirmPassword: '', role: ROLES.CUSTOMER, terms: false, showPassword: false,
  loading: false, ageDisplay: '', ageColor: 'var(--text-secondary)',
  strengthCls: '', strengthLabel: '', licenseNumber: '',
  pendingUpgrade: false, pendingRole: '',
  get needsLicense() { return SELLER_ROLES.includes(this.role); },
  get isAuctioneer() { return this.role === ROLES.AUCTIONEER; },
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
    if (this.loading) return;
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
    const formEl = this.$el.querySelector('form') || this.$el;
    clearAllFieldErrors(formEl);
    const isValid = validateForm(formEl, rules);
    if (!isValid) { this.loading = false; return; }
    try {
      const data = await api.post('/auth/register', {
        fullName: this.fullName, email: this.email, phone: this.phone,
        birthdate: this.birthdate, password: this.password,
        confirmPassword: this.confirmPassword, role: this.role,
        licenseNumber: this.needsLicense ? this.licenseNumber : undefined,
      });
      if (data.pendingRoleUpgrade) {
        this.pendingUpgrade = true;
        this.pendingRole = data.pendingRoleUpgrade;
        return;
      }
      // F-007: Always redirect to login after registration — do NOT store access token
      // (prevents auto-login for unverified accounts per HIGH-04)
      if (data.user) { const { role, ...safeUser } = data.user; localStorage.setItem(KEYS.USER, JSON.stringify(safeUser)); }
      window.location.hash = '#/login?registered=1';
    } catch (err) { showToast(err.message || t('auth.registerError'), 'error'); }
    finally { this.loading = false; }
  },
}));


