// pages/wallet.js — Sayiad Wallet Page
// Following implementation plan TASK-C1 exactly.

import { api } from '../core/api/client.js';
import { getUser } from '../core/auth/index.js';
import { setPageMeta } from '../core/utils/seo.js';
import { showToast } from '../core/utils/ui.js';
import { t } from '../core/i18n/index.js';

function initWalletPage() {
  const app = document.getElementById('app');

  // ── Role guard: must be logged in ──────────────────────────────────────────
  const user = getUser();
  if (!user) { window.location.hash = '#/login'; return; }

  setPageMeta(t('wallet.title') || 'My Wallet', t('wallet.metaDesc') || 'Manage your Sayiad wallet balance and transactions.', true);

  app.innerHTML = `
    <section class="wallet-page" aria-label="Wallet">
      <div class="container">

        <header class="wallet-header">
          <h1 data-i18n="wallet_title">My Wallet</h1>
        </header>

        <div class="wallet-balance-card" id="walletBalanceCard">
          <div class="wallet-balance-label" data-i18n="wallet_balance">Available Balance</div>
          <div class="wallet-balance-amount" id="walletBalanceAmount" aria-live="polite">
            <span aria-busy="true" data-i18n="loading">Loading…</span>
          </div>
          <div class="wallet-balance-currency">EGP</div>
          <button class="btn btn-primary" id="topUpBtn" data-i18n="wallet_topup">
            <i class="fas fa-plus-circle" aria-hidden="true"></i> Top Up
          </button>
          <p class="wallet-payment-note" style="font-size:0.75rem;opacity:0.55;margin-top:0.5rem">
            <i class="fas fa-info-circle" aria-hidden="true"></i>
            <span data-i18n="wallet_payment_note">Top-up requests are processed manually within 24 hours.</span>
          </p>
        </div>

        <section class="wallet-transactions-section" aria-labelledby="txHeading">
          <h2 id="txHeading" data-i18n="wallet_history">Transaction History</h2>
          <div id="walletTransactionsContainer" aria-live="polite" aria-busy="true">
            <div class="loading-spinner" role="status" aria-label="Loading transactions">
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
          <h2 id="topUpModalTitle" data-i18n="wallet_topup_title">Top Up Wallet</h2>
          <button class="modal-close-btn" id="topUpCloseBtn" aria-label="Close top up modal">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="topUpAmount" data-i18n="wallet_amount_label">Amount (EGP)</label>
            <input type="number" id="topUpAmount" min="10" max="50000"
                   placeholder="Minimum EGP 10" class="form-control"
                   aria-describedby="topUpAmountError" />
            <span class="field-error hidden" id="topUpAmountError" role="alert"></span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="topUpCancelBtn" data-i18n="cancel">Cancel</button>
          <button class="btn btn-primary"   id="topUpConfirmBtn" data-i18n="wallet_confirm_topup">
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
    if (e.key === 'Escape') { closeTopUpModal(); document.removeEventListener('keydown', onEsc); }
  }
  document.addEventListener('keydown', onEsc);
}

function closeTopUpModal() {
  const modal = document.querySelector("#topUpModalOverlay .modal");
  if (modal && modal._trapFocus) {
    modal.removeEventListener("keydown", modal._trapFocus);
    delete modal._trapFocus;
  }
  document.body.style.overflow = "";
  document.getElementById('topUpModalOverlay').classList.remove('show');
  document.body.classList.remove('modal-open');
  document.getElementById('topUpAmount').value = '';
  const errEl = document.getElementById('topUpAmountError');
  if (errEl) { errEl.classList.add('hidden'); errEl.textContent = ''; }
  const btn = document.getElementById('topUpConfirmBtn');
  if (btn) { btn.disabled = false; btn.innerHTML = t('wallet.confirmTopUp') || 'Confirm Top Up'; }
}

async function loadWalletBalance() {
  try {
    const res = await api.get('/wallet');
    const amount = res?.balance ?? res?.amount ?? res?.data?.balance ?? 0;
    document.getElementById('walletBalanceAmount').textContent =
      Number(amount).toLocaleString('ar-EG', { minimumFractionDigits: 2 });
  } catch {
    document.getElementById('walletBalanceAmount').textContent = '—';
    showToast('Failed to load balance. Please refresh.', 'error');
  }
}

async function loadWalletTransactions() {
  const container = document.getElementById('walletTransactionsContainer');
  try {
    const res = await api.get('/wallet/transactions', { page: 1, pageSize: 20 });
    const txs = Array.isArray(res) ? res : (res?.data ?? res?.transactions ?? res?.items ?? []);

    if (!txs.length) {
      container.setAttribute('aria-busy', 'false');
      container.innerHTML = `
        <div class="empty-state" role="status">
          <div class="empty-state__icon" aria-hidden="true"><i class="fas fa-receipt" aria-hidden="true"></i></div>
          <h3 class="empty-state__title" data-i18n="wallet_no_transactions">No transactions yet</h3>
          <p class="empty-state__desc" data-i18n="wallet_no_transactions_desc">
            Your transaction history will appear here.
          </p>
        </div>`;
      return;
    }

    container.setAttribute('aria-busy', 'false');
    container.innerHTML = `
      <div class="table-responsive" role="region" aria-label="Transaction history" tabindex="0">
        <table class="data-table">
          <caption class="sr-only">Wallet transaction history</caption>
          <thead>
            <tr>
              <th scope="col" data-i18n="wallet_col_date">Date</th>
              <th scope="col" data-i18n="wallet_col_type">Type</th>
              <th scope="col" data-i18n="wallet_col_desc">Description</th>
              <th scope="col" data-i18n="wallet_col_amount">Amount (EGP)</th>
              <th scope="col" data-i18n="wallet_col_status">Status</th>
            </tr>
          </thead>
          <tbody>
            ${txs.map(tx => `
              <tr>
                <td>${new Date(tx.date ?? tx.createdAt ?? tx.created_at).toLocaleDateString('en-EG')}</td>
                <td><span class="tx-type tx-type-${(tx.type ?? 'other').toLowerCase()}">${escapeHTML(tx.type ?? '—')}</span></td>
                <td>${escapeHTML(tx.description ?? tx.desc ?? '—')}</td>
                <td class="${(tx.amount ?? 0) >= 0 ? 'tx-positive' : 'tx-negative'}">
                  ${(tx.amount ?? 0) >= 0 ? '+' : ''}${Number(tx.amount ?? 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                </td>
                <td><span class="status-badge status-${(tx.status ?? 'pending').toLowerCase()}">${escapeHTML(tx.status ?? 'Pending')}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch {
    container.innerHTML = `
      <div class="error-state" role="alert">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        <p data-i18n="wallet_load_error">Failed to load transactions. Please try again.</p>
        <button class="btn btn-secondary" onclick="loadWalletTransactions()" data-i18n="retry">Retry</button>
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
    errEl.textContent = t('wallet.minAmountError') || 'Please enter a valid amount (minimum EGP 10)';
    errEl.classList.remove('hidden');
    input.focus();
    return;
  }
  if (amount > 50000) {
    errEl.textContent = t('wallet.maxAmountError') || 'Maximum top-up is EGP 50,000';
    errEl.classList.remove('hidden');
    input.focus();
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ${t('common.processing') || 'Processing…'}`;

  try {
    // PAYMENT GATEWAY NOTE: Until Fawry/InstaPay is integrated,
    // top-up is handled as a manual/admin-credited operation.
    // The button will show a pending confirmation instead of instant credit.
    await api.post('/wallet/deposit', { amount });
    closeTopUpModal();
    showToast(t('wallet.topUpSuccess') || 'Wallet topped up successfully!', 'success');
    loadWalletBalance();
    loadWalletTransactions();
  } catch (err) {
    errEl.textContent = err?.message ?? (t('wallet.topUpFailed') || 'Top up failed. Please try again.');
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = t('wallet.confirmTopUp') || 'Confirm Top Up';
  }
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export default initWalletPage;
