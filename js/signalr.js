let _connection = null;
let _connectionPromise = null;

function getConnection() {
  if (_connection) return _connection;
  _connection = new signalR.HubConnectionBuilder()
    .withUrl(APP_CONFIG.signalrHubUrl, {
      accessTokenFactory: () => localStorage.getItem("accessToken") || "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .build();

  _connection.on("BidPlaced", (bid) => {
    const bidDisplay = document.getElementById("currentBidDisplay");
    if (bidDisplay) {
      const price = formatPrice(bid.amount || bid.currentHighestBid);
      bidDisplay.textContent = `${t("auction.currentBid")}: ${price}`;
      bidDisplay.style.animation = "none";
      bidDisplay.offsetHeight;
      bidDisplay.style.animation = "priceFlash 0.6s var(--ease-bounce)";
    }
    // Highlight new bid row in history
    const rows = document.querySelectorAll("#bidHistoryBody tr");
    if (rows.length) {
      const firstRow = rows[0];
      firstRow.style.background = "var(--success-bg)";
      firstRow.style.transition = "background 1s ease";
      setTimeout(() => { firstRow.style.background = ""; }, 2000);
    }
    const userId = getUser()?.id;
    if (userId && bid.bidderId && bid.bidderId !== parseInt(userId)) {
      showToast(t("auction.outbid"), "warning");
    } else {
      showToast(t("auction.newBid"), "info");
    }
  });

  _connection.on("AuctionEnded", (auction) => {
    const container = document.getElementById("countdownContainer");
    if (container) {
      container.innerHTML = `<div class="animate-on-scroll visible" style="color:var(--success);font-weight:700;font-size:var(--text-lg)">
        <i class="fas fa-crown"></i> ${t("auction.ended")}
      </div>`;
      triggerConfetti();
    }
    showToast(t("auction.ended"), "success");
  });

  return _connection;
}

function startIfNeeded() {
  if (!localStorage.getItem("accessToken")) return Promise.resolve();
  if (_connectionPromise) return _connectionPromise;
  const conn = getConnection();
  _connectionPromise = conn.start().catch(() => {});
  return _connectionPromise;
}

function joinAuctionGroup(auctionId) {
  startIfNeeded().then(() => {
    const conn = getConnection();
    if (conn.state === signalR.HubConnectionState.Connected) {
      conn.invoke("JoinAuctionGroup", auctionId).catch(() => {});
    } else {
      conn.onreconnected(() => {
        conn.invoke("JoinAuctionGroup", auctionId).catch(() => {});
      });
    }
  });
}

function leaveAuctionGroup(auctionId) {
  if (!_connection) return;
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    conn.invoke("LeaveAuctionGroup", auctionId).catch(() => {});
  }
}

function stopSignalR() {
  if (_connection) {
    _connection.stop().catch(() => {});
    _connection = null;
    _connectionPromise = null;
  }
}

document.addEventListener("logout", stopSignalR);
