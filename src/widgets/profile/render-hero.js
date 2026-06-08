import { t } from '../../app/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';

export function renderProfileHero(user) {
  return `
    <div class="profile-hero card animate-on-scroll">
      <div class="card-body d-flex align-items-center gap-4 flex-wrap">

        <div class="profile-avatar"
             :class="{ 'is-uploading': avatarLoading }"
             role="button" tabindex="0"
             @click="triggerUpload()"
             @keydown.enter.prevent="triggerUpload()"
             @keydown.space.prevent="triggerUpload()"
             :title="$t('profile.uploadPhoto')"
             :aria-label="$t('profile.uploadPhoto')">
          <span x-show="avatarLoading" class="avatar-spinner" aria-hidden="true">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
          <template x-if="avatarUrl && !avatarLoading">
            <div>
              <img :src="avatarUrl" alt="" loading="lazy" class="avatar-img">
              <button class="avatar-delete-btn" type="button"
                      @click.stop="deleteImage()"
                      :title="$t('profile.removePhoto')"
                      :aria-label="$t('profile.removePhoto')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </template>
          <i x-show="!avatarUrl && !avatarLoading" class="fas fa-user"></i>
          <span x-show="!avatarLoading" class="avatar-overlay">
            <i class="fas fa-camera"></i>
          </span>
        </div>

        <input type="file" id="profileAvatarInput"
               accept="image/jpeg,image/png,image/webp"
               @change="handleFile($event)"
               class="d-none" tabindex="-1">

        <div class="profile-hero-info flex-grow-1">
          <h1 class="profile-name">${escapeHtml(user?.fullName || t("dash.profile"))}</h1>
          <p class="profile-email text-muted mb-1">
            <i class="fas fa-envelope me-1"></i>${escapeHtml(user?.email ?? "")}
          </p>
          ${user?.phone ? `<p class="profile-phone text-muted mb-2"><i class="fas fa-phone me-1"></i>${escapeHtml(user.phone)}</p>` : ""}
          <span class="profile-role-badge">${escapeHtml(user?.role ?? "")}</span>
        </div>

        <div class="profile-hero-actions d-flex flex-column gap-2">
          <a href="#/dashboard?tab=profile" class="btn btn-outline btn-sm">
            <i class="fas fa-edit me-1"></i>${t("dash.updateProfile")}
          </a>
          <a href="#/dashboard?tab=password" class="btn btn-ghost btn-sm">
            <i class="fas fa-lock me-1"></i>${t("dash.changePassword")}
          </a>
        </div>

      </div>
    </div>`;
}
