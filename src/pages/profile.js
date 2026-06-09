import { t } from '../shared/utils/i18n.js';
import { isAuthenticated, getUser } from '../features/auth/login.js';
import { ROLES, SELLER_ROLES, ECOMMERCE_ROLES } from '../shared/constants/roles.js';
import { navigate } from '../app/router.js';
import '../features/profile/index.js';
import { renderProfileHero, buildStatsHtml, buildLinksHtml } from '../widgets/profile/index.js';

export default async function renderProfile(container) {
  if (!isAuthenticated()) { navigate("login"); return; }

  const user = getUser();
  const isEcommerce = ECOMMERCE_ROLES.includes(user?.role);
  const isSeller = SELLER_ROLES.includes(user?.role);
  const isAuct = user?.role === ROLES.AUCTIONEER;
  const isAdm = user?.role === ROLES.ADMIN;

  container.innerHTML = `
    <div x-data="profilePage" class="profile-page">
      ${renderProfileHero(user)}
      <div class="profile-completion animate-on-scroll stagger-1">
        <div class="profile-completion-header">
          <span><i class="fas fa-id-card me-1"></i>${t("profile.completion")}</span>
          <strong class="text-primary" x-text="completionPercent + '%'"></strong>
        </div>
        <div class="profile-completion-bar" role="progressbar"
             :aria-valuenow="completionPercent" aria-valuemin="0" aria-valuemax="100">
          <div class="profile-completion-fill" :style="{ width: completionPercent + '%' }"></div>
        </div>
      </div>
      <div class="profile-stats-grid animate-on-scroll stagger-2">
        ${buildStatsHtml({ isEcommerce, isAuct, isAdm })}
      </div>
      <div class="profile-quick-links animate-on-scroll stagger-3">
        <h2 class="profile-quick-links-title">${t("common.quickLinks")}</h2>
        <div class="profile-link-grid">
          ${buildLinksHtml({ isEcommerce, isSeller, isAuct, isAdm })}
        </div>
      </div>
    </div>`;
}
