import { t } from '../shared/utils/i18n.js';
import { requireAuth, getUser, syncVipAttribute } from '../features/auth/login.js';
import { observeAnimations } from '../shared/utils/dom.js';
import { showToast } from '../widgets/ui/toast.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { getRoleSubscriptionInfo, fetchSubscriptionsPageData, upgradeSubscription } from '../features/subscriptions/subscriptions.js';
import { createPaymentReference } from '../features/checkout/checkout.js';
import { renderPlans } from '../widgets/subscriptions/render-plans.js';
import { renderSkeleton, renderError } from '../widgets/subscriptions/render-states.js';

export default async function renderSubscriptions(container) {
  setPageMeta(t('subscriptions.title'));
  if (!(await requireAuth())) return;

  renderSkeleton(container);
  const info = getRoleSubscriptionInfo(getUser()?.role || '');

  try {
    const data = await fetchSubscriptionsPageData();
    renderPlans(container, { ...data, info }, {
      onUpgrade: async (tier) => {
        const ref = createPaymentReference(tier);
        await upgradeSubscription(tier, ref);
        await syncVipAttribute();
        showToast(t('subscriptions.upgradeSuccess'), 'success');
        window.location.reload();
      },
    });
    observeAnimations();
  } catch {
    renderError(container);
  }
}
