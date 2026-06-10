import { APP_CONFIG } from '../shared/api/config.js';
import { showToast } from '../widgets/ui/toast.js';
import { t } from '../shared/utils/i18n.js';
import { getUser } from '../features/auth/login.js';
import { on, emit } from '../shared/utils/events.js';
import { KEYS } from '../shared/constants/storage-keys.js';

let _connection = null;
let _connectionPromise = null;
const _joinedGroups = new Set();

const signalR = window.signalR;
const HubConnectionState = signalR?.HubConnectionState;

function getConnection() {
  if (_connection) return _connection;
  if (!signalR) {
    console.warn('[realtime] SignalR SDK not available — skipping realtime features.');
    return null;
  }
  _connection = new signalR.HubConnectionBuilder()
    .withUrl(APP_CONFIG.signalrHubUrl, {
      accessTokenFactory: () => sessionStorage.getItem(KEYS.ACCESS_TOKEN) || "",
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
      } catch { /* group may have been removed */ }
    }
  });
  _connection.onclose(() => showSignalRBanner());

  return _connection;
}

export function startIfNeeded() {
  if (!sessionStorage.getItem(KEYS.ACCESS_TOKEN)) return Promise.resolve();
  if (_connectionPromise) return _connectionPromise;
  const conn = getConnection();
  if (!conn) return Promise.resolve();
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
    if (conn?.state === HubConnectionState?.Connected) {
      conn.invoke("JoinAuctionGroup", auctionId).catch(() => { /* connection may not be ready */ });
    }
  });
}

export function leaveAuctionGroup(auctionId) {
  if (!_joinedGroups.has(auctionId)) return;

  _joinedGroups.delete(auctionId);

  if (!_connection) return;
  if (_connection.state === HubConnectionState?.Connected) {
    _connection.invoke("LeaveAuctionGroup", auctionId).catch(() => { /* connection may not be ready */ });
  }
}

export function isSignalRConnected() {
  if (!_connection || !HubConnectionState) return false;
  return _connection.state === HubConnectionState.Connected;
}

export function stopSignalR() {
  if (_connection) {
    _connection.stop().catch(() => { /* connection already closed */ });
    _connection = null;
    _connectionPromise = null;
    _joinedGroups.clear();
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
    b.className = 'signalr-banner';
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

