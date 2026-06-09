(function() {
  const t = localStorage.getItem('sayiad_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  const l = localStorage.getItem('sayiad_lang') || 'en';
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
})();
