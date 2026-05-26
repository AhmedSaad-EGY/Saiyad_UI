export const bus = document.createElement('div');

export function on(event, handler) {
  bus.addEventListener(event, handler);
}

export function off(event, handler) {
  bus.removeEventListener(event, handler);
}

export function emit(event, detail) {
  bus.dispatchEvent(new CustomEvent(event, { detail, bubbles: false }));
}

export function once(event, handler) {
  const wrapper = (e) => {
    handler(e);
    bus.removeEventListener(event, wrapper);
  };
  bus.addEventListener(event, wrapper);
}

/**
 * Create a scoped event bus that tracks all handlers for easy cleanup.
 * Call `.cleanup()` on route change to remove all registered listeners.
 *
 * Usage:
 *   import { createScopedBus } from '../core/events/bus.js';
 *   const pageBus = createScopedBus();
 *   pageBus.on('cart-updated', handleCartUpdate);
 *   registerRouteCleanup(() => pageBus.cleanup());
 */
export function createScopedBus() {
  const handlers = new Map();

  return {
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, []);
      handlers.get(event).push(handler);
      bus.addEventListener(event, handler);
    },

    off(event, handler) {
      const arr = handlers.get(event);
      if (arr) {
        const idx = arr.indexOf(handler);
        if (idx !== -1) arr.splice(idx, 1);
        if (arr.length === 0) handlers.delete(event);
      }
      bus.removeEventListener(event, handler);
    },

    cleanup() {
      for (const [event, hs] of handlers) {
        hs.forEach(h => bus.removeEventListener(event, h));
      }
      handlers.clear();
    },
  };
}
