import { api } from '../../shared/api/client.js';
import { t } from '../../app/i18n.js';

export async function verifyEmail(token) {
  try {
    const data = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    sessionStorage.removeItem("pendingLoginEmail");
    return { success: true, message: data.message || t('auth.emailVerified') };
  } catch (err) {
    return { success: false, message: err.message || t('auth.verificationFailed') };
  }
}
