import Alpine from "alpinejs";
import { t } from "../core/i18n/index.js";
import { api } from "../core/api/client.js";
import { isAuthenticated, hasAnyRole, hasRole } from "../core/auth/index.js";
import { ROLES, SELLER_ROLES } from "../shared/constants/roles.js";
import {
  escapeHtml,
  observeAnimations,
  initPullToRefresh,
} from "../core/utils/dom.js";
import { formatPrice, statusClass, tStatus } from "../core/utils/format.js";
import { setPageMeta } from "../core/utils/seo.js";

// ─── Template helpers ──────────────────────────────────────────────────────────

/** Skeleton column — reused for both product and auction loading states. */
function skeletonCard() {
  return `
    <div class="col">
      <div class="product-card card pe-none" aria-hidden="true">
        <div class="product-card-img skeleton-image-shim"></div>
        <div class="product-card-body p-3">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text" style="width:35%"></div>
        </div>
      </div>
    </div>`;
}

const SKELETON_ROW_CLASSES =
  "row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-4 g-3 skeleton-shimmer";
const CARD_ROW_CLASSES =
  "row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-4 g-3";

// ─── Recently-viewed builder ───────────────────────────────────────────────────
// Kept as a module-level function (not an Alpine method) because it reads
// from localStorage which is not reactive — Alpine would never know when to
// re-run a method-based version. We call it once after each loadData() and
// store the result as a plain string property.

function buildRecentlyViewedHtml() {
  let viewed;
  try {
    viewed = JSON.parse(localStorage.getItem("sayiad_recent") || "[]");
  } catch {
    return "";
  }
  if (!Array.isArray(viewed) || !viewed.length) return "";

  const items = viewed
    .map((v) => {
      const href =
        v.type === "auction"
          ? `#/auction-detail?id=${v.id}`
          : `#/product-detail?id=${v.id}`;
      const icon = v.type === "auction" ? "fa-gavel" : "fa-tag";
      const typeLabel =
        v.type === "auction" ? t("nav.auctions") : t("nav.products");
      const thumb = v.image
        ? `<img src="${v.image}" alt="${escapeHtml(v.title)}" loading="lazy">`
        : `<div class="recently-viewed-img-fallback">
           <i class="fas fa-image" aria-hidden="true"></i>
         </div>`;

      return `
      <a href="${href}" class="recently-viewed-item" title="${escapeHtml(v.title)}">
        ${thumb}
        <div class="recently-viewed-info">
          <span class="recently-viewed-title">${escapeHtml(v.title)}</span>
          ${
            v.price != null
              ? `<span class="recently-viewed-price">${formatPrice(v.price)}</span>`
              : ""
          }
          <span class="recently-viewed-type text-muted text-uppercase">
            <i class="fas ${icon}" aria-hidden="true"></i> ${typeLabel}
          </span>
        </div>
      </a>`;
    })
    .join("");

  return `
    <div class="section-header section-header-offset animate-on-scroll">
      <h2><i class="fas fa-history" aria-hidden="true"></i> ${t("common.recentlyViewed")}</h2>
    </div>
    <div class="recently-viewed-strip">${items}</div>`;
}

