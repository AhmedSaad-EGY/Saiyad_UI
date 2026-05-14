async function renderCheckout(container) {
  if (!await requireAuth()) return;

  showLoading(container, 'form');

  try {
    const cart = await api.get('/cart');
    const items = cart.items || cart.cartItems || [];

    if (!items.length) {
      container.innerHTML = `<div class="section-header"><h2><i class="fas fa-credit-card"></i> ${t('cart.checkout')}</h2></div>`;
      renderEmptyState(container, { icon: 'fa-shopping-cart', title: t('cart.empty'), desc: t('cart.emptyDesc'), actionText: t('cart.browseProducts'), actionHref: '#/products' });
      return;
    }

    const total = items.reduce((s, i) => s + ((i.product?.price || i.unitPrice || i.price || 0) * (i.quantity || 1)), 0);

    container.innerHTML = `
      <div class="section-header"><h2><i class="fas fa-credit-card"></i> ${t('cart.checkout')}</h2></div>
      <div class="detail-page">
        <div class="card" style="grid-column:1">
          <h3 style="margin-bottom:16px">${t('cart.title')}</h3>
          ${items.map(item => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <span>${escapeHtml(item.product?.title || `Product #${item.productId}`)} <small class="text-muted">x${item.quantity || 1}</small></span>
              <span style="font-weight:600">${formatPrice((item.product?.price || item.unitPrice || item.price || 0) * (item.quantity || 1))}</span>
            </div>
          `).join('')}
          <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:1.1rem;font-weight:700">
            <span>${t('cart.total')}</span>
            <span style="color:var(--primary)">${formatPrice(total)}</span>
          </div>
          <hr style="border-color:var(--border);margin:16px 0">
          <h3 style="margin-bottom:16px">${t('cart.shippingAddress')}</h3>
          <form id="addressForm">
            <div class="form-group">
              <label class="form-label" for="addrCity">${t('cart.city')}</label>
              <input type="text" class="form-input" id="addrCity" required autocomplete="address-level2">
            </div>
            <div class="form-group">
              <label class="form-label" for="addrLine">${t('cart.addressLine')}</label>
              <input type="text" class="form-input" id="addrLine" required autocomplete="street-address">
            </div>
          </form>
        </div>
        <div class="card" style="grid-column:2">
          <h3 style="margin-bottom:16px">${t('cart.paymentMethod')}</h3>
          <select class="form-select" id="paymentMethod" style="margin-bottom:20px">
            <option value="CreditCard">${t('cart.creditCard')}</option>
            <option value="CashOnDelivery">${t('cart.cashOnDelivery')}</option>
          </select>
          <div id="checkoutAlert"></div>
          <button class="btn btn-primary btn-block btn-lg" id="placeOrderBtn"><i class="fas fa-lock"></i> ${t('cart.placeOrder')}</button>
          <a href="#/cart" class="btn btn-outline btn-block" style="margin-top:8px"><i class="fas fa-arrow-left"></i> ${t('cart.backToCart')}</a>
        </div>
      </div>
    `;

    document.getElementById('placeOrderBtn').addEventListener('click', async () => {
      const btn = document.getElementById('placeOrderBtn');
      const alertDiv = document.getElementById('checkoutAlert');
      alertDiv.innerHTML = '';
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t('cart.placingOrder')}`;

      try {
        const city = document.getElementById('addrCity').value.trim();
        const addressLine = document.getElementById('addrLine').value.trim();
        if (!city || !addressLine) {
          alertDiv.innerHTML = `<div class="alert alert-error">${t('cart.city')} and ${t('cart.addressLine')} are required.</div>`;
          btn.disabled = false;
          btn.innerHTML = `<i class="fas fa-lock"></i> ${t('cart.placeOrder')}`;
          return;
        }

        const user = getUser();
        const addr = await api.post('/shippingaddresses', {
          fullName: user?.fullName || '',
          phone: user?.phone || '',
          city,
          addressLine,
        });

        const order = await api.post('/orders', { shippingAddressId: addr.id || addr.data?.id });

        await api.post('/payments/initiate', {
          orderId: order.id || order.data?.id,
          paymentMethod: document.getElementById('paymentMethod').value,
        });

        alertDiv.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${t('cart.orderSuccess')}</div>`;
        btn.innerHTML = `<i class="fas fa-check"></i> ${t('cart.orderSuccess')}`;

        setTimeout(() => navigate('dashboard?tab=orders'), 2000);
      } catch (err) {
        alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message || t('cart.orderError'))}</div>`;
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-lock"></i> ${t('cart.placeOrder')}`;
      }
    });
  } catch (e) {
    showError(container, e.message);
  }
}
