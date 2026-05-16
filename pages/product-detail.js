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
    const [ratingData, reviewsData] = await Promise.all([
      api.get(`/reviews/product/${id}/rating`).catch(() => null),
      api.get(`/reviews/product/${id}`).catch(() => null),
    ]);
    const avgRating = ratingData?.averageRating;
    const reviewCount = ratingData?.reviewCount || 0;
    const reviews =
      reviewsData?.items || reviewsData?.data || reviewsData || [];

    const allImages = [p.primaryImageUrl].filter(Boolean);

    container.innerHTML = `
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">${t("nav.home")}</a> <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i> <a href="#/products">${t("nav.products")}</a> <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i> <span>${escapeHtml(p.title)}</span></nav>
      <div class="detail-page">
        <div>
          <div class="detail-image" id="mainImageWrap" style="cursor:pointer;padding:0">
            ${p.primaryImageUrl ? progressiveImg(p.primaryImageUrl, p.title, "") : '<i class="fas fa-image"></i>'}
          </div>
          ${allImages.length > 1 ? `<div style="display:flex;gap:8px;margin-top:12px;overflow-x:auto">${allImages.map((url, i) => `<img src="${url}" class="thumb-img${i === 0 ? " thumb-active" : ""}" data-index="${i}" style="width:80px;height:80px;object-fit:cover;border-radius:4px;cursor:pointer;border:2px solid transparent;transition:border-color var(--transition)" loading="lazy">`).join("")}</div>` : ""}
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
            <button class="btn btn-primary btn-lg" id="addToCartBtn" ${!isAvailable ? "disabled" : ""}><i class="fas fa-shopping-cart"></i> ${t("product.addToCart")}</button>
            <button class="btn btn-outline btn-lg" id="addToWishlistBtn"><i class="fas fa-heart"></i> ${t("product.wishlist")}</button>
            ${p.isAuctioned && p.auctionId ? `<a href="#/auction-detail?id=${p.auctionId}" class="btn btn-success btn-lg"><i class="fas fa-gavel"></i> ${t("product.viewAuction")}</a>` : ""}
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
                  ${[5, 4, 3, 2, 1].map((i) => `<i class="fas fa-star" data-star="${i}" style="transition:color 0.15s,transform 0.15s"></i>`).join("")}
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

    // Contact seller
    if (p.sellerId) {
      const mainActions = container.querySelector(
        ".detail-info > div:nth-child(5)",
      );
      if (mainActions) {
        const contactBtn = document.createElement("a");
        contactBtn.href = `#/seller-profile?userId=${p.sellerId}`;
        contactBtn.className = "btn btn-outline btn-lg";
        contactBtn.innerHTML = `<i class="fas fa-envelope"></i> Contact Seller`;
        mainActions.appendChild(contactBtn);
      }
    }

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
          section.innerHTML = `<div class="section-header"><h2><i class="fas fa-tag"></i> ${t("products.title")}</h2></div><div class="product-grid" id="similarGrid"></div>`;
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
    // Thumbnail click to change main image
    $$(".thumb-img").forEach((el) => {
      el.addEventListener("click", () => {
        const idx = parseInt(el.dataset.index);
        const main = document.querySelector("#mainImageWrap img");
        if (main) {
          main.src = allImages[idx];
          main.alt = "";
        }
        $$(".thumb-img").forEach((t) => (t.style.borderColor = "transparent"));
        el.style.borderColor = "var(--primary)";
      });
    });

    if (isAvailable) {
      document
        .getElementById("addToCartBtn")
        .addEventListener("click", async () => {
          if (!(await requireAuth())) return;
          try {
            await api.post("/cart/items", { productId: p.id, quantity: 1 });
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
          // Assuming wishlist items are added via a sub-resource, similar to cart items
          await api.post("/wishlist/items", { productId: p.id });
          showToast(t("product.wishlistUpdated"), "success");
        } catch (e) {
          showToast(e.message, "error");
        }
      });

    // Star rating interaction
    const stars = document.querySelectorAll("#starRating .fa-star");
    const ratingVal = document.getElementById("ratingVal");
    stars.forEach((star) => {
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
          stars.forEach((s) => (s.style.color = "var(--text-muted)"));
          router();
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
