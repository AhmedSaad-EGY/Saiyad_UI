import { t } from '../../app/i18n.js';

export function openTopUpModal() {
  const overlay = document.getElementById('topUpModalOverlay');
  overlay.classList.add('show');
  document.body.classList.add('modal-open');
  document.getElementById('topUpAmount').focus();

  const modal = document.querySelector("#topUpModalOverlay .modal");
  if (modal) {
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function trapFocus(e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    modal._trapFocus = trapFocus;
    modal.addEventListener("keydown", trapFocus);
  }
  document.body.style.overflow = "hidden";

  function onEsc(e) {
    if (e.key === 'Escape') closeTopUpModal();
  }
  modal._closeEsc = onEsc;
  document.addEventListener('keydown', onEsc);
}

export function closeTopUpModal() {
  const modal = document.querySelector("#topUpModalOverlay .modal");
  if (modal) {
    if (modal._trapFocus) {
      modal.removeEventListener("keydown", modal._trapFocus);
      delete modal._trapFocus;
    }
    if (modal._closeEsc) {
      document.removeEventListener('keydown', modal._closeEsc);
      delete modal._closeEsc;
    }
  }
  document.body.style.overflow = "";
  document.getElementById('topUpModalOverlay').classList.remove('show');
  document.body.classList.remove('modal-open');
  document.getElementById('topUpAmount').value = '';
  const errEl = document.getElementById('topUpAmountError');
  if (errEl) { errEl.classList.add('hidden'); errEl.textContent = ''; }
  const btn = document.getElementById('topUpConfirmBtn');
  if (btn) { btn.disabled = false; btn.innerHTML = t('wallet.confirmTopUp'); }
}