// ─── Alpine component ──────────────────────────────────────────────────────────
Alpine.data("homePage", () => ({
  loading: true,
  error: null,
  products: [],
  auctions: [],
  roleLinks: [],
  isAuth: false,
  recentlyViewedHtml: "", // computed once per load; drives x-html below

  async init() {
    this.isAuth = isAuthenticated();
    await this.loadData();
    this._ptrCleanup = initPullToRefresh({ onRefresh: () => this.loadData() });
  },

  // Alpine calls destroy() when the component is removed from the DOM (route change)
  destroy() {
    this._ptrCleanup?.();
  },

  async loadData() {
    this.loading = true;
    this.error = null;

    try {
      // Build role-specific quick links for authenticated users
      if (this.isAuth) {
        const links = [];
        if (hasAnyRole(SELLER_ROLES)) {
          links.push({
            href: "#/dashboard?tab=products",
            icon: "fa-tag",
            label: t("nav.myProducts"),
          });
        }
        if (hasRole(ROLES.ADMIN)) {
          links.push({
            href: "#/admin",
            icon: "fa-shield-alt",
            label: t("admin.title"),
          });
        }
        this.roleLinks = links;
      }

      const [productsRes, auctionsRes] = await Promise.all([
        api.get("/products", { PageSize: 4 }),
        api.get("/auctions", { PageSize: 4 }),
      ]);

      this.products = productsRes?.items ?? productsRes?.data ?? [];
      this.auctions = auctionsRes?.items ?? auctionsRes?.data ?? [];
    } catch (err) {
      this.error = err.message || t("common.error");
    } finally {
      this.loading = false;
      this.recentlyViewedHtml = buildRecentlyViewedHtml();
      this.$nextTick(() => observeAnimations());
    }
  },

  // ── Utility proxies (required for Alpine template evaluation) ──────────────
  formatPrice(n) {
    return formatPrice(n);
  },
  statusClass(s) {
    return statusClass(s);
  },
  tStatus(s) {
    return tStatus(s, "auction");
  },
  escapeHtml(s) {
    return escapeHtml(s);
  },

  timeLeft(endTime) {
    const diff = Math.max(
      0,
      Math.floor((new Date(endTime) - Date.now()) / 1000),
    );
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    return {
      timeStr: days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`,
      urgent: diff > 0 && diff <= 3600,
    };
  },
}));

// ─── Page renderer ─────────────────────────────────────────────────────────────
export default async function renderHome(container) {
  setPageMeta(t("home.title"), t("home.metaDesc"));

  // Pre-build the four skeleton columns once
  const skeletons = skeletonCard().repeat(4);

  container.innerHTML = `
    <div x-data="homePage">

      <!-- ── Hero ──────────────────────────────────────────────── -->
      <section class="hero" aria-label="${t("home.welcome")}">
        <div class="hero-content">
          <h1>${t("home.welcome")}</h1>
          <p>${t("home.subtitle")}</p>
          <div class="hero-actions">
            <a href="#/products" class="btn btn-primary btn-lg">
              <i class="fas fa-store" aria-hidden="true"></i> ${t("home.browseProducts")}
            </a>
            <a href="#/auctions" class="btn btn-outline btn-lg">
              <i class="fas fa-gavel" aria-hidden="true"></i> ${t("home.viewAuctions")}
            </a>
          </div>
        </div>
      </section>

      <!-- ── Feature highlights ────────────────────────────────── -->
      <div class="feature-grid my-5" role="list">
        <div class="feature-card animate-on-scroll stagger-1" role="listitem">
          <i class="fas fa-fish" aria-hidden="true"></i>
          <h3>${t("home.qualityGear")}</h3>
          <p>${t("home.qualityGearDesc")}</p>
        </div>
        <div class="feature-card animate-on-scroll stagger-2" role="listitem">
          <i class="fas fa-gavel" aria-hidden="true"></i>
          <h3>${t("home.liveAuctions")}</h3>
          <p>${t("home.liveAuctionsDesc")}</p>
        </div>
        <div class="feature-card animate-on-scroll stagger-3" role="listitem">
          <i class="fas fa-truck" aria-hidden="true"></i>
          <h3>${t("home.fastShipping")}</h3>
          <p>${t("home.fastShippingDesc")}</p>
        </div>
        <div class="feature-card animate-on-scroll stagger-4" role="listitem">
          <i class="fas fa-shield-alt" aria-hidden="true"></i>
          <h3>${t("home.securePayments")}</h3>
          <p>${t("home.securePaymentsDesc")}</p>
        </div>
      </div>

      <!-- ── Role quick links (authenticated sellers / admins only) ── -->
      <div x-show="roleLinks.length" class="section-header animate-on-scroll">
        <h2>
          <i class="fas fa-bolt" aria-hidden="true"></i> ${t("common.quickLinks")}
        </h2>
        <div class="d-flex gap-2 flex-wrap">
          <template x-for="link in roleLinks" :key="link.label">
            <a :href="link.href" class="btn btn-outline btn-sm">
              <i :class="'fas ' + link.icon" aria-hidden="true"></i>
              <span x-text="link.label"></span>
            </a>
          </template>
        </div>
      </div>

      <!-- ── Latest products ────────────────────────────────────── -->
      <div class="section-header animate-on-scroll">
        <h2>${t("home.latestProducts")}</h2>
        <a href="#/products" class="btn btn-outline btn-sm">${t("home.viewAll")}</a>
      </div>

      <!-- Skeleton -->
      <div x-show="loading" class="${SKELETON_ROW_CLASSES}" aria-hidden="true">
        ${skeletons}
      </div>

      <!-- Error -->
      <div x-show="!loading && error" class="empty-state">
        <div class="empty-state-visual">
          <i class="fas fa-exclamation-triangle text-muted" style="font-size:3.5rem" aria-hidden="true"></i>
        </div>
        <h3>${t("home.loadError")}</h3>
        <p x-text="error"></p>
        <button class="btn btn-primary mt-3" @click="loadData()">
          <i class="fas fa-sync-alt me-1" aria-hidden="true"></i>${t("common.retry")}
        </button>
      </div>

      <!-- Product grid -->
      <div x-show="!loading && !error && products.length"
           class="${CARD_ROW_CLASSES}">
        <template x-for="(p, i) in products" :key="p.id">
          <div class="col">
            <a :href="'#/product-detail?id=' + p.id"
               class="product-card card animate-on-scroll"
               :class="'stagger-' + Math.min(i + 1, 8)"
               :aria-label="escapeHtml(p.title || $t('common.product')) + ' — ' + formatPrice(p.price)">
              <div class="product-card-img">
                <img :src="p.primaryImageUrl || p.imageUrl || ''"
                     :alt="escapeHtml(p.title || $t('common.product'))"
                     loading="lazy">
              </div>
              <div class="product-card-body">
                <div class="product-card-title" x-text="p.title || $t('common.product')"></div>
                <div class="product-card-price" x-text="formatPrice(p.price)"></div>
                <div class="product-card-meta">
                  <span x-show="p.categoryName" class="product-card-category">
                    <i class="fas fa-tag" aria-hidden="true"></i>
                    <span x-text="p.categoryName"></span>
                  </span>
                </div>
              </div>
            </a>
          </div>
        </template>
      </div>

      <!-- No products -->
      <div x-show="!loading && !error && !products.length" class="empty-state">
        <div class="empty-state-visual">
          <i class="fas fa-box-open text-muted" style="font-size:3.5rem" aria-hidden="true"></i>
        </div>
        <h3>${t("home.noProducts")}</h3>
      </div>

      <!-- ── Active auctions ────────────────────────────────────── -->
      <div class="section-header section-header-offset animate-on-scroll">
        <h2>${t("home.activeAuctions")}</h2>
        <a href="#/auctions" class="btn btn-outline btn-sm">${t("home.viewAll")}</a>
      </div>

      <!-- Auction skeleton -->
      <div x-show="loading" class="${SKELETON_ROW_CLASSES}" aria-hidden="true">
        ${skeletons}
      </div>

      <!-- Auction grid -->
      <div x-show="!loading && !error && auctions.length"
           class="${CARD_ROW_CLASSES}">
        <template x-for="(a, i) in auctions" :key="a.id">
          <div class="col">
            <a :href="'#/auction-detail?id=' + a.id"
               class="product-card card animate-on-scroll"
               :class="'stagger-' + Math.min(i + 1, 8)"
               :aria-label="(a.productTitle || $t('auction.item')) + ' — ' + formatPrice(a.currentHighestBid || a.startingPrice)">
              <div class="product-card-img">
                <img :src="a.productImageUrl || ''"
                     :alt="a.productTitle || $t('auction.item')"
                     loading="lazy">
                <span class="product-card-badge"
                      :class="statusClass(a.status)"
                      x-text="tStatus(a.status)"></span>
              </div>
              <div class="product-card-body">
                <div class="product-card-title"
                     x-text="a.productTitle || $t('auction.item')"></div>
                <div class="current-bid"
                     x-text="formatPrice(a.currentHighestBid || a.startingPrice)"></div>
                <div class="product-card-meta">
                  <span>
                    <i class="fas fa-hourglass-half" aria-hidden="true"></i>
                    <span x-text="timeLeft(a.endTime).timeStr"></span>
                    <span x-show="timeLeft(a.endTime).urgent"
                          class="ending-soon-badge">
                      ${t("auction.endingSoon")}
                    </span>
                  </span>
                </div>
              </div>
              <div class="product-card-footer">
                <small>${t("common.start")}: <span x-text="formatPrice(a.startingPrice)"></span></small>
                <small><span x-text="a.bidCount || 0"></span> ${t("common.bids")}</small>
              </div>
            </a>
          </div>
        </template>
      </div>

      <!-- No auctions -->
      <div x-show="!loading && !error && !auctions.length" class="empty-state">
        <div class="empty-state-visual">
          <i class="fas fa-gavel text-muted" style="font-size:3.5rem" aria-hidden="true"></i>
        </div>
        <h3>${t("home.noAuctions")}</h3>
      </div>

      <!-- ── Recently viewed (built from localStorage after each load) ── -->
      <div x-show="!loading && recentlyViewedHtml"
           x-html="recentlyViewedHtml"></div>

    </div>`;
}
