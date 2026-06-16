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
  const container = document.getElementById(containerId);
  const stars = [...(container?.querySelectorAll("[data-star]") || [])];
  const ratingVal = document.getElementById("ratingVal");
  if (!stars.length || !ratingVal) return;

  const clampRating = (value) => {
    if (value < 1) return stars.length;
    if (value > stars.length) return 1;
    return value;
  };

  const getStarValue = (star) => parseInt(star.dataset.star, 10) || 0;

  const paintStars = (value) => {
    stars.forEach((s) => {
      const active = getStarValue(s) <= value;
      s.style.color = active ? "var(--warning)" : "var(--text-muted)";
      s.style.transform = active && value ? "scale(1.2)" : "scale(1)";
    });
  };

  const setSelectedRating = (value, shouldFocus = false) => {
    const selectedValue = clampRating(value);
    ratingVal.value = String(selectedValue);
    stars.forEach((s) => {
      const selected = getStarValue(s) === selectedValue;
      s.setAttribute("aria-checked", String(selected));
      s.tabIndex = selected ? 0 : -1;
    });
    paintStars(selectedValue);
    if (shouldFocus) stars[selectedValue - 1]?.focus();
  };

  stars.forEach((star) => {
    star.addEventListener("mouseenter", () => {
      paintStars(getStarValue(star));
    });
    star.addEventListener("mouseleave", () => {
      paintStars(parseInt(ratingVal.value, 10) || 0);
    });
    star.addEventListener("click", () => {
      setSelectedRating(getStarValue(star));
    });
    star.addEventListener("keydown", (e) => {
      const current = getStarValue(star);
      const isRtl = document.documentElement.dir === "rtl";
      let next;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelectedRating(current);
        return;
      }
      if (e.key === "ArrowRight") next = current + (isRtl ? -1 : 1);
      else if (e.key === "ArrowLeft") next = current + (isRtl ? 1 : -1);
      else if (e.key === "ArrowUp") next = current + 1;
      else if (e.key === "ArrowDown") next = current - 1;
      else if (e.key === "Home") next = 1;
      else if (e.key === "End") next = stars.length;
      else return;
      e.preventDefault();
      setSelectedRating(clampRating(next), true);
    });
  });
}
