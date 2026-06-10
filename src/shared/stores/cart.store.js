import Alpine from '@alpinejs/csp';

Alpine.store('cart', {
  count: 0,
  setCount(n) {
    this.count = n;
  },
});
