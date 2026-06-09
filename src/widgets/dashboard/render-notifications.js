import { t } from '../../app/i18n.js';
import { $$, escapeHtml, renderEmptyState, observeAnimations } from '../../shared/utils/dom.js';
import { formatDate } from '../../shared/utils/format.js';
import { showToast } from '../ui/toast.js';

export function renderNotifications(content, { notifications, onMarkRead, onMarkAllRead, error }) {
  content.innerHTML = `<div class="card animate-on-scroll"><div class="card-header"><h3><i class="fas fa-bell" aria-hidden="true"></i> ${t("dash.notifications")}</h3></div><div class="card-body"><div class="d-flex gap-2 mb-2"><button class="btn btn-sm btn-ghost" id="markAllRead"><i class="fas fa-check-double" aria-hidden="true"></i> ${t("notif.markAllRead")}</button></div><div id="notifList"></div></div></div>`;

  const container = document.getElementById("notifList");

  if (error) {
    container.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(error)}</div>`;
    return;
  }

  if (!notifications.length) {
    renderEmptyState(container, {
      icon: "fa-bell",
      title: t("dash.noNotifications"),
    });
    observeAnimations();
    return;
  }

  container.innerHTML = notifications
    .map(
      (n) => `
    <div class="notif-item ${n.isRead ? "" : "unread"}" data-id="${escapeHtml(n.id)}">
      <div class="flex-grow-1">
        <strong>${escapeHtml(n.title)}</strong>
        <p class="text-muted small">${escapeHtml(n.message)}</p>
        <small class="text-muted">${formatDate(n.createdAt)}</small>
      </div>
      ${!n.isRead ? `<button class="btn btn-sm btn-ghost mark-read" aria-label="${t('notif.markAsRead')}" data-id="${n.id}"><i class="fas fa-check" aria-hidden="true"></i></button>` : ""}
    </div>
  `,
    )
    .join("");

  $$(".mark-read").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!onMarkRead) return;
      try {
        await onMarkRead(btn.dataset.id);
        btn.closest(".notif-item").classList.remove("unread");
        btn.remove();
      } catch { /* notification UI unaffected */ }
    });
  });

  document.getElementById("markAllRead")?.addEventListener("click", async () => {
    if (!onMarkAllRead) return;
    try {
      await onMarkAllRead();
      document.querySelectorAll("#notifList .notif-item").forEach((el) => el.classList.remove("unread"));
      document.querySelectorAll("#notifList .mark-read").forEach((el) => el.remove());
      showToast(t("notif.markedAllRead"), "success");
    } catch { /* already toasted success */ }
  });
  observeAnimations();
}
