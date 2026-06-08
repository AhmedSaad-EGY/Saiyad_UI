import { t } from '../../app/i18n.js';
import { escapeHtml, observeAnimations } from '../../shared/utils/dom.js';

export function renderUserCard(container, user, stats) {
  if (!user) return;
  const avatarUrl = user.profileImageUrl || '';
  const completionPercent = computeCompletion(user);
  container.innerHTML = `
    <div class="profile-hero animate-on-scroll">
      <div class="profile-avatar-wrapper">
        ${avatarUrl
          ? `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(user.fullName || user.name || '')}" class="profile-avatar">`
          : `<div class="profile-avatar profile-avatar-placeholder"><i class="fas fa-user"></i></div>`}
      </div>
      <div class="profile-info">
        <h1 class="profile-name">${escapeHtml(user.fullName || user.name || '')}</h1>
        <p class="profile-email">${escapeHtml(user.email || '')}</p>
        ${user.phone ? `<p class="profile-phone"><i class="fas fa-phone"></i> ${escapeHtml(user.phone)}</p>` : ''}
        ${user.role ? `<span class="category-tag">${escapeHtml(user.role)}</span>` : ''}
      </div>
    </div>
    ${completionPercent < 100 ? `
      <div class="profile-completion">
        <div class="profile-completion-bar">
          <div class="profile-completion-fill" style="width:${completionPercent}%"></div>
        </div>
        <span class="profile-completion-text">${completionPercent}% ${t('profile.complete')}</span>
      </div>` : ''}
    ${stats ? `<div class="profile-stats-grid">${stats.map(s => `
      <div class="profile-stat-card">
        <div class="profile-stat-value">${s.value}</div>
        <div class="profile-stat-label">${s.label}</div>
      </div>`).join('')}</div>` : ''}`;
  observeAnimations();
}

function computeCompletion(user) {
  let pct = 0;
  if (user.fullName || user.name) pct += 25;
  if (user.email) pct += 25;
  if (user.phone) pct += 25;
  if (user.profileImageUrl) pct += 25;
  return Math.min(pct, 100);
}
