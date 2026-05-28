import { t, getCurrentLang } from '../i18n/index.js';
import { formatPrice, renderStars, tStatus, statusClass } from './format.js';
import { escapeHtml, renderEmptyState, observeAnimations, animate } from './dom.js';

export function showToast(msg, type = "info") {
  const existing = document.querySelector(".toast-container");
  const container =
    existing ||
    (() => {
      const c = document.createElement("div");
      c.className = "toast-container";
      const isRtl = document.documentElement.dir === "rtl";
      c.setAttribute("role", "status");
      c.setAttribute("aria-live", "polite");
      c.setAttribute("aria-atomic", "false");
      c.style.cssText = `position:fixed;bottom:20px;${isRtl ? "left" : "right"}:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none`;
      document.body.appendChild(c);
      return c;
    })();

  const toast = document.createElement("div");
  const colors = {
    success: "#059669",
    error: "#e11d48",
    info: "#0ea5e9",
    warning: "#f59e0b",
  };
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    info: "fa-info-circle",
    warning: "fa-exclamation-triangle",
  };

  toast.setAttribute("role", "alert");
  toast.style.cssText = `
    padding: 16px 24px;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    box-shadow: 0 12px 32px -8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
    pointer-events: auto;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
  `;
  toast.style.background = colors[type] || colors.info;
  const iconEl = document.createElement("i");
  iconEl.className = `fas ${icons[type] || icons.info}`;
  iconEl.setAttribute("aria-hidden", "true");
  iconEl.style.cssText = "font-size:1.1rem;flex-shrink:0";
  const textEl = document.createElement("span");
  textEl.textContent = msg;
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.style.cssText = "background:none;border:none;color:inherit;font-size:1.3rem;cursor:pointer;padding:0 0 0 8px;line-height:1;opacity:0.8;flex-shrink:0";
  closeBtn.addEventListener("click", () => closeToast(toast));
  toast.appendChild(iconEl);
  toast.appendChild(textEl);
  toast.appendChild(closeBtn);

  function closeToast(t) {
    t.style.transition = "all 0.2s ease";
    t.style.opacity = "0";
    t.style.transform = "translateX(20px)";
    setTimeout(() => t.remove(), 250);
  }

  while (container.children.length >= 3) {
    const first = container.firstElementChild;
    first.style.transition = "all 0.2s ease";
    first.style.opacity = "0";
    first.style.transform = "translateX(30px)";
    setTimeout(() => first.remove(), 200);
  }
  container.appendChild(toast);
  animate(toast, 'bounceInRight', { duration: '0.4s' });
  const live = document.getElementById("ariaLive");
  if (live) live.textContent = msg;
  setTimeout(() => closeToast(toast), 3500);
}

export function showConfirm(title, message, options = {}) {
  const {
    type = "primary",
    confirmText = getCurrentLang() === "ar" ? "تأكيد" : "Confirm",
    cancelText = getCurrentLang() === "ar" ? "إلغاء" : "Cancel",
    icon = type === "danger" ? "fa-exclamation-triangle" : "fa-question-circle",
  } = options;

  return new Promise((resolve) => {
    const prevFocus = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay show confirm-modal-overlay";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");

    overlay.innerHTML = `
      <div class="modal modal-confirm" onclick="event.stopPropagation()">
        <div class="confirm-icon ${type}">
          <i class="fas ${icon}"></i>
        </div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="confirmCancel">${cancelText}</button>
          <button class="btn btn-${type}" id="confirmProceed">${confirmText}</button>
        </div>
      </div>`;

    const close = (result) => {
      overlay.classList.remove("show");
      setTimeout(() => {
        overlay.remove();
        if (prevFocus) prevFocus.focus();
        resolve(result);
      }, 200);
    };

    overlay.querySelector("#confirmProceed").addEventListener("click", () => close(true));
    overlay.querySelector("#confirmCancel").addEventListener("click", () => close(false));

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        const modal = overlay.querySelector(".modal-confirm");
        animate(modal, 'headShake', { duration: '0.6s' });
      }
    });

    document.body.appendChild(overlay);

    setTimeout(() => {
      const proceedBtn = overlay.querySelector("#confirmProceed");
      proceedBtn?.focus();
    }, 50);

    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close(false);
    });
  });
}

