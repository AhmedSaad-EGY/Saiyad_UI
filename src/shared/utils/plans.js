export function getPlanIcon(tier) {
  const raw = String(tier ?? '').trim().toLowerCase();
  const icons = {
    1: 'fa-fish',
    2: 'fa-water',
    3: 'fa-ship',
    4: 'fa-crown',
    basic: 'fa-fish',
    pro: 'fa-ship',
    enterprise: 'fa-crown',
    premium: 'fa-crown',
  };
  return icons[tier] || icons[raw] || 'fa-fish';
}

export function isPopularPlan(sortOrder) {
  return sortOrder === 3;
}

export function computePlanStatus(plan, mySubscription, walletBalance) {
  const normalizeTier = (value) => {
    const raw = String(value ?? '').trim().toLowerCase();
    if (raw === 'premium') return 'enterprise';
    return raw;
  };
  const isCurrent = mySubscription && (
    normalizeTier(mySubscription.tier) === normalizeTier(plan.tier) ||
    normalizeTier(mySubscription.tier) === normalizeTier(plan.name) ||
    normalizeTier(mySubscription.planName) === normalizeTier(plan.name)
  );
  const insufficient = !isCurrent && plan.price > 0 && walletBalance !== null && walletBalance < plan.price;
  const isPop = isPopularPlan(plan.sortOrder);
  return { isCurrent, insufficient, isPop };
}
