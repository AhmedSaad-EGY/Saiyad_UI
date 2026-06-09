import { api } from '../../shared/api/client.js';
import { t } from '../../shared/utils/i18n.js';

export async function fetchUnreadNotificationCount() {
  try {
    const data = await api.get('/notifications/unread-count');
    return data?.count ?? data ?? 0;
  } catch { return 0; }
}

export async function fetchNotifications(pageSize = 50) {
  return api.get('/notifications', { pageSize });
}

export function normalizeNotifications(data) {
  const source =
    Array.isArray(data) ? data
      : Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.data) ? data.data
          : Array.isArray(data?.data?.items) ? data.data.items
            : Array.isArray(data?.data?.data) ? data.data.data
              : Array.isArray(data?.notifications) ? data.notifications
                : Array.isArray(data?.results) ? data.results
                  : Array.isArray(data?.value) ? data.value
                    : [];

  return source.map((n) => {
    const id = n.id ?? n.notificationId ?? n.notificationID ?? '';
    const isRead = Boolean(n.isRead ?? n.read ?? n.readAt ?? n.readOn ?? n.dateRead);
    const title = n.title ?? n.subject ?? n.type ?? t('notif.title');
    const message = n.message ?? n.body ?? n.content ?? n.description ?? '';
    const createdAt = n.createdAt ?? n.createdOn ?? n.createdDate ?? n.dateCreated ?? n.timestamp ?? n.sentAt;
    return { id, isRead, title, message, createdAt };
  });
}

export function countUnreadNotifications(notifs) {
  return notifs.filter((n) => !n.isRead).length;
}

export async function markNotificationRead(id) {
  try {
    await api.put(`/notifications/${id}/read`);
  } catch {
    await api.post(`/notifications/${id}/read`, {});
  }
}

export async function markAllNotificationsRead() {
  try {
    await api.put('/notifications/read-all');
  } catch {
    await api.post('/notifications/read-all', {});
  }
}
