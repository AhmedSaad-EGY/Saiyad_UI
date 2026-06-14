import { t } from '../../shared/utils/i18n.js';
import { escapeHtml } from '../../shared/utils/dom.js';
import { formatPrice } from '../../shared/utils/format.js';
import { showToast } from '../../widgets/ui/toast.js';
import { registerRouteCleanup } from '../../shared/utils/events.js';

export function showAuctionModal(productId, productTitle, opts = {}) {
  const { onStartAuction, onFetchUnauctionedProducts } = opts;
  const existing = document.querySelector(".modal-overlay.show");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay show";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Start Auction");

  const prevFocus = document.activeElement;
  const minEnd = new Date(Date.now() + 3600000).toISOString().slice(0, 16);

  const needsProductPicker = !productId;

  overlay.innerHTML = `
    <div class="modal mw-md">
      <h3><i class="fas fa-gavel" aria-hidden="true"></i> ${t("auctions.title")}${productTitle ? ` — ${escapeHtml(productTitle)}` : ""}</h3>
      <div id="auctionModalAlert" role="alert"></div>
      <form id="auctionModalForm" novalidate>
        ${needsProductPicker ? `
        <div class="form-group">
          <label class="form-label">${t("admin.products")} *</label>
          <select class="form-select" id="auctionProductSelect" required>
            <option value="">${t("common.loading")}...</option>
          </select>
        </div>` : ""}
        <div class="form-group">
          <label class="form-label">${t("auction.end")} *</label>
          <input type="datetime-local" class="form-input form-control" id="auctionEndTime" min="${minEnd}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t("auction.startingPrice")} *</label>
          <input type="number" class="form-input form-control" id="auctionStartPrice" min="0.01" step="0.01" required>
        </div>
        <div class="form-group">
          <label class="form-label">${t("auction.reservePrice")}</label>
          <input type="number" class="form-input form-control" id="auctionReservePrice" min="0" step="0.01" value="0">
        </div>
        <div class="form-group">
          <label class="form-label">${t("auction.bidIncrement")} *</label>
          <input type="number" class="form-input form-control" id="auctionMinIncrement" min="0.01" step="0.01" value="1" required>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="auctionModalCancel">${t("common.cancel")}</button>
          <button type="submit" class="btn btn-primary" id="auctionModalSubmit"><i class="fas fa-gavel" aria-hidden="true"></i><i class="fas fa-spinner spinner d-none" id="submitSpinner" aria-hidden="true"></i><span id="submitText">${t("auctions.title")}</span></button>
        </div>
      </form>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.body.appendChild(overlay);

  if (needsProductPicker && onFetchUnauctionedProducts) {
    const select = document.getElementById("auctionProductSelect");
    onFetchUnauctionedProducts().then(items => {
      select.textContent = "";
      const def = document.createElement("option");
      def.value = "";
      def.textContent = `-- ${t("common.select")} --`;
      select.appendChild(def);
      items.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.title} - ${formatPrice(p.price)}`;
        select.appendChild(opt);
      });
    }).catch(() => {
      select.textContent = "";
      const errOpt = document.createElement("option");
      errOpt.value = "";
      errOpt.textContent = t("common.error");
      select.appendChild(errOpt);
    });
  }

  function close() {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
  }
  function onKey(e) { if (e.key === "Escape") close(); }
  document.addEventListener("keydown", onKey);
  registerRouteCleanup(() => { document.removeEventListener("keydown", onKey); if (overlay?.isConnected) overlay.remove(); });

  document.getElementById("auctionModalCancel").addEventListener("click", close);

  document.getElementById("auctionModalForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submit = document.getElementById("auctionModalSubmit");
    const alertDiv = document.getElementById("auctionModalAlert");
    alertDiv.textContent = "";
    submit.disabled = true;
    submit.querySelector(".fa-gavel").style.display = "none";
    document.getElementById("submitSpinner").classList.remove("d-none");
    document.getElementById("submitSpinner").removeAttribute("style");
    document.getElementById("submitText").textContent = t("auction.placingBid");

    try {
      const selectedId = needsProductPicker
        ? parseInt(document.getElementById("auctionProductSelect").value)
        : productId;
      if (!selectedId || isNaN(selectedId)) {
        throw new Error(t("common.required"));
      }
      await onStartAuction({
        productId: selectedId,
        endTime: new Date(document.getElementById("auctionEndTime").value).toISOString(),
        startingPrice: parseFloat(document.getElementById("auctionStartPrice").value),
        reservePrice: parseFloat(document.getElementById("auctionReservePrice").value) || 0,
        bidIncrement: parseFloat(document.getElementById("auctionMinIncrement").value) || 1,
      });
      showToast(`${t("auctions.title")} started!`, "success");
      close();
    } catch (err) {
      alertDiv.className = "alert alert-error";
      alertDiv.textContent = err.message;
    } finally {
      submit.disabled = false;
      submit.querySelector(".fa-gavel").style.display = "";
      document.getElementById("submitSpinner").classList.add("d-none");
      document.getElementById("submitText").textContent = t("auctions.title");
    }
  });
}
