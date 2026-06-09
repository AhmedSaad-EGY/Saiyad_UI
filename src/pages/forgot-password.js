import { t } from '../shared/utils/i18n.js';
import { setPageMeta } from '../shared/utils/seo.js';
import '../features/auth/reset-password.js';

export default function renderForgotPassword(container) {
  setPageMeta(t('auth.forgotPassword'));

  container.innerHTML = `
    <div class="auth-page animate__animated animate__fadeIn" x-data="forgotPwPage">
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
                <h1 x-text="isResetStep ? '${t('auth.newPassword')}' : isCodeStep ? '${t('auth.enterCode')}' : '${t('auth.forgotPassword')}'"></h1>
                <p x-text="isResetStep ? '${t('auth.enterNewPassword')}' : isCodeStep ? '${t('auth.codeSent')}' : '${t('auth.enterEmail')}'"></p>
              </div>

              <template x-if="error">
                <div class="alert alert-error" role="alert"><i class="fas fa-exclamation-circle"></i> <span x-text="error"></span></div>
              </template>

              <form @submit.prevent="isResetStep ? resetPassword() : isCodeStep ? verifyCode() : requestCode()">

                <template x-if="!isCodeStep && !isResetStep">
                  <div class="form-group">
                    <label for="fpEmail">${t('auth.email')}</label>
                    <input type="email" id="fpEmail" class="form-input" x-model="email" placeholder="${t('auth.emailPlaceholder')}" required autocomplete="email" :disabled="loading">
                  </div>
                </template>

                <template x-if="isCodeStep">
                  <div class="form-group">
                    <label for="fpCode">${t('auth.verificationCode')}</label>
                    <input type="text" id="fpCode" class="form-input" x-model="code" placeholder="${t('auth.codePlaceholder')}" required inputmode="numeric" :disabled="loading" maxlength="6">
                  </div>
                </template>

                <template x-if="isResetStep">
                  <div>
                    <div class="form-group">
                      <label for="fpNewPw">${t('auth.newPassword')}</label>
                      <div class="password-wrapper">
                        <input :type="showPassword ? 'text' : 'password'" id="fpNewPw" class="form-input" x-model="newPassword" placeholder="${t('auth.passwordPlaceholder')}" required minlength="8" :disabled="loading">
                        <button type="button" class="toggle-pw" @click="togglePw" tabindex="-1"><i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="fpConfirm">${t('auth.confirmPassword')}</label>
                      <input type="password" id="fpConfirm" class="form-input" x-model="confirmPassword" placeholder="${t('auth.confirmPasswordPlaceholder')}" required :disabled="loading">
                    </div>
                  </div>
                </template>

                <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
                  <i class="fas fa-spinner spinner" x-show="loading" x-cloak aria-hidden="true"></i>
                  <span x-text="loading ? '${t('common.loading')}' : isResetStep ? '${t('auth.resetPassword')}' : isCodeStep ? '${t('auth.verifyCode')}' : '${t('auth.sendCode')}'"></span>
                </button>
              </form>

              <template x-if="sendAgainCooldown">
                <p class="text-center mt-3 text-secondary-sm">${t('auth.resendIn')} <span x-text="resendTimer"></span>s</p>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>`;
}
