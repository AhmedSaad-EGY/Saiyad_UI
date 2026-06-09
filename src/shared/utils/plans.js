export function getPlanIcon(tier) {
  const icons = { 1: 'fa-fish', 2: 'fa-water', 3: 'fa-ship', 4: 'fa-crown' };
  return icons[tier] || 'fa-fish';
}

export function isPopularPlan(sortOrder) {
  return sortOrder === 3;
}
