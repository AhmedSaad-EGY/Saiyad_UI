import { showToast } from '../shared/utils/ui.js';
import { t } from '../shared/utils/i18n.js';
import { setPageMeta } from '../shared/utils/seo.js';
import '../features/auth/login.js';

export default function renderLogin(container) {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  if (params.get('redirect')) {
    setPageMeta(t('auth.loginRequired'));
  } else {
    setPageMeta(t('auth.login'));
  }

  if (params.get('registered') === '1') {
    showToast(t('auth.registerSuccess'), 'success');
  }

  container.innerHTML = `
    <div class="auth-page animate__animated animate__fadeIn" x-data="loginForm">
      <div class="card">
        <div class="card-body">
          <div class="auth-header">
            <i class="fas fa-fish auth-icon"></i>
            <h1>${t('auth.welcomeBack')}</h1>
            <p>${t('auth.loginDesc')}</p>
          </div>

          <form @submit.prevent="submit">
            <template x-if="error">
              <div class="alert alert-error" @click="clearError" role="alert"><i class="fas fa-exclamation-circle"></i> <span x-text="error"></span></div>
            </template>

            <div class="form-group">
              <label for="loginEmail">${t('auth.email')}</label>
              <input type="email" id="loginEmail" class="form-input" x-model="email" placeholder="${t('auth.emailPlaceholder')}" required autocomplete="email" :disabled="loading" @input="clearError">
            </div>

            <div class="form-group">
              <label for="loginPassword">${t('auth.password')}</label>
              <div class="password-wrapper">
                <input :type="showPassword ? 'text' : 'password'" id="loginPassword" class="form-input" x-model="password" placeholder="${t('auth.passwordPlaceholder')}" required autocomplete="current-password" :disabled="loading">
                <button type="button" class="toggle-pw" @click="togglePw" :aria-label="pwToggleLabel()" tabindex="-1"><i :class="pwToggleIcon()"></i></button>
              </div>
            </div>

            <div class="d-flex justify-content-end">
              <a href="#/forgot-password" class="forgot-link">${t('auth.forgotPassword')}</a>
            </div>

            <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
              <i class="fas fa-spinner spinner" x-show="loading" x-cloak aria-hidden="true"></i>
              <span x-text="submitLabel()"></span>
            </button>
          </form>

          <template x-if="unverifiedEmail">
            <div class="alert alert-warning mt-3" role="alert">
              <i class="fas fa-envelope"></i> ${t('auth.verifyPrompt')}
              <button class="btn btn-sm btn-ghost" @click="resendVerification">${t('auth.resendVerification')}</button>
            </div>
          </template>

          <div class="auth-footer">
            <span>${t('auth.noAccount')}</span>
            <a href="#/register">${t('auth.register')}</a>
          </div>
        </div>
      </div>
    </div>`;
}
