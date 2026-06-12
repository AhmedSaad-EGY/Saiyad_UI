import { t } from '../../shared/utils/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';
import { renderStars, formatDate } from '../../shared/utils/format.js';

export function renderPublicProfile(profile) {
  return `
    <div class="card mx-auto" style="max-width:600px">
      <div class="card-body">
        <div class="text-center mb-4">
          ${profile.avatarUrl
            ? `<img src="${escapeHtml(profile.avatarUrl)}" alt="${escapeHtml(profile.sellerName)}" class="rounded-circle mb-2" style="width:80px;height:80px;object-fit:cover">`
            : `<i class="fas fa-store mb-2 fs-1 text-primary" aria-hidden="true"></i>`}
          <h2>${escapeHtml(profile.sellerName)}</h2>
          ${profile.description ? `<p style="color:var(--text-secondary)">${escapeHtml(profile.description)}</p>` : ''}
        </div>
        <div class="d-flex gap-3 justify-content-center flex-wrap mb-3">
          ${profile.rating ? `<span><strong>${t('seller.rating')}:</strong> ${renderStars(profile.rating)} (${profile.rating.toFixed(1)})</span>` : ''}
          <span><strong>${t('seller.totalProducts')}:</strong> ${profile.totalProducts || 0}</span>
        </div>
        <div class="pt-3 border-divider-top text-secondary-sm">
          <p><i class="fas fa-calendar-alt" aria-hidden="true"></i> ${t('seller.memberSince')}: ${formatDate(profile.memberSince)}</p>
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
