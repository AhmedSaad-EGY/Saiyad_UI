import { t } from '../../shared/utils/i18n.js';
import { formatPrice } from '../../shared/utils/format.js';
import { escapeHtml } from '../../shared/utils/dom.js';
import { getPlanIcon, computePlanStatus } from '../../shared/utils/plans.js';
import { resolveBackendSubscriptionTier } from '../../features/subscriptions/subscriptions.js';
import '../../styles/pages/subscriptions.css';

const PLAN_TEXT_KEY_MAP = {
  basic: 'subscriptions.basic',
  pro: 'subscriptions.proLabel',
  enterprise: 'subscriptions.enterprise',
  premium: 'subscriptions.premium',
  'basic access to browse and explore the marketplace': 'subscriptions.freeDesc',
  'full access with priority support and extra features': 'subscriptions.premiumDesc',
  'everything in premium plus unlimited auctions and analytics': 'subscriptions.proDesc',
  'browse products and auctions': 'subscriptions.feature1',
  'place bids and make purchases': 'subscriptions.feature2',
  'create seller profile': 'subscriptions.feature3',
  'priority customer support': 'subscriptions.feature4',
  'advanced analytics dashboard': 'subscriptions.feature5',
  'unlimited auction requests': 'subscriptions.feature6',
  'featured listings': 'subscriptions.feature7',
};

function translateSubscriptionText(value, fallbackKey = '') {
  const raw = String(value ?? '').trim();
  if (!raw) return fallbackKey ? t(fallbackKey) : '';
  const mappedKey = PLAN_TEXT_KEY_MAP[raw.toLowerCase()];
  return mappedKey ? t(mappedKey) : raw;
}

function getPlanDisplayName(plan) {
  return translateSubscriptionText(plan?.name || plan?.tier, 'subscriptions.noPlan');
}

function getPlanDescription(plan) {
  return translateSubscriptionText(plan?.description);
}

function getSubscriptionEndDate(subscription) {
  const fields = ['endDate', 'expiresAt', 'expiryDate', 'subscriptionEndDate', 'currentPeriodEnd'];
  for (const field of fields) {
    const value = subscription?.[field];
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return { field, date };
  }
  return { field: null, date: null };
}

function getSubscriptionRemainingLabel(subscription) {
  const { field, date } = getSubscriptionEndDate(subscription);
  if (!date) return { field: null, text: '' };

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((endDay - startToday) / 86400000);

  if (diffDays < 0) return { field, text: t('subscriptions.expired') };
  if (diffDays === 0) return { field, text: t('subscriptions.endsToday') };
  return { field, text: t('subscriptions.daysLeft', { count: diffDays }) };
}

