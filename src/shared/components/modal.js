import Alpine from 'alpinejs';

Alpine.data('modal', ({ title, content, onClose } = {}) => ({
  show: false,
  title: title || '',
  content: content || '',
  open() {
    this.show = true;
    document.body.classList.add("modal-open");
    this.$nextTick(() => this.$refs.closeBtn?.focus());
  },
  close() {
    this.show = false;
    document.body.classList.remove("modal-open");
    onClose?.();
  },
  handleKeydown(e) {
    if (e.key === 'Escape') this.close();
  },
}));
