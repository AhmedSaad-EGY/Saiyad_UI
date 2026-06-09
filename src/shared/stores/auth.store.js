import Alpine from 'alpinejs';
import { getUser, isAuthenticated, getRoleFromToken } from '../utils/auth-state.js';

Alpine.store('auth', {
  get user() {
    return getUser();
  },
  get isAuthenticated() {
    return isAuthenticated();
  },
  get role() {
    return getRoleFromToken();
  },
});
