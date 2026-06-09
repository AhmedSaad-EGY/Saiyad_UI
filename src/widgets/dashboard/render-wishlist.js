import { t } from '../../shared/utils/i18n.js';
import { escapeHtml, renderEmptyState, observeAnimations } from '../../shared/utils/dom.js';
import { formatPrice } from '../../shared/utils/format.js';
import { showToast } from '../ui/toast.js';
import { showConfirm } from '../ui/modal.js';
import { updateCartBadge } from '../layout/navbar.js';

export function renderWishlist(content, { items, onRemove, onAddToCart, error }) {
  content.innerHTML = `<div class="card"><div class="card-header"><h3><i class="fas fa-heart" aria-hidden="true"></i> ${t("dash.wishlist")}</h3></div><div class="card-body"><div id="wishlistItems"></div></div></div>`;

  const container = document.getElementById("wishlistItems");

  if (error) {
    container.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(error)}</div>`;
    return;
  }

  if (!items.length) {
    renderEmptyState(container, {
      icon: "fa-heart",
      title: t("dash.emptyWishlist"),
      actionText: t("cart.browseProducts"),
      actionHref: "#/products",
    });
    return;
  }

  container.innerHTML = `
    <div class="table-wrapper animate-on-scroll">          <table class="table">
          <caption class="mt-2 text-muted small caption-meta">${t("dash.wishlist")}</caption>
          <thead><tr><th scope="col">${t("cart.product")}</th><th scope="col">${t("cart.price")}</th><th scope="col"></th></tr></thead>
        <tbody>${items
          .map(
            (w) => `
          <tr>
            <td><a href="#/product-detail?id=${w.productId}" class="text-decoration-none text-reset fw-medium">${escapeHtml(w.product?.title || `Product #${w.productId}`)}</a></td>
            <td>${w.product?.price ? formatPrice(w.product.price) : "-"}</td>
            <td>
              <div class="d-flex gap-2 flex-wrap">
                <a href="#/product-detail?id=${w.productId}"
                   class="btn btn-outline btn-sm">
                  <i class="fas fa-eye" aria-hidden="true"></i> ${t("common.view")}
                </a>
                <button class="btn btn-primary btn-sm add-wishlist-to-cart"
                  data-product-id="${w.productId}"
                  aria-label="${t('product.addToCart')}">
                  <i class="fas fa-cart-plus" aria-hidden="true"></i>
                </button>
                <button class="btn btn-ghost btn-sm remove-wishlist"
                  data-id="${w.productId}" aria-label="${t('common.remove')}">
                  <i class="fas fa-trash text-danger" aria-hidden="true"></i>
                </button>
              </div>
            </td>
          </tr>
        `,
          )
          .join("")}</tbody>
      </table>
    </div>
  `;

  container.querySelectorAll(".remove-wishlist").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!onRemove) return;
      const ok = await showConfirm(
        t("wishlist.confirmRemove"),
        t("wishlist.confirmRemoveDesc"),
        { type: "danger", confirmText: t("common.remove") },
      );
      if (!ok) return;
      try {
        await onRemove(btn.dataset.id);
        showToast(t("product.wishlistUpdated"), "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  content.querySelectorAll(".add-wishlist-to-cart").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!onAddToCart) return;
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner spinner" aria-hidden="true"></i>`;
      try {
        await onAddToCart(parseInt(btn.dataset.productId));
        showToast(t("product.addedToCart"), "success");
        updateCartBadge();
        btn.innerHTML = `<i class="fas fa-check" aria-hidden="true"></i>`;
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = `<i class="fas fa-cart-plus" aria-hidden="true"></i>`;
        }, 1500);
      } catch (e) {
        showToast(e.message, "error");
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-cart-plus" aria-hidden="true"></i>`;
      }
    });
  });

  observeAnimations();
}
