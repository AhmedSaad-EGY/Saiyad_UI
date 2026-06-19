import { t } from '../shared/utils/i18n.js';
import { getUser, isAuthenticated, getRoleFromToken } from '../shared/utils/auth-state.js';
import { ROLES, SELLER_ROLES } from '../shared/constants/roles.js';
import {
  NAV_DRAWER_BREAKPOINT,
  openDrawer,
  closeDrawer,
  syncDrawerA11y,
} from '../widgets/layout/navbar.js';
import { showConfirm } from '../widgets/ui/modal.js';
import { logout } from '../features/auth/login.js';

function setNavVisibility(element, visible) {
  element.classList.toggle('hidden', !visible);
  element.classList.toggle('d-none', !visible);
}

export function updateNavbar() {
  const auth = isAuthenticated();
  const user = getUser();
  document.querySelectorAll('.nav-guest').forEach((element) => setNavVisibility(element, !auth));
  document.querySelectorAll('.nav-auth').forEach((element) => setNavVisibility(element, auth));
  document.querySelectorAll('[data-user-name]').forEach((element) => {
    element.textContent = user?.fullName || user?.name || user?.email || t('nav.profile');
  });

  const bnAccount = document.getElementById('bnAccount');
  const bnLogin = document.getElementById('bnLogin');
  if (bnAccount) bnAccount.classList.toggle('d-none', !auth);
  if (bnLogin) bnLogin.classList.toggle('d-none', auth);

  document.querySelectorAll('.nav-seller').forEach((element) => {
    element.classList.toggle('hidden', !user || !SELLER_ROLES.includes(user.role));
  });
  document.querySelectorAll('.nav-admin').forEach((element) => {
    element.classList.toggle('hidden', user?.role !== ROLES.ADMIN);
  });
  document.querySelectorAll('.nav-auctioneer').forEach((element) => {
    element.classList.toggle('hidden', user?.role !== ROLES.AUCTIONEER);
  });

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
  document.querySelectorAll('[data-roles]').forEach((element) => {
    const roles = element.getAttribute('data-roles');
    if (roles === 'all') {
      element.classList.toggle('hidden', !auth);
      return;
    }
    const list = roles.split(',').map((item) => item.trim());
    element.classList.toggle('hidden', !role || !list.includes(role));
  });
}

function setUserDropdownOpen(open, { restoreFocus = false } = {}) {
  const dropdown = document.querySelector('[data-user-dropdown-menu]');
  const trigger = document.querySelector('[data-user-dropdown]');
  if (!dropdown || !trigger) return;

  dropdown.classList.toggle('show', open);
  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (!open && restoreFocus) trigger.focus();
}

function setCompactSearchOpen(open, { restoreFocus = false } = {}) {
  const trigger = document.querySelector('[data-compact-search-toggle]');
  const popover = document.querySelector('[data-compact-search-popover]');
  if (!trigger || !popover) return;

  popover.hidden = !open;
  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) {
    requestAnimationFrame(() => popover.querySelector('[data-nav-search-input]')?.focus());
  } else if (restoreFocus) {
    trigger.focus();
  }
}

let userDropdownCloseTimer;

function clearUserDropdownCloseTimer() {
  if (!userDropdownCloseTimer) return;
  window.clearTimeout(userDropdownCloseTimer);
  userDropdownCloseTimer = null;
}

function scheduleUserDropdownClose() {
  clearUserDropdownCloseTimer();
  userDropdownCloseTimer = window.setTimeout(() => {
    setUserDropdownOpen(false);
    userDropdownCloseTimer = null;
  }, 180);
}

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  window.requestAnimationFrame(() => {
    document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 20);
    const btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 400);
    scrollTicking = false;
  });
  scrollTicking = true;
}, { passive: true });

document.addEventListener('click', (event) => {
  if (event.target.closest('#backToTop')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!event.target.closest('[data-user-menu]')) setUserDropdownOpen(false);
  if (!event.target.closest('.nav-search-compact')) setCompactSearchOpen(false);
});

