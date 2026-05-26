import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth, hasAnyRole } from '../core/auth/index.js';
import { MODERATOR_ROLES } from '../shared/constants/roles.js';
import { escapeHtml } from '../core/utils/dom.js';
import { formatPrice, formatDate, statusClass, tStatus } from '../core/utils/format.js';

export default async function renderAuctioneerAnalytics(container) {
  if (!(await requireAuth())) return;
  if (!hasAnyRole(...(MODERATOR_ROLES))) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-chart-bar"></i><h3>${t("common.pageNotFound")}</h3></div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-chart-bar"></i> ${t("analytics.title")}</h2></div>
    <div id="analyticsContent"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;

  const content = document.getElementById("analyticsContent");
  try {
    const [data, txnData] = await Promise.all([
      api.get("/auctions/dashboard"),
      api.get("/wallet/transactions", { page: 1, pageSize: 100 }).catch(() => null),
    ]);

    const dash = data || {};
    const recent = dash.recentAuctions || dash.recent || [];
    const feeTxns = (txnData?.items || []).filter(t => t.type === "PlatformFee");
    const totalFees = feeTxns.reduce((s, t) => s + Math.abs(t.amount), 0);
    const wallet = await api.get("/wallet").catch(() => null);

    content.innerHTML = `
      <div class="grid grid-4" style="margin-bottom:24px">
        <div class="card" style="text-align:center;padding:20px">
          <i class="fas fa-gavel" style="font-size:1.8rem;color:var(--primary);margin-bottom:8px"></i>
          <div style="font-size:1.6rem;font-weight:700">${dash.totalAuctions ?? 0}</div>
          <div style="color:var(--text-muted);font-size:0.88rem">${t("analytics.totalAuctions")}</div>
        </div>
        <div class="card" style="text-align:center;padding:20px">
          <i class="fas fa-play-circle" style="font-size:1.8rem;color:var(--success);margin-bottom:8px"></i>
          <div style="font-size:1.6rem;font-weight:700">${dash.activeAuctions ?? 0}</div>
          <div style="color:var(--text-muted);font-size:0.88rem">${t("analytics.activeAuctions")}</div>
        </div>
        <div class="card" style="text-align:center;padding:20px">
          <i class="fas fa-check-circle" style="font-size:1.8rem;color:var(--warning);margin-bottom:8px"></i>
          <div style="font-size:1.6rem;font-weight:700">${dash.finishedAuctions ?? 0}</div>
          <div style="color:var(--text-muted);font-size:0.88rem">${t("analytics.finishedAuctions")}</div>
        </div>
        <div class="card" style="text-align:center;padding:20px">
          <i class="fas fa-hand-pointer" style="font-size:1.8rem;color:var(--info, #0ea5e9);margin-bottom:8px"></i>
          <div style="font-size:1.6rem;font-weight:700">${dash.totalBids ?? 0}</div>
          <div style="color:var(--text-muted);font-size:0.88rem">${t("analytics.totalBids")}</div>
        </div>
      </div>
      <div class="grid grid-2" style="margin-bottom:24px">
        <div class="card" style="text-align:center;padding:20px">
          <i class="fas fa-money-bill-wave" style="font-size:1.8rem;color:var(--success);margin-bottom:8px"></i>
          <div style="font-size:1.6rem;font-weight:700">${dash.totalRevenue != null ? formatPrice(dash.totalRevenue) : formatPrice(0)}</div>
          <div style="color:var(--text-muted);font-size:0.88rem">${t("analytics.totalRevenue")}</div>
        </div>
        <div class="card" style="text-align:center;padding:20px;border-left:3px solid var(--primary)">
          <i class="fas fa-percentage" style="font-size:1.8rem;color:var(--primary);margin-bottom:8px"></i>
          <div style="font-size:1.6rem;font-weight:700">${formatPrice(totalFees)}</div>
          <div style="color:var(--text-muted);font-size:0.88rem">${t("analytics.totalFees")}</div>
          <small style="color:var(--text-muted)">${wallet ? formatPrice(wallet.availableBalance) + " " + t("analytics.availableInWallet") : ""}</small>
        </div>
      </div>
      ${feeTxns.length > 0 ? `
      <div class="card" style="margin-top:16px">
        <h3 style="margin-bottom:12px">${t("analytics.feeIncome")}</h3>
        <div class="table-responsive"><table class="table"><thead><tr><th>${t("wallet.date")}</th><th>${t("wallet.amount")}</th><th>${t("wallet.description")}</th></tr></thead><tbody>${feeTxns.map(t => `<tr><td>${formatDate(t.createdAt)}</td><td style="font-weight:600">${formatPrice(t.amount)}</td><td>${escapeHtml(t.description || "")}</td></tr>`).join("")}</tbody></table></div>
      </div>` : ''}
      ${recent.length > 0 ? `
      <div class="card" style="margin-top:16px">
        <h3 style="margin-bottom:12px">${t("analytics.recentAuctions")}</h3>
        <div class="table-responsive"><table class="table"><thead><tr><th>${t("common.title") || "Title"}</th><th>${t("auctionRequests.status")}</th><th>${t("analytics.startingPrice")}</th><th>${t("analytics.currentPrice")}</th><th>${t("analytics.bidCount")}</th><th>${t("analytics.endTime")}</th></tr></thead><tbody>${recent.map(a => `<tr><td>${escapeHtml(a.title || a.productName || '-')}</td><td><span class="${statusClass(a.status)}">${tStatus(a.status, "auction")}</span></td><td>${formatPrice(a.startingPrice || 0)}</td><td>${formatPrice(a.currentPrice || a.startingPrice || 0)}</td><td>${a.bidCount ?? 0}</td><td>${a.endTime ? formatDate(a.endTime) : '-'}</td></tr>`).join("")}</tbody></table></div>
      </div>` : ''}`;
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><i class="fas fa-chart-bar"></i><h3>${t("analytics.noData")}</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}
