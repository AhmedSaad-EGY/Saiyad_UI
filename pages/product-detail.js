async function renderProductDetail(container, route, params) {
  const id = params.id;
  if (!id) {
    showError(container, "Product ID is required.");
    return;
  }

  showLoading(container, "detail");

  try {
    const p = await api.get(`/products/${id}`);
    const isAvailable = p.status === "Available" || p.status === 0;

    // Fetch reviews in parallel
    const [ratingData, reviewsData, wishlistData] = await Promise.all([
      api.get(`/reviews/product/${id}/rating`).catch(() => null),
      api.get(`/reviews/product/${id}`).catch(() => null),
      isAuthenticated()
        ? api.get("/wishlist").catch(() => null)
        : Promise.resolve(null),
    ]);
    const wishlistItems = wishlistData?.items || wishlistData?.data || wishlistData || [];
    let isWishlisted = Array.isArray(wishlistItems) &&
      wishlistItems.some(w => w.productId === p.id || w.id === p.id);
    const avgRating = ratingData?.averageRating;
    const reviewCount = ratingData?.reviewCount || 0;
    const reviews =
      reviewsData?.items || reviewsData?.data || reviewsData || [];

    const allImages = [
      p.primaryImageUrl,
      ...(p.images || p.additionalImages || []).map((img) => (typeof img === "string" ? img : img.url || img)),
    ].filter(Boolean);

    container.innerHTML = `
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">${t("nav.home")}</a> <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i> <a href="#/products">${t("nav.products")}</a> <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i> <span>${escapeHtml(p.title)}</span></nav>
      <div class="detail-page">
        <div>
          <div class="detail-image" id="mainImageWrap" style="cursor:pointer;padding:0;position:relative">
            ${p.primaryImageUrl ? progressiveImg(p.primaryImageUrl, p.title, "") : '<i class="fas fa-image"></i>'}
            <div style="position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,0.5);color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;pointer-events:none"><i class="fas fa-search-plus" style="font-size:1rem"></i></div>
          </div>
        </div>
        <div class="detail-info">
          <h1>${escapeHtml(p.title)}</h1>
          <div class="detail-price">${formatPrice(p.price)}</div>
          <div class="detail-meta">
            <div class="detail-meta-item"><strong>${t("product.condition")}:</strong> ${p.condition || t("common.N/A")}</div>
            <div class="detail-meta-item"><strong>${t("product.location")}:</strong> ${escapeHtml(p.location || t("common.N/A"))}</div>
            <div class="detail-meta-item"><strong>${t("product.category")}:</strong> ${p.categoryName || t("common.N/A")}</div>
            <div class="detail-meta-item"><strong>${t("product.stock")}:</strong> ${p.stockQuantity ?? t("common.N/A")}</div>
            <div class="detail-meta-item"><strong>${t("product.status")}:</strong> <span class="status ${statusClass(p.status)}">${p.status}</span></div>
          </div>
          ${p.brand ? `<p style="margin-bottom:8px"><strong>${t("product.brand")}:</strong> ${escapeHtml(p.brand)}</p>` : ""}
          <div class="detail-desc">${escapeHtml(p.description || t("product.noDescription"))}</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <div style="display:flex;align-items:center;border:1px solid var(--border);
                   border-radius:var(--border-radius-md);overflow:hidden;height:44px">
                <button type="button" id="qtyMinus" aria-label="Decrease quantity"
                  style="width:40px;height:100%;background:var(--card-bg);border:none;
                         font-size:1.1rem;cursor:pointer;color:var(--text-primary)">−</button>
                <input type="number" id="productQty" value="1" min="1"
                  max="${p.stockQuantity || 99}" aria-label="Quantity"
                  style="width:48px;height:100%;border:none;text-align:center;
                         background:var(--card-bg);font-size:0.95rem;
                         color:var(--text-primary);font-family:inherit">
                <button type="button" id="qtyPlus" aria-label="Increase quantity"
                  style="width:40px;height:100%;background:var(--card-bg);border:none;
                         font-size:1.1rem;cursor:pointer;color:var(--text-primary)">+</button>
              </div>
              <button class="btn btn-primary btn-lg" id="addToCartBtn"
                ${!isAvailable ? "disabled" : ""} style="flex:1;min-width:160px">
                <i class="fas fa-shopping-cart"></i> ${t("product.addToCart")}
              </button>
            </div>
            <button class="btn ${isWishlisted ? 'btn-danger' : 'btn-outline'} btn-lg"
              id="addToWishlistBtn" aria-pressed="${isWishlisted}"
              title="${isWishlisted ? t('product.removeFromWishlist') || 'Remove from wishlist'
                            : t('product.wishlist')}">
              <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
              ${isWishlisted ? (t('product.removeFromWishlist') || 'Wishlisted') : t("product.wishlist")}
            </button>
            ${p.isAuctioned && p.auctionId ? `<a href="#/auction-detail?id=${p.auctionId}" class="btn btn-success btn-lg"><i class="fas fa-gavel"></i> ${t("product.viewAuction")}</a>` : !p.isAuctioned && getUser()?.id === p.sellerId && hasAnyRole("Auctioneer", "Fisherman", "BaitSeller") ? `<button class="btn btn-primary btn-lg" id="startAuctionBtn"><i class="fas fa-gavel"></i> ${t("auction.startAuction")}</button>` : ""}
            ${p.sellerId ? `<a href="#/seller-profile?userId=${p.sellerId}" class="btn btn-outline btn-lg"><i class="fas fa-envelope"></i> ${t("product.contactSeller")}</a>` : ""}
          </div>
          ${p.sellerId ? `<div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--border)"><strong>${t("product.seller")}:</strong> <a href="#/seller-profile?userId=${p.sellerId}" style="color:var(--primary)">${escapeHtml(p.sellerName || t("common.N/A"))}</a></div>` : ""}

          <!-- Reviews section -->
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid var(--border)" id="reviewsSection">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px">
              <h3><i class="fas fa-star" style="color:#f59e0b"></i> ${t("review.title")} ${avgRating ? `(${renderStars(avgRating)} ${avgRating.toFixed(1)})` : ""}</h3>
              ${isAuthenticated() ? `<button class="btn btn-outline btn-sm" id="showReviewForm">${t("review.writeReview")}</button>` : ""}
            </div>
            ${
              isAuthenticated()
                ? `
            <div id="reviewFormContainer" class="hidden card card-sm" style="margin-bottom:16px">
              <div id="reviewAlert"></div>
              <div class="form-group">
                <label class="form-label">${t("review.rating")}</label>
                <div id="starRating" style="display:flex;gap:6px;font-size:1.5rem;cursor:pointer;color:var(--text-muted)">
                  ${[1, 2, 3, 4, 5].map((i) => `<i class="fas fa-star" data-star="${i}" style="transition:color 0.15s,transform 0.15s"></i>`).join("")}
                </div>
                <input type="hidden" id="ratingVal" value="0">
              </div>
              <div class="form-group">
                <label class="form-label">${t("review.comment")}</label>
                <textarea class="form-input" id="reviewComment" rows="3" placeholder="${t("review.rateProduct")}" style="resize:vertical"></textarea>
              </div>
              <button class="btn btn-primary btn-sm" id="reviewSubmit"><i class="fas fa-paper-plane"></i> ${t("review.submit")}</button>
            </div>
            `
                : `<p style="color:var(--text-muted);font-size:0.9rem"><a href="#/login" style="color:var(--primary)">${t("auth.login")}</a> ${t("review.title")}</p>`
            }
            <div id="reviewsList">
              ${
                reviews.length
                  ? reviews
                      .map(
                        (r) => `
                <div class="notif-item">
                  <div style="flex:1">
                    <strong>${escapeHtml(r.userName || "User")}</strong>
                    <span style="color:#f59e0b">${renderStars(r.rating)}</span>
                    ${r.comment ? `<p style="color:var(--text-secondary);font-size:0.9rem;margin-top:4px">${escapeHtml(r.comment)}</p>` : ""}
                    <small style="color:var(--text-muted)">${formatDate(r.createdAt)}</small>
                  </div>
                </div>
              `,
                      )
                      .join("")
                  : `<p style="color:var(--text-muted);text-align:center;padding:20px">${t("review.noReviews")}</p>`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // Similar products
    (async () => {
      try {
        const similar = await api.get("/products", {
          categoryId: p.categoryId,
          pageSize: 4,
        });
        const items = similar.items || similar.data || [];
        if (items.length) {
          const section = document.createElement("div");
          section.style.marginTop = "40px";
          section.innerHTML = `<div class="section-header"><h2><i class="fas fa-layer-group"></i> ${t("products.similar")}</h2></div><div class="product-grid" id="similarGrid"></div>`;
          container.appendChild(section);
          const grid = document.getElementById("similarGrid");
          renderProductCards(
            grid,
            items.filter((s) => s.id !== p.id).slice(0, 4),
          );
          observeAnimations();
        }
      } catch {}
    })();

    // Track recently viewed
    trackRecentlyViewed(p.id, p.title, p.primaryImageUrl, p.price, "product");

    // Lightbox: main image click
    document.getElementById("mainImageWrap")?.addEventListener("click", () => {
      if (allImages.length) openLightbox(allImages, 0);
    });
    if (isAvailable) {
      const qtyInput = document.getElementById("productQty");
      document.getElementById("qtyMinus")?.addEventListener("click", () => {
        const v = parseInt(qtyInput.value) || 1;
        if (v > 1) qtyInput.value = v - 1;
      });
      document.getElementById("qtyPlus")?.addEventListener("click", () => {
        const v = parseInt(qtyInput.value) || 1;
        const max = parseInt(qtyInput.max) || 99;
        if (v < max) qtyInput.value = v + 1;
      });
      document
        .getElementById("addToCartBtn")
        .addEventListener("click", async () => {
          if (!(await requireAuth())) return;
          try {
            await api.post("/cart/items", {
              productId: p.id,
              quantity: parseInt(document.getElementById("productQty")?.value) || 1
            });
            showToast(t("product.addedToCart"), "success");
            updateCartBadge();
          } catch (e) {
            showToast(e.message, "error");
          }
        });
    }

    document
      .getElementById("addToWishlistBtn")
      .addEventListener("click", async () => {
        if (!(await requireAuth())) return;
        try {
          await api.post("/wishlist/toggle", { productId: p.id });
          isWishlisted = !isWishlisted;
          const wBtn = document.getElementById("addToWishlistBtn");
          if (wBtn) {
            wBtn.className = `btn ${isWishlisted ? 'btn-danger' : 'btn-outline'} btn-lg`;
            wBtn.setAttribute("aria-pressed", String(isWishlisted));
            wBtn.title = isWishlisted
              ? t('product.removeFromWishlist') || 'Remove from wishlist'
              : t('product.wishlist');
            wBtn.innerHTML = `<i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
              ${isWishlisted ? (t('product.removeFromWishlist') || 'Wishlisted') : t("product.wishlist")}`;
          }
          showToast(
            isWishlisted ? t("product.addedToWishlist") || t("product.wishlistUpdated")
                       : t("product.removedFromWishlist") || t("product.wishlistUpdated"),
            "success"
          );
        } catch (e) {
          showToast(e.message, "error");
        }
      });

    // Start Auction button on product detail
    document.getElementById("startAuctionBtn")?.addEventListener("click", () => {
      const minEnd = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
      const prevFocus = document.activeElement;
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-label", "Start Auction");
      overlay.innerHTML = `
        <div class="modal" onclick="event.stopPropagation()" style="max-width:460px">
          <h3><i class="fas fa-gavel"></i> ${t("auctions.title")} — ${escapeHtml(p.title)}</h3>
          <div id="auctionModalAlert"></div>
          <form id="auctionModalForm" novalidate>
            <div class="form-group">
              <label class="form-label">${t("auction.end")} *</label>
              <input type="datetime-local" class="form-input" id="auctionEndTime" min="${minEnd}" required>
            </div>
            <div class="form-group">
              <label class="form-label">${t("auction.startingPrice")} *</label>
              <input type="number" class="form-input" id="auctionStartPrice" min="0.01" step="0.01" required>
            </div>
            <div class="form-group">
              <label class="form-label">${t("auction.reservePrice")}</label>
              <input type="number" class="form-input" id="auctionReservePrice" min="0" step="0.01" value="0">
            </div>
            <div class="form-group">
              <label class="form-label">${t("auction.minIncrement")} *</label>
              <input type="number" class="form-input" id="auctionMinIncrement" min="0.01" step="0.01" value="1" required>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" id="auctionModalCancel">${t("common.cancel") || "Cancel"}</button>
              <button type="submit" class="btn btn-primary" id="auctionModalSubmit"><i class="fas fa-gavel"></i> ${t("auctions.title")}</button>
            </div>
          </form>
        </div>`;
      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
      document.body.appendChild(overlay);
      function close() { overlay.remove(); document.removeEventListener("keydown", onKey); if (prevFocus?.focus) prevFocus.focus(); }
      function onKey(e) { if (e.key === "Escape") close(); }
      document.addEventListener("keydown", onKey);
      document.getElementById("auctionModalCancel").addEventListener("click", close);
      document.getElementById("auctionModalForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const submit = document.getElementById("auctionModalSubmit");
        const alertDiv = document.getElementById("auctionModalAlert");
        alertDiv.innerHTML = "";
        submit.disabled = true;
        submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("auction.placingBid")}`;
        try {
          await api.post("/auctions", {
            productId: p.id,
            endTime: new Date(document.getElementById("auctionEndTime").value).toISOString(),
            startingPrice: parseFloat(document.getElementById("auctionStartPrice").value),
            reservePrice: parseFloat(document.getElementById("auctionReservePrice").value) || 0,
            minimumIncrement: parseFloat(document.getElementById("auctionMinIncrement").value) || 1,
          });
          showToast(t("auctions.title") + " started!", "success");
          close();
          router(); // Re-render page to show "View Auction" button
        } catch (err) {
          alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
        } finally {
          submit.disabled = false;
          submit.textContent = t("auctions.title");
        }
      });
    });

    // Toggle review form
    document.getElementById("showReviewForm")?.addEventListener("click", () => {
      if (!isAuthenticated()) { showToast(t("auth.loginRequired") || "Please log in to write a review.", "warning"); return; }
      const form = document.getElementById("reviewFormContainer");
      if (!form) { showToast(t("auth.loginRequired") || "Please log in to write a review.", "warning"); return; }
      form.classList.toggle("hidden");
      form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    // Star rating interaction
    const stars = document.querySelectorAll("#starRating .fa-star");
    const ratingVal = document.getElementById("ratingVal");
    stars.forEach((star) => {
      star.setAttribute("tabindex", "0");
      star.setAttribute("role", "button");
      star.addEventListener("mouseenter", () => {
        const v = parseInt(star.dataset.star);
        stars.forEach((s) => {
          s.style.color =
            parseInt(s.dataset.star) <= v ? "#f59e0b" : "var(--text-muted)";
          s.style.transform =
            parseInt(s.dataset.star) <= v ? "scale(1.2)" : "scale(1)";
        });
      });
      star.addEventListener("mouseleave", () => {
        const selected = parseInt(ratingVal.value);
        stars.forEach((s) => {
          s.style.color =
            parseInt(s.dataset.star) <= selected
              ? "#f59e0b"
              : "var(--text-muted)";
          s.style.transform = "scale(1)";
        });
      });
      star.addEventListener("click", () => {
        ratingVal.value = star.dataset.star;
        stars.forEach((s) => {
          s.style.color =
            parseInt(s.dataset.star) <= parseInt(star.dataset.star)
              ? "#f59e0b"
              : "var(--text-muted)";
          s.style.transform = "scale(1)";
        });
      });
      star.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          star.click();
        }
      });
    });

    document
      .getElementById("reviewSubmit")
      ?.addEventListener("click", async () => {
        const submit = document.getElementById("reviewSubmit");
        const rating = parseInt(ratingVal.value);
        const comment = document.getElementById("reviewComment").value.trim();
        const alertDiv = document.getElementById("reviewAlert");
        if (!rating) {
          alertDiv.innerHTML = `<div class="alert alert-error">${t("review.rating")}</div>`;
          return;
        }
        submit.disabled = true;
        submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("review.submitting")}`;
        try {
          await api.post("/reviews", { productId: p.id, rating, comment });
          showToast(t("review.submitted"), "success");
          document
            .getElementById("reviewFormContainer")
            .classList.add("hidden");
          document.getElementById("reviewComment").value = "";
          ratingVal.value = "0";
          stars.forEach((s) => {
            s.style.color = "var(--text-muted)";
            s.style.transform = "scale(1)";
          });
          const reviewsList = document.getElementById("reviewsList");
          const user = getUser();
          const noReviewsMsg = reviewsList?.querySelector("p");
          if (noReviewsMsg) noReviewsMsg.remove();
          if (reviewsList) {
            const newReview = document.createElement("div");
            newReview.className = "notif-item";
            newReview.style.animation = "slideUp 0.3s ease";
            newReview.innerHTML = `
              <div style="flex:1">
                <strong>${escapeHtml(user?.fullName || "You")}</strong>
                <span style="color:#f59e0b">${renderStars(rating)}</span>
                ${comment ? `<p style="color:var(--text-secondary);font-size:0.9rem;margin-top:4px">
                  ${escapeHtml(comment)}</p>` : ""}
                <small style="color:var(--text-muted)">${formatDate(new Date().toISOString())}</small>
              </div>`;
            reviewsList.insertAdjacentElement("afterbegin", newReview);
          }
        } catch (err) {
          alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
        } finally {
          submit.disabled = false;
          submit.textContent = t("review.submit");
        }
      });
  } catch (e) {
    showError(container, e.message);
  }
}
