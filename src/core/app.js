import { setLanguage, getCurrentLang, t } from './i18n/index.js';
import { showToast, showConfirm, openQuickView } from './utils/ui.js';
import { animate } from './utils/dom.js';
import { api } from './api/client.js';
import { getUser, logout, requireAuth } from './auth/index.js';
import { router, goBack } from './router/index.js';
import { createSwipeGesture } from './utils/swipe.js';
import { setupGlobalErrorHandlers } from '../shared/helpers/errors.js';

// Inject minimal required global styles
const injectedStyles = document.createElement("style");
injectedStyles.textContent = `
  .empty-state-visual {
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: inline-block;
    will-change: transform;
  }
  .empty-state:hover .empty-state-visual {
    transform: scale(1.1);
  }
  .empty-state-visual svg, .empty-state-visual i, .empty-state-visual img {
    filter: drop-shadow(0 0 0 transparent);
    transition: filter 0.4s ease;
  }
  .empty-state:hover .empty-state-visual svg, .empty-state:hover .empty-state-visual i, .empty-state:hover .empty-state-visual img {
    filter: drop-shadow(0 15px 30px var(--primary-shadow, rgba(14, 165, 233, 0.3)));
  }
`;
document.head.appendChild(injectedStyles);

// Navbar scroll effect
let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      const navbar = document.querySelector(".navbar");
      if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 20);
      const btt = document.getElementById("backToTop");
      if (btt) btt.classList.toggle("visible", window.scrollY > 400);
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

document.addEventListener("click", (e) => {
  if (e.target.closest("#backToTop")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// Navbar dropdown
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("dropdownMenu");
  if (dropdown && !e.target.closest(".dropdown"))
    dropdown.classList.remove("show");
});

document.getElementById("userDropdown")?.addEventListener("click", (e) => {
  e.stopPropagation();
  const menu = document.getElementById("dropdownMenu");
  const isOpen = menu?.classList.toggle("show");
  e.currentTarget.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const ok = await showConfirm(t("auth.logoutTitle"), t("auth.logoutConfirm"), {
    type: "danger",
    confirmText: t("nav.logout"),
  });
  if (ok) logout();
});

// Mobile drawer
const navOverlay = document.getElementById("navOverlay");

function openDrawer() {
  const drawer = document.getElementById("navDrawer");
  const overlay = navOverlay;
  if (!drawer) return;
  drawer.offsetHeight;
  drawer.classList.add("open");
  overlay?.classList.add("open");
  document.body.classList.add("nav-open");

  const btn = document.getElementById("hamburger");
  if (btn) {
    btn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
    btn.setAttribute("aria-expanded", "true");
  }

  const firstFocusable = drawer.querySelector(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  firstFocusable?.focus();
}

function closeDrawer() {
  document.getElementById("navDrawer")?.classList.remove("open");
  navOverlay?.classList.remove("open");
  document.body.classList.remove("nav-open");

  const btn = document.getElementById("hamburger");
  if (btn) {
    btn.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
    btn.setAttribute("aria-expanded", "false");
  }
  btn?.focus();
}


document.getElementById("hamburger")?.addEventListener("click", () => {
  const drawer = document.getElementById("navDrawer");
  if (drawer?.classList.contains("open")) {
    closeDrawer();
  } else {
    openDrawer();
  }
});

navOverlay?.addEventListener("click", closeDrawer);
navOverlay?.addEventListener("touchend", (e) => {
  e.preventDefault();
  closeDrawer();
}, { passive: false });
navOverlay?.addEventListener("touchstart", (e) => {
  if (e.target === navOverlay) closeDrawer();
}, { passive: true });

// Inject nav icons into drawer links
(function injectNavIcons() {
  const iconMap = {
    "#/": "fa-home",
    "#/products": "fa-store",
    "#/auctions": "fa-gavel",
    "#/cart": "fa-shopping-cart",
    "#/dashboard": "fa-tachometer-alt",
    "#/profile": "fa-user",
    "#/shipping": "fa-map-marker-alt",
    "#/admin": "fa-shield-alt",
  };
  document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    const iconClass = iconMap[href];
    if (iconClass && !link.querySelector(".nav-icon")) {
      const icon = document.createElement("i");
      icon.className = `fas ${iconClass} nav-icon`;
      icon.setAttribute("aria-hidden", "true");
      link.insertBefore(icon, link.firstChild);
    }
  });
})();

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    document.getElementById("navDrawer")?.classList.contains("open")
  ) {
    closeDrawer();
  }
});