document.addEventListener('keydown', (event) => {
  const drawer = document.getElementById('navDrawer');
  const dropdown = document.querySelector('[data-user-dropdown-menu]');
  const compactSearch = document.querySelector('[data-compact-search-popover]');
  const isDropdownOpen = dropdown?.classList.contains('show');
  const isCompactSearchOpen = compactSearch && !compactSearch.hidden;

  if (event.key === 'Escape') {
    if (drawer?.classList.contains('open')) closeDrawer();
    if (isDropdownOpen) setUserDropdownOpen(false, { restoreFocus: true });
    if (isCompactSearchOpen) setCompactSearchOpen(false, { restoreFocus: true });
    return;
  }

  if (isDropdownOpen && (
    event.key === 'ArrowDown' || event.key === 'ArrowUp' ||
    event.key === 'Home' || event.key === 'End'
  )) {
    event.preventDefault();
    const items = [...dropdown.querySelectorAll(
      '.dropdown-item:not([hidden]):not(.hidden):not(.d-none)',
    )];
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') items[(index + 1) % items.length]?.focus();
    else if (event.key === 'ArrowUp') items[(index - 1 + items.length) % items.length]?.focus();
    else if (event.key === 'Home') items[0]?.focus();
    else items[items.length - 1]?.focus();
  }
});

document.querySelector('[data-user-dropdown]')?.addEventListener('click', (event) => {
  event.stopPropagation();
  const menu = document.querySelector('[data-user-dropdown-menu]');
  clearUserDropdownCloseTimer();
  setUserDropdownOpen(!menu?.classList.contains('show'));
});

const userMenu = document.querySelector('[data-user-menu]');
const canHoverDropdown = window.matchMedia(
  `(width >= ${NAV_DRAWER_BREAKPOINT}px) and (hover: hover) and (pointer: fine)`,
);
userMenu?.addEventListener('mouseenter', () => {
  if (!canHoverDropdown.matches) return;
  clearUserDropdownCloseTimer();
  setUserDropdownOpen(true);
});
userMenu?.addEventListener('mouseleave', () => {
  if (canHoverDropdown.matches) scheduleUserDropdownClose();
});

document.querySelector('[data-user-dropdown-menu]')?.addEventListener('click', (event) => {
  if (event.target.closest('a[href]')) setUserDropdownOpen(false);
});

document.querySelector('[data-compact-search-toggle]')?.addEventListener('click', (event) => {
  event.stopPropagation();
  const popover = document.querySelector('[data-compact-search-popover]');
  setCompactSearchOpen(popover?.hidden ?? true);
});

document.querySelectorAll('[data-nav-logout]').forEach((button) => {
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      const ok = await showConfirm(t('auth.logoutTitle'), t('auth.logoutConfirm'), {
        type: 'danger',
        confirmText: t('nav.logout'),
      });
      if (ok) logout();
    } catch { /* user stays logged in */ }
  });
});

document.getElementById('hamburger')?.addEventListener('click', () => {
  const drawer = document.getElementById('navDrawer');
  if (drawer?.classList.contains('open')) closeDrawer();
  else openDrawer();
});

document.getElementById('drawerCloseBtn')?.addEventListener('click', closeDrawer);

const navOverlay = document.getElementById('navOverlay');
navOverlay?.addEventListener('click', closeDrawer);
navOverlay?.addEventListener('touchstart', (event) => {
  if (event.target === navOverlay) closeDrawer();
}, { passive: true });

document.getElementById('navDrawer')?.addEventListener('click', (event) => {
  const drawer = document.getElementById('navDrawer');
  if (!drawer?.classList.contains('open') || !event.target.closest('a[href]')) return;
  closeDrawer({ restoreTriggerFocus: false });
});

let previousWidth = window.innerWidth;
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  if (previousWidth < NAV_DRAWER_BREAKPOINT && width >= NAV_DRAWER_BREAKPOINT) {
    closeDrawer({ restoreTriggerFocus: false });
    syncDrawerA11y();
  } else if (previousWidth >= NAV_DRAWER_BREAKPOINT && width < NAV_DRAWER_BREAKPOINT) {
    setUserDropdownOpen(false);
    syncDrawerA11y();
  }
  if (width < NAV_DRAWER_BREAKPOINT || width >= 1200) setCompactSearchOpen(false);
  previousWidth = width;
}, { passive: true });

syncDrawerA11y();
