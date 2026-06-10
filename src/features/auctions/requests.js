import Alpine from '@alpinejs/csp';
import { t } from '../../shared/utils/i18n.js';
import { getUser } from '../auth/login.js';
import { clearFieldError, validateForm } from '../../shared/utils/validation.js';
import { showToast } from '../../shared/utils/ui.js';
import { ROLES } from '../../shared/constants/roles.js';
import { setPageMeta } from '../../shared/utils/seo.js';
import { fetchMyRequests, createAuctionRequest } from './create.js';

Alpine.data('auctionRequestsPage', () => ({
  view: 'list',
  items: [],
  loading: true,
  error: '',
  existing: null,

  init() {
    setPageMeta(t('auctionRequests.title'));
    const u = getUser();
    if (!u || u.role !== ROLES.FISHERMAN) { window.location.hash = '#/'; return; }
    this.loadRequests();
  },

  async loadRequests() {
    this.loading = true;
    this.view = 'list';
    try {
      const res = await fetchMyRequests(1, 50);
      this.items = res?.items || res?.data || [];
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },

  showForm(existing) {
    this.existing = existing;
    this.view = 'form';
    this.$nextTick(() => {
      const ids = ['arProductTitle', 'arFishType', 'arQuantityKg', 'arEstimatedValue'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => clearFieldError(el));
      });
    });
  },

  formatDate(dateStr) { return dateStr ? new Date(dateStr).toLocaleDateString() : '-'; },

  cancelForm() {
    this.view = 'list';
  },

  async submitRequest(e) {
    e.preventDefault();
    const form = e.target;
    const titleIn = document.getElementById('arProductTitle');
    const fishIn = document.getElementById('arFishType');
    const qtyIn = document.getElementById('arQuantityKg');
    const estIn = document.getElementById('arEstimatedValue');

    const valid = validateForm(form, [
      { element: titleIn, required: true },
      { element: fishIn, required: true },
      { element: qtyIn, required: true },
      { element: estIn, required: true },
    ]);
    if (!valid) return;

    const submit = document.getElementById('arSubmit');
    submit.disabled = true;
    submit.textContent = "";
    const spinner = document.createElement("i");
    spinner.className = "fas fa-spinner spinner";
    spinner.setAttribute("aria-hidden", "true");
    submit.appendChild(spinner);
    submit.appendChild(document.createTextNode(` ${t("auctionRequests.submitting")}`));

    try {
      await createAuctionRequest({
        productTitle: titleIn.value.trim(),
        productDescription: document.getElementById('arDescription')?.value.trim() || '',
        estimatedValue: parseFloat(estIn.value),
        quantityKg: parseFloat(qtyIn.value),
        fishType: fishIn.value.trim(),
        catchLocation: document.getElementById('arCatchLocation')?.value.trim() || '',
        catchDate: document.getElementById('arCatchDate')?.value || null,
        productImageUrl: document.getElementById('arImageUrl')?.value.trim() || null,
      });
      showToast(t('auctionRequests.submitted'), 'success');
      this.loadRequests();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submit.disabled = false;
      const sp = submit.querySelector(".fa-spinner");
      if (sp) sp.remove();
      submit.textContent = t('auctionRequests.submit');
    }
  },
}));
