import { api } from '../shared/api/client.js';
import { escapeHtml } from '../shared/utils/dom.js';
import { registerRouteCleanup } from '../shared/utils/events.js';
import { t } from '../shared/utils/i18n.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { showToast } from '../shared/utils/ui.js';

const RESEND_COOLDOWN_SECONDS = 60;

export default function renderVerifyWaiting(container) {
  setPageMeta(t('verify.waitingTitle'));

  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const email =
    params.get('email') ||
    sessionStorage.getItem('pendingLoginEmail') ||
    '';

  if (!email) {
    container.innerHTML = `
      <div class="auth-page animate__animated animate__fadeIn">
        <div class="card">
          <div class="card-body">
            <div class="empty-state">
              <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
              <h3>${t('verify.invalidLink')}</h3>
              <a href="#/register" class="btn btn-primary mt-3">${t('auth.register')}</a>
            </div>
          </div>
        </div>
      </div>`;
    return;
  }

  sessionStorage.setItem('pendingLoginEmail', email);

  container.innerHTML = `
    <div class="auth-page animate__animated animate__fadeIn">
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <i class="fas fa-envelope-open-text" style="color:var(--primary);font-size:3rem" aria-hidden="true"></i>

            <h3>${t('verify.waitingTitle')}</h3>

            <p>
              ${t('verify.waitingDesc')}
              <strong>${escapeHtml(email)}</strong>.
            </p>

            <p class="text-secondary-sm mt-2">
              ${t('auth.registerSuccess')}
            </p>

            <button
              type="button"
              id="resendVerificationBtn"
              class="btn btn-primary btn-block mt-3"
            >
              ${t('verify.resend')}
            </button>

            <p
              id="resendCooldownText"
              class="text-center mt-3 text-secondary-sm"
              aria-live="polite"
            ></p>

            <div class="d-flex gap-2 justify-content-center flex-wrap mt-4">
              <a href="#/login" class="btn btn-outline">
                ${t('verify.alreadyVerified')}
              </a>
              <a href="#/register" class="btn btn-ghost">
                ${t('verify.useOtherEmail')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const resendBtn = container.querySelector('#resendVerificationBtn');
  const cooldownText = container.querySelector('#resendCooldownText');

  let remainingSeconds = RESEND_COOLDOWN_SECONDS;
  let cooldownInterval = null;
  let isSending = false;

  const updateResendState = () => {
    if (!resendBtn || !cooldownText) return;

    resendBtn.disabled = isSending || remainingSeconds > 0;
    resendBtn.textContent = isSending
      ? t('verify.resending')
      : t('verify.resend');

    cooldownText.textContent = remainingSeconds > 0
      ? `${t('auth.resendIn')} ${remainingSeconds}s`
      : '';
  };

  const clearCooldown = () => {
    if (cooldownInterval) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
    }
  };

  const startCooldown = () => {
    clearCooldown();
    remainingSeconds = RESEND_COOLDOWN_SECONDS;
    updateResendState();

    cooldownInterval = setInterval(() => {
      remainingSeconds -= 1;
      if (remainingSeconds <= 0) {
        remainingSeconds = 0;
        clearCooldown();
      }
      updateResendState();
    }, 1000);
  };

  const resetCooldown = () => {
    remainingSeconds = 0;
    isSending = false;
    updateResendState();
  };

  resendBtn?.addEventListener('click', async () => {
    if (isSending || remainingSeconds > 0) return;

    isSending = true;
    updateResendState();

    try {
      await api.post('/auth/resend-verification', { email });
      showToast(t('verify.resendSuccess'), 'success');
      startCooldown();
      return;
    } catch (err) {
      showToast(err.message || t('verify.resendError'), 'error');
    }

    resetCooldown();
  });

  startCooldown();

  registerRouteCleanup(() => {
    clearCooldown();
  });
}
