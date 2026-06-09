import { t } from '../../app/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';
import { renderStars } from '../../shared/utils/format.js';

export function renderPublicProfile(profile) {
  return `
    <div class="card mx-auto" style="max-width:600px">
      <div class="card-body">
        <div class="text-center mb-4">
          <i class="fas fa-store mb-2 fs-1 text-primary" aria-hidden="true"></i>
          <h2>${escapeHtml(profile.storeName)}</h2>
          ${profile.description ? `<p style="color:var(--text-secondary)">${escapeHtml(profile.description)}</p>` : ''}
        </div>
        <div class="d-flex gap-3 justify-content-center flex-wrap mb-3">
          ${profile.averageRating ? `<span><strong>${t('seller.rating')}:</strong> ${renderStars(profile.averageRating)} (${profile.averageRating.toFixed(1)})</span>` : ''}
          <span><strong>${t('seller.totalSales')}:</strong> ${profile.totalSales || 0}</span>
        </div>
        <div class="pt-3 border-divider-top text-secondary-sm">
          ${profile.contactEmail ? `<p><i class="fas fa-envelope" aria-hidden="true"></i> ${escapeHtml(profile.contactEmail)}</p>` : ''}
          ${profile.contactPhone ? `<p><i class="fas fa-phone" aria-hidden="true"></i> ${escapeHtml(profile.contactPhone)}</p>` : ''}
          ${profile.location ? `<p><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${escapeHtml(profile.location)}</p>` : ''}
        </div>
      </div>
    </div>`;
}

export function renderSellerNotFound() {
  return `<div class="empty-state"><i class="fas fa-store" aria-hidden="true"></i><h3>${t('seller.notFound')}</h3></div>`;
}

export function renderNoProfile() {
  return `<div class="empty-state"><i class="fas fa-store" aria-hidden="true"></i><h3>${t('seller.noProfile')}</h3></div>`;
}
