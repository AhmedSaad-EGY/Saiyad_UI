import { t } from "../core/i18n/index.js";
import { api } from "../core/api/client.js";
import {
  isAuthenticated,
  getUser,
  hasAnyRole,
  hasRole,
} from "../core/auth/index.js";
import {
  ROLES,
  SELLER_ROLES,
  ECOMMERCE_ROLES,
} from "../shared/constants/roles.js";
import { navigate } from "../core/router/index.js";
import { escapeHtml, observeAnimations } from "../core/utils/dom.js";
import { showConfirm, showToast } from "../core/utils/ui.js";
import { setPageMeta } from "../core/utils/seo.js";
import Alpine from "alpinejs";

// ─── Stats fetcher ─────────────────────────────────────────────────────────────
// Each call mutates the shared result object independently.
// No index-offset arithmetic — every branch is self-contained.
async function fetchProfileStats() {
  const s = {
    orders: 0,
    wishlist: 0,
    notifs: 0,
    auctions: 0,
    pendingRequests: 0,
    pendingReviews: 0,
    totalUsers: 0,
  };

  await Promise.allSettled([
    ...(hasAnyRole(ECOMMERCE_ROLES)
      ? [
          api
            .get("/orders", { page: 1, pageSize: 1 })
            .then((r) => {
              s.orders = r?.totalCount ?? 0;
            })
            .catch(() => {}),
          api
            .get("/wishlist", { page: 1, pageSize: 1 })
            .then((r) => {
              s.wishlist = r?.totalCount ?? 0;
            })
            .catch(() => {}),
        ]
      : []),

    api
      .get("/notifications/unread-count")
      .then((r) => {
        s.notifs = r?.count ?? r ?? 0;
      })
      .catch(() => {}),

    ...(hasRole(ROLES.AUCTIONEER)
      ? [
          api
            .get("/auctions/dashboard")
            .then((r) => {
              s.auctions = r?.activeAuctions ?? 0;
              s.pendingRequests = r?.pendingRequests ?? 0;
            })
            .catch(() => {}),
        ]
      : []),

    ...(hasRole(ROLES.ADMIN)
      ? [
          api
            .get("/products/pending-review")
            .then((r) => {
              s.pendingReviews = r?.totalCount ?? 0;
            })
            .catch(() => {}),
          api
            .get("/users", { page: 1, pageSize: 1 })
            .then((r) => {
              s.totalUsers = r?.totalCount ?? 0;
            })
            .catch(() => {}),
        ]
      : []),
  ]);

  // Coerce everything to non-negative integers in one pass
  for (const k of Object.keys(s)) {
    s[k] = Math.max(0, parseInt(s[k], 10) || 0);
  }
  return s;
}

// ─── Alpine component ──────────────────────────────────────────────────────────
Alpine.data("profilePage", () => {
  const user = getUser();

  return {
    user,

    // Reactive avatar URL — drives the template without any innerHTML swapping
    avatarUrl: user?.profileImage ?? null,
    avatarLoading: false,

    // Stats arrive async; skeleton is shown until this flips to false
    statsLoading: true,
    stats: {
      orders: 0,
      wishlist: 0,
      notifs: 0,
      auctions: 0,
      pendingRequests: 0,
      pendingReviews: 0,
      totalUsers: 0,
    },

    // Computed — automatically recalculates when avatarUrl changes after upload
    get completionPercent() {
      return (
        (this.user?.fullName ? 25 : 0) +
        (this.user?.email ? 25 : 0) +
        (this.user?.phone ? 25 : 0) +
        (this.avatarUrl ? 25 : 0)
      );
    },

    async init() {
      setPageMeta(t("profile.title"), undefined, true);
      this.$nextTick(() => observeAnimations());

      const raw = await fetchProfileStats();
      this.statsLoading = false;
      for (const [key, target] of Object.entries(raw)) {
        this._countUp(key, target);
      }
    },

    // Smooth counter animation: eased step count, clean interval teardown
    _countUp(key, target) {
      if (target <= 0) return;
      const DURATION = 800;
      const steps = Math.min(target, 60);
      const step = Math.ceil(target / steps);
      const delay = Math.round(DURATION / steps);
      let current = 0;
      const id = setInterval(() => {
        current = Math.min(current + step, target);
        this.stats[key] = current;
        if (current >= target) clearInterval(id);
      }, delay);
    },

    // ── Avatar actions ──────────────────────────────────────────────────────

    triggerUpload() {
      document.getElementById("profileAvatarInput")?.click();
    },

    async handleFile(e) {
      const file = e.target.files?.[0];
      e.target.value = ""; // reset immediately so the same file can be re-picked

      if (!file) return;

      if (file.size > 5_000_000) {
        showToast(t("profile.imageTooLarge"), "error");
        return;
      }

      this.avatarLoading = true;
      try {
        const form = new FormData();
        form.append("file", file);

        const upload = await api.upload("/upload", form);
        const imageUrl = upload?.url ?? upload?.data?.url;
        if (!imageUrl) throw new Error(t("profile.uploadNoUrl"));

        const u = getUser();
        await api.put("/users/profile", {
          fullName: u?.fullName ?? "",
          phone: u?.phone ?? "",
          profileImage: imageUrl,
        });

        this.avatarUrl = imageUrl;
        localStorage.setItem(
          "user",
          JSON.stringify({ ...u, profileImage: imageUrl }),
        );
        showToast(t("profile.photoUpdated"), "success");
      } catch (err) {
        showToast(err.message || t("common.error"), "error");
      } finally {
        this.avatarLoading = false;
      }
    },

    async deleteImage() {
      const ok = await showConfirm(
        t("profile.confirmDeleteTitle"),
        t("profile.confirmDeletePhoto"),
        { type: "danger" },
      );
      if (!ok) return;

      this.avatarLoading = true;
      try {
        await api.delete("/users/profile/image");
        this.avatarUrl = null;
        const u = getUser();
        localStorage.setItem(
          "user",
          JSON.stringify({ ...u, profileImage: null }),
        );
        showToast(t("profile.photoRemoved"), "success");
      } catch (err) {
        showToast(err.message || t("common.error"), "error");
      } finally {
        this.avatarLoading = false;
      }
    },
  };
});

