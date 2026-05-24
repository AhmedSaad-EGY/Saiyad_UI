import Alpine from 'alpinejs';

export function registerAlpineComponents() {
  Alpine.data('walletCard', () => ({
    balance: 0,
    available: 0,
    loading: true,
    init() {
      const walletStore = Alpine.store('wallet');
      this.$watch(() => walletStore.balance, (val) => { this.balance = val; });
      this.$watch(() => walletStore.available, (val) => { this.available = val; });
      this.$watch(() => walletStore.loading, (val) => { this.loading = val; });
      walletStore.refresh();
    },
  }));
}
