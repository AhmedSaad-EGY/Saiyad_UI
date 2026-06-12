import Alpine from 'alpinejs';
import { t } from '../../shared/utils/i18n.js';
import { api } from '../../shared/api/client.js';
import { showToast, showConfirm } from '../../shared/utils/ui.js';
import { setPageMeta } from '../../shared/utils/seo.js';

export async function fetchAddresses() {
  const data = await api.get('/shippingaddresses');
  return Array.isArray(data) ? data : [];
}

export async function createAddress(payload) {
  return api.post('/shippingaddresses', payload);
}

export async function updateAddress(id, payload) {
  return api.put(`/shippingaddresses/${id}`, payload);
}

export async function deleteAddress(id) {
  return api.delete(`/shippingaddresses/${id}`);
}

Alpine.data('shippingPage', () => ({
  addresses: [],
  loading: true,
  showForm: false,
  saving: false,
  editingId: null,
  form: { fullName: '', phone: '', city: '', addressLine: '', postalCode: '' },

  async init() {
    setPageMeta(t('shipping.title'), undefined, true);
    await this.loadAddresses();
  },

  async loadAddresses() {
    this.loading = true;
    try {
      const data = await api.get('/shippingaddresses');
      this.addresses = Array.isArray(data) ? data : [];
    } catch (e) {
      this.addresses = [];
      showToast(e.message || t('common.error'), 'error');
    } finally {
      this.loading = false;
    }
  },

  editAddress(address) {
    this.editingId = address.id;
    this.form = {
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      addressLine: address.addressLine,
      postalCode: address.postalCode || ''
    };
    this.showForm = true;
  },

  async submitForm() {
    this.saving = true;
    const payload = {
      fullName: this.form.fullName.trim(),
      phone: this.form.phone.trim(),
      city: this.form.city.trim(),
      addressLine: this.form.addressLine.trim(),
      postalCode: this.form.postalCode.trim() || undefined,
    };
    try {
      if (this.editingId) {
        await api.put(`/shippingaddresses/${this.editingId}`, payload);
        showToast(t('shipping.updated'), 'success');
      } else {
        await api.post('/shippingaddresses', payload);
        showToast(t('shipping.saved'), 'success');
      }
      this.cancelForm();
      await this.loadAddresses();
    } catch (err) {
      showToast(err.message || t('shipping.error'), 'error');
    } finally {
      this.saving = false;
    }
  },

  encodeUri(val) {
    return encodeURIComponent(val);
  },

  cancelForm() {
    this.form = { fullName: '', phone: '', city: '', addressLine: '', postalCode: '' };
    this.editingId = null;
    this.showForm = false;
  },

  async deleteAddress(id) {
    const ok = await showConfirm(
      t('shipping.confirmDelete'),
      t('shipping.confirmDeleteDesc'),
      { type: 'danger', confirmText: t('common.delete') }
    );
    if (!ok) return;
    try {
      await api.delete(`/shippingaddresses/${id}`);
      showToast(t('shipping.deleted'), 'success');
      await this.loadAddresses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}));
