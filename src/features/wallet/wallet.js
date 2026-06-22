import { api } from '../../shared/api/client.js';
import { showToast } from '../../shared/utils/ui.js';
import { t } from '../../shared/utils/i18n.js';
import { formatPrice } from '../../shared/utils/format.js';

export const MIN_DEPOSIT = 10;
export const MAX_DEPOSIT = 50000;

export function validateDepositAmount(amount) {
  if (!amount || isNaN(amount) || amount < MIN_DEPOSIT) {
    return { valid: false, message: t('wallet.minAmountError') };
  }
  if (amount > MAX_DEPOSIT) {
    return { valid: false, message: t('wallet.maxAmountError') };
  }
  return { valid: true };
}

export function validateWithdrawAmount(amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, message: t('wallet.withdrawAmountError') };
  }
  return { valid: true };
}

export function extractBalance(res) {
  const amount = res?.availableBalance ?? res?.available ?? res?.data?.availableBalance;
  return amount != null ? formatPrice(amount) : null;
}

export function extractTransactions(res) {
  return Array.isArray(res) ? res : (res?.data ?? res?.transactions ?? res?.items ?? []);
}

export async function fetchWalletBalance() {
  try {
    return await api.get('/wallet');
  } catch { return null; }
}

export async function fetchWalletTransactions(page = 1, pageSize = 20) {
  return api.get('/wallet/transactions', { page, pageSize });
}

export async function topUpWallet(amount) {
  const data = await api.post('/wallet/deposit', { amount });
  showToast(t('wallet.topUpSuccess'), 'success');
  return data;
}

export async function withdrawWallet(amount) {
  const data = await api.post('/wallet/withdraw', { amount });
  showToast(t('wallet.withdrawSuccess'), 'success');
  return data;
}
