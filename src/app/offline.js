import { t } from '../shared/utils/i18n.js';
import { animate } from '../shared/utils/dom.js';

(function initOfflineBanner() {
  let banner = null;

  function createBanner(online) {
    const el = document.createElement('div');
    el.setAttribute('role', 'alert');
    if (online) {
      el.id = 'onlineBanner';
      el.className = 'online-banner';
      const wifiIcon = document.createElement("i");
      wifiIcon.className = "fas fa-wifi";
      el.appendChild(wifiIcon);
      el.appendChild(document.createTextNode(` ${t("common.backOnline")}`));
      setTimeout(() => {
        el.addEventListener('animationend', () => el.remove(), { once: true });
        animate(el, 'slideOutUp', { duration: '0.3s' });
      }, 2500);
      return el;
    }
    el.id = 'offlineBanner';
    el.className = 'offline-banner';
    const close = document.createElement('button');
    close.textContent = '\u00D7';
    close.setAttribute('aria-label', 'Dismiss');
    close.className = 'sw-close-btn';
    close.addEventListener('click', () => { el.remove(); banner = null; });
    const plugIcon = document.createElement("i");
    plugIcon.className = "fas fa-plug";
    el.appendChild(plugIcon);
    const offSpan = document.createElement("span");
    offSpan.textContent = t("common.offline");
    el.appendChild(offSpan);
    el.appendChild(close);
    return el;
  }

  function showOffline() {
    if (document.getElementById('offlineBanner')) return;
    if (document.getElementById('onlineBanner')) document.getElementById('onlineBanner').remove();
    banner = createBanner(false);
    document.body.prepend(banner);
    animate(banner, 'slideInDown', { duration: '0.3s' });
  }

  function showOnline() {
    if (document.getElementById('offlineBanner')) document.getElementById('offlineBanner').remove();
    banner = null;
    if (document.getElementById('onlineBanner')) return;
    const el = createBanner(true);
    document.body.prepend(el);
    animate(el, 'slideInDown', { duration: '0.3s' });
  }

  window.addEventListener('offline', showOffline);
  window.addEventListener('online', showOnline);

  if (!navigator.onLine) showOffline();
})();
