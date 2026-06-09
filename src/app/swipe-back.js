import { t } from '../shared/utils/i18n.js';
import { goBack } from './router.js';
import { createSwipeGesture } from '../shared/utils/swipe.js';

(function initSwipeBack() {
  if (!('ontouchstart' in window)) return;

  let indicator = null;
  let removeTimer = null;

  function showIndicator(progress) {
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'swipeBackIndicator';
      indicator.setAttribute('role', 'status');
      indicator.setAttribute('aria-live', 'polite');
      indicator.innerHTML = `<i class="fas fa-arrow-left" aria-hidden="true"></i><span>${t('common.back')}</span>`;
      document.body.appendChild(indicator);
    }
    const clampedProgress = Math.min(progress, 1);
    indicator.style.opacity = clampedProgress;
    const translate = Math.min(progress * 40, 30);
    indicator.style.transform = `translateX(${translate}px)`;
  }

  function hideIndicator() {
    if (indicator) {
      indicator.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateX(0)';
      clearTimeout(removeTimer);
      removeTimer = setTimeout(() => {
        if (indicator) { indicator.remove(); indicator = null; }
      }, 200);
    }
  }

  const edgeSwipe = createSwipeGesture({
    el: document.documentElement,
    edgeOnly: true,
    edgeWidth: 35,
    threshold: 10,
    onSwipeMove({ distance }) {
      const isRtl = document.dir === 'rtl';
      const valid = isRtl ? distance < 0 : distance > 0;
      if (!valid) { hideIndicator(); return; }
      const absDist = Math.abs(distance);
      showIndicator(absDist / 100);
    },
    onSwipeEnd({ distance }) {
      hideIndicator();
      const isRtl = document.dir === 'rtl';
      const valid = isRtl ? distance < 0 : distance > 0;
      if (!valid) return;
      if (Math.abs(distance) >= 80) {
        goBack();
      }
    },
  });

  window.addEventListener('beforeunload', () => {
    edgeSwipe.destroy();
    if (indicator) { indicator.remove(); indicator = null; }
  });
})();
