import Alpine from 'alpinejs';
import { t } from '../utils/i18n.js';
import { formatPrice, formatDate } from '../utils/format.js';
import { showToast } from '../utils/ui.js';
import { escapeHtml } from '../utils/dom.js';

Alpine.magic('t', () => t);
Alpine.magic('formatPrice', () => formatPrice);
Alpine.magic('formatDate', () => formatDate);
Alpine.magic('showToast', () => showToast);
Alpine.magic('escapeHtml', () => escapeHtml);
