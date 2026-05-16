const signalrConnection = new signalR.HubConnectionBuilder()
  .withUrl(APP_CONFIG.signalrHubUrl, {
    accessTokenFactory: () => localStorage.getItem("accessToken") || "",
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
  .build();

signalrConnection.on("BidPlaced", (bid) => {
  const bidDisplay = document.getElementById("currentBidDisplay");
  if (bidDisplay) {
    bidDisplay.innerHTML = `${t("auction.currentBid")}: ${formatPrice(bid.amount || bid.currentHighestBid)}`;
    bidDisplay.style.animation = "none";
    bidDisplay.offsetHeight;
    bidDisplay.style.animation = "priceFlash 0.5s ease";
  }
  showToast(t("auction.newBid"), "info");
});

signalrConnection.on("AuctionEnded", (auction) => {
  const container = document.getElementById("countdownContainer");
  if (container) {
    container.innerHTML = `<span style="color:var(--danger);font-weight:600"><i class="fas fa-times-circle"></i> ${t("auction.ended")}</span>`;
  }
  showToast("Auction ended!", "info");
});

signalrConnection.start().catch(() => {});

function joinAuctionGroup(auctionId) {
  if (signalrConnection.state === signalR.HubConnectionState.Connected) {
    signalrConnection.invoke("JoinAuctionGroup", auctionId).catch(() => {});
  } else {
    signalrConnection.onreconnected(() => {
      signalrConnection.invoke("JoinAuctionGroup", auctionId).catch(() => {});
    });
  }
}

function leaveAuctionGroup(auctionId) {
  if (signalrConnection.state === signalR.HubConnectionState.Connected) {
    signalrConnection.invoke("LeaveAuctionGroup", auctionId).catch(() => {});
  }
}
