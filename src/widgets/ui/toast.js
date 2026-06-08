import { t } from '../../app/i18n.js';
import { animate } from '../../shared/utils/dom.js';

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
