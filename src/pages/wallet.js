import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { requireAuth } from '../core/auth/index.js';
import { escapeHtml, observeAnimations } from '../core/utils/dom.js';
import Alpine from 'alpinejs';

Alpine.data('walletPage', () => ({
  wallet: null,
  currentPage: null,
  depositAmount: 0,
  depositMsg: '',
  depositMsgClass: '',
  depositing: false,
  loading: true,
  escapeHtml,

  async init() {
    try {
      this.wallet = await api.get("/wallet");
      this.currentPage = await api.get("/wallet/transactions?page=1&pageSize=20");
    } catch {
      this.wallet = null;
    } finally {
      this.loading = false;
      this.$nextTick(() => observeAnimations());
    }
  },

  formatEGP(n) {
    try { return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }).format(n); }
    catch { return "EGP " + Number(n || 0).toFixed(2); }
  },

  formatDate(d) {
    try { return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return d; }
  },

  txnIcon(type) {
    switch (type) {
      case "Deposit": return "fa-arrow-down text-success";
      case "Credit":  return "fa-arrow-down text-success";
      case "Release": return "fa-undo text-info";
      case "Hold":    return "fa-lock text-warning";
      case "Debit":   return "fa-arrow-up text-danger";
      case "Transfer": return "fa-exchange-alt text-primary";
      case "PlatformFee": return "fa-percentage text-primary";
      case "SubscriptionPayment": return "fa-crown text-warning";
      case "AuctionPayment": return "fa-gavel text-danger";
      case "AuctionPayout": return "fa-hand-holding-usd text-success";
      default:        return "fa-circle text-muted";
    }
  },

  txnLabel(type) {
    const labels = {
      "PlatformFee": t("wallet.platformFee"),
      "SubscriptionPayment": t("wallet.subPayment"),
      "AuctionPayment": t("wallet.auctionPayment"),
      "AuctionPayout": t("wallet.auctionPayout"),
    };
    return labels[type] || type;
  },

  async submitDeposit() {
    const amount = parseFloat(this.depositAmount);
    if (!amount || amount <= 0) {
      this.depositMsg = t("wallet.invalidAmount");
      this.depositMsgClass = "text-danger";
      return;
    }
    this.depositing = true;
    this.depositMsg = "";
    this.depositMsgClass = "";
    try {
      const updated = await api.post("/wallet/deposit", { amount });
      this.wallet = updated;
      this.depositAmount = 0;
      this.depositMsg = t("wallet.depositSuccess");
      this.depositMsgClass = "text-success";
      await this.loadTransactions(1);
    } catch (e) {
      this.depositMsg = e.message || t("wallet.depositError");
      this.depositMsgClass = "text-danger";
    } finally {
      this.depositing = false;
    }
  },

  async loadTransactions(page) {
    try {
      this.currentPage = await api.get("/wallet/transactions?page=" + page + "&pageSize=20");
    } catch {
      this.currentPage = { items: [], totalPages: 0, page: 1 };
    }
  },
}));

export default async function renderWallet(container) {
  if (!(await requireAuth())) return;

  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-wallet"></i> ${t("wallet.title")}</h2></div>
    <div x-data="walletPage">
      <template x-if="loading">
        <div class="skeleton-shimmer" style="padding:20px 0">
          <div class="skeleton skeleton-title" style="width:20%"></div>
          <div class="skeleton skeleton-text" style="width:40%;height:48px"></div>
          <div class="skeleton skeleton-text" style="width:60%"></div>
          <div style="margin-top:32px">
            <div class="skeleton skeleton-title" style="width:25%"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </div>
      </template>
      <template x-if="!loading && wallet">
        <div>
          <div class="wallet-container">
            <div class="wallet-card glass-card animate-on-scroll">
              <div class="wallet-balance-row">
                <div class="wallet-balance-item">
                  <span class="wallet-label">${t("wallet.balance")}</span>
                  <span class="wallet-amount" x-text="formatEGP(wallet.balance)"></span>
                </div>
                <div class="wallet-balance-item">
                  <span class="wallet-label">${t("wallet.held")}</span>
                  <span class="wallet-amount wallet-held" x-text="formatEGP(wallet.heldBalance)"></span>
                </div>
                <div class="wallet-balance-item">
                  <span class="wallet-label">${t("wallet.available")}</span>
                  <span class="wallet-amount wallet-available" x-text="formatEGP(wallet.availableBalance)"></span>
                </div>
              </div>
              <div class="wallet-deposit-row">
                <input type="number" x-model="depositAmount" class="form-control" placeholder="${t("wallet.enterAmount")}" min="1" step="0.01" style="max-width:200px">
                <button class="btn btn-primary" :disabled="depositing" @click.prevent="submitDeposit()"><i class="fas" :class="depositing ? 'fa-spinner spinner' : 'fa-plus'"></i> ${t("wallet.deposit")}</button>
              </div>
              <div class="wallet-msg" :class="depositMsgClass" x-text="depositMsg" x-show="depositMsg"></div>
            </div>
            <div class="section-header" style="margin-top:32px"><h3><i class="fas fa-list"></i> ${t("wallet.transactions")}</h3></div>
            <template x-if="currentPage && currentPage.items && currentPage.items.length > 0">
              <div class="wallet-txn-table animate-on-scroll">
                <table>
                  <thead><tr><th>${t("wallet.date")}</th><th>${t("wallet.type")}</th><th>${t("wallet.description")}</th><th>${t("wallet.amount")}</th></tr></thead>
                  <tbody>
                    <template x-for="txn in currentPage.items" :key="txn.id">
                      <tr>
                        <td x-text="formatDate(txn.createdAt)"></td>
                        <td><i class="fas" :class="txnIcon(txn.type)"></i> <span x-text="txnLabel(txn.type)"></span></td>
                        <td x-text="escapeHtml(txn.description || '')"></td>
                        <td :class="txn.amount >= 0 ? 'text-success' : 'text-danger'" x-text="formatEGP(txn.amount)"></td>
                      </tr>
                    </template>
                  </tbody>
                </table>
                <div class="pagination" style="display:flex;gap:8px;justify-content:center;margin-top:16px" x-show="currentPage.totalPages > 1">
                  <template x-for="p in currentPage.totalPages" :key="p">
                    <button class="btn btn-sm" :class="p === (currentPage.page || 1) ? 'btn-primary' : 'btn-outline'" @click="loadTransactions(p)" x-text="p"></button>
                  </template>
                </div>
              </div>
            </template>
            <template x-if="currentPage && (!currentPage.items || currentPage.items.length === 0)">
              <p class="text-muted" style="text-align:center;padding:32px">${t("wallet.noTransactions")}</p>
            </template>
          </div>
        </div>
      </template>
      <template x-if="!loading && !wallet">
        <div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> ${t("wallet.loadError")}</div>
      </template>
    </div>`;
}
