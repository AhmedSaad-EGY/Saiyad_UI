import { t } from '../../shared/utils/i18n.js';
import { escapeHtml, safeSetHTML } from '../../shared/utils/dom.js';
import { formatDate, renderStars } from '../../shared/utils/format.js';

export function renderReviewCards(reviewsList, reviews, page = 1) {
  const pageSize = 5;
  const paginated = reviews.slice(0, page * pageSize);
  if (paginated.length === 0) {
    safeSetHTML(reviewsList, `<p class="text-muted text-center p-4">${t("review.noReviews")}</p>`);
  } else {
    safeSetHTML(reviewsList, paginated.map(r => `
      <div class="notif-item">
        <div class="flex-fill">
          <strong>${escapeHtml(r.userName || "User")}</strong>
          <span class="text-warning">${renderStars(r.rating)}</span>
          ${r.comment ? `<p class="mt-1" style="color:var(--text-secondary);font-size:0.9rem">${escapeHtml(r.comment)}</p>` : ""}
          <small class="text-muted">${formatDate(r.createdAt)}</small>
        </div>
      </div>
    `).join(''));
  }
  const loadMoreBtn = document.getElementById("reviewPagination");
  if (reviews.length > page * pageSize) loadMoreBtn?.classList.remove("d-none");
  else loadMoreBtn?.classList.add("d-none");
}
