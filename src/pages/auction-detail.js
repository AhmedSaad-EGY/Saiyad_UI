import { t } from '../shared/utils/i18n.js';
import { setPageMeta } from '../shared/utils/seo.js';
import '../features/auctions/bid.js';
import { renderDetailStates, renderDetailMain } from '../widgets/auction-detail/index.js';

export default async function renderAuctionDetail(container, _route, _params) {
  setPageMeta(t('auctionDetail.title'));
  container.innerHTML = `
    <div x-data="auctionDetailPage" x-init="init()">
      ${renderDetailStates()}
      <template x-if="!loading && !error && auction">
        ${renderDetailMain()}
      </template>
    </div>`;
}
