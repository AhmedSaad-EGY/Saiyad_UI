import { t } from '../shared/utils/i18n.js';
import { isAuthenticated, getUser, requireAuth } from '../features/auth/login.js';
import { updateCartBadge } from '../widgets/layout/navbar.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { router, registerRouteCleanup } from '../app/router.js';
import { showError, showLoading, escapeHtml, observeAnimations, fadeInContent, animate, safeSetHTML } from '../shared/utils/dom.js';
import { formatDate, renderStars } from '../shared/utils/format.js';
import { showToast } from '../widgets/ui/toast.js';
import { createModal } from '../widgets/ui/modal.js';
import { renderProductCards } from '../widgets/cards/product-card.js';
import { trackRecentlyViewed } from '../features/home/index.js';
import { addToCart } from '../features/cart/add.js';
import { loadProductDetailData, fetchSimilarProducts, initImageMagnifier, initGallerySwipe } from '../features/products/detail.js';
import { toggleWishlist } from '../features/wishlist/index.js';
import { createAuction } from '../features/auctions/create.js';
import { submitReview, sortReviews, initStarRating } from '../features/reviews/index.js';
import { clampQuantity } from '../features/cart/quantity.js';
import { renderBreadcrumb, renderGallery, renderDetailPanel, renderReviewCards } from '../widgets/product-detail/index.js';

