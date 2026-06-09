import { t } from '../../shared/utils/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';

export function renderProfileForm(profile) {
  const isNew = !profile;
  return `
    <div class="section-header"><h2><i class="fas fa-store" aria-hidden="true"></i> ${isNew ? t('seller.create') : t('seller.myProfile')}</h2></div>
    <div id="sellerAlert"></div>
    <div class="card" style="max-width:520px">
      <div class="card-body">
        <form id="sellerForm" novalidate>
          <div class="form-group"><label class="form-label">${t('seller.storeName')} *</label><input type="text" class="form-input form-control" id="sStoreName" value="${escapeHtml(profile?.storeName || '')}" required></div>
          <div class="form-group"><label class="form-label">${t('seller.description')}</label><textarea class="form-textarea form-control" id="sDescription">${escapeHtml(profile?.description || '')}</textarea></div>
          <div class="form-group"><label class="form-label">${t('seller.contactEmail')}</label><input type="email" class="form-input form-control" id="sEmail" value="${escapeHtml(profile?.contactEmail || '')}"></div>
          <div class="form-group"><label class="form-label">${t('seller.contactPhone')}</label><input type="tel" class="form-input form-control" id="sPhone" value="${escapeHtml(profile?.contactPhone || '')}"></div>
          <div class="form-group"><label class="form-label">${t('seller.location')}</label><input type="text" class="form-input form-control" id="sLocation" value="${escapeHtml(profile?.location || '')}"></div>
          <button type="submit" class="btn btn-primary" id="sellerSubmit">${t('seller.save')}</button>
        </form>
      </div>
    </div>`;
}

export function renderSavingButton() {
  return `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t('seller.saving')}`;
}
