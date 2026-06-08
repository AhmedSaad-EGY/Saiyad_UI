import { t } from '../../app/i18n.js';
import { showLoading, showError, escapeHtml } from '../../shared/utils/dom.js';
import { formatPrice, formatDate } from '../../shared/utils/format.js';
import { fetchWallet, fetchWalletTransactions } from '../../features/admin/index.js';

export async function renderRevenue(container) {
  showLoading(container);
  try {
    const [wallet, txns] = await Promise.all([
      fetchWallet(),
      fetchWalletTransactions(1, 100),
    ]);

    const items = txns.items || txns.data || [];
    const feeTxns = items.filter(txn => txn.type === "PlatformFee" || txn.type === "SubscriptionPayment");
    const totalFees = feeTxns.reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

    container.innerHTML = `
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card card-sm text-center">
            <small class="text-muted">${t("admin.platformBalance")}</small>
            <div class="fs-4 fw-bold">${formatPrice(wallet.balance || 0)}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-sm text-center">
            <small class="text-muted">${t("wallet.held")}</small>
            <div class="fs-4 fw-bold">${formatPrice(wallet.heldBalance || 0)}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-sm text-center">
            <small class="text-muted">${t("wallet.available")}</small>
            <div class="fs-4 fw-bold">${formatPrice(wallet.availableBalance || 0)}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-sm text-center" class="border-start border-3 border-primary">
            <small class="text-muted">${t("admin.totalFees")}</small>
            <div class="fs-4 fw-bold text-primary">${formatPrice(totalFees)}</div>
          </div>
        </div>
      </div>
      <h3 class="mb-2">${t("admin.feeIncome")}</h3>
      <div class="table-wrapper">
        <table class="table">
          <caption class="text-muted mt-2 caption-meta">${t("admin.feeIncome")}</caption>
          <thead><tr>
            <th scope="col">${t("admin.id")}</th>
            <th scope="col">${t("wallet.type")}</th>
            <th scope="col">${t("wallet.amount")}</th>
            <th scope="col">Reference</th>
            <th scope="col">${t("wallet.description")}</th>
            <th scope="col">${t("dash.date")}</th>
          </tr></thead>
          <tbody>
            ${feeTxns.length ? feeTxns.map(txn => `
              <tr>
                <td>${txn.id}</td>
                <td><span class="status ${txn.type === "PlatformFee" ? "status-available" : "status-pending"}">${txn.type}</span></td>
                <td class="fw-semibold">${formatPrice(txn.amount)}</td>
                <td>-</td>
                <td>${escapeHtml(txn.description || "-")}</td>
                <td>${formatDate(txn.createdAt)}</td>
              </tr>
            `).join("") : `<tr><td colspan="6" class="text-center p-4 text-muted">
              <div class="empty-state-inline">
                <i class="fas fa-chart-line mb-2 opacity-50" style="font-size:2rem" aria-hidden="true"></i>
                <p class="mb-0">${t("admin.noFees")}</p>
              </div>
            </td></tr>`}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    showError(container, err.message);
  }
}
