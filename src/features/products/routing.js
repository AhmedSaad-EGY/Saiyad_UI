export function getProductLink(product) {
  return product.currentHighestBid != null
    ? `#/auction-detail?id=${product.id || product.productId}`
    : `#/product-detail?id=${product.id || product.productId}`;
}

export function getRecentLink(item) {
  const base = item.type === "auction" ? "auction-detail" : "product-detail";
  return `#/${base}?id=${item.id}`;
}
