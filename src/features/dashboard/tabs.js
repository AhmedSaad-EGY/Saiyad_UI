import { t } from '../../shared/utils/i18n.js';
import { getUser, hasAnyRole, hasRole } from '../../shared/utils/auth-state.js';
import { ROLES, SELLER_ROLES, ECOMMERCE_ROLES, MODERATOR_ROLES } from '../../shared/constants/roles.js';

let _passwordSubmitting = false;
import { showLoading } from '../../shared/utils/dom.js';
import { showToast, syncNotifBadgeCount } from '../../shared/utils/ui.js';
import { emit } from '../../shared/utils/events.js';
import { fetchMySellerProfile } from '../seller-profile/index.js';
import { fetchOrders, cancelOrder } from '../orders/index.js';
import { fetchMyProducts, updateProduct, deleteProduct, uploadFile, addProductImage, validateImage, saveProductDraft, loadProductDraft, clearProductDraft, fetchCategories } from '../products/edit.js';
import { createProduct } from '../products/create.js';
import { fetchUnauctionedProducts, createAuction } from '../auctions/create.js';
import { fetchWishlist, removeFromWishlist } from '../wishlist/index.js';
import { addToCart } from '../cart/add.js';
import { fetchNotifications, normalizeNotifications, countUnreadNotifications, markNotificationRead, markAllNotificationsRead } from '../notifications/index.js';
import { updateUserProfile, cacheUserProfile } from '../profile/index.js';
import { changePassword } from '../auth/password.js';
import { fetchPendingReviews, fetchAdminUsers } from '../admin/index.js';
import {
  renderOverview, renderOrders, renderMyProducts, renderDashAuctions,
  renderWishlist, renderNotifications, renderProfile, renderChangePassword
} from '../../widgets/dashboard/index.js';

export function getDashboardTabs() {
  const isECommerceRole = hasAnyRole(...(ECOMMERCE_ROLES));
  const isSellerRole = hasAnyRole(...(SELLER_ROLES));

  return [
    { id: 'overview', icon: 'fa-tachometer-alt', label: t('dash.overview') },
    ...(isECommerceRole ? [{ id: 'orders', icon: 'fa-box', label: t('dash.orders') }] : []),
    ...(isSellerRole ? [{ id: 'products', icon: 'fa-tag', label: t('dash.products') }] : []),
    ...(hasRole(ROLES.AUCTIONEER) ? [{ id: 'auctions', icon: 'fa-gavel', label: t('dash.auctions') }] : []),
    ...(hasRole(ROLES.FISHERMAN) ? [{ id: 'auction-requests', icon: 'fa-file-export', label: t('auctionRequests.title') }] : []),
    ...(hasAnyRole(...(MODERATOR_ROLES)) ? [{ id: 'auction-requests-review', icon: 'fa-clipboard-list', label: t('auctionRequestsReview.title') }] : []),
    ...(hasAnyRole(...(MODERATOR_ROLES)) ? [{ id: 'auctioneer-analytics', icon: 'fa-chart-bar', label: t('analytics.title') }] : []),
    ...(isECommerceRole ? [{ id: 'wishlist', icon: 'fa-heart', label: t('dash.wishlist') }] : []),
    { id: 'notifications', icon: 'fa-bell', label: t('dash.notifications') },
    { id: 'profile', icon: 'fa-user', label: t('dash.profile') },
    { id: 'password', icon: 'fa-key', label: t('dash.changePassword') },
  ];
}

export function getDefaultDashboardTab(tabs = getDashboardTabs()) {
  return tabs[0]?.id || 'overview';
}

export function resolveDashboardTab(tabId, tabs = getDashboardTabs()) {
  const requested = String(tabId || '').trim();
  const allowedIds = new Set(tabs.map(tab => tab.id));
  return allowedIds.has(requested) ? requested : getDefaultDashboardTab(tabs);
}

export async function loadDashboardTab(tabId, content, options = {}) {
  const isActive = typeof options.isActive === 'function'
    ? options.isActive
    : () => Boolean(content?.isConnected);
  if (!isActive()) return;

  const user = getUser();
  const skeletonType = tabId === 'orders' ? 'table' : tabId === 'products' || tabId === 'profile' || tabId === 'password' ? 'form' : 'page';
  showLoading(content, skeletonType);
  if (!isActive()) return;

  switch (tabId) {
    case 'overview': return loadOverview(content, user, isActive);
    case 'orders': return loadOrders(content, isActive);
    case 'products': return loadProducts(content, isActive);
    case 'auctions': if (isActive()) return loadAuctions(content); break;
    case 'wishlist': return loadWishlist(content, isActive);
    case 'notifications': return loadNotifications(content, isActive);
    case 'profile': if (isActive()) renderProfile(content, user, { onSubmit: handleProfileUpdate.bind(null, content) }); break;
    case 'password': if (isActive()) renderChangePassword(content, { onSubmit: handlePasswordChange }); break;
  }
}

