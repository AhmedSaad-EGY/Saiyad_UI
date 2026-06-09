import { t } from '../../shared/utils/i18n.js';

export function renderWalletShell() {
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
          <div class="wallet-balance-currency">EGP</div>
          <button class="btn btn-primary" id="topUpBtn" data-i18n="wallet.deposit">
            <i class="fas fa-plus-circle" aria-hidden="true"></i> Top Up
          </button>
          <p class="wallet-payment-note" style="font-size:0.75rem;opacity:0.55;margin-top:0.5rem">
            <i class="fas fa-info-circle" aria-hidden="true"></i>
            <span data-i18n="wallet.paymentNote">Top-up requests are processed manually within 24 hours.</span>
          </p>
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

    <div class="modal-overlay" id="topUpModalOverlay"
         role="dialog" aria-modal="true" aria-labelledby="topUpModalTitle">
      <div class="modal modal-confirm">
        <div class="modal-header">
          <h2 id="topUpModalTitle" data-i18n="wallet.topUpTitle">Top Up Wallet</h2>
          <button class="modal-close-btn" id="topUpCloseBtn" aria-label="${t('wallet.closeTopUp')}">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="topUpAmount" data-i18n="wallet.amountLabel">Amount (EGP)</label>
            <input type="number" id="topUpAmount" min="10" max="50000"
                   placeholder="${t('wallet.minimumDeposit')}" class="form-control"
                   aria-describedby="topUpAmountError" />
            <span class="field-error hidden" id="topUpAmountError" role="alert"></span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="topUpCancelBtn" data-i18n="common.cancel">Cancel</button>
          <button class="btn btn-primary"   id="topUpConfirmBtn" data-i18n="wallet.confirmTopUp">
            Confirm Top Up
          </button>
        </div>
      </div>
    </div>`;
}