// ─── Template helpers ──────────────────────────────────────────────────────────

/**
 * Single stat card.
 * The skeleton is shown while statsLoading is true; the counter runs once false.
 */
function statCard(icon, key, label, iconClass = "") {
  return `
    <div class="profile-stat-card animate-on-scroll">
      <i class="fas fa-${icon}${iconClass ? ` ${iconClass}` : ""}" aria-hidden="true"></i>
      <div class="profile-stat-num">
        <span x-show="statsLoading"
              class="skeleton"
              style="width:2.25rem;height:1.25rem;border-radius:4px;display:inline-block"
              aria-hidden="true"></span>
        <span x-show="!statsLoading" x-text="stats.${key}">0</span>
      </div>
      <div class="profile-stat-label">${label}</div>
    </div>`;
}

/** Single quick-link card. Always rendered server-side (no Alpine needed). */
function quickLink(href, icon, label) {
  return `
    <a href="${href}" class="profile-link-card">
      <i class="fas fa-${icon}" aria-hidden="true"></i>
      <span>${label}</span>
    </a>`;
}

// ─── Page renderer ─────────────────────────────────────────────────────────────
export default async function renderProfile(container) {
  if (!isAuthenticated()) {
    navigate("login");
    return;
  }

  const user = getUser();

  // Resolve role booleans once — used to gate both stat cards and quick links.
  // Role cannot change mid-session, so render-time evaluation is correct.
  const isEcommerce = ECOMMERCE_ROLES.includes(user?.role);
  const isSeller = SELLER_ROLES.includes(user?.role);
  const isAuct = user?.role === ROLES.AUCTIONEER;
  const isAdm = user?.role === ROLES.ADMIN;

  // ── Stat cards (only cards relevant to this role are emitted) ───────────────
  const statsHtml = [
    ...(isEcommerce
      ? [
          statCard("box", "orders", t("dash.orders")),
          statCard("heart", "wishlist", t("dash.wishlist")),
        ]
      : []),
    statCard("bell", "notifs", t("dash.notifications")),
    ...(isAuct
      ? [
          statCard("gavel", "auctions", t("home.activeAuctions")),
          statCard(
            "file-export",
            "pendingRequests",
            t("auctionRequests.title"),
          ),
        ]
      : []),
    ...(isAdm
      ? [
          statCard(
            "clipboard-check",
            "pendingReviews",
            t("dash.pendingReviews"),
            "text-warning",
          ),
          statCard("users", "totalUsers", t("dash.totalUsers"), "text-primary"),
        ]
      : []),
  ].join("");

  // ── Quick links (same role gating; no Alpine x-if overhead) ────────────────
  const linksHtml = [
    ...(isEcommerce
      ? [
          quickLink("#/dashboard?tab=orders", "shopping-bag", t("dash.orders")),
          quickLink("#/dashboard?tab=wishlist", "heart", t("dash.wishlist")),
          quickLink("#/shipping", "map-marker-alt", t("dash.addresses")),
        ]
      : []),
    ...(isSeller
      ? [
          quickLink("#/dashboard?tab=products", "store", t("dash.myProducts")),
          quickLink(
            "#/dashboard?tab=overview",
            "chart-line",
            t("dash.sellerDashboard"),
          ),
        ]
      : []),
    ...(isAuct
      ? [
          quickLink("#/dashboard?tab=auctions", "gavel", t("dash.auctions")),
          quickLink(
            "#/dashboard?tab=auctioneer-analytics",
            "chart-bar",
            t("analytics.title"),
          ),
          quickLink(
            "#/auction-requests-review",
            "file-export",
            t("auctionRequestsReview.title"),
          ),
        ]
      : []),
    ...(isAdm
      ? [
          quickLink("#/admin", "shield-alt", t("admin.title")),
          quickLink("#/admin", "clipboard-check", t("admin.review")),
          quickLink("#/admin", "users", t("admin.users")),
          quickLink("#/admin", "flag", t("admin.reports")),
        ]
      : []),
    // Always present
    quickLink("#/dashboard?tab=notifications", "bell", t("dash.notifications")),
    quickLink("#/wallet", "wallet", t("wallet.title")),
  ].join("");

  // ── Shell ───────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div x-data="profilePage" class="profile-page">

      <!-- Hero ─────────────────────────────────────── -->
      <div class="profile-hero card animate-on-scroll">
        <div class="card-body d-flex align-items-center gap-4 flex-wrap">

          <!-- Avatar -->
          <div class="profile-avatar"
               :class="{ 'is-uploading': avatarLoading }"
               role="button"
               tabindex="0"
               @click="triggerUpload()"
               @keydown.enter.prevent="triggerUpload()"
               @keydown.space.prevent="triggerUpload()"
               :title="$t('profile.uploadPhoto')"
               :aria-label="$t('profile.uploadPhoto')">

            <!-- Spinner (shown while upload or delete is in flight) -->
            <span x-show="avatarLoading" class="avatar-spinner" aria-hidden="true">
              <i class="fas fa-spinner fa-spin"></i>
            </span>

            <!-- Photo + delete button -->
            <template x-if="avatarUrl && !avatarLoading">
              <div>
                <img :src="avatarUrl" alt="" loading="lazy" class="avatar-img">
                <button class="avatar-delete-btn"
                        type="button"
                        @click.stop="deleteImage()"
                        :title="$t('profile.removePhoto')"
                        :aria-label="$t('profile.removePhoto')">
                  <i class="fas fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            </template>

            <!-- Fallback silhouette -->
            <i x-show="!avatarUrl && !avatarLoading"
               class="fas fa-user" aria-hidden="true"></i>

            <!-- Camera overlay (always visible when idle) -->
            <span x-show="!avatarLoading" class="avatar-overlay" aria-hidden="true">
              <i class="fas fa-camera"></i>
            </span>
          </div>

          <!-- Hidden file input — triggered programmatically -->
          <input type="file"
                 id="profileAvatarInput"
                 accept="image/jpeg,image/png,image/webp"
                 @change="handleFile($event)"
                 class="d-none"
                 tabindex="-1"
                 aria-hidden="true">

          <!-- User info -->
          <div class="profile-hero-info flex-grow-1">
            <h1 class="profile-name">${escapeHtml(user?.fullName || t("dash.profile"))}</h1>
            <p class="profile-email text-muted mb-1">
              <i class="fas fa-envelope me-1" aria-hidden="true"></i>${escapeHtml(user?.email ?? "")}
            </p>
            ${
              user?.phone
                ? `
            <p class="profile-phone text-muted mb-2">
              <i class="fas fa-phone me-1" aria-hidden="true"></i>${escapeHtml(user.phone)}
            </p>`
                : ""
            }
            <span class="profile-role-badge">${escapeHtml(user?.role ?? "")}</span>
          </div>

          <!-- Actions -->
          <div class="profile-hero-actions d-flex flex-column gap-2">
            <a href="#/dashboard?tab=profile" class="btn btn-outline btn-sm">
              <i class="fas fa-edit me-1" aria-hidden="true"></i>${t("dash.updateProfile")}
            </a>
            <a href="#/dashboard?tab=password" class="btn btn-ghost btn-sm">
              <i class="fas fa-lock me-1" aria-hidden="true"></i>${t("dash.changePassword")}
            </a>
          </div>

        </div>
      </div>

      <!-- Profile completion ────────────────────────── -->
      <div class="profile-completion animate-on-scroll stagger-1">
        <div class="profile-completion-header">
          <span>
            <i class="fas fa-id-card me-1" aria-hidden="true"></i>${t("profile.completion")}
          </span>
          <strong class="text-primary" x-text="completionPercent + '%'"></strong>
        </div>
        <div class="profile-completion-bar"
             role="progressbar"
             :aria-valuenow="completionPercent"
             aria-valuemin="0"
             aria-valuemax="100">
          <div class="profile-completion-fill"
               :style="{ width: completionPercent + '%' }"></div>
        </div>
      </div>

      <!-- Stats grid ───────────────────────────────── -->
      <div class="profile-stats-grid animate-on-scroll stagger-2">
        ${statsHtml}
      </div>

      <!-- Quick links ──────────────────────────────── -->
      <div class="profile-quick-links animate-on-scroll stagger-3">
        <h2 class="profile-quick-links-title">${t("common.quickLinks")}</h2>
        <div class="profile-link-grid">
          ${linksHtml}
        </div>
      </div>

    </div>`;
}
