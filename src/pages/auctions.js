import { t } from '../shared/utils/i18n.js';
import { setPageMeta } from '../shared/utils/seo.js';
import '../features/auctions/bid.js';
import { renderAuctionSearch } from '../widgets/auctions/render-search.js';
import { renderAuctionGrid } from '../widgets/auctions/render-grid.js';
import { renderMobileFilter } from '../widgets/auctions/render-mobile-filter.js';

export default async function renderAuctions(_container, _fullPath, _params) {
  setPageMeta(t('auctions.metaTitle'), t('auctions.metaDesc'));
  _container.innerHTML = `
    <div x-data="auctionsPage" @keydown.escape.window="filterSheetOpen = false">
      ${renderAuctionSearch()}
      ${renderAuctionGrid()}
      ${renderMobileFilter()}
    </div>`;
}
