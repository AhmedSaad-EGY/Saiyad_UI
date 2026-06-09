import { t } from '../../app/i18n.js';

export function renderSkeleton(container) {
  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-chart-bar" aria-hidden="true"></i> ${t("analytics.title")}</h2></div>
    <div id="analyticsContent">
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3"><div class="card text-center h-100"><div class="card-body py-4"><div class="skeleton skeleton-shimmer rounded-circle mx-auto mb-2" style="width:32px;height:32px"></div><div class="skeleton skeleton-shimmer mx-auto mb-1" style="width:50%;height:28px"></div><div class="skeleton skeleton-shimmer mx-auto" style="width:60%;height:14px"></div></div></div></div>
        <div class="col-sm-6 col-lg-3"><div class="card text-center h-100"><div class="card-body py-4"><div class="skeleton skeleton-shimmer rounded-circle mx-auto mb-2" style="width:32px;height:32px"></div><div class="skeleton skeleton-shimmer mx-auto mb-1" style="width:50%;height:28px"></div><div class="skeleton skeleton-shimmer mx-auto" style="width:60%;height:14px"></div></div></div></div>
        <div class="col-sm-6 col-lg-3"><div class="card text-center h-100"><div class="card-body py-4"><div class="skeleton skeleton-shimmer rounded-circle mx-auto mb-2" style="width:32px;height:32px"></div><div class="skeleton skeleton-shimmer mx-auto mb-1" style="width:50%;height:28px"></div><div class="skeleton skeleton-shimmer mx-auto" style="width:60%;height:14px"></div></div></div></div>
        <div class="col-sm-6 col-lg-3"><div class="card text-center h-100"><div class="card-body py-4"><div class="skeleton skeleton-shimmer rounded-circle mx-auto mb-2" style="width:32px;height:32px"></div><div class="skeleton skeleton-shimmer mx-auto mb-1" style="width:50%;height:28px"></div><div class="skeleton skeleton-shimmer mx-auto" style="width:60%;height:14px"></div></div></div></div>
      </div>
      <div class="row g-3 mb-4">
        <div class="col-sm-6"><div class="card text-center h-100"><div class="card-body py-4"><div class="skeleton skeleton-shimmer rounded-circle mx-auto mb-2" style="width:32px;height:32px"></div><div class="skeleton skeleton-shimmer mx-auto mb-1" style="width:50%;height:28px"></div><div class="skeleton skeleton-shimmer mx-auto" style="width:60%;height:14px"></div></div></div></div>
        <div class="col-sm-6"><div class="card text-center h-100"><div class="card-body py-4"><div class="skeleton skeleton-shimmer rounded-circle mx-auto mb-2" style="width:32px;height:32px"></div><div class="skeleton skeleton-shimmer mx-auto mb-1" style="width:50%;height:28px"></div><div class="skeleton skeleton-shimmer mx-auto" style="width:60%;height:14px"></div></div></div></div>
      </div>
      <div class="card mb-4"><div class="card-header"><div class="skeleton skeleton-shimmer" style="width:30%;height:18px"></div></div><div class="card-body"><div class="skeleton skeleton-shimmer mb-3" style="height:12px;border-radius:var(--radius-full)"></div><div class="skeleton skeleton-shimmer" style="height:12px;border-radius:var(--radius-full)"></div></div></div>
      <div class="card mt-3"><div class="card-header"><div class="skeleton skeleton-shimmer" style="width:25%;height:18px"></div></div><div class="card-body p-0"><div class="skeleton skeleton-shimmer skeleton-row-header"></div><div class="skeleton skeleton-shimmer skeleton-row"></div><div class="skeleton skeleton-shimmer skeleton-row"></div></div></div>
    </div>`;
}

export function renderError(container) {
  container.innerHTML = `<div class="section-header"><h2><i class="fas fa-chart-bar" aria-hidden="true"></i> ${t("analytics.title")}</h2></div>
    <div class="empty-state"><i class="fas fa-chart-bar" aria-hidden="true"></i><h3>${t("analytics.noData")}</h3></div>`;
}
