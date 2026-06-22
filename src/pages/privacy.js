import { t } from '../shared/utils/i18n.js';
import { observeAnimations } from '../shared/utils/dom.js';
import { registerRouteCleanup } from '../app/router.js';
import { setPageMeta } from '../shared/utils/seo.js';

export default async function renderPrivacy(container) {
  setPageMeta(t('privacy.title'));
  container.innerHTML = `
    <style>
      @media print {
        body { background: white !important; color: black !important; }
        .navbar, .footer, .legal-hero, .legal-toc, .legal-footer { display: none !important; }
        .legal-page { padding: 0 !important; margin: 0 !important; }
        .legal-section { border: none !important; box-shadow: none !important; background: transparent !important; page-break-inside: avoid; padding: 0 !important; margin-bottom: 2rem !important; }
        .legal-section-header h2 { color: black !important; }
      }
      .toc-link.active {
        color: var(--primary) !important;
        font-weight: 600 !important;
        border-inline-start: 2px solid var(--primary);
        padding-inline-start: 8px;
      }
      .toc-link {
        transition: all 0.2s ease;
      }
    </style>
    <div class="legal-page">
      <div class="legal-hero animate-on-scroll">
        <div class="legal-hero-icon" aria-hidden="true">
          <i class="fas fa-user-shield" aria-hidden="true"></i>
        </div>
        <h1>${t('auth.privacyPolicy')}</h1>
        <p class="legal-hero-sub">${t('privacy.lastUpdated')}</p>
      </div>

      <div class="legal-toc card animate-on-scroll stagger-1">
        <h4>${t('privacy.tableOfContents')}</h4>
        <ol class="toc-list">
          <li><a href="#priv-1" class="toc-link">${t('privacy.section1Title')}</a></li>
          <li><a href="#priv-2" class="toc-link">${t('privacy.section2Title')}</a></li>
          <li><a href="#priv-3" class="toc-link">${t('privacy.section3Title')}</a></li>
          <li><a href="#priv-4" class="toc-link">${t('privacy.section4Title')}</a></li>
          <li><a href="#priv-5" class="toc-link">${t('privacy.section5Title')}</a></li>
          <li><a href="#priv-6" class="toc-link">${t('privacy.section6Title')}</a></li>
        </ol>
      </div>

      <div class="legal-body">
        <section class="legal-section card animate-on-scroll stagger-2" id="priv-1">
          <div class="legal-section-header">
            <span class="legal-section-num">01</span>
            <h2>${t('privacy.section1Title')}</h2>
          </div>
          <p>${t('privacy.section1Body')}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-3" id="priv-2">
          <div class="legal-section-header">
            <span class="legal-section-num">02</span>
            <h2>${t('privacy.section2Title')}</h2>
          </div>
          <p>${t('privacy.section2Body')}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-4" id="priv-3">
          <div class="legal-section-header">
            <span class="legal-section-num">03</span>
            <h2>${t('privacy.section3Title')}</h2>
          </div>
          <p>${t('privacy.section3Body')}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-5" id="priv-4">
          <div class="legal-section-header">
            <span class="legal-section-num">04</span>
            <h2>${t('privacy.section4Title')}</h2>
          </div>
          <p>${t('privacy.section4Body')}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-6" id="priv-5">
          <div class="legal-section-header">
            <span class="legal-section-num">05</span>
            <h2>${t('privacy.section5Title')}</h2>
          </div>
          <p>${t('privacy.section5Body')}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-7" id="priv-6">
          <div class="legal-section-header">
            <span class="legal-section-num">06</span>
            <h2>${t('privacy.section6Title')}</h2>
          </div>
          <p>${t('privacy.section6Body')} <a href="mailto:support@sayiad.com" class="text-primary">support@sayiad.com</a>.</p>
        </section>
      </div>

      <div class="legal-footer animate-on-scroll">
        <a href="#/terms" class="btn btn-outline">
          <i class="fas fa-file-contract" aria-hidden="true"></i>
          ${t('auth.termsAndConditions')}
        </a>
        <a href="#/" class="btn btn-primary">
          <i class="fas fa-home" aria-hidden="true"></i>
          ${t('common.goHome')}
        </a>
      </div>
    </div>
  `;
  observeAnimations();

  // TOC active state observation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        document.querySelectorAll(".toc-link").forEach(link => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, { rootMargin: "-20% 0px -60% 0px", threshold: 0 });

  document.querySelectorAll(".legal-section").forEach(sec => observer.observe(sec));
  registerRouteCleanup(() => observer.disconnect());
}

