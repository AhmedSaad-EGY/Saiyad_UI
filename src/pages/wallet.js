import { requireAuth } from '../features/auth/login.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { showToast } from '../widgets/ui/toast.js';
import { t } from '../app/i18n.js';

import { fetchWalletBalance, fetchWalletTransactions, topUpWallet, extractBalance, extractTransactions, validateDepositAmount } from '../features/wallet/wallet.js';

import {
  renderWalletShell,
  renderTransactions,
  renderTransactionsError,
  openTopUpModal,
  closeTopUpModal,
} from '../widgets/wallet/index.js';

export default async function renderWallet(container) {
  if (!(await requireAuth())) return;

  setPageMeta(t('wallet.title'), t('wallet.metaDesc'), true);

  container.innerHTML = renderWalletShell();

  document.getElementById('topUpBtn').addEventListener('click', openTopUpModal);
  document.getElementById('topUpCloseBtn').addEventListener('click', closeTopUpModal);
  document.getElementById('topUpCancelBtn').addEventListener('click', closeTopUpModal);
  document.getElementById('topUpConfirmBtn').addEventListener('click', handleTopUp);
  document.getElementById('topUpModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('topUpModalOverlay')) closeTopUpModal();
  });

  loadWalletBalance();
  loadWalletTransactions();
}

async function loadWalletBalance() {
  try {
    const res = await fetchWalletBalance();
    document.getElementById('walletBalanceAmount').textContent = extractBalance(res);
  } catch {
    document.getElementById('walletBalanceAmount').textContent = '—';
    showToast(t('wallet.loadError'), 'error');
  }
}

async function loadWalletTransactions() {
  const container = document.getElementById('walletTransactionsContainer');
  try {
    const res = await fetchWalletTransactions(1, 20);
    container.setAttribute('aria-busy', 'false');
    container.innerHTML = renderTransactions(extractTransactions(res));
  } catch {
    container.innerHTML = renderTransactionsError();
  }
}

async function handleTopUp() {
  const input  = document.getElementById('topUpAmount');
  const errEl  = document.getElementById('topUpAmountError');
  const btn    = document.getElementById('topUpConfirmBtn');
  const amount = parseFloat(input.value);

  errEl.classList.add('hidden');
  errEl.textContent = '';

  const validation = validateDepositAmount(amount);
  if (!validation.valid) {
    errEl.textContent = validation.message;
    errEl.classList.remove('hidden');
    input.focus();
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ${t('common.processing')}`;

  try {
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


