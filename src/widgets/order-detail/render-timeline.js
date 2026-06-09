import { t } from '../../shared/utils/i18n.js';

function getTimelineSteps(status) {
  const steps = [
    { key: 'Confirmed', icon: 'fa-check', label: t('order.confirmed') },
    { key: 'Processing', icon: 'fa-cog', label: t('order.processing') },
    { key: 'Shipped', icon: 'fa-truck', label: t('order.shipped') },
    { key: 'Delivered', icon: 'fa-box-open', label: t('order.delivered') },
  ];
  const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentIdx = statusOrder.indexOf(status);
  const cancelled = status === 'Cancelled';

  return steps.map((step, _i) => {
    const stepIdx = statusOrder.indexOf(step.key);
    let cls = '';
    if (cancelled) cls = '';
    else if (stepIdx < currentIdx) cls = 'completed';
    else if (stepIdx === currentIdx) cls = 'active';
    return { ...step, cls };
  });
}

export function renderOrderTimeline(status) {
  if (status === 'Cancelled') {
    return `<div class="alert alert-error mb-4"><i class="fas fa-times-circle" aria-hidden="true"></i> ${t('order.cancelled')}</div>`;
  }

  const timelineSteps = getTimelineSteps(status);
  return `
    <div class="card mb-4 animate-on-scroll">
      <div class="card-body">
        <div class="order-timeline" role="list" aria-label="${t('order.status')}">
          ${timelineSteps.map(step => `
            <div class="order-timeline-step ${step.cls}" role="listitem">
              <div class="order-timeline-icon">
                <i class="fas ${step.cls === 'completed' ? 'fa-check' : step.icon}" aria-hidden="true"></i>
              </div>
              <span class="order-timeline-label">${step.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
}
