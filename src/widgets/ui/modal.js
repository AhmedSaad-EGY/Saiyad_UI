import Alpine from 'alpinejs';
import { t, getCurrentLang } from '../../app/i18n.js';
import { escapeHtml, animate } from '../../shared/utils/dom.js';
import { registerRouteCleanup } from '../../app/events.js';

Alpine.data('modal', ({ title, content, onClose } = {}) => ({
  show: false,
  title: title || '',
  content: content || '',
  open() {
    this.show = true;
    document.body.classList.add("modal-open");
    this.$nextTick(() => this.$refs.closeBtn?.focus());
  },
  close() {
    this.show = false;
    document.body.classList.remove("modal-open");
    onClose?.();
  },
  handleKeydown(e) {
    if (e.key === 'Escape') this.close();
  },
}));

export function createModal(htmlContent, { ariaLabel, onClose, closeOnOverlayClick } = {}) {
  const prevFocus = document.activeElement;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay show";
  document.body.classList.add("modal-open");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  if (ariaLabel) overlay.setAttribute("aria-label", ariaLabel);
  overlay.innerHTML = `<div class="modal" onclick="event.stopPropagation()">${htmlContent}</div>`;

  function close() {
    document.body.classList.remove("modal-open");
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keydown", focusTrap);
    if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
    onClose?.();
  }

  function focusTrap(e) {
    const focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay && closeOnOverlayClick !== false) close();
  });
  document.addEventListener("keydown", onKey);
  document.addEventListener("keydown", focusTrap);
  document.body.appendChild(overlay);

  return { close, overlay };
}

export function showConfirm(title, message, options = {}) {
  const {
    type = "primary",
    confirmText = t('common.confirm'),
    cancelText = t('common.cancel'),
    icon = type === "danger" ? "fa-exclamation-triangle" : "fa-question-circle",
  } = options;

  return new Promise((resolve) => {
    const { close, overlay } = createModal(`
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
      </div>`, { closeOnOverlayClick: false });

    const finish = (result) => {
      close();
      resolve(result);
    };

    overlay.querySelector("#confirmProceed").addEventListener("click", () => finish(true));
    overlay.querySelector("#confirmCancel").addEventListener("click", () => finish(false));

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        const m = overlay.querySelector(".modal-confirm");
        if (m) animate(m, 'headShake', { duration: '0.6s' });
      }
    });

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
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="${t('common.close')}"><i class="fas fa-times"></i></button>
      ${total > 1 ? `<button class="lightbox-nav lightbox-prev" aria-label="${t('common.previous')}"><i class="fas fa-chevron-${getCurrentLang() === "ar" ? "right" : "left"}"></i></button>` : ""}
      <img class="lightbox-img" src="${escapeHtml(images[current])}" alt="">
      ${total > 1 ? `<button class="lightbox-nav lightbox-next" aria-label="${t('common.next')}"><i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}"></i></button>` : ""}
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
      current = getCurrentLang() === "ar" ? (current + 1) % images.length : (current - 1 + images.length) % images.length;
      render();
    }
    if (e.key === "ArrowRight") {
      current = getCurrentLang() === "ar" ? (current - 1 + images.length) % images.length : (current + 1) % images.length;
      render();
    }
  }

  render();
  document.body.appendChild(lb);
  animate(lb, 'fadeIn', { duration: '0.2s' });
  const img = lb.querySelector('.lightbox-img');
  if (img) animate(img, 'zoomIn', { duration: '0.3s' });
  document.addEventListener("keydown", onKey);
  document.addEventListener("keydown", lightboxFocusTrap);
  registerRouteCleanup(() => {
    lb.remove();
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keydown", lightboxFocusTrap);
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  requestAnimationFrame(() => { const b = lb.querySelector(".lightbox-close"); if (b) b.focus(); });
}
