import { t } from '../shared/utils/i18n.js';
import { getUser, isAuthenticated, getRoleFromToken } from '../shared/utils/auth-state.js';
import { ROLES, SELLER_ROLES } from '../shared/constants/roles.js';
import { openDrawer, closeDrawer } from '../widgets/layout/navbar.js';
import { showConfirm } from '../widgets/ui/modal.js';
import { logout } from '../features/auth/login.js';

export function updateNavbar() {
  const auth = isAuthenticated();
  const user = getUser();
  document.querySelectorAll(".nav-guest").forEach(el => el.classList.toggle("hidden", auth));
  document.querySelectorAll(".nav-auth").forEach(el => el.classList.toggle("hidden", !auth));
  const userNameEl = document.getElementById("userName");
  if (userNameEl) {
    userNameEl.textContent = user?.fullName || user?.name || user?.email || t('nav.profile');
  }
  const userMenu = document.getElementById("userMenu");
  if (userMenu) userMenu.classList.toggle("d-none", !auth);
  const userRole = document.getElementById("userRole");
  if (userRole) userRole.textContent = user?.role || '';
  const avatarImg = document.getElementById("userAvatar");
  if (avatarImg) {
    if (user?.profileImageUrl) { avatarImg.src = user.profileImageUrl; avatarImg.hidden = false; }
    else avatarImg.hidden = true;
  }
  document.querySelectorAll(".nav-seller").forEach(el => el.classList.toggle("hidden", !user || !SELLER_ROLES.includes(user.role)));
  document.querySelectorAll(".nav-admin").forEach(el => el.classList.toggle("hidden", user?.role !== ROLES.ADMIN));
  document.querySelectorAll(".nav-auctioneer").forEach(el => el.classList.toggle("hidden", user?.role !== ROLES.AUCTIONEER));

  const sellLink = document.getElementById("sellLink");
  if (sellLink) {
    sellLink.href = user && SELLER_ROLES.includes(user.role) ? '#/dashboard' : '#/register';
  }

  applyDropdownRoleVisibility();
}

function applyDropdownRoleVisibility() {
  const role = getRoleFromToken();
  const auth = isAuthenticated();
  document.querySelectorAll('[data-roles]').forEach(el => {
    const roles = el.getAttribute('data-roles');
    if (roles === 'all') {
      el.classList.toggle('hidden', !auth);
    } else {
      const list = roles.split(',').map(r => r.trim());
      el.classList.toggle('hidden', !role || !list.includes(role));
    }
  });
}

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      const navbar = document.querySelector('.navbar');
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
      const btt = document.getElementById('backToTop');
      if (btt) {
        const show = window.scrollY > 400;
        if (show) requestAnimationFrame(() => btt.classList.add('visible'));
        else { btt.classList.remove('visible'); }
      }
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

document.addEventListener('click', (e) => {
  if (e.target.closest('#backToTop')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('dropdownMenu');
  if (dropdown && !e.target.closest('.dropdown'))
    dropdown.classList.remove('show');
});

document.getElementById('userDropdown')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const menu = document.getElementById('dropdownMenu');
  const isOpen = menu?.classList.toggle('show');
  e.currentTarget.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    const ok = await showConfirm(t('auth.logoutTitle'), t('auth.logoutConfirm'), {
      type: 'danger',
      confirmText: t('nav.logout'),
    });
    if (ok) logout();
  } catch { /* user stays logged in */ }
});

document.getElementById('hamburger')?.addEventListener('click', () => {
  const drawer = document.getElementById('navDrawer');
  if (drawer?.classList.contains('open')) {
    closeDrawer();
  } else {
    openDrawer();
  }
});

document.getElementById('drawerCloseBtn')?.addEventListener('click', closeDrawer);

const _navOverlay = document.getElementById('navOverlay');
_navOverlay?.addEventListener('click', closeDrawer);
_navOverlay?.addEventListener('touchstart', (e) => {
  if (e.target === _navOverlay) closeDrawer();
}, { passive: true });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('navDrawer')?.classList.contains('open')) {
    closeDrawer();
  }
});

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', closeDrawer);
});

let prevWidth = window.innerWidth;
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  if (prevWidth <= 768 && width > 768) {
    const drawer = document.getElementById('navDrawer');
    if (drawer) {
      drawer.style.transition = 'none';
      drawer.offsetHeight;
      closeDrawer();
      requestAnimationFrame(() => {
        drawer.style.transition = '';
      });
    }
  }
  prevWidth = width;
}, { passive: true });
