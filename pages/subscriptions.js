async function renderSubscriptions(container) {
  if (!(await requireAuth())) return;

  const contentId = "subContent";
  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-crown"></i> ${t("subscriptions.title")}</h2></div>
    <div id="${contentId}"><i class="fas fa-spinner spinner"></i> ${t("common.loading")}</div>`;

  const content = document.getElementById(contentId);

  function formatCurrency(amount, currency) {
    const cur = currency || "EGP";
    const locale = getCurrentLang() === "ar" ? "ar-EG" : "en-EG";
    try { return new Intl.NumberFormat(locale, { style: "currency", currency: cur }).format(amount); }
    catch { return Number(amount || 0).toFixed(2) + " " + cur; }
  }

  function createPaymentReference(tier) {
    const id = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `sub-${tier}-${id}`;
  }

  try {
    const [plans, mySubData] = await Promise.all([
      api.get("/subscriptionplans"),
      api.get("/subscriptions/my").catch(() => null),
    ]);

    const mySub = mySubData || null;

    const user = getUser();
    const role = user?.role || "";
    let roleHeading, roleDesc;
    if (role === "Customer") {
      roleHeading = t("subscriptions.customerHeading");
      roleDesc = t("subscriptions.customerDesc");
    } else if (role === "Auctioneer") {
      roleHeading = t("subscriptions.auctioneerHeading");
      roleDesc = t("subscriptions.auctioneerDesc");
    } else {
      roleHeading = t("subscriptions.sellerHeading");
      roleDesc = t("subscriptions.sellerDesc");
    }

    content.innerHTML = `
      <div class="card" style="padding:20px;margin-bottom:24px;background:var(--primary-gradient, linear-gradient(135deg,var(--primary),var(--primary-light)));color:var(--text-inverse);border:none">
        <h3 style="margin:0 0 6px">${roleHeading}</h3>
        <p style="margin:0;opacity:0.85">${roleDesc}</p>
      </div>
      ${mySub ? `<div class="card" style="max-width:400px;margin-bottom:24px;padding:16px;border-left:4px solid var(--primary)">
        <strong>${t("subscriptions.currentPlan")}:</strong> ${escapeHtml(mySub.tier || t("subscriptions.noPlan"))}
        ${mySub.endDate ? `<br><small style="color:var(--text-muted)">${t("common.endsIn")}: ${new Date(mySub.endDate).toLocaleDateString()}</small>` : ''}
      </div>` : ''}
      <div class="grid grid-3" style="align-items:stretch">${(plans || []).map(p => {
        const isCurrent = mySub && (mySub.tier === p.tier || mySub.planName === p.name);
        const features = p.features || [];
        const isPopular = p.sortOrder === 3;
        const iconMap = { "Free": "fa-crown", "Basic": "fa-gem", "Pro": "fa-rocket", "Enterprise": "fa-crown" };
        const icon = iconMap[p.tier] || "fa-crown";
        return `<div class="card" style="display:flex;flex-direction:column;position:relative;padding:24px;${isPopular ? 'border:2px solid var(--primary);' : ''}">
          ${isPopular ? `<span style="position:absolute;top:-10px;right:16px;background:var(--primary);color:var(--text-inverse);padding:2px 12px;border-radius:20px;font-size:0.78rem;font-weight:600">${t("subscriptions.popular")}</span>` : ''}
          <div style="text-align:center;margin-bottom:16px">
            <i class="fas ${icon}" style="font-size:2rem;color:var(--primary);margin-bottom:8px"></i>
            <h3>${escapeHtml(p.name)}</h3>
            <p style="color:var(--text-muted);font-size:0.88rem">${escapeHtml(p.description || "")}</p>
          </div>
          <div style="text-align:center;margin-bottom:16px">
            <span style="font-size:2rem;font-weight:700">${p.price > 0 ? formatCurrency(p.price, p.currency) : t("subscriptions.free")}</span>
            <span style="color:var(--text-muted)">${p.billingCycle === 'Yearly' ? t("subscriptions.perYear") : p.billingCycle === 'Monthly' ? t("subscriptions.perMonth") : ''}</span>
          </div>
          <ul style="list-style:none;padding:0;margin:0 0 16px;flex:1">${features.map(f => `<li style="padding:6px 0;border-bottom:1px solid var(--border)"><i class="fas fa-check" style="color:var(--success);margin-right:8px;width:16px"></i>${escapeHtml(f)}</li>`).join("")}</ul>
          <button class="btn ${isCurrent ? 'btn-ghost' : 'btn-primary'}" data-plan-tier="${p.tier}" ${isCurrent ? 'disabled' : ''}>${isCurrent ? t("subscriptions.current") : t("subscriptions.upgrade")}</button>
        </div>`;
      }).join("")}</div>`;

    content.querySelectorAll("[data-plan-tier]:not([disabled])").forEach(btn => {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t("common.loading")}`;
        try {
          await api.post("/subscriptions/upgrade", {
            tier: btn.dataset.planTier,
            paymentReference: createPaymentReference(btn.dataset.planTier),
          });
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
    content.innerHTML = `<div class="empty-state"><i class="fas fa-crown"></i><h3>${t("subscriptions.loadError")}</h3><p>${escapeHtml(err.message || "")}</p></div>`;
  }
}
