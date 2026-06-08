import { t } from '../../app/i18n.js';

let _animObserver = null;

export function $$(sel, parent = document) {
  return Array.from(parent.querySelectorAll(sel));
}

export function showLoading(container, type = "page") {
  const skeletons = {
    page: `
      <div class="skeleton-shimmer py-5 pt-0 pb-0">
        <div class="skeleton skeleton-title" style="width:40%"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>`,
    card: `
      <div class="skeleton-grid skeleton-shimmer">
        <div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text xshort"></div><div class="skeleton skeleton-text short"></div></div></div>
        <div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text xshort"></div><div class="skeleton skeleton-text short"></div></div></div>
        <div class="skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton-card-body"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text xshort"></div><div class="skeleton skeleton-text short"></div></div></div>
      </div>`,
    detail: `
      <div class="skeleton-detail skeleton-shimmer">
        <div class="skeleton skeleton-image" style="height:380px"></div>
        <div class="py-4 pt-0 pb-0">
          <div class="skeleton skeleton-title" style="width:60%"></div>
          <div class="skeleton skeleton-text" style="width:20%;height:32px"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      </div>`,
    table: `
      <div class="skeleton-shimmer py-2" style="padding-top:0;padding-bottom:0">
        <div class="skeleton skeleton-row-header"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
        <div class="skeleton skeleton-row"></div>
      </div>`,
    auth: `
      <div class="auth-page skeleton-shimmer" style="min-height:300px">
        <div class="skeleton mx-auto mb-4" style="width:40%;height:28px"></div>
        <div class="skeleton mb-3 rounded-3" style="height:44px"></div>
        <div class="skeleton mb-4 rounded-3" style="height:44px"></div>
        <div class="skeleton w-100 rounded-3" style="height:44px"></div>
      </div>`,
    form: `
      <div class="skeleton-form skeleton-shimmer py-3" style="padding-top:0;padding-bottom:0">
        <div class="skeleton skeleton-text xshort"></div>
        <div class="skeleton skeleton-input"></div>
        <div class="skeleton skeleton-text xshort"></div>
        <div class="skeleton skeleton-input"></div>
        <div class="skeleton skeleton-text xshort"></div>
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
  const btnId = `es_btn_${  Math.random().toString(36).slice(2, 8)}`;
  const wrapId = `es_wrap_${  Math.random().toString(36).slice(2, 8)}`;
  const cta = actionHref
    ? `<a href="${actionHref}" class="${actionClass} mt-3">${actionText}</a>`
    : actionFn
      ? `<button id="${btnId}" class="${actionClass} mt-3">${actionText}</button>`
      : "";

  let visual;
  if (!icon) {
    visual = emptyIllustration("products");
  } else if (icon.trim().startsWith("<svg")) {
    visual = icon;
  } else if (icon.match(/^(https?:\/\/|\/|\.\/)/) || icon.includes(".")) {
    visual = `<img src="${icon}" alt="" class="mb-2" style="width:120px;max-height:120px;object-fit:contain">`;
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
      visual = `<i class="fas ${icon} mb-2 d-block text-muted fs-hero"></i>`;
    } else {
      visual = emptyIllustration(icon);
    }
  }

  container.innerHTML = `
    <div class="empty-state" id="${wrapId}">
      <div class="empty-state-visual mb-3">${visual}</div>
      ${title ? `<h3>${title}</h3>` : ""}
      ${desc ? `<p>${desc}</p>` : ""}
      ${cta}
    </div>`;

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
    return `<div class="${className} d-flex align-items-center justify-content-center text-muted" style="background:var(--body-bg);font-size:2rem"><i class="fas fa-image"></i></div>`;
  const id = `pi_${  Math.random().toString(36).slice(2, 8)}`;
  return `
    <div class="${className} progressive-wrap" style="position:relative;overflow:hidden;background:var(--body-bg)">
      <div id="${id}-placeholder" style="position:absolute;inset:0;background:var(--border);filter:blur(30px);transform:scale(1.2);opacity:1;transition:opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)"></div>
      <img id="${id}-img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.05);transition:opacity 0.6s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" loading="lazy" data-pi-id="${id}">
    </div>`;
}

export function activateProgressiveImages(root = document) {
  root.querySelectorAll('img[data-pi-id]').forEach(img => {
    const id = img.dataset.piId;
    const placeholder = document.getElementById(`${id  }-placeholder`);
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

  const selector = ".animate-on-scroll:not(.visible)";
  const els = (root === document ? document : root).querySelectorAll(selector);

  if ("IntersectionObserver" in window) {
    _animObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // Mark visible immediately (removes opacity:0)
            el.classList.add("visible");
            // Animate with Animate.css fadeInUp + stagger delay
            animate(el, "fadeInUp", {
              keep: true,
              ...(getStaggerDelay(el) ? { delay: getStaggerDelay(el) } : {}),
            });
            // Animate any nested animate-on-scroll children
            el
              .querySelectorAll(selector)
              .forEach((child) => {
                child.classList.add("visible");
                animate(child, "fadeInUp", {
                  keep: true,
                  ...(getStaggerDelay(child)
                    ? { delay: getStaggerDelay(child) }
                    : {}),
                });
              });
            _animObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    els.forEach((el) => _animObserver.observe(el));
  } else {
    // Fallback: animate all immediately
    els.forEach((el) => {
      el.classList.add("visible");
      animate(el, "fadeInUp", {
        keep: true,
        ...(getStaggerDelay(el) ? { delay: getStaggerDelay(el) } : {}),
      });
    });
  }
}

/**
 * Parse stagger delay from element className (e.g. stagger-3 → 150ms)
 */
function getStaggerDelay(el) {
  const match = el.className.match(/stagger-(\d+)/);
  if (match) {
    const index = parseInt(match[1], 10);
    return `${index * 50  }ms`;
  }
  return null;
}

export function fadeInContent(el) {
  if (!el) return;
  animate(el, 'fadeIn', { duration: '0.35s' });
}

export function initPullToRefresh({ onRefresh, threshold = 80, indicatorId = 'ptr-indicator' } = {}) {
  if (!('ontouchstart' in window)) return;
  const existing = document.getElementById(indicatorId);
  if (existing) existing.remove();

  const indicator = document.createElement('div');
  indicator.id = indicatorId;
  indicator.className = 'ptr-indicator';
  indicator.innerHTML = '<div class="ptr-spinner"><i class="fas fa-spinner"></i></div><div class="ptr-text">Pull to refresh</div>';
  document.body.prepend(indicator);

  let startY = 0, pulling = false, moved = false;

  function onTouchStart(e) {
    if (window.scrollY > 0) return;
    startY = e.touches[0].clientY;
    pulling = true;
    moved = false;
  }

  function onTouchMove(e) {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0) { indicator.classList.remove('ptr-active', 'ptr-ready'); indicator.style.transform = ''; return; }
    moved = true;
    const pull = Math.min(dy * 0.5, threshold * 1.2);
    indicator.style.transform = `translateY(${pull}px)`;
    indicator.classList.toggle('ptr-ready', dy >= threshold);
    indicator.classList.add('ptr-active');
  }

  async function onTouchEnd() {
    if (!pulling || !moved) { pulling = false; return; }
    const ready = indicator.classList.contains('ptr-ready');
    const _dy = parseFloat(indicator.style.transform?.replace('translateY(', '') || '0');
    indicator.style.transform = ready ? `translateY(${threshold}px)` : '';
    indicator.classList.remove('ptr-active', 'ptr-ready');
    if (ready) {
      indicator.classList.add('ptr-refreshing');
      indicator.querySelector('.ptr-text').textContent = t('common.refreshing');
      try { await onRefresh(); } catch { /* refresh failed, UI already reset */ }
      indicator.classList.remove('ptr-refreshing');
      indicator.querySelector('.ptr-text').textContent = t('common.pullToRefresh');
    }
    indicator.style.transform = '';
    pulling = false;
    moved = false;
  }

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });

  return () => {
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    indicator?.remove();
  };
}

export function initInfiniteScroll({ sentinelId, onLoadMore, threshold = 300, enabled = true } = {}) {
  if (!enabled || typeof IntersectionObserver === 'undefined') return;
  let observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting) {
      try { await onLoadMore(); } catch { /* ignore errors to ensure reconnection */ }
      requestAnimationFrame(() => {
        observer.disconnect();
        const newSentinel = document.getElementById(sentinelId);
        if (newSentinel) {
          observer = new IntersectionObserver(async (e2) => {
            if (e2[0].isIntersecting) await onLoadMore();
          }, { rootMargin: `${threshold}px` });
          observer.observe(newSentinel);
        }
      });
    }
  }, { rootMargin: `${threshold}px` });
  const sentinel = document.getElementById(sentinelId);
  if (sentinel) observer.observe(sentinel);
  const cleanup = () => observer.disconnect();
  return cleanup;
}

export function manageFocus(container, announcement) {
  if (!container) return;
  const focusable = container.querySelector(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable) {
    focusable.focus({ preventScroll: true });
  } else {
    container.setAttribute("tabindex", "-1");
    container.focus({ preventScroll: true });
    container.removeAttribute("tabindex");
  }
  if (announcement) {
    const live = document.getElementById("ariaLive");
    if (live) live.textContent = announcement;
  }
}

/**
 * Animate.css helper — applies an Animate.css animation to an element
 * and automatically removes the classes after the animation ends.
 *
 * @param {Element} el - Target element
 * @param {string} animation - Animation name without prefix (e.g., 'fadeIn', 'bounceIn')
 * @param {object} [opts]
 * @param {string} [opts.duration] - CSS duration value (e.g., '0.5s', '800ms')
 * @param {string} [opts.delay] - CSS delay value (e.g., '0.2s')
 * @param {string|number} [opts.iterations] - Repeat count (e.g., 2, 'infinite')
 * @param {boolean} [opts.keep] - If true, does NOT remove classes after animation ends
 */
/**
 * ALWAYS use safeSetHTML() instead of element.innerHTML = userContent
 * for any content received from the API or typed by a user.
 */
export function safeSetHTML(element, htmlString) {
  if (!element) return;
  if (typeof DOMPurify !== 'undefined') {
    element.innerHTML = DOMPurify.sanitize(htmlString, {
      ALLOWED_TAGS: ['b','i','em','strong','a','br','p','span','ul','ol','li','div','small','h1','h2','h3','h4','h5','h6','section','nav','header','footer','main','aside','figure','figcaption','table','thead','tbody','tfoot','tr','th','td','caption','col','colgroup','form','button','input','label','select','option','textarea','img','video','source','hr','pre','code','blockquote','cite','q','dl','dt','dd','sub','sup','time','mark','ins','del','s','u','abbr'],
      ALLOWED_ATTR: ['href','target','rel','class','id','src','alt','title','width','height','style','data-*','aria-*','role','type','name','value','placeholder','min','max','step','disabled','checked','selected','readonly','for','action','method','enctype','autocomplete','novalidate','colspan','rowspan','scope','headers']
    });
  } else {
    const d = document.createElement('div');
    d.textContent = typeof htmlString === 'string' ? htmlString : '';
    element.textContent = d.textContent;
  }
}

export function animate(el, animation, opts = {}) {
  if (!el) return;
  const prefix = 'animate__';
  el.classList.add(`${prefix  }animated`, prefix + animation);

  if (opts.duration) el.style.setProperty('--animate-duration', opts.duration);
  if (opts.delay) el.style.setProperty('--animate-delay', opts.delay);
  if (opts.iterations != null) el.style.setProperty('--animate-repeat', String(opts.iterations));

  if (!opts.keep) {
    el.addEventListener('animationend', () => {
      el.classList.remove(`${prefix  }animated`, prefix + animation);
      el.style.removeProperty('--animate-duration');
      el.style.removeProperty('--animate-delay');
      el.style.removeProperty('--animate-repeat');
    }, { once: true });
  }
}
