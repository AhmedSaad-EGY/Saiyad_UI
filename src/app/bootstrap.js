import { setupGlobalErrorHandlers } from '../shared/utils/errors.js';
import { initOcean } from '../shared/utils/ocean.js';
import { on } from './events.js';
import { setNavbarDeps, updateNavbar, updateCartBadge, updateNotifBadge, startNotifPolling, stopNotifPolling } from '../widgets/layout/navbar.js';
import { fetchCartCount } from '../features/cart/index.js';
import { fetchUnreadNotificationCount } from '../features/notifications/index.js';

setupGlobalErrorHandlers();
initOcean();

setNavbarDeps({
  fetchCartCount,
  fetchUnreadNotificationCount,
});

on('auth:changed', () => updateNavbar());
on('cart:updated', () => updateCartBadge(true));
on('notifications:updated', () => updateNotifBadge());
on('notifications:start-polling', () => startNotifPolling());
on('notifications:stop-polling', () => stopNotifPolling());
