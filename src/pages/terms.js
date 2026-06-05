import { t } from '../core/i18n/index.js';
import { observeAnimations } from '../core/utils/dom.js';
import { registerRouteCleanup } from '../core/router/index.js';
import { setPageMeta } from '../core/utils/seo.js';

export default async function renderTerms(container) {
  setPageMeta(t('terms.title'));
  const isAr = document.documentElement.lang === 'ar';

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
        <div class="legal-hero-icon">
          <i class="fas fa-file-contract" aria-hidden="true"></i>
        </div>
        <h1>${t('auth.termsAndConditions')}</h1>
        <p class="legal-hero-sub">${isAr
      ? 'آخر تحديث: مايو 2026'
      : 'Last updated: May 2026'}</p>
      </div>

      <div class="legal-toc card animate-on-scroll stagger-1">
        <h4>${isAr ? 'المحتويات' : 'Table of Contents'}</h4>
        <ol class="toc-list">
          <li><a href="#terms-1" class="toc-link">${isAr ? 'قبول الشروط' : 'Acceptance of Terms'}</a></li>
          <li><a href="#terms-2" class="toc-link">${isAr ? 'مسؤوليات المستخدم' : 'User Responsibilities'}</a></li>
          <li><a href="#terms-3" class="toc-link">${isAr ? 'قواعد المزاد' : 'Auction Rules'}</a></li>
          <li><a href="#terms-4" class="toc-link">${isAr ? 'السلع المحظورة' : 'Prohibited Items'}</a></li>
          <li><a href="#terms-5" class="toc-link">${isAr ? 'حدود المسؤولية' : 'Limitation of Liability'}</a></li>
          <li><a href="#terms-6" class="toc-link">${isAr ? 'التعديلات' : 'Modifications'}</a></li>
        </ol>
      </div>

      <div class="legal-body">
        <section class="legal-section card animate-on-scroll stagger-2" id="terms-1">
          <div class="legal-section-header">
            <span class="legal-section-num">01</span>
            <h2>${isAr ? 'قبول الشروط' : 'Acceptance of Terms'}</h2>
          </div>
          <p>${isAr
      ? 'باستخدامك لصياد، فإنك توافق على الالتزام بهذه الشروط والأحكام وسياسة الخصوصية الخاصة بنا. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام الخدمة.'
      : 'By accessing and using Sayiad, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use the service.'}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-3" id="terms-2">
          <div class="legal-section-header">
            <span class="legal-section-num">02</span>
            <h2>${isAr ? 'مسؤوليات المستخدم' : 'User Responsibilities'}</h2>
          </div>
          <p>${isAr
      ? 'يجب أن يكون عمر المستخدم 18 عامًا على الأقل لإنشاء حساب. أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك. يجب على البائعين تقديم أوصاف دقيقة للمنتجات، ويجب على المشترين الالتزام بمشترياتهم ومزايداتهم.'
      : 'Users must be at least 18 years old to create an account. You are responsible for all activity that occurs under your account. Sellers must provide accurate item descriptions, and buyers must honor their bids and purchases.'}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-4" id="terms-3">
          <div class="legal-section-header">
            <span class="legal-section-num">03</span>
            <h2>${isAr ? 'قواعد المزاد' : 'Auction Rules'}</h2>
          </div>
          <p>${isAr
      ? 'المزايدات المقدمة على صياد هي عقود ملزمة. أعلى مزايد في نهاية فترة المزاد ملزم تعاقديًا بإتمام الشراء. التلاعب بالمزايدات محظور تمامًا.'
      : 'Bids placed on Sayiad are binding contracts. The highest bidder at the end of the auction period is contractually obligated to complete the purchase. Manipulation of bids is strictly prohibited.'}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-5" id="terms-4">
          <div class="legal-section-header">
            <span class="legal-section-num">04</span>
            <h2>${isAr ? 'السلع المحظورة' : 'Prohibited Items'}</h2>
          </div>
          <p>${isAr
      ? 'يمنع منعاً باتاً إدراج المواد غير القانونية والمواد الخطرة والسلع التي تنتهك حقوق الملكية الفكرية أو لوائح الصيد على المنصة.'
      : 'Illegal substances, hazardous materials, and items infringing on intellectual property or fishing regulations are strictly prohibited from being listed on the platform.'}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-6" id="terms-5">
          <div class="legal-section-header">
            <span class="legal-section-num">05</span>
            <h2>${isAr ? 'حدود المسؤولية' : 'Limitation of Liability'}</h2>
          </div>
          <p>${isAr
      ? 'صياد هو منصة وسيطة للمعاملات وليس مسؤولاً عن النزاعات بين المشترين والبائعين، على الرغم من أننا نقدم آليات الإبلاغ للحل. نحن لا نضمن جودة أو سلامة السلع المدرجة.'
      : 'Sayiad acts as a facilitator for transactions and is not responsible for disputes between buyers and sellers, though we provide reporting mechanisms for resolution. We do not guarantee the quality or safety of listed items.'}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-7" id="terms-6">
          <div class="legal-section-header">
            <span class="legal-section-num">06</span>
            <h2>${isAr ? 'التعديلات' : 'Modifications'}</h2>
          </div>
          <p>${isAr
      ? 'نحن نحتفظ بالحق في تعديل هذه الشروط في أي وقت. الاستمرار في استخدام المنصة بعد التغييرات يعتبر قبولاً للشروط الجديدة.'
      : 'We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.'}</p>
        </section>
      </div>

      <div class="legal-footer animate-on-scroll">
        <a href="#/privacy" class="btn btn-outline">
          <i class="fas fa-user-shield" aria-hidden="true"></i>
          ${t('auth.privacyPolicy')}
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

