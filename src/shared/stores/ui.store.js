import Alpine from 'alpinejs';

Alpine.store('ui', {
  theme: localStorage.getItem('sayiad_theme') || 'light',
  lang: localStorage.getItem('sayiad_lang') || 'en',
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
  },
  toggleLang() {
    this.lang = this.lang === 'en' ? 'ar' : 'en';
  },
});
