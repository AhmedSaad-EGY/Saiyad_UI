import { KEYS } from '../constants/storage-keys.js';
import { normalizeRoles, hasRole as subjectHasRole, hasAnyRole as subjectHasAnyRole } from './capabilities.js';

function readStoredUser() {
  const raw = localStorage.getItem(KEYS.USER);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    if (!user || typeof user !== 'object' || Array.isArray(user)) return null;
    return user;
  } catch {
    localStorage.removeItem(KEYS.USER);
    return null;
  }
}

export function getUser() {
  const u = readStoredUser();
  if (!u) return null;
  const roles = getRolesFromToken();
  return { ...u, role: roles[0] || null, roles };
}

function _decodeToken() {
  const token = sessionStorage.getItem(KEYS.ACCESS_TOKEN);
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

export function isAuthenticated() {
  const payload = _decodeToken();
  if (!payload) return false;
  if (payload.exp !== undefined && payload.exp !== null) {
    return payload.exp * 1000 > Date.now();
  }
  return false;
}

export function getRoleFromToken() {
  return getRolesFromToken()[0] || null;
}

export function getRolesFromToken() {
  const payload = _decodeToken();
  if (!payload) return [];
  const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    || payload.role || payload.roles;
  return normalizeRoles(role);
}

export function hasRole(role) {
  return subjectHasRole(getRolesFromToken(), role);
}

export function hasAnyRole(...roles) {
  return subjectHasAnyRole(getRolesFromToken(), roles.flat());
}