export default async function renderProductDetail(container, route, params) {
  setPageMeta(t('productDetail.title'));
  const id = params.id;
  if (!id) { showError(container, t('product.idRequired')); return; }
  showLoading(container, "detail");

  try {
    const { p, isAvailable, isWishlisted: initWishlisted, avgRating, reviews, allImages, stockQty, stockLevel, isSellerOwner } = await loadProductDetailData(id);
    let isWishlisted = initWishlisted;

    container.innerHTML = `
      ${renderBreadcrumb(p)}
      <div class="row g-5">
        ${renderGallery(p)}
        ${renderDetailPanel(p, isAvailable, isWishlisted, stockLevel, Math.min(100, Math.max(0, stockQty)), avgRating, isAuthenticated(), isSellerOwner)}
      </div>`;
    fadeInContent(container);

    // Reviews
    const reviewsList = document.getElementById("reviewsList");
    let currentReviewPage = 1;
    let sortedReviews = sortReviews(reviews, 'newest');
    renderReviewCards(reviewsList, sortedReviews, currentReviewPage);
    document.getElementById("reviewSort")?.addEventListener("change", (e) => { sortedReviews = sortReviews(reviews, e.target.value); currentReviewPage = 1; renderReviewCards(reviewsList, sortedReviews, currentReviewPage); });
    document.getElementById("loadMoreReviewsBtn")?.addEventListener("click", () => { currentReviewPage++; renderReviewCards(reviewsList, sortedReviews, currentReviewPage); });

    // Share
    document.getElementById("shareBtn")?.addEventListener("click", async () => {
      if (navigator.share) { try { await navigator.share({ title: p.title, text: t('product.shareText', { title: p.title }), url: window.location.href }); } catch {} }
      else { navigator.clipboard.writeText(window.location.href); showToast(t("common.linkCopied"), "success"); }
    });

    // Image magnifier + swipe
    initImageMagnifier(document.getElementById("mainImageWrap"), document.getElementById("mainImg"), document.getElementById("magLens"), p.primaryImageUrl, allImages);
    initGallerySwipe(document.getElementById("mainImageWrap"), allImages);

    // Similar products
    (async () => {
      try {
        const items = await fetchSimilarProducts(p.categoryId, p.id, 4);
        if (items.length) {
          const section = document.createElement("div");
          section.classList.add("mt-5");
          section.innerHTML = `<div class="section-header"><h2><i class="fas fa-layer-group" aria-hidden="true"></i> ${t("products.similar")}</h2></div><div class="product-card-grid product-card-grid-dense" id="similarGrid"></div>`;
          container.appendChild(section);
          renderProductCards(document.getElementById("similarGrid"), items);
          observeAnimations();
        }
      } catch {}
    })();

    trackRecentlyViewed(p.id, p.title, p.primaryImageUrl, p.price, "product");

    // Quantity + Add to Cart
    if (isAvailable) {
      const qtyInput = document.getElementById("productQty");
      document.getElementById("qtyMinus")?.addEventListener("click", () => { qtyInput.value = clampQuantity(parseInt(qtyInput.value) - 1, 1, parseInt(qtyInput.max) || 99); });
      document.getElementById("qtyPlus")?.addEventListener("click", () => { qtyInput.value = clampQuantity(parseInt(qtyInput.value) + 1, 1, parseInt(qtyInput.max) || 99); });
      const handleAddToCart = async (btnId) => {
        if (!(await requireAuth())) return;
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("common.loading")}`;
        try {
          await addToCart(p.id, parseInt(document.getElementById("productQty")?.value) || 1);
          showToast(t("product.addedToCart"), "success"); updateCartBadge();
        } catch (e) { showToast(e.status === 400 ? t('cart.insufficientStock', { stock: p.stockQuantity || 0 }) : e.message, "error"); }
        finally { btn.disabled = false; btn.innerHTML = `<i class="fas fa-shopping-cart" aria-hidden="true"></i> ${t("product.addToCart")}`; }
      };
      document.getElementById("addToCartBtn")?.addEventListener("click", () => handleAddToCart("addToCartBtn"));
      document.getElementById("mobileAddToCartBtn")?.addEventListener("click", () => handleAddToCart("mobileAddToCartBtn"));
    }

    // Wishlist toggle
    document.getElementById("addToWishlistBtn")?.addEventListener("click", async () => {
      if (!(await requireAuth())) return;
      const prev = isWishlisted;
      isWishlisted = !isWishlisted;
      const wBtn = document.getElementById("addToWishlistBtn");
      if (wBtn) { wBtn.className = `btn ${isWishlisted ? 'btn-danger' : 'btn-outline'} btn-lg`; wBtn.setAttribute("aria-pressed", String(isWishlisted)); wBtn.title = isWishlisted ? t('product.removeFromWishlist') : t('product.wishlist'); wBtn.innerHTML = `<i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i> ${isWishlisted ? t('product.removeFromWishlist') : t("product.wishlist")}`; }
      try { await toggleWishlist(p.id); showToast(isWishlisted ? t("product.addedToWishlist") : t("product.removedFromWishlist"), "success"); }
      catch (e) { isWishlisted = prev; if (wBtn) { wBtn.className = `btn ${prev ? 'btn-danger' : 'btn-outline'} btn-lg`; wBtn.setAttribute("aria-pressed", String(prev)); wBtn.title = prev ? t('product.removeFromWishlist') : t('product.wishlist'); wBtn.innerHTML = `<i class="${prev ? 'fas' : 'far'} fa-heart"></i> ${prev ? t('product.removeFromWishlist') : t("product.wishlist")}`; } showToast(e.message, "error"); }
    });

    // Start Auction modal
    document.getElementById("startAuctionBtn")?.addEventListener("click", () => {
      const minEnd = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
      const { close, overlay } = createModal(`<div class="mw-md">
        <h3><i class="fas fa-gavel" aria-hidden="true"></i> ${t("auctions.title")} — ${escapeHtml(p.title)}</h3>
        <div id="auctionModalAlert"></div>
        <form id="auctionModalForm" novalidate>
          <div class="form-group"><label class="form-label">${t("auction.end")} *</label><input type="datetime-local" class="form-input form-control" id="auctionEndTime" min="${minEnd}" required></div>
          <div class="form-group"><label class="form-label">${t("auction.startingPrice")} *</label><input type="number" class="form-input form-control" id="auctionStartPrice" min="0.01" step="0.01" required></div>
          <div class="form-group"><label class="form-label">${t("auction.reservePrice")}</label><input type="number" class="form-input form-control" id="auctionReservePrice" min="0" step="0.01" value="0"></div>
          <div class="form-group"><label class="form-label">${t("auction.minIncrement")} *</label><input type="number" class="form-input form-control" id="auctionMinIncrement" min="0.01" step="0.01" value="1" required></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" id="auctionModalCancel" onclick="this.closest('.modal-overlay').remove()">${t("common.cancel")}</button>
            <button type="submit" class="btn btn-primary" id="auctionModalSubmit"><i class="fas fa-gavel" aria-hidden="true"></i> ${t("auctions.title")}</button>
          </div>
        </form></div>`, { ariaLabel: t("product.startAuction") });
      animate(overlay, 'fadeIn', { duration: '0.2s' });
      registerRouteCleanup(() => close());
      document.getElementById("auctionModalForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const submit = document.getElementById("auctionModalSubmit"), alertDiv = document.getElementById("auctionModalAlert");
        alertDiv.innerHTML = ""; submit.disabled = true; submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("auction.placingBid")}`;
        try {
          await createAuction({ productId: p.id, endTime: new Date(document.getElementById("auctionEndTime").value).toISOString(), startingPrice: parseFloat(document.getElementById("auctionStartPrice").value), reservePrice: parseFloat(document.getElementById("auctionReservePrice").value) || 0, minimumIncrement: parseFloat(document.getElementById("auctionMinIncrement").value) || 1 });
          showToast(`${t("auctions.title")} started!`, "success"); close(); router();
        } catch (err) { safeSetHTML(alertDiv, `<div class="alert alert-error">${escapeHtml(err.message)}</div>`); }
        finally { submit.disabled = false; submit.textContent = t("auctions.title"); }
      });
    });

    // Review form
    document.getElementById("showReviewForm")?.addEventListener("click", () => {
      if (!isAuthenticated()) { showToast(t("auth.loginRequired"), "warning"); return; }
      const rf = document.getElementById("reviewFormContainer");
      if (!rf) { showToast(t("auth.loginRequired"), "warning"); return; }
      rf.classList.toggle("d-none"); rf.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    initStarRating('starRating');

    document.getElementById("reviewSubmit")?.addEventListener("click", async () => {
      const submit = document.getElementById("reviewSubmit"), ratingVal = document.getElementById("ratingVal");
      const rating = parseInt(ratingVal.value), comment = document.getElementById("reviewComment").value.trim();
      const alertDiv = document.getElementById("reviewAlert");
      if (!rating) { alertDiv.innerHTML = `<div class="alert alert-error">${t("review.rating")}</div>`; return; }
      submit.disabled = true; submit.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i> ${t("review.submitting")}`;
      try {
        await submitReview(p.id, rating, comment);
        showToast(t("review.submitted"), "success");
        document.getElementById("reviewFormContainer").classList.add("d-none");
        document.getElementById("reviewComment").value = "";
        ratingVal.value = "0";
        const stars = document.querySelectorAll("#starRating .fa-star");
        stars.forEach((s) => { s.style.color = "var(--text-muted)"; s.style.transform = "scale(1)"; });
        const user = getUser();
        if (reviewsList) {
          const noReviewsMsg = reviewsList.querySelector("p");
          if (noReviewsMsg) noReviewsMsg.remove();
          const el = document.createElement("div");
          el.className = "notif-item"; el.style.animation = ""; animate(el, 'fadeInUp', { duration: '0.3s' });
          safeSetHTML(el, `<div class="flex-fill"><strong>${escapeHtml(user?.fullName || "You")}</strong><span class="text-warning">${renderStars(rating)}</span>${comment ? `<p class="mt-1" style="color:var(--text-secondary);font-size:0.9rem">${escapeHtml(comment)}</p>` : ""}<small class="text-muted">${formatDate(new Date().toISOString())}</small></div>`);
          reviewsList.insertAdjacentElement("afterbegin", el);
        }
      } catch (err) { safeSetHTML(alertDiv, `<div class="alert alert-error">${escapeHtml(err.message)}</div>`); }
      finally { submit.disabled = false; submit.textContent = t("review.submit"); }
    });
  } catch (e) { showError(container, e.message); }
}
