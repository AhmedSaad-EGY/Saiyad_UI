import { showToast } from '../../core/utils/ui.js';
import { bus, on } from '../../core/events/bus.js';
import { t } from '../../core/i18n/index.js';

export function normalizeApiError(err) {
  if (!err) return { message: 'Unknown error', status: 0 };

  let message = err.message || '';
  const status = err.status || 0;

  if (err.data?.errors) {
    const details = Object.values(err.data.errors).flat().join('; ');
    if (details) message += ': ' + details;
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
  const { message, status } = normalizeApiError(err);

  if (isNetworkError(err) || isAuthError(err)) return;
  if (isForbidden(err)) { showToast(t('common.error'), 'error'); return; }
  if (isServerError(err)) { showToast(t('common.somethingWentWrong'), 'error'); return; }

  showToast(message, 'error');
}

export function showErrorFallback(container, message) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;padding:40px 20px">
      <div style="font-size:3.5rem;margin-bottom:16px;color:var(--text-muted);animation:fishSwim 2s ease-in-out infinite">
        <i class="fas fa-fish"></i>
      </div>
      <h2 style="margin-bottom:8px;font-size:1.5rem">${t('common.somethingWentWrong') || 'Something went wrong'}</h2>
      <p style="color:var(--text-muted);max-width:400px;margin-bottom:24px">${message || (t('common.errorFallbackDesc') || 'An unexpected error occurred. Please try refreshing the page.')}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
        <button class="btn btn-primary btn-lg" onclick="window.location.reload()"><i class="fas fa-sync-alt"></i> ${t('common.refresh') || 'Refresh'}</button>
        <a href="#/" class="btn btn-outline btn-lg"><i class="fas fa-home"></i> ${t('common.goHome') || 'Home'}</a>
      </div>
      <style>
        @keyframes fishSwim {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(10px) rotate(5deg); }
          75% { transform: translateX(-10px) rotate(-5deg); }
        }
      </style>
    </div>`;
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
