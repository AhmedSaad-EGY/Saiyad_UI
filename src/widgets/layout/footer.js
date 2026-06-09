import { t } from '../../shared/utils/i18n.js';

export function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <h4>Sayiad</h4>
            <p>${t('footer.tagline')}</p>
          </div>
          <div class="footer-col">
            <h4>${t('footer.quickLinks')}</h4>
            <a href="#/products" class="footer-link">${t('nav.products')}</a>
            <a href="#/auctions" class="footer-link">${t('nav.auctions')}</a>
            <a href="#/cart" class="footer-link">${t('nav.cart')}</a>
          </div>
          <div class="footer-col">
            <h4>${t('footer.support')}</h4>
            <a href="#/terms" class="footer-link">${t('footer.terms')}</a>
            <a href="#/privacy" class="footer-link">${t('footer.privacy')}</a>
            <a href="#/shipping" class="footer-link">${t('footer.shipping')}</a>
          </div>
          <div class="footer-col">
            <h4>${t('footer.account')}</h4>
            <a href="#/dashboard" class="footer-link" id="footerSellLink">${t('nav.dashboard')}</a>
            <a href="#/profile" class="footer-link">${t('nav.profile')}</a>
            <a href="#/wallet" class="footer-link">${t('nav.wallet')}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${year} Sayiad. ${t('footer.rights')}</span>
        </div>
      </div>
    </footer>`;
}
