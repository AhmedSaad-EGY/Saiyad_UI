import { ECOMMERCE_ROLES, ROLES } from '../../shared/constants/roles.js';

export function getWalletCapabilities(user) {
  const role = user?.role;
  if (role === ROLES.ADMIN) return { canDeposit: false, canWithdraw: true };
  if (ECOMMERCE_ROLES.includes(role)) return { canDeposit: true, canWithdraw: true };
  return { canDeposit: false, canWithdraw: false };
}
