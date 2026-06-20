import { APP_CONFIG } from '../api/config.js';

const ABSOLUTE_MEDIA_PATTERN = /^(?:https?:|data:|blob:|\/\/)/i;

export function resolveMediaUrl(value) {
  const url = String(value || '').trim();
  if (!url || ABSOLUTE_MEDIA_PATTERN.test(url)) return url;

  const apiPath = url.startsWith('/api/')
    ? url
    : url.startsWith('api/')
      ? `/${url}`
      : null;
  if (!apiPath) return url;

  try {
    const frontendOrigin = globalThis.location?.origin || 'http://localhost';
    const backendOrigin = new URL(APP_CONFIG.apiBaseUrl, frontendOrigin).origin;
    return new URL(apiPath, backendOrigin).toString();
  } catch {
    return url;
  }
}
