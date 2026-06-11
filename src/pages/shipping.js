import { t } from '../shared/utils/i18n.js';
import { requireAuth } from '../features/auth/login.js';
import '../features/shipping/index.js';

export default async function renderShipping(container) {
  if (!(await requireAuth())) return;

  container.innerHTML = `
    <div x-data="shippingPage">
      <div class="section-header">
        <h2><i class="fas fa-truck" aria-hidden="true"></i> ${t('shipping.title')}</h2>
        <button class="btn btn-primary btn-sm" x-show="!showForm" @click="showForm = true" x-cloak><i class="fas fa-plus" aria-hidden="true"></i> ${t('shipping.addNew')}</button>
      </div>

      <div class="card mw-lg" x-show="showForm" style="margin-top:16px" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100" x-cloak>
        <div class="card-header">
          <h3 class="mb-0" x-text="editingId ? $t('shipping.editAddress') : $t('shipping.addNew')"></h3>
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
              <label class="form-label text-primary"><i class="fas fa-map-marked-alt" aria-hidden="true"></i> ${t('shipping.locationPreview')}</label>
              <div style="height: 180px; width: 100%; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border);">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameborder="0" 
                  scrolling="no" 
                  marginheight="0" 
                  marginwidth="0" 
                  :src="'https://maps.google.com/maps?q=' + encodeUri(form.city + ' ' + form.addressLine) + '&t=&z=14&ie=UTF8&iwloc=&output=embed'"
                  style="border: none;">
                </iframe>
              </div>
            </div>

            <div class="d-flex gap-2" style="margin-top: 20px;">
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <i class="fas" :class="saving ? 'fa-spinner spinner' : 'fa-save'" aria-hidden="true"></i> <span x-text="saving ? '${t('shipping.saving')}' : '${t('shipping.save')}'"></span>
              </button>
              <button type="button" class="btn btn-ghost" @click="cancelForm()">${t('common.cancel')}</button>
            </div>
          </form>
        </div>
      </div>

      <div class="mt-4">
        <template x-if="loading">
          <div class="skeleton-grid skeleton-shimmer">
            <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text xshort"></div><div class="skeleton skeleton-text short"></div></div></div>
            <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text xshort"></div><div class="skeleton skeleton-text short"></div></div></div>
          </div>
        </template>
        <template x-if="!loading && addresses.length === 0">
          <div class="empty-state">
            <div class="empty-state-visual mb-3"><i class="fas fa-truck text-muted fs-hero" aria-hidden="true"></i></div>
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
                  <span class="text-secondary-sm" x-text="a.addressLine + ', ' + a.city + (a.postalCode ? ', ' + a.postalCode : '')"></span><br>
                  <span style="color:var(--text-muted);font-size:0.82rem" x-text="a.phone"></span>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline btn-sm" @click="editAddress(a)"><i class="fas fa-edit" aria-hidden="true"></i> ${t('common.edit')}</button>
                  <button class="btn btn-danger btn-sm" @click="deleteAddress(a.id)">${t('shipping.delete')}</button>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>`;
}
