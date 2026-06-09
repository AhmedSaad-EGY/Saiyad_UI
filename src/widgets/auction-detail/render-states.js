import { t } from '../../shared/utils/i18n.js';

export function renderDetailStates() {
  return `
    <div x-show="loading" class="skeleton-detail skeleton-shimmer" role="status" aria-label="${t('common.loading')}">
      <div class="skeleton skeleton-image" style="height:380px"></div>
      <div class="py-4">
        <div class="skeleton skeleton-title" style="width:60%"></div>
        <div class="skeleton skeleton-text" style="width:20%;height:32px"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>
    </div>

    <div x-show="!loading && error" class="empty-state">
      <div class="empty-state-visual"><i class="fas fa-gavel text-muted fs-hero"></i></div>
      <h3 x-text="$t('common.loadFailed')"></h3>
      <p x-text="error"></p>
      <button class="btn btn-primary mt-3" @click="retry()">${t('common.retry')}</button>
    </div>`;
}
