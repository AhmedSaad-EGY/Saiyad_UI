import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { showLoading, renderEmptyState, escapeHtml, observeAnimations } from '../core/utils/dom.js';
import { debounce } from '../core/utils/ui.js';
import { renderAuctionCards } from './home.js';

export default async function renderAuctions(_container, _fullPath, params) {
  _container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-gavel"></i> ${t("auctions.title")}</h2></div>
    <div class="search-bar">
      <input type="text" class="form-input" id="auctionSearch" placeholder="${t("auctions.search")}" />
      <select class="form-select" id="auctionStatus">
        <option value="Active">${t("auctions.active")}</option>
        <option value="">${t("auctions.allStatus")}</option>
        <option value="Finished">${t("auctions.finished")}</option>
        <option value="Cancelled">${t("auctions.cancelled")}</option>
      </select>
    </div>
    <div id="auctionList" class="product-grid"></div>
    <div id="auctionPagination" style="display:flex;justify-content:center;gap:8px;margin-top:24px"></div>
  `;

  let page = parseInt(params.page, 10) || 1;
  const pageSize = 12;

  function syncUrl() {
    const s = document.getElementById("auctionSearch")?.value || "";
    const st = document.getElementById("auctionStatus")?.value || "";
    const qp = new URLSearchParams();
    if (s) qp.set("search", s);
    if (st) qp.set("status", st);
    if (page > 1) qp.set("page", page);
    const qs = qp.toString();
    history.replaceState(null, "", qs ? `#/auctions?${qs}` : "#/auctions");
  }

  async function load() {
    const list = document.getElementById("auctionList");
    showLoading(list, "card");
    const search = document.getElementById("auctionSearch")?.value || "";

    try {
      const status = document.getElementById("auctionStatus")?.value || "";
      const apiParams = { page, pageSize };
      if (search) apiParams.SearchTerm = search;
      if (status) apiParams.status = status;

      const data = await api.get("/auctions", apiParams);
      const items = data.items || data.data || [];
      if (!items.length) {
        renderEmptyState(list, {
          icon: "fa-gavel",
          title: t("home.noAuctions"),
          desc: t("auctions.noAuctionsDesc"),
          actionText: t("common.clearFilters"),
          actionHref: "#/auctions",
        });
      } else {
        renderAuctionCards(list, items);
        observeAnimations();
      }

      const total = data.totalCount || data.total || items.length;
      const pages = Math.ceil(total / pageSize);
      const pagination = document.getElementById("auctionPagination");
      pagination.innerHTML = "";
      for (let i = 1; i <= pages && i <= 10; i++) {
        const btn = document.createElement("button");
        btn.className = `btn btn-sm ${i === page ? "btn-primary" : "btn-ghost"}`;
        btn.textContent = i;
        btn.onclick = () => {
          page = i;
          syncUrl();
          load();
        };
        pagination.appendChild(btn);
      }
    } catch (e) {
      renderEmptyState(list, {
        icon: "fa-exclamation-triangle",
        title: t("auctions.loadError"),
        desc: escapeHtml(e.message),
        actionText: t("common.retry"),
        actionFn: () => load(),
      });
    }
  }

  const searchInput = document.getElementById("auctionSearch");
  const statusSelect = document.getElementById("auctionStatus");
  if (params.search) searchInput.value = params.search;
  if (params.status) statusSelect.value = params.status;

  await load();

  function reloadFromFilters() {
    page = 1;
    syncUrl();
    load();
  }
  searchInput.addEventListener("input", debounce(reloadFromFilters, 400));
  statusSelect.addEventListener("change", reloadFromFilters);
}
