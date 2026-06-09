import { t } from './i18n.js';
import { openDrawer, closeDrawer } from '../widgets/layout/navbar.js';
import { showConfirm } from '../widgets/ui/modal.js';
import { logout } from '../features/auth/login.js';

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
  const ok = await showConfirm(t('auth.logoutTitle'), t('auth.logoutConfirm'), {
    type: 'danger',
    confirmText: t('nav.logout'),
  });
  if (ok) logout();
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
