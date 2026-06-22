import { t } from '../../shared/utils/i18n.js';

export function renderWalletShell({ canDeposit = false, canWithdraw = false } = {}) {
  const defaultMode = canDeposit ? 'deposit' : 'withdraw';
  const hasActions = canDeposit || canWithdraw;
  return `
    <section class="wallet-page" aria-label="${t('wallet.pageLabel')}">
      <div class="container">

        <header class="wallet-header">
          <h1 data-i18n="wallet.title">My Wallet</h1>
        </header>

        <div class="wallet-balance-card" id="walletBalanceCard">
          <div class="wallet-balance-label" data-i18n="wallet.available">Available Balance</div>
          <div class="wallet-balance-amount" id="walletBalanceAmount" aria-live="polite">
            <span aria-busy="true" data-i18n="common.loading">Loading…</span>
          </div>
          <div class="wallet-balance-breakdown" id="walletBalanceBreakdown">
            <div class="breakdown-row">
              <span data-i18n="wallet.balance">${t('wallet.balance')}</span>
              <span id="walletTotalBalance" aria-live="polite">—</span>
            </div>
            <div class="breakdown-row">
              <span data-i18n="wallet.held">${t('wallet.held')}</span>
              <span id="walletHeldBalance" aria-live="polite">—</span>
            </div>
          </div>
          ${hasActions ? `<div class="wallet-actions" aria-label="${t('wallet.actions')}">
            ${canDeposit ? `<button type="button" class="btn btn-primary" data-wallet-action="deposit">
              <i class="fas fa-plus-circle" aria-hidden="true"></i>
              <span>${t('wallet.deposit')}</span>
            </button>` : ''}
            ${canWithdraw ? `<button type="button" class="btn btn-outline wallet-withdraw-btn" data-wallet-action="withdraw">
              <i class="fas fa-arrow-up-from-bracket" aria-hidden="true"></i>
              <span>${t('wallet.withdraw')}</span>
            </button>` : ''}
          </div>` : ''}
          ${canDeposit ? `<p class="wallet-payment-note">
            <i class="fas fa-info-circle" aria-hidden="true"></i>
            <span>${t('wallet.paymentNote')}</span>
          </p>` : ''}
        </div>

        <section class="wallet-transactions-section" aria-labelledby="txHeading">
          <h2 id="txHeading" data-i18n="wallet.transactions">Transaction History</h2>
          <div id="walletTransactionsContainer" aria-live="polite" aria-busy="true">
            <div class="loading-spinner" role="status" aria-label="${t('wallet.loadingTransactions')}">
              <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
            </div>
          </div>
        </section>

      </div>
    </section>

    ${hasActions ? `<div class="modal-overlay wallet-action-overlay" id="walletActionModalOverlay"
         role="dialog" aria-modal="true" aria-labelledby="walletActionModalTitle" data-mode="${defaultMode}">
      <div class="modal wallet-action-modal">
        <div class="wallet-action-modal__header">
          <h2 id="walletActionModalTitle">${t(defaultMode === 'deposit' ? 'wallet.topUpTitle' : 'wallet.withdrawTitle')}</h2>
          <button type="button" class="modal-close-btn wallet-action-modal__close" id="walletActionCloseBtn" aria-label="${t('wallet.closeAction')}">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="wallet-action-modal__body">
          <div class="form-group">
            <label for="walletActionAmount">${t('wallet.amountLabel')}</label>
            <p class="wallet-action-modal__help" id="walletActionHelp">${t(defaultMode === 'deposit' ? 'wallet.topUpHelp' : 'wallet.withdrawHelp')}</p>
            <input type="number" id="walletActionAmount" inputmode="decimal" step="0.01"
                   class="form-control" aria-describedby="walletActionHelp walletActionAmountError" />
            <span class="field-error hidden" id="walletActionAmountError" role="alert"></span>
          </div>
        </div>
        <div class="wallet-action-modal__footer">
          <button type="button" class="btn btn-secondary" id="walletActionCancelBtn">${t('common.cancel')}</button>
          <button type="button" class="btn btn-primary" id="walletActionConfirmBtn">
            <span>${t(defaultMode === 'deposit' ? 'wallet.confirmTopUp' : 'wallet.confirmWithdraw')}</span>
          </button>
        </div>
      </div>
    </div>` : ''}`;
}
