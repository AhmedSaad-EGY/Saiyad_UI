export function clampQuantity(value, min = 1, max = 99) {
  return Math.max(min, Math.min(max, parseInt(value) || min));
}
