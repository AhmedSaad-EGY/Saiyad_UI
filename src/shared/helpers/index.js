export function extractClaim(val) {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && val.length > 0) return String(val[0]);
  return null;
}

export function parseJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
