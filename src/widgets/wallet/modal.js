import { t } from '../../shared/utils/i18n.js';

let activeModal = null;
let previousFocus = null;

function getModalElements() {
  const overlay = document.getElementById('walletActionModalOverlay');
  return {
    overlay,
    modal: overlay?.querySelector('.wallet-action-modal'),
    title: document.getElementById('walletActionModalTitle'),
    help: document.getElementById('walletActionHelp'),
    input: document.getElementById('walletActionAmount'),
    error: document.getElementById('walletActionAmountError'),
    confirm: document.getElementById('walletActionConfirmBtn'),
  };
}

function modeCopy(mode) {
  return mode === 'withdraw'
    ? {
        title: t('wallet.withdrawTitle'),
        help: t('wallet.withdrawHelp'),
        placeholder: t('wallet.withdrawPlaceholder'),
        confirm: t('wallet.confirmWithdraw'),
      }
    : {
        title: t('wallet.topUpTitle'),
        help: t('wallet.topUpHelp'),
        placeholder: t('wallet.minimumDeposit'),
        confirm: t('wallet.confirmTopUp'),
      };
}

function focusableElements(modal) {
  return [...modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )].filter((element) => !element.disabled && element.offsetParent !== null);
}

function onModalKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeWalletActionModal();
    return;
  }
  if (event.key !== 'Tab' || !activeModal) return;
  const focusable = focusableElements(activeModal);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function openWalletActionModal(mode, trigger = document.activeElement) {
  const elements = getModalElements();
  if (!elements.overlay || !elements.modal || !elements.input) return;
  const copy = modeCopy(mode);
  previousFocus = trigger;
  activeModal = elements.modal;
  elements.overlay.dataset.mode = mode;
  elements.title.textContent = copy.title;
  elements.help.textContent = copy.help;
  elements.input.placeholder = copy.placeholder;
  elements.input.min = mode === 'deposit' ? '10' : '0.01';
  if (mode === 'deposit') elements.input.max = '50000';
  else elements.input.removeAttribute('max');
  elements.confirm.querySelector('span').textContent = copy.confirm;
  elements.error.classList.add('hidden');
  elements.error.textContent = '';
  elements.overlay.classList.add('show');
  document.body.classList.add('modal-open');
  activeModal.addEventListener('keydown', onModalKeydown);
  requestAnimationFrame(() => elements.input.focus());
}

export function closeWalletActionModal() {
  const elements = getModalElements();
  if (activeModal) activeModal.removeEventListener('keydown', onModalKeydown);
  elements.overlay?.classList.remove('show');
  document.body.classList.remove('modal-open');
  if (elements.input) elements.input.value = '';
  if (elements.error) {
    elements.error.classList.add('hidden');
    elements.error.textContent = '';
  }
  setWalletActionPending(false);
  activeModal = null;
  if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus();
  previousFocus = null;
}

export function setWalletActionPending(pending) {
  const { overlay, confirm } = getModalElements();
  if (!confirm) return;
  const mode = overlay?.dataset.mode || 'deposit';
  confirm.disabled = pending;
  confirm.querySelector('span').textContent = pending
    ? t('common.processing')
    : modeCopy(mode).confirm;
}

export function showWalletActionError(message) {
  const { error, input } = getModalElements();
  if (!error) return;
  error.textContent = message;
  error.classList.remove('hidden');
  input?.focus();
}
