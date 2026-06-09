import { api } from '../../shared/api/client.js';

export async function fetchSellerProfile(userId) {
  return api.get(`/seller-profile/${userId}`);
}

export async function fetchSellerProducts(userId, pageSize = 8, page = 1) {
  return api.get('/products', { SellerId: userId, PageSize: pageSize, Page: page });
}

export async function fetchMySellerProfile() {
  return api.get('/seller-profile/me');
}

export async function createSellerProfile(body) {
  return api.post('/seller-profile', body);
}

export async function updateSellerProfile(body) {
  return api.put('/seller-profile', body);
}

export async function saveSellerProfile(isNew, body) {
  if (isNew) {
    return createSellerProfile(body);
  }
  return updateSellerProfile(body);
}
