import { api } from '../../shared/api/client.js';
import { showToast } from '../../shared/utils/ui.js';
import { t } from '../../shared/utils/i18n.js';

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

export function extractBalance(res) {
  const amount = res?.balance ?? res?.amount ?? res?.data?.balance ?? 0;
  return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
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
  try {
    return await api.get('/wallet/transactions', { page, pageSize });
  } catch { return []; }
}

export async function topUpWallet(amount) {
  try {
    const data = await api.post('/wallet/deposit', { amount });
    showToast(t('wallet.topUpSuccess'), 'success');
    return data;
  } catch (err) {
    showToast(err.message || t('common.error'), 'error');
    return null;
  }
}
