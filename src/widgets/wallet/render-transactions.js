import { t } from '../../shared/utils/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';

export function renderTransactions(txs) {
  if (!txs.length) {
    return `
      <div class="empty-state" role="status">
        <div class="empty-state__icon" aria-hidden="true"><i class="fas fa-receipt" aria-hidden="true"></i></div>
        <h3 class="empty-state__title" data-i18n="wallet.noTransactions">No transactions yet</h3>
        <p class="empty-state__desc" data-i18n="wallet.noTransactionsDesc">
          Your transaction history will appear here.
        </p>
      </div>`;
  }

  return `
    <div class="table-wrapper" role="region" aria-label="${t('wallet.transactionHistory')}" tabindex="0">
      <table class="table">
        <caption class="sr-only">Wallet transaction history</caption>
        <thead>
          <tr>
            <th scope="col" data-i18n="wallet.date">Date</th>
            <th scope="col" data-i18n="wallet.type">Type</th>
            <th scope="col" data-i18n="wallet.description">Description</th>
            <th scope="col" data-i18n="wallet.amount">Amount (EGP)</th>
            <th scope="col" data-i18n="wallet.colStatus">Status</th>
          </tr>
        </thead>
        <tbody>
          ${txs.map(tx => `
            <tr>
              <td>${new Date(tx.date ?? tx.createdAt ?? tx.created_at).toLocaleDateString('en-EG')}</td>
              <td><span class="tx-type tx-type-${(tx.type ?? 'other').toLowerCase()}">${escapeHtml(tx.type ?? '—')}</span></td>
              <td>${escapeHtml(tx.description ?? tx.desc ?? '—')}</td>
              <td class="${(tx.amount ?? 0) >= 0 ? 'tx-positive' : 'tx-negative'}">
                ${(tx.amount ?? 0) >= 0 ? '+' : ''}${Number(tx.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td><span class="status-badge status-${(tx.status ?? 'pending').toLowerCase()}">${escapeHtml(tx.status ?? '')}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

export function renderTransactionsError() {
  return `
    <div class="error-state" role="alert">
      <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
      <p data-i18n="wallet.loadError">Failed to load transactions. Please try again.</p>
      <button class="btn btn-secondary" onclick="loadWalletTransactions()" data-i18n="common.retry">Retry</button>
    </div>`;
}
