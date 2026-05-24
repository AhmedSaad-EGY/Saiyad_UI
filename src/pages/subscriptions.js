import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth, getUser } from '../core/auth/index.js';
import { escapeHtml } from '../core/utils/dom.js';
import { formatPrice } from '../core/utils/format.js';
import { showToast } from '../core/utils/ui.js';
import { getRoleSubscriptionInfo, getPlanIcon, isPopularPlan } from '../features/subscriptions/helpers.js';
import { createPaymentReference } from '../features/checkout/helpers.js';
import Alpine from 'alpinejs';

Alpine.data('subscriptionsPage', () => ({
  plans: [],
  mySub: null,
  walletBalance: null,
  role: '',
  roleHeading: '',
  roleDesc: '',
  loading: true,
  t, formatPrice, escapeHtml, getPlanIcon, isPopularPlan,

  async init() {
    try {
      const [plans, mySubData, walletData] = await Promise.all([
        api.get("/subscriptionplans"),
        api.get("/subscriptions/my").catch(() => null),
        api.get("/wallet").catch(() => null),
      ]);
      this.plans = plans || [];
      this.mySub = mySubData || null;
      this.walletBalance = walletData?.availableBalance ?? null;
      const user = getUser();
      this.role = user?.role || '';
      const info = getRoleSubscriptionInfo(this.role);
      this.roleHeading = info.heading;
      this.roleDesc = info.desc;
    } catch {
      this.plans = [];
    } finally {
      this.loading = false;
    }
  },

  isCurrentPlan(p) {
    return this.mySub && (this.mySub.tier === p.tier || this.mySub.planName === p.name);
  },

  insufficientFunds(p) {
    return !this.isCurrentPlan(p) && p.price > 0 && this.walletBalance !== null && this.walletBalance < p.price;
  },

  async upgrade(tier) {
    const ref = createPaymentReference(tier);
    try {
      await api.post("/subscriptions/upgrade", { tier, paymentReference: ref });
      showToast(t("subscriptions.upgradeSuccess"), "success");
      window.location.reload();
    } catch (err) {
      showToast(err.message, "error");
    }
  },
}));

export default async function renderSubscriptions(container) {
  if (!(await requireAuth())) return;

  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-crown"></i> ${t("subscriptions.title")}</h2></div>
    <div x-data="subscriptionsPage">
      <template x-if="loading">
        <div class="skeleton-grid skeleton-shimmer">
          <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%"></div><div class="skeleton skeleton-text" style="height:30px;width:50%"></div><div class="skeleton skeleton-text short"></div><div class="skeleton skeleton-text short"></div></div></div>
          <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%"></div><div class="skeleton skeleton-text" style="height:30px;width:50%"></div><div class="skeleton skeleton-text short"></div><div class="skeleton skeleton-text short"></div></div></div>
          <div class="skeleton-card"><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:40%"></div><div class="skeleton skeleton-text" style="height:30px;width:50%"></div><div class="skeleton skeleton-text short"></div><div class="skeleton skeleton-text short"></div></div></div>
        </div>
      </template>
      <template x-if="!loading">
        <div>
          <div class="card" style="padding:20px;margin-bottom:24px;background:var(--primary-gradient, linear-gradient(135deg,var(--primary),var(--primary-light)));color:var(--text-inverse);border:none">
            <h3 style="margin:0 0 6px" x-text="roleHeading"></h3>
            <p style="margin:0;opacity:0.85" x-text="roleDesc"></p>
          </div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px">
            <template x-if="walletBalance !== null">
              <div class="card card-sm" style="padding:12px 20px;display:flex;align-items:center;gap:12px">
                <i class="fas fa-wallet" style="font-size:1.2rem;color:var(--primary)"></i>
                <div><small style="color:var(--text-muted)">${t("wallet.available")}</small>
                <div style="font-weight:700" x-text="formatPrice(walletBalance)"></div></div>
              </div>
            </template>
            <template x-if="mySub">
              <div class="card card-sm" style="padding:12px 20px;display:flex;align-items:center;gap:12px">
                <i class="fas fa-crown" style="font-size:1.2rem;color:var(--primary)"></i>
                <div><small style="color:var(--text-muted)">${t("subscriptions.currentPlan")}</small>
                <div style="font-weight:700">
                  <span x-text="escapeHtml(mySub.tier || t('subscriptions.noPlan'))"></span>
                  <template x-if="mySub.endDate">
                    <span style="color:var(--text-muted);font-weight:400;font-size:0.85rem"> · ${t("common.endsIn")}: <span x-text="new Date(mySub.endDate).toLocaleDateString()"></span></span>
                  </template>
                </div>
              </div>
            </template>
          </div>
          <div class="grid grid-3" style="align-items:stretch">
            <template x-for="p in plans" :key="p.tier">
              <div class="card" style="display:flex;flex-direction:column;position:relative;padding:24px" :style="isPopularPlan(p.sortOrder) ? 'border:2px solid var(--primary);' : ''">
                <template x-if="isPopularPlan(p.sortOrder)">
                  <span style="position:absolute;top:-10px;right:16px;background:var(--primary);color:var(--text-inverse);padding:2px 12px;border-radius:20px;font-size:0.78rem;font-weight:600">${t("subscriptions.popular")}</span>
                </template>
                <div style="text-align:center;margin-bottom:16px">
                  <i class="fas" :class="getPlanIcon(p.tier)" style="font-size:2rem;color:var(--primary);margin-bottom:8px"></i>
                  <h3 x-text="p.name"></h3>
                  <p style="color:var(--text-muted);font-size:0.88rem" x-text="p.description || ''"></p>
                </div>
                <div style="text-align:center;margin-bottom:16px">
                  <template x-if="p.price > 0">
                    <span style="font-size:2rem;font-weight:700" x-text="formatPrice(p.price)"></span>
                  </template>
                  <template x-if="p.price === 0">
                    <span style="font-size:2rem;font-weight:700">${t("subscriptions.free")}</span>
                  </template>
                  <span style="color:var(--text-muted)" x-text="p.billingCycle === 'Yearly' ? ' ' + t('subscriptions.perYear') : p.billingCycle === 'Monthly' ? ' ' + t('subscriptions.perMonth') : ''"></span>
                </div>
                <ul style="list-style:none;padding:0;margin:0 0 16px;flex:1">
                  <template x-for="f in (p.features || [])" :key="f">
                    <li style="padding:6px 0;border-bottom:1px solid var(--border)"><i class="fas fa-check" style="color:var(--success);margin-right:8px;width:16px"></i><span x-text="f"></span></li>
                  </template>
                </ul>
                <button class="btn" :class="isCurrentPlan(p) ? 'btn-ghost' : insufficientFunds(p) ? 'btn-outline' : 'btn-primary'" :disabled="isCurrentPlan(p) || insufficientFunds(p)" :title="insufficientFunds(p) ? t('subscriptions.insufficientFunds') : ''" @click="upgrade(p.tier)">
                  <template x-if="isCurrentPlan(p)">${t("subscriptions.current")}</template>
                  <template x-if="!isCurrentPlan(p) && insufficientFunds(p)">${t("subscriptions.insufficientFunds")}</template>
                  <template x-if="!isCurrentPlan(p) && !insufficientFunds(p)">${t("subscriptions.upgrade")}</template>
                </button>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>`;
}
