import Alpine from 'alpinejs';
import { getUser, isAuthenticated, getRoleFromToken } from '../../features/auth/login.js';
import { t } from '../../app/i18n.js';
import { formatPrice, formatDate } from '../utils/format.js';
import { showToast } from '../../widgets/ui/toast.js';
import { escapeHtml } from '../utils/dom.js';

Alpine.magic('t', () => t);
Alpine.magic('formatPrice', () => formatPrice);
Alpine.magic('formatDate', () => formatDate);
Alpine.magic('showToast', () => showToast);
Alpine.magic('escapeHtml', () => escapeHtml);

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

export default Alpine;
