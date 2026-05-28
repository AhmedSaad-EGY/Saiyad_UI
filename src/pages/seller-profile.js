import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { getUser, requireAuth, hasAnyRole } from '../core/auth/index.js';
import { SELLER_ROLES } from '../shared/constants/roles.js';
import { showLoading, escapeHtml, observeAnimations } from '../core/utils/dom.js';
import { renderStars } from '../core/utils/format.js';
import { renderProductCards, showToast } from '../core/utils/ui.js';

export default async function renderSellerProfile(container) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const userId = params.get('userId');
  const user = getUser();

  if (userId) {
    showLoading(container);
    try {
      const profile = await api.get(`/seller-profile/${userId}`);
      container.innerHTML = `
        <div class="card" style="max-width:600px;margin:0 auto">
          <div class="card-body">
          <div style="text-align:center;margin-bottom:20px">
            <i class="fas fa-store" style="font-size:3rem;color:var(--primary);margin-bottom:8px"></i>
            <h2>${escapeHtml(profile.storeName)}</h2>
            ${profile.description ? `<p style="color:var(--text-secondary)">${escapeHtml(profile.description)}</p>` : ''}
          </div>
          <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-bottom:16px">
            ${profile.averageRating ? `<span><strong>${t('seller.rating')}:</strong> ${renderStars(profile.averageRating)} (${profile.averageRating.toFixed(1)})</span>` : ''}
            <span><strong>${t('seller.totalSales')}:</strong> ${profile.totalSales || 0}</span>
          </div>
          <div style="border-top:1px solid var(--border);padding-top:16px;color:var(--text-secondary);font-size:0.88rem">
            ${profile.contactEmail ? `<p><i class="fas fa-envelope"></i> ${escapeHtml(profile.contactEmail)}</p>` : ''}
            ${profile.contactPhone ? `<p><i class="fas fa-phone"></i> ${escapeHtml(profile.contactPhone)}</p>` : ''}
            ${profile.location ? `<p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(profile.location)}</p>` : ''}
          </div>
        </div>
        </div>`;

    // Load seller's public product listings
    try {
      const sellerProducts = await api.get("/products", {
        SellerId: userId,
        PageSize: 8,
        Page: 1,
      });
      const items = sellerProducts.items || sellerProducts.data || [];
      if (items.length) {
        const productsSection = document.createElement("div");
        productsSection.style.marginTop = "32px";
        productsSection.innerHTML = `
          <div class="section-header">
            <h3><i class="fas fa-tag"></i> ${t("seller.listings") || "Products"}</h3>
          </div>
          <div class="row row-cols-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4" id="sellerProductGrid"></div>
        `;
        container.appendChild(productsSection);
        renderProductCards(
          document.getElementById("sellerProductGrid"),
          items
        );
        observeAnimations();
      }
    } catch {}
    } catch {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-store"></i><h3>${t('seller.notFound')}</h3></div>`;
    }
    return;
  }

  if (!await requireAuth()) return;
  if (!hasAnyRole(...(SELLER_ROLES))) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-store"></i><h3>${t('seller.noProfile')}</h3></div>`;
    return;
  }

  showLoading(container);

  try {
    const profile = await api.get('/seller-profile/me');
    renderForm(profile);
  } catch {
    renderForm(null);
  }

  function renderForm(profile) {
    const isNew = !profile;
    container.innerHTML = `
      <div class="section-header"><h2><i class="fas fa-store"></i> ${isNew ? t('seller.create') : t('seller.myProfile')}</h2></div>
      <div id="sellerAlert"></div>
      <div class="card" style="max-width:520px">
        <div class="card-body">
        <form id="sellerForm" novalidate>
          <div class="form-group"><label class="form-label">${t('seller.storeName')} *</label><input type="text" class="form-input form-control" id="sStoreName" value="${escapeHtml(profile?.storeName || '')}" required></div>
          <div class="form-group"><label class="form-label">${t('seller.description')}</label><textarea class="form-textarea form-control" id="sDescription">${escapeHtml(profile?.description || '')}</textarea></div>
          <div class="form-group"><label class="form-label">${t('seller.contactEmail')}</label><input type="email" class="form-input form-control" id="sEmail" value="${escapeHtml(profile?.contactEmail || '')}"></div>
          <div class="form-group"><label class="form-label">${t('seller.contactPhone')}</label><input type="tel" class="form-input form-control" id="sPhone" value="${escapeHtml(profile?.contactPhone || '')}"></div>
          <div class="form-group"><label class="form-label">${t('seller.location')}</label><input type="text" class="form-input form-control" id="sLocation" value="${escapeHtml(profile?.location || '')}"></div>
          <button type="submit" class="btn btn-primary" id="sellerSubmit">${t('seller.save')}</button>
        </form>
        </div>
      </div>`;

    document.getElementById('sellerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submit = document.getElementById('sellerSubmit');
      submit.disabled = true;
      submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t('seller.saving')}`;
      const body = {
        storeName: document.getElementById('sStoreName').value.trim(),
        description: document.getElementById('sDescription').value.trim(),
        contactEmail: document.getElementById('sEmail').value.trim(),
        contactPhone: document.getElementById('sPhone').value.trim(),
        location: document.getElementById('sLocation').value.trim(),
      };
      try {
        if (isNew) {
          await api.post('/seller-profile', body);
        } else {
          await api.put('/seller-profile', body);
        }
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
