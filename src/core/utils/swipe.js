/**
 * Horizontal swipe gesture utility
 * Detects left/right touch swipes with passive listeners for performance.
 * RTL-aware — "left" and "right" directions are relative to content flow.
 *
 * @param {Object} options
 * @param {Element}   options.el          — Element to watch for touch events
 * @param {Function}  options.onSwipeMove — Called with ({ direction, distance, startX, currentX, target })
 * @param {Function}  options.onSwipeEnd  — Called with ({ direction, distance, target })
 * @param {boolean}   options.edgeOnly    — Only detect swipes starting from edges (default false)
 * @param {number}    options.edgeWidth   — Edge width in px (default 30)
 * @param {number}    options.threshold   — Min px movement to activate (default 10)
 * @returns {{ destroy: Function }}
 */
export function createSwipeGesture({
  el,
  onSwipeMove,
  onSwipeEnd,
  edgeOnly = false,
  edgeWidth = 30,
  threshold = 10,
} = {}) {
  if (!el) return { destroy() {} };

  const isRtl = () => document.dir === "rtl";

  let startX = 0;
  let startY = 0;
  let currentTarget = null;
  let active = false;
  let moved = false;
  let distance = 0;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;

    // Edge swipe: check if starting within edgeWidth of container left edge
    if (edgeOnly) {
      const rect = el.getBoundingClientRect();
      if (touch.clientX - rect.left > edgeWidth) return;
    }

    // Get the deepest element that matches the expected target
    currentTarget = e.target;
    active = true;
    moved = false;
    distance = 0;
  }

  function onTouchMove(e) {
    if (!active || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    // If vertical movement dominates, cancel
    if (!moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > threshold) {
      active = false;
      return;
    }

    if (Math.abs(dx) < threshold) return;
    moved = true;
    distance = dx;

    const dir = isRtl() ? (dx > 0 ? "left" : "right") : (dx > 0 ? "right" : "left");

    if (onSwipeMove) {
      onSwipeMove({ direction: dir, distance: dx, startX, currentX: touch.clientX, target: currentTarget });
    }
  }

  function onTouchEnd() {
    if (!active || !moved) { reset(); return; }
    const dir = isRtl() ? (distance > 0 ? "left" : "right") : (distance > 0 ? "right" : "left");
    if (onSwipeEnd) {
      onSwipeEnd({ direction: dir, distance, target: currentTarget });
    }
    reset();
  }

  function onTouchCancel() { reset(); }

  function reset() {
    startX = 0;
    startY = 0;
    currentTarget = null;
    active = false;
    moved = false;
    distance = 0;
  }

  el.addEventListener("touchstart", onTouchStart, { passive: true });
  el.addEventListener("touchmove", onTouchMove, { passive: true });
  el.addEventListener("touchend", onTouchEnd, { passive: true });
  el.addEventListener("touchcancel", onTouchCancel, { passive: true });

  return {
    destroy() {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
      reset();
    },
  };
}

/**
 * Manages swipe-to-reveal for a list of items.
 * Each item can be swiped left to reveal a delete/action button.
 *
 * @param {Object} options
 * @param {Element}   options.container       — The container element (e.g., table, list)
 * @param {string}    options.itemSelector    — CSS selector for swipeable items
 * @param {Function}  options.getActionEl     — Called with (itemEl) to get/create the action button element
 * @param {Function}  options.onAction        — Called with (itemEl) when action button is tapped
 * @param {number}    options.revealWidth     — Width of the revealed action area in px (default 80)
 * @param {number}    options.autoActivate    — If distance > this px, auto-trigger action (default 150)
 * @param {string}    options.swipeClass      — CSS class for swiping state (default 'is-swiping')
 * @returns {{ destroy: Function }}
 */
export function createSwipeReveal({
  container,
  itemSelector,
  getActionEl,
  onAction,
  revealWidth = 80,
  autoActivate = 150,
  swipeClass = "is-swiping",
} = {}) {
  if (!container) return { destroy() {} };

  const state = new WeakMap();

  function ensureActionEl(row) {
    if (state.has(row)) return state.get(row);
    const actionEl = getActionEl ? getActionEl(row) : null;
    state.set(row, { actionEl, translateX: 0, revealed: false });
    return state.get(row);
  }

  // Find the parent swipeable item from a touch target
  function findRow(target) {
    return target.closest ? target.closest(itemSelector) : null;
  }

  const swipeGesture = createSwipeGesture({
    el: container,
    threshold: 5,
    onSwipeMove({ distance, target }) {
      const row = findRow(target);
      if (!row) return;
      const s = ensureActionEl(row);
      // Only allow left swipe (negative distance in LTR)
      const isRtl = document.dir === "rtl";
      const isLeftSwipe = isRtl ? distance > 0 : distance < 0;
      if (!isLeftSwipe) {
        row.style.transform = "";
        row.classList.remove(swipeClass);
        return;
      }
      const absDist = Math.abs(distance);
      const clamped = Math.min(absDist, revealWidth + 20);
      row.style.transform = `translateX(${isRtl ? "" : "-"}${clamped}px)`;
      row.classList.add(swipeClass);
      s.translateX = clamped;
    },
    onSwipeEnd({ distance, target }) {
      const row = findRow(target);
      if (!row) return;
      row.classList.remove(swipeClass);
      const s = state.get(row);
      if (!s) { row.style.transform = ""; return; }

      const isRtl = document.dir === "rtl";
      const absDist = Math.abs(distance);
      const isLeftSwipe = isRtl ? distance > 0 : distance < 0;

      if (!isLeftSwipe) {
        row.style.transform = "";
        s.revealed = false;
        return;
      }

      if (s.translateX >= autoActivate) {
        // Full swipe — trigger action immediately
        row.style.transform = "";
        s.revealed = false;
        if (onAction) onAction(row);
      } else if (s.translateX >= revealWidth * 0.5) {
        // Snap to reveal
        row.style.transform = `translateX(${isRtl ? "" : "-"}${revealWidth}px)`;
        s.revealed = true;
      } else {
        // Snap back
        row.style.transform = "";
        s.revealed = false;
      }
    },
  });

  // Handle tap on the revealed action button area
  function onTap(e) {
    const row = e.target.closest ? e.target.closest(itemSelector) : null;
    if (!row) return;
    const s = state.get(row);
    if (!s || !s.revealed) return;

    // Check if tap is in the revealed area (right side if LTR, left side if RTL)
    const rect = row.getBoundingClientRect();
    const isRtl = document.dir === "rtl";
    const clickX = e.clientX - rect.left;
    const revealedZone = isRtl ? clickX < revealWidth : rect.width - clickX < revealWidth;

    if (revealedZone) {
      row.style.transform = "";
      s.revealed = false;
      if (onAction) onAction(row);
      e.preventDefault();
    } else {
      // Tap outside revealed zone — snap back
      row.style.transform = "";
      s.revealed = false;
    }
  }

  container.addEventListener("click", onTap);

  return {
    destroy() {
      swipeGesture.destroy();
      container.removeEventListener("click", onTap);
    },
  };
}
