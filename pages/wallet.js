async function renderWallet(container) {
  if (!(await requireAuth())) return;

  const contentId = "walletContent";
  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-wallet"></i> ${t("wallet.title")}</h2></div>
    <div id="${contentId}"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;

  const content = document.getElementById(contentId);

  function formatEGP(n) {
    try { return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }).format(n); }
    catch { return "EGP " + Number(n || 0).toFixed(2); }
  }

  function formatDate(d) {
    try { return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return d; }
  }

  function txnIcon(type) {
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
  }

  function txnLabel(type) {
    const labels = {
      "PlatformFee": t("wallet.platformFee"),
      "SubscriptionPayment": t("wallet.subPayment"),
      "AuctionPayment": t("wallet.auctionPayment"),
      "AuctionPayout": t("wallet.auctionPayout"),
    };
    return labels[type] || type;
  }

  try {
    const wallet = await api.get("/wallet");

    content.innerHTML =
      '<div class="wallet-container">' +
      '<div class="wallet-card glass-card animate-on-scroll">' +
      '<div class="wallet-balance-row">' +
      '<div class="wallet-balance-item">' +
      '<span class="wallet-label">' + t("wallet.balance") + '</span>' +
      '<span class="wallet-amount" id="walletBalance">' + formatEGP(wallet.balance) + '</span>' +
      '</div>' +
      '<div class="wallet-balance-item">' +
      '<span class="wallet-label">' + t("wallet.held") + '</span>' +
      '<span class="wallet-amount wallet-held">' + formatEGP(wallet.heldBalance) + '</span>' +
      '</div>' +
      '<div class="wallet-balance-item">' +
      '<span class="wallet-label">' + t("wallet.available") + '</span>' +
      '<span class="wallet-amount wallet-available" id="walletAvailable">' + formatEGP(wallet.availableBalance) + '</span>' +
      '</div>' +
      '</div>' +
      '<div class="wallet-deposit-row">' +
      '<input type="number" id="depositAmount" class="form-control" placeholder="' + t("wallet.enterAmount") + '" min="1" step="0.01" style="max-width:200px">' +
      '<button class="btn btn-primary" id="depositBtn"><i class="fas fa-plus"></i> ' + t("wallet.deposit") + '</button>' +
      '</div>' +
      '<div id="walletDepositMsg" class="wallet-msg"></div>' +
      '</div>' +
      '<div class="section-header" style="margin-top:32px"><h3><i class="fas fa-list"></i> ' + t("wallet.transactions") + '</h3></div>' +
      '<div id="walletTxnList" class="animate-on-scroll"><i class="fas fa-spinner spinner"></i> ' + t("common.loading") + '</div>' +
      '</div>';

    loadTransactions(1);

    document.getElementById("depositBtn").addEventListener("click", async () => {
      const inp = document.getElementById("depositAmount");
      const msg = document.getElementById("walletDepositMsg");
      const amount = parseFloat(inp.value);
      if (!amount || amount <= 0) { msg.className = "wallet-msg text-danger"; msg.textContent = t("wallet.invalidAmount"); return; }
      msg.className = "wallet-msg";
      msg.textContent = t("common.loading");
      try {
        const updated = await api.post("/wallet/deposit", { amount });
        document.getElementById("walletBalance").textContent = formatEGP(updated.balance);
        document.getElementById("walletAvailable").textContent = formatEGP(updated.availableBalance);
        inp.value = "";
        msg.className = "wallet-msg text-success";
        msg.textContent = t("wallet.depositSuccess");
        loadTransactions(1);
      } catch (e) {
        msg.className = "wallet-msg text-danger";
        msg.textContent = e.message || t("wallet.depositError");
      }
    });

    async function loadTransactions(page) {
      const txnList = document.getElementById("walletTxnList");
      try {
        const data = await api.get("/wallet/transactions?page=" + page + "&pageSize=20");
        if (!data.items || data.items.length === 0) {
          txnList.innerHTML = '<p class="text-muted" style="text-align:center;padding:32px">' + t("wallet.noTransactions") + '</p>';
          return;
        }
        let html = '<div class="wallet-txn-table"><table><thead><tr><th>' + t("wallet.date") + '</th><th>' + t("wallet.type") + '</th><th>' + t("wallet.description") + '</th><th>' + t("wallet.amount") + '</th></tr></thead><tbody>';
        for (const txn of data.items) {
          let amtClass = txn.amount >= 0 ? "text-success" : "text-danger";
          html += '<tr><td>' + formatDate(txn.createdAt) + '</td><td><i class="fas ' + txnIcon(txn.type) + '"></i> ' + escapeHtml(txnLabel(txn.type)) + '</td><td>' + escapeHtml(txn.description || "") + '</td><td class="' + amtClass + '">' + formatEGP(txn.amount) + '</td></tr>';
        }
        html += '</tbody></table></div>';
        if (data.totalPages > 1) {
          html += '<div class="pagination" style="display:flex;gap:8px;justify-content:center;margin-top:16px">';
          for (let p = 1; p <= data.totalPages; p++) {
            let active = p === data.page ? "active" : "";
            html += '<button class="btn btn-sm ' + (active === "active" ? "btn-primary" : "btn-outline") + '" data-page="' + p + '">' + p + '</button>';
          }
          html += '</div>';
        }
        txnList.innerHTML = html;
        txnList.querySelectorAll("[data-page]").forEach(function(btn) { btn.addEventListener("click", function() { loadTransactions(parseInt(btn.dataset.page)); }); });
      } catch (e) {
        txnList.innerHTML = '<p class="text-danger" style="text-align:center;padding:32px">' + t("common.error") + '</p>';
      }
    }

    observeAnimations();
  } catch {
    content.innerHTML = '<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> ' + t("wallet.loadError") + '</div>';
  }
}
