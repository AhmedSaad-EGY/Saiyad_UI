const APP_CONFIG = {
  apiBaseUrl: 'https://sayiad.runasp.net/api',
};

// When served via the dev proxy (localhost), use same-origin API path
if (window.location.origin && window.location.origin.startsWith('http')) {
  APP_CONFIG.apiBaseUrl = window.location.origin + '/api';
}
