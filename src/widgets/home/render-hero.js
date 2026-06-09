import { t } from '../../shared/utils/i18n.js';

export function renderHomeHero() {
  return `
    <section class="hero" aria-label="${t("home.welcome")}">
      <div class="hero-content">
        <h1>${t("home.welcome")}</h1>
        <p>${t("home.subtitle")}</p>
        <div class="hero-actions">
          <a href="#/products" class="btn btn-primary btn-lg"><i class="fas fa-store"></i> ${t("home.browseProducts")}</a>
          <a href="#/auctions" class="btn btn-outline btn-lg"><i class="fas fa-gavel"></i> ${t("home.viewAuctions")}</a>
        </div>
      </div>
    </section>

    <div class="feature-grid my-5" role="list">
      <div class="feature-card animate-on-scroll stagger-1" role="listitem">
        <i class="fas fa-fish"></i><h3>${t("home.qualityGear")}</h3><p>${t("home.qualityGearDesc")}</p>
      </div>
      <div class="feature-card animate-on-scroll stagger-2" role="listitem">
        <i class="fas fa-gavel"></i><h3>${t("home.liveAuctions")}</h3><p>${t("home.liveAuctionsDesc")}</p>
      </div>
      <div class="feature-card animate-on-scroll stagger-3" role="listitem">
        <i class="fas fa-truck"></i><h3>${t("home.fastShipping")}</h3><p>${t("home.fastShippingDesc")}</p>
      </div>
      <div class="feature-card animate-on-scroll stagger-4" role="listitem">
        <i class="fas fa-shield-alt"></i><h3>${t("home.securePayments")}</h3><p>${t("home.securePaymentsDesc")}</p>
      </div>
    </div>

    <div x-show="roleLinks.length" class="section-header animate-on-scroll">
      <h2><i class="fas fa-bolt"></i> ${t("common.quickLinks")}</h2>
      <div class="d-flex gap-2 flex-wrap">
        <template x-for="link in roleLinks" :key="link.label">
          <a :href="link.href" class="btn btn-outline btn-sm">
            <i :class="'fas ' + link.icon"></i><span x-text="link.label"></span>
          </a>
        </template>
      </div>
    </div>`;
}
