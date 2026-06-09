import { api } from '../../shared/api/client.js';

export async function fetchProductRating(productId) {
  try {
    return await api.get(`/reviews/product/${productId}/rating`);
  } catch { return null; }
}

export async function fetchProductReviews(productId) {
  try {
    return await api.get(`/reviews/product/${productId}`);
  } catch { return null; }
}

export async function submitReview(productId, rating, comment) {
  return api.post('/reviews', { productId, rating, comment });
}

export function sortReviews(reviews, sortBy) {
  const sorted = [...reviews];
  if (sortBy === 'highest') sorted.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'lowest') sorted.sort((a, b) => a.rating - b.rating);
  else sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return sorted;
}

export function initStarRating(containerId) {
  const stars = document.querySelectorAll(`#${containerId} .fa-star`);
  const ratingVal = document.getElementById("ratingVal");
  if (!stars.length || !ratingVal) return;
  stars.forEach((star) => {
    star.setAttribute("tabindex", "0");
    star.addEventListener("mouseenter", () => {
      const v = parseInt(star.dataset.star);
      stars.forEach((s) => {
        s.style.color = parseInt(s.dataset.star) <= v ? "var(--warning)" : "var(--text-muted)";
        s.style.transform = parseInt(s.dataset.star) <= v ? "scale(1.2)" : "scale(1)";
      });
    });
    star.addEventListener("mouseleave", () => {
      const selected = parseInt(ratingVal.value);
      stars.forEach((s) => {
        s.style.color = parseInt(s.dataset.star) <= selected ? "var(--warning)" : "var(--text-muted)";
        s.style.transform = "scale(1)";
      });
    });
    star.addEventListener("click", () => {
      ratingVal.value = star.dataset.star;
      stars.forEach((s) => {
        s.setAttribute("aria-checked", String(parseInt(s.dataset.star) === parseInt(star.dataset.star)));
        s.style.color = parseInt(s.dataset.star) <= parseInt(star.dataset.star) ? "var(--warning)" : "var(--text-muted)";
        s.style.transform = "scale(1)";
      });
    });
    star.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); star.click(); }
    });
  });
}
