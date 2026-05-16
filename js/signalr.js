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
      bidDisplay.innerHTML = `${t("auction.currentBid")}: ${formatPrice(bid.amount || bid.currentHighestBid)}`;
      bidDisplay.style.animation = "none";
      bidDisplay.offsetHeight;
      bidDisplay.style.animation = "priceFlash 0.5s ease";
    }
    showToast(t("auction.newBid"), "info");
  });

  _connection.on("AuctionEnded", (auction) => {
    const container = document.getElementById("countdownContainer");
    if (container) {
      container.innerHTML = `<span style="color:var(--danger);font-weight:600"><i class="fas fa-times-circle"></i> ${t("auction.ended")}</span>`;
    }
    showToast("Auction ended!", "info");
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
