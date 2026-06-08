import { t } from '../app/i18n.js';
import { isAuthenticated, getUser, hasAnyRole, requireAuth } from '../features/auth/login.js';
import { updateCartBadge } from '../widgets/layout/navbar.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { SELLER_ROLES } from '../shared/constants/roles.js';
import { router, registerRouteCleanup } from '../app/router.js';
import { showError, showLoading, escapeHtml, observeAnimations, fadeInContent, animate, safeSetHTML } from '../shared/utils/dom.js';
import { formatPrice, formatDate, renderStars } from '../shared/utils/format.js';
import { showToast } from '../widgets/ui/toast.js';
import { openLightbox, createModal } from '../widgets/ui/modal.js';
import { renderProductCards } from '../widgets/cards/product-card.js';
import { trackRecentlyViewed } from '../features/home/index.js';
import { addToCart } from '../features/cart/add.js';
import { fetchProductById, fetchProducts } from '../features/products/detail.js';
import { fetchWishlist, toggleWishlist } from '../features/wishlist/index.js';
import { createAuction } from '../features/auctions/create.js';
import { fetchProductRating, fetchProductReviews, submitReview } from '../features/reviews/index.js';
import { renderBreadcrumb, renderGallery, renderDetailPanel, renderReviewCards } from '../widgets/product-detail/index.js';

export default async function renderProductDetail(container, route, params) {
  setPageMeta(t('productDetail.title'));
  const id = params.id;
  if (!id) {
    showError(container, t('product.idRequired'));
    return;
  }

  showLoading(container, "detail");

  try {
    const p = await fetchProductById(id);
    const isAvailable = p.status === "Available" || p.status === 0;

    const [ratingData, reviewsData, wishlistData] = await Promise.all([
      fetchProductRating(id),
      fetchProductReviews(id),
      isAuthenticated()
        ? fetchWishlist(200).catch(() => null)
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

    const isSellerOwner = !p.isAuctioned && getUser()?.id === p.sellerId && hasAnyRole(...(SELLER_ROLES));

    container.innerHTML = `
      ${renderBreadcrumb(p)}
      <div class="row g-5">
        ${renderGallery(p)}
        ${renderDetailPanel(p, isAvailable, isWishlisted, stockLevel, stockPct, avgRating, isAuthenticated(), isSellerOwner)}
      </div>`;

    fadeInContent(container);

    // Initial render for reviews
    const reviewsList = document.getElementById("reviewsList");
    let currentReviewPage = 1;
    let sortedReviews = [...reviews];
    renderReviewCards(reviewsList, sortedReviews, currentReviewPage);

    // Review Sorting
    document.getElementById("reviewSort")?.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === 'highest') sortedReviews = [...reviews].sort((a,b) => b.rating - a.rating);
      else if (val === 'lowest') sortedReviews = [...reviews].sort((a,b) => a.rating - b.rating);
      else sortedReviews = [...reviews].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      currentReviewPage = 1;
      renderReviewCards(reviewsList, sortedReviews, currentReviewPage);
    });

    document.getElementById("loadMoreReviewsBtn")?.addEventListener("click", () => {
      currentReviewPage++;
      renderReviewCards(reviewsList, sortedReviews, currentReviewPage);
    });

    // Share Button
    document.getElementById("shareBtn")?.addEventListener("click", async () => {
      const shareData = {
        title: p.title,
        text: t('product.shareText', { title: p.title }),
        url: window.location.href,
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (_e) { /* user cancelled share dialog */ }
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
        
        magLens.style.left = `${x - lensW / 2}px`;
        magLens.style.top = `${y - lensH / 2}px`;
        
        // Set background image and position for zoom effect (2x zoom)
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
          if (mainImg) {
            mainImg.src = allImages[next];
            if (magLens) magLens.style.backgroundImage
            magLens.style.backgroundImage = `url('${escapeHtml(allImages[next])}')`;
          }
        }
      }, { passive: true });
    })();

    // Similar products
    (async () => {
      try {
        const similar = await fetchProducts({
          categoryId: p.categoryId,
          pageSize: 4,
        });
        const items = similar.items || similar.data || [];
        if (items.length) {
          const section = document.createElement("div");
          section.classList.add("mt-5");
          section.innerHTML = `<div class="section-header"><h2><i class="fas fa-layer-group" aria-hidden="true"></i> ${t("products.similar")}</h2></div><div class="product-card-grid product-card-grid-dense" id="similarGrid"></div>`;
          container.appendChild(section);
          const grid = document.getElementById("similarGrid");
          renderProductCards(
            grid,
            items.filter((s) => s.id !== p.id).slice(0, 4),
          );
          observeAnimations();
        }
      } catch { /* similar grid stays hidden */ }
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
          await addToCart(p.id, parseInt(document.getElementById("productQty")?.value) || 1);
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
          await toggleWishlist(p.id);
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
      const { close, overlay } = createModal(`
          <div class="mw-md">
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
              <button type="button" class="btn btn-ghost" id="auctionModalCancel">${t("common.cancel")}</button>
              <button type="submit" class="btn btn-primary" id="auctionModalSubmit"><i class="fas fa-gavel" aria-hidden="true"></i> ${t("auctions.title")}</button>
            </div>
          </form>
        </div>`, { ariaLabel: t("product.startAuction") });
      animate(overlay, 'fadeIn', { duration: '0.2s' });
      registerRouteCleanup(() => close());
      document.getElementById("auctionModalCancel").addEventListener("click", close);
      document.getElementById("auctionModalForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const submit = document.getElementById("auctionModalSubmit");
        const alertDiv = document.getElementById("auctionModalAlert");
        alertDiv.innerHTML = "";
        submit.disabled = true;
        submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("auction.placingBid")}`;
        try {
          await createAuction({
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
      if (!isAuthenticated()) { showToast(t("auth.loginRequired"), "warning"); return; }

      const reviewForm = document.getElementById("reviewFormContainer");
      if (!reviewForm) { showToast(t("auth.loginRequired"), "warning"); return; }
      reviewForm.classList.toggle("d-none");
      reviewForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
            parseInt(s.dataset.star) <= v               ? "var(--warning)" : "var(--text-muted)";
          s.style.transform =
            parseInt(s.dataset.star) <= v ? "scale(1.2)" : "scale(1)";
        });
      });
      star.addEventListener("mouseleave", () => {
        const selected = parseInt(ratingVal.value);
        stars.forEach((s) => {
          s.style.color =
            parseInt(s.dataset.star) <= selected
              ? "var(--warning)"
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
              ? "var(--warning)"
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
          await submitReview(p.id, rating, comment);
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
