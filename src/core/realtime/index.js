import { APP_CONFIG } from '../api/config.js';
import { formatPrice, formatDate } from '../utils/format.js';
import { escapeHtml } from '../utils/dom.js';
import { showToast, triggerConfetti } from '../utils/ui.js';
import { t } from '../i18n/index.js';
import { getUser } from '../auth/index.js';
import { on } from '../events/bus.js';

let _connection = null;
let _connectionPromise = null;
const _joinedGroups = new Set();
let _onreconnectedHandler = null;

const signalR = window.signalR;

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
    const bidList = document.getElementById("bidList");
    if (bidList) {
      bidList.querySelector(".empty-state")?.remove();
      const row = document.createElement("div");
      row.className = "bid-item";
      row.style.background = "var(--success-bg)";
      row.style.transition = "background 1s ease";
      const bidder =
        bid.userName ||
        bid.bidderName ||
        bid.fullName ||
        (bid.bidderId ? `User #${bid.bidderId}` : "User");
      row.innerHTML = `
        <span><strong>${escapeHtml(bidder)}</strong> <small>${formatDate(bid.createdAt || new Date().toISOString())}</small></span>
        <span style="font-weight:700;color:var(--success)">${formatPrice(bid.amount || bid.currentHighestBid)} ${bid.isAutoBid ? `<i class="fas fa-robot" title="${t('auction.autoBid')}"></i>` : ""}</span>
      `;
      bidList.prepend(row);
      setTimeout(() => { row.style.background = ""; }, 2000);
    }
    const bidCount = document.getElementById("bidCountDisplay");
    if (bidCount) {
      const nextCount = Number(bid.bidCount) || Number(bidCount.textContent || 0) + 1;
      bidCount.textContent = nextCount;
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

export function startIfNeeded() {
  if (!localStorage.getItem("accessToken")) return Promise.resolve();
  if (_connectionPromise) return _connectionPromise;
  const conn = getConnection();
  _connectionPromise = conn.start().catch(() => {});
  return _connectionPromise;
}

export function joinAuctionGroup(auctionId) {
  if (_joinedGroups.has(auctionId)) return;

  _joinedGroups.add(auctionId);

  startIfNeeded().then(() => {
    const conn = getConnection();
    if (conn.state === signalR.HubConnectionState.Connected) {
      conn.invoke("JoinAuctionGroup", auctionId).catch(() => {});
    } else if (!_onreconnectedHandler) {
      _onreconnectedHandler = async () => {
        for (const id of _joinedGroups) {
          try {
            await conn.invoke("JoinAuctionGroup", id);
          } catch {}
        }
      };
      conn.onreconnected = _onreconnectedHandler;
    }
  });
}

export function leaveAuctionGroup(auctionId) {
  if (!_joinedGroups.has(auctionId)) return;

  _joinedGroups.delete(auctionId);

  if (!_connection) return;
  if (_connection.state === signalR.HubConnectionState.Connected) {
    _connection.invoke("LeaveAuctionGroup", auctionId).catch(() => {});
  }
}

export function stopSignalR() {
  if (_connection) {
    _connection.stop().catch(() => {});
    _connection = null;
    _connectionPromise = null;
    _joinedGroups.clear();
    _onreconnectedHandler = null;
  }
}

on('auth:logged-out', stopSignalR);
