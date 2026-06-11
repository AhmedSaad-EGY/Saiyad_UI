const RECENT_KEY = 'sayiad_recent';
const RECENT_MAX = 12;

function readRecentEntries() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(v => v !== null && v !== undefined && typeof v.id !== 'undefined');
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(id, title, image, price, type = 'product') {
  let viewed = readRecentEntries();
  viewed = viewed.filter(v => v.id !== id);
  viewed.unshift({ id, title, image, price, type, time: Date.now() });
  if (viewed.length > RECENT_MAX) viewed = viewed.slice(0, RECENT_MAX);
  localStorage.setItem(RECENT_KEY, JSON.stringify(viewed));
}

export function getRecentlyViewed() {
  return readRecentEntries();
}
