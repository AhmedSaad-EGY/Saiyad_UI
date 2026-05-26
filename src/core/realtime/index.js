import { APP_CONFIG } from '../api/config.js';
import { showToast } from '../utils/ui.js';
import { t } from '../i18n/index.js';
import { getUser } from '../auth/index.js';
import { on, emit } from '../events/bus.js';

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
    emit('realtime:bid-placed', { bid });

    const userId = getUser()?.id;
    const bidderId = bid.bidderId || bid.userId;
    if (userId && bidderId && bidderId !== parseInt(userId)) {
      showToast(t("auction.outbid"), "warning");
    } else {
      showToast(t("auction.newBid"), "info");
    }
  });

  _connection.on("AuctionEnded", (auction) => {
    emit('realtime:auction-ended', { auction });
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
