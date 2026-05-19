async function renderHome(container) {
  container.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <h1>${t("home.welcome")}</h1>
        <p>${t("home.subtitle")}</p>
        <div class="hero-actions">
          <a href="#/products" class="btn btn-primary btn-lg"><i class="fas fa-store"></i> ${t("home.browseProducts")}</a>
          <a href="#/auctions" class="btn btn-outline btn-lg"><i class="fas fa-gavel"></i> ${t("home.viewAuctions")}</a>
        </div>
      </div>
    </section>

    <div class="features-grid">
      <div class="feature-card animate-on-scroll stagger-1"><i class="fas fa-fish"></i><h3>${t("home.qualityGear")}</h3><p>${t("home.qualityGearDesc")}</p></div>
      <div class="feature-card animate-on-scroll stagger-2"><i class="fas fa-gavel"></i><h3>${t("home.liveAuctions")}</h3><p>${t("home.liveAuctionsDesc")}</p></div>
      <div class="feature-card animate-on-scroll stagger-3"><i class="fas fa-truck"></i><h3>${t("home.fastShipping")}</h3><p>${t("home.fastShippingDesc")}</p></div>
      <div class="feature-card animate-on-scroll stagger-4"><i class="fas fa-shield-alt"></i><h3>${t("home.securePayments")}</h3><p>${t("home.securePaymentsDesc")}</p></div>
    </div>

    <div id="roleQuickLinks" class="hidden"></div>

    <div class="section-header animate-on-scroll"><h2>${t("home.latestProducts")}</h2><a href="#/products" class="btn btn-outline btn-sm">${t("home.viewAll")}</a></div>
    <div id="homeProducts" class="product-grid"></div>

    <div class="section-header section-header-offset animate-on-scroll"><h2>${t("home.activeAuctions")}</h2><a href="#/auctions" class="btn btn-outline btn-sm">${t("home.viewAll")}</a></div>
    <div id="homeAuctions" class="product-grid"></div>
    <div id="recentlyViewed"></div>
  `;

  try {
    // Role-based quick links
    const rql = document.getElementById("roleQuickLinks");
    if (rql && isAuthenticated()) {
      const user = getUser();
      const roleLinks = [];
      if (hasAnyRole("Fisherman", "BaitSeller", "Auctioneer")) {
        roleLinks.push(`<a href="#/dashboard?tab=products" class="btn btn-outline btn-sm"><i class="fas fa-tag"></i> ${t("nav.myProducts")}</a>`);
      }
      if (hasRole("Admin")) {
        roleLinks.push(`<a href="#/admin" class="btn btn-outline btn-sm"><i class="fas fa-shield-alt"></i> ${t("admin.title")}</a>`);
      }
      if (roleLinks.length) {
        rql.className = "section-header animate-on-scroll";
        rql.innerHTML = `<h2><i class="fas fa-user"></i> ${t("common.quickLinks")}</h2><div style="display:flex;gap:8px;flex-wrap:wrap">${roleLinks.join("")}</div>`;
      }
    }

    const [products, auctions] = await Promise.all([
      api.get("/products", { pageSize: 4 }),
      api.get("/auctions", { pageSize: 4 }),
    ]);
    renderProductCards(
      document.getElementById("homeProducts"),
      products.items || products.data || [],
    );
    renderAuctionCards(
      document.getElementById("homeAuctions"),
      auctions.items || auctions.data || [],
    );
    renderRecentlyViewed(document.getElementById("recentlyViewed"));
    observeAnimations();
  } catch (e) {
    const hp = document.getElementById("homeProducts");
    if (hp && !hp.children.length)
      renderEmptyState(hp, {
        icon: "fa-box-open",
        title: t("home.loadError"),
        desc: escapeHtml(e.message),
      });
    const ha = document.getElementById("homeAuctions");
    if (ha && !ha.children.length)
      renderEmptyState(ha, {
        icon: "fa-gavel",
        title: t("home.loadError"),
        desc: escapeHtml(e.message),
      });
  }
}

function renderAuctionCards(container, auctions) {
  if (!auctions?.length) {
    renderEmptyState(container, {
      icon: "fa-gavel",
      title: t("home.noAuctions"),
    });
    return;
  }
  container.innerHTML = auctions
    .map((a, i) => {
      const now = new Date();
      const end = new Date(a.endTime);
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const mins = Math.floor((remaining % 3600) / 60);
      const urgent = remaining > 0 && remaining <= 3600;
      const timeStr = days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`;
      const title = a.productTitle || "Auction Item";
      const price = formatPrice(a.currentHighestBid || a.startingPrice);
      const label = `${title} - ${price}`;
      return `
      <a href="#/auction-detail?id=${a.id}" class="product-card animate-on-scroll stagger-${Math.min(i + 1, 8)}${urgent ? " auction-urgent" : ""}" aria-label="${escapeHtml(label)}">
        <div class="product-card-img">
          ${a.productImageUrl ? progressiveImg(a.productImageUrl, a.productTitle || "Auction", "") : '<i class="fas fa-gavel" aria-hidden="true"></i>'}
          <button class="btn btn-sm btn-primary quick-view-btn" data-quickview-id="${a.id}" data-quickview-title="${escapeHtml(a.productTitle || "Auction Item")}" data-quickview-price="${a.currentHighestBid || a.startingPrice}" data-quickview-image="${a.productImageUrl || ""}" data-quickview-desc=""><i class="fas fa-eye"></i> Quick View</button>
        </div>
        <div class="product-card-body">
          <div class="product-card-title">${escapeHtml(title)}</div>
          <div class="current-bid">${price}</div>
          <div class="product-card-meta">
            <span><i class="fas fa-hourglass-half" aria-hidden="true"></i> ${timeStr} ${t("common.endsIn")} ${urgent ? `<span class="ending-soon-badge">${t("auction.endingSoon")}</span>` : ""}</span>
            <span class="status ${statusClass(a.status)}">${tStatus(a.status, "auction")}</span>
          </div>
        </div>
        <div class="product-card-footer">
          <small>${t("common.start")}: ${formatPrice(a.startingPrice)}</small>
          <small>${a.bidCount || 0} ${t("common.bids")}</small>
        </div>
      </a>
    `;
    })
    .join("");
  activateProgressiveImages(container);
}
