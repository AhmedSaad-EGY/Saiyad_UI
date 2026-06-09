import { t } from '../shared/utils/i18n.js';
import { getUser, hasAnyRole } from '../features/auth/login.js';
import { MODERATOR_ROLES } from '../shared/constants/roles.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { getCachedAnalyticsPageData, fetchAnalyticsPageData } from '../features/auctions/analytics.js';
import { renderContent } from '../widgets/auctioneer-analytics/render-content.js';
import { renderSkeleton, renderError } from '../widgets/auctioneer-analytics/render-states.js';

export default async function renderAuctioneerAnalytics(container) {
  setPageMeta(t('analytics.title'));
  const _u = getUser();
  if (!_u || !hasAnyRole(...(MODERATOR_ROLES))) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-chart-bar" aria-hidden="true"></i><h3>${t("common.pageNotFound")}</h3></div>`;
    return;
  }

  const cached = getCachedAnalyticsPageData();
  if (cached) {
    renderContent(container, cached);
  } else {
    renderSkeleton(container);
  }

  try {
    const data = await fetchAnalyticsPageData();
    renderContent(container, data);
  } catch {
    if (!cached) renderError(container);
  }
}
