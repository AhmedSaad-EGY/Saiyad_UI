import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth } from '../core/auth/index.js';
import { showConfirm, showToast } from '../core/utils/ui.js';
import { setPageMeta } from '../core/utils/seo.js';
import Alpine from 'alpinejs';

Alpine.data('shippingPage', () => ({
  addresses: [],
  loading: true,
  showForm: false,
  saving: false,
  editingId: null,
  form: { fullName: '', phone: '', city: '', addressLine: '', postalCode: '' },

  async init() {
    setPageMeta("My Addresses", undefined, true);
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
        showToast(t('shipping.updated') || 'Address updated successfully', 'success');
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

  cancelForm() {
    this.form = { fullName: '', phone: '', city: '', addressLine: '', postalCode: '' };
    this.editingId = null;
    this.showForm = false;
  },

  async deleteAddress(id) {
    const ok = await showConfirm(
      t('shipping.confirmDelete'),
      t('shipping.confirmDeleteDesc') || t('shipping.confirmDelete'),
      { type: 'danger', confirmText: t('common.delete') || 'Delete' }
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

export default async function renderShipping(container) {
  if (!(await requireAuth())) return;

  container.innerHTML = `
    <div x-data="shippingPage">
      <div class="section-header">
        <h2><i class="fas fa-truck" aria-hidden="true"></i> ${t('shipping.title')}</h2>
        <button class="btn btn-primary btn-sm" x-show="!showForm" @click="showForm = true" x-cloak><i class="fas fa-plus" aria-hidden="true"></i> ${t('shipping.addNew')}</button>
      </div>

      <div class="card" x-show="showForm" style="max-width:480px;margin-top:16px" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100" x-cloak>
        <div class="card-header">
          <h3 class="mb-0" x-text="editingId ? '${t('shipping.editAddress') || 'Edit Address'}' : '${t('shipping.addNew')}'"></h3>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitForm" novalidate>
            <div class="form-group"><label class="form-label">${t('shipping.fullName')}</label><input type="text" class="form-input form-control" x-model="form.fullName" required></div>
            <div class="form-group"><label class="form-label">${t('shipping.phone')}</label><input type="tel" class="form-input form-control" x-model="form.phone" required></div>
            <div class="form-group"><label class="form-label">${t('shipping.city')}</label><input type="text" class="form-input form-control" x-model="form.city" required></div>
            <div class="form-group"><label class="form-label">${t('shipping.addressLine')}</label><input type="text" class="form-input form-control" x-model="form.addressLine" required></div>
            <div class="form-group"><label class="form-label">${t('shipping.postalCode')}</label><input type="text" class="form-input form-control" x-model="form.postalCode"></div>
            
            <!-- Live Location Map Preview -->
            <div class="form-group" x-show="form.city.trim()" x-transition x-cloak style="margin-top: 16px;">
              <label class="form-label text-primary"><i class="fas fa-map-marked-alt" aria-hidden="true"></i> ${t('shipping.locationPreview') || 'Location Preview'}</label>
              <div style="height: 180px; width: 100%; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border);">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameborder="0" 
                  scrolling="no" 
                  marginheight="0" 
                  marginwidth="0" 
                  :src="'https://maps.google.com/maps?q=' + encodeURIComponent(form.city + ' ' + form.addressLine) + '&t=&z=14&ie=UTF8&iwloc=&output=embed'"
                  style="border: none;">
                </iframe>
              </div>
            </div>

            <div class="d-flex gap-2" style="margin-top: 20px;">
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <i class="fas" :class="saving ? 'fa-spinner spinner' : 'fa-save'" aria-hidden="true"></i> <span x-text="saving ? '${t('shipping.saving')}' : '${t('shipping.save')}'"></span>
              </button>
              <button type="button" class="btn btn-ghost" @click="cancelForm()">${t('common.cancel') || 'Cancel'}</button>
            </div>
          </form>
        </div>
      </div>

      <div class="mt-4">
        <template x-if="loading">
          <div class="skeleton-grid skeleton-shimmer">
            <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:30%"></div><div class="skeleton skeleton-text short"></div></div></div>
            <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:30%"></div><div class="skeleton skeleton-text short"></div></div></div>
          </div>
        </template>
        <template x-if="!loading && addresses.length === 0">
          <div class="empty-state">
            <div class="empty-state-visual mb-3"><i class="fas fa-truck text-muted" style="font-size:3.5rem" aria-hidden="true"></i></div>
            <h3>${t('shipping.noAddresses')}</h3>
            <button class="btn btn-primary mt-3" @click="showForm = true">${t('shipping.addNew')}</button>
          </div>
        </template>
        <template x-if="!loading && addresses.length > 0">
          <div class="d-flex flex-column gap-3">
            <template x-for="a in addresses" :key="a.id">
              <div class="card card-sm" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-direction:row">
                <div>
                  <strong x-text="a.fullName"></strong><br>
                  <span style="color:var(--text-secondary);font-size:0.88rem" x-text="a.addressLine + ', ' + a.city + (a.postalCode ? ', ' + a.postalCode : '')"></span><br>
                  <span style="color:var(--text-muted);font-size:0.82rem" x-text="a.phone"></span>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline btn-sm" @click="editAddress(a)"><i class="fas fa-edit" aria-hidden="true"></i> ${t('common.edit') || 'Edit'}</button>
                  <button class="btn btn-danger btn-sm" @click="deleteAddress(a.id)">${t('shipping.delete')}</button>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>`;
}
