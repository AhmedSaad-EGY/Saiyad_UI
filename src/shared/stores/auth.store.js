import Alpine from '@alpinejs/csp';
import { getUser, isAuthenticated, getRoleFromToken } from '../utils/auth-state.js';

Alpine.store('auth', {
  get user() {
    const u = getUser();
    return u ? { ...u, role: getRoleFromToken() } : null;
  },
  get isAuthenticated() {
    return isAuthenticated();
  },
  get role() {
    return getRoleFromToken();
  },
});
