import Alpine from '@alpinejs/csp';

Alpine.store('ui', {
  theme: localStorage.getItem('sayiad_theme') || 'light',
  lang: localStorage.getItem('sayiad_lang') || 'en',
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sayiad_theme', this.theme);
  },
  toggleLang() {
    this.lang = this.lang === 'en' ? 'ar' : 'en';
    localStorage.setItem('sayiad_lang', this.lang);
  },
});
