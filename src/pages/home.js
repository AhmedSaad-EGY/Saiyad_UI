import { t } from '../shared/utils/i18n.js';
import { setPageMeta } from '../shared/utils/seo.js';
import '../features/home/index.js';
import { renderHomeHero, renderProductsSection, renderAuctionsSection } from '../widgets/home/index.js';

export default async function renderHome(container) {
  setPageMeta(t("home.title"), t("home.metaDesc"));
  container.innerHTML = `
    <div x-data="homePage">
      ${renderHomeHero()}
      ${renderProductsSection()}
      ${renderAuctionsSection()}
    </div>`;
}