async function loadOverview(content, user, isActive) {
  const stats = {};
  try {
    stats.ordersCount = 0;
    stats.productsCount = 0;
    stats.pendingReviewsCount = 0;
    stats.usersCount = 0;
    stats.sellerProfileExists = false;

    const isAdmin = user?.role === ROLES.ADMIN;
    if (isAdmin) {
      try {
        const pending = await fetchPendingReviews(1, 1);
        stats.pendingReviewsCount = pending.totalCount || 0;
      } catch {}
      try {
        const users = await fetchAdminUsers(1, 1);
        stats.usersCount = users.totalCount || 0;
      } catch {}
    } else {
      try {
        const orders = await fetchOrders(1, 1);
        stats.ordersCount = orders.totalCount || orders.total || 0;
      } catch {}
      try {
        await fetchMySellerProfile();
        stats.sellerProfileExists = true;
      } catch (profileErr) {
        const is404 = profileErr?.status === 404
          || String(profileErr?.message || '').includes('404')
          || String(profileErr?.message || '').toLowerCase().includes('not found');
        stats.sellerProfile404 = is404;
      }
      try {
        const products = await fetchMyProducts(1);
        stats.productsCount = products.totalCount || products.total || 0;
      } catch {}
    }
  } catch {}
  if (!isActive()) return;
  renderOverview(content, user, stats);
}

async function loadOrders(content, isActive) {
  let page = 1;
  const pageSize = 10;
  async function reload() {
    if (!isActive()) return;
    showLoading(content, 'table');
    try {
      const data = await fetchOrders(page, pageSize);
      if (!isActive()) return;
      const orders = data.items || data.data || [];
      const total = data.totalCount || data.total || orders.length;
      const totalPages = Math.ceil(total / pageSize);
      renderOrders(content, {
        orders,
        page,
        totalPages,
        onCancel: async (orderId) => {
          await cancelOrder(orderId);
          reload();
        },
        onPageChange: (newPage) => { page = newPage; reload(); },
      });
    } catch (e) {
      if (!isActive()) return;
      renderOrders(content, { orders: [], page: 1, totalPages: 0, onCancel: null, onPageChange: null, error: e.message });
    }
  }
  await reload();
}

async function loadProducts(content, isActive) {
  try {
    const data = await fetchMyProducts(50);
    if (!isActive()) return;
    const products = data.items || data.data || data || [];
    renderMyProducts(content, {
      products,
      sellerRoles: null,
      onSaveProduct: async (productData, editingId) => {
        const product = editingId
          ? await updateProduct(editingId, productData)
          : await createProduct(productData);
        return product;
      },
      onDeleteProduct: async (productId) => {
        await deleteProduct(productId);
      },
      onStartAuction: async (auctionData) => {
        await createAuction(auctionData);
      },
      onUploadImage: async (file) => {
        const err = validateImage(file);
        if (err) throw new Error(err);
        return await uploadFile(file);
      },
      onAddProductImage: async (productId, imageUrl, isPrimary) => {
        await addProductImage(productId, imageUrl, isPrimary);
      },
      loadDraft: loadProductDraft,
      saveDraft: saveProductDraft,
      clearDraft: clearProductDraft,
      onFetchCategories: async () => {
        const cats = await fetchCategories();
        return Array.isArray(cats) ? cats : cats.items || cats.data || [];
      },
      onFetchUnauctionedProducts: async () => {
        return await fetchUnauctionedProducts(200);
      },
      onCheckSellerProfile: async () => {
        await fetchMySellerProfile();
      },
    });
  } catch (_e) {
    if (!isActive()) return;
    renderMyProducts(content, { products: [], categories: [], sellerRoles: null, error: true });
  }
}

async function loadAuctions(content) {
  renderDashAuctions(content, {
    onStartAuction: async (auctionData) => {
      await createAuction(auctionData);
    },
    onFetchUnauctionedProducts: async () => {
      return await fetchUnauctionedProducts(200);
    },
  });
}

async function loadWishlist(content, isActive) {
  try {
    const data = await fetchWishlist(50);
    if (!isActive()) return;
    const items = data.items || data.data || data;
    renderWishlist(content, {
      items,
      onRemove: async (productId) => {
        await removeFromWishlist(productId);
      },
      onAddToCart: async (productId) => {
        await addToCart(productId, 1);
      },
    });
  } catch (e) {
    if (!isActive()) return;
    renderWishlist(content, { items: [], onRemove: null, onAddToCart: null, error: e.message });
  }
}

async function loadNotifications(content, isActive) {
  try {
    const data = await fetchNotifications(50);
    if (!isActive()) return;
    const notifs = normalizeNotifications(data);
    syncNotifBadgeCount(countUnreadNotifications(notifs));
    renderNotifications(content, {
      notifications: notifs,
      onMarkRead: async (id) => {
        await markNotificationRead(id);
      },
      onMarkAllRead: async () => {
        await markAllNotificationsRead();
      },
    });
  } catch (e) {
    if (!isActive()) return;
    renderNotifications(content, { notifications: [], onMarkRead: null, onMarkAllRead: null, error: e.message });
  }
}

async function handleProfileUpdate(content, formData) {
  const data = await updateUserProfile(formData);
  cacheUserProfile(data.user || data);
  emit('auth:changed');
  showToast(t("dash.profileUpdated"), "success");
  return data;
}

async function handlePasswordChange(oldPassword, newPassword) {
  _passwordSubmitting = true;
  try {
    if (!oldPassword || !newPassword) throw new Error("All fields are required.");
    if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
    await changePassword(oldPassword, newPassword);
    showToast(t("dash.passwordChanged"), "success");
  } catch (err) {
    showToast(err.message, "error");
    throw err;
  } finally {
    _passwordSubmitting = false;
  }
}
