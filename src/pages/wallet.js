import { requireAuth } from '../features/auth/login.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { showToast } from '../widgets/ui/toast.js';
import { t } from '../shared/utils/i18n.js';
import { formatPrice } from '../shared/utils/format.js';
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
import { getWalletCapabilities } from '../shared/utils/capabilities.js';

import {
  renderWalletShell,
  renderTransactions,
  renderTransactionsError,
  renderLoadMoreButton,
  openWalletActionModal,
  closeWalletActionModal,
  setWalletActionPending,
  showWalletActionError,
} from '../widgets/wallet/index.js';

let _txPage = 1;
let _txTotalCount = 0;
let _txLoading = false;
let _txAllItems = [];
const TX_PAGE_SIZE = 20;

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
    const formatted = extractBalance(res);
    document.getElementById('walletBalanceAmount').textContent = formatted ?? '—';
    updateBreakdown(res);
  } catch {
    document.getElementById('walletBalanceAmount').textContent = '—';
    showToast(t('wallet.loadError'), 'error');
  }
}

function updateBreakdown(res) {
  const update = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val != null ? formatPrice(val) : '—';
  };
  update('walletTotalBalance', res?.balance);
  update('walletHeldBalance', res?.heldBalance);
}

async function loadWalletTransactions(page = 1) {
  try {
    _txPage = page;
    const res = await fetchWalletTransactions(page, TX_PAGE_SIZE);
    const container = document.getElementById('walletTransactionsContainer');
    if (!container) return;

    _txTotalCount = res?.totalCount ?? 0;
    const items = extractTransactions(res);

    if (page === 1) {
      _txAllItems = items;
    } else {
      const existingIds = new Set(_txAllItems.map(i => i.id));
      for (const item of items) {
        if (item.id != null && !existingIds.has(item.id)) {
          _txAllItems.push(item);
          existingIds.add(item.id);
        }
      }
    }

    container.setAttribute('aria-busy', 'false');
    const hasMore = _txAllItems.length < _txTotalCount;
    container.innerHTML = renderTransactions(_txAllItems) + renderLoadMoreButton({ hasMore, loading: false });
    document.getElementById('walletLoadMoreBtn')?.addEventListener('click', loadMoreTransactions);
  } catch {
    const container = document.getElementById('walletTransactionsContainer');
    if (!container) return;
    container.innerHTML = renderTransactionsError();
    document.getElementById("txnRetryBtn")?.addEventListener("click", () => loadWalletTransactions(_txPage));
  }
}

async function loadMoreTransactions() {
  if (_txLoading || _txAllItems.length >= _txTotalCount) return;

  const container = document.getElementById('walletTransactionsContainer');
  if (!container) return;

  _txLoading = true;
  container.innerHTML = renderTransactions(_txAllItems) + renderLoadMoreButton({ hasMore: true, loading: true });
  try {
    await loadWalletTransactions(_txPage + 1);
  } finally {
    // eslint-disable-next-line require-atomic-updates
    _txLoading = false;
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


