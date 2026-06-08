import { t } from '../../app/i18n.js';
import { formatPrice, statusClass, tStatus } from '../../shared/utils/format.js';
import { escapeHtml, observeAnimations } from '../../shared/utils/dom.js';

export function renderAuctionCards(container, auctions, nowTime) {
  if (!auctions || !auctions.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-gavel empty-icon"></i><h3>${t('auctions.noAuctions')}</h3><p>${t('auctions.noAuctionsDesc')}</p></div>`;
    return;
  }
  container.innerHTML = auctions.map((a, i) => {
    const title = a.title || a.auctionTitle || t('common.auction');
    const img = a.primaryImageUrl || a.imageUrl || '';
    const statusText = tStatus(a.status, "auction");
    const timeLeft = a.endTime ? timeLeftStr(a.endTime, nowTime) : '';
    return `
      <a href="#/auction-detail?id=${a.id}"
         class="auction-card card animate-on-scroll stagger-${Math.min(i + 1, 8)}"
         aria-label="${escapeHtml(title)} — ${formatPrice(a.currentHighestBid || a.startingPrice)}">
        <div class="auction-card-img">
          ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy">`
            : `<div class="img-placeholder"><i class="fas fa-image"></i></div>`}
          ${a.status != null ? `<span class="product-card-badge ${statusClass(a.status)}">${escapeHtml(statusText)}</span>` : ''}
          ${a.status === 1 && a.endTime ? `<span class="ending-soon-badge"><i class="fas fa-clock"></i> ${timeLeft}</span>` : ''}
        </div>
        <div class="auction-card-body">
          <div class="auction-card-title">${escapeHtml(title)}</div>
          <div class="auction-card-price">${formatPrice(a.currentHighestBid || a.startingPrice)}</div>
          <div class="auction-card-meta">
            <span><i class="fas fa-gavel"></i> ${a.bidCount || 0} ${t('auctions.bids')}</span>
            ${a.endTime ? `<span><i class="fas fa-hourglass-half"></i> ${timeLeft || t('auctions.ending')}</span>` : ''}
          </div>
        </div>
      </a>`;
  }).join('');
  observeAnimations();
}

function timeLeftStr(endTime, nowTime) {
  const now = nowTime ? new Date(nowTime) : new Date();
  const end = new Date(endTime);
  const diff = end - now;
  if (diff <= 0) return t('auctions.ended');
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}
