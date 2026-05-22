async function renderCart(container) {
  if (!(await requireAuth())) return;

  showLoading(container, "table");

  try {
    const cart = await api.get("/cart");
    const items = cart.items || [];

    if (!items.length) {
      container.innerHTML = `
        <div class="section-header"><h2><i class="fas fa-shopping-cart"></i> ${t("cart.title")}</h2></div>
        <div class="empty-state">
          <i class="fas fa-shopping-cart" style="font-size:3rem;color:var(--text-muted);margin-bottom:16px"></i>
          <h3>${t("cart.empty")}</h3>
          <p style="color:var(--text-muted);margin-bottom:20px">${t("cart.emptyDesc")}</p>
          <a href="#/products" class="btn btn-primary"><i class="fas fa-store"></i> ${t("cart.browseProducts")}</a>
        </div>`;
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
        const price = item.unitPrice || item.price || 0;
        const qty = item.quantity || 1;
        const subtotal = price * qty;
        total += subtotal;
        return `
        <tr>
          <td class="cart-product-cell">
            <a href="#/product-detail?id=${item.productId}"
               style="display:flex;align-items:center;gap:10px;text-decoration:none;
                      color:var(--text-primary)">
              ${item.productImageUrl || item.imageUrl
                ? `<img src="${escapeHtml(item.productImageUrl || item.imageUrl)}"
                       alt="${escapeHtml(item.productTitle || '')}"
                       style="width:48px;height:48px;object-fit:cover;border-radius:6px;
                              flex-shrink:0;border:1px solid var(--border)"
                       loading="lazy">`
                : `<div style="width:48px;height:48px;border-radius:6px;
                        background:var(--background-secondary);display:flex;
                        align-items:center;justify-content:center;flex-shrink:0;
                        border:1px solid var(--border)">
                     <i class="fas fa-image" style="color:var(--text-muted);font-size:1.2rem"></i>
                   </div>`}
              <span>${escapeHtml(item.productTitle || `Product #${item.productId}`)}</span>
            </a>
          </td>
          <td class="cart-price-cell">${formatPrice(price)}</td>
          <td class="cart-qty-cell"><input type="number" class="form-input cart-qty-input" value="${qty}" min="1" data-id="${item.productId}" data-price="${price}" /></td>
          <td class="cart-subtotal-cell">${formatPrice(subtotal)}</td>
          <td class="cart-remove-cell"><button class="btn btn-ghost btn-icon remove-item text-danger" data-id="${item.productId}" aria-label="Remove item"><i class="fas fa-times"></i></button></td>
        </tr>
      `;
      })
      .join("");
    document.getElementById("cartTotal").textContent = formatPrice(total);
    document.getElementById("cartTotalMobile").textContent = formatPrice(total);
    document.body.classList.add("has-floating-bar");
    registerRouteCleanup(() => document.body.classList.remove("has-floating-bar"));

    $$(".remove-item").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const ok = await showConfirm(t("cart.removeItemTitle"), t("cart.removeItemConfirm"), { type: "danger", confirmText: t("common.remove") });
        if (!ok) return;
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
        const ok = await showConfirm(t("cart.clear"), t("cart.clearConfirm"), { type: "danger" });
        if (!ok) return;
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
    container.innerHTML = `<div class="section-header"><h2><i class="fas fa-shopping-cart"></i> ${t("cart.title")}</h2></div>`;
    renderEmptyState(container, {
      icon: "fa-exclamation-triangle",
      title: t("common.error"),
      desc: escapeHtml(e.message),
      actionText: t("common.retry"),
      actionFn: () => router(),
    });
  }
}
