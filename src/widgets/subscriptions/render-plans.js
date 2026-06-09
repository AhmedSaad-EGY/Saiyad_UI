import { t } from '../../app/i18n.js';
import { formatPrice } from '../../shared/utils/format.js';
import { escapeHtml } from '../../shared/utils/dom.js';
import { getPlanIcon, isPopularPlan } from '../../shared/utils/plans.js';

export function renderPlans(container, { plans, mySubscription, walletBalance, info }, { onUpgrade }) {
  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-crown" aria-hidden="true"></i> ${t("subscriptions.title")}</h2></div>
    <div>
      <div class="card mb-4 border-0" style="background:var(--primary-gradient, linear-gradient(135deg,var(--primary),var(--primary-light)));color:var(--text-inverse)">
        <div class="card-body">
          <h3 class="mb-1 mt-0">${escapeHtml(info.heading)}</h3>
          <p class="m-0 opacity-75">${escapeHtml(info.desc)}</p>
        </div>
      </div>

      <div class="d-flex gap-3 flex-wrap mb-4">
        ${walletBalance !== null ? `
          <div class="card card-sm d-flex align-items-center gap-3 p-3">
            <i class="fas fa-wallet fs-6 text-primary" aria-hidden="true"></i>
            <div><small class="text-muted">${t("wallet.available")}</small>
            <div class="fw-bold">${formatPrice(walletBalance)}</div></div>
          </div>` : ''}
        ${mySubscription ? `
          <div class="card card-sm d-flex align-items-center gap-3 p-3">
            <i class="fas fa-crown fs-6 text-primary" aria-hidden="true"></i>
            <div><small class="text-muted">${t("subscriptions.currentPlan")}</small>
            <div class="fw-bold">
              ${escapeHtml(mySubscription.tier || t('subscriptions.noPlan'))}
              ${mySubscription.endDate ? `<span class="text-muted fw-normal" style="font-size:0.85rem"> · ${t("common.endsIn")}: ${new Date(mySubscription.endDate).toLocaleDateString()}</span>` : ''}
            </div></div>
          </div>` : ''}
      </div>

      ${plans.length > 0 ? `
      <div class="grid grid-3" style="align-items:stretch" id="plansGrid">
        ${plans.map((p) => {
          const isCurrent = mySubscription && (mySubscription.tier === p.tier || mySubscription.planName === p.name);
          const insufficient = !isCurrent && p.price > 0 && walletBalance !== null && walletBalance < p.price;
          const isPop = isPopularPlan(p.sortOrder);
          return `
          <div class="card" style="display:flex;flex-direction:column;position:relative;${isPop ? 'border:2px solid var(--primary)' : ''}">
            ${isPop ? `<span class="position-absolute" style="top:-10px;right:16px;background:var(--primary);color:var(--text-inverse);padding:2px 12px;border-radius:var(--radius-xl);font-size:0.78rem;font-weight:600">${t("subscriptions.popular")}</span>` : ''}
            <div class="card-body" style="display:flex;flex-direction:column">
            <div class="text-center mb-3">
              <i class="fas ${getPlanIcon(p.tier)} text-primary mb-2" style="font-size:2rem" aria-hidden="true"></i>
              <h3>${escapeHtml(p.name)}</h3>
              ${p.description ? `<p class="text-muted" style="font-size:0.88rem">${escapeHtml(p.description)}</p>` : ''}
            </div>
            <div class="text-center mb-3">
              ${p.price > 0
                ? `<span class="fs-1 fw-bold">${formatPrice(p.price)}</span>`
                : `<span class="fs-1 fw-bold">${t("subscriptions.free")}</span>`
              }
              <span class="text-muted">${p.billingCycle === 'Yearly' ? ` ${t('subscriptions.perYear')}` : p.billingCycle === 'Monthly' ? ` ${t('subscriptions.perMonth')}` : ''}</span>
            </div>
            <ul class="list-unstyled mb-3" style="flex:1">
              ${(p.features || []).map(f => `
                <li class="py-2 border-divider-bottom"><i class="fas fa-check text-success me-2" style="width:16px" aria-hidden="true"></i>${escapeHtml(f)}</li>
              `).join('')}
            </ul>
            <button class="btn ${isCurrent ? 'btn-ghost' : insufficient ? 'btn-outline' : 'btn-primary'} sub-upgrade-btn"
              data-tier="${escapeHtml(p.tier)}"
              ${isCurrent ? 'disabled' : insufficient ? `disabled title="${t('subscriptions.insufficientFunds')}"` : ''}>
              ${isCurrent ? t("subscriptions.current") : insufficient ? t("subscriptions.insufficientFunds") : t("subscriptions.upgrade")}
            </button>
            </div>
          </div>`;
        }).join('')}
      </div>` : `
      <div class="empty-state mt-4">
        <div class="empty-state-visual"><i class="fas fa-crown" style="font-size:3rem;color:var(--text-muted)" aria-hidden="true"></i></div>
        <h3>${t("subscriptions.noPlans")}</h3>
        <p class="text-muted">${t("subscriptions.noPlansDesc")}</p>
      </div>`}
    </div>`;

  const plansGrid = document.getElementById('plansGrid');
  if (plansGrid) {
    plansGrid.addEventListener('click', async (e) => {
      const btn = e.target.closest('.sub-upgrade-btn');
      if (!btn || btn.disabled) return;
      const tier = btn.dataset.tier;
      if (!tier) return;
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}`;
      try {
        await onUpgrade(tier);
        btn.disabled = false;
      } catch {
        btn.disabled = false;
        btn.innerHTML = t("subscriptions.upgrade");
      }
    });
  }
}
