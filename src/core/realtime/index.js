import { APP_CONFIG } from '../api/config.js';
import { showToast } from '../utils/ui.js';
import { t } from '../i18n/index.js';
import { getUser } from '../auth/index.js';
import { on, emit } from '../events/bus.js';

let _connection = null;
let _connectionPromise = null;
const _joinedGroups = new Set();

const signalR = window.signalR;

function getConnection() {
  if (_connection) return _connection;
  _connection = new signalR.HubConnectionBuilder()
    .withUrl(APP_CONFIG.signalrHubUrl, {
      accessTokenFactory: () => localStorage.getItem("accessToken") || "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 20000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
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

  _connection.onreconnecting(() => showSignalRBanner());
  _connection.onreconnected(async () => {
    hideSignalRBanner();
    for (const id of _joinedGroups) {
      try {
        await _connection.invoke("JoinAuctionGroup", id);
      } catch {}
    }
  });
  _connection.onclose(() => showSignalRBanner());

  return _connection;
}

export function startIfNeeded() {
  if (!localStorage.getItem("accessToken")) return Promise.resolve();
  if (_connectionPromise) return _connectionPromise;
  const conn = getConnection();
  _connectionPromise = conn.start()
    .then(() => { hideSignalRBanner(); })
    .catch(() => { showSignalRBanner(); });
  return _connectionPromise;
}

export function joinAuctionGroup(auctionId) {
  if (_joinedGroups.has(auctionId)) return;

  _joinedGroups.add(auctionId);

  startIfNeeded().then(() => {
    const conn = getConnection();
    if (conn.state === signalR.HubConnectionState.Connected) {
      conn.invoke("JoinAuctionGroup", auctionId).catch(() => {});
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

// ── Reconnection Banner ────────────────────────────────────────────────────

function showSignalRBanner() {
  let b = document.getElementById('signalrBanner');
  if (!b) {
    b = document.createElement('div');
    b.id = 'signalrBanner';
    b.setAttribute('role', 'status');
    b.setAttribute('aria-live', 'polite');
    b.style.cssText = [
      'position:fixed','bottom:1rem','left:50%','transform:translateX(-50%)',
      'background:#f59e0b','color:#000','padding:.5rem 1.25rem',
      'border-radius:2rem','font-size:.875rem','font-weight:500',
      'z-index:9999','display:flex','align-items:center','gap:.5rem',
      'box-shadow:0 4px 12px rgba(0,0,0,.25)'
    ].join(';');
    b.innerHTML = '<i class="fas fa-wifi" aria-hidden="true"></i>'
                + '<span data-i18n="reconnecting">Reconnecting to auction…</span>';
    document.body.appendChild(b);
  }
  b.style.display = 'flex';
}

function hideSignalRBanner() {
  const b = document.getElementById('signalrBanner');
  if (b) b.style.display = 'none';
}

