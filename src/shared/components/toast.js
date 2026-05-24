import Alpine from 'alpinejs';

Alpine.data('toast', () => ({
  items: [],
  add(message, type = 'info', duration = 4000) {
    const id = Date.now() + Math.random();
    this.items.push({ id, message, type });
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  },
  remove(id) {
    this.items = this.items.filter((i) => i.id !== id);
  },
}));
