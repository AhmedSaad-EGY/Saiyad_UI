import { t } from '../../shared/utils/i18n.js';

export function renderSkeleton(container) {
  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-crown" aria-hidden="true"></i> ${t("subscriptions.title")}</h2></div>
    <div id="subs-root">
      <div class="skeleton-grid skeleton-shimmer">
        <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%"></div><div class="skeleton skeleton-text" style="height:30px;width:50%"></div><div class="skeleton skeleton-text short"></div><div class="skeleton skeleton-text short"></div></div></div>
        <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%"></div><div class="skeleton skeleton-text" style="height:30px;width:50%"></div><div class="skeleton skeleton-text short"></div><div class="skeleton skeleton-text short"></div></div></div>
        <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%"></div><div class="skeleton skeleton-text" style="height:30px;width:50%"></div><div class="skeleton skeleton-text short"></div><div class="skeleton skeleton-text short"></div></div></div>
      </div>
    </div>`;
}

export function renderError(container) {
  container.innerHTML = `<div class="section-header"><h2><i class="fas fa-crown" aria-hidden="true"></i> ${t("subscriptions.title")}</h2></div>
    <div class="empty-state mt-4"><i class="fas fa-crown fs-1 text-muted" aria-hidden="true"></i><h3>${t("common.error")}</h3><p class="text-muted">${t("common.loadFailed")}</p></div>`;
}
