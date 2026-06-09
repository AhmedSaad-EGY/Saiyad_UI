import { t } from '../../app/i18n.js';
import { showAuctionModal } from './render-products.js';

export function renderDashAuctions(content, { onStartAuction, onFetchUnauctionedProducts } = {}) {
  content.innerHTML = `
    <div class="card text-center p-4">
      <h3><i class="fas fa-gavel" aria-hidden="true"></i> ${t("dash.auctions")}</h3>
      <p class="text-muted mb-3">${t("auction.startNew")}</p>
      <button class="btn btn-primary" id="createNewAuctionBtn"><i class="fas fa-plus" aria-hidden="true"></i> ${t("auctions.title")}</button>
    </div>
  `;
  document.getElementById("createNewAuctionBtn").addEventListener("click", () => showAuctionModal(null, null, { onStartAuction, onFetchUnauctionedProducts }));
}
