import { t } from '../shared/utils/i18n.js';
import { setPageMeta } from '../shared/utils/seo.js';
import '../features/auth/reset-password.js';

export default function renderResetPassword(container) {
  setPageMeta(t('auth.resetPassword'));

  container.innerHTML = `
    <div class="auth-page animate__animated animate__fadeIn" x-data="resetPwForm">
      <div class="card">
        <div class="card-body">
          <template x-if="success">
            <div class="empty-state">
              <i class="fas fa-check-circle" style="color:var(--success);font-size:3rem"></i>
              <h3>${t('auth.passwordResetSuccess')}</h3>
              <p>${t('auth.redirectingToLogin')}</p>
            </div>
          </template>

          <template x-if="!success">
            <div>
              <div class="auth-header">
                <i class="fas fa-key auth-icon"></i>
                <h1>${t('auth.resetPassword')}</h1>
                <p>${t('auth.enterNewPassword')}</p>
              </div>

              <template x-if="error">
                <div class="alert alert-error" role="alert"><i class="fas fa-exclamation-circle"></i> <span x-text="error"></span></div>
              </template>

              <form @submit.prevent="submit">
                <div class="form-group">
                  <label for="rpPassword">${t('auth.newPassword')}</label>
                  <div class="password-wrapper">
                    <input :type="showPassword ? 'text' : 'password'" id="rpPassword" class="form-input" x-model="password" @input="computeStrength" placeholder="${t('auth.passwordPlaceholder')}" required autocomplete="new-password" minlength="8" :disabled="loading">
                    <button type="button" class="toggle-pw" @click="togglePw" tabindex="-1"><i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
                  </div>
                  <div class="pw-strength" x-show="password.length >= 3" x-cloak>
                    <div class="pw-strength-bar" :class="strengthCls"></div>
                    <span class="pw-strength-label" :class="strengthCls" x-text="strengthLabel"></span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="rpConfirm">${t('auth.confirmPassword')}</label>
                  <div class="password-wrapper">
                    <input :type="showConfirmPw ? 'text' : 'password'" id="rpConfirm" class="form-input" x-model="confirmPassword" placeholder="${t('auth.confirmPasswordPlaceholder')}" required autocomplete="new-password" :disabled="loading">
                    <button type="button" class="toggle-pw" @click="toggleConfirmPw" tabindex="-1"><i :class="showConfirmPw ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
                  <i class="fas fa-spinner spinner" x-show="loading" x-cloak aria-hidden="true"></i>
                  <span x-text="loading ? '${t('common.loading')}' : '${t('auth.resetPassword')}'"></span>
                </button>
              </form>
            </div>
          </template>
        </div>
      </div>
    </div>`;
}
