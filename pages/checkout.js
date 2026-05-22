async function renderCheckout(container) {
  if (!(await requireAuth())) return;

  showLoading(container, "form");

  try {
    const [cart, savedAddresses, walletData] = await Promise.all([
      api.get("/cart"),
      api.get("/shippingaddresses").catch(() => []),
      api.get("/wallet").catch(() => null),
    ]);
    const items = cart.items || [];
    const addresses = Array.isArray(savedAddresses) ? savedAddresses : [];
    const availableBalance = walletData?.availableBalance ?? null;

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
              <span style="font-weight:600">${formatPrice(
                (item.product?.price || item.unitPrice || item.price || 0) *
                (item.quantity || 1)
              )}</span>
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
          <div id="savedAddressesWrap"></div>
          <form id="addressForm">
            <div id="addressFields" class="grid grid-2" style="gap:12px">
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
          <div id="newAddressLink" style="margin-top:8px;display:none"><a href="#" id="showNewAddressForm" style="font-size:0.9rem"><i class="fas fa-plus"></i> ${t("shipping.addNew")}</a></div>
        </div>
        <div class="card" style="grid-column:2">
          <h3 style="margin-bottom:16px">${t("cart.paymentMethod")}</h3>
          <div style="margin-bottom:16px;padding:12px;border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:12px">
            <i class="fas fa-wallet" style="font-size:1.3rem;color:var(--primary)"></i>
            <div>
              <small style="color:var(--text-muted)">${t("wallet.available")}</small>
              <div style="font-weight:700;font-size:1.1rem">${availableBalance !== null ? formatPrice(availableBalance) : t("common.loading")}</div>
            </div>
            <a href="#/wallet" class="btn btn-sm btn-outline" style="margin-left:auto"><i class="fas fa-plus"></i> ${t("wallet.deposit")}</a>
          </div>
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

    let selectedAddressId = null;

    ["addrFullName", "addrPhone", "addrAddressLine", "addrCity"].forEach((id) => {
      document.getElementById(id).addEventListener("input", () => clearFieldError(document.getElementById(id)));
    });

    if (addresses.length > 0) {
      const wrap = document.getElementById("savedAddressesWrap");
      wrap.innerHTML = `
        <div style="margin-bottom:12px">
          <label style="font-weight:600;display:block;margin-bottom:8px">${t("shipping.savedAddresses") || "Saved Addresses"}</label>
          ${addresses.map((a, i) => `
            <label class="radio-card" style="display:flex;align-items:flex-start;gap:8px;padding:10px;margin-bottom:6px;border:1px solid var(--border);border-radius:8px;cursor:pointer;background:var(--card-bg)">
              <input type="radio" name="savedAddr" value="${a.id}" ${i === 0 ? "checked" : ""} style="margin-top:3px">
              <div>
                <strong>${escapeHtml(a.fullName || a.fullName || "")}</strong><br>
                <span style="font-size:0.85rem;color:var(--text-muted)">${escapeHtml(a.addressLine || "")}, ${escapeHtml(a.city || "")}${a.postalCode ? ` - ${escapeHtml(a.postalCode)}` : ""}</span><br>
                <span style="font-size:0.85rem;color:var(--text-muted)">${escapeHtml(a.phone || "")}</span>
              </div>
            </label>
          `).join("")}
          <label class="radio-card" style="display:flex;align-items:center;gap:8px;padding:10px;margin-bottom:6px;border:1px dashed var(--border);border-radius:8px;cursor:pointer;background:var(--card-bg)">
            <input type="radio" name="savedAddr" value="new" style="margin:0">
            <span><i class="fas fa-plus"></i> ${t("shipping.addNew")}</span>
          </label>
        </div>
      `;
      selectedAddressId = addresses[0].id;
      document.getElementById("addressFields").style.display = "none";

      wrap.querySelectorAll("input[name='savedAddr']").forEach((radio) => {
        radio.addEventListener("change", () => {
          const fields = document.getElementById("addressFields");
          const newLink = document.getElementById("newAddressLink");
          if (radio.value === "new") {
            fields.style.display = "";
            newLink.style.display = "none";
            selectedAddressId = null;
          } else {
            fields.style.display = "none";
            newLink.style.display = "";
            selectedAddressId = Number(radio.value);
          }
        });
      });

      document.getElementById("showNewAddressForm").addEventListener("click", (e) => {
        e.preventDefault();
        const newRadio = wrap.querySelector("input[value='new']");
        if (newRadio) newRadio.checked = true;
        newRadio.dispatchEvent(new Event("change"));
      });
    }

    document
      .getElementById("placeOrderBtn")
      .addEventListener("click", async () => {
        const btn = document.getElementById("placeOrderBtn");
        const alertDiv = document.getElementById("checkoutAlert");
        alertDiv.innerHTML = "";
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("cart.placingOrder")}`;

        try {
          if (availableBalance !== null && availableBalance < total) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-lock"></i> ${t("cart.placeOrder")}`;
            alertDiv.innerHTML = `<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ${t("cart.insufficientWallet")} — <a href="#/wallet" style="color:inherit;text-decoration:underline"><i class="fas fa-plus"></i> ${t("wallet.deposit")}</a></div>`;
            return;
          }

          let addr_id;

          if (selectedAddressId) {
            addr_id = selectedAddressId;
          } else {
            clearAllFieldErrors(document.getElementById("addressForm"));
            const rules = [
              { element: document.getElementById("addrFullName"), required: true },
              { element: document.getElementById("addrPhone"), required: true, phone: true },
              { element: document.getElementById("addrAddressLine"), required: true },
              { element: document.getElementById("addrCity"), required: true },
            ];
            if (!validateForm(document.getElementById("addressForm"), rules)) {
              btn.disabled = false;
              btn.innerHTML = `<i class="fas fa-lock"></i> ${t("cart.placeOrder")}`;
              return;
            }

            const fullName = document.getElementById("addrFullName").value.trim();
            const phone = document.getElementById("addrPhone").value.trim();
            const addressLine = document.getElementById("addrAddressLine").value.trim();
            const city = document.getElementById("addrCity").value.trim();
            const postalCode = document.getElementById("addrPost").value.trim();

            const addr = await api.post("/shippingaddresses", {
              fullName,
              phone,
              city,
              addressLine,
              postalCode: postalCode || undefined,
            });
            addr_id = addr.id;
          }

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

          document.dispatchEvent(new CustomEvent("cart-updated"));
          navigate("order-detail?id=" + order_id);
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
