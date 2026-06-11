import { setLanguage, getCurrentLang } from '../shared/utils/i18n.js';
import { router } from './router.js';

const initialLang = getCurrentLang();

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  const toggle = document.getElementById('langToggle');
  if (toggle) {
    toggle.textContent = lang === 'ar' ? 'AR' : 'EN';
    toggle.setAttribute('aria-pressed', lang === 'ar' ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      lang === 'ar' ? 'Switch to English' : 'Switch to Arabic',
    );
  }
}

function handleLangChange(next) {
  const app = document.getElementById('app');
  if (!app) return;
  app.style.transition = 'opacity 0.12s ease';
  app.style.opacity = '0';

  setTimeout(() => {
    setLanguage(next);
    applyLanguage(next);
    router(true);
    setTimeout(() => {
      app.style.transition = '';
      app.style.opacity = '';
    }, 300);
  }, 130);
}

applyLanguage(initialLang);

document.getElementById('langToggle')?.addEventListener('click', () => {
  const current = getCurrentLang();
  handleLangChange(current === 'en' ? 'ar' : 'en');
});
