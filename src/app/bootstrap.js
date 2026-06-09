import { setupGlobalErrorHandlers } from '../shared/utils/errors.js';
import { initOcean } from '../shared/utils/ocean.js';
import { isAuthenticated } from './auth-state.js';
import { on } from './events.js';
import { setNavbarDeps, updateNavbar, updateCartBadge, updateNotifBadge, startNotifPolling, stopNotifPolling } from '../widgets/layout/navbar.js';
import { fetchCartCount } from '../features/cart/index.js';
import { fetchUnreadNotificationCount } from '../features/notifications/index.js';

setupGlobalErrorHandlers();
initOcean();

// Initialize CSRF token from backend (sets XSRF-TOKEN cookie via Antiforgery)
fetch('/api/antiforgery/token', { credentials: 'include' }).catch(() => {});

setNavbarDeps({
  fetchCartCount,
  fetchUnreadNotificationCount,
});

on('auth:changed', () => {
  updateNavbar();
  if (isAuthenticated()) startNotifPolling();
  else stopNotifPolling();
});
on('cart:updated', () => updateCartBadge(true));
// notifications:updated is emitted from updateNotifBadge() itself (see navbar.js),
// so a separate handler here is not needed — it would create an infinite loop.
on('notifications:start-polling', () => startNotifPolling());
on('notifications:stop-polling', () => stopNotifPolling());