// Quick add to cart delegation
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".quick-add-btn");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  if (!(await requireAuth())) return;
  const productId = parseInt(btn.dataset.quickAdd);
  try {
    await api.post("/cart/items", { productId, quantity: 1 });
    showToast(t("product.addedToCart"), "success");
    document.dispatchEvent(new CustomEvent("cart-updated"));
  } catch (err) {
    showToast(err.message, "error");
  }
});

// Quick view delegation
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".quick-view-btn");
  if (!btn) return;
  e.preventDefault();
  const product = {
    id: btn.dataset.quickviewId,
    title: btn.dataset.quickviewTitle,
    price: parseFloat(btn.dataset.quickviewPrice) || 0,
    primaryImageUrl: btn.dataset.quickviewImage || undefined,
    description: btn.dataset.quickviewDesc || undefined,
  };
  openQuickView(product);
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", closeDrawer);
});

let prevWidth = window.innerWidth;
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  if (prevWidth <= 768 && width > 768) closeDrawer();
  prevWidth = width;
});

// Theme toggle
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("sayiad_theme") || "light";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("sayiad_theme", theme);
  themeToggle.innerHTML =
    theme === "dark"
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
}

// Reduced motion toggle
(function initMotionToggle() {
  const saved = localStorage.getItem("sayiad_reduced_motion");
  if (saved === "true") {
    document.documentElement.classList.add("reduce-motion");
  }
  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn && !document.getElementById("motionToggle")) {
    const btn = document.createElement("button");
    btn.id = "motionToggle";
    btn.className = "toggle-btn";
    btn.title = "Toggle animations";
    btn.setAttribute("aria-label", "Toggle reduced motion");
    btn.setAttribute("aria-pressed", saved === "true" ? "true" : "false");
    btn.innerHTML = saved === "true"
      ? '<i class="fas fa-pause-circle"></i>'
      : '<i class="fas fa-play-circle"></i>';
    themeBtn.parentNode.insertBefore(btn, themeBtn.nextSibling);
    btn.addEventListener("click", () => {
      const next = !document.documentElement.classList.toggle("reduce-motion");
      localStorage.setItem("sayiad_reduced_motion", next);
      btn.setAttribute("aria-pressed", next ? "true" : "false");
      btn.innerHTML = next
        ? '<i class="fas fa-pause-circle"></i>'
        : '<i class="fas fa-play-circle"></i>';
    });
  }
})();

function initHeroTilt() {
  const hero = document.querySelector(".hero");
  const content = document.querySelector(".hero-content");
  if (!hero || !content) return;

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;

    content.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
  });

  hero.addEventListener("mouseleave", () => {
    content.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0)`;
  });
}

function syncUserRoleAttribute() {
  const user = getUser();
  if (user && user.role) {
    document.documentElement.setAttribute("data-user-role", user.role);
  } else {
    document.documentElement.removeAttribute("data-user-role");
  }
}

applyTheme(savedTheme);
syncUserRoleAttribute();
initHeroTilt();

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";

  document.documentElement.classList.add("theme-transitioning");
  applyTheme(next);

  themeToggle.classList.add("theme-spin");
  setTimeout(() => themeToggle.classList.remove("theme-spin"), 400);

  setTimeout(
    () => document.documentElement.classList.remove("theme-transitioning"),
    450,
  );
});

// Language toggle
const langToggle = document.getElementById("langToggle");
const initialLang = getCurrentLang();

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  langToggle.textContent = lang === "ar" ? "AR" : "EN";
  langToggle.setAttribute("aria-pressed", lang === "ar" ? "true" : "false");
}

function handleLangChange(next) {
  const app = document.getElementById("app");
  app.style.transition = "opacity 0.12s ease";
  app.style.opacity = "0";

  setTimeout(() => {
    setLanguage(next);
    applyLanguage(next);
    router(true);
    setTimeout(() => {
      app.style.transition = "";
      app.style.opacity = "";
    }, 300);
  }, 130);
}

applyLanguage(initialLang);

langToggle.addEventListener("click", () => {
  const current = getCurrentLang();
  handleLangChange(current === "en" ? "ar" : "en");
});

// Ripple effect
document.addEventListener("click", (e) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const btn = e.target.closest(".btn:not(.btn-ghost):not(.btn-icon)");
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const ripple = document.createElement("span");
  ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${x}px;top:${y}px;border-radius:50%;background:rgba(255,255,255,0.18);transform:scale(0);animation:ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;pointer-events:none`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// Focus visible
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") document.body.classList.add("keyboard-nav");
});
document.addEventListener("mousedown", () => {
  document.body.classList.remove("keyboard-nav");
});

