async function renderUserProfile(container) {
  if (!isAuthenticated()) {
    navigate('login');
    return;
  }

  const user = getUser();

  container.innerHTML = `
    <div class="profile-page">
      <div class="profile-hero card animate-on-scroll">
        <div class="profile-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="profile-hero-info">
          <h1 class="profile-name">${escapeHtml(user?.fullName || t('dash.profile'))}</h1>
          <p class="profile-email"><i class="fas fa-envelope"></i> ${escapeHtml(user?.email || '')}</p>
          ${user?.phone
            ? `<p class="profile-phone"><i class="fas fa-phone"></i> ${escapeHtml(user.phone)}</p>`
            : ''}
          <span class="profile-role-badge">${escapeHtml(user?.role || 'Customer')}</span>
        </div>
        <div class="profile-hero-actions">
          <a href="#/dashboard?tab=profile" class="btn btn-outline btn-sm">
            <i class="fas fa-edit"></i> ${t('dash.updateProfile')}
          </a>
          <a href="#/dashboard?tab=change-password" class="btn btn-ghost btn-sm">
            <i class="fas fa-lock"></i> ${t('dash.changePassword')}
          </a>
        </div>
      </div>

      <div class="profile-stats animate-on-scroll stagger-1" id="profileStats">
        <div class="profile-stat-card">
          <i class="fas fa-box"></i>
          <div id="statOrders" class="profile-stat-num">—</div>
          <div class="profile-stat-label">${t('dash.orders')}</div>
        </div>
        <div class="profile-stat-card">
          <i class="fas fa-heart"></i>
          <div id="statWishlist" class="profile-stat-num">—</div>
          <div class="profile-stat-label">${t('dash.wishlist')}</div>
        </div>
        <div class="profile-stat-card">
          <i class="fas fa-bell"></i>
          <div id="statNotifs" class="profile-stat-num">—</div>
          <div class="profile-stat-label">${t('dash.notifications')}</div>
        </div>
      </div>

      <div class="profile-quick-links card animate-on-scroll stagger-2">
        <h3>${t('common.quickLinks')}</h3>
        <div class="profile-links-grid">
          <a href="#/dashboard?tab=orders" class="profile-link-card">
            <i class="fas fa-shopping-bag"></i>
            <span>${t('dash.orders')}</span>
          </a>
          <a href="#/dashboard?tab=wishlist" class="profile-link-card">
            <i class="fas fa-heart"></i>
            <span>${t('dash.wishlist')}</span>
          </a>
          <a href="#/shipping" class="profile-link-card">
            <i class="fas fa-map-marker-alt"></i>
            <span>${t('dash.addresses')}</span>
          </a>
          <a href="#/dashboard?tab=notifications" class="profile-link-card">
            <i class="fas fa-bell"></i>
            <span>${t('dash.notifications')}</span>
          </a>
          ${user?.role === 'Fisherman' || user?.role === 'BaitSeller' || user?.role === 'Auctioneer' ? `
            <a href="#/dashboard?tab=products" class="profile-link-card">
              <i class="fas fa-store"></i>
              <span>${t('dash.myProducts')}</span>
            </a>
          ` : ''}
          ${user?.role === 'Fisherman' || user?.role === 'BaitSeller' ? `
            <a href="#/dashboard?tab=seller" class="profile-link-card">
              <i class="fas fa-chart-line"></i>
              <span>${t('dash.sellerDashboard')}</span>
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  Promise.allSettled([
    api.get('/orders', { page: 1, pageSize: 1 }),
    api.get('/wishlist', { page: 1, pageSize: 1 }),
    api.get('/notifications/unread-count'),
  ]).then(([orders, wishlist, notifs]) => {
    const ordersEl = document.getElementById('statOrders');
    const wishlistEl = document.getElementById('statWishlist');
    const notifsEl = document.getElementById('statNotifs');

    if (ordersEl && orders.status === 'fulfilled') {
      ordersEl.textContent = orders.value?.totalCount ?? '0';
    }
    if (wishlistEl && wishlist.status === 'fulfilled') {
      wishlistEl.textContent = wishlist.value?.totalCount ?? '0';
    }
    if (notifsEl && notifs.status === 'fulfilled') {
      notifsEl.textContent = notifs.value?.count ?? '0';
    }
  });

  observeAnimations();
}
