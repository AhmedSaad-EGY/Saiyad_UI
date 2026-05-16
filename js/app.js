// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================
function showToast(msg, type = "info") {
  const existing = document.querySelector(".toast-container");
    const container =
    existing ||
    (() => {
      const c = document.createElement("div");
      c.className = "toast-container";
      const isRtl = document.documentElement.dir === "rtl";
      c.style.cssText =
        `position:fixed;bottom:20px;${isRtl ? "left" : "right"}:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none`;
      document.body.appendChild(c);
      return c;
    })();

  const toast = document.createElement("div");
  const colors = {
    success: "#059669",
    error: "#e11d48",
    info: "#0ea5e9",
    warning: "#f59e0b",
  };
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    info: "fa-info-circle",
    warning: "fa-exclamation-triangle",
  };

  toast.style.cssText = `
    padding: 16px 24px;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    box-shadow: 0 12px 32px -8px rgba(0,0,0,0.3);
    animation: toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
    pointer-events: auto;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
  `;
  toast.style.background = colors[type] || colors.info;
  const iconEl = document.createElement('i');
  iconEl.className = `fas ${icons[type] || icons.info}`;
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.style.cssText = 'font-size:1.1rem;flex-shrink:0';
  const textEl = document.createElement('span');
  textEl.textContent = msg;
  toast.appendChild(iconEl);
  toast.appendChild(textEl);

  container.appendChild(toast);
  const live = document.getElementById("ariaLive");
  if (live) live.textContent = msg;
  setTimeout(() => {
    toast.style.transition = "all 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(30px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Inject minimal required global styles
const injectedStyles = document.createElement("style");
injectedStyles.textContent = `
  .toast-container { pointer-events: none; }
  @keyframes toastSlideIn {
    from { transform: translateX(80px) scale(0.9); opacity: 0; }
    to { transform: translateX(0) scale(1); opacity: 1; }
  }
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
  .navbar {
    transition: background-color 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease !important;
  }
  .navbar.scrolled {
    background-color: var(--nav-bg) !important;
    backdrop-filter: blur(24px) saturate(1.8) !important;
    -webkit-backdrop-filter: blur(24px) saturate(1.8) !important;
    box-shadow: 0 10px 30px -10px oklch(0 0 0 / 0.12) !important;
    border-bottom-color: oklch(1 0 0 / 0.1) !important;
  }
  @media (max-width: 480px) {
    .toast-container {
      right: 12px !important;
      left: 12px !important;
      bottom: 12px !important;
    }
    .toast-container > div {
      min-width: 0 !important;
      width: 100% !important;
    }
  }
`;
document.head.appendChild(injectedStyles);

// ============================================================
// INTERSECTION OBSERVER — Scroll Animations
// ============================================================
function observeAnimations(root = document) {
  const els = (root === document ? document : root)
    .querySelectorAll('.animate-on-scroll:not(.visible)');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => observer.observe(el));
  } else {
    els.forEach((el) => el.classList.add('visible'));
  }
}

// ============================================================
// NAVBAR SCROLL EFFECT
// ============================================================
window.addEventListener(
  "scroll",
  () => {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 20);
    const btt = document.getElementById("backToTop");
    if (btt) btt.classList.toggle("visible", window.scrollY > 400);
  },
  { passive: true },
);

document.addEventListener("click", (e) => {
  if (e.target.closest("#backToTop")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// ============================================================
// NAVBAR INTERACTIVITY
// ============================================================
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("dropdownMenu");
  if (dropdown && !e.target.closest(".dropdown"))
    dropdown.classList.remove("show");
});

document.getElementById("userDropdown")?.addEventListener("click", (e) => {
  e.stopPropagation();
  document.getElementById("dropdownMenu")?.classList.toggle("show");
});

document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

// Mobile drawer overlay
const navOverlay = document.getElementById("navOverlay");

function openDrawer() {
  document.getElementById("navDrawer")?.classList.add("open");
  navOverlay?.classList.add("open");
  document.body.classList.add("nav-open");
}

function closeDrawer() {
  document.getElementById("navDrawer")?.classList.remove("open");
  navOverlay?.classList.remove("open");
  document.body.classList.remove("nav-open");
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

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    document.getElementById("navDrawer")?.classList.contains("open")
  ) {
    closeDrawer();
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

// Close drawer on resize to desktop
let prevWidth = window.innerWidth;
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  if (prevWidth <= 768 && width > 768) closeDrawer();
  prevWidth = width;
});

// ============================================================
// THEME TOGGLE — smooth transition
// ============================================================
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("sayiad_theme") || "light";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("sayiad_theme", theme);
  themeToggle.innerHTML =
    theme === "dark"
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
}

applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";

  // Add transition class to all themed elements
  document.documentElement.classList.add("theme-transitioning");
  applyTheme(next);

  // Spin icon
  themeToggle.classList.add("theme-spin");
  setTimeout(() => themeToggle.classList.remove("theme-spin"), 400);

  // Remove transition lock after animation completes
  setTimeout(
    () => document.documentElement.classList.remove("theme-transitioning"),
    450,
  );
});

// ============================================================
// LANGUAGE TOGGLE — with page fade
// ============================================================
const langToggle = document.getElementById("langToggle");
const initialLang = getCurrentLang();

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  langToggle.textContent = lang === "ar" ? "AR" : "EN";
}

function handleLangChange(next) {
  const app = document.getElementById("app");
  app.style.transition = "opacity 0.12s ease";
  app.style.opacity = "0";

  setTimeout(() => {
    setLanguage(next);
    applyLanguage(next);
    // Let router handle the full render + fade-in
    router();
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

// ============================================================
// RIPPLE EFFECT
// ============================================================
document.addEventListener("click", (e) => {
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

// ============================================================
// FOCUS VISIBLE — only show focus ring on keyboard nav
// ============================================================
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") document.body.classList.add("keyboard-nav");
});
document.addEventListener("mousedown", () => {
  document.body.classList.remove("keyboard-nav");
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
window.addEventListener("unhandledrejection", (e) => {
  if (e.reason?.message?.includes("Network error") || e.reason?.message?.includes("Session expired")) return;
  console.warn("Unhandled Promise Rejection:", e.reason);
});
window.addEventListener("error", (e) => {
  if (e.message?.includes("ResizeObserver")) { e.preventDefault(); return; }
  console.warn("Global Error:", e.message);
});

// ============================================================
// SERVICE WORKER
// ============================================================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

// ============================================================
// INIT
// ============================================================
updateNavbar();
updateStaticText();
