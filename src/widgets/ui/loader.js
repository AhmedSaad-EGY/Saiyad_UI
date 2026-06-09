import { t } from '../../shared/utils/i18n.js';

const skeletons = {
  page: `<div class="skeleton-page"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>`,
  card: `<div class="skeleton-card"><div class="skeleton skeleton-img"></div><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div></div>`,
  detail: `<div class="skeleton-detail"><div class="skeleton skeleton-img-lg"></div><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div></div>`,
  table: `<div class="skeleton-table"><div class="skeleton skeleton-row"></div><div class="skeleton skeleton-row"></div><div class="skeleton skeleton-row"></div></div>`,
  auth: `<div class="skeleton-auth"><div class="skeleton skeleton-avatar"></div><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div></div>`,
  form: `<div class="skeleton-form"><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-btn"></div></div>`,
};

export function showLoading(container, type = 'page') {
  const template = skeletons[type] || skeletons.page;
  container.innerHTML = `<div class="global-skeleton" role="status" aria-label="Loading">${template}</div>`;
}

export function showError(container, msg) {
  container.innerHTML = `<div class="global-error" role="alert"><i class="fas fa-exclamation-circle"></i><p>${msg}</p></div>`;
}

export function showErrorFallback(container, message) {
  container.innerHTML = `
    <div class="global-error" role="alert">
      <i class="fas fa-exclamation-triangle" style="font-size:2rem;color:var(--danger)"></i>
      <p style="margin:12px 0;color:var(--text-primary)">${message || t('common.errorOccurred')}</p>
      <div class="d-flex gap-2 justify-content-center" style="margin-top:8px">
        <button class="btn btn-primary" onclick="window.location.hash='#/'"><i class="fas fa-home"></i> ${t('common.goHome')}</button>
        <button class="btn btn-outline" onclick="window.location.reload()"><i class="fas fa-redo"></i> ${t('common.tryAgain')}</button>
      </div>
    </div>`;
}
