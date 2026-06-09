import { KEYS } from '../constants/storage-keys.js';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.USER));
  } catch { return null; }
}

export function isAuthenticated() {
  return !!localStorage.getItem(KEYS.ACCESS_TOKEN);
}

export function getRoleFromToken() {
  const token = localStorage.getItem(KEYS.ACCESS_TOKEN);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      || payload.role || payload.roles;
    return Array.isArray(role) ? role[0] : role;
  } catch { return null; }
}

export function hasRole(role) {
  const user = getUser();
  return (user && user.role === role) || getRoleFromToken() === role;
}

export function hasAnyRole(...roles) {
  return roles.some(r => hasRole(r));
}
