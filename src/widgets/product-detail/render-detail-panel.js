import { t, getCurrentLang } from '../../shared/utils/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';
import { formatPrice, statusClass, tStatus, tCondition, renderStars } from '../../shared/utils/format.js';

export function renderDetailPanel(p, isAvailable, isWishlisted, stockLevel, stockPct, avgRating, isAuth, isSeller) {
  const dir = getCurrentLang() === "ar" ? "left" : "right";
  const sellerId = p.sellerId ? encodeURIComponent(p.sellerId) : "";
  const auctionId = p.auctionId ? encodeURIComponent(p.auctionId) : "";
  return `
    <div class="col-lg-6">
      <div class="detail-info">
        <div class="detail-title-row">
          <h1 class="detail-title">${escapeHtml(p.title)}</h1>
          <button class="btn btn-ghost btn-icon btn-sm mt-1" id="shareBtn" aria-label="${t('common.share')}" title="${t('common.share')}"><i class="fas fa-share-alt"></i></button>
        </div>
        <div class="detail-price">${formatPrice(p.price)}</div>

        <div class="stock-indicator">
          <span class="stock-label stock-${stockLevel}">${p.stockQuantity !== null ? `${p.stockQuantity} ${t("products.inStock")}` : t("common.N/A")}</span>
          <div class="stock-bar"><div class="stock-bar-fill stock-${stockLevel}" style="width:${stockPct}%"></div></div>
        </div>

        <div class="detail-meta mt-3">
          <div class="detail-meta-item"><strong>${t("product.condition")}:</strong> ${tCondition(p.condition)}</div>
          <div class="detail-meta-item"><strong>${t("product.location")}:</strong> ${escapeHtml(p.location || t("common.N/A"))}</div>
          <div class="detail-meta-item"><strong>${t("product.category")}:</strong> ${escapeHtml(p.categoryName || t("common.N/A"))}</div>
          <div class="detail-meta-item"><strong>${t("product.status")}:</strong> <span class="status ${statusClass(p.status)}">${tStatus(p.status, "product")}</span></div>
        </div>
        ${p.brand ? `<p class="detail-brand"><strong>${t("product.brand")}:</strong> ${escapeHtml(p.brand)}</p>` : ""}
        <div class="detail-desc mt-3">${escapeHtml(p.description || t("product.noDescription"))}</div>
        <div class="detail-cta-group">
          <div class="detail-quantity-row">
            <div class="qty-btn-group">
              <button type="button" class="qty-btn" id="qtyMinus" aria-label="${t('product.decreaseQty')}">−</button>
              <input type="number" id="productQty" value="1" min="1" max="${p.stockQuantity || 99}" aria-label="${t('product.quantity')}" class="cart-qty-input">
              <button type="button" class="qty-btn" id="qtyPlus" aria-label="${t('product.increaseQty')}">+</button>
            </div>
            <button class="btn btn-primary btn-lg detail-add-cart-btn" id="addToCartBtn" ${!isAvailable ? "disabled" : ""}>
              <i class="fas fa-shopping-cart"></i> ${t("product.addToCart")}
            </button>
          </div>
          <div class="detail-aux-actions">
            <button class="btn ${isWishlisted ? 'btn-danger' : 'btn-outline'} btn-lg" id="addToWishlistBtn" aria-pressed="${isWishlisted}"
              title="${isWishlisted ? t('product.removeFromWishlist') : t('product.wishlist')}">
              <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
              ${isWishlisted ? t('product.removeFromWishlist') : t("product.wishlist")}
            </button>
            ${p.isAuctioned && p.auctionId ? `<a href="#/auction-detail?id=${auctionId}" class="btn btn-success btn-lg"><i class="fas fa-gavel"></i> ${t("product.viewAuction")}</a>` : !p.isAuctioned && isSeller ? `<button class="btn btn-primary btn-lg" id="startAuctionBtn"><i class="fas fa-gavel"></i> ${t("auction.startAuction")}</button>` : ""}
            ${p.sellerId ? `<a href="#/seller-profile?sellerId=${sellerId}" class="btn btn-outline btn-lg"><i class="fas fa-envelope"></i> ${t("product.contactSeller")}</a>` : ""}
          </div>
        </div>

        ${p.sellerId ? `
        <a href="#/seller-profile?sellerId=${sellerId}" class="seller-info-card mt-4">
          <div class="seller-avatar">${escapeHtml(p.sellerName || t('common.unknown')).charAt(0).toUpperCase()}</div>
          <div class="seller-info-details">
            <div class="seller-info-name">${escapeHtml(p.sellerName || t("common.N/A"))}</div>
            <div class="seller-info-meta"><i class="fas fa-store"></i> ${t('common.viewProfile')}</div>
          </div>
          <i class="fas fa-chevron-${dir} text-muted"></i>
        </a>` : ""}

        <div class="mt-4 pt-4 border-divider-top" id="reviewsSection">
          <div class="review-heading-row">
            <h3><i class="fas fa-star text-warning"></i> ${t("review.title")} ${avgRating ? `(${renderStars(avgRating)} ${avgRating.toFixed(1)})` : ""}</h3>
            <div class="review-actions">
              <select id="reviewSort" class="form-select form-select-sm review-sort-select" aria-label="${t("review.sort")}">
                <option value="newest">${t("products.newest")}</option>
                <option value="highest">${t("review.highestRated")}</option>
                <option value="lowest">${t("review.lowestRated")}</option>
              </select>
              ${isAuth ? `<button class="btn btn-outline btn-sm" id="showReviewForm">${t("review.writeReview")}</button>` : ""}
            </div>
          </div>
          ${isAuth ? `
          <div id="reviewFormContainer" class="d-none card card-sm mb-3">
            <div id="reviewAlert"></div>
            <div class="form-group">
              <label class="form-label">${t("review.rating")}</label>
              <div id="starRating" role="radiogroup" aria-label="${t("review.rating")}" class="d-flex gap-2 fs-4 text-muted">
                ${[1, 2, 3, 4, 5].map((i) => `<button type="button" class="star-rating-button" data-star="${i}" role="radio" aria-checked="false" aria-label="${i} ${t("review.stars")}" tabindex="${i === 1 ? "0" : "-1"}"><i class="fas fa-star" aria-hidden="true"></i></button>`).join("")}
              </div>
              <input type="hidden" id="ratingVal" value="0">
            </div>
            <div class="form-group">
              <label class="form-label">${t("review.comment")}</label>
              <textarea class="form-textarea form-control review-comment-input" id="reviewComment" rows="3" placeholder="${t("review.rateProduct")}"></textarea>
            </div>
            <button class="btn btn-primary btn-sm" id="reviewSubmit"><i class="fas fa-paper-plane"></i> ${t("review.submit")}</button>
          </div>
          ` : `<p class="text-muted small"><a href="#/login" class="text-primary">${t("auth.login")}</a> ${t("review.title")}</p>`}
          <div id="reviewsList"></div>
          <div id="reviewPagination" class="text-center mt-3 d-none">
            <button class="btn btn-ghost btn-sm" id="loadMoreReviewsBtn">${t("common.loadMore")}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="mobile-sticky-bar mobile-sticky-cart" id="mobileStickyCart">
      <div class="current-bid-mini">
        <small>${t("cart.price")}</small>
        <span>${formatPrice(p.price)}</span>
      </div>
      <button class="btn btn-primary" id="mobileAddToCartBtn" ${!isAvailable ? "disabled" : ""}>
        <i class="fas fa-shopping-cart"></i> ${t("product.addToCart")}
      </button>
    </div>`;
}
