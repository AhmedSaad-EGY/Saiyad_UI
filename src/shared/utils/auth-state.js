import { KEYS } from '../constants/storage-keys.js';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.USER));
  } catch { return null; }
}

function _decodeToken() {
  const token = sessionStorage.getItem(KEYS.ACCESS_TOKEN);
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

export function isAuthenticated() {
  const payload = _decodeToken();
  if (!payload) return false;
  if (payload.exp) {
    return payload.exp * 1000 > Date.now();
  }
  return true;
}

export function getRoleFromToken() {
  const payload = _decodeToken();
  if (!payload) return null;
  const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    || payload.role || payload.roles;
  return Array.isArray(role) ? role[0] : role;
}

export function hasRole(role) {
  return getRoleFromToken() === role;
}

export function hasAnyRole(...roles) {
  return roles.some(r => hasRole(r));
}
