const RECENT_KEY = 'sayiad_recent';
const RECENT_MAX = 12;

export function trackRecentlyViewed(id, title, image, price, type = 'product') {
  let viewed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  viewed = viewed.filter(v => v.id !== id);
  viewed.unshift({ id, title, image, price, type, time: Date.now() });
  if (viewed.length > RECENT_MAX) viewed = viewed.slice(0, RECENT_MAX);
  localStorage.setItem(RECENT_KEY, JSON.stringify(viewed));
}

export function getRecentlyViewed() {
  try {
    const viewed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(viewed) ? viewed : [];
  } catch { return []; }
}
