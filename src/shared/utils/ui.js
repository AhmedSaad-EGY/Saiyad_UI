import { t } from './i18n.js';
import { animate, escapeHtml } from './dom.js';
import { registerRouteCleanup } from './events.js';

export function showToast(msg, type = "info") {
  const existing = document.querySelector(".toast-container");
  const container = existing ||
    (() => {
      const c = document.createElement("div");
      c.className = "toast-container";
      c.setAttribute("role", "status");
      c.setAttribute("aria-live", "polite");
      c.setAttribute("aria-atomic", "false");
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
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeToast(toast);
  });

  toast.appendChild(iconEl);
  toast.appendChild(textEl);
  toast.appendChild(closeBtn);

  // Timer bar
  const timerWrap = document.createElement("div");
  timerWrap.className = "toast-timer";
  const timerBar = document.createElement("div");
  timerBar.className = "toast-timer-bar";
  timerWrap.appendChild(timerBar);
  toast.appendChild(timerWrap);

  let dismissTimer = null;
  let remaining = 3500;
  let startTime = Date.now();
  let paused = false;

  function startTimer() {
    if (dismissTimer) clearTimeout(dismissTimer);
    startTime = Date.now();
    paused = false;
    timerBar.style.animationPlayState = "running";
    dismissTimer = setTimeout(() => closeToast(toast), remaining);
  }

  function pauseTimer() {
    if (paused) return;
    paused = true;
    if (dismissTimer) clearTimeout(dismissTimer);
    remaining -= Date.now() - startTime;
    if (remaining < 0) remaining = 0;
    timerBar.style.animationPlayState = "paused";
  }

  function resumeTimer() {
    if (!paused) return;
    paused = false;
    timerBar.style.animation = "none";
    timerBar.offsetHeight; // force reflow
    timerBar.style.animation = `toast-timer ${remaining}ms linear forwards`;
    startTimer();
  }

  function closeToast(toastEl) {
    if (dismissTimer) clearTimeout(dismissTimer);
    paused = true;
    toastEl.classList.add("toast-exit");
    toastEl.addEventListener("animationend", () => {
      if (toastEl.isConnected) toastEl.remove();
    }, { once: true });
  }

  // Swipe-to-dismiss (touch)
  let touchStartX = 0;
  let touchStartY = 0;
  let swipeDeltaX = 0;
  let isSwiping = false;

  toast.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    swipeDeltaX = 0;
    isSwiping = false;
  }, { passive: true });

  toast.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dy) > Math.abs(dx) * 1.5) {
      // Vertical scroll — not a swipe
      if (isSwiping) {
        toast.style.transform = "";
        toast.style.opacity = "";
        toast.classList.remove("swiping");
        isSwiping = false;
      }
      return;
    }
    if (Math.abs(dx) < 10) return;
    e.preventDefault();
    isSwiping = true;
    toast.classList.add("swiping");
    swipeDeltaX = dx;
    const isRtl = document.documentElement.dir === "rtl";
    const swipeDir = isRtl ? dx < 0 : dx > 0;
    if (!swipeDir) {
      toast.style.transform = `translateX(${dx * 0.3}px)`;
      toast.style.opacity = String(1 - Math.min(Math.abs(dx) / 300, 0.5));
    } else {
      toast.style.transform = `translateX(${dx}px)`;
      toast.style.opacity = String(1 - Math.min(Math.abs(dx) / 250, 1));
    }
  }, { passive: false });

  toast.addEventListener("touchend", () => {
    if (!isSwiping) return;
    toast.classList.remove("swiping");
    const isRtl = document.documentElement.dir === "rtl";
    const swipeDir = isRtl ? swipeDeltaX < 0 : swipeDeltaX > 0;
    if (swipeDir && Math.abs(swipeDeltaX) > 80) {
      closeToast(toast);
    } else {
      toast.style.transform = "";
      toast.style.opacity = "";
    }
    isSwiping = false;
  }, { passive: true });

  // Pause auto-dismiss on hover/touch
  toast.addEventListener("mouseenter", pauseTimer, { passive: true });
  toast.addEventListener("mouseleave", resumeTimer, { passive: true });
  toast.addEventListener("touchstart", pauseTimer, { passive: true });
  toast.addEventListener("touchend", resumeTimer, { passive: true });

  // Limit stacking: max 4
  while (container.children.length >= 4) {
    const first = container.firstElementChild;
    first.classList.add("toast-exit");
    first.addEventListener("animationend", () => {
      if (first.isConnected) first.remove();
    }, { once: true });
  }
  container.appendChild(toast);

  const live = document.getElementById("ariaLive");
  if (live) live.textContent = msg;

  startTimer();
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
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="confirmCancel">${escapeHtml(cancelText)}</button>
          <button class="btn btn-${type}" id="confirmProceed">${escapeHtml(confirmText)}</button>
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

    lb.textContent = "";

    const closeBtn = document.createElement("button");
    closeBtn.className = "lightbox-close";
    closeBtn.setAttribute("aria-label", t("common.close"));
    const closeI = document.createElement("i");
    closeI.className = "fas fa-times";
    closeBtn.appendChild(closeI);
    closeBtn.addEventListener("click", close);
    lb.appendChild(closeBtn);

    if (total > 1) {
      const prev = document.createElement("button");
      prev.className = "lightbox-nav lightbox-prev";
      prev.setAttribute("aria-label", t("common.previous"));
      const prevI = document.createElement("i");
      prevI.className = `fas fa-chevron-${isRtl ? "right" : "left"}`;
      prev.appendChild(prevI);
      prev.addEventListener("click", () => { current = (current - 1 + total) % total; render(); });
      lb.appendChild(prev);

      const next = document.createElement("button");
      next.className = "lightbox-nav lightbox-next";
      next.setAttribute("aria-label", t("common.next"));
      const nextI = document.createElement("i");
      nextI.className = `fas fa-chevron-${isRtl ? "left" : "right"}`;
      next.appendChild(nextI);
      next.addEventListener("click", () => { current = (current + 1) % total; render(); });
      lb.appendChild(next);

      const counter = document.createElement("div");
      counter.className = "lightbox-counter";
      counter.textContent = `${current + 1} / ${total}`;
      lb.appendChild(counter);
    }

    const img = document.createElement("img");
    img.className = "lightbox-img";
    img.src = images[current];
    img.alt = "";
    lb.appendChild(img);
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
  const lightboxImg = lb.querySelector('.lightbox-img');
  if (lightboxImg) animate(lightboxImg, 'zoomIn', { duration: '0.3s' });
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