// Swipe-back navigation (mobile edge swipe)
(function initSwipeBack() {
  if (!('ontouchstart' in window)) return;

  let indicator = null;
  let removeTimer = null;

  function showIndicator(progress) {
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'swipeBackIndicator';
      indicator.setAttribute('role', 'status');
      indicator.setAttribute('aria-live', 'polite');
      indicator.innerHTML = `<i class="fas fa-arrow-left" aria-hidden="true"></i><span>${  t('common.back') || 'Back'  }</span>`;
      document.body.appendChild(indicator);
    }
    const clampedProgress = Math.min(progress, 1);
    indicator.style.opacity = clampedProgress;
    const translate = Math.min(progress * 40, 30);
    indicator.style.transform = `translateX(${translate}px)`;
  }

  function hideIndicator() {
    if (indicator) {
      indicator.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateX(0)';
      clearTimeout(removeTimer);
      removeTimer = setTimeout(() => {
        if (indicator) { indicator.remove(); indicator = null; }
      }, 200);
    }
  }

  const edgeSwipe = createSwipeGesture({
    el: document.documentElement,
    edgeOnly: true,
    edgeWidth: 35,
    threshold: 10,
    onSwipeMove({ distance }) {
      const isRtl = document.dir === 'rtl';
      // Right swipe in LTR, left swipe in RTL
      const valid = isRtl ? distance < 0 : distance > 0;
      if (!valid) { hideIndicator(); return; }
      const absDist = Math.abs(distance);
      showIndicator(absDist / 100);
    },
    onSwipeEnd({ distance }) {
      hideIndicator();
      const isRtl = document.dir === 'rtl';
      const valid = isRtl ? distance < 0 : distance > 0;
      if (!valid) return;
      if (Math.abs(distance) >= 80) {
        goBack();
      }
    },
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    edgeSwipe.destroy();
    if (indicator) { indicator.remove(); indicator = null; }
  });
})();

setupGlobalErrorHandlers();

// Offline detection banner
(function initOfflineBanner() {
  let banner = null;

  function createBanner(online) {
    const el = document.createElement('div');
    el.setAttribute('role', 'alert');
    if (online) {
      el.id = 'onlineBanner';
      el.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:100000',
        'background:var(--success,#16a34a)', 'color:#fff',
        'text-align:center', 'padding:10px 16px',        'font-size:0.875rem', 'font-weight:600',
        'display:flex', 'align-items:center', 'justify-content:center', 'gap:8px',
      ].join(';');
      el.innerHTML = `<i class="fas fa-wifi"></i> ${t('common.backOnline') || 'Back online!'}`;
      setTimeout(() => {
        el.addEventListener('animationend', () => el.remove(), { once: true });
        animate(el, 'slideOutUp', { duration: '0.3s' });
      }, 2500);
      return el;
    }
    el.id = 'offlineBanner';
    el.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:100000',
      'background:var(--danger,#dc2626)', 'color:#fff',
      'text-align:center', 'padding:10px 16px',
      'font-size:0.875rem', 'font-weight:500',
        'display:flex', 'align-items:center', 'justify-content:center', 'gap:8px',
      ].join(';');
    const close = document.createElement('button');
    close.innerHTML = '&times;';
    close.setAttribute('aria-label', 'Dismiss');
    close.style.cssText = 'background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;padding:0 4px;line-height:1;opacity:0.8;margin-left:auto';
    close.addEventListener('click', () => { el.remove(); banner = null; });
    el.innerHTML = `<i class="fas fa-plug"></i> <span>${t('common.offline') || 'You are offline. Some features may be unavailable.'}</span>`;
    el.appendChild(close);
    return el;
  }

  function showOffline() {
    if (document.getElementById('offlineBanner')) return;
    if (document.getElementById('onlineBanner')) document.getElementById('onlineBanner').remove();
    banner = createBanner(false);
    document.body.prepend(banner);
    animate(banner, 'slideInDown', { duration: '0.3s' });
  }

  function showOnline() {
    if (document.getElementById('offlineBanner')) document.getElementById('offlineBanner').remove();
    banner = null;
    if (document.getElementById('onlineBanner')) return;
    const el = createBanner(true);
    document.body.prepend(el);
    animate(el, 'slideInDown', { duration: '0.3s' });
  }

  window.addEventListener('offline', showOffline);
  window.addEventListener('online', showOnline);

  if (!navigator.onLine) showOffline();
})();

