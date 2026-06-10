import { t } from '../shared/utils/i18n.js';
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
  const card = document.createElement("div");
  card.className = "tour-card";

  const iconWrap = document.createElement("div");
  iconWrap.className = "tour-icon";
  const tIcon = document.createElement("i");
  tIcon.className = `fas ${steps[0].icon}`;
  iconWrap.appendChild(tIcon);
  card.appendChild(iconWrap);

  const tTitle = document.createElement("h3");
  tTitle.className = "tour-title";
  tTitle.textContent = steps[0].title;
  card.appendChild(tTitle);

  const tDesc = document.createElement("p");
  tDesc.className = "tour-desc";
  tDesc.textContent = steps[0].desc;
  card.appendChild(tDesc);

  const dots = document.createElement("div");
  dots.className = "tour-dots";
  steps.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = `tour-dot${i === 0 ? " active" : ""}`;
    dots.appendChild(dot);
  });
  card.appendChild(dots);

  const actions = document.createElement("div");
  actions.className = "tour-actions";

  const skip = document.createElement("button");
  skip.className = "btn btn-ghost btn-sm tour-skip";
  skip.textContent = t("common.cancel");
  actions.appendChild(skip);

  const next = document.createElement("button");
  next.className = "btn btn-primary btn-sm tour-next";
  next.textContent = t("common.next");
  actions.appendChild(next);

  card.appendChild(actions);
  overlay.appendChild(card);
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
