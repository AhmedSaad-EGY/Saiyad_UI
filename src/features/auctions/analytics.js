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
    api.get("/auctions/dashboard"),
    fetchWalletTransactions(1, 20),
    fetchWalletBalance(),
  ]);

  const rawDash = (dataResult.status === "fulfilled" ? dataResult.value : {}) || {};
  const recent = rawDash.recentAuctions || rawDash.recent || [];
  const allTxns = txnResult.status === "fulfilled" ? txnResult.value?.items || [] : [];
  const feeTxns = allTxns.filter((txn) => txn.type === "PlatformFee");
  const totalFees = feeTxns.reduce((s, txn) => s + Math.abs(txn.amount), 0);
  const wallet = walletResult.status === "fulfilled" ? walletResult.value : null;

  const dash = {
    totalAuctions: rawDash.totalAuctions,
    activeAuctions: rawDash.activeAuctions,
    finishedAuctions: rawDash.finishedAuctions,
    totalBids: rawDash.totalBids,
    totalRevenue: rawDash.totalRevenue,
  };

  const activePct = dash.activeAuctions && dash.totalAuctions
    ? ((dash.activeAuctions ?? 0) / (dash.totalAuctions || 1)) * 100 : 0;
  const finishedPct = dash.finishedAuctions && dash.totalAuctions
    ? ((dash.finishedAuctions ?? 0) / (dash.totalAuctions || 1)) * 100 : 0;

  const result = { dash, feeTxns, totalFees, activePct, finishedPct, recent, wallet };

  try {
    sessionStorage.setItem(
      ANALYTICS_CACHE_KEY,
      JSON.stringify({
        dash,
        totalFees,
        activePct,
        finishedPct,
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
  return api.post(`/auctions/requests/${requestId}/approve`, body);
}

export async function rejectAuctionRequest(requestId, reason) {
  return api.post(`/auctions/requests/${requestId}/reject`, { reason });
}

export async function fetchPendingRequests(page = 1, pageSize = 10) {
  return api.get("/auctions/requests/pending", { page, pageSize });
}