// Onboarding tour
(function showOnboarding() {
  if (localStorage.getItem("sayiad_tour_done")) return;
  const steps = [
    { title: t("home.welcome"), desc: t("tour.welcome"), icon: "fa-fish" },
    { title: t("nav.products"), desc: t("tour.products"), icon: "fa-store" },
    { title: t("nav.auctions"), desc: t("tour.auctions"), icon: "fa-gavel" },
  ];
  let step = 0;
  const overlay = document.createElement("div");
  overlay.className = "tour-overlay";
  overlay.innerHTML = `
    <div class="tour-card">
      <div class="tour-icon"><i class="fas ${steps[0].icon}"></i></div>
      <h3 class="tour-title">${steps[0].title}</h3>
      <p class="tour-desc">${steps[0].desc}</p>
      <div class="tour-dots">${steps.map((_, i) => `<span class="tour-dot${i === 0 ? " active" : ""}"></span>`).join("")}</div>
      <div class="tour-actions">
        <button class="btn btn-ghost btn-sm tour-skip">${t("common.cancel")}</button>
        <button class="btn btn-primary btn-sm tour-next">${t("common.next")}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector(".tour-next").addEventListener("click", () => {
    step++;
    if (step >= steps.length) {
      localStorage.setItem("sayiad_tour_done", "1");
      overlay.remove();
      return;
    }
    overlay.querySelector(".tour-icon i").className = `fas ${steps[step].icon}`;
    overlay.querySelector(".tour-title").textContent = steps[step].title;
    overlay.querySelector(".tour-desc").textContent = steps[step].desc;
    overlay.querySelectorAll(".tour-dot").forEach((d, i) => d.classList.toggle("active", i === step));
    overlay.querySelector(".tour-next").textContent = step === steps.length - 1 ? t("common.start") : t("common.next");
  });
  overlay.querySelector(".tour-skip").addEventListener("click", () => {
    localStorage.setItem("sayiad_tour_done", "1");
    overlay.remove();
  });
})();

// Service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      if (registration.waiting) {
        showUpdateBanner(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            showUpdateBanner(newWorker);
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      setInterval(() => registration.update(), 3600000);
    })
    .catch(() => {});
}

function showUpdateBanner(worker) {
  if (document.getElementById("swUpdateBanner")) return;

  const banner = document.createElement("div");
  banner.id = "swUpdateBanner";
  banner.setAttribute("role", "status");
  banner.setAttribute("aria-live", "polite");
  banner.style.cssText = [
    "position:fixed",
    "bottom:16px",
    "left:50%",
    "transform:translateX(-50%)",
    "z-index:99999",
    "background:var(--card-bg, #fff)",
    "color:var(--text, #1a1a1a)",
    "border:1px solid var(--border, #e0e0e0)",
    "border-radius:var(--radius-lg, 12px)",
    "padding:12px 20px",
    "display:flex",
    "align-items:center",
    "gap:14px",
    "box-shadow:0 8px 32px rgba(0,0,0,0.18)",
    "max-width:420px",
    "width:calc(100vw - 32px)",
    "font-size:14px",
  ].join(";");

  banner.innerHTML = `
    <i class="fas fa-arrow-up-circle text-primary flex-shrink-0 fs-5"></i>
    <span class="flex-fill fw-medium">
      A new version is available.
    </span>
    <button id="swUpdateBtn"
      class="border-0 text-white fw-semibold text-nowrap"
      style="background:var(--primary,#1D6ECC);border-radius:var(--radius-md,8px);padding:7px 16px;
             font-size:13px;cursor:pointer;font-family:inherit">
      Refresh
    </button>
    <button id="swDismissBtn" aria-label="Dismiss"
      class="border-0"
      style="background:transparent;cursor:pointer;
             color:var(--text-secondary,#888);font-size:18px;line-height:1;
             padding:0 2px">
      ×
    </button>
  `;

  document.body.appendChild(banner);
  animate(banner, 'slideInUp', { duration: '0.35s' });

  document.getElementById("swUpdateBtn").addEventListener("click", () => {
    banner.remove();
    worker.postMessage("SKIP_WAITING");
  });

  document.getElementById("swDismissBtn").addEventListener("click", () => {
    banner.addEventListener('animationend', () => banner.remove(), { once: true });
    animate(banner, 'fadeOut', { duration: '0.2s' });
  });
}
