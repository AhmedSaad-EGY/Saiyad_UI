import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { getUser, hasAnyRole } from '../core/auth/index.js';
import { escapeHtml, observeAnimations } from '../core/utils/dom.js';
import { MODERATOR_ROLES } from '../shared/constants/roles.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../core/utils/format.js';
import { setPageMeta } from '../core/utils/seo.js';

const CACHE_KEY = 'sayiad_analytics_cache';

function renderSkeleton(container) {
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

function renderContent(container, dash, feeTxns, recent, wallet) {
  const content = document.getElementById('analyticsContent') || container;
  const totalFees = feeTxns.reduce((s, txn) => s + Math.abs(txn.amount), 0);
  content.innerHTML = `
    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-lg-3">
        <div class="card text-center h-100 animate-on-scroll stagger-1">
          <div class="card-body">
          <i class="fas fa-gavel fs-3 text-primary mb-2" aria-hidden="true"></i>
          <div class="fs-2 fw-bold text-gradient">${dash.totalAuctions ?? 0}</div>
          <div class="text-muted small">${t("analytics.totalAuctions")}</div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card text-center h-100 animate-on-scroll stagger-2">
          <div class="card-body">
          <i class="fas fa-play-circle fs-3 text-success mb-2" aria-hidden="true"></i>
          <div class="fs-2 fw-bold text-success">${dash.activeAuctions ?? 0}</div>
          <div class="text-muted small">${t("analytics.activeAuctions")}</div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card text-center h-100 animate-on-scroll stagger-3">
          <div class="card-body">
          <i class="fas fa-check-circle fs-3 text-warning mb-2" aria-hidden="true"></i>
          <div class="fs-2 fw-bold text-warning">${dash.finishedAuctions ?? 0}</div>
          <div class="text-muted small">${t("analytics.finishedAuctions")}</div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card text-center h-100 animate-on-scroll stagger-4">
          <div class="card-body">
          <i class="fas fa-hand-pointer fs-3 text-info mb-2" aria-hidden="true"></i>
          <div class="fs-2 fw-bold text-info">${dash.totalBids ?? 0}</div>
          <div class="text-muted small">${t("analytics.totalBids")}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-sm-6">
        <div class="card text-center h-100 animate-on-scroll stagger-1">
          <div class="card-body">
          <i class="fas fa-money-bill-wave fs-3 text-success mb-2" aria-hidden="true"></i>
          <div class="fs-2 fw-bold text-success">${dash.totalRevenue != null ? formatPrice(dash.totalRevenue) : formatPrice(0)}</div>
          <div class="text-muted small">${t("analytics.totalRevenue")}</div>
          </div>
        </div>
      </div>
      <div class="col-sm-6">
        <div class="card text-center h-100 border-start border-3 animate-on-scroll stagger-2" style="border-color:var(--primary)">
          <div class="card-body">
          <i class="fas fa-percentage fs-3 text-primary mb-2" aria-hidden="true"></i>
          <div class="fs-2 fw-bold text-primary">${formatPrice(totalFees)}</div>
          <div class="text-muted small">${t("analytics.totalFees")}</div>
          <small class="text-muted d-block mt-1">${wallet ? `${formatPrice(wallet.availableBalance)} ${t("analytics.availableInWallet")}` : ""}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4 animate-on-scroll stagger-3">
      <div class="card-header border-bottom-0 pb-0">
        <h3 class="mb-0"><i class="fas fa-chart-bar text-primary" aria-hidden="true"></i> ${t("analytics.statusDistribution")}</h3>
      </div>
      <div class="card-body">
        <div class="d-flex flex-column gap-3">
          <div>
            <div class="d-flex justify-content-between mb-1 small text-muted">
              <span>${t('auctions.active')}</span>
              <span class="fw-bold text-success">${dash.activeAuctions ?? 0} / ${dash.totalAuctions ?? 1}</span>
            </div>
            <div class="progress" style="height:12px;background:var(--border);border-radius:var(--radius-full);overflow:hidden">
              <div class="progress-bar bg-success" style="width: ${((dash.activeAuctions ?? 0) / (dash.totalAuctions || 1)) * 100}%;height:100%;transition:width 0.6s var(--ease-out);background:var(--success)"></div>
            </div>
          </div>
          <div>
            <div class="d-flex justify-content-between mb-1 small text-muted">
              <span>${t('auctions.finished')}</span>
              <span class="fw-bold text-warning">${dash.finishedAuctions ?? 0} / ${dash.totalAuctions ?? 1}</span>
            </div>
            <div class="progress" style="height:12px;background:var(--border);border-radius:var(--radius-full);overflow:hidden">
              <div class="progress-bar bg-warning" style="width: ${((dash.finishedAuctions ?? 0) / (dash.totalAuctions || 1)) * 100}%;height:100%;transition:width 0.6s var(--ease-out);background:var(--warning)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    ${feeTxns.length > 0 ? `
    <div class="card mt-3 animate-on-scroll stagger-4">
      <div class="card-header">
        <h3 class="mb-0">${t("analytics.feeIncome")}</h3>
      </div>
      <div class="card-body">
      <div class="table-wrapper"><table class="table"><thead><tr><th>${t("wallet.date")}</th><th>${t("wallet.amount")}</th><th>${t("wallet.description")}</th></tr></thead><tbody>${feeTxns.map(txn => `<tr><td>${formatDate(txn.createdAt)}</td><td class="fw-semibold">${formatPrice(txn.amount)}</td><td>${escapeHtml(txn.description || "")}</td></tr>`).join("")}</tbody></table></div>
    </div>` : ''}
    ${recent.length > 0 ? `
    <div class="card mt-3">
      <div class="card-header">
        <h3 class="mb-0">${t("analytics.recentAuctions")}</h3>
      </div>
      <div class="card-body">
      <div class="table-wrapper"><table class="table"><thead><tr><th>${t("common.title")}</th><th>${t("auctionRequests.status")}</th><th>${t("analytics.startingPrice")}</th><th>${t("analytics.currentPrice")}</th><th>${t("analytics.bidCount")}</th><th>${t("analytics.endTime")}</th></tr></thead><tbody>${recent.map(a => `<tr><td>${escapeHtml(a.title || a.productName || '-')}</td><td><span class="${statusClass(a.status)}">${tStatus(a.status, "auction")}</span></td><td>${formatPrice(a.startingPrice || 0)}</td><td>${formatPrice(a.currentPrice || a.startingPrice || 0)}</td><td>${a.bidCount ?? 0}</td><td>${a.endTime ? formatDate(a.endTime) : '-'}</td></tr>`).join("")}</tbody></table></div>
    </div>
    </div>` : ''}`;
  observeAnimations();
}

export default async function renderAuctioneerAnalytics(container) {
  setPageMeta(t('analytics.title'));
  const _u = getUser();
  if (!_u || !hasAnyRole(...(MODERATOR_ROLES))) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-chart-bar" aria-hidden="true"></i><h3>${t("common.pageNotFound")}</h3></div>`;
    return;
  }

  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const p = JSON.parse(cached);
      if (p?.dash) {
        renderContent(container, p.dash, p.feeTxns || [], p.recent || [], p.wallet || null);
        observeAnimations();
      }
    } catch { /* cache stale */ }
  }

  if (!sessionStorage.getItem(CACHE_KEY)) {
    renderSkeleton(container);
  }

  try {
    const [dataResult, txnResult, walletResult] = await Promise.allSettled([
      api.get("/auctions/dashboard"),
      api.get("/wallet/transactions", { page: 1, pageSize: 20 }),
      api.get("/wallet"),
    ]);

    const dash = (dataResult.status === 'fulfilled' ? dataResult.value : {}) || {};
    const recent = dash.recentAuctions || dash.recent || [];
    const allTxns = (txnResult.status === 'fulfilled' ? txnResult.value?.items || [] : []);
    const feeTxns = allTxns.filter(txn => txn.type === "PlatformFee");
    const wallet = walletResult.status === 'fulfilled' ? walletResult.value : null;

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        dash: { totalAuctions: dash.totalAuctions, activeAuctions: dash.activeAuctions, finishedAuctions: dash.finishedAuctions, totalBids: dash.totalBids, totalRevenue: dash.totalRevenue },
        feeTxns: feeTxns.map(txn => ({ createdAt: txn.createdAt, amount: txn.amount, description: txn.description })),
        recent: recent.map(a => ({ title: a.title, productName: a.productName, status: a.status, startingPrice: a.startingPrice, currentPrice: a.currentPrice, bidCount: a.bidCount, endTime: a.endTime })),
        wallet: wallet ? { availableBalance: wallet.availableBalance } : null,
      }));
    } catch { /* storage full or private mode */ }

    renderContent(container, dash, feeTxns, recent, wallet);
  } catch {
    if (!cached) {
      const el = document.getElementById('analyticsContent') || container;
      el.innerHTML = `<div class="empty-state"><i class="fas fa-chart-bar" aria-hidden="true"></i><h3>${t("analytics.noData")}</h3></div>`;
    }
  }
}
