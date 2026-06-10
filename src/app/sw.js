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

  const icon = document.createElement("i");
  icon.className = "fas fa-arrow-up-circle text-primary flex-shrink-0 fs-5";
  banner.appendChild(icon);

  const msg = document.createElement("span");
  msg.className = "flex-fill fw-medium";
  msg.textContent = "A new version is available.";
  banner.appendChild(msg);

  const updateBtn = document.createElement("button");
  updateBtn.id = "swUpdateBtn";
  updateBtn.className = "border-0 text-white fw-semibold text-nowrap";
  updateBtn.style.cssText = "background:var(--primary);border-radius:var(--radius-md);padding:7px 16px;font-size:13px;cursor:pointer;font-family:inherit";
  updateBtn.textContent = "Refresh";
  banner.appendChild(updateBtn);

  const dismissBtn = document.createElement("button");
  dismissBtn.id = "swDismissBtn";
  dismissBtn.setAttribute("aria-label", t("common.dismiss"));
  dismissBtn.className = "border-0";
  dismissBtn.style.cssText = "background:transparent;cursor:pointer;color:var(--text-secondary);font-size:18px;line-height:1;padding:0 2px";
  dismissBtn.textContent = "×";
  banner.appendChild(dismissBtn);

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
