import { t } from '../shared/utils/i18n.js';
import { animate } from '../shared/utils/dom.js';
import { registerRouteCleanup } from './router.js';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      if (registration.waiting) {
        showUpdateBanner(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            showUpdateBanner(newWorker);
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      setInterval(() => registration.update(), 3600000);
    })
    .catch(err => console.warn('SW registration failed:', err));
}

function showUpdateBanner(worker) {
  if (document.getElementById('swUpdateBanner')) return;

  const banner = document.createElement('div');
  banner.id = 'swUpdateBanner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.className = 'sw-update-banner';

  banner.innerHTML = `
    <i class="fas fa-arrow-up-circle text-primary flex-shrink-0 fs-5"></i>
    <span class="flex-fill fw-medium">
      A new version is available.
    </span>
    <button id="swUpdateBtn"
      class="border-0 text-white fw-semibold text-nowrap"
      style="background:var(--primary);border-radius:var(--radius-md);padding:7px 16px;
             font-size:13px;cursor:pointer;font-family:inherit">
      Refresh
    </button>
    <button id="swDismissBtn" aria-label="${t('common.dismiss')}"
      class="border-0"
      style="background:transparent;cursor:pointer;
             color:var(--text-secondary);font-size:18px;line-height:1;
             padding:0 2px">
      ×
    </button>
  `;

  document.body.appendChild(banner);
  registerRouteCleanup(() => {
    if (banner.isConnected) banner.remove();
  });
  animate(banner, 'slideInUp', { duration: '0.35s' });

  document.getElementById('swUpdateBtn').addEventListener('click', () => {
    banner.remove();
    worker.postMessage('SKIP_WAITING');
  });

  document.getElementById('swDismissBtn').addEventListener('click', () => {
    banner.addEventListener('animationend', () => banner.remove(), { once: true });
    animate(banner, 'fadeOut', { duration: '0.2s' });
  });
}
