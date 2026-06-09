import { api } from '../../shared/api/client.js';
import { escapeHtml } from '../../shared/utils/dom.js';
import { openLightbox } from '../../shared/utils/ui.js';

export async function fetchProductById(id) {
  return api.get(`/products/${id}`);
}

export async function fetchProducts(params) {
  return api.get('/products', params);
}

export async function fetchSimilarProducts(categoryId, excludeId, count = 4) {
  const data = await fetchProducts({ categoryId, pageSize: count + 1 });
  const items = data.items || data.data || [];
  return items.filter((s) => s.id !== excludeId).slice(0, count);
}

export function initImageMagnifier(wrap, img, lens, primaryImageUrl, allImages) {
  if (!wrap || !img || !lens || !allImages.length) return;
  wrap.addEventListener("mousemove", (e) => {
    const rect = wrap.getBoundingClientRect();
    let x = e.clientX - rect.left, y = e.clientY - rect.top;
    const lensW = 160, lensH = 160;
    if (x > rect.width - lensW / 2) x = rect.width - lensW / 2;
    if (x < lensW / 2) x = lensW / 2;
    if (y > rect.height - lensH / 2) y = rect.height - lensH / 2;
    if (y < lensH / 2) y = lensH / 2;
    lens.style.left = `${x - lensW / 2}px`;
    lens.style.top = `${y - lensH / 2}px`;
    lens.style.backgroundImage = `url('${escapeHtml(primaryImageUrl)}')`;
    lens.style.backgroundSize = `${img.offsetWidth * 2}px ${img.offsetHeight * 2}px`;
    lens.style.backgroundPosition = `-${(x * 2) - lensW / 2}px -${(y * 2) - lensH / 2}px`;
  });
  wrap.addEventListener("click", () => openLightbox(allImages, 0));
}

export function initGallerySwipe(wrap, allImages) {
  if (!wrap) return;
  let startX = 0, startY = 0;
  wrap.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
  wrap.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
    const mainImg = document.getElementById("mainImg");
    const magLens = document.getElementById("magLens");
    const currentSrc = mainImg?.src;
    const currentIndex = currentSrc ? allImages.findIndex(img => currentSrc.includes(encodeURIComponent(img.split('/').pop() || img))) : -1;
    const active = currentIndex >= 0 ? currentIndex : 0;
    const next = dx < 0 ? Math.min(active + 1, allImages.length - 1) : Math.max(active - 1, 0);
    if (next !== active && mainImg) {
      mainImg.src = allImages[next];
      magLens.style.backgroundImage = `url('${escapeHtml(allImages[next])}')`;
    }
  }, { passive: true });
}
