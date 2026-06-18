import { t } from '../shared/utils/i18n.js';
import { getUser, isAuthenticated, getRoleFromToken } from '../shared/utils/auth-state.js';
import { ROLES, SELLER_ROLES } from '../shared/constants/roles.js';
import { openDrawer, closeDrawer, syncDrawerA11y } from '../widgets/layout/navbar.js';
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
  const bnAccount = document.getElementById('bnAccount');
  const bnLogin = document.getElementById('bnLogin');
  if (bnAccount) bnAccount.classList.toggle('d-none', !auth);
  if (bnLogin) bnLogin.classList.toggle('d-none', auth);
  document.querySelectorAll(".nav-seller").forEach(el => el.classList.toggle("hidden", !user || !SELLER_ROLES.includes(user.role)));
  document.querySelectorAll(".nav-admin").forEach(el => el.classList.toggle("hidden", user?.role !== ROLES.ADMIN));
  document.querySelectorAll(".nav-auctioneer").forEach(el => el.classList.toggle("hidden", user?.role !== ROLES.AUCTIONEER));

  const footerSellLink = document.getElementById('footerSellLink');
  if (footerSellLink) {
    footerSellLink.href = user && SELLER_ROLES.includes(user.role)
      ? '#/dashboard' : '#/register';
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

function setUserDropdownOpen(open, { restoreFocus = false } = {}) {
  const dropdown = document.getElementById('dropdownMenu');
  const trigger = document.getElementById('userDropdown');
  if (!dropdown || !trigger) return;

  dropdown.classList.toggle('show', open);
  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (!open && restoreFocus) trigger.focus();
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
  if (dropdown && !e.target.closest('.dropdown')) setUserDropdownOpen(false);
});

document.addEventListener('keydown', (e) => {
  const drawer = document.getElementById('navDrawer');
  const dropdown = document.getElementById('dropdownMenu');
  const isDropdownOpen = dropdown?.classList.contains('show');

  if (e.key === 'Escape') {
    if (drawer?.classList.contains('open')) closeDrawer();
    if (isDropdownOpen) {
      setUserDropdownOpen(false, { restoreFocus: true });
    }
    return;
  }

  if (isDropdownOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp'
      || e.key === 'Home' || e.key === 'End')) {
    e.preventDefault();
    const items = [...dropdown.querySelectorAll(
      '.dropdown-item:not([hidden]):not(.hidden):not(.d-none)'
    )];
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') items[(idx + 1) % items.length]?.focus();
    else if (e.key === 'ArrowUp') items[(idx - 1 + items.length) % items.length]?.focus();
    else if (e.key === 'Home') items[0]?.focus();
    else if (e.key === 'End') items[items.length - 1]?.focus();
  }
});

document.getElementById('userDropdown')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const menu = document.getElementById('dropdownMenu');
  setUserDropdownOpen(!menu?.classList.contains('show'));
});

const userMenuEl = document.getElementById('userMenu');
const canHoverDropdown = window.matchMedia('(width >= 1200px) and (hover: hover) and (pointer: fine)');
userMenuEl?.addEventListener('mouseenter', () => {
  if (canHoverDropdown.matches) setUserDropdownOpen(true);
});
userMenuEl?.addEventListener('mouseleave', () => {
  if (canHoverDropdown.matches) setUserDropdownOpen(false);
});

document.getElementById('dropdownMenu')?.addEventListener('click', (e) => {
  if (e.target.closest('a[href]')) setUserDropdownOpen(false);
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

document.getElementById('navDrawer')?.addEventListener('click', (e) => {
  if (!document.getElementById('navDrawer')?.classList.contains('open')) return;
  const actionLink = e.target.closest('a[href]');
  if (!actionLink) return;
  closeDrawer({ restoreTriggerFocus: false });
});

let prevWidth = window.innerWidth;
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  if (prevWidth < 1200 && width >= 1200) {
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
  if (prevWidth >= 1200 && width < 1200) {
    syncDrawerA11y();
  }
  prevWidth = width;
}, { passive: true });
