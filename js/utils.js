let _animObserver = null;

function $(sel, parent = document) {
  return parent.querySelector(sel);
}
function $$(sel, parent = document) {
  return Array.from(parent.querySelectorAll(sel));
}

function showLoading(container, type = "page") {
  const skeletons = {
    page: `
      <div class="skeleton-shimmer" style="padding:40px 0">
        <div class="skeleton skeleton-title" style="width:40%"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>`,
    card: `
      <div class="skeleton-grid skeleton-shimmer">
        <div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:30%"></div><div class="skeleton skeleton-text short"></div></div></div>
        <div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:30%"></div><div class="skeleton skeleton-text short"></div></div></div>
        <div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text" style="width:30%"></div><div class="skeleton skeleton-text short"></div></div></div>
      </div>`,
    detail: `
      <div class="skeleton-detail skeleton-shimmer">
        <div class="skeleton skeleton-image" style="height:380px"></div>
        <div style="padding:24px 0">
          <div class="skeleton skeleton-title" style="width:60%"></div>
          <div class="skeleton skeleton-text" style="width:20%;height:32px"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      </div>`,
    table: `
      <div class="skeleton-shimmer" style="padding:12px 0">
        <div class="skeleton skeleton-row-header"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
      </div>`,
    auth: `
      <div class="auth-page skeleton-shimmer" style="min-height:300px">
        <div class="skeleton" style="width:40%;height:28px;margin:0 auto 24px"></div>
        <div class="skeleton" style="height:44px;margin-bottom:12px;border-radius:8px"></div>
        <div class="skeleton" style="height:44px;margin-bottom:20px;border-radius:8px"></div>
        <div class="skeleton" style="height:44px;width:100%;border-radius:8px"></div>
      </div>`,
    form: `
      <div class="skeleton-form skeleton-shimmer" style="padding:16px 0">
        <div class="skeleton skeleton-text" style="width:30%"></div>
        <div class="skeleton skeleton-input"></div>
        <div class="skeleton skeleton-text" style="width:30%"></div>
        <div class="skeleton skeleton-input"></div>
        <div class="skeleton skeleton-text" style="width:30%"></div>
        <div class="skeleton skeleton-input"></div>
      </div>`,
  };
  container.innerHTML = skeletons[type] || skeletons.page;
}