export function triggerConfetti() {
  const colors = [
    "#0ea5e9",
    "#059669",
    "#f59e0b",
    "#e11d48",
    "#7c3aed",
    "#f472b6",
  ];
  const count = 60;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "confetti-particle";
    p.style.left = Math.random() * 100 + "vw";
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = Math.random() * 2 + 3 + "s";
    p.style.opacity = (Math.random() * 0.5 + 0.5).toString();
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 5000);
  }
}

export function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function renderProductCards(container, products) {
  if (!products || !products.length) {
    renderEmptyState(container, {
      icon: 'fa-fish',
      title: t('products.noProducts'),
      desc: t('products.noProductsDesc'),
    });
    return;
  }
  container.innerHTML = products.map((p, i) => {
    const title = p.title || p.productTitle || 'Product';
    const img = p.primaryImageUrl || p.imageUrl || '';
    const statusText = tStatus(p.status, "product");
    return `
      <a href="#/product-detail?id=${p.id}"
         class="product-card card animate-on-scroll stagger-${Math.min(i + 1, 8)}"
         aria-label="${escapeHtml(title)} — ${formatPrice(p.price)}">
        <div class="product-card-img">
          ${img
            ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy">`
            : `<div class="img-placeholder"><i class="fas fa-image"></i></div>`}
          ${p.status != null
            ? `<span class="product-card-badge ${statusClass(p.status)}">${escapeHtml(statusText)}</span>`
            : ''}
          <button class="quick-add-btn" data-quick-add="${p.id}" aria-label="Add to cart" title="Add to cart"><i class="fas fa-cart-plus"></i></button>
        </div>
        <div class="product-card-body">
          <div class="product-card-title">${escapeHtml(title)}</div>
          <div class="product-card-price">${formatPrice(p.price)}</div>
          <div class="product-card-meta">
            ${p.categoryName
              ? `<span class="product-card-category"><i class="fas fa-tag"></i>${escapeHtml(p.categoryName)}</span>`
              : ''}
            ${p.stockQuantity != null
              ? `<span class="product-card-stock">${p.stockQuantity} ${t('products.inStock')}</span>`
              : ''}
          </div>
        </div>
      </a>`;
  }).join('');
  observeAnimations();
}

export function openQuickView(product) {
  const existing = document.querySelector(".modal-overlay.show");
  if (existing) existing.remove();

  const prevFocus = document.activeElement;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay show";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Quick view");

  const title = product.title || product.product?.title || "Product";
  const price = formatPrice(
    product.price || product.currentHighestBid || product.startingPrice,
  );
  const image =
    product.primaryImageUrl || product.product?.primaryImageUrl || "";
  const desc = product.description || product.product?.description || "";
  const id = product.id || product.productId;
  const link =
    product.currentHighestBid != null
      ? `#/auction-detail?id=${id}`
      : `#/product-detail?id=${id}`;

  overlay.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()">
      <div style="display:flex;gap:20px;flex-wrap:wrap">
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" style="width:180px;height:180px;object-fit:cover;border-radius:var(--radius-md);flex-shrink:0">` : ""}
        <div style="flex:1;min-width:200px">
          <h3>${escapeHtml(title)}</h3>
          <div style="font-size:1.4rem;font-weight:700;color:var(--primary);margin:8px 0">${price}</div>
          <p style="color:var(--text-secondary);font-size:0.88rem;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${escapeHtml(desc) || t("product.noDescription")}</p>
          <div class="modal-actions" style="margin-top:20px">
            <a href="${link}" class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-eye"></i> ${t("common.page")}</a>
            <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">${t("common.close") || "Close"}</button>
          </div>
        </div>
      </div>
    </div>`;

  function focusTrap(e) {
    const focusable = overlay.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function closeQuickView() {
    overlay.remove();
    document.removeEventListener("keydown", onQuickViewKey);
    document.removeEventListener("keydown", focusTrap);
    if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
  }
  function onQuickViewKey(e) {
    if (e.key === "Escape") closeQuickView();
  }
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeQuickView();
  });
  document.addEventListener("keydown", onQuickViewKey);
  document.addEventListener("keydown", focusTrap);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { const f = overlay.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'); if (f) f.focus(); });
}

export function openLightbox(images, startIndex = 0) {
  const existing = document.querySelector(".lightbox");
  if (existing) existing.remove();

  const prevFocus = document.activeElement;
  let current = startIndex;
  const lb = document.createElement("div");
  lb.className = "lightbox show";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-label", "Image gallery");

  const render = () => {
    const total = images.length;
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="Close"><i class="fas fa-times"></i></button>
      ${total > 1 ? `<button class="lightbox-nav lightbox-prev" aria-label="Previous"><i class="fas fa-chevron-${getCurrentLang() === "ar" ? "right" : "left"}"></i></button>` : ""}
      <img class="lightbox-img" src="${escapeHtml(images[current])}" alt="">
      ${total > 1 ? `<button class="lightbox-nav lightbox-next" aria-label="Next"><i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}"></i></button>` : ""}
      ${total > 1 ? `<div class="lightbox-counter">${current + 1} / ${total}</div>` : ""}`;

    lb.querySelector(".lightbox-close")?.addEventListener("click", close);
    lb.querySelector(".lightbox-prev")?.addEventListener("click", () => {
      current = (current - 1 + total) % total;
      render();
    });
    lb.querySelector(".lightbox-next")?.addEventListener("click", () => {
      current = (current + 1) % total;
      render();
    });
  };

  function lightboxFocusTrap(e) {
    const focusable = lb.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function close() {
    lb.remove();
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keydown", lightboxFocusTrap);
    if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") {
      current =
        getCurrentLang() === "ar"
          ? (current + 1) % images.length
          : (current - 1 + images.length) % images.length;
      render();
    }
    if (e.key === "ArrowRight") {
      current =
        getCurrentLang() === "ar"
          ? (current - 1 + images.length) % images.length
          : (current + 1) % images.length;
      render();
    }
  }

  render();
  document.body.appendChild(lb);
  document.addEventListener("keydown", onKey);
  document.addEventListener("keydown", lightboxFocusTrap);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  requestAnimationFrame(() => { const b = lb.querySelector(".lightbox-close"); if (b) b.focus(); });
}

export function trackRecentlyViewed(id, title, image, price, type = "product") {
  let viewed = JSON.parse(localStorage.getItem("sayiad_recent") || "[]");
  viewed = viewed.filter((v) => v.id !== id);
  viewed.unshift({ id, title, image, price, type, time: Date.now() });
  if (viewed.length > 12) viewed = viewed.slice(0, 12);
  localStorage.setItem("sayiad_recent", JSON.stringify(viewed));
}

export function renderRecentlyViewed(container) {
  const viewed = JSON.parse(localStorage.getItem("sayiad_recent") || "[]");
  if (!viewed.length) return;
  container.innerHTML = `
    <div class="section-header animate-on-scroll">
      <h2><i class="fas fa-history"></i> ${t("common.recentlyViewed")}</h2>
    </div>
    <div class="recently-viewed-strip">
      ${viewed
        .map(
          (v) => `
        <a href="${v.type === "auction" ? "#/auction-detail?id=" : "#/product-detail?id="}${v.id}" class="recently-viewed-item" title="${escapeHtml(v.title)}">
          ${v.image ? `<img src="${v.image}" alt="${escapeHtml(v.title)}" loading="lazy">` : '<div style="width:60px;height:60px;background:var(--body-bg);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><i class="fas fa-image"></i></div>'}
          <div class="recently-viewed-info">
            <span class="recently-viewed-title">${escapeHtml(v.title)}</span>
            ${v.price != null ? `<span class="recently-viewed-price">${formatPrice(v.price)}</span>` : ""}
            <span class="recently-viewed-type" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted)">
              <i class="fas ${v.type === "auction" ? "fa-gavel" : "fa-tag"}" aria-hidden="true"></i>
              ${v.type === "auction" ? t("nav.auctions") : t("nav.products")}
            </span>
        </a>`,
        )
        .join("")}
    </div>`;
  observeAnimations();
}
