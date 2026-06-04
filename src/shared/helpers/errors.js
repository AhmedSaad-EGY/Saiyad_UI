import { showToast } from '../../core/utils/ui.js';
import { on } from '../../core/events/bus.js';
import { t } from '../../core/i18n/index.js';
import { escapeHtml } from '../../core/utils/dom.js';

export function normalizeApiError(err) {
  if (!err) return { message: 'Unknown error', status: 0 };

  let message = err.message || '';
  const status = err.status || 0;

  if (err.data?.errors) {
    const details = Object.values(err.data.errors).flat().join('; ');
    if (details) message += `: ${  details}`;
  }

  return { message, status, data: err.data };
}

export function isAuthError(err) {
  return err?.status === 401;
}

export function isForbidden(err) {
  return err?.status === 403;
}

export function isNetworkError(err) {
  return err?.message?.includes('Network error') || err?.message?.includes('Failed to fetch');
}

export function isServerError(err) {
  return err?.status >= 500;
}

export function handleApiError(err) {
  const { message } = normalizeApiError(err);

  if (isNetworkError(err) || isAuthError(err)) return;
  if (isForbidden(err)) { showToast(t('common.error'), 'error'); return; }
  if (isServerError(err)) { showToast(t('common.somethingWentWrong'), 'error'); return; }

  showToast(message, 'error');
}

export function showErrorFallback(container, message) {
  container.innerHTML = `
    <div class="d-flex flex-column align-items-center justify-content-center text-center py-5 px-3 min-vh-50">
      <div class="mb-3 text-muted animate__animated animate__pulse animate__infinite" style="font-size:3.5rem">
        <i class="fas fa-fish" aria-hidden="true"></i>
      </div>
      <h2 class="mb-2" style="font-size:1.5rem">${t('common.somethingWentWrong') || 'Something went wrong'}</h2>
      <p class="text-muted mb-4" style="max-width:400px">${escapeHtml(message || t('common.errorFallbackDesc') || 'An unexpected error occurred. Please try refreshing the page.')}</p>
      <div class="d-flex gap-3 flex-wrap justify-content-center">
        <button class="btn btn-primary btn-lg" data-action="refresh"><i class="fas fa-sync-alt" aria-hidden="true"></i> ${t('common.refresh') || 'Refresh'}</button>
        <a href="#/" class="btn btn-outline btn-lg"><i class="fas fa-home" aria-hidden="true"></i> ${t('common.goHome') || 'Home'}</a>
      </div>

    </div>`;

  container.querySelector('[data-action="refresh"]')?.addEventListener('click', () => {
    window.location.reload();
  });
}

export function setupGlobalErrorHandlers() {
  on('api:error', ({ err }) => handleApiError(err));

  window.addEventListener('unhandledrejection', (e) => {
    if (isNetworkError(e.reason) || e.reason?.message?.includes('Session expired')) return;
    if (e.reason?.message?.includes('ResizeObserver')) { e.preventDefault(); return; }
    console.warn('Unhandled Promise Rejection:', e.reason);
    const app = document.getElementById('app');
    if (app) showErrorFallback(app, e.reason?.message);
  });

  window.addEventListener('error', (e) => {
    if (e.message?.includes('ResizeObserver')) {
      e.preventDefault();
      return;
    }
    console.warn('Global Error:', e.message);
    const app = document.getElementById('app');
    if (app) showErrorFallback(app, e.message);
  });
}
