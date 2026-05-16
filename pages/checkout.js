async function renderCheckout(container) {
  if (!(await requireAuth())) return;

  showLoading(container, "form");

  try {
    const cart = await api.get("/cart");
    const items = cart.items || [];

    if (!items.length) {
      container.innerHTML = `
        <div class="section-header"><h2><i class="fas fa-credit-card"></i> ${t("cart.checkout")}</h2></div>
        <div class="empty-state">
          <i class="fas fa-shopping-cart" style="font-size:3rem;color:var(--text-muted);margin-bottom:16px"></i>
          <h3>${t("cart.empty")}</h3>
          <p style="color:var(--text-muted);margin-bottom:20px">${t("cart.emptyDesc")}</p>
          <a href="#/products" class="btn btn-primary"><i class="fas fa-store"></i> ${t("cart.browseProducts")}</a>
        </div>`;
      return;
    }

    const total = items.reduce(
      (s, i) =>
        s +
        (i.product?.price || i.unitPrice || i.price || 0) * (i.quantity || 1),
      0,
    );

    container.innerHTML = `
      <div class="section-header"><h2><i class="fas fa-credit-card"></i> ${t("cart.checkout")}</h2></div>
      <div class="detail-page">
        <div class="card" style="grid-column:1">
          <h3 style="margin-bottom:16px">${t("cart.title")}</h3>
          ${items
            .map(
              (item) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <span>${escapeHtml(item.productTitle || `Product #${item.productId}`)} <small class="text-muted">x${item.quantity || 1}</small></span>
              <span style="font-weight:600">${formatPrice((item.price || 0) * (item.quantity || 1))}</span>
            </div>
          `,
            )
            .join("")}
          <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:1.1rem;font-weight:700">
            <span>${t("cart.total")}</span>
            <span style="color:var(--primary)">${formatPrice(total)}</span>
          </div>
          <hr style="border-color:var(--border);margin:16px 0">
          <h3 style="margin-bottom:16px">${t("cart.shippingAddress")}</h3>
          <form id="addressForm">
            <div class="grid grid-2" style="gap:12px">
              <div class="form-group">
                <label class="form-label" for="addrFullName">${t("auth.fullName")} *</label>
                <input type="text" class="form-input" id="addrFullName" name="fullName" autocomplete="name" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="addrPhone">${t("auth.phone")} *</label>
                <input type="tel" class="form-input" id="addrPhone" name="phone" autocomplete="tel" required>
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label" for="addrAddressLine">${t("cart.addressLine")} *</label>
                <input type="text" class="form-input" id="addrAddressLine" name="addressLine" autocomplete="street-address" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="addrCity">${t("cart.city")} *</label>
                <input type="text" class="form-input" id="addrCity" name="city" autocomplete="address-level2" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="addrPost">${t("shipping.postalCode")}</label>
                <input type="text" class="form-input" id="addrPost" name="postalCode" autocomplete="postal-code">
              </div>
            </div>
          </form>
        </div>
        <div class="card" style="grid-column:2">
          <h3 style="margin-bottom:16px">${t("cart.paymentMethod")}</h3>
          <select class="form-select" id="paymentMethod" style="margin-bottom:20px">
            <option value="CreditCard">${t("cart.creditCard")}</option>
            <option value="CashOnDelivery">${t("cart.cashOnDelivery")}</option>
          </select>
          <div id="checkoutAlert"></div>
          <button class="btn btn-primary btn-block btn-lg" id="placeOrderBtn"><i class="fas fa-lock"></i> ${t("cart.placeOrder")}</button>
          <a href="#/cart" class="btn btn-outline btn-block" style="margin-top:8px"><i class="fas fa-arrow-left"></i> ${t("cart.backToCart")}</a>
        </div>
      </div>
    `;

    document
      .getElementById("placeOrderBtn")
      .addEventListener("click", async () => {
        const btn = document.getElementById("placeOrderBtn");
        const alertDiv = document.getElementById("checkoutAlert");
        alertDiv.innerHTML = "";
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("cart.placingOrder")}`;

        try {
          const fullName = document.getElementById("addrFullName").value.trim();
          const phone = document.getElementById("addrPhone").value.trim();
          const addressLine = document.getElementById("addrAddressLine").value.trim();
          const city = document.getElementById("addrCity").value.trim();
          const postalCode = document.getElementById("addrPost").value.trim();

          if (!fullName || !phone || !addressLine || !city) {
            alertDiv.innerHTML = `<div class="alert alert-error">${t("cart.requiredFields")}</div>`;
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-lock"></i> ${t("cart.placeOrder")}`;
            return;
          }

          const addr = await api.post("/shipping-addresses", {
            fullName,
            phone,
            city,
            addressLine,
            postalCode: postalCode || undefined,
          });

          const addr_id = addr.id;
          const order = await api.post("/orders", {
            shippingAddressId: addr_id,
          });
          const order_id = order.id;

          const payment = await api.post("/payments/initiate", {
            orderId: order_id,
            paymentMethod: document.getElementById("paymentMethod").value,
          });

          if (payment?.id) {
            await api.post(`/payments/${payment.id}/confirm`);
          }

          alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t("cart.orderSuccess")}</div>`;
          btn.innerHTML = `<i class="fas fa-check"></i> ${t("cart.orderSuccess")}`;

          setTimeout(() => navigate("dashboard?tab=orders"), 2000);
        } catch (err) {
          alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message || t("cart.orderError"))}</div>`;
          btn.disabled = false;
          btn.innerHTML = `<i class="fas fa-lock"></i> ${t("cart.placeOrder")}`;
        }
      });
  } catch (e) {
    showError(container, e.message);
  }
}
