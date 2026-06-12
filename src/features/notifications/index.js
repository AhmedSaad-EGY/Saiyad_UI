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
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : [];

  return source.map((n) => ({
    id: n.id ?? '',
    isRead: Boolean(n.isRead),
    title: n.title ?? t('notif.title'),
    message: n.message ?? '',
    createdAt: n.createdAt ?? null,
  }));
}

export function countUnreadNotifications(notifs) {
  return notifs.filter((n) => !n.isRead).length;
}

export async function markNotificationRead(id) {
  await api.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.put('/notifications/read-all');
}
