import { setupGlobalErrorHandlers } from '../shared/utils/errors.js';
import { initOcean } from '../shared/utils/ocean.js';
import { isAuthenticated } from '../shared/utils/auth-state.js';
import { on } from '../shared/utils/events.js';
import { updateNavbar } from './navbar.js';
import { setNavbarDeps, updateCartBadge, startNotifPolling, stopNotifPolling } from '../widgets/layout/navbar.js';
import { fetchCartCount } from '../features/cart/index.js';
import { fetchUnreadNotificationCount } from '../features/notifications/index.js';

setupGlobalErrorHandlers();
initOcean();

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
