import { requireAuth } from '../features/auth/login.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { showToast } from '../widgets/ui/toast.js';
import { t } from '../shared/utils/i18n.js';
import { getUser } from '../shared/utils/auth-state.js';
import { registerRouteCleanup } from '../app/router.js';

import {
  fetchWalletBalance,
  fetchWalletTransactions,
  topUpWallet,
  withdrawWallet,
  extractBalance,
  extractTransactions,
  validateDepositAmount,
  validateWithdrawAmount,
} from '../features/wallet/wallet.js';
import { getWalletCapabilities } from '../features/wallet/capabilities.js';

import {
  renderWalletShell,
  renderTransactions,
  renderTransactionsError,
  openWalletActionModal,
  closeWalletActionModal,
  setWalletActionPending,
  showWalletActionError,
} from '../widgets/wallet/index.js';

export default async function renderWallet(container) {
  if (!(await requireAuth())) return;

  setPageMeta(t('wallet.title'), t('wallet.metaDesc'), true);

  const capabilities = getWalletCapabilities(getUser());
  container.innerHTML = renderWalletShell(capabilities);

  document.querySelectorAll('[data-wallet-action]').forEach((button) => {
    button.addEventListener('click', () => openWalletActionModal(button.dataset.walletAction, button));
  });
  document.getElementById('walletActionCloseBtn')?.addEventListener('click', closeWalletActionModal);
  document.getElementById('walletActionCancelBtn')?.addEventListener('click', closeWalletActionModal);
  document.getElementById('walletActionConfirmBtn')?.addEventListener('click', handleWalletAction);
  document.getElementById('walletActionModalOverlay')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeWalletActionModal();
  });
  registerRouteCleanup(closeWalletActionModal);

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
  try {
    const res = await fetchWalletTransactions(1, 20);
    const container = document.getElementById('walletTransactionsContainer');
    if (!container) return;
    container.setAttribute('aria-busy', 'false');
    container.innerHTML = renderTransactions(extractTransactions(res));
  } catch {
    const container = document.getElementById('walletTransactionsContainer');
    if (!container) return;
    container.innerHTML = renderTransactionsError();
    document.getElementById("txnRetryBtn")?.addEventListener("click", loadWalletTransactions);
  }
}

async function handleWalletAction() {
  const confirmButton = document.getElementById('walletActionConfirmBtn');
  if (confirmButton?.disabled) return;
  const overlay = document.getElementById('walletActionModalOverlay');
  const input = document.getElementById('walletActionAmount');
  if (!overlay || !input) return;
  const mode = overlay.dataset.mode;
  const amount = parseFloat(input.value);
  const validation = mode === 'withdraw'
    ? validateWithdrawAmount(amount)
    : validateDepositAmount(amount);
  if (!validation.valid) {
    showWalletActionError(validation.message);
    return;
  }
  setWalletActionPending(true);
  try {
    if (mode === 'withdraw') await withdrawWallet(amount);
    else await topUpWallet(amount);
    closeWalletActionModal();
    loadWalletBalance();
    loadWalletTransactions();
  } catch (err) {
    showWalletActionError(err?.message || t('common.somethingWentWrong'));
  } finally {
    setWalletActionPending(false);
  }
}


