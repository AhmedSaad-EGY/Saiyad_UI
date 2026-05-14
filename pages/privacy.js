async function renderPrivacy(container) {
  container.innerHTML = `
    <div class="auth-page" style="max-width: 800px;">
      <div class="card animate-on-scroll">
        <h2><i class="fas fa-user-shield"></i> ${t("auth.privacyPolicy")}</h2>
        <div class="terms-content" style="max-height: 60vh; overflow-y: auto; padding-right: 10px; margin-bottom: 24px; font-size: var(--text-sm); line-height: 1.6; color: var(--text-secondary);">
          <section class="mb-4">
            <h3 style="color: var(--text); margin-bottom: 8px;">1. Information Collection</h3>
            <p>We collect information you provide directly to us, such as when you create an account, list a product, or communicate with us. This includes your name, email, phone number, and location.</p>
          </section>
          <section class="mb-4">
            <h3 style="color: var(--text); margin-bottom: 8px;">2. How We Use Information</h3>
            <p>We use your information to facilitate transactions, improve our services, and send you important updates regarding your account or bids.</p>
          </section>
          <section class="mb-4">
            <h3 style="color: var(--text); margin-bottom: 8px;">3. Data Security</h3>
            <p>We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
          </section>
          <section class="mb-4">
            <h3 style="color: var(--text); margin-bottom: 8px;">4. Third-Party Sharing</h3>
            <p>We do not sell your personal data. We only share information necessary to process payments or comply with legal obligations.</p>
          </section>
        </div>
        <div class="auth-footer" style="text-align: center; border-top: 1px solid var(--border); padding-top: 20px;">
          <a href="#/register" class="btn btn-outline btn-block">
            <i class="fas fa-arrow-${document.documentElement.dir === "rtl" ? "right" : "left"}"></i> ${t("auth.register")}
          </a>
        </div>
      </div>
    </div>
  `;
  observeAnimations();
}
