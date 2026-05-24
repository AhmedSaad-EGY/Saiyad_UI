import Alpine from 'alpinejs';

Alpine.data('modal', ({ title, content, onClose } = {}) => ({
  show: false,
  title: title || '',
  content: content || '',
  open() {
    this.show = true;
    this.$nextTick(() => this.$refs.closeBtn?.focus());
  },
  close() {
    this.show = false;
    onClose?.();
  },
  handleKeydown(e) {
    if (e.key === 'Escape') this.close();
  },
}));
