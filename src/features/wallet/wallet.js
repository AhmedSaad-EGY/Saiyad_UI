import { api } from '../../shared/api/client.js';
import { showToast } from '../../widgets/ui/toast.js';
import { t } from '../../app/i18n.js';

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
