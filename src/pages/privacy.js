import { t } from '../core/i18n/index.js';
import { observeAnimations } from '../core/utils/dom.js';
import { registerRouteCleanup } from '../core/router/index.js';
import { setPageMeta } from '../core/utils/seo.js';

export default async function renderPrivacy(container) {
  setPageMeta(t('privacy.title'));
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
        <div class="legal-hero-icon" aria-hidden="true">
          <i class="fas fa-user-shield" aria-hidden="true"></i>
        </div>
        <h1>${t('auth.privacyPolicy')}</h1>
        <p class="legal-hero-sub">${isAr
      ? 'آخر تحديث: ٢٣ مايو ٢٠٢٦'
      : 'Last updated: May 23, 2026'}</p>
      </div>

      <div class="legal-toc card animate-on-scroll stagger-1">
        <h4>${isAr ? 'المحتويات' : 'Table of Contents'}</h4>
        <ol class="toc-list">
          <li><a href="#priv-1" class="toc-link">${isAr ? 'جمع المعلومات' : 'Information Collection'}</a></li>
          <li><a href="#priv-2" class="toc-link">${isAr ? 'كيفية استخدام المعلومات' : 'How We Use Information'}</a></li>
          <li><a href="#priv-3" class="toc-link">${isAr ? 'أمان البيانات' : 'Data Security'}</a></li>
          <li><a href="#priv-4" class="toc-link">${isAr ? 'مشاركة الطرف الثالث' : 'Third-Party Sharing'}</a></li>
          <li><a href="#priv-5" class="toc-link">${isAr ? 'حقوقك' : 'Your Rights'}</a></li>
          <li><a href="#priv-6" class="toc-link">${isAr ? 'اتصل بنا' : 'Contact Us'}</a></li>
        </ol>
      </div>

      <div class="legal-body">
        <section class="legal-section card animate-on-scroll stagger-2" id="priv-1">
          <div class="legal-section-header">
            <span class="legal-section-num">01</span>
            <h2>${isAr ? 'جمع المعلومات' : 'Information Collection'}</h2>
          </div>
          <p>${isAr
      ? 'نقوم بجمع المعلومات التي تقدمها مباشرةً، مثل عند إنشاء حساب أو إدراج منتج أو التواصل معنا. يشمل ذلك اسمك وبريدك الإلكتروني ورقم هاتفك وموقعك.'
      : 'We collect information you provide directly to us, such as when you create an account, list a product, or communicate with us. This includes your name, email, phone number, and location.'}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-3" id="priv-2">
          <div class="legal-section-header">
            <span class="legal-section-num">02</span>
            <h2>${isAr ? 'كيفية استخدام المعلومات' : 'How We Use Information'}</h2>
          </div>
          <p>${isAr
      ? 'نستخدم معلوماتك لتسهيل المعاملات وتحسين خدماتنا وإرسال تحديثات مهمة تتعلق بحسابك أو عطاءاتك.'
      : 'We use your information to facilitate transactions, improve our services, and send you important updates regarding your account or bids.'}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-4" id="priv-3">
          <div class="legal-section-header">
            <span class="legal-section-num">03</span>
            <h2>${isAr ? 'أمان البيانات' : 'Data Security'}</h2>
          </div>
          <p>${isAr
      ? 'نطبق تدابير أمنية وفق معايير الصناعة لحماية معلوماتك الشخصية. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة 100%.'
      : 'We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.'}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-5" id="priv-4">
          <div class="legal-section-header">
            <span class="legal-section-num">04</span>
            <h2>${isAr ? 'مشاركة الطرف الثالث' : 'Third-Party Sharing'}</h2>
          </div>
          <p>${isAr
      ? 'لا نبيع بياناتك الشخصية. نشارك المعلومات الضرورية فقط لمعالجة المدفوعات أو الامتثال للالتزامات القانونية.'
      : 'We do not sell your personal data. We only share information necessary to process payments or comply with legal obligations.'}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-6" id="priv-5">
          <div class="legal-section-header">
            <span class="legal-section-num">05</span>
            <h2>${isAr ? 'حقوقك' : 'Your Rights'}</h2>
          </div>
          <p>${isAr
      ? 'يحق لك الوصول إلى بياناتك وتصحيحها وحذفها في أي وقت. تواصل معنا عبر صفحة الدعم.'
      : 'You have the right to access, correct, or delete your data at any time. Contact us through the support page.'}</p>
        </section>

        <section class="legal-section card animate-on-scroll stagger-7" id="priv-6">
          <div class="legal-section-header">
            <span class="legal-section-num">06</span>
            <h2>${isAr ? 'اتصل بنا' : 'Contact Us'}</h2>
          </div>
          <p>${isAr
      ? 'إذا كانت لديك أسئلة حول سياسة الخصوصية هذه، يُرجى التواصل معنا على'
      : 'If you have questions about this Privacy Policy, please contact us at'}
            <a href="mailto:support@sayiad.com" class="text-primary">support@sayiad.com</a>.</p>
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

