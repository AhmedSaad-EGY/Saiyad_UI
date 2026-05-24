import { t } from '../i18n/index.js';

let _animObserver = null;

export function $$(sel, parent = document) {
  return Array.from(parent.querySelectorAll(sel));
}

export function showLoading(container, type = "page") {
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

export function showError(container, msg) {
  container.innerHTML = `<div class="alert alert-error" role="alert">${escapeHtml(msg || t("common.error"))}</div>`;
}

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

export function renderEmptyState(
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

export function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

export function progressiveImg(src, alt = "", className = "") {
  if (!src)
    return `<div class="${className}" style="background:var(--body-bg);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:2rem"><i class="fas fa-image"></i></div>`;
  const id = "pi_" + Math.random().toString(36).slice(2, 8);
  return `
    <div class="${className} progressive-wrap" style="position:relative;overflow:hidden;background:var(--body-bg)">
      <div id="${id}-placeholder" style="position:absolute;inset:0;background:var(--border);filter:blur(30px);transform:scale(1.2);opacity:1;transition:opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)"></div>
      <img id="${id}-img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.05);transition:opacity 0.6s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" loading="lazy" data-pi-id="${id}">
    </div>`;
}

export function activateProgressiveImages(root = document) {
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

export function observeAnimations(root = document) {
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
