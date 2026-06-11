import Alpine from '@alpinejs/csp';
import { KEYS } from '../../shared/constants/storage-keys.js';

Alpine.store('ui', {
  theme: localStorage.getItem(KEYS.THEME) || 'light',
  lang: localStorage.getItem(KEYS.LANG) || 'en',
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEYS.THEME, this.theme);
  },
  toggleLang() {
    this.lang = this.lang === 'en' ? 'ar' : 'en';
    localStorage.setItem(KEYS.LANG, this.lang);
  },
});
