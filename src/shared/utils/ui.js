import { t } from '../../app/i18n.js';
import { animate } from './dom.js';
import { registerRouteCleanup } from '../../app/events.js';

export function showToast(msg, type = "info") {
  const existing = document.querySelector(".toast-container");
  const container = existing ||
    (() => {
      const c = document.createElement("div");
      c.className = "toast-container";
      const isRtl = document.documentElement.dir === "rtl";
      c.setAttribute("role", "status");
      c.setAttribute("aria-live", "polite");
      c.setAttribute("aria-atomic", "false");
      c.style[isRtl ? "left" : "right"] = "20px";
      document.body.appendChild(c);
      return c;
    })();

  const toast = document.createElement("div");
  const colors = {
    success: "var(--success)",
    error: "var(--danger)",
    info: "var(--info)",
    warning: "var(--warning)",
  };
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    info: "fa-info-circle",
    warning: "fa-exclamation-triangle",
  };

  toast.setAttribute("role", "alert");
  toast.className = "toast-base";
  toast.style.background = colors[type] || colors.info;
  const iconEl = document.createElement("i");
  iconEl.className = `fas ${icons[type] || icons.info}`;
  iconEl.setAttribute("aria-hidden", "true");
  const textEl = document.createElement("span");
  textEl.textContent = msg;
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.setAttribute("aria-label", t('common.close'));
  closeBtn.className = "toast-close-btn";
  closeBtn.addEventListener("click", () => closeToast(toast));
  toast.appendChild(iconEl);
  toast.appendChild(textEl);
  toast.appendChild(closeBtn);

  function closeToast(toastEl) {
    toastEl.style.transition = "all 0.2s ease";
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateX(20px)";
    setTimeout(() => toastEl.remove(), 250);
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

export function triggerConfetti() {
  const colors = [
    "var(--info)", "var(--success)", "var(--warning)",
    "var(--danger)", "var(--accent)", "var(--secondary)",
  ];
  const count = 60;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "confetti-particle";
    p.style.left = `${Math.random() * 100}vw`;
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = `${Math.random() * 2 + 3}s`;
    p.style.opacity = (Math.random() * 0.5 + 0.5).toString();
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 5000);
  }
}

export function showConfirm(title, message, options = {}) {
  const {
    type = "primary",
    confirmText = t('common.confirm'),
    cancelText = t('common.cancel'),
    icon = type === "danger" ? "fa-exclamation-triangle" : "fa-question-circle",
  } = options;

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay show";
    document.body.classList.add("modal-open");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="modal modal-confirm" onclick="event.stopPropagation()">
        <div class="confirm-icon ${type}">
          <i class="fas ${icon}"></i>
        </div>
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="confirmCancel">${cancelText}</button>
          <button class="btn btn-${type}" id="confirmProceed">${confirmText}</button>
        </div>
      </div>`;

    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      document.body.classList.remove("modal-open");
      overlay.remove();
      document.removeEventListener("keydown", onKey);
    }

    function onKey(e) {
      if (e.key === "Escape") { close(); resolve(false); }
    }

    overlay.querySelector("#confirmProceed").addEventListener("click", () => { close(); resolve(true); });
    overlay.querySelector("#confirmCancel").addEventListener("click", () => { close(); resolve(false); });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        const m = overlay.querySelector(".modal-confirm");
        if (m) animate(m, 'headShake', { duration: '0.6s' });
      }
    });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
    animate(overlay, 'fadeIn', { duration: '0.2s' });
    setTimeout(() => {
      const proceedBtn = overlay.querySelector("#confirmProceed");
      if (proceedBtn) proceedBtn.focus();
    }, 50);
  });
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
    const isRtl = document.documentElement.dir === "rtl";
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="${t('common.close')}"><i class="fas fa-times"></i></button>
      ${total > 1 ? `<button class="lightbox-nav lightbox-prev" aria-label="${t('common.previous')}"><i class="fas fa-chevron-${isRtl ? "right" : "left"}"></i></button>` : ""}
      <img class="lightbox-img" src="${images[current]}" alt="">
      ${total > 1 ? `<button class="lightbox-nav lightbox-next" aria-label="${t('common.next')}"><i class="fas fa-chevron-${isRtl ? "left" : "right"}"></i></button>` : ""}
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

  function onKey(e) {
    const isRtl = document.documentElement.dir === "rtl";
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") {
      current = isRtl ? (current + 1) % images.length : (current - 1 + images.length) % images.length;
      render();
    }
    if (e.key === "ArrowRight") {
      current = isRtl ? (current - 1 + images.length) % images.length : (current + 1) % images.length;
      render();
    }
  }

  function close() {
    lb.remove();
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keydown", focusTrap);
    if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
  }

  function focusTrap(e) {
    const focusable = lb.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  render();
  document.body.appendChild(lb);
  animate(lb, 'fadeIn', { duration: '0.2s' });
  const img = lb.querySelector('.lightbox-img');
  if (img) animate(img, 'zoomIn', { duration: '0.3s' });
  document.addEventListener("keydown", onKey);
  document.addEventListener("keydown", focusTrap);
  registerRouteCleanup(() => {
    lb.remove();
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keydown", focusTrap);
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  requestAnimationFrame(() => { const b = lb.querySelector(".lightbox-close"); if (b) b.focus(); });
}

export function getCartItemCount(items) {
  return items.reduce((s, i) => s + (i.quantity || 0), 0);
}

export function syncCartBadgeCount(count) {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}