function showError(container, msg) {
  container.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(msg || t("common.error"))}</div>`;
}

function showErrorWithRetry(container, msg, retryFn) {
  const id = "retry_" + Math.random().toString(36).slice(2, 8);
  container.innerHTML = `
    <div class="empty-state" role="alert">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>${t("common.error")}</h3>
      <p>${escapeHtml(msg || t("common.error"))}</p>
      <button id="${id}" class="btn btn-primary" style="margin-top:16px">${t("common.retry") || "Retry"}</button>
    </div>
  `;
  document.getElementById(id)?.addEventListener("click", retryFn);
}

function renderEmptyState(
  container,
  {
    icon,
    title,
    desc,
    actionText,
    actionHref,
    actionFn,
    actionClass = "btn btn-primary",
  } = {},
) {
  const btnId = "es_btn_" + Math.random().toString(36).slice(2, 8);
  const wrapId = "es_wrap_" + Math.random().toString(36).slice(2, 8);
  const cta = actionHref
    ? `<a href="${actionHref}" class="${actionClass}" style="margin-top:16px">${actionText}</a>`
    : actionFn
      ? `<button id="${btnId}" class="${actionClass}" style="margin-top:16px">${actionText}</button>`
      : "";

  let visual;
  if (!icon) {
    visual = emptyIllustration("products");
  } else if (icon.trim().startsWith("<svg")) {
    visual = icon;
  } else if (icon.match(/^(https?:\/\/|\/|\.\/)/) || icon.includes(".")) {
    visual = `<img src="${icon}" alt="" style="width:120px;max-height:120px;object-fit:contain;margin-bottom:8px">`;
  } else {
    const illMap = {
      "fa-shopping-cart": "cart",
      "fa-box-open": "products",
      "fa-gavel": "auctions",
      "fa-bell": "bell",
      "fa-box": "orders",
      "fa-search": "search",
      "fa-heart": "heart",
      "fa-exclamation-triangle": "search",
    };
    const mappedType = illMap[icon];
    if (mappedType) {
      visual = emptyIllustration(mappedType);
    } else if (icon.startsWith("fa-")) {
      visual = `<i class="fas ${icon}" style="font-size:3.5rem;color:var(--text-muted);margin-bottom:8px;display:block"></i>`;
    } else {
      visual = emptyIllustration(icon);
    }
  }

  container.innerHTML = `
    <div class="empty-state" id="${wrapId}">
      <div class="empty-state-visual" style="margin-bottom:12px">${visual}</div>
      ${title ? `<h3>${title}</h3>` : ""}
      ${desc ? `<p>${desc}</p>` : ""}
      ${cta}
    </div>`;

  const wrap = document.getElementById(wrapId);
  if (wrap) {
    const visualEl = wrap.querySelector(".empty-state-visual");
    wrap.addEventListener("mouseenter", () =>
      visualEl?.classList.add("float-anim"),
    );
    wrap.addEventListener("mouseleave", () =>
      visualEl?.classList.remove("float-anim"),
    );
  }

  if (actionFn)
    document.getElementById(btnId)?.addEventListener("click", actionFn);
}

function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function getLocale() {
  return getCurrentLang() === "ar" ? "ar-EG" : "en-US";
}

function getCurrency() {
  return "EGP";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString(getLocale(), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatPrice(n) {
  try {
    return new Intl.NumberFormat(getLocale(), {
      style: "currency",
      currency: getCurrency(),
    }).format(n || 0);
  } catch {
    return `$${Number(n || 0).toFixed(2)}`;
  }
}

function statusClass(status) {
  const map = {
    0: "available",
    1: "sold",
    2: "draft",
    Available: "available",
    Sold: "sold",
    Draft: "draft",
    Active: "active",
    Finished: "finished",
    Cancelled: "draft",
    Pending: "pending",
    Paid: "paid",
    Shipped: "shipped",
    Delivered: "available",
    Approved: "active",
    Valid: "active",
    Rejected: "draft",
    Winning: "available",
  };
  return `status-${map[status] || "draft"}`;
}

function tStatus(status, prefix = "order") {
  if (status == null) return "";
  const numMap = ["Available", "Sold", "Draft"];
  const label =
    typeof status === "number" ? (numMap[status] ?? status) : status;
  const key = `${prefix}.status${label}`;
  const translated = t(key);
  return translated || label;
}

function renderStars(rating) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.5;
  return (
    "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0))
  );
}

/* ===== Skeleton-to-content morph transition ===== */
function transitionContent(container, realHTML) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = realHTML;
  wrapper.style.cssText = "opacity:0;transition:opacity 0.25s ease";
  container.appendChild(wrapper);
  const skeleton = container.querySelector(
    ".skeleton, .skeleton-grid, .skeleton-detail, .skeleton-form, .skeleton-row, .skeleton-row-header",
  );
  if (skeleton) {
    skeleton.style.transition = "opacity 0.2s ease";
    skeleton.style.opacity = "0";
    setTimeout(() => skeleton.remove(), 220);
  }
  requestAnimationFrame(() => {
    wrapper.style.opacity = "1";
  });
  setTimeout(() => {
    container.innerHTML = realHTML;
  }, 300);
}

/* ===== Progressive image loading (blur-up) ===== */
function progressiveImg(src, alt = "", className = "") {
  if (!src)
    return `<div class="${className}" style="background:var(--body-bg);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:2rem"><i class="fas fa-image"></i></div>`;
  const id = "pi_" + Math.random().toString(36).slice(2, 8);
  return `
    <div class="${className} progressive-wrap" style="position:relative;overflow:hidden;background:var(--body-bg)">
      <div id="${id}-placeholder" style="position:absolute;inset:0;background:var(--border);filter:blur(30px);transform:scale(1.2);opacity:1;transition:opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)"></div>
      <img id="${id}-img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.05);transition:opacity 0.6s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" loading="lazy" data-pi-id="${id}">
    </div>`;
}

function activateProgressiveImages(root = document) {
  root.querySelectorAll('img[data-pi-id]').forEach(img => {
    const id = img.dataset.piId;
    const placeholder = document.getElementById(id + '-placeholder');
    if (!placeholder) return;
    if (img.complete && img.naturalWidth > 0) {
      placeholder.style.opacity = '0';
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
      img.removeAttribute('data-pi-id');
    } else {
      img.addEventListener('load', function onImgLoad() {
        placeholder.style.opacity = '0';
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
        img.removeAttribute('data-pi-id');
        img.removeEventListener('load', onImgLoad);
      });
      img.addEventListener('error', function onImgError() {
        placeholder.style.opacity = '0';
        img.style.opacity = '0.3';
        img.removeAttribute('data-pi-id');
        img.removeEventListener('error', onImgError);
      });
    }
  });
}

/* ===== Scroll-triggered animations ===== */
function observeAnimations(root = document) {
  if (_animObserver) {
    _animObserver.disconnect();
    _animObserver = null;
  }
  const els = (root === document ? document : root).querySelectorAll(
    ".animate-on-scroll:not(.visible)",
  );

  if ("IntersectionObserver" in window) {
    _animObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            entry.target
              .querySelectorAll(".animate-on-scroll:not(.visible)")
              .forEach((child) => child.classList.add("visible"));
            _animObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    els.forEach((el) => _animObserver.observe(el));
  } else {
    els.forEach((el) => el.classList.add("visible"));
  }
}

function disconnectAnimObserver() {
  if (_animObserver) {
    _animObserver.disconnect();
    _animObserver = null;
  }
}

/* ===== Recently viewed ===== */
function trackRecentlyViewed(id, title, image, price, type = "product") {
  let viewed = JSON.parse(localStorage.getItem("sayiad_recent") || "[]");
  viewed = viewed.filter((v) => v.id !== id);
  viewed.unshift({ id, title, image, price, type, time: Date.now() });
  if (viewed.length > 12) viewed = viewed.slice(0, 12);
  localStorage.setItem("sayiad_recent", JSON.stringify(viewed));
}

function renderRecentlyViewed(container) {
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
        </a>
      `,
        )
        .join("")}
    </div>
  `;
  observeAnimations();
}

/* ===== Empty state SVG illustrations ===== */
function emptyIllustration(type) {
  const svgs = {
    cart: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M35 40h50l-5 30H40l-5-30z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><circle cx="45" cy="75" r="4" fill="var(--text-muted)"/><circle cx="65" cy="75" r="4" fill="var(--text-muted)"/><path d="M55 50l-5-8M65 50l5-8" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    products: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M40 45h40v30H40V45z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><path d="M50 55h20M50 62h14" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/><path d="M60 38v-6M60 76v6" stroke="var(--text-muted)" stroke-width="1.5"/></svg>`,
    auctions: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M55 35l25 25-8 8-25-25 8-8z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><path d="M72 52l8 8M50 70l-8 8" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"/><path d="M42 78l5-5" stroke="var(--text-muted)" stroke-width="2"/></svg>`,
    bell: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M60 32c-8 0-14 6-14 14v4c0 5-3 12-7 16l-2 2h46l-2-2c-4-4-7-11-7-16v-4c0-8-6-14-14-14z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><path d="M52 68c0 4 4 8 8 8s8-4 8-8" stroke="var(--text-muted)" stroke-width="2"/></svg>`,
    orders: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M40 38h40l4 8v36H36V46l4-8z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><path d="M48 55h24M48 63h16M48 71h20" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    search: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><circle cx="50" cy="50" r="14" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/><path d="M60 60l12 12" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"/></svg>`,
    heart: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="var(--border)" stroke-width="2" fill="var(--card-bg)"/><path d="M60 40c-4-6-12-8-18-4s-8 12-4 18c3 4 22 22 22 22s19-18 22-22c4-6 2-14-4-18s-14-2-18 4z" stroke="var(--text-muted)" stroke-width="2" fill="var(--body-bg)"/></svg>`,
  };
  return svgs[type] || svgs.products;
}

function openQuickView(product) {
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
        ${image ? `<img src="${image}" alt="${escapeHtml(title)}" style="width:180px;height:180px;object-fit:cover;border-radius:var(--radius-md);flex-shrink:0">` : ""}
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
    </div>
  `;

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
  // Focus first element
  requestAnimationFrame(() => { const f = overlay.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'); if (f) f.focus(); });
}

/* ===== Lightbox ===== */
function openLightbox(images, startIndex = 0) {
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
      <img class="lightbox-img" src="${images[current]}" alt="">
      ${total > 1 ? `<button class="lightbox-nav lightbox-next" aria-label="Next"><i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}"></i></button>` : ""}
      ${total > 1 ? `<div class="lightbox-counter">${current + 1} / ${total}</div>` : ""}
    `;

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
  // Focus the close button on open
  requestAnimationFrame(() => { const b = lb.querySelector(".lightbox-close"); if (b) b.focus(); });
}

/* ===== Form validation helpers ===== */
function showFieldError(el, msg) {
  el.classList.add("error");
  el.closest(".form-group")?.classList.add("has-error");
  let err = el.parentNode.querySelector(".form-error");
  if (!err) {
    err = document.createElement("div");
    err.className = "form-error";
    el.parentNode.appendChild(err);
  }
  err.textContent = msg;
}

function clearFieldError(el) {
  el.classList.remove("error");
  el.closest(".form-group")?.classList.remove("has-error");
  const err = el.parentNode.querySelector(".form-error");
  if (err) err.remove();
}

function clearAllFieldErrors(formEl) {
  formEl
    .querySelectorAll(
      ".form-input.error, .form-select.error, .form-textarea.error",
    )
    .forEach(clearFieldError);
}

/* ===== Password strength meter ===== */
function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) score++;
  const map = {
    0: { cls: "strength-empty", label: "" },
    1: { cls: "strength-weak", label: t("auth.passwordStrength.weak") },
    2: { cls: "strength-fair", label: t("auth.passwordStrength.fair") },
    3: { cls: "strength-good", label: t("auth.passwordStrength.good") },
    4: { cls: "strength-strong", label: t("auth.passwordStrength.strong") },
    5: { cls: "strength-strong", label: t("auth.passwordStrength.strong") },
  };
  return map[score] || map[0];
}

/* ===== Form validation ===== */
function validateForm(formEl, rules) {
  let firstInvalid = null;
  for (const rule of rules) {
    const el = rule.element;
    if (!el) continue;
    if (rule.required && !el.value.trim()) {
      showFieldError(el, rule.messages?.required || t("auth.fieldRequired"));
      if (!firstInvalid) firstInvalid = el;
      continue;
    }
    if (rule.email && el.value.trim()) {
      if (!el.validity.valid) {
        showFieldError(el, rule.messages?.email || t("auth.invalidEmail"));
        if (!firstInvalid) firstInvalid = el;
        continue;
      }
    }
    if (rule.minLength && el.value.trim().length < rule.minLength) {
      showFieldError(
        el,
        rule.messages?.minLength || `${t("auth.passwordMinLength")}`,
      );
      if (!firstInvalid) firstInvalid = el;
      continue;
    }
    if (rule.hasUppercase && el.value.trim()) {
      if (!/[A-Z]/.test(el.value)) {
        showFieldError(
          el,
          rule.messages?.hasUppercase || t("auth.passwordRequiresUppercase"),
        );
        if (!firstInvalid) firstInvalid = el;
        continue;
      }
    }
    if (rule.hasLowercase && el.value.trim()) {
      if (!/[a-z]/.test(el.value)) {
        showFieldError(
          el,
          rule.messages?.hasLowercase || t("auth.passwordRequiresLowercase"),
        );
        if (!firstInvalid) firstInvalid = el;
        continue;
      }
    }
    if (rule.hasDigit && el.value.trim()) {
      if (!/\d/.test(el.value)) {
        showFieldError(
          el,
          rule.messages?.hasDigit || t("auth.passwordRequiresDigit"),
        );
        if (!firstInvalid) firstInvalid = el;
        continue;
      }
    }
    if (rule.hasSpecialChar && el.value.trim()) {
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(el.value)) {
        showFieldError(
          el,
          rule.messages?.specialChar || t("auth.invalidSpecialChar"),
        );
        if (!firstInvalid) firstInvalid = el;
        continue;
      }
    }
    if (rule.phone && el.value.trim()) {
      if (!/^[\d\s+\-()]{7,20}$/.test(el.value.trim())) {
        showFieldError(el, rule.messages?.phone || "Invalid phone number.");
        if (!firstInvalid) firstInvalid = el;
        continue;
      }
    }
    if (rule.matches && el.value !== rule.matches.element.value) {
      showFieldError(
        el,
        rule.messages?.matches || t("auth.passwordsDoNotMatch"),
      );
      if (!firstInvalid) firstInvalid = el;
      continue;
    }
    if (rule.minAge && el.value) {
      const age = calculateAge(el.value);
      if (isNaN(age) || age < rule.minAge) {
        showFieldError(
          el,
          rule.messages?.minAge ||
            t("auth.minAgeRequired").replace("{minAge}", rule.minAge),
        );
        if (!firstInvalid) firstInvalid = el;
      }
    }
  }
  if (firstInvalid) {
    firstInvalid.classList.add("shake");
    setTimeout(() => firstInvalid.classList.remove("shake"), 500);
    firstInvalid.focus();
    return false;
  }
  return true;
}

/* ===== Age calculator ===== */
function calculateAge(birthdate) {
  if (!birthdate) return NaN;
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Triggers a celebratory confetti burst
 */
function triggerConfetti() {
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

/**
 * Debounce helper to limit function execution rate
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds
 */
function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Premium replacement for window.confirm()
 * @param {string} title - Modal title
 * @param {string} message - Detailed message
 * @param {object} options - Configuration (type: 'danger'|'primary', confirmText, cancelText)
 * @returns {Promise<boolean>}
 */
async function showConfirm(title, message, options = {}) {
  const {
    type = "primary",
    confirmText = getCurrentLang() === "ar" ? "تأكيد" : "Confirm",
    cancelText = getCurrentLang() === "ar" ? "إلغاء" : "Cancel",
    icon = type === "danger" ? "fa-exclamation-triangle" : "fa-question-circle"
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
      </div>
    `;

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
        modal.classList.remove("shake");
        void modal.offsetWidth; // Trigger reflow to restart animation
        modal.classList.add("shake");
      }
    });

    document.body.appendChild(overlay);

    // Accessibility: Focus the confirm button by default
    setTimeout(() => {
      const proceedBtn = overlay.querySelector("#confirmProceed");
      proceedBtn?.focus();
    }, 50);

    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close(false);
    });
  });
}

// ============================================================
// SHARED PRODUCT CARD RENDERER
// Canonical location. Used by: home.js, products.js, product-detail.js
// Do NOT redefine this function in any other file.
// ============================================================
function renderProductCards(container, products) {
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
         class="product-card animate-on-scroll stagger-${Math.min(i + 1, 8)}"
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
      </a>
    `;
  }).join('');
  observeAnimations();
}
