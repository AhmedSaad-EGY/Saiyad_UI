import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth, getUser } from '../core/auth/index.js';
import { escapeHtml, showLoading, observeAnimations } from '../core/utils/dom.js';
import { formatPrice } from '../core/utils/format.js';
import { showToast } from '../core/utils/ui.js';
import { getRoleSubscriptionInfo, getPlanIcon, isPopularPlan } from '../features/subscriptions/helpers.js';
import { createPaymentReference } from '../features/checkout/helpers.js';

export default async function renderSubscriptions(container) {
  if (!(await requireAuth())) return;

  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-crown"></i> ${t("subscriptions.title")}</h2></div>
    <div id="subs-root">
      <div class="skeleton-grid skeleton-shimmer">
        <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%"></div><div class="skeleton skeleton-text" style="height:30px;width:50%"></div><div class="skeleton skeleton-text short"></div><div class="skeleton skeleton-text short"></div></div></div>
        <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%"></div><div class="skeleton skeleton-text" style="height:30px;width:50%"></div><div class="skeleton skeleton-text short"></div><div class="skeleton skeleton-text short"></div></div></div>
        <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%"></div><div class="skeleton skeleton-text" style="height:30px;width:50%"></div><div class="skeleton skeleton-text short"></div><div class="skeleton skeleton-text short"></div></div></div>
      </div>
    </div>`;

  try {
    const [plans, mySub, walletData] = await Promise.all([
      api.get("/subscriptionplans").catch(() => []),
      api.get("/subscriptions/my").catch(() => null),
      api.get("/wallet").catch(() => null),
    ]);

    const planList = plans || [];
    const mySubscription = mySub || null;
    const walletBalance = walletData?.availableBalance ?? null;
    const user = getUser();
    const role = user?.role || '';
    const info = getRoleSubscriptionInfo(role);

    const root = document.getElementById('subs-root');
    if (!root) return;

    root.innerHTML = `
      <div>
        <div class="card" style="padding:20px;margin-bottom:24px;background:var(--primary-gradient, linear-gradient(135deg,var(--primary),var(--primary-light)));color:var(--text-inverse);border:none">
          <h3 style="margin:0 0 6px">${escapeHtml(info.heading)}</h3>
          <p style="margin:0;opacity:0.85">${escapeHtml(info.desc)}</p>
        </div>

        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px">
          ${walletBalance !== null ? `
            <div class="card card-sm" style="padding:12px 20px;display:flex;align-items:center;gap:12px">
              <i class="fas fa-wallet" style="font-size:1.2rem;color:var(--primary)"></i>
              <div><small style="color:var(--text-muted)">${t("wallet.available")}</small>
              <div style="font-weight:700">${formatPrice(walletBalance)}</div></div>
            </div>` : ''}
          ${mySubscription ? `
            <div class="card card-sm" style="padding:12px 20px;display:flex;align-items:center;gap:12px">
              <i class="fas fa-crown" style="font-size:1.2rem;color:var(--primary)"></i>
              <div><small style="color:var(--text-muted)">${t("subscriptions.currentPlan")}</small>
              <div style="font-weight:700">
                ${escapeHtml(mySubscription.tier || t('subscriptions.noPlan'))}
                ${mySubscription.endDate ? `<span style="color:var(--text-muted);font-weight:400;font-size:0.85rem"> · ${t("common.endsIn")}: ${new Date(mySubscription.endDate).toLocaleDateString()}</span>` : ''}
              </div></div>
            </div>` : ''}
        </div>

        ${planList.length > 0 ? `
        <div class="grid grid-3" style="align-items:stretch" id="plansGrid">
          ${planList.map((p) => {
            const isCurrent = mySubscription && (mySubscription.tier === p.tier || mySubscription.planName === p.name);
            const insufficient = !isCurrent && p.price > 0 && walletBalance !== null && walletBalance < p.price;
            const isPop = isPopularPlan(p.sortOrder);
            return `
            <div class="card" style="display:flex;flex-direction:column;position:relative;padding:24px${isPop ? ';border:2px solid var(--primary)' : ''}">
              ${isPop ? `<span style="position:absolute;top:-10px;right:16px;background:var(--primary);color:var(--text-inverse);padding:2px 12px;border-radius:20px;font-size:0.78rem;font-weight:600">${t("subscriptions.popular")}</span>` : ''}
              <div style="text-align:center;margin-bottom:16px">
                <i class="fas ${getPlanIcon(p.tier)}" style="font-size:2rem;color:var(--primary);margin-bottom:8px"></i>
                <h3>${escapeHtml(p.name)}</h3>
                ${p.description ? `<p style="color:var(--text-muted);font-size:0.88rem">${escapeHtml(p.description)}</p>` : ''}
              </div>
              <div style="text-align:center;margin-bottom:16px">
                ${p.price > 0
                  ? `<span style="font-size:2rem;font-weight:700">${formatPrice(p.price)}</span>`
                  : `<span style="font-size:2rem;font-weight:700">${t("subscriptions.free")}</span>`
                }
                <span style="color:var(--text-muted)">${p.billingCycle === 'Yearly' ? ' ' + t('subscriptions.perYear') : p.billingCycle === 'Monthly' ? ' ' + t('subscriptions.perMonth') : ''}</span>
              </div>
              <ul style="list-style:none;padding:0;margin:0 0 16px;flex:1">
                ${(p.features || []).map(f => `
                  <li style="padding:6px 0;border-bottom:1px solid var(--border)"><i class="fas fa-check" style="color:var(--success);margin-right:8px;width:16px"></i>${escapeHtml(f)}</li>
                `).join('')}
              </ul>
              <button class="btn ${isCurrent ? 'btn-ghost' : insufficient ? 'btn-outline' : 'btn-primary'} sub-upgrade-btn"
                data-tier="${escapeHtml(p.tier)}"
                ${isCurrent ? 'disabled' : insufficient ? `disabled title="${t('subscriptions.insufficientFunds')}"` : ''}>
                ${isCurrent ? t("subscriptions.current") : insufficient ? t("subscriptions.insufficientFunds") : t("subscriptions.upgrade")}
              </button>
            </div>`;
          }).join('')}
        </div>` : `
        <div class="empty-state" style="margin-top:24px">
          <div class="empty-state-visual"><i class="fas fa-crown" style="font-size:3rem;color:var(--text-muted)"></i></div>
          <h3>${t("subscriptions.noPlans") || "No plans available"}</h3>
          <p style="color:var(--text-muted)">${t("subscriptions.noPlansDesc") || "Subscription plans are not available at this time."}</p>
        </div>`}
      </div>`;

    observeAnimations();

    // Handle upgrade button clicks via event delegation
    const plansGrid = document.getElementById('plansGrid');
    if (plansGrid) {
      plansGrid.addEventListener('click', async (e) => {
        const btn = e.target.closest('.sub-upgrade-btn');
        if (!btn || btn.disabled) return;
        const tier = btn.dataset.tier;
        if (!tier) return;
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("common.loading")}`;
        try {
          const ref = createPaymentReference(tier);
          await api.post("/subscriptions/upgrade", { tier, paymentReference: ref });
          showToast(t("subscriptions.upgradeSuccess"), "success");
          window.location.reload();
        } catch (err) {
          showToast(err.message, "error");
          btn.disabled = false;
          btn.innerHTML = t("subscriptions.upgrade");
        }
      });
    }
  } catch {
    const root = document.getElementById('subs-root');
    if (root) {
      root.innerHTML = `
        <div class="empty-state" style="margin-top:24px">
          <div class="empty-state-visual"><i class="fas fa-crown" style="font-size:3rem;color:var(--text-muted)"></i></div>
          <h3>${t("common.error")}</h3>
          <p style="color:var(--text-muted)">${t("common.loadFailed") || "Failed to load subscription plans."}</p>
        </div>`;
    }
  }
}
