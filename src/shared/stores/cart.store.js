import Alpine from 'alpinejs';

Alpine.store('cart', {
  count: 0,
  setCount(n) {
    this.count = n;
  },
});
