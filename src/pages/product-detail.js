import { t, getCurrentLang } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { isAuthenticated, getUser, hasAnyRole, requireAuth, updateCartBadge } from '../core/auth/index.js';
import { SELLER_ROLES } from '../shared/constants/roles.js';
import { router, registerRouteCleanup } from '../core/router/index.js';
import { showError, showLoading, escapeHtml, progressiveImg, observeAnimations, fadeInContent, animate, safeSetHTML } from '../core/utils/dom.js';
import { formatPrice, formatDate, statusClass, tStatus, tCondition, renderStars } from '../core/utils/format.js';
import { renderProductCards, openLightbox, trackRecentlyViewed, showToast } from '../core/utils/ui.js';

export default async function renderProductDetail(container, route, params) {
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
    const reviews =
      reviewsData?.items || reviewsData?.data || reviewsData || [];

    const allImages = [
      p.primaryImageUrl,
      ...(p.images || p.additionalImages || []).map((img) => (typeof img === "string" ? img : img.url || img)),
    ].filter(Boolean);

    // Calculate stock percentage (mock logic based on 100 max)
    const stockQty = p.stockQuantity ?? 0;
    const stockLevel = stockQty > 50 ? 'high' : stockQty > 10 ? 'medium' : 'low';
    const stockPct = Math.min(100, Math.max(0, stockQty));

    container.innerHTML = `
      <nav class="breadcrumb" aria-label="${t('common.breadcrumb')}"><a href="#/">${t("nav.home")}</a> <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i> <a href="#/products">${t("nav.products")}</a> <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i> <span>${escapeHtml(p.categoryName || t('common.category'))}</span> <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i> <span>${escapeHtml(p.title)}</span></nav>
      <div class="row g-5">
        <div class="col-lg-6">
          <div class="detail-image p-0 image-magnifier-wrap" id="mainImageWrap">
            ${p.primaryImageUrl ? `<img src="${escapeHtml(p.primaryImageUrl)}" id="mainImg" alt="${escapeHtml(p.title)}" style="width:100%;height:100%;object-fit:cover" loading="lazy" decoding="async" fetchpriority="high"><div class="magnifier-lens" id="magLens"></div>` : '<i class="fas fa-image" aria-hidden="true"></i>'}
            <div class="rounded-circle d-flex align-items-center justify-content-center" style="position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,0.5);color:#fff;width:36px;height:36px;pointer-events:none"><i class="fas fa-search-plus" aria-hidden="true"></i></div>
          </div>
        </div>
        <div class="col-lg-6">
        <div class="detail-info">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h1 class="mb-0" style="margin-right:12px">${escapeHtml(p.title)}</h1>
            <button class="btn btn-ghost btn-icon btn-sm mt-1" id="shareBtn" aria-label="${t('common.share')}" title="${t('common.share')}"><i class="fas fa-share-alt" aria-hidden="true"></i></button>
          </div>
          <div class="detail-price">${formatPrice(p.price)}</div>
          
          <div class="stock-indicator">
            <span class="stock-label stock-${stockLevel}">${p.stockQuantity !== null ? p.stockQuantity + ' ' + t("products.inStock") : t("common.N/A")}</span>
            <div class="stock-bar"><div class="stock-bar-fill stock-${stockLevel}" style="width:${stockPct}%"></div></div>
          </div>

          <div class="detail-meta mt-3">
            <div class="detail-meta-item"><strong>${t("product.condition")}:</strong> ${tCondition(p.condition)}</div>
            <div class="detail-meta-item"><strong>${t("product.location")}:</strong> ${escapeHtml(p.location || t("common.N/A"))}</div>
            <div class="detail-meta-item"><strong>${t("product.category")}:</strong> ${p.categoryName || t("common.N/A")}</div>
            <div class="detail-meta-item"><strong>${t("product.status")}:</strong> <span class="status ${statusClass(p.status)}">${tStatus(p.status, "product")}</span></div>
          </div>
          ${p.brand ? `<p class="mb-2 mt-2"><strong>${t("product.brand")}:</strong> ${escapeHtml(p.brand)}</p>` : ""}
          <div class="detail-desc mt-3">${escapeHtml(p.description || t("product.noDescription"))}</div>
          <div class="d-flex gap-3 flex-wrap">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <div class="qty-btn-group">
                <button type="button" class="qty-btn" id="qtyMinus" aria-label="${t('product.decreaseQty')}">−</button>
                <input type="number" id="productQty" value="1" min="1"
                  max="${p.stockQuantity || 99}" aria-label="${t('product.quantity')}" class="cart-qty-input">
                <button type="button" class="qty-btn" id="qtyPlus" aria-label="${t('product.increaseQty')}">+</button>
              </div>
              <button class="btn btn-primary btn-lg" id="addToCartBtn"
                ${!isAvailable ? "disabled" : ""} style="flex:1;min-width:140px">
                <i class="fas fa-shopping-cart" aria-hidden="true"></i> ${t("product.addToCart")}
              </button>
            </div>
            <button class="btn ${isWishlisted ? 'btn-danger' : 'btn-outline'} btn-lg"
              id="addToWishlistBtn" aria-pressed="${isWishlisted}"
              title="${isWishlisted ? t('product.removeFromWishlist')
                            : t('product.wishlist')}">
              <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
              ${isWishlisted ? t('product.removeFromWishlist') : t("product.wishlist")}
            </button>
            ${p.isAuctioned && p.auctionId ? `<a href="#/auction-detail?id=${p.auctionId}" class="btn btn-success btn-lg"><i class="fas fa-gavel" aria-hidden="true"></i> ${t("product.viewAuction")}</a>` : !p.isAuctioned && getUser()?.id === p.sellerId && hasAnyRole(...(SELLER_ROLES)) ? `<button class="btn btn-primary btn-lg" id="startAuctionBtn"><i class="fas fa-gavel" aria-hidden="true"></i> ${t("auction.startAuction")}</button>` : ""}
            ${p.sellerId ? `<a href="#/seller-profile?userId=${p.sellerId}" class="btn btn-outline btn-lg"><i class="fas fa-envelope" aria-hidden="true"></i> ${t("product.contactSeller")}</a>` : ""}
          </div>
          
          <!-- Seller info card -->
          ${p.sellerId ? `
          <a href="#/seller-profile?userId=${p.sellerId}" class="seller-info-card mt-4" style="text-decoration:none;color:inherit">
            <div class="seller-avatar">${escapeHtml(p.sellerName || '?').charAt(0).toUpperCase()}</div>
            <div class="seller-info-details">
              <div class="seller-info-name">${escapeHtml(p.sellerName || t("common.N/A"))}</div>
              <div class="seller-info-meta"><i class="fas fa-store" aria-hidden="true"></i> ${t('common.viewProfile')}</div>
            </div>
            <i class="fas fa-chevron-${getCurrentLang() === 'ar' ? 'left' : 'right'} text-muted" aria-hidden="true"></i>
          </a>` : ""}

          <!-- Reviews section -->
          <div class="mt-4 pt-4" style="border-top:1px solid var(--border)" id="reviewsSection">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h3><i class="fas fa-star text-warning" aria-hidden="true"></i> ${t("review.title")} ${avgRating ? `(${renderStars(avgRating)} ${avgRating.toFixed(1)})` : ""}</h3>
              <div class="d-flex gap-2">
                <select id="reviewSort" class="form-select form-select-sm" style="width:130px;height:34px;font-size:0.85rem">
                  <option value="newest">${t("products.newest")}</option>
                  <option value="highest">${t("products.priceHighLow") ? t("products.priceHighLow").replace('Price', 'Highest') : 'Highest Rated'}</option>
                  <option value="lowest">${t("products.priceLowHigh") ? t("products.priceLowHigh").replace('Price', 'Lowest') : 'Lowest Rated'}</option>
                </select>
                ${isAuthenticated() ? `<button class="btn btn-outline btn-sm" id="showReviewForm">${t("review.writeReview")}</button>` : ""}
              </div>
            </div>
            ${
              isAuthenticated()
                ? `
            <div id="reviewFormContainer" class="d-none card card-sm mb-3">
              <div id="reviewAlert"></div>
              <div class="form-group">
                <label class="form-label">${t("review.rating")}</label>
                <div id="starRating" role="radiogroup" aria-label="${t("review.rating")}" class="d-flex gap-2 fs-4 text-muted" style="cursor:pointer">
                  ${[1, 2, 3, 4, 5].map((i) => `<i class="fas fa-star" data-star="${i}" role="radio" aria-checked="false" aria-label="${i} ${t("review.stars")}" style="transition:color 0.15s,transform 0.15s"></i>`).join("")}
                </div>
                <input type="hidden" id="ratingVal" value="0">
              </div>
              <div class="form-group">
                <label class="form-label">${t("review.comment")}</label>
                <textarea class="form-textarea form-control" id="reviewComment" rows="3" placeholder="${t("review.rateProduct")}" style="resize:vertical"></textarea>
              </div>
              <button class="btn btn-primary btn-sm" id="reviewSubmit"><i class="fas fa-paper-plane" aria-hidden="true"></i> ${t("review.submit")}</button>
            </div>
            `
                : `<p class="text-muted small"><a href="#/login" class="text-primary">${t("auth.login")}</a> ${t("review.title")}</p>`
            }
            <div id="reviewsList"></div>
            <div id="reviewPagination" class="text-center mt-3 d-none">
              <button class="btn btn-ghost btn-sm" id="loadMoreReviewsBtn">${t("common.loadMore")}</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile sticky add-to-cart -->
      <div class="mobile-sticky-bar" id="mobileStickyCart">
        <div class="current-bid-mini">
          <small>${t("cart.price")}</small>
          <span>${formatPrice(p.price)}</span>
        </div>
        <button class="btn btn-primary" id="mobileAddToCartBtn" ${!isAvailable ? "disabled" : ""}>
          <i class="fas fa-shopping-cart" aria-hidden="true"></i> ${t("product.addToCart")}
        </button>
      </div>
    </div>
    `;

    fadeInContent(container);

    // Initial render for reviews
    const reviewsList = document.getElementById("reviewsList");
    let currentReviewPage = 1;
    let sortedReviews = [...reviews];
    const renderReviews = (reviewsArr, page = 1) => {
      const pageSize = 5;
      const paginated = reviewsArr.slice(0, page * pageSize);
      if (paginated.length === 0) {
        safeSetHTML(reviewsList, `<p class="text-muted text-center p-4">${t("review.noReviews")}</p>`);
      } else {
        safeSetHTML(reviewsList, paginated.map(r => `
          <div class="notif-item">
            <div class="flex-fill">
              <strong>${escapeHtml(r.userName || "User")}</strong>
              <span class="text-warning">${renderStars(r.rating)}</span>
              ${r.comment ? `<p class="mt-1" style="color:var(--text-secondary);font-size:0.9rem">${escapeHtml(r.comment)}</p>` : ""}
              <small class="text-muted">${formatDate(r.createdAt)}</small>
            </div>
          </div>
        `).join(''));
      }
      const loadMoreBtn = document.getElementById("reviewPagination");
      if (reviewsArr.length > page * pageSize) loadMoreBtn.classList.remove("d-none");
      else loadMoreBtn.classList.add("d-none");
    };

    renderReviews(sortedReviews, currentReviewPage);

    // Review Sorting
    document.getElementById("reviewSort")?.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === 'highest') sortedReviews = [...reviews].sort((a,b) => b.rating - a.rating);
      else if (val === 'lowest') sortedReviews = [...reviews].sort((a,b) => a.rating - b.rating);
      else sortedReviews = [...reviews].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      currentReviewPage = 1;
      renderReviews(sortedReviews, currentReviewPage);
    });

    document.getElementById("loadMoreReviewsBtn")?.addEventListener("click", () => {
      currentReviewPage++;
      renderReviews(sortedReviews, currentReviewPage);
    });

    // Share Button
    document.getElementById("shareBtn")?.addEventListener("click", async () => {
      const shareData = {
        title: p.title,
        text: `Check out ${p.title} on Sayiad!`,
        url: window.location.href,
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (e) { /* ignore */ }
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast(t("common.linkCopied"), "success");
      }
    });

    // Image Magnifier
    const mainImgWrap = document.getElementById("mainImageWrap");
    const mainImg = document.getElementById("mainImg");
    const magLens = document.getElementById("magLens");
    
    if (mainImgWrap && mainImg && magLens && allImages.length) {
      mainImgWrap.addEventListener("mousemove", (e) => {
        const rect = mainImgWrap.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        // Lens dimensions (160px)
        const lensW = 160;
        const lensH = 160;
        
        // Prevent lens from going outside the image
        if (x > rect.width - lensW / 2) { x = rect.width - lensW / 2; }
        if (x < lensW / 2) { x = lensW / 2; }
        if (y > rect.height - lensH / 2) { y = rect.height - lensH / 2; }
        if (y < lensH / 2) { y = lensH / 2; }
        
        magLens.style.left = (x - lensW / 2) + "px";
        magLens.style.top = (y - lensH / 2) + "px";
        
        // Set background image and position for zoom effect (2x zoom)
        const cx = mainImg.offsetWidth / lensW * 2;
        const cy = mainImg.offsetHeight / lensH * 2;
        magLens.style.backgroundImage = `url('${escapeHtml(p.primaryImageUrl)}')`;
        magLens.style.backgroundSize = `${mainImg.offsetWidth * 2}px ${mainImg.offsetHeight * 2}px`;
        magLens.style.backgroundPosition = `-${(x * 2) - lensW / 2}px -${(y * 2) - lensH / 2}px`;
      });
      mainImgWrap.addEventListener("click", () => openLightbox(allImages, 0));
    }

    // Mobile swipe support for image gallery
    (function initGallerySwipe() {
      const wrap = document.getElementById("mainImageWrap");
      if (!wrap) return;
      let startX = 0, startY = 0;
      wrap.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });
      wrap.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
        const currentSrc = document.getElementById("mainImg")?.src;
        const currentIndex = currentSrc ? allImages.findIndex(img => currentSrc.includes(encodeURIComponent(img.split('/').pop() || img))) : -1;
        const active = currentIndex >= 0 ? currentIndex : 0;
        const next = dx < 0 ? Math.min(active + 1, allImages.length - 1) : Math.max(active - 1, 0);
        if (next !== active) {
          const mainImg = document.getElementById("mainImg");
          if (mainImg) {
            mainImg.src = allImages[next];
            const magLens = document.getElementById("magLens");
            if (magLens) magLens.style.backgroundImage = `url('${escapeHtml(allImages[next])}')`;
          }
        }
      }, { passive: true });
    })();

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
          section.classList.add("mt-5");
          section.innerHTML = `<div class="section-header"><h2><i class="fas fa-layer-group" aria-hidden="true"></i> ${t("products.similar")}</h2></div><div class="row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4" id="similarGrid"></div>`;
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
      const handleAddToCart = async (btnId) => {
        if (!(await requireAuth())) return;
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}`;
        try {
          await api.post("/cart/items", {
            productId: p.id,
            quantity: parseInt(document.getElementById("productQty")?.value) || 1
          });
          showToast(t("product.addedToCart"), "success");
          updateCartBadge();
        } catch (e) {
          const msg = e.status === 400 ? t('cart.insufficientStock', { stock: p.stockQuantity || 0 }) : e.message;
          showToast(msg, "error");
        } finally {
          btn.disabled = false;
          btn.innerHTML = `<i class="fas fa-shopping-cart" aria-hidden="true"></i> ${t("product.addToCart")}`;
        }
      };

      document.getElementById("addToCartBtn")?.addEventListener("click", () => handleAddToCart("addToCartBtn"));
      document.getElementById("mobileAddToCartBtn")?.addEventListener("click", () => handleAddToCart("mobileAddToCartBtn"));
    }

    document
      .getElementById("addToWishlistBtn")
      ?.addEventListener("click", async () => {
        if (!(await requireAuth())) return;
        const prevWishlisted = isWishlisted;
        isWishlisted = !isWishlisted;
        const wBtn = document.getElementById("addToWishlistBtn");
        if (wBtn) {
          wBtn.className = `btn ${isWishlisted ? 'btn-danger' : 'btn-outline'} btn-lg`;
          wBtn.setAttribute("aria-pressed", String(isWishlisted));
          wBtn.title = isWishlisted
            ? t('product.removeFromWishlist')
            : t('product.wishlist');
          wBtn.innerHTML = `<i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
            ${isWishlisted ? t('product.removeFromWishlist') : t("product.wishlist")}`;
        }
        try {
          await api.post("/wishlist/toggle", { productId: p.id });
          showToast(
            isWishlisted ? t("product.addedToWishlist")
                       : t("product.removedFromWishlist"),
            "success"
          );
        } catch (e) {
          isWishlisted = prevWishlisted;
          if (wBtn) {
            wBtn.className = `btn ${isWishlisted ? 'btn-danger' : 'btn-outline'} btn-lg`;
            wBtn.setAttribute("aria-pressed", String(isWishlisted));
            wBtn.title = isWishlisted
              ? t('product.removeFromWishlist')
              : t('product.wishlist');
            wBtn.innerHTML = `<i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
              ${isWishlisted ? t('product.removeFromWishlist') : t("product.wishlist")}`;
          }
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
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Start Auction");
      overlay.innerHTML = `
        <div class="modal" onclick="event.stopPropagation()" style="max-width:460px">
          <h3><i class="fas fa-gavel" aria-hidden="true"></i> ${t("auctions.title")} — ${escapeHtml(p.title)}</h3>
          <div id="auctionModalAlert"></div>
          <form id="auctionModalForm" novalidate>
            <div class="form-group">
              <label class="form-label">${t("auction.end")} *</label>
              <input type="datetime-local" class="form-input form-control" id="auctionEndTime" min="${minEnd}" required>
            </div>
            <div class="form-group">
              <label class="form-label">${t("auction.startingPrice")} *</label>
              <input type="number" class="form-input form-control" id="auctionStartPrice" min="0.01" step="0.01" required>
            </div>
            <div class="form-group">
              <label class="form-label">${t("auction.reservePrice")}</label>
              <input type="number" class="form-input form-control" id="auctionReservePrice" min="0" step="0.01" value="0">
            </div>
            <div class="form-group">
              <label class="form-label">${t("auction.minIncrement")} *</label>
              <input type="number" class="form-input form-control" id="auctionMinIncrement" min="0.01" step="0.01" value="1" required>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" id="auctionModalCancel">${t("common.cancel") || "Cancel"}</button>
              <button type="submit" class="btn btn-primary" id="auctionModalSubmit"><i class="fas fa-gavel" aria-hidden="true"></i> ${t("auctions.title")}</button>
            </div>
          </form>
        </div>`;
      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
      document.body.appendChild(overlay);
      animate(overlay, 'fadeIn', { duration: '0.2s' });
      function close() { overlay.remove(); document.removeEventListener("keydown", onKey); if (prevFocus?.focus) prevFocus.focus(); }
      function onKey(e) { if (e.key === "Escape") close(); }
      document.addEventListener("keydown", onKey);
      registerRouteCleanup(() => { document.removeEventListener("keydown", onKey); if (overlay?.isConnected) overlay.remove(); });
      document.getElementById("auctionModalCancel").addEventListener("click", close);
      document.getElementById("auctionModalForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const submit = document.getElementById("auctionModalSubmit");
        const alertDiv = document.getElementById("auctionModalAlert");
        alertDiv.innerHTML = "";
        submit.disabled = true;
        submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("auction.placingBid")}`;
        try {
          await api.post("/auctions", {
            productId: p.id,
            endTime: new Date(document.getElementById("auctionEndTime").value).toISOString(),
            startingPrice: parseFloat(document.getElementById("auctionStartPrice").value),
            reservePrice: parseFloat(document.getElementById("auctionReservePrice").value) || 0,
            minimumIncrement: parseFloat(document.getElementById("auctionMinIncrement").value) || 1,
          });
          showToast(`${t("auctions.title")  } started!`, "success");
          close();
          router(); // Re-render page to show "View Auction" button
        } catch (err) {
          safeSetHTML(alertDiv, `<div class="alert alert-error">${escapeHtml(err.message)}</div>`);
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
      form.classList.toggle("d-none");
      form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    // Star rating interaction
    const stars = document.querySelectorAll("#starRating .fa-star");
    const ratingVal = document.getElementById("ratingVal");
    stars.forEach((star) => {
      star.setAttribute("tabindex", "0");
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
          s.setAttribute("aria-checked", String(parseInt(s.dataset.star) === parseInt(star.dataset.star)));
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
        submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("review.submitting")}`;
        try {
          await api.post("/reviews", { productId: p.id, rating, comment });
          showToast(t("review.submitted"), "success");
          document
            .getElementById("reviewFormContainer")
            .classList.add("d-none");
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
            newReview.style.animation = "";
            animate(newReview, 'fadeInUp', { duration: '0.3s' });
            safeSetHTML(newReview, `
              <div class="flex-fill">
                <strong>${escapeHtml(user?.fullName || "You")}</strong>
                <span class="text-warning">${renderStars(rating)}</span>
                ${comment ? `<p class="mt-1" style="color:var(--text-secondary);font-size:0.9rem">
                  ${escapeHtml(comment)}</p>` : ""}
                <small class="text-muted">${formatDate(new Date().toISOString())}</small>
              </div>`);
            reviewsList.insertAdjacentElement("afterbegin", newReview);
          }
        } catch (err) {
          safeSetHTML(alertDiv, `<div class="alert alert-error">${escapeHtml(err.message)}</div>`);
        } finally {
          submit.disabled = false;
          submit.textContent = t("review.submit");
        }
      });
  } catch (e) {
    showError(container, e.message);
  }
}
