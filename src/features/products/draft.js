import { registerRouteCleanup } from '../../shared/utils/events.js';

export function startDraftAutoSave(saveDraft) {
  const intervalId = setInterval(() => {
    const form = document.getElementById("productFormContainer");
    if (form && !form.classList.contains("d-none") && saveDraft) {
      saveDraft({
        prodTitle: document.getElementById("prodTitle")?.value,
        prodDesc: document.getElementById("prodDesc")?.value,
        prodBrand: document.getElementById("prodBrand")?.value,
        prodPrice: document.getElementById("prodPrice")?.value,
        prodCondition: document.getElementById("prodCondition")?.value,
        prodStock: document.getElementById("prodStock")?.value,
        prodLocation: document.getElementById("prodLocation")?.value,
        prodCategory: document.getElementById("prodCategory")?.value,
      });
    }
  }, 5000);

  registerRouteCleanup(() => {
    clearInterval(intervalId);
  });

  return intervalId;
}
