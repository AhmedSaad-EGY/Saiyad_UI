import { t } from '../shared/utils/i18n.js';
import { getUser } from '../shared/utils/auth-state.js';
import { requireAuth } from '../features/auth/login.js';
import { canAccessSellerDashboard } from '../shared/utils/capabilities.js';
import { showLoading, observeAnimations } from '../shared/utils/dom.js';
import { showToast } from '../widgets/ui/toast.js';
import { renderProductCards } from '../widgets/cards/product-card.js';
import { setPageMeta } from '../shared/utils/seo.js';
import {
  fetchSellerProfile,
  fetchSellerProducts,
  fetchMySellerProfile,
  saveSellerProfile,
} from '../features/seller-profile/index.js';

import {
  renderPublicProfile,
  renderSellerNotFound,
  renderProductsSection,
  renderProfileForm,
  renderSavingButton,
} from '../widgets/seller-profile/index.js';

function setHTML(el, html) {
  el.innerHTML = html;
}

export default async function renderSellerProfile(container) {
  setPageMeta(t('seller.title'));
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const sellerId = params.get('sellerId');

  if (sellerId) {
    showLoading(container);
    try {
      const profile = await fetchSellerProfile(sellerId);
      setHTML(container, renderPublicProfile(profile));

      try {
        const sellerProducts = await fetchSellerProducts(sellerId);
        const items = sellerProducts.items || sellerProducts.data || [];
        if (items.length) {
          const productsSection = document.createElement("div");
          productsSection.style.marginTop = "32px";
          productsSection.innerHTML = renderProductsSection();
          container.appendChild(productsSection);
          renderProductCards(document.getElementById("sellerProductGrid"), items);
          observeAnimations();
        }
      } catch { /* inner products render failed */ }
    } catch {
      setHTML(container, renderSellerNotFound());
    }
    return;
  }

  const currentUser = getUser();
  const isSeller = canAccessSellerDashboard(currentUser);

  if (!isSeller) {
    window.location.hash = '#/';
    return;
  }

  if (!await requireAuth()) return;
  showLoading(container);

  try {
    const profile = await fetchMySellerProfile();
    renderForm(profile);
  } catch {
    renderForm(null);
  }

  function renderForm(profile) {
    const isNew = !profile;
    container.innerHTML = renderProfileForm(profile);

    document.getElementById('sellerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submit = document.getElementById('sellerSubmit');
      submit.disabled = true;
      submit.innerHTML = renderSavingButton();
      const body = {
        storeName: document.getElementById('sStoreName').value.trim(),
        description: document.getElementById('sDescription').value.trim(),
        contactEmail: document.getElementById('sEmail').value.trim(),
        contactPhone: document.getElementById('sPhone').value.trim(),
        location: document.getElementById('sLocation').value.trim(),
      };
      try {
        await saveSellerProfile(isNew, body);
        showToast(t('seller.saved'), 'success');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        submit.disabled = false;
        submit.textContent = t('seller.save');
      }
    });
  }
}
