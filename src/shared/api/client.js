import { APP_CONFIG } from './config.js';
import { emit } from '../utils/events.js';
import { getCsrfToken } from '../utils/csrf.js';
import { KEYS } from '../constants/storage-keys.js';

const _pendingRequests = new Map();

export function getAccessToken() {
  return sessionStorage.getItem(KEYS.ACCESS_TOKEN) || null;
}

export function setAccessToken(token) {
  if (token) sessionStorage.setItem(KEYS.ACCESS_TOKEN, token);
  else sessionStorage.removeItem(KEYS.ACCESS_TOKEN);
}

export function clearTokens() {
  sessionStorage.removeItem(KEYS.ACCESS_TOKEN);
  localStorage.removeItem(KEYS.USER);
  localStorage.removeItem(KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem(KEYS.REFRESH_TOKEN);
}

async function parseResponse(res) {
  const text = await res.text();
  if (!text) return null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json") || /^[[{]/.test(text.trim())) {
    try {
      return JSON.parse(text);
    } catch {
      if (!res.ok) return { message: text };
      throw new Error("Invalid JSON response from server.");
    }
  }
  return res.ok ? text : { message: text };
}

function getCsrfHeader(method) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return {};
  const csrfToken = getCsrfToken();
  return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
}

async function request(endpoint, options = {}) {
  const token = getAccessToken();
  const method = options.method || 'GET';
  const headers = { 'Content-Type': 'application/json', ...getCsrfHeader(method), ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const { signal, ...fetchOptions } = options;

  let res;
  try {
    res = await fetch(`${APP_CONFIG.apiBaseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: "include",
      signal: signal || undefined,
    });
  } catch {
    throw new Error("Network error. Please check your connection.");
  }

  if (res.status === 401 && !options._retry && !endpoint.includes("/auth/login")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request(endpoint, { ...options, _retry: true });
    }
    clearTokens();
    emit('auth:session-expired');
    throw new Error("Session expired. Please log in again.");
  }

  const data = await parseResponse(res);

  if (res.status === 400 && !options._csrfRetry && data?.message === "Invalid or missing anti-forgery token.") {
    await ensureCsrfToken();
    return request(endpoint, { ...options, _csrfRetry: true });
  }

  if (!res.ok) {
    let msg =
      data?.message ||
      data?.title ||
      data?.detail ||
      `Request failed (${res.status})`;
    if (data?.errors) {
      const details = Object.values(data.errors).flat().join("; ");
      if (details) msg += `: ${  details}`;
    }
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    if (res.status !== 401) emit('api:error', { err });
    throw err;
  }
  return data;
}

/**
 * Wraps request() with deduplication: concurrent identical requests
 * share the same pending promise to reduce duplicate network calls.
 * Only GET requests are deduplicated (mutations are never safe to dedup).
 */
async function requestWithDedup(endpoint, options = {}) {
  const method = options.method || 'GET';
  const dedupKey = `${method}:${endpoint}`;

  if (method === 'GET' && !options._retry) {
    if (_pendingRequests.has(dedupKey)) {
      return _pendingRequests.get(dedupKey);
    }
    let promise;
    try {
      promise = request(endpoint, options);
    } catch (e) {
      _pendingRequests.delete(dedupKey);
      throw e;
    }
    promise = promise.finally(() => {
      if (_pendingRequests.get(dedupKey) === promise) {
        _pendingRequests.delete(dedupKey);
      }
    });
    _pendingRequests.set(dedupKey, promise);
    return promise;
  }

  return request(endpoint, options);
}

function buildQuery(params) {
  const q = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return q ? `?${q}` : "";
}

async function doUpload(url, formData, _retry = false) {
  const token = getAccessToken();
  const headers = { ...getCsrfHeader('POST') };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${APP_CONFIG.apiBaseUrl}${url}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });
  } catch {
    throw new Error("Network error. Please check your connection.");
  }
  if (res.status === 401 && !_retry && !url.includes("/auth/login")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return doUpload(url, formData, true);
    }
    clearTokens();
    emit('auth:session-expired');
    throw new Error("Session expired. Please log in again.");
  }
  const data = await parseResponse(res);
  if (!res.ok) {
    const msg =
      data?.message ||
      data?.title ||
      data?.detail ||
      `Upload failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (url, params) => requestWithDedup(url + buildQuery(params || {})),
  post: (url, body) =>
    requestWithDedup(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url, body) =>
    requestWithDedup(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: (url, body) =>
    requestWithDedup(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url) => requestWithDedup(url, { method: "DELETE" }),
  abort: () => new AbortController(),
  upload: (url, formData) => doUpload(url, formData),
};

let _refreshPromise = null;

async function refreshAccessToken() {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = _doRefresh().finally(() => { _refreshPromise = null; });
  return _refreshPromise;
}

async function _doRefresh() {
  try {
    const data = await request('/auth/refresh', { method: "POST", _retry: true });
    setAccessToken(data.token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}
