(function() {
  var t = localStorage.getItem('sayiad_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  var l = localStorage.getItem('sayiad_lang') || 'en';
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
})();
