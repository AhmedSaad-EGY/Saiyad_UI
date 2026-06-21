import { t } from '../shared/utils/i18n.js';
import { animate } from '../shared/utils/dom.js';
import { getUser, requireAuth } from '../features/auth/login.js';
import { canManageProducts, canUseCart } from '../shared/utils/capabilities.js';
import { addToCart } from '../features/cart/add.js';
import { openQuickView } from '../widgets/cards/product-card.js';
import { closeDrawer } from '../widgets/layout/navbar.js';
import { showToast } from '../widgets/ui/toast.js';

document.querySelectorAll('[data-nav-search-form]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('[data-nav-search-input]');
    if (!input) return;
    const query = input.value.trim();
    if (!query) {
      input.setAttribute('aria-invalid', 'true');
      animate(input, 'shakeX', { duration: '0.4s' });
      setTimeout(() => input.removeAttribute('aria-invalid'), 600);
      return;
    }
    input.removeAttribute('aria-invalid');
    closeDrawer({ restoreTriggerFocus: false });
    const popover = form.closest('[data-compact-search-popover]');
    if (popover) {
      popover.hidden = true;
      document.querySelector('[data-compact-search-toggle]')?.setAttribute('aria-expanded', 'false');
    }
    const app = document.getElementById('app');
    if (app) app.focus({ preventScroll: true });
    window.location.hash = `#/products?search=${encodeURIComponent(query)}`;
  });
});

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.quick-add-btn');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  try {
    if (!(await requireAuth())) return;
    if (!canUseCart(getUser())) return;
    const productId = parseInt(btn.dataset.quickAdd);
    await addToCart(productId, 1);
    showToast(t('product.addedToCart'), 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

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

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

function initHeroTilt() {
  const hero = document.querySelector('.hero');
  const content = document.querySelector('.hero-content');
  if (!hero || !content) return;

  let tiltTicking = false;
  hero.addEventListener('mousemove', (e) => {
    if (tiltTicking) return;
    tiltTicking = true;
    requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      content.style.transform = `rotateX(${(y - centerY) / 25}deg) rotateY(${(centerX - x) / 25}deg) translateZ(20px)`;
      tiltTicking = false;
    });
  });

  hero.addEventListener('mouseleave', () => {
    content.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0)`;
  });
}

function syncUserRoleAttribute() {
  const user = getUser();
  if (user && user.role) {
    document.documentElement.setAttribute('data-user-role', user.role);
  } else {
    document.documentElement.removeAttribute('data-user-role');
  }
}

initHeroTilt();
syncUserRoleAttribute();

const _sellLink = document.getElementById('footerSellLink');
if (_sellLink && canManageProducts(getUser())) _sellLink.href = '#/dashboard';

const _cy = document.getElementById('copyrightYear');
if (_cy) _cy.textContent = new Date().getFullYear();
