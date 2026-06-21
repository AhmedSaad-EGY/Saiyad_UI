import { APP_CONFIG } from '../api/config.js';

const ABSOLUTE_MEDIA_PATTERN = /^(?:https?:|data:|blob:|\/\/)/i;
const MEDIA_URL_FIELDS = new Set([
  'avatarUrl',
  'image',
  'imageUrl',
  'primaryImageUrl',
  'productImageUrl',
  'profileImage',
  'sellerImage',
  'thumbnail',
  'thumbnailUrl',
]);
const MEDIA_COLLECTION_FIELDS = new Set(['additionalImages', 'images']);

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

function normalizeMediaCollection(value) {
  if (!Array.isArray(value)) return value;
  return value.map((item) => {
    if (typeof item === 'string') return resolveMediaUrl(item);
    if (!item || typeof item !== 'object') return item;
    const normalized = normalizeMediaUrls(item);
    if (typeof normalized.url === 'string') {
      normalized.url = resolveMediaUrl(normalized.url);
    }
    return normalized;
  });
}

export function normalizeMediaUrls(value) {
  if (Array.isArray(value)) return value.map((item) => normalizeMediaUrls(item));
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (MEDIA_URL_FIELDS.has(key)) {
      return [key, typeof item === 'string' ? resolveMediaUrl(item) : item];
    }
    if (MEDIA_COLLECTION_FIELDS.has(key)) return [key, normalizeMediaCollection(item)];
    if (Array.isArray(item) || (item && typeof item === 'object')) {
      return [key, normalizeMediaUrls(item)];
    }
    return [key, item];
  }));
}
