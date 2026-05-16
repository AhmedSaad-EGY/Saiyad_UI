async function request(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${APP_CONFIG.apiBaseUrl}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Network error. Please check your connection.");
  }

  if (res.status === 401 && !options._retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request(endpoint, { ...options, _retry: true });
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    if (typeof updateNavbar === "function") updateNavbar();
    if (typeof navigate === "function") navigate("login");
    throw new Error("Session expired. Please log in again.");
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

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
    throw err;
  }
  return data;
}

function buildQuery(params) {
  const q = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return q ? `?${q}` : "";
}

const api = {
  get: (url, params) => request(url + buildQuery(params || {})),
  post: (url, body) =>
    request(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url, body) =>
    request(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: (url, body) =>
    request(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: "DELETE" }),
  upload: async (url, formData) => {
    const token = localStorage.getItem("accessToken");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
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
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
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
    const data = await res.json();
    localStorage.setItem("accessToken", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    return true;
  } catch {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return false;
  }
}
