async function renderCart(container) {
  if (!(await requireAuth())) return;

  showLoading(container, "table");

  try {
    const cart = await api.get("/cart"); // Assuming Swagger confirms 'cartItems' as the field
    const items = cart.cartItems || [];

    if (!items.length) {
      container.innerHTML = `<div class="section-header"><h2><i class="fas fa-shopping-cart"></i> ${t("cart.title")}</h2></div>`;
      renderEmptyState(container, {
        icon: "fa-shopping-cart",
        title: t("cart.empty"),
        desc: t("cart.emptyDesc"),
        actionText: t("cart.browseProducts"),
        actionHref: "#/products",
      });
      return;
    }

    container.innerHTML = `
      <div class="section-header">
        <h2><i class="fas fa-shopping-cart"></i> ${t("cart.title")}</h2>
        <button class="btn btn-danger btn-sm" id="clearCartBtn"><i class="fas fa-trash-alt"></i> ${t("cart.clear")}</button>
      </div>
      <div class="cart-table-wrapper">
        <table class="cart-table">
          <thead>
            <tr>
              <th>${t("cart.product")}</th>
              <th>${t("cart.price")}</th>
              <th>${t("cart.quantity")}</th>
              <th>${t("cart.subtotal")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="cartItems"></tbody>
        </table>
      </div>
      <div class="cart-footer">
        <div class="cart-total">${t("cart.total")}: <span id="cartTotal" class="cart-total-amount">$0.00</span></div>
        <a href="#/checkout" class="btn btn-primary btn-lg"><i class="fas fa-credit-card"></i> ${t("cart.checkout")}</a>
      </div>
      <div class="cart-floating-bar" id="cartFloatingBar" aria-hidden="true">
        <div class="cart-total">${t("cart.total")}: <span id="cartTotalMobile" class="cart-total-amount">$0.00</span></div>
        <a href="#/checkout" class="btn btn-primary"><i class="fas fa-credit-card"></i> ${t("cart.checkout")}</a>
      </div>
    `;

    let total = 0;
    const tbody = document.getElementById("cartItems");
    tbody.innerHTML = items
      .map((item, idx) => {
        const price = item.product?.price || item.unitPrice || item.price || 0;
        const qty = item.quantity || 1;
        const subtotal = price * qty;
        total += subtotal;
        return `
        <tr>
          <td class="cart-product-cell"><a href="#/product-detail?id=${item.productId}">${escapeHtml(item.product?.title || `Product #${item.productId}`)}</a></td>
          <td class="cart-price-cell">${formatPrice(price)}</td>
          <td class="cart-qty-cell"><input type="number" class="form-input cart-qty-input" value="${qty}" min="1" data-id="${item.id || idx}" data-price="${price}" /></td>
          <td class="cart-subtotal-cell">${formatPrice(subtotal)}</td>
          <td class="cart-remove-cell"><button class="btn btn-ghost btn-icon remove-item text-danger" data-id="${item.id || idx}" aria-label="Remove item"><i class="fas fa-times"></i></button></td>
        </tr>
      `;
      })
      .join("");
    document.getElementById("cartTotal").textContent = formatPrice(total);
    document.getElementById("cartTotalMobile").textContent = formatPrice(total);

    $$(".remove-item").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await api.delete(`/cart/items/${btn.dataset.id}`);
          renderCart(container);
          updateCartBadge();
        } catch (e) {
          showToast(e.message, "error");
        }
      });
    });

    $$(".cart-qty-input").forEach((inp) => {
      inp.addEventListener("change", async () => {
        try {
          await api.put(`/cart/items/${inp.dataset.id}`, {
            quantity: parseInt(inp.value) || 1,
          });
          renderCart(container);
        } catch (e) {
          showToast(e.message, "error");
        }
      });
    });

    document
      .getElementById("clearCartBtn")
      .addEventListener("click", async () => {
        if (!confirm(t("cart.clear") + "?")) return;
        try {
          await api.delete("/cart");
          renderCart(container);
          updateCartBadge();
          showToast(t("cart.cleared"), "success");
        } catch (e) {
          showToast(e.message, "error");
        }
      });
  } catch (e) {
    if (e.status === 401) {
      navigate("login");
      return;
    }
    container.innerHTML = `
      <div class="section-header"><h2><i class="fas fa-shopping-cart"></i> ${t("cart.title")}</h2></div>
      renderEmptyState(container, { icon: 'fa-exclamation-triangle', title: t('common.error'), desc: escapeHtml(e.message), actionText: t('common.retry'), actionFn: router });
    `;
  }
}

async function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!isAuthenticated()) {
    badge?.classList.add("hidden");
    return;
  }
  try {
    const cart = await api.get("/cart"); // Assuming Swagger confirms 'cartItems' as the field
    const items = cart.cartItems || [];
    const count = items.reduce((s, i) => s + (i.quantity || 1), 0);
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove("hidden");
    } else badge?.classList.add("hidden");
  } catch {
    badge?.classList.add("hidden");
  }
}
