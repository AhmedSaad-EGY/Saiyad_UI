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
