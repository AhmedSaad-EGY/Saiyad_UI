async function renderSubscriptions(container) {
  if (!(await requireAuth())) return;

  const user = getUser();
  const sellerRoles = window.SELLER_ROLES || ['Fisherman', 'BaitSeller', 'Auctioneer'];
  if (!user || !sellerRoles.includes(user.role)) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-crown"></i>
        <h3>${t("subscriptions.sellerOnly") || "Seller Accounts Only"}</h3>
        <p style="color:var(--text-muted)">${t("subscriptions.sellerOnlyDesc") || "Subscription plans are available for sellers. Upgrade your account to access premium features."}</p>
        ${hasAnyRole('Customer') ? `<a href="#/dashboard?tab=profile" class="btn btn-primary" style="margin-top:12px">${t("common.goToDashboard") || "Go to Dashboard"}</a>` : ''}
      </div>`;
    return;
  }

  const contentId = "subContent";
  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-crown"></i> ${t("subscriptions.title")}</h2></div>
    <div id="${contentId}"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;

  const content = document.getElementById(contentId);
  try {
    const [plans, mySub] = await Promise.all([
      api.get("/subscriptions"),
      api.get("/subscriptions/my"),
    ]);
    const currentPlanId = mySub?.planId || null;

    content.innerHTML = `
      ${mySub ? `<div class="card" style="max-width:400px;margin-bottom:24px;padding:16px;border-left:4px solid var(--primary)">
        <strong>${t("subscriptions.currentPlan")}:</strong> ${escapeHtml(mySub.planName || t("subscriptions.noPlan"))}
        ${mySub.endDate ? `<br><small style="color:var(--text-muted)">${t("common.endsIn")}: ${new Date(mySub.endDate).toLocaleDateString()}</small>` : ''}
      </div>` : ''}
      <div class="grid grid-3" style="align-items:stretch">${(plans || []).map(p => {
        const isCurrent = p.id === currentPlanId;
        const features = p.features || [];
        return `<div class="card" style="display:flex;flex-direction:column;position:relative;padding:24px;${p.isPopular ? 'border:2px solid var(--primary);' : ''}">
          ${p.isPopular ? `<span style="position:absolute;top:-10px;right:16px;background:var(--primary);color:var(--text-inverse);padding:2px 12px;border-radius:20px;font-size:0.78rem;font-weight:600">${t("subscriptions.popular")}</span>` : ''}
          <div style="text-align:center;margin-bottom:16px">
            <i class="fas ${p.icon || 'fa-crown'}" style="font-size:2rem;color:var(--primary);margin-bottom:8px"></i>
            <h3>${escapeHtml(p.name)}</h3>
            <p style="color:var(--text-muted);font-size:0.88rem">${escapeHtml(p.description || '')}</p>
          </div>
          <div style="text-align:center;margin-bottom:16px">
            <span style="font-size:2rem;font-weight:700">${p.price != null ? formatPrice(p.price) : t("subscriptions.free")}</span>
            <span style="color:var(--text-muted)">${p.billingCycle === 'Yearly' ? t("subscriptions.perYear") : p.billingCycle === 'Monthly' ? t("subscriptions.perMonth") : ''}</span>
          </div>
          <ul style="list-style:none;padding:0;margin:0 0 16px;flex:1">${features.map(f => `<li style="padding:6px 0;border-bottom:1px solid var(--border)"><i class="fas fa-check" style="color:var(--success);margin-right:8px;width:16px"></i>${escapeHtml(f)}</li>`).join("")}</ul>
          <button class="btn ${isCurrent ? 'btn-ghost' : 'btn-primary'}" data-plan-id="${p.id}" ${isCurrent ? 'disabled' : ''}>${isCurrent ? t("subscriptions.current") : t("subscriptions.upgrade")}</button>
        </div>`;
      }).join("")}</div>`;

    content.querySelectorAll("[data-plan-id]:not([disabled])").forEach(btn => {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("common.loading")}`;
        try {
          await api.post("/subscriptions/upgrade", { planId: btn.dataset.planId });
          showToast(t("subscriptions.upgradeSuccess"), "success");
          renderSubscriptions(container);
        } catch (err) {
          showToast(err.message, "error");
          btn.disabled = false;
          btn.textContent = t("subscriptions.upgrade");
        }
      });
    });
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><i class="fas fa-crown"></i><h3>${t("subscriptions.loadError")}</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}
