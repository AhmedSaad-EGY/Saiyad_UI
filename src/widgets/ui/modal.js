import Alpine from '@alpinejs/csp';

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
  overlay.className = "modal-overlay";
  document.body.classList.add("modal-open");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  if (ariaLabel) overlay.setAttribute("aria-label", ariaLabel);
  overlay.innerHTML = `<div class="modal" onclick="event.stopPropagation()">${htmlContent}</div>`;

  function close() {
    overlay.classList.remove("show");
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keydown", focusTrap);
    if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
    onClose?.();
    // Wait for fade-out transition then remove
    overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
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

  // Trigger entrance animation: append first, then add .show
  requestAnimationFrame(() => {
    overlay.classList.add("show");
  });

  return { close, overlay };
}

export { showConfirm, openLightbox } from '../../shared/utils/ui.js';
