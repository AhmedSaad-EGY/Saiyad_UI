async function renderTerms(container) {
  container.innerHTML = `
    <div class="auth-page" style="max-width: 800px;">
      <div class="card animate-on-scroll">
        <h2><i class="fas fa-file-contract"></i> ${t("auth.termsAndConditions")}</h2>
        <div class="terms-content" style="max-height: 60vh; overflow-y: auto; padding-right: 10px; margin-bottom: 24px; font-size: var(--text-sm); line-height: 1.6; color: var(--text-secondary);">
          <section class="mb-4">
            <h3 style="color: var(--text); margin-bottom: 8px;">1. Acceptance of Terms</h3>
            <p>By accessing and using Sayiad, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use the service.</p>
          </section>
          <section class="mb-4">
            <h3 style="color: var(--text); margin-bottom: 8px;">2. User Responsibilities</h3>
            <p>Users must be at least 18 years old to create an account. You are responsible for all activity that occurs under your account. Sellers must provide accurate item descriptions, and buyers must honor their bids and purchases.</p>
          </section>
          <section class="mb-4">
            <h3 style="color: var(--text); margin-bottom: 8px;">3. Auction Rules</h3>
            <p>Bids placed on Sayiad are binding contracts. The highest bidder at the end of the auction period is contractually obligated to complete the purchase. Manipulation of bids (shill bidding) is strictly prohibited.</p>
          </section>
          <section class="mb-4">
            <h3 style="color: var(--text); margin-bottom: 8px;">4. Prohibited Items</h3>
            <p>Illegal substances, hazardous materials, and items infringing on intellectual property or fishing regulations are strictly prohibited from being listed on the platform.</p>
          </section>
          <section class="mb-4">
            <h3 style="color: var(--text); margin-bottom: 8px;">5. Limitation of Liability</h3>
            <p>Sayiad acts as a facilitator for transactions and is not responsible for disputes between buyers and sellers, though we provide reporting mechanisms for resolution. We do not guarantee the quality or safety of listed items.</p>
          </section>
          <section class="mb-4">
            <h3 style="color: var(--text); margin-bottom: 8px;">6. Modifications</h3>
            <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
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
