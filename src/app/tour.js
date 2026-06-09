import { t } from './i18n.js';
import { animate } from '../shared/utils/dom.js';
import { registerRouteCleanup } from './router.js';

(function showOnboarding() {
  if (localStorage.getItem('sayiad_tour_done')) return;
  const steps = [
    { title: t('home.welcome'), desc: t('tour.welcome'), icon: 'fa-fish' },
    { title: t('nav.products'), desc: t('tour.products'), icon: 'fa-store' },
    { title: t('nav.auctions'), desc: t('tour.auctions'), icon: 'fa-gavel' },
  ];
  let step = 0;
  const overlay = document.createElement('div');
  overlay.className = 'tour-overlay';
  overlay.innerHTML = `
    <div class="tour-card">
      <div class="tour-icon"><i class="fas ${steps[0].icon}"></i></div>
      <h3 class="tour-title">${steps[0].title}</h3>
      <p class="tour-desc">${steps[0].desc}</p>
      <div class="tour-dots">${steps.map((_, i) => `<span class="tour-dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>
      <div class="tour-actions">
        <button class="btn btn-ghost btn-sm tour-skip">${t('common.cancel')}</button>
        <button class="btn btn-primary btn-sm tour-next">${t('common.next')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  registerRouteCleanup(() => {
    if (overlay.isConnected) overlay.remove();
  });
  animate(overlay, 'fadeIn', { duration: '0.25s' });
  overlay.querySelector('.tour-next').addEventListener('click', () => {
    step++;
    if (step >= steps.length) {
      localStorage.setItem('sayiad_tour_done', '1');
      overlay.remove();
      return;
    }
    overlay.querySelector('.tour-icon i').className = `fas ${steps[step].icon}`;
    overlay.querySelector('.tour-title').textContent = steps[step].title;
    overlay.querySelector('.tour-desc').textContent = steps[step].desc;
    overlay.querySelectorAll('.tour-dot').forEach((d, i) => d.classList.toggle('active', i === step));
    overlay.querySelector('.tour-next').textContent = step === steps.length - 1 ? t('common.start') : t('common.next');
  });
  overlay.querySelector('.tour-skip').addEventListener('click', () => {
    localStorage.setItem('sayiad_tour_done', '1');
    overlay.remove();
  });
})();
