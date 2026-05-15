async function renderHome(container) {
  container.innerHTML = `
    <section class="hero hero-has-image">
      <div class="hero-overlay"></div>
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1>${t("home.welcome")}</h1>
        <p>${t("home.subtitle")}</p>
        <div class="hero-actions">
          <a href="#/products" class="btn btn-primary btn-lg"><i class="fas fa-store"></i> ${t("home.browseProducts")}</a>
          <a href="#/auctions" class="btn btn-outline btn-lg hero-btn-outline"><i class="fas fa-gavel"></i> ${t("home.viewAuctions")}</a>
        </div>
      </div>
    </section>

    <div class="features-grid">
      <div class="feature-card animate-on-scroll stagger-1"><i class="fas fa-fish"></i><h3>${t("home.qualityGear")}</h3><p>${t("home.qualityGearDesc")}</p></div>
      <div class="feature-card animate-on-scroll stagger-2"><i class="fas fa-gavel"></i><h3>${t("home.liveAuctions")}</h3><p>${t("home.liveAuctionsDesc")}</p></div>
      <div class="feature-card animate-on-scroll stagger-3"><i class="fas fa-truck"></i><h3>${t("home.fastShipping")}</h3><p>${t("home.fastShippingDesc")}</p></div>
      <div class="feature-card animate-on-scroll stagger-4"><i class="fas fa-shield-alt"></i><h3>${t("home.securePayments")}</h3><p>${t("home.securePaymentsDesc")}</p></div>
    </div>

    <div class="section-header animate-on-scroll"><h2>${t("home.latestProducts")}</h2><a href="#/products" class="btn btn-outline btn-sm">${t("home.viewAll")}</a></div>
    <div id="homeProducts" class="product-grid"></div>

    <div class="section-header section-header-offset animate-on-scroll"><h2>${t("home.activeAuctions")}</h2><a href="#/auctions" class="btn btn-outline btn-sm">${t("home.viewAll")}</a></div>
    <div id="homeAuctions" class="product-grid"></div>
    <div id="recentlyViewed"></div>
  `;

  try {
    const [products, auctions] = await Promise.all([
      api.get("/products", { pageSize: 4 }),
      api.get("/auctions", { pageSize: 4, status: "Active" }),
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

function renderProductCards(container, products) {
  if (!products?.length) {
    renderEmptyState(container, {
      icon: "fa-box-open",
      title: t("home.noProducts"),
    });
    return;
  }
  container.innerHTML = products
    .map((p, i) => {
      const title = p.title || "Product";
      return `
      <a href="#/product-detail?id=${p.id}" class="product-card card-lift animate-on-scroll stagger-${Math.min(i + 1, 8)}" aria-label="${escapeHtml(title)} - ${formatPrice(p.price)}">
        <div class="product-card-img">
          ${p.primaryImageUrl ? progressiveImg(p.primaryImageUrl, title, "") : '<i class="fas fa-image" aria-hidden="true"></i>'}
          <button class="btn btn-sm glass-btn quick-view-btn" data-quickview-id="${p.id}" data-quickview-title="${escapeHtml(title)}" data-quickview-price="${p.price}" data-quickview-image="${p.primaryImageUrl || ""}" data-quickview-desc="${escapeHtml(p.description || "")}"><i class="fas fa-expand"></i></button>
        </div>
        <div class="product-card-body">
          <div class="product-card-title">${escapeHtml(title)}</div>
          <div class="product-card-price-row">
            <span class="product-card-price">${formatPrice(p.price)}</span>
            <span class="status ${statusClass(p.status)}">${p.status || t("common.N/A")}</span>
          </div>
          <div class="product-card-meta">
            ${p.category ? `<span><i class="fas fa-tag" aria-hidden="true"></i> ${escapeHtml(p.category)}</span>` : ""}
          </div>
        </div>
        <div class="product-card-footer">
          <small>${p.condition || ""}</small>
          ${p.stock != null ? `<small>${p.stock} ${t("product.stock")}</small>` : ""}
        </div>
      </a>
    `;
    })
    .join("");
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
      const title = a.product?.title || "Auction Item";
      const price = formatPrice(a.currentHighestBid || a.startingPrice);
      const label = `${title} - ${price}`;
      return `
      <a href="#/auction-detail?id=${a.id}" class="product-card animate-on-scroll stagger-${Math.min(i + 1, 8)}${urgent ? " auction-urgent" : ""}" aria-label="${escapeHtml(label)}">
        <div class="product-card-img">
          ${a.product?.primaryImageUrl ? progressiveImg(a.product.primaryImageUrl, a.product?.title || "Auction", "") : '<i class="fas fa-gavel" aria-hidden="true"></i>'}
          <button class="btn btn-sm btn-primary quick-view-btn" data-quickview-id="${a.id}" data-quickview-title="${escapeHtml(a.product?.title || "Auction Item")}" data-quickview-price="${a.currentHighestBid || a.startingPrice}" data-quickview-image="${a.product?.primaryImageUrl || ""}" data-quickview-desc="${escapeHtml(a.product?.description || "")}"><i class="fas fa-eye"></i> Quick View</button>
        </div>
        <div class="product-card-body">
          <div class="product-card-title">${escapeHtml(title)}</div>
          <div class="current-bid">${price}</div>
          <div class="product-card-meta">
            <span><i class="fas fa-hourglass-half" aria-hidden="true"></i> ${timeStr} ${t("common.endsIn")} ${urgent ? `<span class="ending-soon-badge">${t("auction.endingSoon")}</span>` : ""}</span>
            <span class="status ${statusClass(a.status)}">${a.status}</span>
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
}
