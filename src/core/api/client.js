import { APP_CONFIG } from './config.js';
import { emit } from '../events/bus.js';
import { getCsrfToken } from '../utils/csrf.js';

const _pendingRequests = new Map();

let _cachedAccessToken = localStorage.getItem('accessToken') || null;

export function getAccessToken() {
  return _cachedAccessToken || localStorage.getItem('accessToken');
}

export function setAccessToken(token) {
  _cachedAccessToken = token;
  if (token) localStorage.setItem('accessToken', token);
  else localStorage.removeItem('accessToken');
}

export function clearTokens() {
  _cachedAccessToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
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

  if (!res.ok) {
    let msg =
      data?.message ||
      data?.title ||
      data?.detail ||
      `Request failed (${res.status})`;
    if (data?.errors) {
      const details = Object.values(data.errors).flat().join("; ");
      if (details) msg += ": " + details;
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
    const promise = request(endpoint, options).finally(() => {
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

async function doUpload(url, formData) {
  const token = getAccessToken();
  const headers = { ...getCsrfHeader('POST') };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${APP_CONFIG.apiBaseUrl}${url}`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch {
    throw new Error("Network error. Please check your connection.");
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
  upload: (url, formData) => {
    const dedupKey = `UPLOAD:${url}`;
    if (_pendingRequests.has(dedupKey)) {
      return _pendingRequests.get(dedupKey);
    }
    const promise = doUpload(url, formData).finally(() => {
      if (_pendingRequests.get(dedupKey) === promise) {
        _pendingRequests.delete(dedupKey);
      }
    });
    _pendingRequests.set(dedupKey, promise);
    return promise;
  },
};

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${APP_CONFIG.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error("Refresh failed");
    const data = await parseResponse(res);
    setAccessToken(data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}
