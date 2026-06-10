import { t } from '../shared/utils/i18n.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { escapeHtml } from '../shared/utils/dom.js';
import '../features/auth/register.js';

export default function renderRegister(container) {
  setPageMeta(t('auth.register'));

  const roleOptions = [
    { value: 'Customer', label: t('register.customer'), desc: t('register.customerDesc') },
    { value: 'Fisherman', label: t('register.fisherman'), desc: t('register.fishermanDesc') },
    { value: 'BaitSeller', label: t('register.baitSeller'), desc: t('register.baitSellerDesc') },
    { value: 'Auctioneer', label: t('register.auctioneer'), desc: t('register.auctioneerDesc') },
  ];

  container.innerHTML = `
    <div class="auth-page animate__animated animate__fadeIn">
      <div class="card">
        <div class="card-body">
          <div class="auth-header">
            <i class="fas fa-user-plus auth-icon"></i>
            <h1>${t('auth.createAccount')}</h1>
            <p>${t('auth.registerDesc')}</p>
          </div>

          <form id="registerForm" x-data="registerForm" @submit.prevent="submit">
            <div class="form-group">
              <label for="regName">${t('auth.fullName')}</label>
              <input type="text" id="regName" class="form-input" x-ref="fullName" x-model="fullName" placeholder="${t('auth.fullNamePlaceholder')}" required autocomplete="name" :disabled="loading">
            </div>

            <div class="form-group">
              <label for="regEmail">${t('auth.email')}</label>
              <input type="email" id="regEmail" class="form-input" x-ref="email" x-model="email" placeholder="${t('auth.emailPlaceholder')}" required autocomplete="email" :disabled="loading">
            </div>

            <div class="form-group">
              <label for="regPhone">${t('auth.phone')}</label>
              <input type="tel" id="regPhone" class="form-input" x-ref="phone" x-model="phone" placeholder="${t('auth.phonePlaceholder')}" required autocomplete="tel" :disabled="loading">
            </div>

            <div class="form-group">
              <label for="regBirthdate">${t('auth.birthdate')}</label>
              <input type="date" id="regBirthdate" class="form-input" x-ref="birthdate" x-model="birthdate" @change="computeAge" required :disabled="loading">
              <span class="form-hint" x-show="ageDisplay" x-cloak><span :style="{ color: ageColor }" x-text="ageDisplay"></span></span>
            </div>

            <div class="form-group">
              <label for="regRole">${t('auth.role')}</label>
              <select id="regRole" class="form-select" x-model="role" :disabled="loading">
                ${roleOptions.map(r => `<option value="${escapeHtml(r.value)}">${r.label} — ${r.desc}</option>`).join('')}
              </select>
            </div>

            <template x-if="needsLicense">
              <div class="form-group">
                <label for="regLicense">${t('auth.licenseNumber')}</label>
                <input type="text" id="regLicense" class="form-input" x-model="licenseNumber" placeholder="${t('auth.licensePlaceholder')}" :disabled="loading">
              </div>
            </template>

            <div class="form-group">
              <label for="regPassword">${t('auth.password')}</label>
              <div class="password-wrapper">
                <input :type="showPassword ? 'text' : 'password'" id="regPassword" class="form-input" x-ref="password" x-model="password" @input="computeStrength" placeholder="${t('auth.passwordPlaceholder')}" required autocomplete="new-password" minlength="8" :disabled="loading">
                <button type="button" class="toggle-pw" @click="togglePw" tabindex="-1"><i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
              </div>
              <div class="pw-strength" x-show="password.length >= 3" x-cloak>
                <div class="pw-strength-bar" :class="strengthCls"></div>
                <span class="pw-strength-label" :class="strengthCls" x-text="strengthLabel"></span>
              </div>
            </div>

            <div class="form-group">
              <label for="regConfirm">${t('auth.confirmPassword')}</label>
              <input type="password" id="regConfirm" class="form-input" x-ref="confirmPassword" x-model="confirmPassword" placeholder="${t('auth.confirmPasswordPlaceholder')}" required autocomplete="new-password" :disabled="loading">
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" class="form-checkbox" x-model="terms" :disabled="loading">
                <span>${t('auth.acceptTerms')} <a href="#/terms" target="_blank">${t('footer.terms')}</a></span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-block" :disabled="loading || !terms">
              <i class="fas fa-spinner spinner" x-show="loading" x-cloak aria-hidden="true"></i>
              <span x-text="loading ? '${t('common.loading')}' : '${t('auth.createAccount')}'"></span>
            </button>
          </form>

          <div class="auth-footer">
            <span>${t('auth.haveAccount')}</span>
            <a href="#/login">${t('auth.login')}</a>
          </div>
        </div>
      </div>
    </div>`;
}
