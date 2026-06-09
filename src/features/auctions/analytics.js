import { api } from "../../shared/api/client.js";
import { fetchWalletBalance, fetchWalletTransactions } from "../wallet/wallet.js";

const ANALYTICS_CACHE_KEY = "sayiad_analytics_cache";

export function getCachedAnalyticsPageData() {
  try {
    const raw = sessionStorage.getItem(ANALYTICS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchAnalyticsPageData() {
  const [dataResult, txnResult, walletResult] = await Promise.allSettled([
    api.get("/Auctions/dashboard"),
    fetchWalletTransactions(1, 20),
    fetchWalletBalance(),
  ]);

  const rawDash = (dataResult.status === "fulfilled" ? dataResult.value : {}) || {};
  const recent = rawDash.recentAuctions || rawDash.recent || [];
  const allTxns = txnResult.status === "fulfilled" ? txnResult.value?.items || [] : [];
  const feeTxns = allTxns.filter((txn) => txn.type === "PlatformFee");
  const wallet = walletResult.status === "fulfilled" ? walletResult.value : null;

  const dash = {
    totalAuctions: rawDash.totalAuctions,
    activeAuctions: rawDash.activeAuctions,
    finishedAuctions: rawDash.finishedAuctions,
    totalBids: rawDash.totalBids,
    totalRevenue: rawDash.totalRevenue,
  };

  const result = { dash, feeTxns, recent, wallet };

  try {
    sessionStorage.setItem(
      ANALYTICS_CACHE_KEY,
      JSON.stringify({
        dash,
        feeTxns: feeTxns.map((txn) => ({
          createdAt: txn.createdAt,
          amount: txn.amount,
          description: txn.description,
        })),
        recent: recent.map((a) => ({
          title: a.title,
          productName: a.productName,
          status: a.status,
          startingPrice: a.startingPrice,
          currentPrice: a.currentPrice,
          bidCount: a.bidCount,
          endTime: a.endTime,
        })),
        wallet: wallet ? { availableBalance: wallet.availableBalance } : null,
      }),
    );
  } catch { /* storage full */ }

  return result;
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
