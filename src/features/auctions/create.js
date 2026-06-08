import { api } from '../../shared/api/client.js';

export async function createAuctionRequest(data) {
  return api.post('/Auctions/requests', data);
}

export async function fetchMyRequests(page = 1, pageSize = 50) {
  return api.get('/Auctions/requests/my', { page, pageSize });
}

export async function fetchUnauctionedProducts(pageSize = 200) {
  const data = await api.get('/products', { IsAuctioned: false, PageSize: pageSize });
  return data?.items || data?.data || [];
}

export async function createAuction(data) {
  return api.post('/auctions', {
    productId: data.productId,
    endTime: data.endTime,
    startingPrice: data.startingPrice,
    reservePrice: data.reservePrice || 0,
    minimumIncrement: data.minimumIncrement || 1,
  });
}