export function renderPlans(container, { plans, mySubscription, walletBalance, info }, { onUpgrade }) {
  const { text: subscriptionRemainingText } = getSubscriptionRemainingLabel(mySubscription);

  container.innerHTML = `
    <div class="subscription-page">
    <div class="section-header subscription-section-header"><h2><i class="fas fa-crown" aria-hidden="true"></i> ${t('subscriptions.title')}</h2></div>
    <div class="subscription-layout">
      <div class="card mb-4 border-0 subscription-hero">
        <div class="card-body">
          <h3 class="mb-1 mt-0">${escapeHtml(info.heading)}</h3>
          <p class="m-0 subscription-muted">${escapeHtml(info.desc)}</p>
        </div>
      </div>

      <div class="subscription-summary-grid">
        ${walletBalance !== null ? `
          <div class="card card-sm subscription-summary-card">
            <i class="fas fa-wallet subscription-summary-icon" aria-hidden="true"></i>
            <div class="subscription-summary-copy"><small class="text-muted">${t('wallet.available')}</small>
            <div class="fw-bold">${formatPrice(walletBalance)}</div></div>
          </div>` : ''}
        ${mySubscription ? `
          <div class="card card-sm subscription-summary-card">
            <i class="fas fa-crown subscription-summary-icon" aria-hidden="true"></i>
            <div class="subscription-summary-copy"><small class="text-muted">${t('subscriptions.currentPlan')}</small>
            <div class="fw-bold">
              ${escapeHtml(translateSubscriptionText(mySubscription.tier || mySubscription.planName, 'subscriptions.noPlan'))}
              ${subscriptionRemainingText ? `<span class="text-muted fw-normal subscription-meta-date">· <span>${escapeHtml(subscriptionRemainingText)}</span></span>` : ''}
            </div></div>
          </div>` : ''}
      </div>
      <div class="alert alert-info">
        <i class="fas fa-info-circle" aria-hidden="true"></i>
        <span>${t('subscriptions.demoPaymentNote')}</span>
      </div>

      ${plans.length > 0 ? `
      <div class="subscriptions-grid" id="plansGrid">
        ${plans.map((p) => {
          const { isCurrent, insufficient, isPop } = computePlanStatus(p, mySubscription, walletBalance);
          const backendTier = resolveBackendSubscriptionTier(p.tier || p.name);
          const displayName = getPlanDisplayName(p);
          const displayDescription = getPlanDescription(p);
          return `
          <div class="card subscription-card${isPop ? ' subscription-card-popular' : ''}">
            ${isPop ? `<span class="position-absolute subscription-popular-badge">${t('subscriptions.popular')}</span>` : ''}
            <div class="card-body subscription-card-body">
            <div class="subscription-card-header">
              <i class="fas ${getPlanIcon(p.tier)} subscription-card-icon" aria-hidden="true"></i>
              <h3>${escapeHtml(displayName)}</h3>
              ${displayDescription ? `<p class="subscription-muted">${escapeHtml(displayDescription)}</p>` : ''}
            </div>
            <div class="subscription-price">
              ${p.price > 0
                ? `<span class="subscription-price-value">${formatPrice(p.price)}</span>`
                : `<span class="subscription-price-value">${t('subscriptions.free')}</span>`
              }
              <span class="subscription-billing-cycle">${p.billingCycle === 'Yearly' ? ` ${t('subscriptions.perYear')}` : p.billingCycle === 'Monthly' ? ` ${t('subscriptions.perMonth')}` : ''}</span>
            </div>
            <ul class="subscription-feature-list">
              ${(p.features || []).map(f => `
                <li class="subscription-feature-item"><i class="fas fa-check subscription-feature-icon" aria-hidden="true"></i><span>${escapeHtml(translateSubscriptionText(f))}</span></li>
              `).join('')}
            </ul>
            <button class="btn ${isCurrent ? 'btn-ghost' : insufficient ? 'btn-outline' : 'btn-primary'} sub-upgrade-btn"
              data-tier="${escapeHtml(backendTier || '')}"
              ${isCurrent ? 'disabled' : insufficient ? `disabled title="${t('subscriptions.insufficientFunds')}"` : !backendTier ? `disabled title="${t('subscriptions.invalidTier')}"` : ''}>
              ${isCurrent ? t('subscriptions.current') : insufficient ? t('subscriptions.insufficientFunds') : t('subscriptions.upgrade')}
            </button>
            </div>
          </div>`;
        }).join('')}
      </div>` : `
      <div class="empty-state mt-4">
        <div class="empty-state-visual"><i class="fas fa-crown subscription-empty-icon" aria-hidden="true"></i></div>
        <h3>${t('subscriptions.noPlans')}</h3>
        <p class="text-muted">${t('subscriptions.noPlansDesc')}</p>
      </div>`}
    </div>
    </div>`;

  const plansGrid = document.getElementById('plansGrid');
  if (plansGrid) {
    plansGrid.addEventListener('click', async (e) => {
      const btn = e.target.closest('.sub-upgrade-btn');
      if (!btn || btn.disabled || plansGrid.dataset.upgradePending === 'true') return;
      const tier = btn.dataset.tier;
      if (!tier) return;
      plansGrid.dataset.upgradePending = 'true';
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t('common.loading')}`;
      try {
        await onUpgrade(tier);
      } catch {
        btn.disabled = false;
        btn.innerHTML = t('subscriptions.upgrade');
        delete plansGrid.dataset.upgradePending;
      }
    });
  }
}
