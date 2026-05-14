// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================
function showToast(msg, type = 'info') {
  const existing = document.querySelector('.toast-container');
  const container = existing || (() => {
    const c = document.createElement('div');
    c.className = 'toast-container';
    c.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none';
    document.body.appendChild(c);
    return c;
  })();

  const toast = document.createElement('div');
  const colors = { success: '#16a34a', error: '#dc2626', info: '#2563eb', warning: '#d97706' };
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };

  toast.style.cssText = `
    padding: 14px 20px;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 0.88rem;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    animation: toastSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 280px;
    pointer-events: auto;
    backdrop-filter: blur(8px);
  `;
  toast.style.background = colors[type] || colors.info;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${msg}`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Inject minimal required global styles
const injectedStyles = document.createElement('style');
injectedStyles.textContent = `
  .toast-container { pointer-events: none; }
  @keyframes toastSlideIn {
    from { transform: translateX(80px) scale(0.9); opacity: 0; }
    to { transform: translateX(0) scale(1); opacity: 1; }
  }
`;
document.head.appendChild(injectedStyles);

// ============================================================
// INTERSECTION OBSERVER — Scroll Animations
// ============================================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function observeAnimations(root) {
  (root || document).querySelectorAll('.animate-on-scroll').forEach(el => {
    if (!el.classList.contains('visible')) observer.observe(el);
  });
}

// ============================================================
// NAVBAR SCROLL EFFECT
// ============================================================
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ============================================================
// NAVBAR INTERACTIVITY
// ============================================================
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('dropdownMenu');
  if (dropdown && !e.target.closest('.dropdown')) dropdown.classList.remove('show');
});

document.getElementById('userDropdown')?.addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('dropdownMenu')?.classList.toggle('show');
});

document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

// Mobile drawer overlay
const navOverlay = document.createElement('div');
navOverlay.className = 'nav-overlay';
navOverlay.id = 'navOverlay';
document.body.appendChild(navOverlay);

function openDrawer() {
  document.getElementById('navLinks')?.classList.add('open');
  navOverlay.classList.add('open');
  document.body.classList.add('nav-open');
}

function closeDrawer() {
  document.getElementById('navLinks')?.classList.remove('open');
  navOverlay.classList.remove('open');
  document.body.classList.remove('nav-open');
}

document.getElementById('hamburger')?.addEventListener('click', () => {
  const links = document.getElementById('navLinks');
  if (links?.classList.contains('open')) {
    closeDrawer();
  } else {
    openDrawer();
  }
});

navOverlay.addEventListener('click', closeDrawer);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('navLinks')?.classList.contains('open')) {
    closeDrawer();
  }
});

// Quick view delegation
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.quick-view-btn');
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

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeDrawer);
});

// Close drawer on resize to desktop
let prevWidth = window.innerWidth;
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  if (prevWidth <= 768 && width > 768) closeDrawer();
  prevWidth = width;
});

// ============================================================
// THEME TOGGLE — smooth transition
// ============================================================
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('sayiad_theme') || 'light';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('sayiad_theme', theme);
  themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  // Add transition class to all themed elements
  document.documentElement.classList.add('theme-transitioning');
  applyTheme(next);

  // Spin icon
  themeToggle.classList.add('theme-spin');
  setTimeout(() => themeToggle.classList.remove('theme-spin'), 400);

  // Remove transition lock after animation completes
  setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 450);
});

// ============================================================
// LANGUAGE TOGGLE — with page fade
// ============================================================
const langToggle = document.getElementById('langToggle');
const initialLang = getCurrentLang();

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  langToggle.textContent = lang === 'ar' ? 'AR' : 'EN';
}

function handleLangChange(next) {
  const app = document.getElementById('app');
  app.style.transition = 'opacity 0.12s ease';
  app.style.opacity = '0';

  setTimeout(() => {
    setLanguage(next);
    applyLanguage(next);
    // Let router handle the full render + fade-in
    router();
    setTimeout(() => {
      app.style.transition = '';
      app.style.opacity = '';
    }, 300);
  }, 130);
}

applyLanguage(initialLang);

langToggle.addEventListener('click', () => {
  const current = getCurrentLang();
  handleLangChange(current === 'en' ? 'ar' : 'en');
});

// ============================================================
// RIPPLE EFFECT
// ============================================================
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn:not(.btn-ghost):not(.btn-icon)');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const ripple = document.createElement('span');
  ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${x}px;top:${y}px;border-radius:50%;background:rgba(255,255,255,0.35);transform:scale(0);animation:ripple 0.5s ease-out forwards;pointer-events:none`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
});

// ============================================================
// FOCUS VISIBLE — only show focus ring on keyboard nav
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

// ============================================================
// CART BADGE
// ============================================================
async function updateCartBadge() {
  if (!isAuthenticated()) {
    const badge = document.getElementById('cartBadge');
    if (badge) { badge.textContent = '0'; badge.classList.add('hidden'); }
    return;
  }
  try {
    const cart = await api.get('/cart');
    const items = cart.items || cart.cartItems || [];
    const count = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    }
  } catch {
    // silent
  }
}

// ============================================================
// SERVICE WORKER
// ============================================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ============================================================
// INIT
// ============================================================
updateNavbar();
updateStaticText();
