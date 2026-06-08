import { api } from "../../shared/api/client.js";
import { t } from "../../app/i18n.js";
import { escapeHtml } from "../../shared/utils/dom.js";

export async function fetchAuctionAnalytics() {
  const cacheKey = "sayiad_analytics_cache";
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      /* invalid cache */
    }
  }
  try {
    const data = await api.get("/Auctions/dashboard");
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}

export async function approveAuctionRequest(requestId, body = {}) {
  return api.post(`/Auctions/requests/${requestId}/approve`, body);
}

export async function rejectAuctionRequest(requestId, reason) {
  return api.post(`/Auctions/requests/${requestId}/reject`, { reason });
}

export async function fetchPendingRequests(page = 1, pageSize = 10) {
  return api.get("/Auctions/requests/pending", { page, pageSize });
}
