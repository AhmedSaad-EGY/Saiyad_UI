import { requireAuth } from '../features/auth/login.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { showToast } from '../widgets/ui/toast.js';
import { t } from '../app/i18n.js';

import { fetchWalletBalance, fetchWalletTransactions, topUpWallet } from '../features/wallet/wallet.js';

export default async function renderWallet(container) {
  if (!(await requireAuth())) return;

  setPageMeta(t('wallet.title'), t('wallet.metaDesc'), true);

  container.innerHTML = `
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

    <!-- ── Top-Up Modal ──────────────────────────────────────────────────── -->
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

  // ── Wire events ─────────────────────────────────────────────────────────────
  document.getElementById('topUpBtn').addEventListener('click', openTopUpModal);
  document.getElementById('topUpCloseBtn').addEventListener('click', closeTopUpModal);
  document.getElementById('topUpCancelBtn').addEventListener('click', closeTopUpModal);
  document.getElementById('topUpConfirmBtn').addEventListener('click', handleTopUp);
  document.getElementById('topUpModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('topUpModalOverlay')) closeTopUpModal();
  });

  // ── Load data ────────────────────────────────────────────────────────────────
  loadWalletBalance();
  loadWalletTransactions();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function openTopUpModal() {
  const overlay = document.getElementById('topUpModalOverlay');
  overlay.classList.add('show');
  document.body.classList.add('modal-open');
  document.getElementById('topUpAmount').focus();

  // Trap focus inside modal
  const modal = document.querySelector("#topUpModalOverlay .modal");
  if (modal) {
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function trapFocus(e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    modal._trapFocus = trapFocus;
    modal.addEventListener("keydown", trapFocus);
  }
  document.body.style.overflow = "hidden";

  // Close on Escape
  function onEsc(e) {
    if (e.key === 'Escape') closeTopUpModal();
  }
  modal._closeEsc = onEsc;
  document.addEventListener('keydown', onEsc);
}

function closeTopUpModal() {
  const modal = document.querySelector("#topUpModalOverlay .modal");
  if (modal) {
    if (modal._trapFocus) {
      modal.removeEventListener("keydown", modal._trapFocus);
      delete modal._trapFocus;
    }
    if (modal._closeEsc) {
      document.removeEventListener('keydown', modal._closeEsc);
      delete modal._closeEsc;
    }
  }
  document.body.style.overflow = "";
  document.getElementById('topUpModalOverlay').classList.remove('show');
  document.body.classList.remove('modal-open');
  document.getElementById('topUpAmount').value = '';
  const errEl = document.getElementById('topUpAmountError');
  if (errEl) { errEl.classList.add('hidden'); errEl.textContent = ''; }
  const btn = document.getElementById('topUpConfirmBtn');
  if (btn) { btn.disabled = false; btn.innerHTML = t('wallet.confirmTopUp'); }
}

async function loadWalletBalance() {
  try {
    const res = await fetchWalletBalance();
    const amount = res?.balance ?? res?.amount ?? res?.data?.balance ?? 0;
    document.getElementById('walletBalanceAmount').textContent =
      Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
  } catch {
    document.getElementById('walletBalanceAmount').textContent = '—';
    showToast(t('wallet.loadError'), 'error');
  }
}

async function loadWalletTransactions() {
  const container = document.getElementById('walletTransactionsContainer');
  try {
    const res = await fetchWalletTransactions(1, 20);
    const txs = Array.isArray(res) ? res : (res?.data ?? res?.transactions ?? res?.items ?? []);

    if (!txs.length) {
      container.setAttribute('aria-busy', 'false');
      container.innerHTML = `
        <div class="empty-state" role="status">
          <div class="empty-state__icon" aria-hidden="true"><i class="fas fa-receipt" aria-hidden="true"></i></div>
          <h3 class="empty-state__title" data-i18n="wallet.noTransactions">No transactions yet</h3>
          <p class="empty-state__desc" data-i18n="wallet.noTransactionsDesc">
            Your transaction history will appear here.
          </p>
        </div>`;
      return;
    }

    container.setAttribute('aria-busy', 'false');
    container.innerHTML = `
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
                <td><span class="tx-type tx-type-${(tx.type ?? 'other').toLowerCase()}">${escapeHTML(tx.type ?? '—')}</span></td>
                <td>${escapeHTML(tx.description ?? tx.desc ?? '—')}</td>
                <td class="${(tx.amount ?? 0) >= 0 ? 'tx-positive' : 'tx-negative'}">
                  ${(tx.amount ?? 0) >= 0 ? '+' : ''}${Number(tx.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td><span class="status-badge status-${(tx.status ?? 'pending').toLowerCase()}">${escapeHTML(tx.status ?? '')}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch {
    container.innerHTML = `
      <div class="error-state" role="alert">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        <p data-i18n="wallet.loadError">Failed to load transactions. Please try again.</p>
        <button class="btn btn-secondary" onclick="loadWalletTransactions()" data-i18n="common.retry">Retry</button>
      </div>`;
  }
}

async function handleTopUp() {
  const input  = document.getElementById('topUpAmount');
  const errEl  = document.getElementById('topUpAmountError');
  const btn    = document.getElementById('topUpConfirmBtn');
  const amount = parseFloat(input.value);

  errEl.classList.add('hidden');
  errEl.textContent = '';

  if (!amount || isNaN(amount) || amount < 10) {
    errEl.textContent = t('wallet.minAmountError');
    errEl.classList.remove('hidden');
    input.focus();
    return;
  }
  if (amount > 50000) {
    errEl.textContent = t('wallet.maxAmountError');
    errEl.classList.remove('hidden');
    input.focus();
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ${t('common.processing')}`;

  try {
    // PAYMENT GATEWAY NOTE: Until Fawry/InstaPay is integrated,
    // top-up is handled as a manual/admin-credited operation.
    // The button will show a pending confirmation instead of instant credit.
    await topUpWallet(amount);
    closeTopUpModal();
    loadWalletBalance();
    loadWalletTransactions();
  } catch (err) {
    errEl.textContent = err?.message ?? t('wallet.topUpFailed');
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = t('wallet.confirmTopUp');
  }
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}


