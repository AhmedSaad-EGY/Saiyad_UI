import { api } from '../../shared/api/client.js';

export async function fetchMyProducts(pageSize = 50) {
  try {
    return await api.get('/Products/my', { pageSize }) || [];
  } catch { return { items: [], data: [] }; }
}

export async function fetchCategories() {
  try {
    return await api.get('/categories') || [];
  } catch { return []; }
}

export async function updateProduct(productId, formData) {
  return api.put(`/products/${productId}`, formData);
}

export async function deleteProduct(productId) {
  return api.delete(`/products/${productId}`);
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export function validateImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return 'product.invalidImageType';
  if (file.size > MAX_SIZE) return 'product.imageTooLarge';
  return null;
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const upload = await api.upload('/upload', formData);
  return upload?.url || null;
}

export async function addProductImage(productId, imageUrl, isPrimary = true) {
  return api.post(`/products/${productId}/images`, { imageUrl, isPrimary });
}

export const DRAFT_KEY = 'product_draft';
export const DRAFT_FIELDS = ['prodTitle', 'prodDesc', 'prodBrand', 'prodPrice', 'prodCondition', 'prodStock', 'prodLocation', 'prodCategory'];

export function loadProductDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
  } catch { return null; }
}

export function saveProductDraft(fields) {
  const draft = {};
  DRAFT_FIELDS.forEach(id => { if (fields[id] !== undefined) draft[id] = fields[id]; });
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearProductDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
