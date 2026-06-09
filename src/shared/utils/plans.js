export function getPlanIcon(tier) {
  const icons = { 1: 'fa-fish', 2: 'fa-water', 3: 'fa-ship', 4: 'fa-crown' };
  return icons[tier] || 'fa-fish';
}

export function isPopularPlan(sortOrder) {
  return sortOrder === 3;
}

export function computePlanStatus(plan, mySubscription, walletBalance) {
  const isCurrent = mySubscription && (mySubscription.tier === plan.tier || mySubscription.planName === plan.name);
  const insufficient = !isCurrent && plan.price > 0 && walletBalance !== null && walletBalance < plan.price;
  const isPop = isPopularPlan(plan.sortOrder);
  return { isCurrent, insufficient, isPop };
}
