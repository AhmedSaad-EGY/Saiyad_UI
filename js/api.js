async function request(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${APP_CONFIG.apiBaseUrl}${endpoint}`, { ...options, headers });
  const data = res.status === 204 ? null : await res.json();

  if (!res.ok) {
    const msg = data?.message || data?.title || data?.detail || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function buildQuery(params) {
  const q = Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  return q ? `?${q}` : '';
}

const api = {
  get: (url, params) => request(url + buildQuery(params || {})),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body) => request(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
  del: (url) => request(url, { method: 'DELETE' }),
  upload: async (url, formData) => {
    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${APP_CONFIG.apiBaseUrl}${url}`, { method: 'POST', headers, body: formData });
    const data = res.status === 204 ? null : await res.json();
    if (!res.ok) {
      const msg = data?.message || data?.title || data?.detail || `Upload failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },
};

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  try {
    const data = await api.post('/auth/refresh', { refreshToken });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return false;
  }
}
