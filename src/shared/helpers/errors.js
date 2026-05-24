import { showToast } from '../../core/utils/ui.js';
import { bus, on } from '../../core/events/bus.js';

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
  if (isForbidden(err)) { showToast('Access denied', 'error'); return; }
  if (isServerError(err)) { showToast('Server error. Please try again.', 'error'); return; }

  showToast(message, 'error');
}

export function setupGlobalErrorHandlers() {
  on('api:error', ({ err }) => handleApiError(err));

  window.addEventListener('unhandledrejection', (e) => {
    if (isNetworkError(e.reason) || e.reason?.message?.includes('Session expired')) return;
    console.warn('Unhandled Promise Rejection:', e.reason);
  });

  window.addEventListener('error', (e) => {
    if (e.message?.includes('ResizeObserver')) {
      e.preventDefault();
      return;
    }
    console.warn('Global Error:', e.message);
  });
}
